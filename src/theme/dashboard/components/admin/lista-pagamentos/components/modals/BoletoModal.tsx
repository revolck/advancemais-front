"use client";

import { useState } from "react";
import { Copy, Check, Calendar, AlertCircle, CheckCircle2, ExternalLink, FileText } from "lucide-react";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalBody,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import type { PagamentoBoletoDetalhes } from "@/api/empresas/pagamentos/types";

interface BoletoModalProps {
  isOpen: boolean;
  onClose: () => void;
  boleto: PagamentoBoletoDetalhes;
  valor?: string | null;
}

export function BoletoModal({
  isOpen,
  onClose,
  boleto,
  valor,
}: BoletoModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (boleto.codigo) {
      await navigator.clipboard.writeText(boleto.codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenPdf = () => {
    if (boleto.urlPdf) {
      window.open(boleto.urlPdf, "_blank");
    }
  };

  const vencimentoDate = boleto.vencimento
    ? format(new Date(boleto.vencimento), "dd/MM/yyyy", { locale: ptBR })
    : null;

  const isExpired = boleto.vencimento
    ? isPast(new Date(boleto.vencimento))
    : false;

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="xl" backdrop="blur">
      <ModalContentWrapper>
        <ModalTitle className="sr-only">Boleto Bancário</ModalTitle>
        <ModalBody className="p-0!">
          {/* Header */}
          <div className="px-8 pt-7 pb-5 text-center space-y-4">
            {/* Ícone de pagamento */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <FileText className="size-7 text-white" />
              </div>
            </div>

            {/* Etiqueta pequena acima do valor */}
            <p className="text-[11px] tracking-[0.16em] uppercase text-gray-400">
              Boleto Bancário
            </p>

            {/* Valor */}
            {valor && (
              <p className="text-[32px] leading-none font-semibold text-gray-900">
                {valor}
              </p>
            )}

            {/* Status */}
            {vencimentoDate && (
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-gray-50 border border-gray-200">
                  {isExpired ? (
                    <AlertCircle className="size-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-600">
                      {isExpired ? "Venceu em" : "Vencimento"}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isExpired ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {vencimentoDate}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Linha Digitável */}
          {boleto.codigo && (
            <div className="px-8 py-6 space-y-4">
              <div>
                <p className="text-sm! font-semibold! text-gray-900! mb-0!">
                  Linha Digitável
                </p>
                <p className="text-xs! text-gray-500!">
                  Use para pagamento em caixas eletrônicos ou internet banking
                </p>
              </div>

              <div className="relative group bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-700 font-mono break-all leading-relaxed tracking-wide select-all">
                  {boleto.codigo}
                </p>
                {/* Botão flutuante - aparece no hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/95 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                  <ButtonCustom
                    variant={copied ? "primary" : "outline"}
                    size="xs"
                    onClick={handleCopy}
                    className="pointer-events-auto"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copiar
                      </>
                    )}
                  </ButtonCustom>
                </div>
              </div>
            </div>
          )}

          {/* Link PDF */}
          {boleto.urlPdf && (
            <div className="px-8 pb-6">
              <button
                onClick={handleOpenPdf}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 transition-colors cursor-pointer"
              >
                <FileText className="size-4" />
                Abrir boleto em PDF
                <ExternalLink className="size-4 ml-auto" />
              </button>
            </div>
          )}
        </ModalBody>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
