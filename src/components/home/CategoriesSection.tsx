import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-14 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-yellow-600 font-semibold text-sm uppercase tracking-wider mb-1">
            Navegue por
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Categorias</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/produtos?categoria=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white border hover:border-yellow-400 hover:shadow-md transition-all"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-yellow-50 group-hover:to-yellow-100 transition-colors flex items-center justify-center overflow-hidden">
                {cat.imageUrl ? (
                  <Image src={cat.imageUrl} alt={cat.name} width={64} height={64} className="object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-400 group-hover:text-yellow-600 transition-colors">
                    {cat.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-yellow-700 text-center transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
