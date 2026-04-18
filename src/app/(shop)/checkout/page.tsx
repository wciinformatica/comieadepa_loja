"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { QrCode, FileText, CreditCard, Loader2 } from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().min(3, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .max(14)
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  paymentMethod: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const paymentOptions = [
  {
    value: "PIX" as const,
    label: "PIX",
    description: "Aprovação instantânea",
    icon: QrCode,
  },
  {
    value: "BOLETO" as const,
    label: "Boleto Bancário",
    description: "Vence em 3 dias úteis",
    icon: FileText,
  },
  {
    value: "CREDIT_CARD" as const,
    label: "Cartão de Crédito",
    description: "Em até 3x sem juros",
    icon: CreditCard,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "PIX" },
  });

  const selectedMethod = watch("paymentMethod");

  if (items.length === 0) {
    router.replace("/carrinho");
    return null;
  }

  const subtotal = totalPrice();

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: data,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          subtotal,
          total: subtotal,
          paymentMethod: data.paymentMethod,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Erro ao processar pedido");
      }

      const { orderId } = await res.json();
      clearCart();
      router.push(`/pedido/${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Finalizar Pedido</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dados pessoais */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-slate-900 mb-5">Dados Pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome completo *
                  </label>
                  <Input
                    {...register("name")}
                    placeholder="Seu nome completo"
                    className={errors.name ? "border-red-400" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail *
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="seu@email.com"
                    className={errors.email ? "border-red-400" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF *</label>
                  <Input
                    {...register("cpf")}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? "border-red-400" : ""}
                  />
                  {errors.cpf && (
                    <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone *
                  </label>
                  <Input
                    {...register("phone")}
                    placeholder="(91) 9 9999-9999"
                    className={errors.phone ? "border-red-400" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Método de pagamento */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-slate-900 mb-5">Forma de Pagamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`cursor-pointer flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === opt.value
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-slate-200 hover:border-yellow-300"
                    }`}
                  >
                    <input
                      {...register("paymentMethod")}
                      type="radio"
                      value={opt.value}
                      className="sr-only"
                    />
                    <opt.icon
                      className={`h-8 w-8 ${
                        selectedMethod === opt.value ? "text-yellow-600" : "text-slate-400"
                      }`}
                    />
                    <div className="text-center">
                      <p
                        className={`font-semibold text-sm ${
                          selectedMethod === opt.value ? "text-yellow-700" : "text-slate-700"
                        }`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-4">Resumo</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-3 text-sm"
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-50 relative shrink-0">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 line-clamp-1">{item.name}</p>
                      {item.variantLabel && (
                        <p className="text-xs text-slate-500">{item.variantLabel}</p>
                      )}
                      <p className="text-xs text-slate-500">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-slate-800 shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-base border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                variant="gold"
                className="w-full mt-6 font-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Confirmar Pedido"
                )}
              </Button>

              <p className="text-xs text-slate-400 text-center mt-3">
                🔒 Pagamento 100% seguro via ASAAS
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
