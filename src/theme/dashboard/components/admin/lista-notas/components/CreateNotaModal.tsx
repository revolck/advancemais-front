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
import { useNotasAtuaisPorAluno } from "../hooks/useNotasAtuaisPorAluno";
import {
  useProvasForSelect,
  type ProvaTipo,
} from "../hooks/useProvasForSelect";
import { useUpdateNotaMutation } from "../hooks/useUpdateNotaMutation";
import { type NotaOrigemTipo } from "@/api/cursos";

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
  if (numValue === Infinity) return String(max);

  if (Number.isFinite(numValue) && numValue >= 0 && numValue <= max) {
    return value;
  }
  if (Number.isFinite(numValue) && numValue > max) {
    return String(max);
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

function formatNotaValue(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 2,
  });
}

type NotaApiErrorLike = {
  message?: string;
  status?: number;
  code?: string;
  details?: Array<{ message?: string }>;
  data?: {
    notaAtual?: number;
    maximoPermitido?: number;
    disponivelParaAdicionar?: number;
  };
};

function getCreateNotaErrorMessage(error: unknown): string {
  const err = error as NotaApiErrorLike;

  const backendDetail = err.details?.[0]?.message;
  if (backendDetail) return backendDetail;
  if (err.code === "NOTA_MAXIMA_ATINGIDA") {
    const notaAtual = err.data?.notaAtual;
    return (
      err.message ||
      `Este aluno já atingiu a nota máxima permitida (atual: ${formatNotaValue(notaAtual ?? 10)}).`
    );
  }
  if (err.code === "NOTA_EXCEDE_LIMITE") {
    const disponivel = err.data?.disponivelParaAdicionar;
    const notaAtual = err.data?.notaAtual;
    const maximo = err.data?.maximoPermitido;
    if (
      Number.isFinite(disponivel) &&
      Number.isFinite(notaAtual) &&
      Number.isFinite(maximo)
    ) {
      return `A nota excede o limite permitido. Nota atual: ${formatNotaValue(notaAtual ?? 0)} • máximo: ${formatNotaValue(maximo ?? 10)} • disponível para adicionar: ${formatNotaValue(disponivel ?? 0)}.`;
    }
    if (Number.isFinite(disponivel)) {
      return `A nota excede o limite permitido. Disponível para adicionar: ${formatNotaValue(disponivel ?? 0)}.`;
    }
    return err.message || "A nota excede o limite permitido para este aluno.";
  }
  if (err.message) return err.message;

  if (err.status === 400)
    return "Dados inválidos. Revise os campos obrigatórios.";
  if (err.status === 401) return "Sessão expirada. Faça login novamente.";
  if (err.status === 403) return "Você não tem permissão para lançar notas.";
  if (err.status === 404)
    return "Origem ou inscrição não encontrada para o curso/turma.";
  if (err.status === 409 || err.code === "NOTA_SYSTEM_LOCKED") {
    return "Não é possível alterar/remover notas geradas automaticamente pelo sistema.";
  }

  return "Não foi possível adicionar a nota.";
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
  const notasAtuaisQuery = useNotasAtuaisPorAluno({ cursoId, turmaId });
  const notaAtualAluno = alunoId
    ? notasAtuaisQuery.notaByAlunoId[alunoId] ?? 0
    : 0;
  const maxAllowed = Math.max(
    0,
    Math.round((10 - Math.max(0, notaAtualAluno)) * 100) / 100,
  );
  const alunosOptions: SelectOption[] = useMemo(
    () => alunosQuery.alunos,
    [alunosQuery.alunos],
  );

  const origemTipoOptions: SelectOption[] = useMemo(
    () => [
      { value: "PROVA", label: "Prova" },
      { value: "ATIVIDADE", label: "Atividade" },
      { value: "AULA", label: "Aula" },
      { value: "OUTRO", label: "Outro" },
    ],
    [],
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
    else if (alunoId && notaAtualAluno >= 10)
      next.nota = "Este aluno já possui nota final 10.";
    else if (notaParsed !== null && notaParsed > maxAllowed + 1e-9)
      next.nota = `Disponível para adicionar: ${formatNotaValue(maxAllowed)}.`;

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
    notaAtualAluno,
    motivo,
    notaInput,
    origemId,
    origemTipo,
    origemOutroTitulo,
    turmaId,
  ]);

  const isLoadingOrigem =
    (origemTipo === "AULA" && aulasQuery.isFetching) ||
    ((origemTipo === "PROVA" || origemTipo === "ATIVIDADE") &&
      provasQuery.isFetching);

  const notaParsedForSubmit = parseNota(notaInput);
  const hasOrigemSelecionada =
    origemTipo === "OUTRO"
      ? origemOutroTitulo.trim().length >= 3
      : Boolean(origemId);
  const isSubmitDisabled =
    upsertNota.isPending ||
    notasAtuaisQuery.isLoading ||
    !cursoId ||
    !turmaId ||
    !alunoId ||
    !origemTipo ||
    !hasOrigemSelecionada ||
    maxAllowed <= 0 ||
    notaParsedForSubmit === "invalid" ||
    !motivo.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const notaParsed = parseNota(notaInput);
    if (notaParsed === "invalid") return;

    try {
      const origemPayload =
        origemTipo === "OUTRO"
          ? {
              tipo: "OUTRO" as const,
              id: null,
              titulo: origemOutroTitulo.trim(),
            }
          : {
              tipo: origemTipo as NotaOrigemTipo,
              id: origemId as string,
            };

      await upsertNota.mutateAsync({
        cursoId: cursoId as string,
        turmaId: turmaId as string,
        alunoId: (alunoId as string).trim(),
        nota: notaParsed,
        motivo: motivo.trim(),
        origem: origemPayload,
      });

      toastCustom.success({
        title: "Nota adicionada",
        description: "A nota foi adicionada com sucesso.",
      });
      onClose();
      resetForm();
    } catch (err) {
      const apiError = err as NotaApiErrorLike;
      if (apiError.code === "NOTA_MAXIMA_ATINGIDA") {
        setErrors((prev) => ({
          ...prev,
          nota: "Este aluno já atingiu nota final 10.",
        }));
      } else if (apiError.code === "NOTA_EXCEDE_LIMITE") {
        const disponivel = apiError.data?.disponivelParaAdicionar;
        setErrors((prev) => ({
          ...prev,
          nota:
            typeof disponivel === "number"
              ? `Disponível para adicionar: ${formatNotaValue(disponivel)}.`
              : "A nota excede o limite permitido para este aluno.",
        }));
      } else if (apiError.code === "NOTA_SYSTEM_LOCKED") {
        setErrors((prev) => ({
          ...prev,
          nota: "Notas automáticas do sistema não podem ser alteradas/removidas.",
        }));
      }
      const msg = getCreateNotaErrorMessage(err);
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
              required
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
              required
              searchThreshold={0}
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
                required
                searchThreshold={0}
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
                required
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
                  required
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
                    searchThreshold={0}
                    required
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
                required
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
                  !alunoId
                    ? undefined
                    : notasAtuaisQuery.isLoading
                    ? "Carregando nota atual do aluno..."
                    : maxAllowed <= 0
                    ? "Aluno já possui nota final 10. Não é possível adicionar."
                    : `Nota atual: ${formatNotaValue(notaAtualAluno)} • disponível para adicionar: ${formatNotaValue(maxAllowed)}`
                }
                disabled={
                  !alunoId ||
                  !origemTipo ||
                  notasAtuaisQuery.isLoading ||
                  maxAllowed <= 0
                }
              />
            </div>

            <div>
              <SimpleTextarea
                label="Motivo da nota"
                value={motivo}
                required
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
                disabled={isSubmitDisabled}
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
