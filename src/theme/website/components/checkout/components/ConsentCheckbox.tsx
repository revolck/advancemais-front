// src/theme/website/components/checkout/components/ConsentCheckbox.tsx

"use client";

import React from "react";
import { CheckboxCustom } from "@/components/ui/custom/checkbox";

interface ConsentCheckboxProps {
  checked: boolean;
  onOpenTerms: () => void;
  onCheckedChange: (checked: boolean) => void;
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  checked,
  onOpenTerms,
  onCheckedChange,
}) => {
  const handleCheckboxChange = (newChecked: boolean) => {
    // Quando o usuário tenta marcar (clica no checkbox desmarcado)
    // abrimos a modal de termos ao invés de marcar diretamente
    if (newChecked && !checked) {
      onOpenTerms();
      // NÃO chamamos onCheckedChange aqui - a modal controla o estado
      return;
    }

    // Quando o usuário desmarca (clica no checkbox marcado)
    // permitimos desmarcar diretamente
    if (!newChecked) {
      onCheckedChange(false);
    }
  };

  return (
    <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-600">
      <CheckboxCustom
        id="checkout-consent"
        checked={checked}
        onCheckedChange={handleCheckboxChange}
        className="mt-0.5 bg-zinc-300 border border-zinc-400 data-[state=checked]:border-[var(--primary-color)]"
      />
      <label htmlFor="checkout-consent" className="leading-relaxed cursor-pointer">
        Li e concordo com os{" "}
        <button
          type="button"
          onClick={onOpenTerms}
          className="text-zinc-900 font-medium underline underline-offset-4 hover:text-zinc-700"
        >
          Termos de contratação
        </button>{" "}
        e autorizo a cobrança recorrente do plano selecionado.
      </label>
    </div>
  );
};

