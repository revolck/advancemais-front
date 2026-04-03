"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import { AlertCircle, CalendarCheck2 } from "lucide-react";
import { connectGoogle } from "@/api/aulas";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BRASIL_ESTADO_OPTIONS,
  fetchCidadesByUf,
  normalizeEstadoUf,
} from "@/lib/brasil-localidades";
import {
  createRecrutadorEntrevistaDashboard,
  listRecrutadorEntrevistaCandidatosOptions,
  listRecrutadorEntrevistaEmpresasOptions,
  listRecrutadorEntrevistaVagasOptions,
  type RecrutadorEntrevistaCreatePayload,
} from "@/api/recrutador";
import type {
  EntrevistaCandidatoOpcaoItem,
  EntrevistaEndereco,
  EntrevistaEmpresaOpcaoItem,
  EntrevistaModalidade,
  EntrevistaOverviewCapabilities,
  EntrevistaVagaOpcaoItem,
} from "@/api/entrevistas";

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
  empresaUsuarioId: string | null;
  vagaId: string | null;
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
    empresaUsuarioId: null,
    vagaId: null,
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

function buildEmpresaLabel(item: EntrevistaEmpresaOpcaoItem): string {
  return item.nomeExibicao;
}

function buildVagaLabel(item: EntrevistaVagaOpcaoItem): string {
  return item.titulo;
}

