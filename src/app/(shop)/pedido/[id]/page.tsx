import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QrCode, FileText, ExternalLink, ChevronLeft, MapPin, User } from "lucide-react";
import type { Metadata } from "next";

type OrderItemWithRelations = {
  id: string;
  quantity: number;
  total: unknown;
  product: { name: string; slug: string; images: { url: string; isPrimary: boolean }[] };
  variant: { name: string; value: string } | null;
};

export const metadata: Metadata = { title: "Confirmação do Pedido" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
          },
          variant: true,
        },
      },
      payment: true,
    },
  });

  if (!order) notFound();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const safeOrder = order!;
  const payment = safeOrder.payment;

  // Endereço de entrega do snapshot
  let shippingAddress: Record<string, string> | null = null;
  if (safeOrder.shippingSnapshot) {
    try { shippingAddress = JSON.parse(safeOrder.shippingSnapshot as string); } catch { /* ignore */ }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Sucesso */}
      <div className="bg-white rounded-2xl border p-8 text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Pedido Realizado!</h1>
        <p className="text-slate-500">
          Pedido <span className="font-bold text-slate-800">{safeOrder.orderNumber}</span> criado com sucesso em{" "}
          {formatDate(safeOrder.createdAt)}.
        </p>
      </div>

      {/* Dados do cliente e entrega */}
      <div className="bg-white rounded-2xl border p-6 mb-6 grid sm:grid-cols-2 gap-6">
        {safeOrder.customerName && (
          <div>
            <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" /> Cliente
            </h2>
            <p className="text-sm text-slate-700">{safeOrder.customerName}</p>
            {safeOrder.customerEmail && <p className="text-sm text-slate-500">{safeOrder.customerEmail}</p>}
            {safeOrder.customerPhone && <p className="text-sm text-slate-500">{safeOrder.customerPhone}</p>}
          </div>
        )}
        {shippingAddress && (
          <div>
            <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" /> Entrega
            </h2>
            <p className="text-sm text-slate-700">
              {shippingAddress.street}, {shippingAddress.number}
              {shippingAddress.complement ? `, ${shippingAddress.complement}` : ""}
            </p>
            <p className="text-sm text-slate-500">{shippingAddress.district} — {shippingAddress.city}/{shippingAddress.state}</p>
            <p className="text-sm text-slate-500">CEP: {shippingAddress.zipCode}</p>
          </div>
        )}
      </div>

      {/* Informações de pagamento */}
      {payment && (
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            {payment.method === "PIX" && <QrCode className="h-5 w-5 text-green-600" />}
            {payment.method === "BOLETO" && <FileText className="h-5 w-5 text-blue-600" />}
            Instruções de Pagamento
          </h2>

          {payment.method === "PIX" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Escaneie o QR Code abaixo ou copie o código PIX para pagar:
              </p>
              {payment.pixQrCode && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${payment.pixQrCode}`}
                    alt="QR Code PIX"
                    className="h-48 w-48 rounded-xl border"
                  />
                </div>
              )}
              {payment.pixCode && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">Código PIX (copia e cola):</p>
                  <div className="flex gap-2">
                    <code className="flex-1 text-xs break-all text-slate-700 bg-white rounded-lg p-2 border">
                      {payment.pixCode}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(payment.pixCode!)}
                      className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg font-medium transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}
              <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-800">
                ⏱ O código PIX vence em: {formatDate(payment.dueDate ?? new Date())}. Após o
                pagamento, a confirmação é automática.
              </div>
            </div>
          )}

          {payment.method === "BOLETO" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                O boleto vence em {formatDate(payment.dueDate ?? new Date())}. Pague em qualquer
                banco, lotérica ou aplicativo.
              </p>
              {payment.boletoUrl && (
                <a
                  href={payment.boletoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visualizar Boleto
                </a>
              )}
              {payment.boletoBarCode && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Código de barras:</p>
                  <code className="text-xs break-all text-slate-700">{payment.boletoBarCode}</code>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resumo do pedido */}
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-4">Itens do Pedido</h2>
        <div className="space-y-3">
          {(safeOrder.items as OrderItemWithRelations[]).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.product.name}</p>
                {item.variant && (
                  <p className="text-xs text-slate-500">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <p className="text-xs text-slate-500">Qtd: {item.quantity}</p>
              </div>
              <p className="font-semibold text-slate-900">
                {formatCurrency(Number(item.total))}
              </p>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(Number(safeOrder.total))}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/minha-conta/pedidos"
          className="flex-1 flex items-center justify-center gap-2 border rounded-xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Meus Pedidos
        </Link>
        <Link
          href="/produtos"
          className="flex-1 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
        >
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}
