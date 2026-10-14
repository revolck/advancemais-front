"use client";

import React from "react";
import {
  ButtonCustom,
  Icon,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";

interface BonificacaoInauguracaoModalProps {
  isOpen: boolean;
  nomeEmpresa: string;
  planoNome: string;
  quantidadeVagas: number;
  /** Último dia de uso (ISO) */
  validoAte: string;
  onPublicarVaga: () => void;
  onClose: () => void;
}

const formatarDiaMes = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
    month: "long",
  });

export function BonificacaoInauguracaoModal({
  isOpen,
  nomeEmpresa,
  planoNome,
  quantidadeVagas,
  validoAte,
  onPublicarVaga,
  onClose,
}: BonificacaoInauguracaoModalProps) {
  const vagas = `${quantidadeVagas} vaga${quantidadeVagas === 1 ? "" : "s"}`;

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled
      backdrop="blur"
      size="lg"
    >
      <ModalContentWrapper
        className="sm:max-w-xl"
        hideCloseButton
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon name="Gift" size={18} />
            </div>
            <ModalTitle className="mb-0! pt-5!">
              🎉 Presente de inauguração!
            </ModalTitle>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <p className="text-sm text-gray-700">
            <strong>{nomeEmpresa}</strong>, a nova Advance+ chegou e trouxe um
            presente: <strong>1 mês grátis do plano {planoNome}</strong>.
          </p>
          <p className="text-sm text-gray-700">
            Até <strong>{formatarDiaMes(validoAte)}</strong>, publique até{" "}
            <strong>{vagas}</strong>, receba candidatos e conduza seus processos
            seletivos sem pagar nada. É a nossa forma de dizer obrigado por fazer
            parte desta nova fase!
          </p>
        </ModalBody>
        <ModalFooter className="mt-6">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" size="md" onClick={onClose}>
              Explorar a plataforma
            </ButtonCustom>
            <ButtonCustom variant="primary" size="md" onClick={onPublicarVaga}>
              Publicar minha primeira vaga
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
