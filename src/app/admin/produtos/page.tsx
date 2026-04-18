import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Produtos — Admin" };

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  images: { url: string; alt?: string | null }[];
  category: { name: string } | null;
  department: { name: string } | null;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; status?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.pagina ?? "1", 10));
  const take = 20;
  const skip = (page - 1) * take;

  const where: Record<string, unknown> = {};
  if (params.busca) {
    where.OR = [
      { name: { contains: params.busca, mode: "insensitive" } },
      { sku: { contains: params.busca, mode: "insensitive" } },
    ];
  }
  if (params.status === "ativo") where.active = true;
  if (params.status === "inativo") where.active = false;
  if (params.status === "baixo") where.stock = { lte: 5 };

  const rawProducts = await prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
        department: true,
      },
      orderBy: { updatedAt: "desc" },
      take,
      skip,
    });

  const [products, total]: [AdminProduct[], number] = [
    rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku ?? "",
      price: Number(p.price),
      salePrice: p.salePrice != null ? Number(p.salePrice) : null,
      stock: p.stock,
      active: p.active,
      featured: p.featured,
      images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
      category: p.category ? { name: p.category.name } : null,
      department: p.department ? { name: p.department.name } : null,
    })),
    await prisma.product.count({ where }),
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
          <p className="text-slate-500 text-sm">{total} produtos cadastrados</p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button variant="gold" className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <form method="GET" className="flex-1 min-w-48">
          <input
            name="busca"
            defaultValue={params.busca}
            placeholder="Buscar por nome ou SKU..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </form>
        <div className="flex gap-2">
          {[
            { label: "Todos", value: "" },
            { label: "Ativos", value: "ativo" },
            { label: "Inativos", value: "inativo" },
            { label: "Estoque baixo", value: "baixo" },
          ].map((f) => (
            <Link
              key={f.value}
              href={`/admin/produtos${f.value ? `?status=${f.value}` : ""}`}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                (params.status ?? "") === f.value
                  ? "bg-yellow-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Produto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">SKU</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Categoria</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Preço</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Estoque</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                (products as AdminProduct[]).map((product: AdminProduct) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 relative shrink-0">
                          {product.images[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs font-bold">
                              {product.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1">{product.name}</p>
                          {product.featured && (
                            <span className="text-xs text-yellow-600 font-medium">⭐ Destaque</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">{product.sku}</td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">{product.category?.name ?? "—"}</span>
                      {product.department && (
                        <p className="text-xs text-slate-400">{product.department.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        {product.salePrice && (
                          <p className="text-xs text-slate-400 line-through">
                          {formatCurrency(Number(product.price))}
                          </p>
                        )}
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(Number(product.salePrice ?? product.price))}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-semibold ${
                          product.stock === 0
                            ? "text-red-600"
                            : product.stock <= 5
                            ? "text-orange-500"
                            : "text-green-600"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={product.active ? "success" : "secondary"}>
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/produtos/${product.slug}`}
                          target="_blank"
                          className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                          title="Ver na loja"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/produtos/${product.id}`}
                          className="h-8 w-8 rounded-lg hover:bg-yellow-50 flex items-center justify-center text-slate-500 hover:text-yellow-700 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {Math.ceil(total / take) > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: Math.ceil(total / take) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/produtos?pagina=${p}${params.busca ? `&busca=${params.busca}` : ""}`}
                className={`h-8 w-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                  p === page ? "bg-yellow-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
