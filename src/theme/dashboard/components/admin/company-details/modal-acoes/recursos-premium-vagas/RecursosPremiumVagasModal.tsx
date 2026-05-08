"use client";

import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import {
  EmpresaResumoCard,
  MotivoAuditoriaField,
  PremiumResourcesFooter,
  PremiumResourcesNotice,
  StatusVagasPublicadasField,
} from "./components";
import { useRecursosPremiumVagasModal } from "./hooks/useRecursosPremiumVagasModal";
import type { RecursosPremiumVagasModalProps } from "./types";

export function RecursosPremiumVagasModal(
  props: RecursosPremiumVagasModalProps,
) {
  const { isOpen, onOpenChange, company } = props;
  const {
    isActive,
    motivo,
    novoStatus,
    isSubmitting,
    handleClose,
    handleMotivoChange,
    handleStatusChange,
    handleSubmit,
  } = useRecursosPremiumVagasModal(props);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      backdrop="blur"
      scrollBehavior="inside"
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>
            {isActive ? "Remover premium" : "Aplicar premium"}
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-6">
          <EmpresaResumoCard company={company} />
          <PremiumResourcesNotice isActive={isActive} />

          {isActive && (
            <StatusVagasPublicadasField
              novoStatus={novoStatus}
              isSubmitting={isSubmitting}
              onChange={handleStatusChange}
            />
          )}

          <MotivoAuditoriaField
            motivo={motivo}
            isSubmitting={isSubmitting}
            onChange={handleMotivoChange}
          />
        </ModalBody>

        <ModalFooter>
          <PremiumResourcesFooter
            isActive={isActive}
            isSubmitting={isSubmitting}
            onCancel={handleClose}
            onConfirm={handleSubmit}
          />
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
