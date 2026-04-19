"use client";

export type BarChartDataPoint = {
  label: string;
  value: number;
  formatted?: string;
};

export function BarChart({
  data,
  color = "#EAB308",
  height = 120,
  formatValue,
}: {
  data: BarChartDataPoint[];
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => {
          const pct = Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0);
          const label = d.formatted ?? (formatValue ? formatValue(d.value) : String(d.value));
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {label}
              </div>
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{ height: `${pct}%`, backgroundColor: color }}
              />
            </div>
          );
        })}
      </div>
      {/* X Labels */}
      <div className="flex gap-1 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-slate-400 truncate">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
