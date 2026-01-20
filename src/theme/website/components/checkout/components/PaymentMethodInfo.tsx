// src/theme/website/components/checkout/components/PaymentMethodInfo.tsx

"use client";

import React from "react";
import { QrCode, FileText, CreditCard } from "lucide-react";
import type { PaymentMethod } from "../types";

interface PaymentMethodInfoProps {
  method: PaymentMethod;
  showCardInfo?: boolean;
}

export const PaymentMethodInfo: React.FC<PaymentMethodInfoProps> = ({
  method,
  showCardInfo = false,
}) => {
  if (showCardInfo && (method === "credit" || method === "debit")) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 !pb-3">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h5 className="!mb-0">Pagamento via Cartão</h5>
            <p className="!text-sm">
              Você será redirecionado para o Mercado Pago para informar os dados
              do cartão com segurança.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (method === "pix") {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 !pb-3">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <QrCode className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h5 className="!mb-0">Pagamento via PIX</h5>
            <p className="!text-sm">
              Após confirmar, você receberá um QR Code para pagamento. A
              aprovação é imediata.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (method === "boleto") {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 !pb-3">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h5 className="!mb-0">Pagamento via Boleto</h5>
            <p className="!text-sm">
              O boleto será gerado após confirmar. Vencimento em 3 dias úteis. A
              aprovação pode levar até 2 dias úteis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
