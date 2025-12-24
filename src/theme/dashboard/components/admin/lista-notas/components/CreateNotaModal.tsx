"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import {
  ButtonCustom,
  InputCustom,
  SelectCustom,
  toastCustom,
} from "@/components/ui/custom";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { useCursosForSelect } from "../hooks/useCursosForSelect";
import { useTurmasForSelect } from "../hooks/useTurmasForSelect";
import { useAlunosForTurmaSelect } from "../hooks/useAlunosForTurmaSelect";
import { useAulasForSelect } from "../hooks/useAulasForSelect";
import {
  useProvasForSelect,
  type ProvaTipo,
} from "../hooks/useProvasForSelect";
import { useUpdateNotaMutation } from "../hooks/useUpdateNotaMutation";
import {
  getNotasStoreSnapshot,
  getNotaForEnrollmentFromStore,
  type NotaOrigemTipo,
} from "@/mockData/notas";

interface CreateNotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCursoId?: string | null;
  defaultTurmaId?: string | null;
}

interface FormErrors {
  cursoId?: string;
  turmaId?: string;
  alunoId?: string;
  nota?: string;
  motivo?: string;
  origemTipo?: string;
  origemId?: string;
}

function formatMax(max: number): string {
  const rounded = Math.round(max * 100) / 100;
  if (!Number.isFinite(rounded)) return "0";
  if (Number.isInteger(rounded)) return String(rounded);
  const s = String(rounded);
  return s.replace(/0+$/, "").replace(/\.$/, "");
}

function sanitizeDecimal0toMax(raw: string, max: number): string {
  // Permite vazio
  if (raw === "") return "";

  // Remove caracteres não numéricos exceto ponto
  let value = raw.replace(/[^0-9.]/g, "");

  // Mantém apenas o primeiro ponto
  const firstDotIndex = value.indexOf(".");
  if (firstDotIndex !== -1) {
    value =
      value.substring(0, firstDotIndex + 1) +
      value.substring(firstDotIndex + 1).replace(/\./g, "");
  }

  // Limita a 2 casas decimais
  const parts = value.split(".");
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + "." + parts[1].substring(0, 2);
  }

  const numValue = Number(value);
  if (numValue === Infinity) return formatMax(max);

  if (Number.isFinite(numValue) && numValue >= 0 && numValue <= max) {
    return value;
  }
  if (Number.isFinite(numValue) && numValue > max) {
    return formatMax(max);
  }
  // Se não for parseável ainda (ex: "."), mantém como está
  return value;
}

function parseNota(value: string): number | null | "invalid" {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "invalid";
  const normalized = trimmed.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n)) return "invalid";
  if (n < 0 || n > 10) return "invalid";
  return Math.round(n * 100) / 100;
}

