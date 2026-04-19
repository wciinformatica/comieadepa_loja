import { QrCode, CreditCard, Truck, Headphones } from "lucide-react";

const GOLD = "#C8921A";

const items = [
  { icon: QrCode, title: "PIX Rápido e Seguro", desc: "Aprovação instantânea" },
  { icon: CreditCard, title: "Parcelamento no Cartão", desc: "Em até 3x sem juros" },
  { icon: Truck, title: "Entrega Rastreada", desc: "Para todo o Brasil" },
  { icon: Headphones, title: "Atendimento Personalizado", desc: "Seg – Sex, 8h às 18h" },
];

export function BenefitsStrip() {
  return (
    <section className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-4 sm:py-5">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(200,146,26,0.12)" }}
              >
                <Icon className="h-5 w-5" style={{ color: GOLD }} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{title}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
