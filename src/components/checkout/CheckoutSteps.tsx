"use client";

import { CheckCircle, Circle } from "lucide-react";

const STEPS = [
  { id: 1, label: "Identificação" },
  { id: 2, label: "Endereço" },
  { id: 3, label: "Pagamento" },
];

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                current > step.id
                  ? "bg-green-500 text-white"
                  : current === step.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {current > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                current >= step.id ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-3 transition-colors ${
                current > step.id ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
