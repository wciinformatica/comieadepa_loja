import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const { email } = parsed.data;

  // Responder sempre com sucesso para não revelar se o e-mail existe
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Invalidar tokens anteriores
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/redefinir-senha?token=${token}`;

  // Em produção: enviar e-mail aqui (nodemailer / Resend / SendGrid)
  // Em dev: logar no console para facilitar testes
  console.log(`[RESET PASSWORD] ${user.email} → ${resetUrl}`);

  // Se houver um serviço de e-mail configurado, usar aqui:
  // await sendResetEmail({ to: user.email, name: user.name, resetUrl });

  return NextResponse.json({ ok: true });
}
