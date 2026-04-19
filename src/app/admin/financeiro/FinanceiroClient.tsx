"use client";

import { BarChart } from "@/components/admin/BarChart";
import { formatCurrency } from "@/lib/utils";
import { Download } from "lucide-react";

type ChartPoint = { label: string; value: number };
type RecordRow = { date: string; type: string; description: string; amount: number };

export function FinanceiroChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-slate-900 mb-4">Faturamento no Período</h2>
      <BarChart data={data} formatValue={(v) => formatCurrency(v)} height={140} />
    </div>
  );
}

export function CsvExportButton({ records }: { records: RecordRow[] }) {
  function exportCSV() {
    const header = ["Data", "Tipo", "Descrição", "Valor"];
    const rows = records.map((r) => [
      r.date,
      r.type === "SALE" ? "Venda" : r.type === "REFUND" ? "Reembolso" : "Taxa",
      `"${r.description.replace(/"/g, '""')}"`,
      r.amount.toFixed(2).replace(".", ","),
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCSV}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
    >
      <Download className="h-4 w-4" />
      Exportar CSV
    </button>
  );
}
