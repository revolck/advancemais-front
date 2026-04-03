"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import { AlertCircle, CalendarCheck2 } from "lucide-react";

import { connectGoogle } from "@/api/aulas";
import {
  createCursoAlunoEntrevista,
  getCursoAlunoEntrevistaOpcoes,
  type CursoAlunoCreateEntrevistaPayload,
  type CursoAlunoEntrevistaOpcaoItem,
} from "@/api/cursos";
import type {
  EntrevistaEndereco,
  EntrevistaModalidade,
  EntrevistaOverviewCapabilities,
} from "@/api/entrevistas";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonCustom } from "@/components/ui/custom/button";
import { CheckboxCustom } from "@/components/ui/custom/checkbox";
import {
  DatePickerCustom,
  InputCustom,
  SelectCustom,
  SimpleTextarea,
  TimeInputCustom,
  toastCustom,
} from "@/components/ui/custom";
import type { SelectOption } from "@/components/ui/custom/select";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import {
  BRASIL_ESTADO_OPTIONS,
  fetchCidadesByUf,
  normalizeEstadoUf,
} from "@/lib/brasil-localidades";

type EnderecoFormValues = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pontoReferencia: string;
};

type FormValues = {
  empresaId: string | null;
  candidaturaId: string | null;
  empresaAnonima: boolean;
  modalidade: EntrevistaModalidade | null;
  data: Date | null;
  horaInicio: string;
  horaFim: string;
  descricao: string;
  enderecoPresencial: EnderecoFormValues;
};

type EnderecoFieldKey = keyof EnderecoFormValues;
type FormErrorKey =
  | keyof Omit<FormValues, "enderecoPresencial">
  | `enderecoPresencial.${EnderecoFieldKey}`
  | "submit";
type FormErrors = Partial<Record<FormErrorKey, string>>;
type ApiLikeError = Error & {
  status?: number;
  details?: {
    code?: string;
  };
};

interface MarcarEntrevistaAlunoModalProps {
  alunoId: string;
  alunoNome?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_ENDERECO: EnderecoFormValues = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pontoReferencia: "",
};

const MODALIDADE_OPTIONS = [
  { value: "ONLINE", label: "Online" },
  { value: "PRESENCIAL", label: "Presencial" },
] as const;

const ENDERECO_REQUIRED_FIELDS: Array<keyof EnderecoFormValues> = [
  "cep",
  "logradouro",
  "numero",
  "bairro",
  "cidade",
  "estado",
];

const MIN_INTERVIEW_DATE = new Date();
MIN_INTERVIEW_DATE.setHours(0, 0, 0, 0);

function buildAgendaVisibleRange(dateIso?: string | null): {
  dataInicio: string;
  dataFim: string;
} | null {
  if (!dateIso) return null;

  const value = new Date(dateIso);
  if (Number.isNaN(value.getTime())) return null;

  return {
    dataInicio: startOfMonth(value).toISOString(),
    dataFim: endOfMonth(value).toISOString(),
  };
}

function getPreferredModalidade(
  capabilities?: EntrevistaOverviewCapabilities,
): EntrevistaModalidade | null {
  const canCreateOnline = capabilities?.canCreateOnline ?? true;
  const canCreatePresencial = capabilities?.canCreatePresencial ?? true;

  if (canCreateOnline) return "ONLINE";
  if (canCreatePresencial) return "PRESENCIAL";
  return null;
}

function buildEmptyForm(
  capabilities?: EntrevistaOverviewCapabilities,
): FormValues {
  return {
    empresaId: null,
    candidaturaId: null,
    empresaAnonima: false,
    modalidade: getPreferredModalidade(capabilities),
    data: null,
    horaInicio: "",
    horaFim: "",
    descricao: "",
    enderecoPresencial: { ...EMPTY_ENDERECO },
  };
}

function combineDateAndTime(date: Date | null, time: string): string | null {
  if (!date || !time) return null;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

  const [hours, minutes] = time.split(":").map((value) => Number(value));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  if (Number.isNaN(value.getTime())) return null;

  return value.toISOString();
}

