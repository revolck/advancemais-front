"use client";

import React from "react";
import { Tag, Check, X, Percent, Banknote } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { formatPrice } from "../utils/formatters";
import type { AppliedCoupon } from "../types";

interface CouponSectionProps {
  appliedCoupon: AppliedCoupon | null;
  couponCode: string;
  couponError: string;
  couponLoading: boolean;
  showCouponInput: boolean;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onToggleInput: () => void;
  onCancelInput: () => void;
}

// Formata a descrição do desconto baseado no tipo
const formatDiscountDescription = (coupon: AppliedCoupon): string => {
  if (coupon.discountType === "percentage") {
    return `${coupon.discountValue}% de desconto`;
  }
  return `${formatPrice(coupon.discountValue)} de desconto`;
};

export const CouponSection: React.FC<CouponSectionProps> = ({
  appliedCoupon,
  couponCode,
  couponError,
  couponLoading,
  showCouponInput,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  onToggleInput,
  onCancelInput,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
      {!appliedCoupon ? (
        <div className="p-5">
          {!showCouponInput ? (
            <button
              onClick={onToggleInput}
              className="w-full flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center transition-colors">
                  <Tag className="w-4 h-4 text-zinc-500" />
                </div>
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
                  Cupom de desconto
                </span>
              </div>
              <span className="text-xs font-medium text-zinc-900 px-3 py-1.5 bg-zinc-100 rounded-full group-hover:bg-[var(--primary-color)] group-hover:text-white transition-all">
                Adicionar
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-zinc-500" />
                </div>
                <span className="text-sm font-medium text-zinc-700">
                  Cupom de desconto
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <InputCustom
                  name="couponCode"
                  value={couponCode}
                  onChange={(e) =>
                    onCouponCodeChange(e.target.value.toUpperCase())
                  }
                  onKeyDown={(e) => e.key === "Enter" && onApplyCoupon()}
                  placeholder="Digite o código do cupom"
                  autoFocus
                  size="sm"
                  error={couponError}
                  showInlineError
                  className="flex-1"
                />
                <ButtonCustom
                  variant="primary"
                  onClick={onApplyCoupon}
                  isLoading={couponLoading}
                  disabled={!couponCode.trim()}
                  className="mt-0"
                >
                  Aplicar
                </ButtonCustom>
              </div>
              <ButtonCustom
                variant="ghost"
                size="xs"
                onClick={onCancelInput}
                withAnimation={false}
              >
                Cancelar
              </ButtonCustom>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              {appliedCoupon.discountType === "percentage" ? (
                <Percent className="w-4 h-4 text-emerald-600" />
              ) : (
                <Banknote className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <p className="!text-sm !pt-2 !font-medium !text-emerald-900 !mb-0">
                {appliedCoupon.code}
              </p>
              <p className="!text-xs !text-emerald-600">
                {formatDiscountDescription(appliedCoupon)} (-
                {formatPrice(appliedCoupon.discount)})
              </p>
            </div>
          </div>
          <ButtonCustom
            variant="ghost"
            size="icon"
            onClick={onRemoveCoupon}
            withAnimation={false}
            className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
          >
            <X className="w-4 h-4" />
          </ButtonCustom>
        </div>
      )}
    </div>
  );
};
