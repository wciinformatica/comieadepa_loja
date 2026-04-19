"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, Menu, X, User, ChevronDown, Heart, Truck, Bell, Phone, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

const TOPBAR = "#1F2743";
const MAROON = "#5C0A14";
const MAROON_DARK = "#420810";
const GOLD = "#C8921A";

const navLinks = [
  { label: "Fardamentos", href: "/produtos?categoria=fardamentos" },
  {
    label: "Congressos",
    href: "/produtos?categoria=congressos",
    children: [
      { label: "Congresso Geral 2026", href: "/produtos?categoria=congressos" },
      { label: "Fardamentos do Congresso", href: "/produtos?categoria=fardamentos" },
    ],
  },
  {
    label: "Departamentos",
    href: "/departamentos",
    children: [
      { label: "Todos os Departamentos", href: "/departamentos" },
      { label: "Produtos por Departamento", href: "/produtos" },
    ],
  },
  { label: "Acessórios", href: "/produtos?categoria=acessorios" },
  { label: "Promoções", href: "/produtos?promocao=true" },
  { label: "Institucional", href: "/sobre" },
  { label: "Como Comprar", href: "/contato" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHref = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* 1. Barra de anúncios */}
      <div style={{ backgroundColor: TOPBAR }} className="text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-1.5 text-xs gap-2">
          <div className="hidden sm:flex items-center gap-1.5" style={{ color: "#E8B94A" }}>
            <Bell className="h-3 w-3 shrink-0" />
            <span className="whitespace-nowrap">Farda Congresso Geral 2026&nbsp;|&nbsp;Peça já a sua!</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-200 mx-auto sm:mx-0">
            <Truck className="h-3 w-3 shrink-0" style={{ color: "#E8B94A" }} />
            <span>Entrega para todo o Brasil</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-200">
            <Phone className="h-3 w-3 shrink-0" style={{ color: "#E8B94A" }} />
            <span>Atendimento via WhatsApp</span>
          </div>
        </div>
      </div>

      {/* 2. Header principal */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/img/logo.fw.png"
              alt="COMIEADEPA Store"
              width={160}
              height={60}
              unoptimized
              className="object-contain"
              priority
            />
          </Link>

          {/* Busca central */}
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center rounded-lg overflow-hidden border-2 focus-within:border-amber-500 transition-colors"
            style={{ borderColor: "#ddd" }}
          >
            <input
              type="search"
              placeholder="Buscar produtos, fardamentos, departamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white text-slate-700"
            />
            <button
              type="submit"
              className="px-4 py-2.5 text-white flex items-center justify-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD }}
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Ações */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/minha-conta"
              className="hidden sm:flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <User className="h-5 w-5 text-slate-600" />
              <span className="text-[10px] text-slate-500 whitespace-nowrap">Minha Conta</span>
            </Link>

            <button className="hidden sm:flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <Heart className="h-5 w-5 text-slate-600" />
              <span className="text-[10px] text-slate-500">Favoritos</span>
            </button>

            <Link
              href="/carrinho"
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-slate-700" />
                {mounted && totalItems > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold leading-none"
                    style={{ backgroundColor: "#ef4444", fontSize: "10px" }}
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {mounted ? totalItems : 0}
              </span>
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              {menuOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Barra de navegação desktop */}
      <nav className="hidden lg:block text-white text-sm" style={{ backgroundColor: MAROON_DARK }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-1.5">

            {pathname === "/produtos" ? (
              <Link
                href="/"
                className="flex items-center gap-2 py-1.5 px-4 font-bold whitespace-nowrap transition-all rounded-full shrink-0"
                style={{ backgroundColor: GOLD, color: "#2A0305" }}
              >
                <Home className="h-4 w-4" />
                Página Inicial
              </Link>
            ) : (
              <Link
                href="/produtos"
                className="flex items-center gap-2 py-1.5 px-4 font-bold whitespace-nowrap transition-all rounded-full shrink-0"
                style={{
                  backgroundColor: currentHref === "/produtos" ? "#E8B94A" : GOLD,
                  color: "#2A0305",
                  outline: currentHref === "/produtos" ? "2px solid #E8B94A" : "none",
                }}
              >
                <Menu className="h-4 w-4" />
                Todas as Categorias
              </Link>
            )}

            <ul className="flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = currentHref === link.href;
                return (
                  <li key={link.href} className="relative group">
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 px-3 py-1.5 font-medium transition-all whitespace-nowrap rounded-full"
                      style={{
                        color: isActive ? "#2A0305" : "#e8d5c0",
                        backgroundColor: isActive ? GOLD : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(200,146,26,0.18)";
                          (e.currentTarget as HTMLAnchorElement).style.color = "#E8B94A";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLAnchorElement).style.color = "#e8d5c0";
                        }
                      }}
                    >
                      {link.label}
                      {link.children && <ChevronDown className="h-3 w-3 opacity-70" />}
                    </Link>

                    {link.children && (
                      <div
                        className="absolute top-full left-0 hidden group-hover:block bg-white shadow-xl rounded-b-lg min-w-52 border-t-2 z-50"
                        style={{ borderColor: GOLD }}
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-slate-700 transition-colors first:rounded-t last:rounded-b"
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fff3d4";
                              (e.currentTarget as HTMLAnchorElement).style.color = MAROON;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "";
                              (e.currentTarget as HTMLAnchorElement).style.color = "";
                            }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* 4. Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b shadow-xl">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/produtos"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  <Menu className="h-4 w-4" />
                  Todas as Categorias
                </Link>
              </li>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-lg hover:bg-slate-100 font-medium"
                    style={{ color: MAROON }}
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 pl-3" style={{ borderColor: GOLD }}>
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setMenuOpen(false)}
                            className="block px-3 py-1.5 text-sm text-slate-600 hover:text-amber-700"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li className="pt-2 border-t mt-2">
                <Link
                  href="/minha-conta"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-slate-100 text-slate-700"
                >
                  <User className="h-4 w-4" />
                  Minha Conta
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
