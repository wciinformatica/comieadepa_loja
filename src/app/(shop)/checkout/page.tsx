import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutClient from "./CheckoutClient";
import type { Metadata } from "next";
import type { SessionUser, SavedAddress } from "./CheckoutClient";

export const metadata: Metadata = { title: "Finalizar Pedido — COMIEADEPA" };

export default async function CheckoutPage() {
  const session = await auth();

  let user: SessionUser = null;
  let savedAddresses: SavedAddress[] = [];

  if (session?.user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, cpf: true },
    });

    if (dbUser?.name && dbUser.email) {
      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        cpf: dbUser.cpf,
      };
    }

    savedAddresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
      select: {
        id: true,
        label: true,
        street: true,
        number: true,
        complement: true,
        district: true,
        city: true,
        state: true,
        zipCode: true,
        isDefault: true,
      },
    });
  }

  return <CheckoutClient user={user} savedAddresses={savedAddresses} />;
}