import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const imageUrlSchema = z
  .string()
  .refine(
    (v) => v.startsWith("/") || z.string().url().safeParse(v).success,
    { message: "Informe uma URL válida ou um caminho como /img/banner.png" }
  );

const schema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  imageUrl: imageUrlSchema,
  linkUrl: z.string().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const banner = await prisma.banner.create({ data: parsed.data });
  return NextResponse.json(banner, { status: 201 });
}
