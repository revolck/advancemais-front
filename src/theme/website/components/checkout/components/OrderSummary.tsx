// src/theme/website/components/checkout/components/OrderSummary.tsx

"use client";

import React from "react";
import { formatPrice } from "../utils/formatters";
import type { AppliedCoupon } from "../types";

interface OrderSummaryProps {
  productName: string;
  price: number;
  appliedCoupon: AppliedCoupon | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  productName,
  price,
  appliedCoupon,
}) => {
  const discount = appliedCoupon?.discount || 0;
  const total = price - discount;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <h4 className="!mb-5">Resumo</h4>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Plano {productName}</span>
          <span className="text-zinc-900 font-medium">
            {formatPrice(price)}
          </span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600">
              Desconto ({appliedCoupon.code})
            </span>
            <span className="text-emerald-600 font-medium">
              -{formatPrice(discount)}
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100">
          <div className="flex justify-between items-baseline">
            <span className="text-zinc-900 font-medium">Total</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-zinc-900">
                {formatPrice(total)}
              </span>
              <span className="text-zinc-400 text-sm">/mês</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
