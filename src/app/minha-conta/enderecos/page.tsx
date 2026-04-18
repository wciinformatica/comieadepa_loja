import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddressesClient from "./AddressesClient";

export default async function EnderecoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Endereços</h1>
      <AddressesClient addresses={addresses} />
    </div>
  );
}
