// API de gestão de produtos — Admin
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  price: z.number().positive(),
  salePrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string().refine(
      (v) => v.startsWith("/") || z.string().url().safeParse(v).success,
      { message: "Informe uma URL válida ou um caminho como /img/foto.png" }
    ),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const take = 20;
  const skip = (page - 1) * take;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, department: true, images: { take: 1, where: { isPrimary: true } } },
      orderBy: { updatedAt: "desc" },
      take,
      skip,
    }),
    prisma.product.count(),
  ]);

  return NextResponse.json({ products, total, page });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { images, ...productData } = parsed.data;

    // Converter strings vazias em undefined para FKs opcionais
    if (!productData.categoryId) productData.categoryId = undefined;
    if (!productData.departmentId) productData.departmentId = undefined;
    if (!productData.sku) productData.sku = undefined;

    const baseSlug = slugify(productData.name);

    // Garante slug único
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        images: images && images.length > 0
          ? {
              create: images.map((img, i) => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary || i === 0,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/products]", err);
    const message = process.env.NODE_ENV === "development" && err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
