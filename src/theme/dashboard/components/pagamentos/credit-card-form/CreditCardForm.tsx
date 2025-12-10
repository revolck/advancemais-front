"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { SelectCustom, InputCustom } from "@/components/ui/custom";
import type { SelectOption } from "@/components/ui/custom/select";
import {
  VisaFlatRoundedIcon,
  MastercardFlatRoundedIcon,
  AmericanExpressFlatRoundedIcon,
  DiscoverFlatRoundedIcon,
  EloFlatRoundedIcon,
  HipercardFlatRoundedIcon,
  GenericFlatRoundedIcon,
} from "react-svg-credit-card-payment-icons";

// Types
export type CardType = "credit" | "debit";

export type CardState = {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
  type: CardType;
};

export type CardValidity = {
  number: boolean;
  holder: boolean;
  month: boolean;
  year: boolean;
  cvv: boolean;
  allValid: boolean;
};

interface CreditCardFormProps {
  defaultNumber?: string;
  defaultHolder?: string;
  defaultMonth?: string;
  defaultYear?: string;
  defaultCVV?: string;
  defaultType?: CardType;
  maskMiddle?: boolean;
  onChange?: (state: CardState, validity: CardValidity) => void;
  onSubmit?: (state: CardState, validity: CardValidity) => void;
  className?: string;
  showSubmit?: boolean;
  submitLabel?: string;
  isLoading?: boolean;
  /** Layout do formulário: vertical (padrão) ou horizontal (cartão à esquerda, campos à direita) */
  layout?: "vertical" | "horizontal";
}

