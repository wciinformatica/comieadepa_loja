import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { DepartmentsSection } from "@/components/home/DepartmentsSection";
import { PromoSection } from "@/components/home/PromoSection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getData() {
  const [featuredProducts, categories, departments, banners] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      take: 8,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.department.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return {
    featuredProducts: featuredProducts.map((p) => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    })),
    categories,
    departments,
    banners,
  };
}

export default async function HomePage() {
  const { featuredProducts, categories, departments, banners } = await getData();

  return (
    <>
      <HeroSection banners={banners} />
      <FeaturedProducts products={featuredProducts} />
      <CategoriesSection categories={categories} />
      <DepartmentsSection departments={departments} />
      <PromoSection />
    </>
  );
}
