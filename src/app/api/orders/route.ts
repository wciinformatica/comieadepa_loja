import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

type PrismaTx = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
import {
  createAsaasCustomer,
  createAsaasPayment,
  findAsaasCustomerByCpf,
  getAsaasPixQrCode,
} from "@/lib/asaas";
import { z } from "zod";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    cpf: z.string().min(11),
    phone: z.string().min(10),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ),
  subtotal: z.number().positive(),
  total: z.number().positive(),
  paymentMethod: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { customer, items, total, paymentMethod } = parsed.data;

    // Verificar estoque
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true },
      });
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Estoque insuficiente para: ${product?.name ?? item.productId}` },
          { status: 409 }
        );
      }
    }

    // Criar ou recuperar cliente no ASAAS
    const cleanCpf = customer.cpf.replace(/\D/g, "");
    let asaasCustomerId: string;

    const existing = await findAsaasCustomerByCpf(cleanCpf);
    if (existing.data.length > 0) {
      asaasCustomerId = existing.data[0].id;
    } else {
      const created = await createAsaasCustomer({
        name: customer.name,
        cpfCnpj: cleanCpf,
        email: customer.email,
        mobilePhone: customer.phone.replace(/\D/g, ""),
      });
      asaasCustomerId = created.id;
    }

    // Criar pedido em transação
    const order = await prisma.$transaction(async (tx: PrismaTx) => {
      const orderNumber = generateOrderNumber();

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: "guest", // pode ser substituído pelo ID do usuário logado
          subtotal: total,
          total,
          status: "PENDING",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.unitPrice * item.quantity,
            })),
          },
        },
      });

      // Decrementar estoque
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // Criar cobrança no ASAAS
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const asaasPayment = await createAsaasPayment({
      customer: asaasCustomerId,
      billingType: paymentMethod,
      value: total,
      dueDate: dueDateStr,
      description: `Pedido ${order.orderNumber} — COMIEADEPA Loja`,
      externalReference: order.id,
    });

    // Salvar pagamento
    const paymentData: Record<string, unknown> = {
      orderId: order.id,
      asaasPaymentId: asaasPayment.id,
      asaasCustomerId,
      method: paymentMethod,
      status: "PENDING",
      amount: total,
      dueDate,
      invoiceUrl: asaasPayment.invoiceUrl,
    };

    if (paymentMethod === "PIX") {
      const qrCode = await getAsaasPixQrCode(asaasPayment.id);
      paymentData.pixCode = qrCode.payload;
      paymentData.pixQrCode = qrCode.encodedImage;
    }

    if (paymentMethod === "BOLETO") {
      paymentData.boletoUrl = asaasPayment.bankSlipUrl;
      paymentData.boletoBarCode = asaasPayment.barCode;
    }

    await prisma.payment.create({ data: paymentData as Parameters<typeof prisma.payment.create>[0]["data"] });

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { message: "Erro interno ao criar pedido" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "userId obrigatório" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: { select: { name: true, slug: true } } } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
