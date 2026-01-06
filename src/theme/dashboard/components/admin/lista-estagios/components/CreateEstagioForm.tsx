"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase } from "lucide-react";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { cn } from "@/lib/utils";
import { createEstagio } from "@/api/cursos";
import { lookupCep, normalizeCep, isValidCep } from "@/lib/cep";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import { MaskService } from "@/services";
import { useCursosForSelect } from "../../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../../lista-alunos/hooks/useTurmaOptions";
import { useInscricoesForTurmaSelect } from "../hooks/useInscricoesForTurmaSelect";
import { useEmpresasForSelect } from "../hooks/useEmpresasForSelect";

export interface CreateEstagioFormProps {
  defaultCursoId?: string | null;
  defaultTurmaId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

type FormErrors = Partial<Record<
  | "cursoId"
  | "turmaId"
  | "inscricaoId"
  | "empresaId"
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
  return /^([01]\\d|2[0-3]):[0-5]\\d$/.test(value.trim());
}

type EmpresaCadastroMode = "SIM" | "NAO";

export function CreateEstagioForm({
  defaultCursoId = null,
  defaultTurmaId = null,
  onSuccess,
  onCancel,
  className,
}: CreateEstagioFormProps) {
  const maskService = useMemo(() => MaskService.getInstance(), []);
  const cepLookupTimeoutRef = useRef<number | null>(null);
  const lastCepLookupRef = useRef<string>("");

  const cursosQuery = useCursosForSelect();
  const [cursoId, setCursoId] = useState<string | null>(defaultCursoId);
  const turmasQuery = useTurmaOptions(cursoId);
  const [turmaId, setTurmaId] = useState<string | null>(defaultTurmaId);

  const inscricoesQuery = useInscricoesForTurmaSelect({ cursoId, turmaId });
  const [inscricaoId, setInscricaoId] = useState<string | null>(null);

  const [empresaNaBase, setEmpresaNaBase] = useState<EmpresaCadastroMode>("SIM");
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const empresasQuery = useEmpresasForSelect(empresaNaBase === "SIM");

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
    setCursoId(defaultCursoId);
    setTurmaId(defaultTurmaId);
    setInscricaoId(null);
    setEmpresaNaBase("SIM");
    setEmpresaId(null);
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
  }, [defaultCursoId, defaultTurmaId]);

  useEffect(() => {
    if (!cursoId) {
      setTurmaId(null);
      setInscricaoId(null);
    }
  }, [cursoId]);

  useEffect(() => {
    if (!turmaId) setInscricaoId(null);
  }, [turmaId]);

  const selectedEmpresa = useMemo(() => {
    if (empresaNaBase !== "SIM" || !empresaId) return null;
    return empresasQuery.empresasData.find((e) => e.id === empresaId) ?? null;
  }, [empresaId, empresaNaBase, empresasQuery.empresasData]);

  useEffect(() => {
    if (empresaNaBase !== "SIM") return;
    if (!selectedEmpresa) return;

    setEmpresaNome(selectedEmpresa.nome ?? "");
    const telefone =
      selectedEmpresa.telefone || selectedEmpresa.informacoes?.telefone || "";
    setEmpresaTelefone(maskService.processInput(telefone, "phone"));

    const endereco = selectedEmpresa.enderecos?.[0];
    if (endereco) {
      if (endereco.cep) setCep(normalizeCep(endereco.cep));
      if (endereco.logradouro) setRua(endereco.logradouro);
      if (endereco.numero) setNumero(endereco.numero);
    }
  }, [empresaNaBase, maskService, selectedEmpresa]);

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

    if (empresaNaBase === "SIM" && !empresaId) {
      next.empresaId = "Selecione uma empresa";
    }

    if (empresaNaBase === "NAO") {
      if (!empresaNome.trim()) next.empresaNome = "Informe o nome da empresa";
    }

    if (!empresaTelefone.trim()) next.empresaTelefone = "Informe o telefone";

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

  const handleCepChange = async (rawValue: string) => {
    const normalized = normalizeCep(rawValue);
    setCep(normalized);
    setErrors((prev) => ({ ...prev, cep: undefined }));

    const digits = normalized.replace(/\D/g, "");
    if (digits.length !== 8) return;

    if (cepLookupTimeoutRef.current) {
      window.clearTimeout(cepLookupTimeoutRef.current);
    }

    cepLookupTimeoutRef.current = window.setTimeout(async () => {
      if (isCepLoading) return;
      if (lastCepLookupRef.current === digits) return;
      lastCepLookupRef.current = digits;

      setIsCepLoading(true);
      try {
        const result = await lookupCep(digits);
        if ("error" in result) {
          setErrors((prev) => ({ ...prev, cep: result.error }));
          return;
        }
        setErrors((prev) => ({ ...prev, cep: undefined }));
        if (!rua.trim() && result.street) setRua(result.street);
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toastCustom.error({
          title: "Erro ao buscar CEP",
          description: "Não foi possível consultar o CEP. Tente novamente.",
        });
      } finally {
        setIsCepLoading(false);
      }
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!cursoId || !turmaId || !inscricaoId) return;
    if (!periodo.from || !periodo.to) return;

    const resolvedEmpresaNome =
      empresaNaBase === "SIM"
        ? (selectedEmpresa?.nome ?? empresaNome).trim()
        : empresaNome.trim();

    if (!resolvedEmpresaNome) {
      setErrors((prev) => ({
        ...prev,
        empresaNome:
          empresaNaBase === "NAO" ? "Informe o nome da empresa" : undefined,
        empresaId:
          empresaNaBase === "SIM"
            ? prev.empresaId ?? "Selecione uma empresa"
            : undefined,
      }));
      return;
    }

    setIsSaving(true);
    try {
      await createEstagio(cursoId, turmaId, inscricaoId, {
        empresaNome: resolvedEmpresaNome,
        empresaTelefone: empresaTelefone.replace(/\D/g, "").trim(),
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
    <div className={cn("bg-white rounded-3xl p-6 relative", className)}>
      <FormLoadingModal
        isLoading={isSaving}
        title="Cadastrando estágio..."
        loadingStep="Salvando informações"
        icon={Briefcase}
      />

	      <form onSubmit={handleSubmit} className="space-y-6">
	        <fieldset disabled={isSaving} className="space-y-6">
	          <div className="space-y-4">
	            <div className="flex flex-col md:flex-row gap-4 w-full">
	              <div className="flex-[0.4] min-w-0">
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
                  required
	                />
	              </div>

              <div className="flex-[0.3] min-w-0">
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
                  required
                />
              </div>

	              <div className="flex-[0.3] min-w-0">
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
                    !turmaId ||
                    inscricoesQuery.isLoading ||
                    inscricoesQuery.isFetching
                  }
                  error={errors.inscricaoId}
                  required
	                />
	              </div>
	            </div>

		            <div className="flex flex-col md:flex-row gap-4 w-full">
		              <div className="flex-[0.25] min-w-0">
		                <SelectCustom
		                  label="Empresa já cadastrada?"
		                  options={[
		                    { value: "SIM", label: "Sim" },
		                    { value: "NAO", label: "Não" },
		                  ]}
		                  value={empresaNaBase}
		                  onChange={(value) => {
		                    const next = (value as EmpresaCadastroMode) || "SIM";
		                    setEmpresaNaBase(next);
		                    setEmpresaId(null);
		                    setEmpresaNome("");
		                    setEmpresaTelefone("");
		                    setCep("");
		                    setRua("");
		                    setNumero("");
		                      setErrors((prev) => ({
		                        ...prev,
		                        empresaId: undefined,
		                        empresaNome: undefined,
		                        empresaTelefone: undefined,
		                        cep: undefined,
		                        rua: undefined,
		                        numero: undefined,
		                      }));
		                    }}
		                    required
		                  />
		                </div>

		                {empresaNaBase === "SIM" ? (
		                  <div className="flex-[0.35] min-w-0">
		                    <SelectCustom
		                      label="Empresa"
		                      options={empresasQuery.empresas}
		                      value={empresaId}
		                      onChange={(value) => {
		                        setEmpresaId(value || null);
		                        setErrors((prev) => ({ ...prev, empresaId: undefined }));
		                      }}
		                      placeholder={
		                        empresasQuery.isLoading
		                          ? "Carregando..."
		                          : empresasQuery.error
		                          ? "Não foi possível listar empresas"
		                          : "Selecionar"
		                      }
		                      disabled={
		                        empresasQuery.isLoading || Boolean(empresasQuery.error)
		                      }
		                      error={errors.empresaId}
		                      required
		                    />
		                  </div>
		                ) : (
		                  <div className="flex-[0.35] min-w-0">
		                    <InputCustom
		                      label="Nome da empresa"
		                      value={empresaNome}
		                      onChange={(e) => {
		                        setEmpresaNome((e.target as HTMLInputElement).value);
		                        setErrors((prev) => ({
		                          ...prev,
		                          empresaNome: undefined,
		                        }));
		                      }}
		                      error={errors.empresaNome}
		                      required
		                    />
		                  </div>
		                )}

                    <div className="flex-[0.2] min-w-0">
                      <InputCustom
                        label="Telefone"
                        value={empresaTelefone}
                        onChange={(e) => {
                          setEmpresaTelefone((e.target as HTMLInputElement).value);
                          setErrors((prev) => ({
                            ...prev,
                            empresaTelefone: undefined,
                          }));
                        }}
                        mask="phone"
                        error={errors.empresaTelefone}
                        required
                      />
                    </div>

                    <div className="flex-[0.2] min-w-0">
                      <InputCustom
                        label="CEP"
                        value={cep}
                        onChange={(e) =>
                          handleCepChange((e.target as HTMLInputElement).value)
                        }
                        mask="cep"
                        maxLength={9}
                        rightIcon={isCepLoading ? "Loader2" : undefined}
                        disabled={isSaving || isCepLoading}
                        error={errors.cep}
                        required
                      />
                    </div>
		            </div>

	            {empresaNaBase === "SIM" && empresasQuery.error ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Não foi possível listar empresas da base. Selecione “Não” e
                cadastre a empresa manualmente.
              </div>
            ) : null}

              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-[0.14] min-w-0">
                  <InputCustom
                    label="Número"
                    value={numero}
                    onChange={(e) => {
                      setNumero((e.target as HTMLInputElement).value);
                      setErrors((prev) => ({ ...prev, numero: undefined }));
                    }}
                    disabled={isSaving}
                    error={errors.numero}
                    required
                  />
                </div>

                <div className="flex-[0.26] min-w-0">
                  <InputCustom
                    label="Rua"
                    value={rua}
                    onChange={(e) => {
                      setRua((e.target as HTMLInputElement).value);
                      setErrors((prev) => ({ ...prev, rua: undefined }));
                    }}
                    disabled={isSaving}
                    error={errors.rua}
                    required
                  />
                </div>

                <div className="flex-[0.32] min-w-0">
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
                <div className="flex-[0.14] min-w-0">
                  <InputCustom
                    label="Horário início"
                    value={horarioInicio}
                    onChange={(e) => {
                      setHorarioInicio((e.target as HTMLInputElement).value);
                      setErrors((prev) => ({
                        ...prev,
                        horarioInicio: undefined,
                      }));
                    }}
                    mask="time"
                    maxLength={5}
                    placeholder="08:00"
                    error={errors.horarioInicio}
                    required
                  />
                </div>
                <div className="flex-[0.14] min-w-0">
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
                    required
                  />
                </div>
              </div>
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <ButtonCustom
            type="button"
            variant="outline"
            onClick={() => onCancel?.()}
            disabled={isSaving}
            size="md"
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
          >
            Cadastrar
          </ButtonCustom>
        </div>
      </form>
    </div>
  );
}
