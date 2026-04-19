import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft, MapPin, QrCode, FileText, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalhe do Pedido — Minha Conta" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PROCESSING: "Processando",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "outline"> = {
  PENDING: "warning",
  PROCESSING: "secondary",
  PAID: "success",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default async function MeuPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
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

  const payment = order.payment;

  let shippingAddress: Record<string, string> | null = null;
  if (order.shippingSnapshot) {
    try { shippingAddress = JSON.parse(order.shippingSnapshot as string); } catch { /* ignore */ }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/minha-conta/pedidos"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Meus Pedidos
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-mono font-semibold text-gray-900">#{order.orderNumber}</span>
      </div>

      {/* Cabeçalho */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500">Pedido realizado em</p>
          <p className="text-sm font-medium text-gray-700">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(Number(order.total))}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status] ?? "default"} className="self-start sm:self-auto">
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      {/* Endereço de entrega */}
      {shippingAddress && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            Endereço de Entrega
          </h2>
          <p className="text-sm text-gray-700">
            {shippingAddress.street}, {shippingAddress.number}
            {shippingAddress.complement ? `, ${shippingAddress.complement}` : ""}
          </p>
          <p className="text-sm text-gray-500">{shippingAddress.district}</p>
          <p className="text-sm text-gray-500">{shippingAddress.city} — {shippingAddress.state}</p>
          <p className="text-sm text-gray-500">CEP: {shippingAddress.zipCode}</p>
        </div>
      )}

      {/* Itens */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Itens do Pedido</h2>
        <div className="divide-y">
          {order.items.map((item) => {
            const img = item.product.images[0];
            return (
              <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-lg object-cover border"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                  {item.variant && (
                    <p className="text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>
                  )}
                  <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                  {formatCurrency(Number(item.total))}
                </p>
              </div>
            );
          })}
        </div>
        <div className="border-t pt-3 mt-3 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(Number(order.total))}</span>
        </div>
      </div>

      {/* Pagamento */}
      {payment && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            {payment.method === "PIX" && <QrCode className="h-4 w-4 text-green-600" />}
            {payment.method === "BOLETO" && <FileText className="h-4 w-4 text-blue-600" />}
            Pagamento
          </h2>

          <div className="text-sm text-gray-500 mb-4">
            Método: <span className="font-medium text-gray-800">{payment.method}</span>
            {" · "}
            Status: <Badge variant={payment.status === "CONFIRMED" ? "success" : "warning"} className="text-xs">{payment.status}</Badge>
          </div>

          {payment.method === "PIX" && payment.status !== "CONFIRMED" && (
            <div className="space-y-4">
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
                  <code className="text-xs break-all text-slate-700">{payment.pixCode}</code>
                </div>
              )}
              <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg p-3">
                ⏱ Vence em: {formatDate(payment.dueDate ?? new Date())}
              </p>
            </div>
          )}

          {payment.method === "BOLETO" && payment.status !== "CONFIRMED" && (
            <div className="space-y-3">
              {payment.boletoUrl && (
                <a
                  href={payment.boletoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
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
    </div>
  );
}
