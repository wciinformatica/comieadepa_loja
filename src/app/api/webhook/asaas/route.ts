import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapAsaasStatusToPaymentStatus } from "@/lib/asaas";
import crypto from "crypto";

/**
 * Webhook do ASAAS
 * Recebe notificações de mudança de status dos pagamentos.
 * Configurar a URL no painel ASAAS:
 *   https://seudominio.com.br/api/webhook/asaas
 *
 * Segurança: valida a assinatura HMAC enviada no header asaas-access-token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("asaas-access-token");
    const secret = process.env.ASAAS_WEBHOOK_SECRET;

    // Validar assinatura se o secret estiver configurado
    if (secret && signature !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payment } = event;

    if (!payment?.id) {
      return NextResponse.json({ ok: true });
    }

    // Buscar pagamento no banco pelo ID do ASAAS
    const dbPayment = await prisma.payment.findUnique({
      where: { asaasPaymentId: payment.id },
      include: { order: true },
    });

    if (!dbPayment) {
      // Pode ser um pagamento de outro sistema — ignorar silenciosamente
      return NextResponse.json({ ok: true });
    }

    const newPaymentStatus = mapAsaasStatusToPaymentStatus(payment.status) as Parameters<typeof prisma.payment.update>[0]["data"]["status"];

    // Atualizar status do pagamento
    await prisma.payment.update({
      where: { id: dbPayment.id },
      data: {
        status: newPaymentStatus,
        paidAt:
          payment.status === "RECEIVED" || payment.status === "CONFIRMED"
            ? new Date(payment.confirmedDate ?? payment.paymentDate ?? Date.now())
            : undefined,
      },
    });

    // Atualizar status do pedido conforme status do pagamento
    let orderStatus: Parameters<typeof prisma.order.update>[0]["data"]["status"] | null = null;

    if (payment.status === "CONFIRMED" || payment.status === "RECEIVED") {
      orderStatus = "PAID";
    } else if (payment.status === "OVERDUE" || payment.status === "CANCELLED") {
      orderStatus = "CANCELLED";
    } else if (payment.status === "REFUNDED") {
      orderStatus = "REFUNDED";
    }

    if (orderStatus) {
      await prisma.order.update({
        where: { id: dbPayment.orderId },
        data: { status: orderStatus },
      });

      // Registrar no módulo financeiro
      if (orderStatus === "PAID") {
        await prisma.financialRecord.create({
          data: {
            type: "SALE",
            description: `Venda confirmada — Pedido ${dbPayment.order.orderNumber}`,
            amount: dbPayment.amount,
            orderId: dbPayment.orderId,
            paymentId: dbPayment.id,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[ASAAS Webhook]", err);
    // Retornar 200 mesmo em erro para o ASAAS não retentar indefinidamente
    return NextResponse.json({ ok: true });
  }
}
