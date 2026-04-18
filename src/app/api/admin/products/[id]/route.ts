import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

type PrismaTx = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  value: z.string(),
  priceModifier: z.number().optional().nullable(),
  stock: z.number().int().min(0),
});

const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("URL inválida"),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
});

const schema = z.object({
  name: z.string().min(3).optional(),
  sku: z.string().optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  salePrice: z.number().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  categoryId: z.string().optional(),
  departmentId: z.string().optional().nullable(),
  variants: z.array(variantSchema).optional(),
  images: z.array(imageSchema).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { variants, images, name, ...rest } = parsed.data;

  // Gera novo slug se o nome mudou
  const slugData = name ? { slug: slugify(name) } : {};

  const product = await prisma.$transaction(async (tx: PrismaTx) => {
    // Atualizar produto
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...rest, ...(name ? { name } : {}), ...slugData };
    const updated = await tx.product.update({
      where: { id },
      data: updateData,
    });

    // Sincronizar variantes
    if (variants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({ ...v, id: undefined, productId: id })),
        });
      }
    }

    // Sincronizar imagens
    if (images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, idx) => ({
            ...img,
            id: undefined,
            productId: id,
            sortOrder: img.sortOrder ?? idx,
          })),
        });
      }
    }

    return updated;
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { active: false } });
  return new NextResponse(null, { status: 204 });
}
