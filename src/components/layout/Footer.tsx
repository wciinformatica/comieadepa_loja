import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Institucional */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                C
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight">COMIEADEPA</div>
                <div className="text-xs text-slate-400">Loja Oficial</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Loja oficial da Convenção de Ministros. Adquira fardamentos,
              produtos institucionais e materiais dos congressos com qualidade
              e segurança.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="h-9 w-9 rounded-lg bg-white/10 hover:bg-yellow-500 transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <span className="text-xs font-bold">IG</span>
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-lg bg-white/10 hover:bg-yellow-500 transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <span className="text-xs font-bold">FB</span>
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-lg bg-white/10 hover:bg-yellow-500 transition-colors flex items-center justify-center"
                aria-label="YouTube"
              >
                <span className="text-xs font-bold">YT</span>
              </a>
            </div>
          </div>

          {/* Links da loja */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Loja
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Todos os Produtos", href: "/produtos" },
                { label: "Fardamentos", href: "/produtos?categoria=fardamentos" },
                { label: "Departamentos", href: "/departamentos" },
                { label: "Promoções", href: "/produtos?promocao=true" },
                { label: "Novidades", href: "/produtos?ordenar=novo" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links da conta */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Minha Conta
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Fazer Login", href: "/login" },
                { label: "Criar Cadastro", href: "/cadastro" },
                { label: "Meus Pedidos", href: "/minha-conta/pedidos" },
                { label: "Meus Dados", href: "/minha-conta/dados" },
                { label: "Meus Endereços", href: "/minha-conta/enderecos" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contato
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
                <span className="text-slate-400">
                  Pará, Brasil
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-yellow-500" />
                <a href="tel:+5591999999999" className="hover:text-yellow-400 transition-colors text-slate-400">
                  (91) 9 9999-9999
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-yellow-500" />
                <a href="mailto:loja@comieadepa.com.br" className="hover:text-yellow-400 transition-colors text-slate-400">
                  loja@comieadepa.com.br
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Pagamentos aceitos
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {["PIX", "Boleto", "Cartão"].map((m) => (
                  <span
                    key={m}
                    className="bg-white/10 text-xs px-2 py-1 rounded font-medium text-slate-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé inferior */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {year} COMIEADEPA — Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/politica-de-privacidade" className="hover:text-yellow-400 transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="hover:text-yellow-400 transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
