"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ButtonCustom,
  InputCustom,
  toastCustom,
} from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { useUpdateNotaMutation } from "../hooks/useUpdateNotaMutation";

interface EditNotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursoId: string;
  turmaId: string;
  notaId: string;
  alunoNome: string;
  notaAtual: number | null;
  motivoAtual?: string | null;
}

function sanitizeDecimal0to10(raw: string): string {
  if (raw === "") return "";

  let value = raw.replace(/[^0-9.]/g, "");
  const firstDotIndex = value.indexOf(".");
  if (firstDotIndex !== -1) {
    value =
      value.substring(0, firstDotIndex + 1) +
      value.substring(firstDotIndex + 1).replace(/\./g, "");
  }

  const parts = value.split(".");
  if (parts.length === 2 && parts[1].length > 2) {
    value = `${parts[0]}.${parts[1].substring(0, 2)}`;
  }

  const numValue = Number(value);
  if (Number.isFinite(numValue) && numValue > 10) return "10";
  return value;
}

function parseNota(value: string): number | "invalid" {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return "invalid";
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    return "invalid";
  }
  return Math.round(parsed * 100) / 100;
}

function formatNotaInput(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return String(value).replace(",", ".");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Não foi possível atualizar a nota.";
}

export function EditNotaModal({
  isOpen,
  onClose,
  cursoId,
  turmaId,
  notaId,
  alunoNome,
  notaAtual,
  motivoAtual,
}: EditNotaModalProps) {
  const updateNota = useUpdateNotaMutation();
  const [notaInput, setNotaInput] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState<{ nota?: string; motivo?: string }>({});

  const title = useMemo(
    () => (alunoNome ? `Editar nota de ${alunoNome}` : "Editar nota"),
    [alunoNome],
  );

  useEffect(() => {
    if (!isOpen) return;
    setNotaInput(formatNotaInput(notaAtual));
    setMotivo(motivoAtual?.trim() || "Lançamento manual");
    setErrors({});
  }, [isOpen, motivoAtual, notaAtual]);

  const handleClose = () => {
    if (updateNota.isPending) return;
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = parseNota(notaInput);
    const motivoTrimmed = motivo.trim();
    const nextErrors: { nota?: string; motivo?: string } = {};

    if (parsed === "invalid") {
      nextErrors.nota = "Informe uma nota válida entre 0 e 10.";
    }
    if (motivoTrimmed.length < 3) {
      nextErrors.motivo = "Informe pelo menos 3 caracteres.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || parsed === "invalid") return;

    try {
      await updateNota.mutateAsync({
        action: "update",
        cursoId,
        turmaId,
        notaId,
        nota: parsed,
        motivo: motivoTrimmed,
      });
      toastCustom.success("Nota atualizada.");
      onClose();
    } catch (error) {
      toastCustom.error(getErrorMessage(error));
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            <InputCustom
              label="Nota (0 a 10)"
              value={notaInput}
              required
              type="text"
              inputMode="decimal"
              maxLength={5}
              onChange={(event) => {
                const value = sanitizeDecimal0to10(
                  (event.target as HTMLInputElement).value,
                );
                setNotaInput(value);
                setErrors((prev) => ({ ...prev, nota: undefined }));
              }}
              placeholder="Ex: 7.5"
              error={errors.nota}
              disabled={updateNota.isPending}
            />

            <SimpleTextarea
              label="Motivo da nota"
              value={motivo}
              required
              onChange={(event) => {
                setMotivo((event.target as HTMLTextAreaElement).value);
                setErrors((prev) => ({ ...prev, motivo: undefined }));
              }}
              placeholder="Ex: ajuste manual, recuperação, atividade extra..."
              error={errors.motivo}
              maxLength={255}
              showCharCount
              disabled={updateNota.isPending}
            />
          </ModalBody>

          <ModalFooter>
            <div className="flex w-full justify-end gap-2">
              <ButtonCustom
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateNota.isPending}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                type="submit"
                variant="primary"
                icon="Save"
                isLoading={updateNota.isPending}
              >
                Salvar alterações
              </ButtonCustom>
            </div>
          </ModalFooter>
        </form>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