// Helpers
function formatNumberSpaces(num: string): string {
  return num.replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function clampDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

// Algoritmo de Luhn para validar número do cartão
function isValidLuhn(number: string): boolean {
  const n = number.replace(/\D/g, "");
  if (n.length < 13 || n.length > 16) return false;

  let sum = 0;
  let isEven = false;

  for (let i = n.length - 1; i >= 0; i--) {
    let digit = parseInt(n[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Detectar bandeira do cartão
function getCardBrand(number: string): string {
  const n = number.replace(/\D/g, "");
  if (n.length === 0) return "generic";

  // Visa: começa com 4
  if (/^4/.test(n)) return "visa";

  // Mastercard: começa com 51-55 ou 2221-2720
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";

  // American Express: começa com 34 ou 37
  if (/^3[47]/.test(n)) return "amex";

  // Discover: começa com 6011, 622126-622925, 644-649, 65
  if (/^6(?:011|5|4[4-9])/.test(n)) return "discover";

  // Elo: várias faixas
  if (
    /^(?:636368|636297|504175|438935|40117[8-9]|45763[1-2]|457393|431274|50900[0-9]|5765[4-5][0-9]|5090|636|627780)/.test(
      n
    )
  )
    return "elo";

  // Hipercard: começa com 606282 ou 384
  if (/^(606282|384)/.test(n)) return "hipercard";

  return "generic";
}

// Componente para renderizar ícone da bandeira do cartão
function CardBrandIcon({
  brand,
  className,
}: {
  brand: string;
  className?: string;
}) {
  const iconProps = { width: 48, height: 32, className };

  switch (brand) {
    case "visa":
      return <VisaFlatRoundedIcon {...iconProps} />;
    case "mastercard":
      return <MastercardFlatRoundedIcon {...iconProps} />;
    case "amex":
      return <AmericanExpressFlatRoundedIcon {...iconProps} />;
    case "discover":
      return <DiscoverFlatRoundedIcon {...iconProps} />;
    case "elo":
      return <EloFlatRoundedIcon {...iconProps} />;
    case "hipercard":
      return <HipercardFlatRoundedIcon {...iconProps} />;
    default:
      return <GenericFlatRoundedIcon {...iconProps} />;
  }
}

export function CreditCardForm({
  defaultNumber = "",
  defaultHolder = "",
  defaultMonth = "",
  defaultYear = "",
  defaultCVV = "",
  defaultType = "credit",
  maskMiddle = true,
  onChange,
  onSubmit,
  className = "",
  showSubmit = true,
  submitLabel = "Salvar Cartão",
  isLoading = false,
  layout = "vertical",
}: CreditCardFormProps) {
  const [number, setNumber] = useState(clampDigits(defaultNumber, 16));
  const [holder, setHolder] = useState(defaultHolder.toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(clampDigits(defaultCVV, 4));
  const [cardType, setCardType] = useState<CardType>(defaultType);
  const [focusField, setFocusField] = useState<
    null | "number" | "holder" | "expire" | "cvv"
  >(null);

  const flip = focusField === "cvv";
  const cardBrand = useMemo(() => getCardBrand(number), [number]);
  const compact = layout === "horizontal";

  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(start + i));
  }, []);

  // Opções para os selects
  const cardTypeOptions: SelectOption[] = useMemo(
    () => [
      { value: "credit", label: "Crédito" },
      { value: "debit", label: "Débito" },
    ],
    []
  );

  const monthOptions: SelectOption[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const m = String(i + 1).padStart(2, "0");
        return { value: m, label: m };
      }),
    []
  );

  const yearOptions: SelectOption[] = useMemo(
    () => years.map((y) => ({ value: y, label: y })),
    [years]
  );

  // Validação
  const validity: CardValidity = useMemo(() => {
    const numberValid = isValidLuhn(number);
    const holderValid = holder.trim().length >= 2;
    const monthValid = !!month && +month >= 1 && +month <= 12;
    const yearValid = !!year && +year >= new Date().getFullYear();
    const expectedCvvLength = cardBrand === "amex" ? 4 : 3;
    const cvvValid = cvv.length === expectedCvvLength && /^\d+$/.test(cvv);
    return {
      number: numberValid,
      holder: holderValid,
      month: monthValid,
      year: yearValid,
      cvv: cvvValid,
      allValid:
        numberValid && holderValid && monthValid && yearValid && cvvValid,
    };
  }, [number, holder, month, year, cvv, cardBrand]);

  // Notificar mudanças
  useEffect(() => {
    onChange?.({ number, holder, month, year, cvv, type: cardType }, validity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, holder, month, year, cvv, cardType]);

  // Slots de exibição do número
  const displayedSlots = useMemo(() => {
    const digits = number.slice(0, 16).split("");
    const arr: { text: string; filled: boolean }[] = [];
    for (let i = 0; i < 16; i++) {
      let content = "•";
      if (i < digits.length) {
        const d = digits[i];
        const shouldMask = maskMiddle && i >= 4 && i <= 11;
        content = shouldMask ? "•" : d;
      }
      arr.push({ text: content, filled: i < digits.length });
    }
    return arr;
  }, [number, maskMiddle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validity.allValid && !isLoading) {
      onSubmit?.(
        { number, holder, month, year, cvv, type: cardType },
        validity
      );
    }
  };

  // Handler para número do cartão
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = clampDigits(e.target.value, 16);
    setNumber(raw);
  };

  // JSX do Cartão Visual
  const cardVisualJSX = (
    <div
      className={cn(
        "relative perspective-1000",
        compact ? "w-[280px]" : "w-full max-w-[380px] mx-auto"
      )}
    >
      <div
        className={cn(
          "relative w-full transition-transform duration-700 transform-style-preserve-3d",
          compact ? "h-[170px]" : "h-[220px]",
          flip && "rotate-y-180"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Frente do Cartão */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl text-white overflow-hidden backface-hidden",
            "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950",
            "shadow-xl",
            compact ? "p-4" : "p-6"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Decoração */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

          {/* Header */}
          <div
            className={cn(
              "relative flex justify-between items-start",
              compact ? "mb-6" : "mb-8"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "rounded bg-gradient-to-br from-amber-300 to-amber-500",
                  compact ? "w-8 h-6" : "w-10 h-8"
                )}
              />
              <span
                className={cn(
                  "text-white/60 uppercase tracking-wider",
                  compact ? "text-[10px]" : "text-xs"
                )}
              >
                {cardType === "credit" ? "Crédito" : "Débito"}
              </span>
            </div>
            {/* Logo da bandeira */}
            <div
              className={cn(
                "flex items-center justify-end",
                compact ? "h-6 w-10" : "h-8 w-12"
              )}
            >
              <CardBrandIcon
                brand={cardBrand}
                className={compact ? "h-6 w-auto" : "h-8 w-auto"}
              />
            </div>
          </div>

          {/* Número */}
          <div
            className={cn(
              "relative flex gap-2 font-mono tracking-widest",
              compact ? "mb-4 text-sm" : "mb-6 text-xl"
            )}
          >
            {[0, 1, 2, 3].map((group) => (
              <div key={group} className="flex gap-0.5">
                {displayedSlots
                  .slice(group * 4, group * 4 + 4)
                  .map((slot, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "text-center transition-all duration-200",
                        compact ? "w-3" : "w-4",
                        slot.filled ? "text-white" : "text-white/30"
                      )}
                    >
                      {slot.text}
                    </span>
                  ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="relative flex justify-between items-end">
            <div>
              <p
                className={cn(
                  "text-white/50! uppercase! mb-0!",
                  compact ? "text-[8px]!" : "text-[10px]!"
                )}
              >
                Titular
              </p>
              <p
                className={cn(
                  "text-white/80! font-medium! tracking-wide! truncate!",
                  compact
                    ? "text-xs! max-w-[120px]!"
                    : "text-sm! max-w-[200px]!"
                )}
              >
                {holder || "NOME NO CARTÃO"}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-white/50! uppercase! mb-0!",
                  compact ? "text-[8px]!" : "text-[10px]!"
                )}
              >
                Validade
              </p>
              <p
                className={cn(
                  "font-medium! text-white/80! tracking-wide!",
                  compact ? "text-xs!" : "text-sm!"
                )}
              >
                {month || "MM"}/{year ? year.slice(-2) : "AA"}
              </p>
            </div>
          </div>
        </div>

        {/* Verso do Cartão */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl text-white overflow-hidden",
            "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950",
            "shadow-xl"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Tarja magnética */}
          <div
            className={cn(
              "w-full bg-slate-700",
              compact ? "h-8 mt-4" : "h-12 mt-6"
            )}
          />

          {/* CVV */}
          <div className={cn("px-4", compact ? "mt-4" : "mt-6")}>
            <div className="flex flex-col items-end">
              <p
                className={cn(
                  "text-white/60 mb-2",
                  compact ? "text-[10px]" : "text-xs"
                )}
              >
                CVV
              </p>
              <div
                className={cn(
                  "w-full bg-white rounded flex items-center justify-end px-4",
                  compact ? "h-8" : "h-10"
                )}
              >
                <span
                  className={cn(
                    "text-slate-900 font-mono tracking-widest",
                    compact ? "text-base" : "text-lg"
                  )}
                >
                  {"•".repeat(cvv.length) || "•••"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // JSX do Formulário
  const formFieldsJSX = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo de Cartão + Número do Cartão (mesma linha) */}
      <div className="grid grid-cols-[120px_1fr] gap-3">
        <SelectCustom
          label="Tipo"
          mode="single"
          options={cardTypeOptions}
          value={cardType}
          onChange={(val) => setCardType((val as CardType) || "credit")}
          size="md"
          required
        />
        <InputCustom
          label="Número do Cartão"
          name="card-number"
          placeholder="0000 0000 0000 0000"
          value={formatNumberSpaces(number)}
          onChange={handleNumberChange}
          onFocus={() => setFocusField("number")}
          onBlur={() => setFocusField(null)}
          error={
            !validity.number && number.length >= 13
              ? "Número inválido"
              : undefined
          }
          size="md"
          required
          maxLength={19}
        />
      </div>

      {/* Titular */}
      <InputCustom
        label="Nome do Titular"
        name="card-holder"
        placeholder="Digite o nome como está no cartão"
        value={holder}
        onChange={(e) => setHolder(e.target.value.toUpperCase())}
        onFocus={() => setFocusField("holder")}
        onBlur={() => setFocusField(null)}
        size="md"
        required
      />

      {/* Validade e CVV */}
      <div className="grid grid-cols-3 gap-3">
        <SelectCustom
          label="Mês"
          mode="single"
          options={monthOptions}
          value={month || null}
          onChange={(val) => {
            setMonth(val || "");
            setFocusField("expire");
          }}
          placeholder="MM"
          size="md"
          required
          searchable={false}
        />
        <SelectCustom
          label="Ano"
          mode="single"
          options={yearOptions}
          value={year || null}
          onChange={(val) => {
            setYear(val || "");
            setFocusField("expire");
          }}
          placeholder="AAAA"
          size="md"
          required
          searchable={false}
        />
        <InputCustom
          label="CVV"
          name="card-cvv"
          placeholder="•••"
          value={cvv}
          onChange={(e) => setCVV(clampDigits(e.target.value, 4))}
          onFocus={() => setFocusField("cvv")}
          onBlur={() => setFocusField(null)}
          size="md"
          maxLength={4}
          required
        />
      </div>

      {/* Botão Submit */}
      {showSubmit && (
        <button
          type="submit"
          disabled={!validity.allValid || isLoading}
          className={cn(
            "w-full h-12 rounded-xl font-semibold text-white transition-all mt-2",
            validity.allValid && !isLoading
              ? "bg-[var(--primary-color)] hover:bg-[var(--primary-color-dark)] cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          )}
        >
          {isLoading ? "Salvando..." : submitLabel}
        </button>
      )}
    </form>
  );

  // Layout Horizontal (cartão à esquerda, campos à direita)
  if (layout === "horizontal") {
    return (
      <div className={cn("flex gap-6", className)}>
        <div className="shrink-0">{cardVisualJSX}</div>
        <div className="flex-1 min-w-0">{formFieldsJSX}</div>
      </div>
    );
  }

  // Layout Vertical (padrão)
  return (
    <div className={cn("space-y-6", className)}>
      {cardVisualJSX}
      {formFieldsJSX}
    </div>
  );
}
