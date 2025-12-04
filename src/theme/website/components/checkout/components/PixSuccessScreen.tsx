// src/theme/website/components/checkout/components/PixSuccessScreen.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "../utils/formatters";
import { CheckoutHeader } from "./CheckoutHeader";
import type { AppliedCoupon } from "../types";

interface PixSuccessScreenProps {
  pixCode: string;
  pixQrCode: string | null;
  productName: string;
  productPrice: number;
  appliedCoupon: AppliedCoupon | null;
  sessionTimeLeft: number; // Tempo restante da sessão de checkout (em segundos)
  checkoutId?: string | null;
  onBack: () => void;
  onPaymentConfirmed?: () => void;
}

export const PixSuccessScreen: React.FC<PixSuccessScreenProps> = ({
  pixCode,
  pixQrCode,
  productName,
  productPrice,
  appliedCoupon,
  sessionTimeLeft,
  checkoutId,
  onBack,
  onPaymentConfirmed,
}) => {
  const [pixCopied, setPixCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(sessionTimeLeft);
  const [isExpired, setIsExpired] = useState(sessionTimeLeft <= 0);
  const [isPolling, setIsPolling] = useState(true);

  // Continua o contador da sessão de checkout
  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsExpired(true);
          setIsPolling(false);
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!isPolling || !checkoutId) return;

    const pollInterval = setInterval(async () => {
      try {
        // TODO: Implementar endpoint de verificação de status
        // const response = await fetch(`/api/v1/empresas/planos/${checkoutId}`);
        // const data = await response.json();
        // if (data.statusPagamento === 'APROVADO') {
        //   setIsPolling(false);
        //   onPaymentConfirmed?.();
        // }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      }
    }, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(pollInterval);
  }, [isPolling, checkoutId, onPaymentConfirmed]);

  const copyPixCode = useCallback(() => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  }, [pixCode]);

  const discount = appliedCoupon?.discount || 0;
  const total = productPrice - discount;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 300; // Menos de 5 minutos

  if (isExpired) {
    return (
      <div className="container w-full mx-auto py-12">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Sessão expirada
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            O tempo para pagamento expirou. Por favor, inicie um novo checkout.
          </p>
          <ButtonCustom variant="primary" fullWidth onClick={onBack}>
            Voltar aos planos
          </ButtonCustom>
        </div>
      </div>
    );
  }

  return (
    <div className="container w-full mx-auto py-8 lg:py-12">
      {/* Header reutilizado */}
      <CheckoutHeader
        minutes={minutes}
        seconds={seconds}
        isLowTime={isLowTime}
        onBack={onBack}
      />

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Coluna esquerda - QR Code PIX */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status de aguardando */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              <div>
                <p className="!text-sm !font-medium !text-amber-800 !mb-0">
                  Aguardando pagamento
                </p>
                <p className="!text-xs !text-amber-600 !mb-0">
                  O pagamento será confirmado automaticamente
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <QrCode className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="!text-xl !font-semibold !text-zinc-900 !mb-0">
                Escaneie o QR Code
              </h2>
              <p className="!text-zinc-500 !text-sm !mb-0">
                Abra o app do seu banco e escaneie o código abaixo
              </p>
            </div>

            {pixQrCode && (
              <div className="bg-white border-2 border-zinc-100 p-6 rounded-2xl mb-6 flex justify-center">
                <img
                  src={
                    pixQrCode.startsWith("data:")
                      ? pixQrCode
                      : `data:image/png;base64,${pixQrCode}`
                  }
                  alt="QR Code PIX"
                  className="w-56 h-56"
                />
              </div>
            )}

            {/* Código Copia e Cola */}
            <div className="bg-zinc-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="!text-xs !font-medium !text-zinc-500 !uppercase !tracking-wide !mb-0">
                  Código PIX Copia e Cola
                </p>
                <ButtonCustom
                  variant="primary"
                  size="md"
                  onClick={copyPixCode}
                  className={cn("h-8 text-xs", pixCopied && "text-emerald-600")}
                >
                  {pixCopied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copiar código
                    </>
                  )}
                </ButtonCustom>
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg p-3">
                <code className="text-xs text-zinc-600 break-all leading-relaxed">
                  {pixCode}
                </code>
              </div>
            </div>

            {/* Instruções */}
            <div className="space-y-3">
              <p>Como pagar com PIX:</p>
              <ol className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                    1
                  </span>
                  Abra o app do seu banco ou carteira digital
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                    2
                  </span>
                  Escolha pagar com PIX QR Code ou Copia e Cola
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                    3
                  </span>
                  Escaneie o QR Code ou cole o código
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                    4
                  </span>
                  Confirme o pagamento
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Coluna direita - Resumo do pedido */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Resumo */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                Resumo do pedido
              </h3>

              <div className="space-y-3 pb-4 border-b border-zinc-100">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">{productName}</span>
                  <span className="text-zinc-900 font-medium">
                    {formatPrice(productPrice)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">
                      Cupom {appliedCoupon.code}
                    </span>
                    <span className="text-emerald-600 font-medium">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <span className="text-base font-semibold text-zinc-900">
                  Total
                </span>
                <span className="text-xl font-bold text-zinc-900">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Segurança */}
            <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="!text-sm !font-medium !text-emerald-800 !mb-0">
                  Pagamento 100% seguro
                </p>
                <p className="!text-xs !text-emerald-600 !mt-1 !mb-0">
                  Processado pelo Mercado Pago com criptografia de ponta a ponta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
