"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { SelectCustom } from "@/components/ui/custom/select";
import { InputCustom } from "@/components/ui/custom/input";
import { toastCustom } from "@/components/ui/custom/toast";

const BAN_TYPE_OPTIONS = [
  { label: "Temporário", value: "TEMPORARIO" },
  { label: "Permanente", value: "PERMANENTE" },
];

const BAN_REASON_OPTIONS = [
  { label: "Spam", value: "SPAM" },
  { label: "Violação de políticas", value: "VIOLACAO_POLITICAS" },
  { label: "Fraude", value: "FRAUDE" },
  { label: "Abuso de recursos", value: "ABUSO_DE_RECURSOS" },
  { label: "Outros", value: "OUTROS" },
];

interface BloquearAlunoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alunoNome: string;
  onConfirm: (data: BloquearAlunoData) => Promise<void>;
}

export interface BloquearAlunoData {
  tipo: "TEMPORARIO" | "PERMANENTE";
  motivo: string;
  dias?: number;
  observacoes?: string;
}

export function BloquearAlunoModal({
  isOpen,
  onOpenChange,
  alunoNome,
  onConfirm,
}: BloquearAlunoModalProps) {
  const initialState = useMemo(
    () => ({
      tipo: "TEMPORARIO",
      motivo: "VIOLACAO_POLITICAS",
      dias: "30",
      observacoes: "",
    }),
    []
  );

  const [state, setState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setState(initialState);
      setIsSubmitting(false);
    }
  }, [initialState, isOpen]);

  const handleTypeChange = useCallback((value: string | null) => {
    setState((prev) => ({ ...prev, tipo: value || "TEMPORARIO" }));
  }, []);

  const handleReasonChange = useCallback((value: string | null) => {
    setState((prev) => ({ ...prev, motivo: value || "VIOLACAO_POLITICAS" }));
  }, []);

  const handleDaysKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ];
      if (allowedKeys.includes(event.key)) return;
      if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        return;
      }
      if (state.dias.length >= 4) {
        event.preventDefault();
      }
    },
    [state.dias.length]
  );

  const handleDaysChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (state.tipo !== "TEMPORARIO") {
        setState((prev) => ({ ...prev, dias: "" }));
        return;
      }

      const numericValue = value.replace(/[^\d]/g, "").slice(0, 4);
      if (numericValue === "0") {
        setState((prev) => ({ ...prev, dias: "" }));
        return;
      }
      if (!numericValue) {
        setState((prev) => ({ ...prev, dias: "" }));
        return;
      }
      const numValue = parseInt(numericValue, 10);
      if (numValue >= 1 && numValue <= 9999) {
        setState((prev) => ({ ...prev, dias: numericValue }));
      } else if (numericValue.length === 4 && numValue > 9999) {
        setState((prev) => ({ ...prev, dias: "9999" }));
      } else {
        setState((prev) => ({ ...prev, dias: numericValue }));
      }
    },
    [state.tipo]
  );

  const handleObservationsChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value.slice(0, 250);
      setState((prev) => ({ ...prev, observacoes: nextValue }));
    },
    []
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    const trimmedObservations = state.observacoes.trim();
    if (!trimmedObservations) {
      toastCustom.error({
        title: "Informe as observações",
        description:
          "Descreva as observações do bloqueio (máximo 250 caracteres).",
      });
      return;
    }

    if (state.tipo === "TEMPORARIO" && !state.dias) {
      toastCustom.error({
        title: "Informe a duração",
        description: "Defina a quantidade de dias para bloqueio temporário.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: BloquearAlunoData = {
        tipo: state.tipo as "TEMPORARIO" | "PERMANENTE",
        motivo: state.motivo,
        dias: state.tipo === "TEMPORARIO" ? Number(state.dias) : undefined,
        observacoes: trimmedObservations,
      };

      await onConfirm(payload);

      toastCustom.success({
        title: "Aluno bloqueado",
        description:
          "O acesso do aluno foi bloqueado e o período selecionado está ativo.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao bloquear aluno", error);
      toastCustom.error({
        title: "Erro ao aplicar bloqueio",
        description:
          "Não foi possível bloquear o aluno agora. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    handleClose,
    isSubmitting,
    onConfirm,
    state.dias,
    state.motivo,
    state.observacoes,
    state.tipo,
  ]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Bloquear aluno</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-8 p-1">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <SelectCustom
                mode="single"
                label="Tipo"
                required
                options={BAN_TYPE_OPTIONS}
                value={state.tipo}
                onChange={handleTypeChange}
                placeholder="Selecione o tipo"
                disabled={isSubmitting}
                size="sm"
                fullWidth
              />
            </div>

            <div className="space-y-3">
              <SelectCustom
                mode="single"
                label="Motivo"
                required
                options={BAN_REASON_OPTIONS}
                value={state.motivo}
                onChange={handleReasonChange}
                placeholder="Selecione o motivo"
                disabled={isSubmitting}
                size="sm"
                fullWidth
              />
            </div>
          </div>

          {state.tipo === "TEMPORARIO" && (
            <div className="space-y-3">
              <InputCustom
                type="text"
                label="Duração (dias)"
                required
                value={state.dias}
                onChange={handleDaysChange}
                onKeyDown={handleDaysKeyDown}
                placeholder="Digite a quantidade de dias (1-9999)"
                disabled={isSubmitting}
                size="sm"
                fullWidth
                maxLength={4}
              />
            </div>
          )}

          <div className="space-y-3">
            <SimpleTextarea
              label={`Observações detalhadas`}
              required
              value={state.observacoes}
              maxLength={250}
              showCharCount
              onChange={handleObservationsChange}
              disabled={isSubmitting}
              placeholder="Descreva detalhadamente as observações que justificam o bloqueio de acesso do aluno..."
              className="min-h-[120px] resize-none"
            />
          </div>
        </ModalBody>

        <ModalFooter className="py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="danger"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Aplicando bloqueio..."
              size="md"
            >
              Bloquear aluno
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
