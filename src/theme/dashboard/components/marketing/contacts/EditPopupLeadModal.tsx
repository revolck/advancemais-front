"use client";

import { useEffect, useState } from "react";

import type { UpdatePopupContactPayload } from "@/api/websites/components/popups";
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
} from "@/components/ui/custom";

interface EditPopupLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: UpdatePopupContactPayload;
  isSubmitting: boolean;
  onSubmit: (values: UpdatePopupContactPayload) => void;
}

export function EditPopupLeadModal({
  isOpen,
  onClose,
  initialValues,
  isSubmitting,
  onSubmit,
}: EditPopupLeadModalProps) {
  const [formState, setFormState] =
    useState<UpdatePopupContactPayload>(initialValues);

  useEffect(() => {
    if (!isOpen) return;
    setFormState(initialValues);
  }, [initialValues, isOpen]);

  const isSubmitDisabled =
    !(formState.nome ?? "").trim() || !(formState.email ?? "").trim();

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="xl" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Editar contato</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-5 p-1">
          <InputCustom
            label="Nome"
            required
            value={formState.nome ?? ""}
            maxLength={250}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                nome: event.target.value,
              }))
            }
          />

          <InputCustom
            label="Email"
            required
            type="email"
            value={formState.email ?? ""}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                email: event.target.value,
              }))
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <InputCustom
              label="Empresa"
              value={formState.empresa ?? ""}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  empresa: event.target.value,
                }))
              }
            />
            <DatePickerCustom
              label="Data de nascimento"
              value={
                formState.dataNascimento
                  ? new Date(formState.dataNascimento)
                  : null
              }
              onChange={(date) =>
                setFormState((previous) => ({
                  ...previous,
                  dataNascimento: date ? new Date(date).toISOString() : null,
                }))
              }
              size="md"
              format="dd/MM/yyyy"
              years="old"
              clearable
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputCustom
              label="Telefone"
              value={formState.telefone ?? ""}
              mask="phone"
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  telefone: event.target.value,
                }))
              }
            />
            <InputCustom
              label="WhatsApp"
              value={formState.whatsapp ?? ""}
              mask="phone"
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  whatsapp: event.target.value,
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
            onClick={() => onSubmit(formState)}
            disabled={isSubmitDisabled}
            isLoading={isSubmitting}
            withAnimation={false}
          >
            Confirmar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
