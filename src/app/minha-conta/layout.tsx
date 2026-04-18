import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Package, MapPin, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/minha-conta", label: "Meus Dados", icon: User },
  { href: "/minha-conta/pedidos", label: "Meus Pedidos", icon: Package },
  { href: "/minha-conta/enderecos", label: "Endereços", icon: MapPin },
];

export default async function MinhaConta({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/minha-conta");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <p className="font-semibold truncate">{session.user.name}</p>
              <p className="text-xs text-blue-100 truncate">{session.user.email}</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors mt-2 border-t border-gray-100 pt-3"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sair
              </Link>
            </nav>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}
