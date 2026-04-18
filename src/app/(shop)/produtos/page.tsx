import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Produtos" };

type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: { toNumber: () => number };
  salePrice?: { toNumber: () => number } | null;
  stock: number;
  images: { url: string; alt?: string | null }[];
  category: { name: string };
};

interface SearchParams {
  [key: string]: string | undefined;
  categoria?: string;
  departamento?: string;
  busca?: string;
  precoMin?: string;
  precoMax?: string;
  ordenar?: string;
  destaque?: string;
  promocao?: string;
  pagina?: string;
}

async function getProducts(params: SearchParams) {
  const page = Math.max(1, parseInt(params.pagina ?? "1", 10));
  const take = 24;
  const skip = (page - 1) * take;

  const where: Record<string, unknown> = { active: true };

  if (params.busca) {
    where.OR = [
      { name: { contains: params.busca, mode: "insensitive" } },
      { description: { contains: params.busca, mode: "insensitive" } },
      { sku: { contains: params.busca, mode: "insensitive" } },
    ];
  }

  if (params.categoria) {
    where.category = { slug: params.categoria };
  }

  if (params.departamento) {
    where.department = { slug: params.departamento };
  }

  if (params.destaque === "true") {
    where.featured = true;
  }

  if (params.promocao === "true") {
    where.salePrice = { not: null };
  }

  if (params.precoMin || params.precoMax) {
    where.price = {};
    if (params.precoMin) (where.price as Record<string, number>).gte = parseFloat(params.precoMin);
    if (params.precoMax) (where.price as Record<string, number>).lte = parseFloat(params.precoMax);
  }

  const orderByMap: Record<string, object> = {
    "preco-asc": { price: "asc" },
    "preco-desc": { price: "desc" },
    "novo": { createdAt: "desc" },
    "nome": { name: "asc" },
  };
  const orderBy = orderByMap[params.ordenar ?? "novo"] ?? { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / take) };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { products, total, page, totalPages } = await getProducts(params);

  const [categories, departments] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.department.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {params.busca
            ? `Resultados para "${params.busca}"`
            : params.categoria
            ? `Categoria: ${params.categoria}`
            : "Todos os Produtos"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{total} produtos encontrados</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtros laterais */}
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters
            categories={categories}
            departments={departments}
            currentParams={params}
          />
        </aside>

        {/* Grade de produtos */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou realizar outra busca</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {(products as ProductListItem[]).map((product: ProductListItem) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`?${new URLSearchParams({ ...params, pagina: String(p) })}`}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-yellow-500 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
