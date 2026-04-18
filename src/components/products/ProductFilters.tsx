"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Department {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  departments: Department[];
  currentParams: Record<string, string | undefined>;
}

const priceRanges = [
  { label: "Até R$ 50", min: "0", max: "50" },
  { label: "R$ 50 – R$ 100", min: "50", max: "100" },
  { label: "R$ 100 – R$ 200", min: "100", max: "200" },
  { label: "Acima de R$ 200", min: "200", max: "" },
];

const sortOptions = [
  { label: "Mais recentes", value: "novo" },
  { label: "Menor preço", value: "preco-asc" },
  { label: "Maior preço", value: "preco-desc" },
  { label: "Nome A-Z", value: "nome" },
];

export function ProductFilters({
  categories,
  departments,
  currentParams,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("pagina"); // reset pagination on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => router.push(pathname);

  return (
    <div className="space-y-6">
      {/* Limpar filtros */}
      {Object.values(currentParams).some(Boolean) && (
        <button
          onClick={clearAll}
          className="text-sm text-yellow-600 font-medium hover:text-yellow-700 flex items-center gap-1"
        >
          Limpar filtros
        </button>
      )}

      {/* Ordenação */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Ordenar por</h3>
        <select
          value={currentParams.ordenar ?? "novo"}
          onChange={(e) => updateParam("ordenar", e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categorias */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">Categoria</h3>
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => updateParam("categoria", null)}
                className={`text-sm w-full text-left px-2 py-1 rounded hover:text-yellow-600 transition-colors ${
                  !currentParams.categoria ? "text-yellow-600 font-semibold" : "text-slate-600"
                }`}
              >
                Todas
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => updateParam("categoria", cat.slug)}
                  className={`text-sm w-full text-left px-2 py-1 rounded hover:text-yellow-600 transition-colors ${
                    currentParams.categoria === cat.slug
                      ? "text-yellow-600 font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Departamentos */}
      {departments.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">Departamento</h3>
          <ul className="space-y-1.5">
            {departments.map((dept) => (
              <li key={dept.id}>
                <button
                  onClick={() => updateParam("departamento", dept.slug)}
                  className={`text-sm w-full text-left px-2 py-1 rounded hover:text-yellow-600 transition-colors ${
                    currentParams.departamento === dept.slug
                      ? "text-yellow-600 font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  {dept.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Faixa de preço */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Faixa de Preço</h3>
        <ul className="space-y-1.5">
          {priceRanges.map((range) => {
            const active =
              currentParams.precoMin === range.min &&
              currentParams.precoMax === range.max;
            return (
              <li key={range.label}>
                <button
                  onClick={() => {
                    if (active) {
                      updateParam("precoMin", null);
                      updateParam("precoMax", null);
                    } else {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("precoMin", range.min);
                      if (range.max) params.set("precoMax", range.max);
                      else params.delete("precoMax");
                      params.delete("pagina");
                      router.push(`${pathname}?${params.toString()}`);
                    }
                  }}
                  className={`text-sm w-full text-left px-2 py-1 rounded hover:text-yellow-600 transition-colors ${
                    active ? "text-yellow-600 font-semibold" : "text-slate-600"
                  }`}
                >
                  {range.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Disponibilidade */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Disponibilidade</h3>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-300 accent-yellow-500"
            checked={currentParams.promocao === "true"}
            onChange={(e) => updateParam("promocao", e.target.checked ? "true" : null)}
          />
          Somente em promoção
        </label>
      </div>
    </div>
  );
}
