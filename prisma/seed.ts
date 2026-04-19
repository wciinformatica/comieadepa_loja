/**
 * Script de seed — popula o banco com dados iniciais
 * Executar: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Admin inicial ────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@2024!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@comieadepa.com.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@comieadepa.com.br",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✓ Admin criado:", admin.email);

  // ─── Categorias ──────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "fardamentos" },
      update: {},
      create: { name: "Fardamentos", slug: "fardamentos", description: "Fardamentos oficiais dos congressos", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "camisetas" },
      update: {},
      create: { name: "Camisetas", slug: "camisetas", description: "Camisetas institucionais", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "materiais-institucionais" },
      update: {},
      create: { name: "Materiais Institucionais", slug: "materiais-institucionais", description: "Materiais oficiais da convenção", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: "acessorios" },
      update: {},
      create: { name: "Acessórios", slug: "acessorios", description: "Acessórios e complementos", sortOrder: 4 },
    }),
  ]);
  console.log("✓ Categorias criadas:", categories.map((c) => c.name).join(", "));

  // ─── Departamentos ────────────────────────────────────
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { slug: "ministerio-de-moca" },
      update: {},
      create: { name: "Ministério de Moça", slug: "ministerio-de-moca", sortOrder: 1 },
    }),
    prisma.department.upsert({
      where: { slug: "ministerio-de-mocidade" },
      update: {},
      create: { name: "Ministério de Mocidade", slug: "ministerio-de-mocidade", sortOrder: 2 },
    }),
    prisma.department.upsert({
      where: { slug: "ministerio-infantil" },
      update: {},
      create: { name: "Ministério Infantil", slug: "ministerio-infantil", sortOrder: 3 },
    }),
    prisma.department.upsert({
      where: { slug: "ministerio-de-homens" },
      update: {},
      create: { name: "Ministério de Homens", slug: "ministerio-de-homens", sortOrder: 4 },
    }),
  ]);
  console.log("✓ Departamentos criados:", departments.map((d) => d.name).join(", "));

  // ─── Banner inicial ───────────────────────────────────
  await prisma.banner.upsert({
    where: { id: "banner-congresso-2024" },
    update: {},
    create: {
      id: "banner-congresso-2024",
      title: "Congresso 2024",
      subtitle: "Adquira já o seu fardamento oficial do congresso com qualidade e exclusividade.",
      imageUrl: "/img/slide01.fw.png",
      linkUrl: "/produtos?categoria=fardamentos",
      sortOrder: 1,
    },
  });
  console.log("✓ Banner criado");

  // ─── Produtos de exemplo ──────────────────────────────
  const sampleProduct = await prisma.product.upsert({
    where: { slug: "fardamento-congresso-2024" },
    update: {},
    create: {
      name: "Fardamento Congresso 2024",
      slug: "fardamento-congresso-2024",
      sku: "FARD-2024-001",
      description: "<p>Fardamento oficial do Congresso 2024. Confeccionado em tecido de alta qualidade, com bordado institucional.</p><p>Disponível nos tamanhos P, M, G, GG e XGG.</p>",
      shortDescription: "Fardamento oficial do Congresso 2024 em tecido premium.",
      price: 89.90,
      stock: 50,
      featured: true,
      active: true,
      categoryId: categories[0].id,
      departmentId: departments[0].id,
      variants: {
        create: [
          { name: "Tamanho", value: "P", stock: 10 },
          { name: "Tamanho", value: "M", stock: 15 },
          { name: "Tamanho", value: "G", stock: 15 },
          { name: "Tamanho", value: "GG", stock: 8 },
          { name: "Tamanho", value: "XGG", stock: 2 },
        ],
      },
    },
  });
  console.log("✓ Produto de exemplo criado:", sampleProduct.name);

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("\n📋 Credenciais do admin:");
  console.log("   E-mail: admin@comieadepa.com.br");
  console.log("   Senha:  Admin@2024!");
  console.log("\n⚠️  TROQUE A SENHA EM PRODUÇÃO!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