function buildCandidatoLabel(item: EntrevistaCandidatoOpcaoItem): string {
  return item.candidato.nome;
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

function validateForm(
  values: FormValues,
  selectedCandidate: EntrevistaCandidatoOpcaoItem | null,
  capabilities?: EntrevistaOverviewCapabilities,
): FormErrors {
  const errors: FormErrors = {};
  const canCreateOnline = capabilities?.canCreateOnline ?? true;
  const canCreatePresencial = capabilities?.canCreatePresencial ?? true;

  if (!values.empresaUsuarioId)
    errors.empresaUsuarioId = "Selecione a empresa.";
  if (!values.vagaId) errors.vagaId = "Selecione a vaga.";
  if (!values.candidaturaId) errors.candidaturaId = "Selecione o candidato.";
  if (!values.modalidade) errors.modalidade = "Selecione a modalidade.";
  if (values.modalidade === "ONLINE" && !canCreateOnline) {
    errors.modalidade =
      "Conecte sua conta Google para habilitar entrevistas online.";
  }
  if (values.modalidade === "PRESENCIAL" && !canCreatePresencial) {
    errors.modalidade = "Entrevistas presenciais indisponíveis no momento.";
  }
  if (!values.data) errors.data = "Selecione a data da entrevista.";
  if (values.data) {
    const selectedDate = new Date(values.data);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < MIN_INTERVIEW_DATE) {
      errors.data = "A data da entrevista deve ser hoje ou uma data futura.";
    }
  }
  if (!values.horaInicio) errors.horaInicio = "Informe a hora de início.";
  if (!values.horaFim) errors.horaFim = "Informe a hora de término.";

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

  if (selectedCandidate?.entrevistaAtiva) {
    errors.candidaturaId =
      "Este candidato já possui uma entrevista ativa para esta candidatura.";
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

function isTemporaryDatabaseError(error?: unknown): boolean {
  const apiError = error as ApiLikeError | undefined;
  return (
    apiError?.status === 503 ||
    apiError?.details?.code === "DATABASE_CONNECTION_ERROR"
  );
}

interface AddEntrevistaRecrutadorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  capabilities?: EntrevistaOverviewCapabilities;
}

export function AddEntrevistaRecrutadorModal({
  isOpen,
  onOpenChange,
  capabilities,
}: AddEntrevistaRecrutadorModalProps) {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<FormValues>(() =>
    buildEmptyForm(capabilities),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [cidadeOptions, setCidadeOptions] = useState<SelectOption[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [cidadeOptionsByEstado, setCidadeOptionsByEstado] = useState<
    Record<string, SelectOption[]>
  >({});

  const empresasQuery = useQuery({
    queryKey: ["recrutador-entrevistas-opcoes-empresas"],
    queryFn: () => listRecrutadorEntrevistaEmpresasOptions(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) =>
      isTemporaryDatabaseError(error) ? failureCount < 2 : false,
    retryDelay: 1000,
  });

  const vagasQuery = useQuery({
    queryKey: ["recrutador-entrevistas-opcoes-vagas", formValues.empresaUsuarioId],
    queryFn: () =>
      listRecrutadorEntrevistaVagasOptions(formValues.empresaUsuarioId as string),
    enabled: isOpen && Boolean(formValues.empresaUsuarioId),
    staleTime: 60 * 1000,
    retry: (failureCount, error) =>
      isTemporaryDatabaseError(error) ? failureCount < 2 : false,
    retryDelay: 1000,
  });

  const candidatosQuery = useQuery({
    queryKey: ["recrutador-entrevistas-opcoes-candidatos", formValues.vagaId],
    queryFn: () =>
      listRecrutadorEntrevistaCandidatosOptions(formValues.vagaId as string),
    enabled: isOpen && Boolean(formValues.vagaId),
    staleTime: 60 * 1000,
    retry: (failureCount, error) =>
      isTemporaryDatabaseError(error) ? failureCount < 2 : false,
    retryDelay: 1000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: RecrutadorEntrevistaCreatePayload) =>
      createRecrutadorEntrevistaDashboard(payload),
    onSuccess: async (entrevista) => {
      const agendaRange = buildAgendaVisibleRange(
        entrevista.dataInicio ?? entrevista.agendadaPara ?? null,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["recrutador-entrevistas-list"],
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
        description: "A entrevista foi criada e a listagem foi atualizada.",
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
        queryKey: ["recrutador-entrevistas-list"],
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

  const empresaOptions = useMemo(
    () =>
      (empresasQuery.data ?? []).map((item) => ({
        value: item.id,
        label: buildEmpresaLabel(item),
        searchKeywords: [
          item.nomeExibicao,
          item.codigo ?? "",
          item.cnpj ?? "",
          item.email ?? "",
        ],
      })),
    [empresasQuery.data],
  );

  const vagaOptions = useMemo(
    () =>
      (vagasQuery.data ?? []).map((item) => ({
        value: item.id,
        label: buildVagaLabel(item),
        searchKeywords: [
          item.titulo,
          item.codigo ?? "",
          item.statusLabel ?? "",
        ],
      })),
    [vagasQuery.data],
  );

  const candidatoOptions = useMemo(
    () =>
      (candidatosQuery.data ?? []).map((item) => ({
        value: item.candidaturaId,
        label: buildCandidatoLabel(item),
        disabled: item.entrevistaAtiva,
        searchKeywords: [
          item.candidato.nome,
          item.candidato.email ?? "",
          item.candidato.cpf ?? "",
          item.candidato.codigo ?? "",
        ],
      })),
    [candidatosQuery.data],
  );

  const selectedCandidate = useMemo(
    () =>
      (candidatosQuery.data ?? []).find(
        (item) => item.candidaturaId === formValues.candidaturaId,
      ) ?? null,
    [candidatosQuery.data, formValues.candidaturaId],
  );

  const selectedVaga = useMemo(
    () =>
      (vagasQuery.data ?? []).find((item) => item.id === formValues.vagaId) ??
      null,
    [formValues.vagaId, vagasQuery.data],
  );

  const canCreatePresencial = capabilities?.canCreatePresencial ?? true;
  const canCreateOnline = capabilities?.canCreateOnline ?? true;
  const requiresGoogleForOnline =
    capabilities?.requiresGoogleForOnline ?? false;
  const isGoogleConnected = capabilities?.google?.connected ?? false;
  const loadingOptions =
    empresasQuery.isLoading ||
    vagasQuery.isLoading ||
    candidatosQuery.isLoading;
  const hasTemporaryOptionsError =
    isTemporaryDatabaseError(empresasQuery.error) ||
    isTemporaryDatabaseError(vagasQuery.error) ||
    isTemporaryDatabaseError(candidatosQuery.error);
  const isFormBusy =
    createMutation.isPending || connectGoogleMutation.isPending;
  const shouldShowGoogleCta =
    requiresGoogleForOnline && !isGoogleConnected && canCreatePresencial;
  const hasSelectedVaga = Boolean(formValues.vagaId);
  const isAnonimatoConfiguradoPelaApi = hasSelectedVaga && Boolean(selectedVaga);
  const isAnonimatoBloqueado = Boolean(selectedVaga?.anonimatoBloqueado);
  const isAnonimatoDisabled =
    isFormBusy || !isAnonimatoConfiguradoPelaApi || isAnonimatoBloqueado;
  const anonimatoHelperText = !hasSelectedVaga
    ? "Selecione uma vaga para liberar essa opção. O anonimato será definido a partir da configuração retornada pela API."
    : !selectedVaga
      ? "Carregando a configuração de anonimato da vaga selecionada."
    : isAnonimatoBloqueado
      ? "Esta vaga já está configurada para ocultar o nome da empresa. O anonimato será mantido automaticamente."
      : formValues.empresaAnonima
        ? "O candidato verá “Empresa anônima” nos detalhes da entrevista e na agenda."
        : "O nome da empresa será exibido normalmente para o candidato.";

  const validationSnapshot = useMemo(
    () => validateForm(formValues, selectedCandidate, capabilities),
    [capabilities, formValues, selectedCandidate],
  );

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
    setErrors((current) => ({
      ...current,
      modalidade: undefined,
      submit: undefined,
    }));
  }, [
    capabilities,
    canCreateOnline,
    canCreatePresencial,
    formValues.modalidade,
    isOpen,
  ]);

  useEffect(() => {
    setFormValues((current) => {
      if (
        current.vagaId === null &&
        current.candidaturaId === null &&
        !current.empresaAnonima
      )
        return current;
      return {
        ...current,
        vagaId: null,
        candidaturaId: null,
        empresaAnonima: false,
      };
    });
    setErrors((current) => {
      if (!current.vagaId && !current.candidaturaId) return current;
      return {
        ...current,
        vagaId: undefined,
        candidaturaId: undefined,
      };
    });
  }, [formValues.empresaUsuarioId]);

  useEffect(() => {
    setFormValues((current) => {
      if (current.candidaturaId === null) return current;
      return {
        ...current,
        candidaturaId: null,
      };
    });
    setErrors((current) => {
      if (!current.candidaturaId) return current;
      return {
        ...current,
        candidaturaId: undefined,
      };
    });
  }, [formValues.vagaId]);

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

  const applyEmpresaEndereco = (empresaUsuarioId: string | null) => {
    const empresa = (empresasQuery.data ?? []).find(
      (item) => item.id === empresaUsuarioId,
    );
    return normalizeEnderecoForm(empresa?.enderecoPadraoEntrevista);
  };

  const handleEmpresaChange = (empresaUsuarioId: string | null) => {
    setFormValues((current) => ({
      ...current,
      empresaUsuarioId,
      vagaId: null,
      candidaturaId: null,
      empresaAnonima: false,
      enderecoPresencial:
        current.modalidade === "PRESENCIAL"
          ? applyEmpresaEndereco(empresaUsuarioId)
          : current.enderecoPresencial,
    }));
    setErrors((current) => ({
      ...current,
      empresaUsuarioId: undefined,
      "enderecoPresencial.cep": undefined,
      "enderecoPresencial.logradouro": undefined,
      "enderecoPresencial.numero": undefined,
      "enderecoPresencial.bairro": undefined,
      "enderecoPresencial.cidade": undefined,
      "enderecoPresencial.estado": undefined,
      submit: undefined,
    }));
  };

  const handleVagaChange = (vagaId: string | null) => {
    const vaga = (vagasQuery.data ?? []).find((item) => item.id === vagaId);

    setFormValues((current) => ({
      ...current,
      vagaId,
      empresaAnonima: Boolean(vaga?.empresaAnonima),
    }));
    setErrors((current) => ({
      ...current,
      vagaId: undefined,
      submit: undefined,
    }));
  };

  const handleModalidadeChange = (modalidade: EntrevistaModalidade | null) => {
    setFormValues((current) => ({
      ...current,
      modalidade,
      enderecoPresencial:
        modalidade === "PRESENCIAL"
          ? applyEmpresaEndereco(current.empresaUsuarioId)
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

  const handleClose = () => {
    setFormValues(buildEmptyForm(capabilities));
    setErrors({});
    createMutation.reset();
    setCidadeOptions([]);
    onOpenChange(false);
  };

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
      } catch (error) {
        console.error("Erro ao carregar cidades do estado:", estado, error);
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

    const validationErrors = validateForm(
      formValues,
      selectedCandidate,
      capabilities,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const dataInicio = combineDateAndTime(
      formValues.data,
      formValues.horaInicio,
    );
    const dataFim = combineDateAndTime(formValues.data, formValues.horaFim);

    if (
      !dataInicio ||
      !dataFim ||
      !formValues.empresaUsuarioId ||
      !formValues.vagaId ||
      !formValues.candidaturaId ||
      !formValues.modalidade
    ) {
      setErrors((current) => ({
        ...current,
        submit: "Não foi possível montar o payload da entrevista.",
      }));
      return;
    }

    const payload: RecrutadorEntrevistaCreatePayload = {
      empresaUsuarioId: formValues.empresaUsuarioId,
      vagaId: formValues.vagaId,
      candidaturaId: formValues.candidaturaId,
      empresaAnonima: formValues.empresaAnonima,
      modalidade: formValues.modalidade,
      dataInicio,
      dataFim,
    };

    if (selectedCandidate?.candidato.id) {
      payload.candidatoId = selectedCandidate.candidato.id;
    }

    const descricao = formValues.descricao.trim();
    if (descricao) {
      payload.descricao = descricao;
    }

    if (formValues.modalidade === "ONLINE") {
      payload.gerarMeet = true;
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
    isFormBusy ||
    empresasQuery.isLoading ||
    empresasQuery.isError ||
    vagasQuery.isError ||
    candidatosQuery.isError ||
    Object.keys(validationSnapshot).length > 0;

  const retryLoadOptions = async () => {
    await Promise.all([
      empresasQuery.refetch(),
      formValues.empresaUsuarioId ? vagasQuery.refetch() : Promise.resolve(),
      formValues.vagaId ? candidatosQuery.refetch() : Promise.resolve(),
    ]);
  };

  return (
    <ModalCustom
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}
      size="3xl"
      scrollBehavior="outside"
    >
      <ModalContentWrapper className="max-h-[90dvh] overflow-hidden flex flex-col">
        <ModalHeader>
          <ModalTitle>Marcar entrevista</ModalTitle>
        </ModalHeader>

        <ModalBody className="mt-0 min-h-0 flex-1 space-y-6 overflow-y-auto pr-2">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {selectedCandidate?.entrevistaAtiva && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este candidato já possui uma entrevista ativa nesta candidatura.
                Escolha outro candidato ou regularize a entrevista existente.
              </AlertDescription>
            </Alert>
          )}

          {shouldShowGoogleCta && (
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
                    disabled={isFormBusy}
                  >
                    Conectar Google
                  </ButtonCustom>
                </div>
              </div>
            </div>
          )}

          <form
            id="create-entrevista-form"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <SelectCustom
                label="Empresa"
                value={formValues.empresaUsuarioId}
                onChange={(value) => handleEmpresaChange(value)}
                options={empresaOptions}
                placeholder={
                  empresasQuery.isLoading
                    ? "Carregando empresas..."
                    : "Selecione a empresa"
                }
                disabled={
                  empresasQuery.isLoading || empresasQuery.isError || isFormBusy
                }
                error={errors.empresaUsuarioId}
                searchable
                searchThreshold={0}
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <SelectCustom
                  label="Vaga"
                  value={formValues.vagaId}
                  onChange={(value) => handleVagaChange(value)}
                  options={vagaOptions}
                  placeholder={
                    !formValues.empresaUsuarioId
                      ? "Selecione a empresa primeiro"
                      : vagasQuery.isLoading
                        ? "Carregando vagas..."
                        : "Selecione a vaga"
                  }
                  disabled={
                    !formValues.empresaUsuarioId ||
                    vagasQuery.isLoading ||
                    isFormBusy
                  }
                  error={errors.vagaId}
                  searchable
                  searchThreshold={0}
                  required
                />
                <SelectCustom
                  label="Candidato"
                  value={formValues.candidaturaId}
                  onChange={(value) => setFieldValue("candidaturaId", value)}
                  options={candidatoOptions}
                  placeholder={
                    !formValues.vagaId
                      ? "Selecione a vaga primeiro"
                      : candidatosQuery.isLoading
                        ? "Carregando candidatos..."
                        : "Selecione o candidato"
                  }
                  disabled={
                    !formValues.vagaId ||
                    candidatosQuery.isLoading ||
                    isFormBusy
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
                  disabled={isFormBusy}
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
                  disabled={isFormBusy}
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
                  disabled={isFormBusy}
                  required
                />

                <TimeInputCustom
                  label="Hora de término"
                  value={formValues.horaFim}
                  onChange={(value) => setFieldValue("horaFim", value)}
                  error={errors.horaFim}
                  disabled={isFormBusy}
                  required
                />
              </div>
            </div>

            {formValues.modalidade === "PRESENCIAL" && (
              <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Endereço da entrevista
                  </div>
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
                    disabled={isFormBusy}
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
                    disabled={isFormBusy}
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
                    disabled={isFormBusy}
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
                      isFormBusy ||
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
                    disabled={isFormBusy}
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
                    disabled={isFormBusy}
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
                    disabled={isFormBusy}
                  />

                  <InputCustom
                    label="Ponto de referência"
                    value={formValues.enderecoPresencial.pontoReferencia}
                    onChange={(event) =>
                      setEnderecoFieldValue(
                        "pontoReferencia",
                        event.target.value,
                      )
                    }
                    placeholder="Próximo ao shopping, portaria principal, sala..."
                    disabled={isFormBusy}
                  />
                </div>
              </div>
            )}

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
              disabled={isFormBusy}
              error={errors.descricao}
            />

            {(empresasQuery.isError ||
              vagasQuery.isError ||
              candidatosQuery.isError) && (
              <Alert variant={hasTemporaryOptionsError ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <div className="space-y-3">
                  <AlertDescription>
                    {hasTemporaryOptionsError
                      ? "As opções do formulário estão temporariamente indisponíveis. Tente novamente em instantes."
                      : empresasQuery.error?.message ||
                        vagasQuery.error?.message ||
                        candidatosQuery.error?.message ||
                        "Não foi possível carregar as opções do formulário."}
                  </AlertDescription>

                  {hasTemporaryOptionsError && (
                    <ButtonCustom
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void retryLoadOptions()}
                      disabled={loadingOptions || isFormBusy}
                      isLoading={loadingOptions}
                      loadingText="Tentando..."
                    >
                      Tentar novamente
                    </ButtonCustom>
                  )}
                </div>
              </Alert>
            )}
          </form>
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <ButtonCustom
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isFormBusy}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="submit"
              form="create-entrevista-form"
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

export default AddEntrevistaRecrutadorModal;
