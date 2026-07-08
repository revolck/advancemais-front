"use client";

import { useEffect, useState } from "react";

import type { CreatePopupLeadOpportunityPayload } from "@/api/websites/components/popups";
import {
  ButtonCustom,
  DatePickerCustom,
  InputCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SelectCustom,
  SimpleTextarea,
} from "@/components/ui/custom";
import {
  createDefaultPopupLeadOpportunityFormValues,
  type PopupLeadOpportunityFormValues,
  POPUP_LEAD_OPPORTUNITY_STATUS_OPTIONS,
} from "./PopupLeadOpportunities.shared";

interface AddPopupLeadOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  ownerOptions: Array<{ value: string; label: string }>;
  defaultOwnerUsuarioId: string | null;
  onSubmit: (
    payload: CreatePopupLeadOpportunityPayload,
  ) => Promise<void> | void;
}

function buildCreatePayload(values: PopupLeadOpportunityFormValues) {
  return {
    titulo: values.titulo.trim(),
    status: values.status,
    valorEsperado: values.valorEsperado ? Number(values.valorEsperado) : null,
    closeDate: values.closeDate || null,
    descricao: values.descricao.trim() || null,
    ownerUsuarioId: values.ownerUsuarioId,
  } satisfies CreatePopupLeadOpportunityPayload;
}

function toDateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function AddPopupLeadOpportunityModal({
  isOpen,
  onClose,
  isSubmitting,
  ownerOptions,
  defaultOwnerUsuarioId,
  onSubmit,
}: AddPopupLeadOpportunityModalProps) {
  const [formValues, setFormValues] = useState<PopupLeadOpportunityFormValues>(
    createDefaultPopupLeadOpportunityFormValues(defaultOwnerUsuarioId),
  );

  useEffect(() => {
    if (!isOpen) return;
    setFormValues(
      createDefaultPopupLeadOpportunityFormValues(defaultOwnerUsuarioId),
    );
  }, [defaultOwnerUsuarioId, isOpen]);

  const normalizedTitle = formValues.titulo.trim();
  const isSubmitDisabled =
    !normalizedTitle || !formValues.status || !formValues.ownerUsuarioId;

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
      size="lg"
      backdrop="blur"
      isDismissable={!isSubmitting}
    >
      <ModalContentWrapper hideCloseButton={isSubmitting}>
        <ModalHeader>
          <ModalTitle>Adicionar oportunidade</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-5 p-1">
          <div className="space-y-4">
            <InputCustom
              label="Título"
              required
              value={formValues.titulo}
              maxLength={120}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  titulo: event.target.value,
                }))
              }
            />

            <SelectCustom
              label="Responsável"
              required
              placeholder="Selecionar responsável"
              options={ownerOptions}
              value={formValues.ownerUsuarioId}
              onChange={(ownerUsuarioId) =>
                setFormValues((current) => ({
                  ...current,
                  ownerUsuarioId: ownerUsuarioId ?? null,
                }))
              }
            />

            <SelectCustom
              label="Status"
              required
              options={POPUP_LEAD_OPPORTUNITY_STATUS_OPTIONS}
              value={formValues.status}
              onChange={(status) =>
                setFormValues((current) => ({
                  ...current,
                  status:
                    (status as PopupLeadOpportunityFormValues["status"]) ??
                    "ABERTA",
                }))
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InputCustom
                label="Valor esperado"
                type="number"
                value={formValues.valorEsperado}
                placeholder="Ex.: 1500"
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    valorEsperado: event.target.value,
                  }))
                }
              />

              <DatePickerCustom
                label="Previsão de fechamento"
                value={
                  formValues.closeDate ? new Date(formValues.closeDate) : null
                }
                onChange={(date) =>
                  setFormValues((current) => ({
                    ...current,
                    closeDate: toDateInputValue(date),
                  }))
                }
                size="md"
                format="dd/MM/yyyy"
                clearable
                years="new"
              />
            </div>

            <SimpleTextarea
              label="Descrição"
              maxLength={2000}
              value={formValues.descricao}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  descricao: event.target.value,
                }))
              }
            />
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
          <ButtonCustom
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            withAnimation={false}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={() => onSubmit(buildCreatePayload(formValues))}
            disabled={isSubmitDisabled}
            isLoading={isSubmitting}
            withAnimation={false}
          >
            Adicionar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
