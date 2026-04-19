import Link from "next/link";
import { ArrowRight, MessageCircle, Clock, ShieldCheck, BadgeHelp } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";

const MAROON = "#5C0A14";
const GOLD = "#C8921A";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | { toNumber: () => number };
  salePrice?: number | { toNumber: () => number } | null;
  images: Array<{ url: string; alt?: string | null }>;
  category: { name: string } | null;
  stock: number;
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 items-stretch">

          {/* Coluna principal: produtos */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: MAROON }}>
                <span style={{ color: MAROON }}>Destaques</span>{" "}
                <span className="text-slate-800">da Loja</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Os produtos mais procurados do Congresso Geral 2026</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}

              {/* Card "Ver todos" — aparece como último item do grid */}
              <Link
                href="/produtos?destaque=true"
                className="hidden sm:flex flex-col items-center justify-center rounded-2xl border-2 font-semibold text-sm transition-all hover:shadow-md hover:scale-[1.02] gap-2"
                style={{ borderColor: GOLD, color: GOLD, minHeight: "220px" }}
              >
                Ver todos
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Botão "Ver todos" no mobile (abaixo do grid) */}
            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/produtos?destaque=true"
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
                style={{ color: GOLD }}
              >
                Ver todos os produtos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Sidebar suporte pré-venda */}
          <div className="hidden xl:flex flex-col w-80 shrink-0">
            {/* Cabeçalho — alinha com título/subtítulo dos produtos */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black whitespace-nowrap" style={{ color: MAROON }}>
                <span style={{ color: MAROON }}>Suporte</span>{" "}
                <span className="text-slate-800">Pré-venda</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Tire suas dúvidas antes de comprar</p>
            </div>

            {/* Card — alinha com os cards de produto */}
            <div
              className="flex flex-col flex-1 rounded-2xl p-6 text-white shadow-lg"
              style={{ backgroundColor: MAROON }}
            >
              {/* Ícone central */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="mb-3 h-14 w-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(200,146,26,0.25)" }}>
                  <BadgeHelp className="h-7 w-7" style={{ color: GOLD }} />
                </div>
                <p className="text-sm font-semibold text-white/90 leading-snug">
                  Tire suas dúvidas antes<br />de finalizar a compra
                </p>
              </div>

              {/* Divisor */}
              <div className="border-t mb-5" style={{ borderColor: "rgba(200,146,26,0.25)" }} />

              {/* Tópicos */}
              <ul className="space-y-3 flex-1">
                {[
                  { icon: ShieldCheck, text: "Tamanhos e modelos disponíveis" },
                  { icon: Clock, text: "Prazo e forma de entrega" },
                  { icon: MessageCircle, text: "Formas de pagamento" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(200,146,26,0.2)" }}>
                      <Icon className="h-4 w-4" style={{ color: GOLD }} />
                    </div>
                    <span className="text-sm text-white/85 leading-snug">{text}</span>
                  </li>
                ))}
              </ul>

              {/* Divisor */}
              <div className="border-t my-5" style={{ borderColor: "rgba(200,146,26,0.25)" }} />

              {/* Indicador + botão */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 bg-black/20 rounded-xl px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
                  <span className="text-sm text-white/90 font-medium">Atendimento disponível</span>
                </div>

                <a
                  href="https://wa.me/556930000000?text=Olá!%20Gostaria%20de%20tirar%20dúvidas%20antes%20de%20comprar."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366", color: "#fff" }}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
