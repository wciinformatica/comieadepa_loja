import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().regex(/^\d{11}$/),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { name, email, cpf, phone, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, cpf, phone: phone || null, password: hash, role: "CUSTOMER" },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(user, { status: 201 });
}
