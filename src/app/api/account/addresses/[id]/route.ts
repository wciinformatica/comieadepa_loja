import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({ isDefault: z.boolean().optional() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const address = await prisma.address.findFirst({ where: { id, userId: session.user.id } });
  if (!address) return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  return NextResponse.json(await prisma.address.update({ where: { id }, data: parsed.data }));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const address = await prisma.address.findFirst({ where: { id, userId: session.user.id } });
  if (!address) return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });

  await prisma.address.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
