"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";

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

function toNumber(val: number | { toNumber: () => number } | { toString: () => string }): number {
  if (typeof val === "number") return val;
  if (typeof (val as { toNumber?: () => number }).toNumber === "function") {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const price = toNumber(product.price);
  const salePrice = product.salePrice ? toNumber(product.salePrice) : null;
  const displayPrice = salePrice ?? price;
  const hasDiscount = salePrice !== null && salePrice < price;
  const discountPct = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  const image = product.images[0];
  const inStock = product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: image?.url,
      price: displayPrice,
      quantity: 1,
    });
  };

  return (
    <Link href={`/produtos/${product.slug}`} className="group">
      <div className="bg-white rounded-xl border hover:border-amber-700 hover:shadow-lg transition-all overflow-hidden flex flex-col h-full" style={{ borderColor: "#e5e7eb" }}>
        {/* Imagem */}
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.alt ?? product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-3xl font-bold text-slate-300">
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs font-bold">
                -{discountPct}%
              </Badge>
            )}
            {!inStock && (
              <Badge variant="secondary" className="text-xs">
                Esgotado
              </Badge>
            )}
          </div>

          {/* Botão favorito */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
            aria-label="Favoritar"
          >
            <Heart className="h-4 w-4 text-slate-600 hover:text-red-500 transition-colors" />
          </button>

          {/* Add to cart hover overlay */}
          {inStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 text-white py-2.5 text-sm font-semibold flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200"
              style={{ backgroundColor: "#5C0A14" }}
            >
              <ShoppingCart className="h-4 w-4" />
              Adicionar ao Carrinho
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex-1 flex flex-col">
          <p className="text-xs text-slate-400 mb-1">{product.category.name}</p>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 flex-1 transition-colors" style={{ color: undefined }}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-auto">
            <div>
              {hasDiscount && (
                <p className="text-xs text-slate-400 line-through">
                  {formatCurrency(price)}
                </p>
              )}
              <p className="text-base font-bold text-slate-900">
                {formatCurrency(displayPrice)}
              </p>
            </div>

            {inStock ? (
              <button
                onClick={handleAddToCart}
                className="sm:hidden h-8 w-8 rounded-lg flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: "#5C0A14" }}
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Indisponível</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
