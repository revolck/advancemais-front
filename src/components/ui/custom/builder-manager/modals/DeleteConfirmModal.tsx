import React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { BuilderModule, BuilderItem } from "../types";
import { getItemTypeLabel } from "../config";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  deleteTarget:
    | { type: "module"; id: string }
    | { type: "item"; id: string }
    | null;
  modules: BuilderModule[];
  standaloneItems: BuilderItem[];
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmação de exclusão
 * Reutilizável para módulos e itens
 */
export function DeleteConfirmModal({
  isOpen,
  deleteTarget,
  modules,
  standaloneItems,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!deleteTarget) return null;

  const getDescription = () => {
    if (deleteTarget.type === "module") {
      const mod = modules.find((m) => m.id === deleteTarget.id);
      return (
        <>
          Você está prestes a excluir o módulo{" "}
          <span className="font-medium text-gray-900">
            "{mod?.title || "Sem título"}"
          </span>{" "}
          e todo o seu conteúdo.
        </>
      );
    }

    // item
    const it = modules
      .flatMap((m) => m.items)
      .concat(standaloneItems)
      .find((i) => i.id === deleteTarget.id);

    const typeLabel = it ? getItemTypeLabel(it.type, false) : "Conteúdo";

    return (
      <>
        Você está prestes a excluir o conteúdo{" "}
        <span className="font-medium text-gray-900">
          "{it?.title || "Sem título"}"
        </span>{" "}
        ({typeLabel}).
      </>
    );
  };

  const getWarningItems = () => {
    if (deleteTarget.type === "module") {
      return (
        <>
          <li>• O módulo e todos os itens serão removidos</li>
          <li>• Não será possível desfazer esta operação</li>
        </>
      );
    }

    return (
      <>
        <li>• O item será removido do módulo</li>
        <li>• Não será possível desfazer esta operação</li>
      </>
    );
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={(open) => !open && onCancel()}
      size="md"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Confirmar Exclusão</ModalTitle>
          <ModalDescription className="!mb-0 !leading-normal">
            {getDescription()}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4 p-1">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium !text-red-800 !leading-normal">
              Esta ação é irreversível.
            </p>
            <ul className="text-xs text-gray-700 space-y-1 ml-3">
              {getWarningItems()}
            </ul>
          </div>
          <p className="!text-base text-gray-600 !leading-normal !mb-0">
            Tem certeza que deseja continuar com esta exclusão?
          </p>
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom variant="outline" onClick={onCancel} size="md">
              Cancelar
            </ButtonCustom>
            <ButtonCustom variant="secondary" onClick={onConfirm} size="md">
              Sim, excluir
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

