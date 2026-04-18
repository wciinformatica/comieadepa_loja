"use client";

import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-slate-200 mb-4" />
        <h1 className="text-2xl font-bold text-slate-700 mb-2">Carrinho vazio</h1>
        <p className="text-slate-500 mb-8">Adicione produtos para continuar.</p>
        <Link href="/produtos">
          <Button size="lg" variant="gold">Explorar Produtos</Button>
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping = 0; // frete grátis padrão (loja institucional)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Meu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de itens */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId ?? "default"}`}
              className="flex gap-4 bg-white rounded-xl border p-4"
            >
              {/* Imagem */}
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-slate-50 shrink-0 relative">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-200">{item.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/produtos/${item.slug}`} className="font-semibold text-slate-800 hover:text-yellow-700 line-clamp-2 text-sm sm:text-base">
                  {item.name}
                </Link>
                {item.variantLabel && (
                  <p className="text-xs text-slate-500 mt-0.5">{item.variantLabel}</p>
                )}
                <p className="text-yellow-600 font-bold mt-1">{formatCurrency(item.price)}</p>

                {/* Controles de quantidade */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="px-2 py-1 hover:bg-slate-100 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold border-x min-w-10 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="px-2 py-1 hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Total do item */}
              <div className="text-right shrink-0">
                <p className="font-bold text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors mt-2"
          >
            Limpar carrinho
          </button>
        </div>

        {/* Resumo do pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 sticky top-24">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Resumo do Pedido</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frete</span>
                <span className="text-green-600 font-medium">
                  {shipping === 0 ? "Grátis" : formatCurrency(shipping)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-slate-900 text-base">
                <span>Total</span>
                <span>{formatCurrency(subtotal + shipping)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button size="lg" variant="gold" className="w-full mt-6 font-bold">
                Finalizar Pedido
              </Button>
            </Link>

            <Link href="/produtos" className="block text-center text-sm text-slate-500 hover:text-yellow-600 mt-3">
              Continuar comprando
            </Link>

            {/* Segurança */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-slate-400 text-center">
                🔒 Compra 100% segura. Seus dados estão protegidos.
              </p>
              <div className="flex justify-center gap-3 mt-3 text-xs text-slate-400">
                <span>PIX</span>
                <span>•</span>
                <span>Boleto</span>
                <span>•</span>
                <span>Cartão</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