function normalizeEnderecoForm(
  value?: EntrevistaEndereco | null,
): EnderecoFormValues {
  return {
    cep: value?.cep ?? "",
    logradouro: value?.logradouro ?? "",
    numero: value?.numero ?? "",
    complemento: value?.complemento ?? "",
    bairro: value?.bairro ?? "",
    cidade: value?.cidade ?? "",
    estado: normalizeEstadoUf(value?.estado),
    pontoReferencia: value?.pontoReferencia ?? "",
  };
}

function buildEnderecoPayload(
  value: EnderecoFormValues,
): EntrevistaEndereco | null {
  const payload: EntrevistaEndereco = {
    cep: value.cep.trim() || null,
    logradouro: value.logradouro.trim() || null,
    numero: value.numero.trim() || null,
    complemento: value.complemento.trim() || null,
    bairro: value.bairro.trim() || null,
    cidade: value.cidade.trim() || null,
    estado: value.estado.trim() || null,
    pontoReferencia: value.pontoReferencia.trim() || null,
  };

  return Object.values(payload).some(Boolean) ? payload : null;
}

function isTemporaryDatabaseError(error?: unknown): boolean {
  const apiError = error as ApiLikeError | undefined;
  return (
    apiError?.status === 503 ||
    apiError?.details?.code === "DATABASE_CONNECTION_ERROR"
  );
}

function buildCompanyDisplayName(item?: CursoAlunoEntrevistaOpcaoItem | null) {
  if (!item) return "Empresa não informada";
  return (
    item.empresa?.labelExibicao ??
    (item.empresaAnonima || item.empresa?.anonima
      ? "Empresa anônima"
      : item.empresa?.nomeExibicao ?? "Empresa não informada")
  );
}

function buildCandidaturaLabel(item: CursoAlunoEntrevistaOpcaoItem): string {
  return item.vaga?.titulo ?? "Vaga";
}

function validateForm(
  values: FormValues,
  selectedOption: CursoAlunoEntrevistaOpcaoItem | null,
  capabilities?: EntrevistaOverviewCapabilities,
): FormErrors {
  const errors: FormErrors = {};
  const canCreateOnline = capabilities?.canCreateOnline ?? true;
  const canCreatePresencial = capabilities?.canCreatePresencial ?? true;

  if (!values.candidaturaId) {
    errors.candidaturaId = "Selecione a vaga da entrevista.";
  }
  if (!values.modalidade) {
    errors.modalidade = "Selecione a modalidade.";
  }
  if (values.modalidade === "ONLINE" && !canCreateOnline) {
    errors.modalidade =
      "Conecte sua conta Google para habilitar entrevistas online.";
  }
  if (values.modalidade === "PRESENCIAL" && !canCreatePresencial) {
    errors.modalidade = "Entrevistas presenciais indisponíveis no momento.";
  }
  if (!values.data) {
    errors.data = "Selecione a data da entrevista.";
  }
  if (values.data) {
    const selectedDate = new Date(values.data);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < MIN_INTERVIEW_DATE) {
      errors.data = "A data da entrevista deve ser hoje ou uma data futura.";
    }
  }
  if (!values.horaInicio) {
    errors.horaInicio = "Informe a hora de início.";
  }
  if (!values.horaFim) {
    errors.horaFim = "Informe a hora de término.";
  }

  const dataInicio = combineDateAndTime(values.data, values.horaInicio);
  const dataFim = combineDateAndTime(values.data, values.horaFim);

  if (values.horaInicio && !dataInicio) {
    errors.horaInicio = "Hora de início inválida.";
  }
  if (values.horaFim && !dataFim) {
    errors.horaFim = "Hora de término inválida.";
  }
  if (dataInicio && dataFim && new Date(dataFim) <= new Date(dataInicio)) {
    errors.horaFim = "A hora de término deve ser maior que a hora de início.";
  }
  if (selectedOption?.entrevistaAtiva) {
    errors.candidaturaId =
      "Esta candidatura já possui uma entrevista ativa.";
  }
  if (values.descricao.length > 5000) {
    errors.descricao = "A descrição deve ter no máximo 5000 caracteres.";
  }

  if (values.modalidade === "PRESENCIAL") {
    ENDERECO_REQUIRED_FIELDS.forEach((field) => {
      if (!values.enderecoPresencial[field].trim()) {
        errors[`enderecoPresencial.${field}`] = "Campo obrigatório.";
      }
    });
  }

  return errors;
}

