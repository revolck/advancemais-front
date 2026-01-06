"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { createEstagio } from "@/api/cursos";
import { lookupCep, normalizeCep, isValidCep } from "@/lib/cep";
import { useCursosForSelect } from "../../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../../lista-alunos/hooks/useTurmaOptions";
import { useInscricoesForTurmaSelect } from "../hooks/useInscricoesForTurmaSelect";

interface CreateEstagioModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCursoId?: string | null;
  defaultTurmaId?: string | null;
  onSuccess?: () => void;
}

type FormErrors = Partial<Record<
  | "cursoId"
  | "turmaId"
  | "inscricaoId"
  | "empresaNome"
  | "empresaTelefone"
  | "cep"
  | "rua"
  | "numero"
  | "periodo"
  | "horarioInicio"
  | "horarioFim",
  string
>>;

function toIsoDateLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export function CreateEstagioModal({
  isOpen,
  onClose,
  defaultCursoId = null,
  defaultTurmaId = null,
  onSuccess,
}: CreateEstagioModalProps) {
  const cursosQuery = useCursosForSelect();
  const [cursoId, setCursoId] = useState<string | null>(defaultCursoId);
  const turmasQuery = useTurmaOptions(cursoId);
  const [turmaId, setTurmaId] = useState<string | null>(defaultTurmaId);

  const inscricoesQuery = useInscricoesForTurmaSelect({ cursoId, turmaId });
  const [inscricaoId, setInscricaoId] = useState<string | null>(null);

  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaTelefone, setEmpresaTelefone] = useState("");

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [isCepLoading, setIsCepLoading] = useState(false);

  const [periodo, setPeriodo] = useState<DateRange>({ from: null, to: null });
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCursoId(defaultCursoId);
    setTurmaId(defaultTurmaId);
    setInscricaoId(null);
    setEmpresaNome("");
    setEmpresaTelefone("");
    setCep("");
    setRua("");
    setNumero("");
    setPeriodo({ from: null, to: null });
    setHorarioInicio("");
    setHorarioFim("");
    setErrors({});
    setIsCepLoading(false);
  }, [defaultCursoId, defaultTurmaId, isOpen]);

  useEffect(() => {
    if (!cursoId) {
      setTurmaId(null);
      setInscricaoId(null);
    }
  }, [cursoId]);

  useEffect(() => {
    if (!turmaId) setInscricaoId(null);
  }, [turmaId]);

  const cursosOptions = useMemo(
    () => cursosQuery.cursos ?? [],
    [cursosQuery.cursos]
  );
  const turmasOptions = useMemo(
    () => turmasQuery.turmas ?? [],
    [turmasQuery.turmas]
  );
  const inscricoesOptions = useMemo(
    () => inscricoesQuery.inscricoes ?? [],
    [inscricoesQuery.inscricoes]
  );

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!cursoId) next.cursoId = "Selecione um curso";
    if (!turmaId) next.turmaId = "Selecione uma turma";
    if (!inscricaoId) next.inscricaoId = "Selecione um aluno";

    if (!empresaNome.trim()) next.empresaNome = "Informe o nome da empresa";
    if (!empresaTelefone.trim())
      next.empresaTelefone = "Informe o telefone da empresa";

    if (!cep.trim()) next.cep = "Informe o CEP";
    if (cep.trim() && !isValidCep(cep)) next.cep = "CEP inválido";
    if (!rua.trim()) next.rua = "Informe a rua";
    if (!numero.trim()) next.numero = "Informe o número";

    if (!periodo.from || !periodo.to)
      next.periodo = "Selecione o período do estágio";

    if (!horarioInicio.trim()) next.horarioInicio = "Informe o horário de início";
    if (horarioInicio.trim() && !isValidTime(horarioInicio))
      next.horarioInicio = "Horário inválido (HH:mm)";
    if (!horarioFim.trim()) next.horarioFim = "Informe o horário de fim";
    if (horarioFim.trim() && !isValidTime(horarioFim))
      next.horarioFim = "Horário inválido (HH:mm)";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  const handleCepChange = async (rawValue: string) => {
    const normalized = normalizeCep(rawValue);
    setCep(normalized);
    setErrors((prev) => ({ ...prev, cep: undefined }));

    const digits = normalized.replace(/\D/g, "");
    if (digits.length !== 8 || isCepLoading) return;

    setIsCepLoading(true);
    try {
      const result = await lookupCep(normalized);
      if ("error" in result) {
        toastCustom.error({
          title: "Não foi possível buscar o CEP",
          description: result.error,
        });
        return;
      }
      if (!rua.trim() && result.street) setRua(result.street);
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!cursoId || !turmaId || !inscricaoId) return;
    if (!periodo.from || !periodo.to) return;

    setIsSaving(true);
    try {
      await createEstagio(cursoId, turmaId, inscricaoId, {
        empresaNome: empresaNome.trim(),
        empresaTelefone: empresaTelefone.trim(),
        cep: cep.replace(/\D/g, ""),
        rua: rua.trim(),
        numero: numero.trim(),
        dataInicioPrevista: toIsoDateLocal(periodo.from),
        dataFimPrevista: toIsoDateLocal(periodo.to),
        horarioInicio: horarioInicio.trim(),
        horarioFim: horarioFim.trim(),
      });

      toastCustom.success({
        title: "Estágio cadastrado",
        description: "As informações do estágio foram salvas com sucesso.",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message =
        error?.message || "Não foi possível cadastrar o estágio. Tente novamente.";
      toastCustom.error({
        title: "Erro ao cadastrar estágio",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalCustom
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <ModalContentWrapper className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Cadastrar estágio</ModalTitle>
        </ModalHeader>

        <ModalBody className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectCustom
                label="Curso"
                options={cursosOptions}
                value={cursoId}
                onChange={(value) => {
                  setCursoId(value || null);
                  setErrors((prev) => ({ ...prev, cursoId: undefined }));
                }}
                placeholder={cursosQuery.isLoading ? "Carregando..." : "Selecionar"}
                disabled={cursosQuery.isLoading}
                error={errors.cursoId}
                fullWidth
              />

              <SelectCustom
                label="Turma"
                options={turmasOptions}
                value={turmaId}
                onChange={(value) => {
                  setTurmaId(value || null);
                  setErrors((prev) => ({ ...prev, turmaId: undefined }));
                }}
                placeholder={
                  !cursoId
                    ? "Selecione um curso"
                    : turmasQuery.isLoading
                    ? "Carregando..."
                    : "Selecionar"
                }
                disabled={!cursoId || turmasQuery.isLoading}
                error={errors.turmaId}
                fullWidth
              />

              <SelectCustom
                label="Aluno"
                options={inscricoesOptions}
                value={inscricaoId}
                onChange={(value) => {
                  setInscricaoId(value || null);
                  setErrors((prev) => ({ ...prev, inscricaoId: undefined }));
                }}
                placeholder={
                  !turmaId
                    ? "Selecione uma turma"
                    : inscricoesQuery.isLoading || inscricoesQuery.isFetching
                    ? "Carregando..."
                    : inscricoesOptions.length === 0
                    ? "Nenhum aluno encontrado"
                    : "Selecionar"
                }
                disabled={
                  !turmaId || inscricoesQuery.isLoading || inscricoesQuery.isFetching
                }
                error={errors.inscricaoId}
                fullWidth
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
              <div className="text-sm font-semibold text-gray-900">Empresa</div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputCustom
                  label="Nome da empresa"
                  value={empresaNome}
                  onChange={(e) => {
                    setEmpresaNome((e.target as HTMLInputElement).value);
                    setErrors((prev) => ({ ...prev, empresaNome: undefined }));
                  }}
                  error={errors.empresaNome}
                  size="sm"
                />
                <InputCustom
                  label="Telefone da empresa"
                  value={empresaTelefone}
                  onChange={(e) => {
                    setEmpresaTelefone((e.target as HTMLInputElement).value);
                    setErrors((prev) => ({ ...prev, empresaTelefone: undefined }));
                  }}
                  mask="phone"
                  error={errors.empresaTelefone}
                  size="sm"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
              <div className="text-sm font-semibold text-gray-900">Local do estágio</div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputCustom
                  label="CEP"
                  value={cep}
                  onChange={(e) => handleCepChange((e.target as HTMLInputElement).value)}
                  mask="cep"
                  maxLength={9}
                  rightIcon={isCepLoading ? "Loader2" : undefined}
                  disabled={isSaving || isCepLoading}
                  error={errors.cep}
                  size="sm"
                />
                <InputCustom
                  label="Número"
                  value={numero}
                  onChange={(e) => {
                    setNumero((e.target as HTMLInputElement).value);
                    setErrors((prev) => ({ ...prev, numero: undefined }));
                  }}
                  disabled={isSaving}
                  error={errors.numero}
                  size="sm"
                />
              </div>
              <div className="mt-4">
                <InputCustom
                  label="Rua"
                  value={rua}
                  onChange={(e) => {
                    setRua((e.target as HTMLInputElement).value);
                    setErrors((prev) => ({ ...prev, rua: undefined }));
                  }}
                  disabled={isSaving}
                  error={errors.rua}
                  size="sm"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
              <div className="text-sm font-semibold text-gray-900">Quando vai acontecer</div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <DatePickerRangeCustom
                    label="Período do estágio"
                    required
                    value={periodo}
                    onChange={(range) => {
                      setPeriodo(range);
                      setErrors((prev) => ({ ...prev, periodo: undefined }));
                    }}
                    placeholder="Selecionar período"
                    size="md"
                    clearable
                    error={errors.periodo}
                  />
                </div>
                <InputCustom
                  label="Horário início"
                  value={horarioInicio}
                  onChange={(e) => {
                    setHorarioInicio((e.target as HTMLInputElement).value);
                    setErrors((prev) => ({ ...prev, horarioInicio: undefined }));
                  }}
                  mask="time"
                  maxLength={5}
                  placeholder="08:00"
                  error={errors.horarioInicio}
                  size="sm"
                />
                <InputCustom
                  label="Horário fim"
                  value={horarioFim}
                  onChange={(e) => {
                    setHorarioFim((e.target as HTMLInputElement).value);
                    setErrors((prev) => ({ ...prev, horarioFim: undefined }));
                  }}
                  mask="time"
                  maxLength={5}
                  placeholder="12:00"
                  error={errors.horarioFim}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <ButtonCustom variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Cadastrar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

