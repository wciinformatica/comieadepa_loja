import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const PAGE_SIZE = 20;

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: { toNumber: () => number };
  createdAt: Date;
  user: { name: string | null; email: string } | null;
  _count: { items: number };
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

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status ?? "";
  const search = params.search ?? "";

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" as const } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500">{total} pedido(s) encontrado(s)</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <form className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar por número, cliente..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              (orders as AdminOrder[]).map((order: AdminOrder) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                    <div className="text-xs text-gray-500">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order._count.items} item(s)</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total.toNumber())}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_VARIANTS[order.status] ?? "default"}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}&status=${status}&search=${search}`}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
