import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PROCESSING: "Processando",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "outline"> = {
  PENDING: "warning",
  PROCESSING: "secondary",
  PAID: "success",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default async function MeusPedidosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true, payment: { select: { method: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
          <Link href="/produtos" className="inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-900">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  <p className="text-sm text-gray-700 mt-1">{order.items.length} item(s)</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold text-gray-900">{formatCurrency(order.total.toNumber())}</p>
                  <Badge variant={STATUS_VARIANTS[order.status] ?? "default"}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/pedido/${order.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver detalhes →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
