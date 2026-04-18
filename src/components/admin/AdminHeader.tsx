"use client";

import { Bell, ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div />

      <div className="flex items-center gap-3">
        {/* Link para a loja */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ver loja
        </Link>

        {/* Notificações */}
        <button className="h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 relative">
          <Bell className="h-4.5 w-4.5 h-5 w-5" />
        </button>

        {/* Usuário */}
        <div className="flex items-center gap-2 pl-2 border-l">
          <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold">
            {user.name?.charAt(0) ?? "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">
              {user.name ?? "Admin"}
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
