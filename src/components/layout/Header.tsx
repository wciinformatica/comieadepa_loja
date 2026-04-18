"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, Menu, X, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Início", href: "/" },
  {
    label: "Produtos",
    href: "/produtos",
    children: [
      { label: "Todos os Produtos", href: "/produtos" },
      { label: "Fardamentos", href: "/produtos?categoria=fardamentos" },
      { label: "Materiais Institucionais", href: "/produtos?categoria=materiais-institucionais" },
      { label: "Promoções", href: "/produtos?promocao=true" },
    ],
  },
  { label: "Departamentos", href: "/departamentos" },
  { label: "Congressos", href: "/congressos" },
  { label: "Contato", href: "/contato" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = useCartStore((s) => s.totalItems());
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Barra superior institucional */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-2 text-xs">
          <span className="hidden sm:block text-slate-300">
            Convenção de Ministros — COMIEADEPA
          </span>
          <div className="flex items-center gap-4 text-slate-300">
            <Link href="/minha-conta/pedidos" className="hover:text-yellow-400 transition-colors">
              Meus Pedidos
            </Link>
            <Link href="/login" className="hover:text-yellow-400 transition-colors">
              Entrar / Cadastrar
            </Link>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-slate-900 text-lg leading-tight">COMIEADEPA</div>
              <div className="text-xs text-slate-500">Loja Oficial</div>
            </div>
          </Link>

          {/* Busca desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-500 transition-all"
          >
            <input
              type="search"
              placeholder="Buscar produtos, fardamentos, departamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
            />
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 transition-colors px-4 py-2.5 text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {/* Busca mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Search className="h-5 w-5 text-slate-700" />
            </button>

            {/* Minha conta */}
            <Link
              href="/minha-conta"
              className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <User className="h-5 w-5 text-slate-700" />
            </Link>

            {/* Carrinho */}
            <Link
              href="/carrinho"
              className="relative flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 transition-colors text-white px-3 py-2 rounded-lg font-medium text-sm"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:block">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Menu mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Busca mobile expandida */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 border-t">
            <form onSubmit={handleSearch} className="flex items-center border rounded-lg overflow-hidden mt-3">
              <input
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 px-4 py-2.5 text-sm outline-none"
              />
              <button type="submit" className="bg-yellow-500 px-4 py-2.5 text-white">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Navegação desktop */}
      <nav className="hidden lg:block bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-medium hover:text-yellow-400 hover:bg-white/5 transition-colors rounded"
                >
                  {link.label}
                  {link.children && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
                </Link>

                {link.children && (
                  <div className="absolute top-full left-0 hidden group-hover:block bg-white text-slate-800 shadow-xl rounded-b-lg min-w-48 border-t-2 border-yellow-500 z-50">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm hover:bg-yellow-50 hover:text-yellow-700 transition-colors first:rounded-t last:rounded-b"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-lg hover:bg-slate-100 font-medium text-slate-800"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-yellow-400 pl-3">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setMenuOpen(false)}
                            className="block px-3 py-1.5 text-sm text-slate-600 hover:text-yellow-700"
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
