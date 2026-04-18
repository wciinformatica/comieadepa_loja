"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
}

interface HeroSectionProps {
  banners: Banner[];
}

// Banners padrão caso não haja nenhum cadastrado
const defaultBanners: Banner[] = [
  {
    id: "default-1",
    title: "Congresso 2024",
    subtitle: "Adquira já o seu fardamento oficial do congresso com qualidade e exclusividade.",
    imageUrl: "",
    linkUrl: "/produtos?categoria=fardamentos",
  },
  {
    id: "default-2",
    title: "Produtos Institucionais",
    subtitle: "Materiais e produtos oficiais dos departamentos da nossa convenção.",
    imageUrl: "",
    linkUrl: "/produtos",
  },
];

export function HeroSection({ banners }: HeroSectionProps) {
  const items = banners.length > 0 ? banners : defaultBanners;
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % items.length),
    [items.length]
  );
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  const item = items[current];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex items-center">
      {/* Imagem de fundo */}
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover opacity-30"
          priority
        />
      )}

      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />

      {/* Padrão decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-yellow-400" />
        <div className="absolute bottom-10 right-20 w-20 h-20 rounded-full border-2 border-yellow-400" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 rotate-45 border-2 border-yellow-400" />
      </div>

      {/* Conteúdo */}
      <div className="relative container mx-auto px-4 py-16 z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            COMIEADEPA — Loja Oficial
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {item.title}
          </h1>

          {item.subtitle && (
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 max-w-lg">
              {item.subtitle}
            </p>
          )}

          <div className="flex items-center gap-4">
            {item.linkUrl && (
              <Link href={item.linkUrl}>
                <Button size="xl" variant="gold" className="font-bold shadow-xl">
                  Ver Produtos
                </Button>
              </Link>
            )}
            <Link href="/produtos">
              <Button
                size="xl"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              >
                Explorar Loja
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Controles do carrossel */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current
                    ? "w-8 bg-yellow-400"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
