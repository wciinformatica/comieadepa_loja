import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProductForm from "../../ProductForm";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const { id } = await params;

  const [product, categories, departments] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true, name: true, sku: true, description: true, shortDescription: true,
        price: true, salePrice: true, stock: true, featured: true, active: true,
        categoryId: true, departmentId: true,
        images: true, variants: true,
      },
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
      <ProductForm categories={categories} departments={departments} product={product} />
    </div>
  );
}
