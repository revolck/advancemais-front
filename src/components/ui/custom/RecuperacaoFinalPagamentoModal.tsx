"use client";

import React from "react";
import {
  ButtonCustom,
  Icon,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";
import { cn } from "@/lib/utils";

export interface RecuperacaoFinalPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayNow: () => void;
  isPaying?: boolean;
  amount?: number;
  courseName?: string | null;
  turmaName?: string | null;
}

export function RecuperacaoFinalPagamentoModal({
  isOpen,
  onClose,
  onPayNow,
  isPaying = false,
  amount = 50,
  courseName,
  turmaName,
}: RecuperacaoFinalPagamentoModalProps) {
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

  const subtitle = [courseName, turmaName].filter(Boolean).join(" • ");

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 h-10 w-10 rounded-full flex items-center justify-center",
                "bg-amber-100 text-amber-700"
              )}
            >
              <Icon name="AlertTriangle" size={18} />
            </div>
            <div className="min-w-0">
              <ModalTitle>Recuperação final</ModalTitle>
              <ModalDescription>
                Para liberar a prova de recuperação final, é necessário efetuar um
                pagamento único.
              </ModalDescription>
              {subtitle ? (
                <div className="mt-2 text-xs text-gray-500">{subtitle}</div>
              ) : null}
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">
              Valor
            </div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {formattedAmount}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Pagamento via Pix, boleto ou cartão (crédito/débito).
            </div>
          </div>

          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 text-emerald-600" />
              <span>Após a aprovação, a prova é liberada automaticamente.</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 text-emerald-600" />
              <span>Este pagamento não é recorrente.</span>
            </li>
          </ul>
        </ModalBody>

        <ModalFooter className="flex flex-col sm:flex-row justify-end gap-2">
          <ButtonCustom variant="ghost" onClick={onClose} disabled={isPaying}>
            Agora não
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={onPayNow}
            disabled={isPaying}
            icon={isPaying ? "Loader2" : "CreditCard"}
            className={cn(isPaying && "[&_svg]:animate-spin")}
          >
            Pagar agora
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

