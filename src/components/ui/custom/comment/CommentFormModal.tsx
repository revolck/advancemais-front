"use client";

import { useEffect, useState } from "react";

import {
  ButtonCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SimpleTextarea,
} from "@/components/ui/custom";

interface CommentFormModalProps {
  isOpen: boolean;
  title: string;
  initialValue: string;
  submitLabel: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export function CommentFormModal({
  isOpen,
  title,
  initialValue,
  submitLabel,
  isSubmitting,
  onClose,
  onSubmit,
}: CommentFormModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (!isOpen) return;
    setValue(initialValue);
  }, [initialValue, isOpen]);

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="lg" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <SimpleTextarea
            label="Conteúdo da nota"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={1000}
            placeholder="Registre contexto, próximos passos ou observações úteis."
          />
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
          <ButtonCustom
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="button"
            variant="primary"
            size="md"
            onClick={() => onSubmit(value.trim())}
            disabled={!value.trim() || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Salvando..."
          >
            {submitLabel}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
