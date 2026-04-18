"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Package, Tag, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Variant {
  id: string;
  name: string;
  value: string;
  stock: number;
  price?: number | { toNumber: () => number } | null;
}

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  sku: string;
  price: number | { toNumber: () => number };
  salePrice?: number | { toNumber: () => number } | null;
  stock: number;
  images: ProductImage[];
  category: { name: string; slug: string };
  department?: { name: string; slug: string } | null;
  variants: Variant[];
}

function toNumber(val: number | { toNumber: () => number } | null | undefined): number | null {
  if (val == null) return null;
  return typeof val === "number" ? val : val.toNumber();
}

export function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const price = toNumber(product.price)!;
  const salePrice = toNumber(product.salePrice);
  const displayPrice = salePrice ?? price;
  const hasDiscount = salePrice !== null && salePrice! < price;
  const discountPct = hasDiscount ? Math.round(((price - salePrice!) / price) * 100) : 0;

  // Agrupar variantes por nome (Tamanho, Cor, etc.)
  const variantGroups = product.variants.reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const selectedVariantId =
    Object.keys(variantGroups).length > 0
      ? product.variants.find((v) =>
          Object.entries(selectedVariants).every(
            ([name, value]) => v.name === name && v.value === value
          )
        )?.id
      : undefined;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url,
      price: displayPrice,
      quantity,
      variantLabel: Object.values(selectedVariants).join(" / ") || undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-yellow-600">Início</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/produtos" className="hover:text-yellow-600">Produtos</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/produtos?categoria=${product.category.slug}`} className="hover:text-yellow-600">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-800 font-medium truncate max-w-48">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galeria de imagens */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 relative">
            {product.images[selectedImage]?.url ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt ?? product.name}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-slate-200">{product.name.charAt(0)}</span>
              </div>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="absolute top-3 left-3 text-sm font-bold px-3 py-1">
                -{discountPct}%
              </Badge>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-yellow-500" : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <Image src={img.url} alt={img.alt ?? product.name} width={80} height={80} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do produto */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {product.category.name}
              </span>
              {product.department && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {product.department.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-slate-600 mt-2 text-base leading-relaxed">{product.shortDescription}</p>
            )}
          </div>

          {/* Preço */}
          <div className="bg-slate-50 rounded-xl p-4">
            {hasDiscount && (
              <p className="text-slate-400 line-through text-sm mb-1">{formatCurrency(price)}</p>
            )}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">{formatCurrency(displayPrice)}</span>
              {hasDiscount && (
                <Badge variant="destructive" className="text-sm">
                  Economia: {formatCurrency(price - displayPrice)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ou em até 3x no cartão sem juros via ASAAS
            </p>
          </div>

          {/* Variantes */}
          {Object.entries(variantGroups).map(([groupName, variants]) => (
            <div key={groupName}>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                {groupName}:{" "}
                <span className="font-normal text-slate-600">
                  {selectedVariants[groupName] ?? "Selecione"}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [groupName]: v.value }))
                    }
                    disabled={v.stock === 0}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedVariants[groupName] === v.value
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : v.stock === 0
                        ? "border-slate-200 text-slate-300 cursor-not-allowed line-through"
                        : "border-slate-200 hover:border-yellow-400 text-slate-700"
                    }`}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantidade */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Quantidade</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-slate-100 transition-colors text-slate-700 font-bold"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold text-slate-800 min-w-12 text-center border-x">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 hover:bg-slate-100 transition-colors text-slate-700 font-bold"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Package className="h-4 w-4 text-slate-400" />
                <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {product.stock > 0 ? `${product.stock} em estoque` : "Esgotado"}
                </span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="lg"
              variant="gold"
              className="flex-1 font-bold gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {addedToCart ? "Adicionado! ✓" : "Adicionar ao Carrinho"}
            </Button>
            <Link href="/checkout" className="flex-1">
              <Button
                size="lg"
                className="w-full bg-slate-900 hover:bg-slate-800"
                onClick={() => {
                  addItem({
                    productId: product.id,
                    variantId: selectedVariantId,
                    name: product.name,
                    slug: product.slug,
                    image: product.images[0]?.url,
                    price: displayPrice,
                    quantity,
                    variantLabel: Object.values(selectedVariants).join(" / ") || undefined,
                  });
                }}
              >
                Comprar Agora
              </Button>
            </Link>
          </div>

          {/* SKU */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t">
            <Tag className="h-3.5 w-3.5" />
            SKU: {product.sku}
          </div>

          {/* Descrição */}
          {product.description && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-slate-800 mb-3">Descrição do Produto</h3>
              <div
                className="text-sm text-slate-600 leading-relaxed prose max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
