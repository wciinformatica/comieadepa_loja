import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";

interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

const DEPT_GRADIENTS = [
  "linear-gradient(145deg, #0f2040 0%, #1a3a6e 100%)",
  "linear-gradient(145deg, #0d1f3c 0%, #1e3a5f 100%)",
  "linear-gradient(145deg, #1a1040 0%, #2d1f6e 100%)",
  "linear-gradient(145deg, #0a1628 0%, #16306a 100%)",
  "linear-gradient(145deg, #0d2211 0%, #1a4520 100%)",
  "linear-gradient(145deg, #2a0f10 0%, #5a1f22 100%)",
  "linear-gradient(145deg, #1a1428 0%, #332855 100%)",
  "linear-gradient(145deg, #0f1a28 0%, #1e3045 100%)",
];

interface DeptCardProps {
  dept: Department;
  gradient: string;
  featured?: boolean;
}

function DeptCard({ dept, gradient, featured = false }: DeptCardProps) {
  return (
    <Link
      href={`/produtos?departamento=${dept.slug}`}
      className={`group relative flex rounded-2xl overflow-hidden transition-all duration-300
        hover:shadow-[0_24px_64px_rgba(0,0,0,0.28)]
        ${featured ? "h-72 sm:h-[420px]" : "aspect-[4/3]"}`}
    >
      {/* Fundo: imagem ou gradiente */}
      {dept.imageUrl ? (
        <Image
          src={dept.imageUrl}
          alt={dept.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: gradient }} />
      )}

      {/* Overlay gradiente escuro */}
      <div
        className="absolute inset-0 transition-all duration-400
          bg-gradient-to-t from-black/85 via-black/30 to-black/0
          group-hover:from-black/80 group-hover:via-black/25"
      />

      {/* Shimmer dourado no hover */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(200,146,26,0.13) 0%, transparent 55%)",
        }}
      />

      {/* Badge superior */}
      <div className="absolute top-4 left-4">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400/90
            bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-400/20"
        >
          Coleção
        </span>
      </div>

      {/* Linha dourada animada na base */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[2px]
          bg-gradient-to-r from-amber-500 to-amber-300
          translate-y-full group-hover:translate-y-0 transition-transform duration-300"
      />

      {/* Conteúdo inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <h3
          className={`font-bold text-white leading-tight mb-1.5
            ${featured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}
        >
          {dept.name}
        </h3>
        {dept.description && (
          <p className="text-white/65 text-sm mb-3 line-clamp-1 leading-relaxed">
            {dept.description}
          </p>
        )}
        <div
          className="inline-flex items-center gap-1.5
            text-white/60 text-[11px] font-bold uppercase tracking-[0.15em]
            group-hover:text-amber-400 transition-colors duration-200"
        >
          <span>Ver Coleção</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  );
}

export function DepartmentsSection({ departments }: { departments: Department[] }) {
  if (departments.length === 0) return null;

  const [featured, ...rest] = departments;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-[3px] rounded-full bg-amber-500" />
              <span className="text-amber-600 text-[11px] font-bold uppercase tracking-[0.3em]">
                Explore por
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
              Departamentos
            </h2>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed">
              Produtos exclusivos para cada ministério da nossa convenção
            </p>
          </div>
          <Link
            href="/produtos"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold
              text-slate-600 hover:text-amber-600 transition-colors
              pb-0.5 border-b border-slate-300 hover:border-amber-500 shrink-0"
          >
            Ver todos os produtos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Layout: 1 item */}
        {departments.length === 1 && (
          <DeptCard dept={featured} gradient={DEPT_GRADIENTS[0]} featured />
        )}

        {/* Layout: 2 a 4 items — grid simples */}
        {departments.length >= 2 && departments.length <= 4 && (
          <div
            className={`grid gap-4 ${
              departments.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : departments.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {departments.map((dept, i) => (
              <DeptCard
                key={dept.id}
                dept={dept}
                gradient={DEPT_GRADIENTS[i % DEPT_GRADIENTS.length]}
              />
            ))}
          </div>
        )}

        {/* Layout: 5+ items — banner destacado + grid */}
        {departments.length >= 5 && (
          <div className="space-y-4">
            {/* Banner principal */}
            <DeptCard dept={featured} gradient={DEPT_GRADIENTS[0]} featured />
            {/* Grid dos demais */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {rest.map((dept, i) => (
                <DeptCard
                  key={dept.id}
                  dept={dept}
                  gradient={DEPT_GRADIENTS[(i + 1) % DEPT_GRADIENTS.length]}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA mobile */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full
              text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200
              hover:bg-amber-100 transition-colors"
          >
            Ver todos os produtos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
