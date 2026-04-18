import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingCart, Package, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Admin" };

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: { toNumber: () => number };
  createdAt: Date;
  payment: { method: string; status: string } | null;
};

async function getDashboardData() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalOrders,
    paidOrders,
    pendingOrders,
    cancelledOrders,
    monthRevenue,
    totalProducts,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "AWAITING_PAYMENT"] } } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { stock: { lte: 5 }, active: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        payment: { select: { method: true, status: true } },
      },
    }),
  ]);

  return {
    totalOrders,
    paidOrders,
    pendingOrders,
    cancelledOrders,
    monthRevenue: monthRevenue._sum.total?.toNumber() ?? 0,
    totalProducts,
    lowStockProducts,
    recentOrders,
  };
}

const statusConfig = {
  PENDING: { label: "Pendente", color: "text-yellow-600 bg-yellow-50", icon: Clock },
  AWAITING_PAYMENT: { label: "Aguardando Pgto", color: "text-orange-600 bg-orange-50", icon: Clock },
  PAID: { label: "Pago", color: "text-green-600 bg-green-50", icon: CheckCircle },
  PROCESSING: { label: "Em Preparo", color: "text-blue-600 bg-blue-50", icon: Clock },
  SHIPPED: { label: "Enviado", color: "text-blue-600 bg-blue-50", icon: TrendingUp },
  DELIVERED: { label: "Entregue", color: "text-green-700 bg-green-100", icon: CheckCircle },
  CANCELLED: { label: "Cancelado", color: "text-red-600 bg-red-50", icon: XCircle },
  REFUNDED: { label: "Reembolsado", color: "text-slate-600 bg-slate-100", icon: XCircle },
} as const;

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    {
      title: "Faturamento do Mês",
      value: formatCurrency(data.monthRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total de Pedidos",
      value: data.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pedidos Pagos",
      value: data.paidOrders.toString(),
      icon: CheckCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Produtos Ativos",
      value: data.totalProducts.toString(),
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral da operação da loja</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas */}
      {(data.pendingOrders > 0 || data.lowStockProducts > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.pendingOrders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800 text-sm">
                  {data.pendingOrders} pedido{data.pendingOrders > 1 ? "s" : ""} pendente{data.pendingOrders > 1 ? "s" : ""}
                </p>
                <a href="/admin/pedidos?status=PENDING" className="text-xs text-yellow-600 hover:underline">
                  Ver pedidos pendentes →
                </a>
              </div>
            </div>
          )}
          {data.lowStockProducts > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
              <Package className="h-5 w-5 text-orange-600 shrink-0" />
              <div>
                <p className="font-semibold text-orange-800 text-sm">
                  {data.lowStockProducts} produto{data.lowStockProducts > 1 ? "s" : ""} com estoque baixo
                </p>
                <a href="/admin/produtos?estoque=baixo" className="text-xs text-orange-600 hover:underline">
                  Ver produtos →
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pedidos recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Nenhum pedido ainda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-3 text-left font-medium">Pedido</th>
                    <th className="pb-3 text-left font-medium">Data</th>
                    <th className="pb-3 text-left font-medium">Total</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">Pgto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.recentOrders as RecentOrder[]).map((order: RecentOrder) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="py-3">
                          <a href={`/admin/pedidos/${order.id}`} className="font-medium text-slate-800 hover:text-yellow-600">
                            {order.orderNumber}
                          </a>
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Intl.DateTimeFormat("pt-BR").format(order.createdAt)}
                        </td>
                        <td className="py-3 font-semibold text-slate-800">
                          {formatCurrency(order.total.toNumber())}
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <status.icon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {order.payment?.method ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 text-center">
            <a href="/admin/pedidos" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
              Ver todos os pedidos →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
