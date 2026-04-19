import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/products/ProductDetail";
import { ProductCard } from "@/components/products/ProductCard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, shortDescription: true },
  });
  if (!product) return { title: "Produto não encontrado" };
  return { title: product.name, description: product.shortDescription ?? undefined };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      department: true,
      variants: true,
      relatedFrom: {
        include: {
          related: {
            include: {
              images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
              category: true,
            },
          },
        },
        take: 4,
      },
    },
  });

  if (!product) notFound();

  const safeProduct = product!;

  type RelatedProduct = {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    stock: number;
    images: { url: string; alt?: string | null }[];
    category: { name: string };
  };

  const relatedProducts: RelatedProduct[] = safeProduct.relatedFrom.map(
    (r: { related: { id: string; name: string; slug: string; price: unknown; salePrice?: unknown | null; stock: number; images: { url: string; alt?: string | null }[]; category: { name: string } } }) => ({
      ...r.related,
      price: Number(r.related.price),
      salePrice: r.related.salePrice != null ? Number(r.related.salePrice) : null,
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={{
        ...safeProduct,
        price: Number(safeProduct.price),
        salePrice: safeProduct.salePrice != null ? Number(safeProduct.salePrice) : null,
      }} />

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p: RelatedProduct) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
