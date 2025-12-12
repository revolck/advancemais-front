import React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Icon } from "@/components/ui/custom/Icons";
import { toastCustom } from "@/components/ui/custom";

interface RestoreTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Modal de confirmação para restaurar template original
 */
export function RestoreTemplateModal({
  isOpen,
  onClose,
  onConfirm,
}: RestoreTemplateModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
    toastCustom.success({
      description: "Template restaurado com sucesso!",
    });
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      radius="lg"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Restaurar template</ModalTitle>
          <ModalDescription className="text-gray-500! leading-relaxed! mb-0!">
            Tem certeza que deseja restaurar o template original? Todas as
            alterações feitas na estrutura atual serão{" "}
            <span className="font-medium text-red-600">perdidas</span>.
          </ModalDescription>
        </ModalHeader>

        <ModalBody>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 shrink-0">
              <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm! font-medium! text-amber-900! mb-0!">
                Ação irreversível
              </p>
              <p className="text-xs! text-amber-700! mb-0!">
                Módulos, aulas, atividades e trabalhos criados serão removidos
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <ButtonCustom type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="button"
              variant="danger"
              icon="RotateCcw"
              onClick={handleConfirm}
            >
              Restaurar
            </ButtonCustom>
          </div>
        </ModalBody>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

