"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Truck, Shield, Shirt, Package, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const MAROON = "#5C0A14";
const MAROON_PANEL = "#3A0508";
const GOLD = "#C8921A";
const GOLD_LIGHT = "#E8B94A";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
}

const defaultBanners: Banner[] = [
  {
    id: "default-1",
    title: "CONGRESSO GERAL 2026",
    subtitle: "Vista a identidade da nossa missão.",
    imageUrl: "/img/slide01.fw.png",
    linkUrl: "/produtos",
  },
  {
    id: "default-2",
    title: "FARDAMENTOS OFICIAIS",
    subtitle: "Materiais e produtos oficiais dos departamentos da nossa convenção.",
    imageUrl: "/img/slide01.fw.png",
    linkUrl: "/produtos?categoria=fardamentos",
  },
];

const QUICK_LINKS = [
  { icon: Shirt, label: "FARDAMENTOS\nOFICIAIS", href: "/produtos?categoria=fardamentos" },
  { icon: Package, label: "PRODUTOS DOS\nDEPARTAMENTOS", href: "/departamentos" },
  { icon: Star, label: "ITENS\nEXCLUSIVOS", href: "/produtos?destaque=true" },
];

const BENEFITS = [
  { icon: CheckCircle, label: "Qualidade Premium" },
  { icon: Truck, label: "Entrega para todo o Brasil" },
  { icon: Shield, label: "Pagamento 100% Seguro" },
];

export function HeroSection({ banners }: { banners: Banner[] }) {
  const items = banners.length > 0 ? banners : defaultBanners;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % items.length), [items.length]);
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next, items.length]);

  const item = items[current];

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: MAROON }}>
      {/* Imagens empilhadas — ficam só na área entre o texto e o painel lateral */}
      <div className="absolute inset-0 lg:right-[220px]">
        {items.map((banner, idx) =>
          banner.imageUrl ? (
            <Image
              key={banner.id}
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-contain object-right transition-opacity duration-700"
              style={{ opacity: idx === current ? 1 : 0 }}
              priority={idx === 0}
              unoptimized
            />
          ) : null
        )}
      </div>

      {/* Overlay gradiente: cobre a esquerda (texto) e some à direita (imagem visível) */}
      <div className="absolute inset-0 lg:right-[220px]" style={{ background: "linear-gradient(to right, rgba(58,5,8,1) 0%, rgba(58,5,8,0.98) 38%, rgba(58,5,8,0.7) 50%, rgba(58,5,8,0.1) 65%, transparent 80%)" }} />

      {/* Layout principal */}
      <div className="relative z-10 flex min-h-[480px] lg:min-h-[520px]">

        {/* Coluna esquerda: conteúdo */}
        <div className="w-full lg:w-[42%] shrink-0 flex flex-col justify-center px-6 lg:pl-20 lg:pr-6 py-10 lg:py-0">
          <div className="w-full">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-5 border"
              style={{ backgroundColor: "rgba(200,146,26,0.15)", color: GOLD_LIGHT, borderColor: "rgba(200,146,26,0.3)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: GOLD_LIGHT }} />
              COMIEADEPA — Loja Oficial
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none mb-4 drop-shadow-lg">
              {item.title}
            </h1>

            {item.subtitle && (
              <p className="text-lg text-white/75 leading-relaxed mb-6 max-w-sm">
                {item.subtitle}
              </p>
            )}

            {/* Benefícios */}
            <div className="flex flex-wrap gap-4 mb-8">
              {BENEFITS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <div
                    className="h-10 w-10 rounded-full border flex items-center justify-center"
                    style={{ borderColor: GOLD_LIGHT, backgroundColor: "rgba(200,146,26,0.1)" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: GOLD_LIGHT }} />
                  </div>
                  <span className="text-[10px] text-white/70 leading-tight max-w-[60px] text-center">{label}</span>
                </div>
              ))}
            </div>

            <Link
              href={item.linkUrl ?? "/produtos"}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-sm font-black text-sm uppercase tracking-widest transition-all hover:brightness-110 hover:shadow-xl shadow-lg"
              style={{ backgroundColor: GOLD, color: "#3A0508" }}
            >
              COMPRE AGORA
            </Link>
          </div>
        </div>

        {/* Coluna direita: painel de atalhos */}
        <div
          className="hidden lg:flex flex-col justify-center gap-2 py-6 px-4 w-[220px] shrink-0 ml-auto"
          style={{ backgroundColor: MAROON_PANEL, borderLeft: "1px solid rgba(255,255,255,0.08)" }}
        >
          {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-3 p-4 rounded-lg border transition-all group hover:border-amber-500 hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <Icon className="h-8 w-8 transition-transform group-hover:scale-110" style={{ color: GOLD_LIGHT }} />
              <span className="text-white text-[11px] font-bold text-center leading-tight tracking-wide whitespace-pre-line">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Setas do carrossel */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)" }}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full flex items-center justify-center transition-all hover:scale-110 right-3 lg:right-[224px]"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)" }}
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </>
      )}

      {/* Indicadores */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-[45%] flex gap-2 z-20">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                backgroundColor: i === current ? GOLD : "rgba(255,255,255,0.4)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
