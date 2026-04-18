import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

const departmentColors = [
  "from-blue-600 to-blue-800",
  "from-purple-600 to-purple-800",
  "from-green-600 to-green-800",
  "from-orange-600 to-orange-800",
];

export function DepartmentsSection({ departments }: { departments: Department[] }) {
  if (departments.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-yellow-600 font-semibold text-sm uppercase tracking-wider mb-1">
              Explore por
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Departamentos</h2>
          </div>
          <Link
            href="/departamentos"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-yellow-600 transition-colors"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept, i) => (
            <Link
              key={dept.id}
              href={`/produtos?departamento=${dept.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] flex items-end"
            >
              {/* Fundo */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${departmentColors[i % departmentColors.length]} opacity-90 group-hover:opacity-100 transition-opacity`}
              />
              {dept.imageUrl && (
                <Image
                  src={dept.imageUrl}
                  alt={dept.name}
                  fill
                  className="object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                />
              )}

              {/* Conteúdo */}
              <div className="relative p-5 text-white">
                <h3 className="text-lg font-bold mb-1">{dept.name}</h3>
                {dept.description && (
                  <p className="text-sm text-white/80 mb-3 line-clamp-2">{dept.description}</p>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full">
                  Ver produtos
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
