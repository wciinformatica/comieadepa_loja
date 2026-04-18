import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, Truck, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Compra Segura",
    description: "Ambiente 100% seguro com criptografia SSL",
  },
  {
    icon: Zap,
    title: "PIX Instantâneo",
    description: "Pague via PIX e receba confirmação imediata",
  },
  {
    icon: Truck,
    title: "Entrega Garantida",
    description: "Rastreamento completo do seu pedido",
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte",
    description: "Atendimento dedicado para membros da convenção",
  },
];

export function PromoSection() {
  return (
    <>
      {/* Banner institucional */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-yellow-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Convenção 2024
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            Garanta seu fardamento
            <br />
            <span className="text-yellow-400">oficial do congresso</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">
            Vista-se com identidade e pertencimento. Os fardamentos oficiais
            estão disponíveis em estoque limitado.
          </p>
          <Link href="/produtos?categoria=fardamentos">
            <Button size="xl" variant="gold" className="font-bold shadow-xl px-10">
              Comprar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-12 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center gap-3 p-4">
                <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{f.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
