"use client";

import { useEffect, useState } from "react";

import type { RecipientListFolder } from "@/api/websites/components/recipientlists";
import {
  ButtonCustom,
  InputCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";

interface RecipientListFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { nome: string; ordem?: number }) => Promise<void>;
  folder?: RecipientListFolder | null;
  isSubmitting?: boolean;
}

export function RecipientListFolderModal({
  isOpen,
  onClose,
  onSubmit,
  folder,
  isSubmitting = false,
}: RecipientListFolderModalProps) {
  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState("0");

  useEffect(() => {
    if (!isOpen) return;
    setNome(folder?.nome ?? "");
    setOrdem(String(folder?.ordem ?? 0));
  }, [folder, isOpen]);

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="lg" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{folder ? "Editar pasta" : "Nova pasta"}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <InputCustom
              label="Nome da pasta"
              required
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Audiências internas"
            />
            <InputCustom
              label="Ordem"
              value={ordem}
              onChange={(event) => setOrdem(event.target.value)}
              type="number"
              min={0}
              placeholder="0"
            />
          </div>
        </ModalBody>
        <ModalFooter className="justify-end gap-3">
          <ButtonCustom variant="outline" onClick={onClose}>
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            onClick={() =>
              onSubmit({
                nome,
                ordem: Number(ordem || 0),
              })
            }
            disabled={isSubmitting || !nome.trim()}
            isLoading={isSubmitting}
          >
            {folder ? "Salvar pasta" : "Criar pasta"}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