export function CreateNotaModal({
  isOpen,
  onClose,
  defaultCursoId = null,
  defaultTurmaId = null,
}: CreateNotaModalProps) {
  const [cursoId, setCursoId] = useState<string | null>(defaultCursoId);
  const [turmaId, setTurmaId] = useState<string | null>(defaultTurmaId);
  const [alunoId, setAlunoId] = useState<string | null>(null);

  const [origemTipo, setOrigemTipo] = useState<NotaOrigemTipo | "">("");
  const [origemId, setOrigemId] = useState<string | null>(null);
  const [origemOutroTitulo, setOrigemOutroTitulo] = useState("");

  const [notaInput, setNotaInput] = useState("");
  const [notaInputInstanceKey, setNotaInputInstanceKey] = useState(0);
  const [motivo, setMotivo] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const upsertNota = useUpdateNotaMutation();

  const cursosQuery = useCursosForSelect();
  const turmasQuery = useTurmasForSelect(cursoId);
  const alunosQuery = useAlunosForTurmaSelect({ cursoId, turmaId });

  const alunoRemainingById = useMemo(() => {
    const map = new Map<string, number>();
    if (!cursoId || !turmaId || !isOpen) return map;

    const overrideStore = getNotasStoreSnapshot();
    alunosQuery.alunos.forEach((opt) => {
      const info = getNotaForEnrollmentFromStore(overrideStore, {
        cursoId,
        turmaId,
        alunoId: opt.value,
      });
      const currentFinal = info.nota ?? 0;
      const remaining = Math.max(
        0,
        Math.round((10 - currentFinal) * 100) / 100
      );
      map.set(opt.value, remaining);
    });
    return map;
  }, [alunosQuery.alunos, cursoId, turmaId, isOpen]);

  const selectedRemaining = useMemo(() => {
    if (!alunoId) return null;
    return alunoRemainingById.get(alunoId) ?? null;
  }, [alunoId, alunoRemainingById]);

  const maxAllowed = useMemo(() => {
    if (!alunoId) return 10;
    const remaining = selectedRemaining ?? 10;
    return Math.max(0, Math.min(10, remaining));
  }, [alunoId, selectedRemaining]);

  const alunosOptions: SelectOption[] = useMemo(() => {
    if (!cursoId || !turmaId) return alunosQuery.alunos;
    return alunosQuery.alunos.map((opt) => {
      const remaining = alunoRemainingById.get(opt.value);
      if (remaining !== undefined && remaining <= 0) {
        return {
          ...opt,
          disabled: true,
          label: `${opt.label} — Nota final`,
        };
      }
      return opt;
    });
  }, [alunoRemainingById, alunosQuery.alunos, cursoId, turmaId]);

  const origemTipoOptions: SelectOption[] = useMemo(
    () => [
      { value: "PROVA", label: "Prova" },
      { value: "ATIVIDADE", label: "Atividade" },
      { value: "AULA", label: "Aula" },
      { value: "OUTRO", label: "Outro" },
    ],
    []
  );

  const provasQuery = useProvasForSelect({
    cursoId,
    turmaId,
    tipo:
      origemTipo === "PROVA" || origemTipo === "ATIVIDADE"
        ? (origemTipo as ProvaTipo)
        : null,
  });
  const aulasQuery = useAulasForSelect({
    turmaId: origemTipo === "AULA" ? turmaId : null,
  });

  const origemOptions = useMemo(() => {
    if (origemTipo === "AULA") return aulasQuery.options;
    if (origemTipo === "PROVA" || origemTipo === "ATIVIDADE")
      return provasQuery.options;
    return [];
  }, [aulasQuery.options, origemTipo, provasQuery.options]);

  const origemLabel = useMemo(() => {
    if (!origemId) return null;
    if (origemTipo === "AULA")
      return aulasQuery.labelById.get(origemId) ?? null;
    if (origemTipo === "PROVA" || origemTipo === "ATIVIDADE") {
      return provasQuery.labelById.get(origemId) ?? null;
    }
    return null;
  }, [aulasQuery.labelById, origemId, origemTipo, provasQuery.labelById]);

  useEffect(() => {
    if (!isOpen) return;
    setCursoId(defaultCursoId);
    setTurmaId(defaultTurmaId);
    setAlunoId(null);
    setOrigemTipo("");
    setOrigemId(null);
    setOrigemOutroTitulo("");
    setNotaInput("");
    setNotaInputInstanceKey((k) => k + 1);
    setMotivo("");
    setErrors({});
  }, [defaultCursoId, defaultTurmaId, isOpen]);

  useEffect(() => {
    setOrigemId(null);
    setOrigemOutroTitulo("");
  }, [origemTipo, cursoId, turmaId]);

  const resetForm = useCallback(() => {
    setCursoId(defaultCursoId);
    setTurmaId(defaultTurmaId);
    setAlunoId(null);
    setOrigemTipo("");
    setOrigemId(null);
    setOrigemOutroTitulo("");
    setNotaInput("");
    setNotaInputInstanceKey((k) => k + 1);
    setMotivo("");
    setErrors({});
  }, [defaultCursoId, defaultTurmaId]);

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!cursoId) next.cursoId = "Selecione um curso.";
    if (!turmaId) next.turmaId = "Selecione uma turma.";
    if (!alunoId) next.alunoId = "Selecione um aluno.";

    if (!origemTipo) next.origemTipo = "Selecione o tipo de origem.";

    const notaParsed = parseNota(notaInput);
    if (notaParsed === "invalid")
      next.nota = "Informe uma nota válida entre 0 e 10.";
    else if (alunoId && maxAllowed <= 0)
      next.nota = "Esse aluno já atingiu nota final 10.";
    else if (notaParsed !== null && notaParsed > maxAllowed + 1e-9)
      next.nota = `Disponível para adicionar: ${formatMax(maxAllowed)}.`;

    const motivoTrimmed = motivo.trim();
    if (!motivoTrimmed) next.motivo = "Informe o motivo da nota.";
    else if (motivoTrimmed.length < 3)
      next.motivo = "Informe pelo menos 3 caracteres.";

    if (origemTipo === "OUTRO") {
      const trimmed = origemOutroTitulo.trim();
      if (trimmed.length < 3) {
        next.origemId = "Informe o nome do item.";
      }
    }

    if (
      (origemTipo === "AULA" ||
        origemTipo === "PROVA" ||
        origemTipo === "ATIVIDADE") &&
      origemOptions.length > 0 &&
      !origemId
    ) {
      next.origemId = "Selecione o item de origem.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [
    alunoId,
    cursoId,
    maxAllowed,
    motivo,
    notaInput,
    origemId,
    origemOptions.length,
    origemTipo,
    origemOutroTitulo,
    turmaId,
  ]);

  const isLoadingOrigem =
    (origemTipo === "AULA" && aulasQuery.isFetching) ||
    ((origemTipo === "PROVA" || origemTipo === "ATIVIDADE") &&
      provasQuery.isFetching);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const notaParsed = parseNota(notaInput);
    if (notaParsed === "invalid") return;

    try {
      await upsertNota.mutateAsync({
        cursoId: cursoId as string,
        turmaId: turmaId as string,
        alunoId: (alunoId as string).trim(),
        nota: notaParsed,
        motivo: motivo.trim(),
        origem:
          origemTipo === "OUTRO"
            ? {
                tipo: "OUTRO",
                id: null,
                titulo: origemOutroTitulo.trim()
                  ? origemOutroTitulo.trim()
                  : null,
              }
            : origemTipo && origemId
            ? {
                tipo: origemTipo as NotaOrigemTipo,
                id: origemId,
                titulo: origemLabel,
              }
            : origemTipo
            ? {
                tipo: origemTipo as NotaOrigemTipo,
                id: null,
                titulo: null,
              }
            : undefined,
      });

      toastCustom.success({
        title: "Nota adicionada",
        description: "A nota foi adicionada com sucesso.",
      });
      onClose();
      resetForm();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível adicionar a nota.";
      toastCustom.error({ title: "Erro ao salvar nota", description: msg });
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetForm();
      }}
      size="3xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <ModalTitle>Adicionar nota</ModalTitle>
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-5">
            <SelectCustom
              label="Curso"
              options={cursosQuery.cursos}
              value={cursoId}
              onChange={(v) => {
                setCursoId(v);
                setTurmaId(null);
                setAlunoId(null);
                setOrigemTipo("");
                setOrigemId(null);
                setNotaInput("");
                setNotaInputInstanceKey((k) => k + 1);
                setMotivo("");
                setErrors((prev) => ({ ...prev, cursoId: undefined }));
              }}
              placeholder={
                cursosQuery.isLoading ? "Carregando..." : "Selecionar"
              }
              disabled={
                cursosQuery.isLoading || cursosQuery.cursos.length === 0
              }
              error={errors.cursoId}
              searchable
            />

            <SelectCustom
              label="Turma"
              options={turmasQuery.turmas}
              value={turmaId}
              onChange={(v) => {
                setTurmaId(v);
                setAlunoId(null);
                setOrigemTipo("");
                setOrigemId(null);
                setNotaInput("");
                setNotaInputInstanceKey((k) => k + 1);
                setMotivo("");
                setErrors((prev) => ({ ...prev, turmaId: undefined }));
              }}
              placeholder={
                !cursoId
                  ? "Selecione um curso"
                  : turmasQuery.isLoading
                  ? "Carregando..."
                  : "Selecionar"
              }
              disabled={
                !cursoId ||
                turmasQuery.isLoading ||
                turmasQuery.turmas.length === 0
              }
              error={errors.turmaId}
              searchable
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectCustom
                label="Aluno"
                options={alunosOptions}
                value={alunoId}
                onChange={(v) => {
                  setAlunoId(v);
                  setOrigemTipo("");
                  setOrigemId(null);
                  setOrigemOutroTitulo("");
                  setNotaInput("");
                  setNotaInputInstanceKey((k) => k + 1);
                  setMotivo("");
                  setErrors((prev) => ({ ...prev, alunoId: undefined }));
                }}
                placeholder={
                  !turmaId
                    ? "Selecione uma turma"
                  : alunosQuery.isLoading || alunosQuery.isFetching
                    ? "Carregando..."
                    : "Selecionar"
                }
                disabled={!turmaId || alunosQuery.isLoading}
                error={errors.alunoId}
                searchable
              />
              <SelectCustom
                label="Origem da nota"
                options={origemTipoOptions}
                value={origemTipo || null}
                onChange={(v) => {
                  setOrigemTipo((v as NotaOrigemTipo) || "");
                  setOrigemId(null);
                  setOrigemOutroTitulo("");
                  setNotaInput("");
                  setNotaInputInstanceKey((k) => k + 1);
                  setErrors((prev) => ({ ...prev, origemTipo: undefined }));
                }}
                placeholder={!alunoId ? "Selecione um aluno" : "Selecionar"}
                disabled={!alunoId}
                error={errors.origemTipo}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {origemTipo === "OUTRO" ? (
                <InputCustom
                  label="Nome do item"
                  value={origemOutroTitulo}
                  onChange={(e) => {
                    setOrigemOutroTitulo((e.target as HTMLInputElement).value);
                    setErrors((prev) => ({ ...prev, origemId: undefined }));
                  }}
                  placeholder="Ex: Ajuste manual, recuperação, bônus..."
                  error={errors.origemId}
                  disabled={!alunoId || !origemTipo}
                  maxLength={120}
                />
              ) : (
                <div className="space-y-2">
                  <SelectCustom
                    label={
                      origemTipo
                        ? `Selecionar ${origemTipo.toLowerCase()}`
                        : "Selecionar item"
                    }
                    options={origemOptions}
                    value={origemId}
                    onChange={(v) => {
                      setOrigemId(v);
                      setErrors((prev) => ({ ...prev, origemId: undefined }));
                    }}
                    placeholder={
                      !origemTipo
                        ? "Selecione a origem"
                        : isLoadingOrigem
                        ? "Carregando..."
                        : origemOptions.length === 0
                        ? "Nenhum item encontrado"
                        : "Selecionar"
                    }
                    disabled={
                      !alunoId ||
                      !origemTipo ||
                      isLoadingOrigem ||
                      origemOptions.length === 0
                    }
                    error={errors.origemId}
                    searchable
                  />
                </div>
              )}
              <InputCustom
                key={`nota-${notaInputInstanceKey}`}
                label="Nota (0 a 10)"
                value={notaInput}
                type="text"
                inputMode="decimal"
                maxLength={5}
                onKeyDown={(e) => {
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
                    "Home",
                    "End",
                    ".",
                  ];

                  if (allowedKeys.includes(e.key)) {
                    const input = e.target as HTMLInputElement;
                    const currentValue = input.value ?? "";
                    if (e.key === "." && currentValue.includes(".")) {
                      e.preventDefault();
                    }
                    return;
                  }

                  if (
                    e.ctrlKey &&
                    ["a", "c", "v", "x"].includes(e.key.toLowerCase())
                  ) {
                    return;
                  }

                  if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                    return;
                  }

                  const input = e.target as HTMLInputElement;
                  const selectionStart = input.selectionStart ?? 0;
                  const selectionEnd = input.selectionEnd ?? 0;
                  const currentValue = input.value ?? "";
                  const newValue =
                    currentValue.substring(0, selectionStart) +
                    e.key +
                    currentValue.substring(selectionEnd);

                  const sanitized = sanitizeDecimal0toMax(newValue, maxAllowed);
                  if (sanitized !== newValue) {
                    e.preventDefault();
                    setNotaInput(sanitized);
                    setNotaInputInstanceKey((k) => k + 1);
                  }
                }}
                onChange={(e) => {
                  const raw = (e.target as HTMLInputElement).value;
                  const value = sanitizeDecimal0toMax(raw, maxAllowed);
                  if (value === notaInput && raw !== notaInput) {
                    setNotaInputInstanceKey((k) => k + 1);
                  }
                  setNotaInput(value);
                  setErrors((prev) => ({ ...prev, nota: undefined }));
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData("text");
                  const value = sanitizeDecimal0toMax(pastedText, maxAllowed);
                  setNotaInputInstanceKey((k) => k + 1);
                  setNotaInput(value);
                  setErrors((prev) => ({ ...prev, nota: undefined }));
                }}
                placeholder="Ex: 7.5"
                error={errors.nota}
                helperText={
                  alunoId
                    ? maxAllowed <= 0
                      ? "Esse aluno já atingiu nota final 10."
                      : `Disponível para adicionar: ${formatMax(maxAllowed)}`
                    : undefined
                }
                disabled={!alunoId || !origemTipo || maxAllowed <= 0}
              />
            </div>

            <div>
              <SimpleTextarea
                label="Motivo da nota"
                value={motivo}
                onChange={(e) => {
                  setMotivo((e.target as HTMLTextAreaElement).value);
                  setErrors((prev) => ({ ...prev, motivo: undefined }));
                }}
                placeholder="Ex: Prova de módulo 1, atividade extra, recuperação, presença na aula..."
                error={errors.motivo}
                maxLength={500}
                showCharCount
                disabled={!alunoId || !origemTipo}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <ButtonCustom
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                type="submit"
                variant="primary"
                isLoading={upsertNota.isPending}
                disabled={upsertNota.isPending}
              >
                Salvar nota
              </ButtonCustom>
            </div>
          </ModalFooter>
        </form>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
