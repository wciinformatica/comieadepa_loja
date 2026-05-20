import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shirt, BookOpen, Tag, Package, Layers, ShoppingBag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

function getCategoryIcon(slug: string, name: string) {
  const s = (slug + " " + name).toLowerCase();
  if (/fard|uniform/.test(s)) return Shirt;
  if (/camis/.test(s)) return Layers;
  if (/material|institucional|publicac/.test(s)) return BookOpen;
  if (/acess/.test(s)) return Tag;
  if (/bolsa|mochila/.test(s)) return ShoppingBag;
  return Package;
}

const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  fardamentos: "Uniformes e fardamentos oficiais da convenção",
  camisetas: "Camisetas personalizadas e exclusivas",
  "materiais-institucionais": "Materiais e publicações oficiais",
  acessorios: "Itens e acessórios exclusivos",
};

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  const colClass =
    categories.length <= 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
      : categories.length <= 4
      ? "grid-cols-2 lg:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0C1830 0%, #0F2448 50%, #0C1830 100%)",
      }}
    >
      {/* Grade decorativa */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Halos dourados */}
      <div
        aria-hidden
        className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(200,146,26,0.10) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(200,146,26,0.07) 0%, transparent 70%)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-amber-400/50" />
            <span className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.3em]">
              Navegue por
            </span>
            <span className="h-px w-10 bg-amber-400/50" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Categorias</h2>
          <p className="mt-3 text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
            Explore nossa coleção completa organizada por categoria
          </p>
        </div>

        {/* Grid de cards */}
        <div className={`grid gap-4 ${colClass}`}>
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug, cat.name);
            const desc =
              cat.description ??
              FALLBACK_DESCRIPTIONS[cat.slug] ??
              "Produtos exclusivos selecionados";

            return (
              <Link
                key={cat.id}
                href={`/produtos?categoria=${cat.slug}`}
                className="group relative flex flex-col p-6 rounded-2xl border transition-all duration-300
                  bg-white/[0.04] border-white/[0.08]
                  hover:bg-white/[0.08] hover:border-amber-400/40
                  hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(200,146,26,0.15)]"
              >
                {/* Linha de brilho no topo ao hover */}
                <span
                  aria-hidden
                  className="absolute top-0 left-0 right-0 h-px rounded-t-2xl
                    bg-gradient-to-r from-transparent via-amber-400/0 to-transparent
                    group-hover:via-amber-400/70 transition-all duration-500"
                />

                {/* Ícone */}
                <div
                  className="mb-5 w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden
                    bg-amber-400/10 group-hover:bg-amber-400/20 group-hover:scale-110
                    transition-all duration-300"
                >
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Icon className="w-7 h-7 text-amber-400" />
                  )}
                </div>

                {/* Texto */}
                <div className="flex-1">
                  <h3
                    className="text-white font-semibold text-[15px] mb-2 leading-snug
                      group-hover:text-amber-300 transition-colors duration-200"
                  >
                    {cat.name}
                  </h3>
                  <p
                    className="text-white/40 text-xs leading-relaxed line-clamp-2
                      group-hover:text-white/60 transition-colors duration-200"
                  >
                    {desc}
                  </p>
                </div>

                {/* CTA */}
                <div
                  className="mt-5 flex items-center gap-1.5
                    text-amber-400/50 text-[11px] font-bold uppercase tracking-[0.15em]
                    group-hover:text-amber-400 transition-colors duration-200"
                >
                  <span>Explorar</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
