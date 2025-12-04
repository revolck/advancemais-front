// src/theme/website/components/checkout/components/CardForm.tsx

"use client";

import React from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { CardBrandIcon } from "./CardBrandIcon";
import { detectCardBrand } from "../utils/card-brand";
import { formatCardNumber, formatExpiry, formatCVV } from "../utils/formatters";
import { Separator } from "@/components/ui/separator";

interface CardFormProps {
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
  cardHolder: string;
  onCardNumberChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCardCVVChange: (value: string) => void;
  onCardHolderChange: (value: string) => void;
}

export const CardForm: React.FC<CardFormProps> = ({
  cardNumber,
  cardExpiry,
  cardCVV,
  cardHolder,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCVVChange,
  onCardHolderChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
      <h5 className="!mb-4">Dados do cartão</h5>
      <Separator className="!bg-zinc-200/30" />

      {/* Campo de número do cartão com ícone da bandeira */}
      <div className="space-y-2">
        <div className="relative">
          <InputCustom
            name="cardNumber"
            value={cardNumber}
            label="Número do cartão"
            onChange={(e) =>
              onCardNumberChange(formatCardNumber(e.target.value))
            }
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            size="md"
            required
            className="pr-14"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CardBrandIcon brand={detectCardBrand(cardNumber)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputCustom
          label="Validade"
          name="cardExpiry"
          value={cardExpiry}
          onChange={(e) => onCardExpiryChange(formatExpiry(e.target.value))}
          placeholder="MM/AA"
          maxLength={5}
          size="md"
          required
        />
        <InputCustom
          label="CVV"
          name="cardCVV"
          value={cardCVV}
          onChange={(e) => onCardCVVChange(formatCVV(e.target.value))}
          placeholder="123"
          maxLength={4}
          size="md"
          required
        />
      </div>

      <InputCustom
        label="Nome no cartão"
        name="cardHolder"
        value={cardHolder}
        onChange={(e) => onCardHolderChange(e.target.value.toUpperCase())}
        placeholder="NOME COMO ESTÁ NO CARTÃO"
        size="md"
        required
      />
    </div>
  );
};
