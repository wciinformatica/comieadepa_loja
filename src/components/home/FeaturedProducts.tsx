import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | { toNumber: () => number };
  salePrice?: number | { toNumber: () => number } | null;
  images: Array<{ url: string; alt?: string | null }>;
  category: { name: string };
  stock: number;
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        {/* Cabeçalho da seção */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-yellow-600 font-semibold text-sm uppercase tracking-wider mb-1">
              Seleção especial
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Produtos em Destaque
            </h2>
          </div>
          <Link
            href="/produtos?destaque=true"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-yellow-600 transition-colors"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grade de produtos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/produtos?destaque=true"
            className="inline-flex items-center gap-2 text-sm font-medium text-yellow-600 hover:text-yellow-700"
          >
            Ver todos os produtos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
