import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Financeiro — Admin" };

async function getFinancialData(params: {
  periodo?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date();

  if (params.dataInicio && params.dataFim) {
    startDate = new Date(params.dataInicio);
    endDate = new Date(params.dataFim);
    endDate.setHours(23, 59, 59, 999);
  } else {
    switch (params.periodo ?? "mes") {
      case "semana":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "mes":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "trimestre":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "ano":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  const dateFilter = { gte: startDate, lte: endDate };

  const [
    totalFaturado,
    totalPendente,
    totalCancelado,
    ordersByStatus,
    recordsByType,
    recentRecords,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "PAID", createdAt: dateFilter },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { in: ["PENDING", "AWAITING_PAYMENT"] }, createdAt: dateFilter },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: "CANCELLED", createdAt: dateFilter },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: dateFilter },
      _count: true,
      _sum: { total: true },
    }),
    prisma.financialRecord.groupBy({
      by: ["type"],
      where: { date: dateFilter },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financialRecord.findMany({
      where: { date: dateFilter },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  return {
    totalFaturado: totalFaturado._sum.total?.toNumber() ?? 0,
    totalFaturadoCount: totalFaturado._count,
    totalPendente: totalPendente._sum.total?.toNumber() ?? 0,
    totalPendenteCount: totalPendente._count,
    totalCancelado: totalCancelado._sum.total?.toNumber() ?? 0,
    totalCanceladoCount: totalCancelado._count,
    recentRecords,
    startDate,
    endDate,
  };
}

export default async function AdminFinancialPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; dataInicio?: string; dataFim?: string }>;
}) {
  const params = await searchParams;
  const data = await getFinancialData(params);
  const periodo = params.periodo ?? "mes";

  const periodos = [
    { label: "Esta semana", value: "semana" },
    { label: "Este mês", value: "mes" },
    { label: "Último trimestre", value: "trimestre" },
    { label: "Este ano", value: "ano" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Controle Financeiro</h1>
        <p className="text-slate-500 text-sm">
          {formatDate(data.startDate)} — {formatDate(data.endDate)}
        </p>
      </div>

      {/* Filtro de período */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-2">
        {periodos.map((p) => (
          <Link
            key={p.value}
            href={`/admin/financeiro?periodo=${p.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              periodo === p.value
                ? "bg-yellow-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-slate-500 mb-1">Faturamento Confirmado</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalFaturado)}</p>
          <p className="text-xs text-slate-400 mt-1">{data.totalFaturadoCount} pedido(s) pago(s)</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-slate-500 mb-1">Aguardando Pagamento</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(data.totalPendente)}</p>
          <p className="text-xs text-slate-400 mt-1">{data.totalPendenteCount} pedido(s) pendente(s)</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-slate-500 mb-1">Cancelamentos</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(data.totalCancelado)}</p>
          <p className="text-xs text-slate-400 mt-1">{data.totalCanceladoCount} pedido(s) cancelado(s)</p>
        </div>
      </div>

      {/* Registros financeiros */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Registros do Período</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Data</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Descrição</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    Nenhum registro no período
                  </td>
                </tr>
              ) : (
                data.recentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatDate(record.date)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          record.type === "SALE"
                            ? "success"
                            : record.type === "REFUND"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {record.type === "SALE"
                          ? "Venda"
                          : record.type === "REFUND"
                          ? "Reembolso"
                          : "Taxa"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{record.description}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span
                        className={
                          record.type === "SALE" ? "text-green-600" : "text-red-500"
                        }
                      >
                        {record.type === "SALE" ? "+" : "-"}
                        {formatCurrency(record.amount.toNumber())}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
