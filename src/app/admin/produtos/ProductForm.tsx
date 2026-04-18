"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2 } from "lucide-react";

type Category = { id: string; name: string };
type Department = { id: string; name: string };
type Variant = { id?: string; name: string; value: string; priceModifier?: number | null; stock: number };
type Image = { id?: string; url: string; alt?: string | null; sortOrder?: number };
type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  price: { toNumber?: () => number } | number;
  salePrice: { toNumber?: () => number } | number | null;
  stock: number;
  featured: boolean;
  active: boolean;
  categoryId: string | null;
  departmentId: string | null;
  images: Image[];
  variants: Variant[];
};

const schema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  sku: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  salePrice: z.union([z.number().positive(), z.nan()]).optional().transform((v) =>
    v === undefined || (typeof v === "number" && isNaN(v)) ? undefined : v
  ),
  stock: z.number().int().min(0),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  categoryId: z.string().optional(),
  departmentId: z.string().optional(),
});

type FormData = {
  name: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock: number;
  featured?: boolean;
  active?: boolean;
  categoryId?: string;
  departmentId?: string;
};

export default function ProductForm({
  categories,
  departments,
  product,
}: {
  categories: Category[];
  departments: Department[];
  product?: Product;
}) {
  const router = useRouter();
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku ?? "",
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          price: Number(product.price),
          salePrice: product.salePrice != null
            ? Number(product.salePrice)
            : undefined,
          stock: product.stock,
          featured: product.featured,
          active: product.active,
          categoryId: product.categoryId ?? undefined,
          departmentId: product.departmentId ?? undefined,
        }
      : { active: true, featured: false, stock: 0 },
  });

  const [variants, setVariants] = useState<Variant[]>(product?.variants ?? []);
  const [images, setImages] = useState<Image[]>(product?.images ?? []);
  const [serverError, setServerError] = useState("");

  // Variantes
  function addVariant() {
    setVariants((v) => [...v, { name: "Tamanho", value: "", stock: 0 }]);
  }
  function removeVariant(i: number) {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  }
  function updateVariant(i: number, field: keyof Variant, value: string | number) {
    setVariants((v) => v.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  // Imagens
  function addImage() {
    setImages((imgs) => [...imgs, { url: "", alt: "" }]);
  }
  function removeImage(i: number) {
    setImages((imgs) => imgs.filter((_, idx) => idx !== i));
  }
  function updateImage(i: number, field: keyof Image, value: string | number) {
    setImages((imgs) => imgs.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, variants, images }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Erro ao salvar produto");
      }
      router.push("/admin/produtos");
      router.refresh();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados básicos */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input {...register("name")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input {...register("sku")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
            <input type="number" min={0} {...register("stock", { valueAsNumber: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
            <input type="number" step="0.01" min={0} {...register("price", { valueAsNumber: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço De (R$)</label>
            <input type="number" step="0.01" min={0} {...register("salePrice", { valueAsNumber: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select {...register("categoryId")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Sem categoria —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <select {...register("departmentId")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Sem departamento —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
            <input {...register("shortDescription")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Completa</label>
            <textarea rows={5} {...register("description")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("active")} className="h-4 w-4" />
              Ativo
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register("featured")} className="h-4 w-4" />
              Destaque
            </label>
          </div>
        </div>
      </div>

      {/* Imagens */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Imagens</h2>
          <button type="button" onClick={addImage} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <PlusCircle className="w-4 h-4" /> Adicionar
          </button>
        </div>
        {images.length === 0 && <p className="text-sm text-gray-500">Nenhuma imagem adicionada.</p>}
        {images.map((img, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              value={img.url}
              onChange={(e) => updateImage(i, "url", e.target.value)}
              placeholder="URL da imagem (https://...)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={img.alt ?? ""}
              onChange={(e) => updateImage(i, "alt", e.target.value)}
              placeholder="Alt text"
              className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={() => removeImage(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Variantes */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Variantes</h2>
          <button type="button" onClick={addVariant} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <PlusCircle className="w-4 h-4" /> Adicionar
          </button>
        </div>
        {variants.length === 0 && <p className="text-sm text-gray-500">Nenhuma variante (ex.: tamanhos).</p>}
        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-4 gap-3 items-center">
            <input
              value={v.name}
              onChange={(e) => updateVariant(i, "name", e.target.value)}
              placeholder="Tipo (ex.: Tamanho)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={v.value}
              onChange={(e) => updateVariant(i, "value", e.target.value)}
              placeholder="Valor (ex.: M)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              min={0}
              value={v.stock}
              onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
              placeholder="Estoque"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={() => removeVariant(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg w-fit">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {serverError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{serverError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Produto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/produtos")}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
