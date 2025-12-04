// src/theme/website/components/checkout/components/PaymentMethodSelector.tsx

"use client";

import React from "react";
import { CreditCard, QrCode, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "../types";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: "credit" as const,
    label: "Cartão de Crédito",
    icon: CreditCard,
    sublabel: "À vista",
  },
  {
    id: "debit" as const,
    label: "Cartão de Débito",
    icon: CreditCard,
    sublabel: "À vista",
  },
  {
    id: "pix" as const,
    label: "PIX",
    icon: QrCode,
    sublabel: "Aprovação imediata",
  },
  {
    id: "boleto" as const,
    label: "Boleto",
    icon: FileText,
    sublabel: "Vence em 3 dias",
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
      <div className="p-4 mt-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => onChange(method.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
              selected === method.id
                ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                : "border-zinc-200 hover:border-zinc-300"
            )}
          >
            <method.icon
              className={cn(
                "w-6 h-6",
                selected === method.id
                  ? "text-[var(--secondary-color)]"
                  : "text-zinc-400"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium text-center",
                selected === method.id ? "text-white" : "text-zinc-600"
              )}
            >
              {method.label}
            </span>
            {method.sublabel && (
              <span className="text-[10px] text-zinc-400">
                {method.sublabel}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
