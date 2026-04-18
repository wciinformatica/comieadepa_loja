import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import AdminOrderActions from "./AdminOrderActions";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: { toNumber: () => number };
  total: { toNumber: () => number };
  product: { name: string; slug: string };
  variant: { name: string; value: string } | null;
};

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

export default async function AdminPedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      items: { include: { product: { select: { name: true, slug: true } }, variant: { select: { name: true, value: true } } } },
      payment: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/pedidos" className="text-sm text-blue-600 hover:text-blue-800">
          ← Voltar aos pedidos
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status] ?? "default"} className="text-sm px-3 py-1">
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados do cliente */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Cliente</h2>
          <p className="text-sm font-medium text-gray-800">{order.user.name}</p>
          <p className="text-sm text-gray-500">{order.user.email}</p>
          {order.user.phone && <p className="text-sm text-gray-500">{order.user.phone}</p>}
          {order.user.cpf && <p className="text-sm text-gray-500">CPF: {order.user.cpf}</p>}
        </div>

        {/* Endereço */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Endereço de Entrega</h2>
          {order.address ? (
            <>
              <p className="text-sm text-gray-700">{order.address.street}, {order.address.number} {order.address.complement && `- ${order.address.complement}`}</p>
              <p className="text-sm text-gray-700">{order.address.district}</p>
              <p className="text-sm text-gray-700">{order.address.city} - {order.address.state}</p>
              <p className="text-sm text-gray-700">CEP: {order.address.zipCode}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Endereço não informado</p>
          )}
        </div>
      </div>

      {/* Itens */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Itens do Pedido</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variante</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(order.items as OrderItem[]).map((item: OrderItem) => (
              <tr key={item.id}>
                <td className="px-5 py-3 text-sm text-gray-900">{item.product.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{item.variant ? `${item.variant.name}: ${item.variant.value}` : "—"}</td>
                <td className="px-5 py-3 text-sm text-gray-700 text-right">{item.quantity}</td>
                <td className="px-5 py-3 text-sm text-gray-700 text-right">{formatCurrency(item.unitPrice.toNumber())}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(item.total.toNumber())}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">Total</td>
              <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(order.total.toNumber())}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagamento */}
      {order.payment && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Pagamento</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Método:</span> <span className="font-medium">{order.payment.method}</span></div>
            <div><span className="text-gray-500">Status:</span> <span className="font-medium">{order.payment.status}</span></div>
            {order.payment.asaasPaymentId && (
              <div className="col-span-2"><span className="text-gray-500">ASAAS ID:</span> <span className="font-mono text-xs">{order.payment.asaasPaymentId}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Ações */}
      <AdminOrderActions orderId={order.id} currentStatus={order.status} />
    </div>
  );
}
