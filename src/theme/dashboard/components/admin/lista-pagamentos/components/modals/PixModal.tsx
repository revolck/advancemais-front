"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalBody,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import type { PagamentoPixDetalhes } from "@/api/empresas/pagamentos/types";

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  pix: PagamentoPixDetalhes;
  valor?: string | null;
}

export function PixModal({ isOpen, onClose, pix, valor }: PixModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (pix.copiaCola) {
      await navigator.clipboard.writeText(pix.copiaCola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const expirationDate = pix.expiraEm
    ? format(new Date(pix.expiraEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  const isExpired = pix.expiraEm ? isPast(new Date(pix.expiraEm)) : false;

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="xl" backdrop="blur">
      <ModalContentWrapper>
        <ModalTitle className="sr-only">Pagamento PIX</ModalTitle>
        <ModalBody className="p-0!">
          {/* Header */}
          <div className="px-8 pt-7 pb-5 text-center space-y-4">
            {/* Ícone de pagamento */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Zap className="size-7 text-white" />
              </div>
            </div>

            {/* Etiqueta pequena acima do valor */}
            <p className="text-[11px] tracking-[0.16em] uppercase text-gray-400">
              Pagamento via PIX
            </p>

            {/* Valor */}
            {valor && (
              <p className="text-[32px] leading-none font-semibold text-gray-900">
                {valor}
              </p>
            )}

            {/* Status */}
            {expirationDate && (
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-gray-50 border border-gray-200">
                  {isExpired ? (
                    <AlertCircle className="size-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-600">
                      {isExpired ? "Expirou em" : "Válido até"}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isExpired ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {expirationDate}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Código PIX */}
          {pix.copiaCola && (
            <div className="px-8 py-6 space-y-4">
              <div>
                <p className="text-sm! font-semibold! text-gray-900! mb-0!">
                  Código PIX
                </p>
                <p className="text-xs! text-gray-500!">
                  Copie e cole no app do seu banco
                </p>
              </div>

              <div className="relative group bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-700 font-mono break-all leading-relaxed select-all">
                  {pix.copiaCola}
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
        </ModalBody>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
