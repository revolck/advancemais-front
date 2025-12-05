// src/theme/website/components/checkout/components/BoletoSuccessScreen.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Copy,
  CheckCircle2,
  Clock,
  Download,
  Calendar,
  Mail,
  Home,
  ShieldCheck,
} from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "../utils/formatters";
import { CheckoutHeader } from "./CheckoutHeader";
import type { AppliedCoupon } from "../types";

interface BoletoSuccessScreenProps {
  boletoUrl: string;
  boletoCode: string | null;
  productName: string;
  productPrice: number;
  appliedCoupon: AppliedCoupon | null;
  sessionTimeLeft: number; // Tempo restante da sessão de checkout (em segundos)
  checkoutId?: string | null;
  onBack: () => void;
  onGoHome?: () => void;
}

export const BoletoSuccessScreen: React.FC<BoletoSuccessScreenProps> = ({
  boletoUrl,
  boletoCode,
  productName,
  productPrice,
  appliedCoupon,
  sessionTimeLeft,
  onBack,
  onGoHome,
}) => {
  const [codeCopied, setCodeCopied] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(sessionTimeLeft);
  const [isExpired, setIsExpired] = useState(sessionTimeLeft <= 0);

  // Continua o contador da sessão de checkout
  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired]);

  // Calcula a data de vencimento (3 dias úteis)
  const getExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  };

  const expiryDate = getExpiryDate();
  const formattedExpiryDate = expiryDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Auto-download do boleto quando a tela carregar
  useEffect(() => {
    if (boletoUrl && !hasDownloaded) {
      // Pequeno delay para garantir que a tela renderizou
      const timer = setTimeout(() => {
        window.open(boletoUrl, "_blank");
        setHasDownloaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [boletoUrl, hasDownloaded]);

  const copyBoletoCode = useCallback(() => {
    if (boletoCode) {
      navigator.clipboard.writeText(boletoCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  }, [boletoCode]);

  const downloadBoleto = useCallback(() => {
    window.open(boletoUrl, "_blank");
  }, [boletoUrl]);

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
        {/* Coluna esquerda - Boleto */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status de sucesso */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="!text-sm !font-medium !text-emerald-800 !mb-0">
                  Boleto gerado com sucesso!
                </p>
                <p className="!text-xs !text-emerald-600 !mb-0">
                  O download foi iniciado automaticamente
                </p>
              </div>
            </div>

            {/* Ícone e título */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="!text-xl !font-semibold !text-zinc-900 !mb-0">
                Pague o boleto
              </h2>
              <p className="!text-zinc-500 !text-sm !mb-0">
                Use o código de barras ou baixe o PDF
              </p>
            </div>

            {/* Código de barras */}
            {boletoCode && (
              <div className="bg-zinc-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="!text-xs !font-medium !text-zinc-500 !uppercase !tracking-wide !mb-0">
                    Código de barras
                  </p>
                  <ButtonCustom
                    variant="primary"
                    size="md"
                    onClick={copyBoletoCode}
                    className={cn(
                      "h-8 text-xs cursor-pointer",
                      codeCopied && "text-emerald-600"
                    )}
                  >
                    {codeCopied ? (
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
                  <code className="text-xs text-zinc-600 break-all leading-relaxed font-mono">
                    {boletoCode}
                  </code>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="space-y-3 mb-6">
              <ButtonCustom
                variant="primary"
                size="lg"
                fullWidth
                onClick={downloadBoleto}
                className="cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Boleto PDF
              </ButtonCustom>
            </div>

            {/* Informações importantes */}
            <div className="space-y-3">
              {/* Vencimento */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="!text-sm !font-medium !text-amber-800 !mb-0">
                    Pague até {formattedExpiryDate}
                  </p>
                  <p className="!text-xs !text-amber-600">
                    O boleto vence em 3 dias úteis
                  </p>
                </div>
              </div>

              {/* Confirmação por email */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="!text-sm !font-medium !text-blue-800 !mb-0">
                    Confirmação por e-mail
                  </p>
                  <p className="!text-xs !text-blue-600">
                    Após a compensação (até 3 dias úteis), seu plano será
                    ativado
                  </p>
                </div>
              </div>

              {/* Prazo de compensação */}
              <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <Clock className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="!text-sm !font-medium !text-zinc-700 !mb-0">
                    Prazo de compensação
                  </p>
                  <p className="!text-xs !text-zinc-500">
                    O pagamento pode levar até 3 dias úteis para ser processado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita - Resumo do pedido */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Resumo */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="!text-lg !font-semibold !text-zinc-900 !mb-4">
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
                <p className="!text-xs !text-emerald-600">
                  Processado pelo Mercado Pago com criptografia de ponta a ponta
                </p>
              </div>
            </div>

            {/* Botão para voltar ao início */}
            <ButtonCustom
              variant="outline"
              size="lg"
              fullWidth
              onClick={onGoHome || onBack}
              className="cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Início
            </ButtonCustom>
          </div>
        </div>
      </div>
    </div>
  );
};