export function MarcarEntrevistaAlunoModal({
  alunoId,
  alunoNome,
  isOpen,
  onOpenChange,
}: MarcarEntrevistaAlunoModalProps) {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<FormValues>(buildEmptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [cidadeOptions, setCidadeOptions] = useState<SelectOption[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [cidadeOptionsByEstado, setCidadeOptionsByEstado] = useState<
    Record<string, SelectOption[]>
  >({});

  const optionsQuery = useQuery({
    queryKey: ["aluno-details-entrevistas-opcoes", alunoId],
    queryFn: () => getCursoAlunoEntrevistaOpcoes(alunoId),
    enabled: isOpen && Boolean(alunoId),
    staleTime: 60 * 1000,
    retry: (failureCount, error) =>
      isTemporaryDatabaseError(error) ? failureCount < 2 : false,
    retryDelay: 1000,
  });

  const eligibleOptions = useMemo(
    () => (optionsQuery.data?.items ?? []).filter((item) => !item.entrevistaAtiva),
    [optionsQuery.data],
  );

  const companyOptions = useMemo<SelectOption[]>(() => {
    const companies = new Map<
      string,
      { label: string; searchKeywords: string[] }
    >();

    eligibleOptions.forEach((item) => {
      const companyId = item.empresa?.id;
      if (!companyId || companies.has(companyId)) return;

      companies.set(companyId, {
        label: buildCompanyDisplayName(item),
        searchKeywords: [
          buildCompanyDisplayName(item),
          item.empresa?.nomeExibicao ?? "",
        ],
      });
    });

    return Array.from(companies.entries()).map(([value, config]) => ({
      value,
      label: config.label,
      searchKeywords: config.searchKeywords,
    }));
  }, [eligibleOptions]);

  const filteredOptions = useMemo(
    () =>
      eligibleOptions.filter((item) =>
        formValues.empresaId ? item.empresa?.id === formValues.empresaId : true,
      ),
    [eligibleOptions, formValues.empresaId],
  );

  const selectedOption = useMemo(
    () =>
      filteredOptions.find(
        (item) => item.candidaturaId === formValues.candidaturaId,
      ) ?? null,
    [filteredOptions, formValues.candidaturaId],
  );

  const capabilities = optionsQuery.data;
  const canCreateOnline = capabilities?.canCreateOnline ?? true;
  const canCreatePresencial = capabilities?.canCreatePresencial ?? true;
  const requiresGoogleForOnline =
    capabilities?.requiresGoogleForOnline ?? false;
  const isGoogleConnected = capabilities?.google?.connected ?? false;
  const shouldShowGoogleCta =
    requiresGoogleForOnline && !isGoogleConnected && canCreatePresencial;
  const isFormBusy = optionsQuery.isFetching;

  const candidaturaOptions = useMemo<SelectOption[]>(
    () =>
      filteredOptions.map((item) => ({
        value: item.candidaturaId,
        label: buildCandidaturaLabel(item),
        searchKeywords: [
          item.vaga?.titulo ?? "",
          item.vaga?.codigo ?? "",
        ],
      })),
    [filteredOptions],
  );

  const applyEnderecoFromOption = (candidaturaId: string | null) => {
    const item =
      eligibleOptions.find((option) => option.candidaturaId === candidaturaId) ??
      null;
    return normalizeEnderecoForm(item?.enderecoPadraoEntrevista);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!eligibleOptions.length) return;

    setFormValues((current) => {
      const companyId =
        current.empresaId && companyOptions.some((item) => item.value === current.empresaId)
          ? current.empresaId
          : eligibleOptions[0]?.empresa?.id ?? null;
      const firstOption =
        eligibleOptions.find((item) => item.empresa?.id === companyId) ?? eligibleOptions[0];

      return {
        ...current,
        empresaId: companyId,
        candidaturaId: firstOption.candidaturaId,
        empresaAnonima: Boolean(firstOption.empresaAnonima),
        enderecoPresencial:
          current.modalidade === "PRESENCIAL"
            ? normalizeEnderecoForm(firstOption.enderecoPadraoEntrevista)
            : current.enderecoPresencial,
      };
    });
  }, [companyOptions, eligibleOptions, isOpen]);

  useEffect(() => {
    if (!formValues.empresaId) return;

    const hasSelectedCandidaturaInCompany = filteredOptions.some(
      (item) => item.candidaturaId === formValues.candidaturaId,
    );

    if (hasSelectedCandidaturaInCompany) return;

    const fallbackOption = filteredOptions[0] ?? null;

    setFormValues((current) => ({
      ...current,
      candidaturaId: fallbackOption?.candidaturaId ?? null,
      empresaAnonima: Boolean(fallbackOption?.empresaAnonima),
      enderecoPresencial:
        current.modalidade === "PRESENCIAL"
          ? normalizeEnderecoForm(fallbackOption?.enderecoPadraoEntrevista)
          : current.enderecoPresencial,
    }));
  }, [
    filteredOptions,
    formValues.candidaturaId,
    formValues.empresaId,
    formValues.modalidade,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setFormValues(buildEmptyForm(capabilities));
      setErrors({});
      setCidadeOptions([]);
    }
  }, [capabilities, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const preferredModalidade = getPreferredModalidade(capabilities);
    if (formValues.modalidade === preferredModalidade) return;
    if (formValues.modalidade === "ONLINE" && canCreateOnline) return;
    if (formValues.modalidade === "PRESENCIAL" && canCreatePresencial) return;

    setFormValues((current) => ({
      ...current,
      modalidade: preferredModalidade,
    }));
  }, [
    capabilities,
    canCreateOnline,
    canCreatePresencial,
    formValues.modalidade,
    isOpen,
  ]);

  useEffect(() => {
    if (formValues.modalidade !== "PRESENCIAL") {
      setCidadeOptions([]);
      return;
    }

    const estado = normalizeEstadoUf(formValues.enderecoPresencial.estado);
    if (!estado) {
      setCidadeOptions([]);
      return;
    }

    const cached = cidadeOptionsByEstado[estado];
    if (cached) {
      setCidadeOptions(cached);
      return;
    }

    let cancelled = false;

    const fetchCidades = async () => {
      setIsLoadingCidades(true);
      try {
        const options = await fetchCidadesByUf(estado);
        if (!cancelled) {
          setCidadeOptions(options);
          setCidadeOptionsByEstado((current) => ({
            ...current,
            [estado]: options,
          }));
        }
      } catch {
        if (!cancelled) {
          setCidadeOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCidades(false);
        }
      }
    };

    void fetchCidades();

    return () => {
      cancelled = true;
    };
  }, [
    cidadeOptionsByEstado,
    formValues.enderecoPresencial.estado,
    formValues.modalidade,
  ]);

  const createMutation = useMutation({
    mutationFn: (payload: CursoAlunoCreateEntrevistaPayload) =>
      createCursoAlunoEntrevista(alunoId, payload),
    onSuccess: async (entrevista) => {
      const agendaRange = buildAgendaVisibleRange(
        entrevista.dataInicio ?? entrevista.agendadaPara ?? null,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["aluno-details-entrevistas", alunoId],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["aluno-details-entrevistas-opcoes", alunoId],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-course-student", alunoId],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-entrevistas-list"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["agenda"],
          exact: false,
          refetchType: "active",
        }),
        ...(agendaRange
          ? [
              queryClient.invalidateQueries({
                queryKey: ["agenda", agendaRange.dataInicio, agendaRange.dataFim],
                exact: false,
                refetchType: "active",
              }),
              queryClient.invalidateQueries({
                queryKey: [
                  "agenda",
                  agendaRange.dataInicio,
                  agendaRange.dataFim,
                  ["ENTREVISTA"],
                ],
                exact: true,
                refetchType: "active",
              }),
            ]
          : []),
      ]);

      toastCustom.success({
        title: "Entrevista marcada com sucesso",
        description: "A entrevista foi criada a partir do detalhe do aluno.",
      });

      handleClose();

      if (entrevista.meetUrl) {
        toastCustom.info({
          title: "Link da reunião disponível",
          description: "O Google Meet foi gerado na entrevista criada.",
        });
      } else if (entrevista.agenda?.criadoNoSistema) {
        toastCustom.info({
          title: "Entrevista registrada na agenda",
          description: "A entrevista foi adicionada à agenda do sistema.",
        });
      }
    },
    onError: (error: Error) => {
      const message = error.message || "Não foi possível marcar a entrevista.";
      setErrors((current) => ({ ...current, submit: message }));
      toastCustom.error({
        title: "Erro ao marcar entrevista",
        description: message,
      });
    },
  });

  const connectGoogleMutation = useMutation({
    mutationFn: () => connectGoogle(),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["aluno-details-entrevistas-opcoes", alunoId],
        exact: false,
      });

      if (response?.authUrl) {
        window.location.href = response.authUrl;
        return;
      }

      toastCustom.error({
        title: "Erro ao conectar Google",
        description: "Não foi possível iniciar a conexão com o Google.",
      });
    },
    onError: (error: Error) => {
      toastCustom.error({
        title: "Erro ao conectar Google",
        description:
          error.message || "Não foi possível conectar sua conta Google.",
      });
    },
  });

  const validationSnapshot = useMemo(
    () => validateForm(formValues, selectedOption, capabilities),
    [capabilities, formValues, selectedOption],
  );

  const hasTemporaryOptionsError = isTemporaryDatabaseError(optionsQuery.error);
  const isAnonimatoBloqueado = Boolean(selectedOption?.anonimatoBloqueado);
  const isAnonimatoDisabled =
    createMutation.isPending ||
    optionsQuery.isLoading ||
    !selectedOption ||
    isAnonimatoBloqueado;
  const anonimatoHelperText = !selectedOption
    ? "Selecione a vaga para definir a visibilidade da empresa."
    : isAnonimatoBloqueado
      ? "Esta vaga já exige anonimato. O nome da empresa continuará oculto para o candidato."
      : formValues.empresaAnonima
        ? "O candidato verá “Empresa anônima” nos detalhes da entrevista."
        : "O nome da empresa será exibido normalmente para o candidato.";

  const handleClose = () => {
    setFormValues(buildEmptyForm(capabilities));
    setErrors({});
    setCidadeOptions([]);
    createMutation.reset();
    onOpenChange(false);
  };

  const handleCandidaturaChange = (candidaturaId: string | null) => {
    const option =
      eligibleOptions.find((item) => item.candidaturaId === candidaturaId) ?? null;

    setFormValues((current) => ({
      ...current,
      candidaturaId,
      empresaAnonima: Boolean(option?.empresaAnonima),
      enderecoPresencial:
        current.modalidade === "PRESENCIAL"
          ? normalizeEnderecoForm(option?.enderecoPadraoEntrevista)
          : current.enderecoPresencial,
    }));
    setErrors((current) => ({
      ...current,
      candidaturaId: undefined,
      submit: undefined,
    }));
  };

  const handleEmpresaChange = (empresaId: string | null) => {
    const fallbackOption =
      eligibleOptions.find((item) => item.empresa?.id === empresaId) ?? null;

    setFormValues((current) => ({
      ...current,
      empresaId,
      candidaturaId: fallbackOption?.candidaturaId ?? null,
      empresaAnonima: Boolean(fallbackOption?.empresaAnonima),
      enderecoPresencial:
        current.modalidade === "PRESENCIAL"
          ? normalizeEnderecoForm(fallbackOption?.enderecoPadraoEntrevista)
          : current.enderecoPresencial,
    }));
    setErrors((current) => ({
      ...current,
      empresaId: undefined,
      candidaturaId: undefined,
      submit: undefined,
    }));
  };

  const handleModalidadeChange = (modalidade: EntrevistaModalidade | null) => {
    setFormValues((current) => ({
      ...current,
      modalidade,
      enderecoPresencial:
        modalidade === "PRESENCIAL"
          ? applyEnderecoFromOption(current.candidaturaId)
          : current.enderecoPresencial,
    }));
    setErrors((current) => ({
      ...current,
      modalidade: undefined,
      "enderecoPresencial.cep": undefined,
      "enderecoPresencial.logradouro": undefined,
      "enderecoPresencial.numero": undefined,
      "enderecoPresencial.bairro": undefined,
      "enderecoPresencial.cidade": undefined,
      "enderecoPresencial.estado": undefined,
      submit: undefined,
    }));
  };

  const setFieldValue = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      submit: undefined,
    }));
  };

  const setEnderecoFieldValue = <K extends keyof EnderecoFormValues>(
    key: K,
    value: EnderecoFormValues[K],
  ) => {
    setFormValues((current) => ({
      ...current,
      enderecoPresencial: {
        ...current.enderecoPresencial,
        [key]: value,
      },
    }));
    setErrors((current) => ({
      ...current,
      [`enderecoPresencial.${key}`]: undefined,
      submit: undefined,
    }));
  };

  const handleEstadoChange = (value: string | null) => {
    setFormValues((current) => ({
      ...current,
      enderecoPresencial: {
        ...current.enderecoPresencial,
        estado: value ?? "",
        cidade: "",
      },
    }));
    setErrors((current) => ({
      ...current,
      "enderecoPresencial.estado": undefined,
      "enderecoPresencial.cidade": undefined,
      submit: undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formValues, selectedOption, capabilities);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const dataInicio = combineDateAndTime(formValues.data, formValues.horaInicio);
    const dataFim = combineDateAndTime(formValues.data, formValues.horaFim);

    if (
      !dataInicio ||
      !dataFim ||
      !formValues.candidaturaId ||
      !formValues.modalidade
    ) {
      setErrors((current) => ({
        ...current,
        submit: "Não foi possível montar o payload da entrevista.",
      }));
      return;
    }

    const payload: CursoAlunoCreateEntrevistaPayload = {
      candidaturaId: formValues.candidaturaId,
      modalidade: formValues.modalidade,
      empresaAnonima: formValues.empresaAnonima,
      dataInicio,
      dataFim,
    };

    const descricao = formValues.descricao.trim();
    if (descricao) {
      payload.descricao = descricao;
    }

    if (formValues.modalidade === "PRESENCIAL") {
      const enderecoPresencial = buildEnderecoPayload(
        formValues.enderecoPresencial,
      );
      if (enderecoPresencial) {
        payload.enderecoPresencial = enderecoPresencial;
      }
    }

    await createMutation.mutateAsync(payload);
  };

  const isSubmitDisabled =
    createMutation.isPending ||
    connectGoogleMutation.isPending ||
    optionsQuery.isLoading ||
    optionsQuery.isError ||
    eligibleOptions.length === 0 ||
    Object.keys(validationSnapshot).length > 0;

  const retryLoadOptions = async () => {
    await optionsQuery.refetch();
  };

  return (
    <ModalCustom
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}
      size="3xl"
      scrollBehavior="outside"
    >
      <ModalContentWrapper className="flex max-h-[90dvh] flex-col overflow-hidden">
        <ModalHeader>
          <ModalTitle>Marcar entrevista</ModalTitle>
        </ModalHeader>

        <ModalBody className="mt-0 flex-1 min-h-0 space-y-6 overflow-y-auto pr-2">
          {errors.submit ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          ) : null}

          {shouldShowGoogleCta ? (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <CalendarCheck2 className="!h-4 !w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="!mb-0 !text-sm !font-medium !leading-5 !text-slate-900">
                      Entrevistas online exigem Google conectado.
                    </p>
                    <p className="!mb-0 !text-sm !leading-5 !text-slate-600">
                      Você ainda pode criar entrevistas presenciais normalmente.
                    </p>
                  </div>
                </div>

                <div className="md:shrink-0">
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    className="!h-9 !border-emerald-600 !bg-emerald-600 !px-4 !text-sm !text-white hover:!border-emerald-700 hover:!bg-emerald-700 hover:!text-white"
                    onClick={() => connectGoogleMutation.mutate()}
                    isLoading={connectGoogleMutation.isPending}
                    loadingText="Conectando..."
                    disabled={createMutation.isPending}
                  >
                    Conectar Google
                  </ButtonCustom>
                </div>
              </div>
            </div>
          ) : null}

          <form
            id="create-aluno-entrevista-form"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <SelectCustom
                  label="Empresa"
                  value={formValues.empresaId}
                  onChange={handleEmpresaChange}
                  options={companyOptions}
                  placeholder={
                    optionsQuery.isLoading
                      ? "Carregando empresas..."
                      : "Selecione a empresa"
                  }
                  disabled={optionsQuery.isLoading || createMutation.isPending}
                  searchable
                  searchThreshold={0}
                  required
                />

                <SelectCustom
                  label="Vaga"
                  value={formValues.candidaturaId}
                  onChange={handleCandidaturaChange}
                  options={candidaturaOptions}
                  placeholder={
                    !formValues.empresaId
                      ? "Selecione a empresa primeiro"
                      : optionsQuery.isLoading
                        ? "Carregando vagas elegíveis..."
                        : "Selecione a vaga"
                  }
                  disabled={
                    optionsQuery.isLoading ||
                    createMutation.isPending ||
                    !formValues.empresaId
                  }
                  error={errors.candidaturaId}
                  searchable
                  searchThreshold={0}
                  required
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                <div className="flex items-start gap-3">
                  <CheckboxCustom
                    checked={formValues.empresaAnonima}
                    onCheckedChange={(checked) =>
                      setFieldValue("empresaAnonima", checked)
                    }
                    disabled={isAnonimatoDisabled}
                    className="mt-0.5 border border-gray-300 bg-white data-[state=checked]:border-[var(--primary-color)]"
                  />

                  <div className="space-y-1">
                    <p className="!mb-0 !text-sm !font-medium !text-gray-900">
                      Ocultar nome da empresa para o candidato
                    </p>
                    <p className="!mb-0 !text-sm !leading-5 !text-gray-600">
                      {anonimatoHelperText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectCustom
                  label="Modalidade"
                  value={formValues.modalidade}
                  onChange={(value) =>
                    handleModalidadeChange(
                      (value as EntrevistaModalidade | null) ??
                        getPreferredModalidade(capabilities),
                    )
                  }
                  options={MODALIDADE_OPTIONS.map((item) => ({
                    ...item,
                    disabled:
                      (item.value === "ONLINE" && !canCreateOnline) ||
                      (item.value === "PRESENCIAL" && !canCreatePresencial),
                  }))}
                  placeholder="Selecione a modalidade"
                  disabled={createMutation.isPending}
                  error={errors.modalidade}
                  required
                />

                <DatePickerCustom
                  label="Data"
                  value={formValues.data}
                  onChange={(date) => setFieldValue("data", date)}
                  placeholder="Selecionar data"
                  error={errors.data}
                  clearable
                  disabled={createMutation.isPending}
                  minDate={MIN_INTERVIEW_DATE}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TimeInputCustom
                  label="Hora de início"
                  value={formValues.horaInicio}
                  onChange={(value) => setFieldValue("horaInicio", value)}
                  error={errors.horaInicio}
                  disabled={createMutation.isPending}
                  required
                />

                <TimeInputCustom
                  label="Hora de término"
                  value={formValues.horaFim}
                  onChange={(value) => setFieldValue("horaFim", value)}
                  error={errors.horaFim}
                  disabled={createMutation.isPending}
                  required
                />
              </div>
            </div>

            {formValues.modalidade === "PRESENCIAL" ? (
              <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                <div className="text-sm font-medium text-gray-900">
                  Endereço da entrevista
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">
                  <InputCustom
                    label="CEP"
                    value={formValues.enderecoPresencial.cep}
                    onChange={(event) =>
                      setEnderecoFieldValue("cep", event.target.value)
                    }
                    placeholder="00000-000"
                    mask="cep"
                    disabled={createMutation.isPending}
                    error={errors["enderecoPresencial.cep"]}
                    required
                  />

                  <InputCustom
                    label="Logradouro"
                    value={formValues.enderecoPresencial.logradouro}
                    onChange={(event) =>
                      setEnderecoFieldValue("logradouro", event.target.value)
                    }
                    placeholder="Rua, avenida, travessa..."
                    disabled={createMutation.isPending}
                    error={errors["enderecoPresencial.logradouro"]}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.65fr)]">
                  <SelectCustom
                    label="Estado"
                    value={formValues.enderecoPresencial.estado || null}
                    onChange={handleEstadoChange}
                    options={BRASIL_ESTADO_OPTIONS}
                    placeholder="Selecione o estado"
                    disabled={createMutation.isPending}
                    error={errors["enderecoPresencial.estado"]}
                    searchable
                    searchThreshold={0}
                    required
                  />

                  <SelectCustom
                    label="Cidade"
                    value={formValues.enderecoPresencial.cidade || null}
                    onChange={(value) =>
                      setEnderecoFieldValue("cidade", value ?? "")
                    }
                    options={cidadeOptions}
                    placeholder={
                      !formValues.enderecoPresencial.estado
                        ? "Selecione o estado primeiro"
                        : isLoadingCidades
                          ? "Carregando cidades..."
                          : "Selecione a cidade"
                    }
                    disabled={
                      createMutation.isPending ||
                      !formValues.enderecoPresencial.estado ||
                      isLoadingCidades
                    }
                    error={errors["enderecoPresencial.cidade"]}
                    searchable
                    searchThreshold={0}
                    required
                  />

                  <InputCustom
                    label="Bairro"
                    value={formValues.enderecoPresencial.bairro}
                    onChange={(event) =>
                      setEnderecoFieldValue("bairro", event.target.value)
                    }
                    placeholder="Bairro"
                    disabled={createMutation.isPending}
                    error={errors["enderecoPresencial.bairro"]}
                    required
                  />

                  <InputCustom
                    label="Número"
                    value={formValues.enderecoPresencial.numero}
                    onChange={(event) =>
                      setEnderecoFieldValue("numero", event.target.value)
                    }
                    placeholder="123"
                    disabled={createMutation.isPending}
                    error={errors["enderecoPresencial.numero"]}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InputCustom
                    label="Complemento"
                    value={formValues.enderecoPresencial.complemento}
                    onChange={(event) =>
                      setEnderecoFieldValue("complemento", event.target.value)
                    }
                    placeholder="Sala, bloco, andar..."
                    disabled={createMutation.isPending}
                  />

                  <InputCustom
                    label="Ponto de referência"
                    value={formValues.enderecoPresencial.pontoReferencia}
                    onChange={(event) =>
                      setEnderecoFieldValue("pontoReferencia", event.target.value)
                    }
                    placeholder="Próximo ao shopping, portaria principal..."
                    disabled={createMutation.isPending}
                  />
                </div>
              </div>
            ) : null}

            <SimpleTextarea
              label="Descrição"
              value={formValues.descricao}
              onChange={(event) =>
                setFieldValue("descricao", event.target.value)
              }
              placeholder="Descreva o objetivo da entrevista, instruções ou contexto importante..."
              rows={6}
              maxLength={5000}
              showCharCount
              disabled={createMutation.isPending}
              error={errors.descricao}
            />

            {optionsQuery.isError ? (
              <Alert variant={hasTemporaryOptionsError ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <div className="space-y-3">
                  <AlertDescription>
                    {hasTemporaryOptionsError
                      ? "As opções de entrevista estão temporariamente indisponíveis. Tente novamente em instantes."
                      : optionsQuery.error?.message ||
                        "Não foi possível carregar as opções da entrevista."}
                  </AlertDescription>

                  {hasTemporaryOptionsError ? (
                    <ButtonCustom
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void retryLoadOptions()}
                      disabled={optionsQuery.isFetching || createMutation.isPending}
                      isLoading={optionsQuery.isFetching}
                      loadingText="Tentando..."
                    >
                      Tentar novamente
                    </ButtonCustom>
                  ) : null}
                </div>
              </Alert>
            ) : null}
          </form>
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <ButtonCustom
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending || connectGoogleMutation.isPending}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="submit"
              form="create-aluno-entrevista-form"
              variant="primary"
              isLoading={createMutation.isPending}
              loadingText="Salvando..."
              disabled={isSubmitDisabled}
            >
              Confirmar entrevista
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
