"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ButtonCustom,
  EmptyState,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  MultiSelectCustom,
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
  StepperSeparator,
  InputCustom,
  SelectCustom,
  RichTextarea,
  toastCustom,
  type MultiSelectOption,
  type SelectOption,
} from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import { getUserProfile } from "@/api/usuarios";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import {
  createCurriculo,
  getCurriculo,
  listAreasInteresse,
  listSubareasInteresse,
  listCurriculos,
  updateCurriculo,
} from "@/api/candidatos";
import type { CreateCurriculoPayload, Curriculo } from "@/api/candidatos/types";
import { useRouter } from "next/navigation";
import { Check, FileText, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import {
  TechnicalSkillsEditor,
  type TechnicalSkillFormItem,
  type TechnicalSkillLevel,
} from "./components/TechnicalSkillsEditor";
import {
  ExperiencesEditor,
  type ExperienceFormItem,
} from "./components/ExperiencesEditor";
import {
  EducationEditor,
  isEmptyEducationRow,
  type EducationFormItem,
} from "./components/EducationEditor";
import {
  CursosCertificacoesEditor,
  isEmptyCertificacaoRow,
  isEmptyCursoRow,
  type CertificacaoFormItem,
  type CursoFormItem,
} from "./components/CursosCertificacoesEditor";
import {
  PremiosPublicacoesEditor,
  isEmptyPremioRow,
  isEmptyPublicacaoRow,
  type PremioFormItem,
  type PublicacaoFormItem,
} from "./components/PremiosPublicacoesEditor";

interface CreateCurriculoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
  curriculoId?: string;
}

type FormErrors = Partial<Record<string, string>>;

type CurriculoPrincipalInfo = { id: string; titulo: string } | null;

const MODALIDADE_OPTIONS: SelectOption[] = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTO", label: "Remoto" },
  { value: "HIBRIDO", label: "Híbrido" },
];

const REGIME_OPTIONS: SelectOption[] = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "ESTAGIO", label: "Estágio" },
];

const JORNADA_OPTIONS: SelectOption[] = [
  { value: "INTEGRAL", label: "Integral" },
  { value: "MEIO_PERIODO", label: "Meio período" },
  { value: "FLEXIVEL", label: "Flexível" },
];

const REMOTO_OPTIONS: SelectOption[] = [
  { value: "SIM", label: "Sim, eu gostaria" },
  { value: "NAO", label: "Não, prefiro presencial" },
];

const PRINCIPAL_OPTIONS: SelectOption[] = [
  { value: "NAO", label: "Não" },
  { value: "SIM", label: "Sim" },
];

const ESTADOS_OPTIONS: SelectOption[] = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const IDIOMA_NIVEL_OPTIONS = [
  { value: "BASICO", label: "Básico" },
  { value: "INTERMEDIARIO", label: "Intermediário" },
  { value: "AVANCADO", label: "Avançado" },
  { value: "FLUENTE", label: "Fluente" },
  { value: "NATIVO", label: "Nativo" },
] as const;

const IDIOMA_BASE_OPTIONS = [
  "Inglês",
  "Espanhol",
  "Francês",
  "Alemão",
  "Italiano",
  "Japonês",
  "Mandarim",
  "Coreano",
  "Árabe",
  "Russo",
  "Libras",
] as const;

const IDIOMAS_OPTIONS: MultiSelectOption[] = IDIOMA_BASE_OPTIONS.flatMap(
  (idioma) =>
    IDIOMA_NIVEL_OPTIONS.map((nivel) => ({
      value: `${idioma}__${nivel.value}`,
      label: `${idioma} - ${nivel.label}`,
    })),
);

const ACESSIBILIDADE_ACOMODACAO_OPTIONS: SelectOption[] = [
  { value: "ACESSO_CADEIRANTE", label: "Acesso para cadeira de rodas" },
  { value: "MOBILIDADE_REDUZIDA", label: "Mobilidade reduzida" },
  { value: "LEITOR_TELA", label: "Leitor de tela" },
  { value: "AMPLIACAO_TEXTO", label: "Ampliação de texto" },
  { value: "LIBRAS", label: "Intérprete de Libras" },
  { value: "LEGENDAS", label: "Legendas" },
  { value: "AUDIO_DESCRICAO", label: "Audiodescrição" },
  { value: "NEURODIVERGENCIA", label: "Neurodivergência" },
  { value: "OUTROS", label: "Outros" },
];

const CURRICULO_STEPS = [
  { t: "Dados iniciais", d: "Título, resumo, objetivo e acessibilidade" },
  { t: "Preferências", d: "Preferências e habilidades" },
  { t: "Experiência", d: "Experiências profissionais" },
  { t: "Formação", d: "Formação e certificados" },
  { t: "Revisão", d: "Conferência final" },
] as const;

// Converte valor mascarado (R$ 2.999,90) para número (2999.90)
function parseCurrencyToNumber(value: string): number {
  if (!value) return 0;
  const filtered = value.replace(/[^\d.,-]/g, "").trim();
  if (!filtered) return 0;

  const lastComma = filtered.lastIndexOf(",");
  const lastDot = filtered.lastIndexOf(".");

  let normalized = filtered;

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      normalized = filtered.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = filtered.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    normalized = filtered.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = filtered.replace(/,/g, "");
  }

  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseIsoDateToDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function labelsFromOptions(
  options: SelectOption[],
  values: string[],
): string[] {
  const allowed = new Map(options.map((o) => [o.value, o.label]));
  return values.map((v) => allowed.get(v) ?? v);
}

function isEmptyTechnicalSkillRow(item: TechnicalSkillFormItem): boolean {
  return (
    !item.nome.trim() && !item.nivel && !(item.anosExperiencia || "").trim()
  );
}

function createLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toIsoDate(value: Date | null | undefined): string | undefined {
  if (!value) return undefined;
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseIntLike(value: string): number | null {
  const raw = (value || "").replace(/[^\d]/g, "");
  if (!raw) return null;
  const num = Number.parseInt(raw, 10);
  return Number.isFinite(num) ? num : null;
}

function formatDateShort(value: Date | null | undefined): string {
  if (!value) return "";
  const dd = String(value.getDate()).padStart(2, "0");
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const yyyy = value.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatExperiencePeriod(
  dataInicio?: Date | null,
  dataFim?: Date | null,
  atual?: boolean,
): string {
  const inicio = formatDateShort(dataInicio);
  const fim = formatDateShort(dataFim);
  if (!inicio && !fim && !atual) return "—";
  if (inicio && atual) return `${inicio} • Atual`;
  if (inicio && fim) return `${inicio} → ${fim}`;
  return inicio || fim || "—";
}

function coerceCurriculoPrincipalInfo(value: unknown): CurriculoPrincipalInfo {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.principal !== true) return null;
  if (typeof v.id !== "string") return null;
  const titulo =
    typeof v.titulo === "string" && v.titulo.trim() ? v.titulo : "Currículo";
  return { id: v.id, titulo };
}

export function CreateCurriculoForm({
  onSuccess,
  onCancel,
  mode = "create",
  curriculoId,
}: CreateCurriculoFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");

  const {
    data: curriculosRaw,
    isLoading: isLoadingCurriculos,
    isError: isErrorCurriculos,
  } = useQuery({
    queryKey: ["aluno-candidato", "curriculos"],
    queryFn: () => listCurriculos(),
    staleTime: 30 * 1000,
    retry: 1,
    enabled: !isEditMode,
  });

  const curriculosCount = useMemo(() => {
    if (!Array.isArray(curriculosRaw)) return null;
    return curriculosRaw.length;
  }, [curriculosRaw]);

  const existingPrincipal = useMemo<CurriculoPrincipalInfo>(() => {
    if (!Array.isArray(curriculosRaw)) return null;
    for (const item of curriculosRaw) {
      const info = coerceCurriculoPrincipalInfo(item);
      if (info) return info;
    }
    return null;
  }, [curriculosRaw]);

  const isFirstCurriculo = curriculosCount === 0;

  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [principalChoice, setPrincipalChoice] = useState<string | null>(null);
  const [showPrincipalConfirm, setShowPrincipalConfirm] = useState(false);

  const [necessitaAcomodacoes, setNecessitaAcomodacoes] = useState(false);
  const [tipoAcomodacao, setTipoAcomodacao] = useState<string[]>([]);
  const [acessibilidadeDescricao, setAcessibilidadeDescricao] = useState("");
  const [horariosFlexiveis, setHorariosFlexiveis] = useState(true);
  const [trabalhoRemotoAcessibilidade, setTrabalhoRemotoAcessibilidade] =
    useState(true);

  const [compartilharDados, setCompartilharDados] = useState(true);
  const [receberOfertas, setReceberOfertas] = useState(true);
  const [autorizarContato, setAutorizarContato] = useState(true);
  const [aceitaLGPD, setAceitaLGPD] = useState(true);
  const [dataConsentimento, setDataConsentimento] = useState<string | null>(
    null,
  );

  const [areaInteresseId, setAreaInteresseId] = useState<string | null>(null);
  const [subareasInteresseIds, setSubareasInteresseIds] = useState<string[]>(
    [],
  );
  const [modalidade, setModalidade] = useState<string[]>([]);
  const [regime, setRegime] = useState<string[]>([]);
  const [jornada, setJornada] = useState<string[]>([]);
  const [salarioMinimo, setSalarioMinimo] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [remotoChoice, setRemotoChoice] = useState<string | null>(null);
  const [hasTouchedLocation, setHasTouchedLocation] = useState(false);

  const [cidadeOptions, setCidadeOptions] = useState<SelectOption[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [citiesCache, setCitiesCache] = useState<
    Record<string, SelectOption[]>
  >({});

  const [habilidadesTecnicas, setHabilidadesTecnicas] = useState<
    TechnicalSkillFormItem[]
  >([]);
  const [idiomasSelectedValues, setIdiomasSelectedValues] = useState<string[]>(
    [],
  );
  const [experiencias, setExperiencias] = useState<ExperienceFormItem[]>([]);
  const [formacoes, setFormacoes] = useState<EducationFormItem[]>([]);
  const [cursos, setCursos] = useState<CursoFormItem[]>([]);
  const [certificacoes, setCertificacoes] = useState<CertificacaoFormItem[]>(
    [],
  );
  const [premios, setPremios] = useState<PremioFormItem[]>([]);
  const [publicacoes, setPublicacoes] = useState<PublicacaoFormItem[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [step4OpenFormacao, setStep4OpenFormacao] = useState(true);
  const [step4OpenCursos, setStep4OpenCursos] = useState(false);
  const [step4OpenPremios, setStep4OpenPremios] = useState(false);

  const formacaoFilledCount = useMemo(() => {
    return (formacoes || []).filter((r) => !isEmptyEducationRow(r)).length;
  }, [formacoes]);

  const cursosFilledCount = useMemo(() => {
    return (cursos || []).filter((r) => !isEmptyCursoRow(r)).length;
  }, [cursos]);

  const certificacoesFilledCount = useMemo(() => {
    return (certificacoes || []).filter((r) => !isEmptyCertificacaoRow(r))
      .length;
  }, [certificacoes]);

  const premiosFilledCount = useMemo(() => {
    return (premios || []).filter((r) => !isEmptyPremioRow(r)).length;
  }, [premios]);

  const publicacoesFilledCount = useMemo(() => {
    return (publicacoes || []).filter((r) => !isEmptyPublicacaoRow(r)).length;
  }, [publicacoes]);

  const experienciasFilledCount = useMemo(() => {
    return (experiencias || []).filter(
      (r) =>
        !(
          !r.empresa.trim() &&
          !r.cargo.trim() &&
          !r.dataInicio &&
          !r.dataFim &&
          !r.descricao.trim()
        ),
    ).length;
  }, [experiencias]);

  const habilidadesFilledCount = useMemo(() => {
    return (habilidadesTecnicas || []).filter(
      (r) => !isEmptyTechnicalSkillRow(r),
    ).length;
  }, [habilidadesTecnicas]);

  const step4HasFormacaoError = Boolean(errors.formacao);
  const step4HasCursosError = Boolean(
    errors.cursosCertificacoes || errors.certificacoes,
  );
  const step4HasPremiosError = Boolean(
    errors.premiosPublicacoes || errors.publicacoes,
  );

  useEffect(() => {
    if (step !== 4) return;
    if (errors.formacao) setStep4OpenFormacao(true);
    if (errors.cursosCertificacoes || errors.certificacoes) {
      setStep4OpenCursos(true);
    }
    if (errors.premiosPublicacoes || errors.publicacoes) {
      setStep4OpenPremios(true);
    }
  }, [
    errors.certificacoes,
    errors.cursosCertificacoes,
    errors.formacao,
    errors.premiosPublicacoes,
    errors.publicacoes,
    step,
  ]);

  const { data: areasInteresseRaw, isLoading: isLoadingAreasInteresse } =
    useQuery({
      queryKey: ["aluno-candidato", "areas-interesse"],
      queryFn: () => listAreasInteresse(),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  const areasInteresseOptions = useMemo<SelectOption[]>(() => {
    if (!Array.isArray(areasInteresseRaw)) return [];
    const merged: SelectOption[] = areasInteresseRaw
      .map((a) => {
        if (!a || typeof a !== "object") return null;
        const id = (a as any).id;
        const categoria = (a as any).categoria;
        if (
          (typeof id !== "number" && typeof id !== "string") ||
          typeof categoria !== "string"
        ) {
          return null;
        }
        return { value: String(id), label: categoria } satisfies SelectOption;
      })
      .filter((v): v is SelectOption => Boolean(v));
    merged.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    return merged;
  }, [areasInteresseRaw]);

  const isAreasInteresseEmpty =
    !isLoadingAreasInteresse && areasInteresseOptions.length === 0;

  const areaInteresseLabel = useMemo(() => {
    if (!areaInteresseId) return "";
    return areasInteresseOptions.find((o) => o.value === areaInteresseId)
      ?.label;
  }, [areaInteresseId, areasInteresseOptions]);

  const selectedAreaFromApi = useMemo(() => {
    if (!Array.isArray(areasInteresseRaw) || !areaInteresseId) return null;
    return (
      areasInteresseRaw.find((a: any) => String(a?.id) === areaInteresseId) ??
      null
    );
  }, [areasInteresseRaw, areaInteresseId]);

  const shouldFetchSubareas =
    Boolean(areaInteresseId) &&
    (!Array.isArray((selectedAreaFromApi as any)?.subareas) ||
      (selectedAreaFromApi as any)?.subareas?.length === 0);

  const { data: subareasFallbackRaw, isLoading: isLoadingSubareasFallback } =
    useQuery({
      queryKey: ["aluno-candidato", "subareas-interesse", areaInteresseId],
      queryFn: () => listSubareasInteresse(areaInteresseId || undefined),
      enabled: shouldFetchSubareas,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  const subareasSource = useMemo(() => {
    const embedded = (selectedAreaFromApi as any)?.subareas;
    if (Array.isArray(embedded) && embedded.length > 0) return embedded;
    if (Array.isArray(subareasFallbackRaw)) return subareasFallbackRaw;
    return [];
  }, [selectedAreaFromApi, subareasFallbackRaw]);

  const subareasInteresseOptions = useMemo<MultiSelectOption[]>(() => {
    if (!Array.isArray(subareasSource)) return [];
    const merged: MultiSelectOption[] = subareasSource
      .map((s: any) => {
        const id = s?.id;
        const nome = s?.nome;
        if (
          (typeof id !== "number" && typeof id !== "string") ||
          typeof nome !== "string"
        ) {
          return null;
        }
        return { value: String(id), label: nome } satisfies MultiSelectOption;
      })
      .filter((v: any): v is MultiSelectOption => Boolean(v));
    merged.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    return merged;
  }, [subareasSource]);

  const subareasSelected = useMemo<MultiSelectOption[]>(() => {
    const selected = new Set(subareasInteresseIds);
    return subareasInteresseOptions.filter((o) => selected.has(o.value));
  }, [subareasInteresseIds, subareasInteresseOptions]);

  const subareasSelectedLabels = useMemo(() => {
    if (subareasSelected.length === 0) return [];
    return subareasSelected.map((s) => s.label);
  }, [subareasSelected]);

  const modalidadeSelected = useMemo<MultiSelectOption[]>(() => {
    const selected = new Set(modalidade);
    return MODALIDADE_OPTIONS.filter((o) => selected.has(o.value));
  }, [modalidade]);
  const regimeSelected = useMemo<MultiSelectOption[]>(() => {
    const selected = new Set(regime);
    return REGIME_OPTIONS.filter((o) => selected.has(o.value));
  }, [regime]);
  const jornadaSelected = useMemo<MultiSelectOption[]>(() => {
    const selected = new Set(jornada);
    return JORNADA_OPTIONS.filter((o) => selected.has(o.value));
  }, [jornada]);

  const idiomasSelected = useMemo<MultiSelectOption[]>(() => {
    const selected = new Set(idiomasSelectedValues);
    return IDIOMAS_OPTIONS.filter((o) => selected.has(o.value));
  }, [idiomasSelectedValues]);

  const idiomasSelectedLabels = useMemo(() => {
    if (idiomasSelected.length === 0) return [];
    return idiomasSelected.map((i) => i.label);
  }, [idiomasSelected]);

  const tipoAcomodacaoSelected = useMemo<MultiSelectOption[]>(() => {
    const selected = new Set(tipoAcomodacao);
    return (ACESSIBILIDADE_ACOMODACAO_OPTIONS as MultiSelectOption[]).filter(
      (o) => selected.has(o.value),
    );
  }, [tipoAcomodacao]);

  const tipoAcomodacaoLabels = useMemo(() => {
    if (!tipoAcomodacao.length) return [];
    return labelsFromOptions(ACESSIBILIDADE_ACOMODACAO_OPTIONS, tipoAcomodacao);
  }, [tipoAcomodacao]);

  const totalSteps = CURRICULO_STEPS.length;
  const isFirstStep = step === 1;
  const isLastStep = step === totalSteps;
  const isBootstrappingCurriculos =
    isLoadingCurriculos && curriculosCount === null;

  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
  } = useQuery<UsuarioProfileResponse>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await getUserProfile();
      if (
        !response ||
        !("success" in response) ||
        response.success !== true ||
        !("usuario" in response) ||
        !("stats" in response)
      ) {
        throw new Error("Erro ao carregar perfil");
      }
      return response as UsuarioProfileResponse;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isInitialPageLoadingBase =
    isBootstrappingCurriculos || isLoadingProfile || isLoadingAreasInteresse;

  const profileLocation = useMemo(() => {
    if (!profileResponse?.usuario) return null;
    const usuario = profileResponse.usuario;
    const endereco =
      usuario.enderecos?.find((e) => e?.principal) ?? usuario.enderecos?.[0];
    const estadoProfile =
      endereco?.estado?.trim() ||
      usuario.estado?.trim() ||
      usuario.enderecos?.[0]?.estado?.trim() ||
      "";
    const cidadeProfile =
      endereco?.cidade?.trim() ||
      usuario.cidade?.trim() ||
      usuario.enderecos?.[0]?.cidade?.trim() ||
      "";

    return {
      estado: estadoProfile ? estadoProfile.toUpperCase() : "",
      cidade: cidadeProfile,
    };
  }, [profileResponse]);

  const principal = useMemo(() => principalChoice === "SIM", [principalChoice]);
  const aceitaRemoto = useMemo(() => remotoChoice === "SIM", [remotoChoice]);

  useEffect(() => {
    if (!isErrorProfile) return;
    toastCustom.error({
      title: "Erro ao carregar perfil",
      description: "Não foi possível carregar cidade/estado do seu perfil.",
    });
  }, [isErrorProfile]);

  useEffect(() => {
    if (isEditMode) return;
    if (curriculosCount === null) return;

    // Primeiro currículo: sempre principal e bloqueado
    if (curriculosCount === 0) {
      setPrincipalChoice("SIM");
      return;
    }

    // Já tem currículos: por padrão "Não" (sem sobrescrever escolha manual)
    setPrincipalChoice((prev) => prev ?? "NAO");
  }, [curriculosCount, isEditMode]);

  const {
    data: curriculoEditRaw,
    isLoading: isLoadingCurriculoEdit,
    isError: isErrorCurriculoEdit,
  } = useQuery({
    queryKey: ["aluno-candidato", "curriculo", curriculoId],
    queryFn: async () => {
      if (!curriculoId) throw new Error("Currículo inválido");
      return getCurriculo(curriculoId);
    },
    enabled: isEditMode && Boolean(curriculoId),
    staleTime: 0,
    retry: 1,
  });

  const curriculoEdit = useMemo<Curriculo | null>(() => {
    if (!curriculoEditRaw || typeof curriculoEditRaw !== "object") return null;
    const v = curriculoEditRaw as Record<string, unknown>;
    if (typeof v.id !== "string") return null;
    return curriculoEditRaw as Curriculo;
  }, [curriculoEditRaw]);

  const [hasPrefilledEdit, setHasPrefilledEdit] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    if (!curriculoEdit) return;
    if (hasPrefilledEdit) return;

    setTitulo(String((curriculoEdit as any)?.titulo ?? ""));
    setResumo(
      typeof (curriculoEdit as any)?.resumo === "string"
        ? (curriculoEdit as any).resumo
        : "",
    );
    setObjetivo(
      typeof (curriculoEdit as any)?.objetivo === "string"
        ? (curriculoEdit as any).objetivo
        : "",
    );

    const principalValue = coerceBoolean((curriculoEdit as any)?.principal);
    setPrincipalChoice(principalValue === true ? "SIM" : "NAO");

    const acessibilidade = (curriculoEdit as any)?.acessibilidade;
    if (acessibilidade && typeof acessibilidade === "object") {
      const necessita = coerceBoolean(
        (acessibilidade as any)?.necessitaAcomodacoes,
      );
      setNecessitaAcomodacoes(necessita === true);
      const tipos = Array.isArray((acessibilidade as any)?.tipoAcomodacao)
        ? ((acessibilidade as any).tipoAcomodacao as unknown[]).map(String)
        : [];
      setTipoAcomodacao(tipos);
      setAcessibilidadeDescricao(
        typeof (acessibilidade as any)?.descricao === "string"
          ? (acessibilidade as any).descricao
          : "",
      );
      const disponibilidade = (acessibilidade as any)?.disponibilidade;
      if (disponibilidade && typeof disponibilidade === "object") {
        const flex = coerceBoolean((disponibilidade as any)?.horariosFlexiveis);
        const remoto = coerceBoolean((disponibilidade as any)?.trabalhoRemoto);
        if (flex !== null) setHorariosFlexiveis(flex);
        if (remoto !== null) setTrabalhoRemotoAcessibilidade(remoto);
      }
    }

    const consent = (curriculoEdit as any)?.consentimentos;
    if (consent && typeof consent === "object") {
      const cd = coerceBoolean((consent as any)?.compartilharDados);
      const ro = coerceBoolean((consent as any)?.receberOfertas);
      const ac = coerceBoolean((consent as any)?.autorizarContato);
      const lgpd = coerceBoolean((consent as any)?.aceitaLGPD);
      if (cd !== null) setCompartilharDados(cd);
      if (ro !== null) setReceberOfertas(ro);
      if (ac !== null) setAutorizarContato(ac);
      if (lgpd !== null) setAceitaLGPD(lgpd);
      setDataConsentimento(
        typeof (consent as any)?.dataConsentimento === "string"
          ? (consent as any).dataConsentimento
          : null,
      );
    }

    const areasInteresse = (curriculoEdit as any)?.areasInteresse;
    const firstArea =
      areasInteresse &&
      typeof areasInteresse === "object" &&
      Array.isArray((areasInteresse as any)?.areas)
        ? (areasInteresse as any).areas?.[0]
        : null;
    if (firstArea && typeof firstArea === "object") {
      const areaId = (firstArea as any)?.areaId;
      if (typeof areaId === "number" || typeof areaId === "string") {
        setAreaInteresseId(String(areaId));
      }
      const subareas = Array.isArray((firstArea as any)?.subareas)
        ? (firstArea as any).subareas
        : [];
      const ids = subareas
        .map((s: any) => s?.subareaId)
        .filter((v: any) => typeof v === "number" || typeof v === "string")
        .map((v: any) => String(v));
      setSubareasInteresseIds(ids);
    }

    const preferencias = (curriculoEdit as any)?.preferencias;
    if (preferencias && typeof preferencias === "object") {
      const mod = Array.isArray((preferencias as any)?.modalidade)
        ? (preferencias as any).modalidade.map(String)
        : [];
      const reg = Array.isArray((preferencias as any)?.regime)
        ? (preferencias as any).regime.map(String)
        : [];
      const jor = Array.isArray((preferencias as any)?.jornada)
        ? (preferencias as any).jornada.map(String)
        : [];
      setModalidade(mod);
      setRegime(reg);
      setJornada(jor);

      const salary = (preferencias as any)?.salarioMinimo;
      const salaryNum =
        typeof salary === "number"
          ? salary
          : typeof salary === "string"
            ? Number.parseFloat(salary)
            : NaN;
      setSalarioMinimo(
        Number.isFinite(salaryNum) ? formatCurrencyBRL(salaryNum) : "",
      );

      const localizacao = (preferencias as any)?.localizacao;
      if (localizacao && typeof localizacao === "object") {
        const cidadeStr =
          typeof (localizacao as any)?.cidade === "string"
            ? (localizacao as any).cidade
            : "";
        const estadoStr =
          typeof (localizacao as any)?.estado === "string"
            ? (localizacao as any).estado
            : "";
        setCidade(cidadeStr);
        setEstado(estadoStr.toUpperCase());
        const remoto = coerceBoolean((localizacao as any)?.aceitaRemoto);
        setRemotoChoice(remoto === null ? null : remoto ? "SIM" : "NAO");
        setHasTouchedLocation(true);
      }
    }

    const habilidades =
      (curriculoEdit as any)?.habilidades &&
      typeof (curriculoEdit as any).habilidades === "object"
        ? (curriculoEdit as any).habilidades
        : null;
    const tecnicas = habilidades ? (habilidades as any)?.tecnicas : null;
    if (Array.isArray(tecnicas)) {
      setHabilidadesTecnicas(
        tecnicas
          .filter((t: any) => t && typeof t === "object")
          .slice(0, 30)
          .map((t: any) => ({
            id: createLocalId(),
            nome: String(t?.nome ?? ""),
            nivel: (t?.nivel ?? null) as any,
            anosExperiencia:
              typeof t?.anosExperiencia === "number"
                ? String(t.anosExperiencia)
                : String(t?.anosExperiencia ?? ""),
          })),
      );
    }

    const idiomas = Array.isArray((curriculoEdit as any)?.idiomas)
      ? (curriculoEdit as any).idiomas
      : [];
    setIdiomasSelectedValues(
      idiomas
        .map((i: any) => {
          const idioma = typeof i?.idioma === "string" ? i.idioma : "";
          const nivel = typeof i?.nivel === "string" ? i.nivel : "";
          if (!idioma || !nivel) return null;
          return `${idioma}__${nivel}`;
        })
        .filter(Boolean) as string[],
    );

    const expWrapper = (curriculoEdit as any)?.experiencias;
    const expList =
      expWrapper &&
      typeof expWrapper === "object" &&
      Array.isArray((expWrapper as any)?.experiencias)
        ? (expWrapper as any).experiencias
        : [];
    setExperiencias(
      expList
        .filter((e: any) => e && typeof e === "object")
        .slice(0, 5)
        .map((e: any) => ({
          empresa: String(e?.empresa ?? ""),
          cargo: String(e?.cargo ?? ""),
          dataInicio: parseIsoDateToDate(e?.dataInicio),
          dataFim: parseIsoDateToDate(e?.dataFim),
          atual: Boolean(e?.atual),
          descricao: String(e?.descricao ?? ""),
        })),
    );

    const formacao = Array.isArray((curriculoEdit as any)?.formacao)
      ? (curriculoEdit as any).formacao
      : [];
    setFormacoes(
      formacao
        .filter((f: any) => f && typeof f === "object")
        .slice(0, 5)
        .map((f: any) => {
          const status = typeof f?.status === "string" ? f.status : null;
          const emAndamento = status === "EM_ANDAMENTO" || !f?.dataFim;
          return {
            tipo: typeof f?.tipo === "string" ? f.tipo : null,
            curso: String(f?.curso ?? ""),
            instituicao: String(f?.instituicao ?? ""),
            status,
            dataInicio: parseIsoDateToDate(f?.dataInicio),
            dataFim: parseIsoDateToDate(f?.dataFim),
            emAndamento,
          };
        }),
    );

    const cursosCert = (curriculoEdit as any)?.cursosCertificacoes;
    if (cursosCert && typeof cursosCert === "object") {
      const cursosRaw = Array.isArray((cursosCert as any)?.cursos)
        ? (cursosCert as any).cursos
        : [];
      const certsRaw = Array.isArray((cursosCert as any)?.certificacoes)
        ? (cursosCert as any).certificacoes
        : [];
      setCursos(
        cursosRaw
          .filter((c: any) => c && typeof c === "object")
          .slice(0, 5)
          .map((c: any) => ({
            nome: String(c?.nome ?? ""),
            instituicao: String(c?.instituicao ?? ""),
            cargaHoraria:
              typeof c?.cargaHoraria === "number"
                ? String(c.cargaHoraria)
                : String(c?.cargaHoraria ?? ""),
            dataConclusao: parseIsoDateToDate(c?.dataConclusao),
            certificado: Boolean(c?.certificado),
            certificadoUrl: String(c?.certificadoUrl ?? ""),
          })),
      );
      setCertificacoes(
        certsRaw
          .filter((c: any) => c && typeof c === "object")
          .slice(0, 5)
          .map((c: any) => ({
            nome: String(c?.nome ?? ""),
            organizacao: String(c?.organizacao ?? ""),
            numeroCertificado: String(c?.numeroCertificado ?? ""),
            dataEmissao: parseIsoDateToDate(c?.dataEmissao),
            dataExpiracao: parseIsoDateToDate(c?.dataExpiracao),
            certificadoUrl: String(c?.certificadoUrl ?? ""),
          })),
      );
    }

    const premiosPublicacoes = (curriculoEdit as any)?.premiosPublicacoes;
    if (premiosPublicacoes && typeof premiosPublicacoes === "object") {
      const premiosRaw = Array.isArray((premiosPublicacoes as any)?.premios)
        ? (premiosPublicacoes as any).premios
        : [];
      const pubsRaw = Array.isArray((premiosPublicacoes as any)?.publicacoes)
        ? (premiosPublicacoes as any).publicacoes
        : [];
      setPremios(
        premiosRaw
          .filter((p: any) => p && typeof p === "object")
          .slice(0, 5)
          .map((p: any) => ({
            titulo: String(p?.titulo ?? ""),
            organizacao: String(p?.organizacao ?? ""),
            data: parseIsoDateToDate(p?.data),
            descricao: String(p?.descricao ?? ""),
          })),
      );
      setPublicacoes(
        pubsRaw
          .filter((p: any) => p && typeof p === "object")
          .slice(0, 5)
          .map((p: any) => ({
            titulo: String(p?.titulo ?? ""),
            tipo: typeof p?.tipo === "string" ? p.tipo : null,
            veiculo: String(p?.veiculo ?? ""),
            data: parseIsoDateToDate(p?.data),
            url: String(p?.url ?? ""),
          })),
      );
    }

    setHasPrefilledEdit(true);
    setHasTouchedLocation(true);
  }, [curriculoEdit, hasPrefilledEdit, isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;
    if (!isErrorCurriculoEdit) return;
    toastCustom.error({
      title: "Erro ao carregar currículo",
      description: "Não foi possível carregar os dados para edição.",
    });
  }, [isEditMode, isErrorCurriculoEdit]);

  const isBootstrappingEdit =
    isEditMode &&
    Boolean(curriculoId) &&
    !isErrorCurriculoEdit &&
    (isLoadingCurriculoEdit || !hasPrefilledEdit);

  const isInitialPageLoading = isInitialPageLoadingBase || isBootstrappingEdit;

  const fetchCidadesByUf = useCallback(
    async (uf: string, cityToSelect?: string | null) => {
      if (!uf) {
        setCidadeOptions([]);
        return;
      }

      const cached = citiesCache[uf];
      if (cached) {
        setCidadeOptions(cached);
        if (cityToSelect) {
          const found = cached.find(
            (c) => c.label.toLowerCase() === cityToSelect.toLowerCase(),
          );
          if (found) setCidade(found.value);
        }
        return;
      }

      setIsLoadingCidades(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
        );
        if (!response.ok) throw new Error("Erro ao carregar cidades");
        const data: Array<{ nome: string }> = await response.json();
        const options = data.map((item) => ({
          value: item.nome,
          label: item.nome,
        }));
        setCidadeOptions(options);
        setCitiesCache((prev) => ({ ...prev, [uf]: options }));

        if (cityToSelect) {
          const found = options.find(
            (c) => c.label.toLowerCase() === cityToSelect.toLowerCase(),
          );
          if (found) setCidade(found.value);
        }
      } catch (error) {
        console.error("Erro ao carregar cidades do estado:", uf, error);
        setCidadeOptions([]);
      } finally {
        setIsLoadingCidades(false);
      }
    },
    [citiesCache],
  );

  const applyEstadoChange = useCallback(
    async (nextUf: string, cityToSelect?: string | null) => {
      const uf = (nextUf || "").trim().toUpperCase();
      setEstado(uf);
      setCidade("");
      setCidadeOptions([]);

      if (uf) {
        await fetchCidadesByUf(uf, cityToSelect);
      }
    },
    [fetchCidadesByUf],
  );

  const handleEstadoChange = useCallback(
    (value: string | null) => {
      setHasTouchedLocation(true);
      void applyEstadoChange(value ?? "");
    },
    [applyEstadoChange],
  );

  const handleCidadeChange = useCallback((value: string | null) => {
    setHasTouchedLocation(true);
    setCidade(value ?? "");
  }, []);

  useEffect(() => {
    if (hasTouchedLocation) return;
    if (!profileLocation?.estado) return;
    if (estado.trim() || cidade.trim()) return;

    void applyEstadoChange(profileLocation.estado, profileLocation.cidade);
  }, [applyEstadoChange, cidade, estado, hasTouchedLocation, profileLocation]);

  const clearError = (field: keyof CreateCurriculoPayload | string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!titulo.trim()) {
        newErrors.titulo = "Título é obrigatório";
      }
      if (titulo && titulo.length > 255) {
        newErrors.titulo = "Título deve ter no máximo 255 caracteres";
      }
      if (resumo && resumo.length > 5000) {
        newErrors.resumo = "Resumo deve ter no máximo 5000 caracteres";
      }
      if (objetivo && objetivo.length > 1000) {
        newErrors.objetivo = "Objetivo deve ter no máximo 1000 caracteres";
      }
      if (principalChoice !== "SIM" && principalChoice !== "NAO") {
        newErrors.principal = "Informe se este currículo é principal";
      } else if (isFirstCurriculo && principalChoice !== "SIM") {
        newErrors.principal = "O primeiro currículo deve ser principal";
      }

      if (necessitaAcomodacoes && tipoAcomodacao.length === 0) {
        newErrors.tipoAcomodacao =
          "Informe pelo menos um tipo de acomodação (ou desmarque se não precisar).";
      }

      if (!aceitaLGPD) {
        newErrors.aceitaLGPD = "Você precisa aceitar a LGPD para continuar.";
      }
    }

    if (currentStep === 2) {
      if (!areaInteresseId) {
        newErrors.areaInteresseId = "Área de interesse é obrigatória";
      }

      if (remotoChoice !== "SIM" && remotoChoice !== "NAO") {
        newErrors.remotoChoice = "Trabalhos remotos é obrigatório";
      }

      if (modalidade.length === 0) {
        newErrors.modalidade = "Modalidade é obrigatória";
      }
      if (regime.length === 0) {
        newErrors.regime = "Regime é obrigatório";
      }
      if (jornada.length === 0) {
        newErrors.jornada = "Jornada é obrigatória";
      }

      const estadoTrimmed = estado.trim();
      if (!estadoTrimmed) {
        newErrors.estado = "Estado é obrigatório";
      } else if (estadoTrimmed.length !== 2) {
        newErrors.estado = "Estado deve ter 2 letras";
      }

      if (!cidade.trim()) {
        newErrors.cidade = "Cidade é obrigatória";
      }

      if (!salarioMinimo.trim()) {
        newErrors.salarioMinimo = "Pretensão salarial é obrigatória";
      } else {
        const digits = salarioMinimo.replace(/[^\d]/g, "");
        const salary = parseCurrencyToNumber(salarioMinimo);
        if (!digits || salary <= 0) {
          newErrors.salarioMinimo = "Informe uma pretensão salarial válida";
        }
      }

      const filledRows = (habilidadesTecnicas || []).filter(
        (r) => !isEmptyTechnicalSkillRow(r),
      );
      const hasInvalid = filledRows.some((r) => {
        const nomeOk = Boolean(r.nome?.trim());
        const nivelOk = Boolean(r.nivel);
        const anos = String(r.anosExperiencia || "").trim();
        const anosOk = Boolean(anos);
        return !(nomeOk && nivelOk && anosOk);
      });
      if (hasInvalid) {
        newErrors.habilidadesTecnicas =
          "Preencha tecnologia, nível e anos de experiência para cada habilidade.";
      }
    }

    if (currentStep === 3) {
      const filled = (experiencias || []).filter((r) => {
        return !(
          !r.empresa.trim() &&
          !r.cargo.trim() &&
          !r.dataInicio &&
          !r.dataFim &&
          !r.descricao.trim()
        );
      });

      const atuaisCount = filled.filter((r) => r.atual).length;
      if (atuaisCount > 1) {
        newErrors.experiencias =
          "Você pode marcar apenas 1 emprego atual por vez.";
      }

      const hasInvalid = filled.some((r) => {
        const empresaOk = Boolean(r.empresa?.trim());
        const cargoOk = Boolean(r.cargo?.trim());
        const inicioOk = Boolean(r.dataInicio);
        const fimOk = r.atual ? true : Boolean(r.dataFim);
        const orderOk =
          r.atual || !r.dataInicio || !r.dataFim
            ? true
            : r.dataInicio.getTime() <= r.dataFim.getTime();
        return !(empresaOk && cargoOk && inicioOk && fimOk && orderOk);
      });

      if (!newErrors.experiencias && hasInvalid) {
        newErrors.experiencias =
          "Revise as experiências: empresa, cargo e data de início são obrigatórios; se não for atual, informe a data de fim.";
      }
    }

    if (currentStep === 4) {
      const filledFormacoes = (formacoes || []).filter(
        (r) => !isEmptyEducationRow(r),
      );
      const invalidFormacao = filledFormacoes.some((r) => {
        const isOngoing = Boolean(r.emAndamento) || r.status === "EM_ANDAMENTO";
        const tipoOk = Boolean(r.tipo);
        const cursoOk = Boolean(r.curso.trim());
        const instituicaoOk = Boolean(r.instituicao.trim());
        const inicioOk = Boolean(r.dataInicio);
        const fimOk = isOngoing ? true : Boolean(r.dataFim);
        const orderOk =
          isOngoing || !r.dataInicio || !r.dataFim
            ? true
            : r.dataInicio.getTime() <= r.dataFim.getTime();
        const statusOk = isOngoing ? true : Boolean(r.status);
        return !(
          tipoOk &&
          cursoOk &&
          instituicaoOk &&
          inicioOk &&
          fimOk &&
          orderOk &&
          statusOk
        );
      });
      if (invalidFormacao) {
        newErrors.formacao =
          "Revise a formação: tipo, curso, instituição e data de início são obrigatórios; se não estiver em andamento, informe a data de fim.";
      }

      const filledCursos = (cursos || []).filter((r) => !isEmptyCursoRow(r));
      const invalidCursos = filledCursos.some((r) => {
        const nomeOk = Boolean(r.nome.trim());
        const instOk = Boolean(r.instituicao.trim());
        const carga = parseIntLike(r.cargaHoraria);
        const cargaOk = r.cargaHoraria.trim()
          ? Boolean(carga && carga > 0)
          : true;
        const dataOk = Boolean(r.dataConclusao);
        return !(nomeOk && instOk && cargaOk && dataOk);
      });
      if (invalidCursos) {
        newErrors.cursosCertificacoes =
          "Revise os cursos: nome, instituição e data de conclusão são obrigatórios.";
      }

      const filledCerts = (certificacoes || []).filter(
        (r) => !isEmptyCertificacaoRow(r),
      );
      const invalidCerts = filledCerts.some((r) => {
        const nomeOk = Boolean(r.nome.trim());
        const orgOk = Boolean(r.organizacao.trim());
        const dataOk = Boolean(r.dataEmissao);
        const orderOk =
          !r.dataEmissao || !r.dataExpiracao
            ? true
            : r.dataEmissao.getTime() <= r.dataExpiracao.getTime();
        return !(nomeOk && orgOk && dataOk && orderOk);
      });
      if (invalidCerts) {
        newErrors.certificacoes =
          "Revise as certificações: nome, organização e data de emissão são obrigatórios.";
      }

      const filledPremios = (premios || []).filter((r) => !isEmptyPremioRow(r));
      const invalidPremios = filledPremios.some((r) => {
        const tituloOk = Boolean(r.titulo.trim());
        const orgOk = Boolean(r.organizacao.trim());
        const dataOk = Boolean(r.data);
        return !(tituloOk && orgOk && dataOk);
      });
      if (invalidPremios) {
        newErrors.premiosPublicacoes =
          "Revise os prêmios: título, organização e data são obrigatórios.";
      }

      const filledPublicacoes = (publicacoes || []).filter(
        (r) => !isEmptyPublicacaoRow(r),
      );
      const invalidPublicacoes = filledPublicacoes.some((r) => {
        const tituloOk = Boolean(r.titulo.trim());
        const tipoOk = Boolean(r.tipo);
        const veiculoOk = Boolean(r.veiculo.trim());
        const dataOk = Boolean(r.data);
        return !(tituloOk && tipoOk && veiculoOk && dataOk);
      });
      if (invalidPublicacoes) {
        newErrors.publicacoes =
          "Revise as publicações: título, tipo, veículo e data são obrigatórios.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const handlePrincipalChange = (value: string | null) => {
    if (isEditMode) return;
    if (value !== "SIM") {
      setPrincipalChoice(value);
      return;
    }

    if (!isFirstCurriculo && !isErrorCurriculos && existingPrincipal) {
      setShowPrincipalConfirm(true);
      return;
    }

    setPrincipalChoice(value);
  };

  const handlePrevious = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleAreaChange = (value: string | null) => {
    setAreaInteresseId(value);
    setSubareasInteresseIds([]);
    clearError("areaInteresseId");
  };

  const handleSubmit = async () => {
    if (!isEditMode && isLoadingCurriculos) {
      toastCustom.error({
        title: "Aguarde um instante",
        description: "Carregando seus currículos...",
      });
      return;
    }

    if (isEditMode && !curriculoId) {
      toastCustom.error({
        title: "Currículo inválido",
        description: "Não foi possível identificar o currículo para atualizar.",
      });
      return;
    }

    if (!validateStep(step)) return;

    setIsSubmitting(true);
    setLoadingStep(
      isEditMode ? "Atualizando currículo..." : "Salvando currículo...",
    );

    try {
      const emptyOptionalValue = isEditMode ? null : undefined;

      const salarioParsed = salarioMinimo.trim()
        ? parseCurrencyToNumber(salarioMinimo.trim())
        : null;

      const preferencias: Record<string, any> = {
        modalidade: modalidade.length > 0 ? modalidade : undefined,
        regime: regime.length > 0 ? regime : undefined,
        jornada: jornada.length > 0 ? jornada : undefined,
        salarioMinimo: salarioParsed !== null ? salarioParsed : undefined,
        localizacao: {
          cidade: cidade.trim(),
          estado: estado.trim().toUpperCase(),
          aceitaRemoto,
        },
      };

      const hasPreferencias =
        Boolean(preferencias.modalidade?.length) ||
        Boolean(preferencias.regime?.length) ||
        Boolean(preferencias.jornada?.length) ||
        typeof preferencias.salarioMinimo === "number" ||
        Boolean(preferencias.localizacao?.cidade) ||
        Boolean(preferencias.localizacao?.estado) ||
        Boolean(preferencias.localizacao?.aceitaRemoto);

      const tecnicasPayload = (habilidadesTecnicas || [])
        .filter((r) => !isEmptyTechnicalSkillRow(r))
        .map((r) => {
          const anos = Number.parseInt((r.anosExperiencia || "").trim(), 10);
          return {
            nome: r.nome.trim(),
            nivel: (r.nivel || "") as TechnicalSkillLevel,
            anosExperiencia: Number.isFinite(anos) ? anos : 0,
          };
        })
        .filter((r) => Boolean(r.nome) && Boolean(r.nivel));
      const idiomas = idiomasSelectedValues
        .map((value) => {
          const [idioma, nivel] = String(value).split("__");
          if (!idioma || !nivel) return null;
          return { idioma, nivel };
        })
        .filter(Boolean) as Array<{ idioma: string; nivel: string }>;

      const experienciasPayload = (experiencias || [])
        .filter(
          (r) =>
            !(
              !r.empresa.trim() &&
              !r.cargo.trim() &&
              !r.dataInicio &&
              !r.dataFim &&
              !r.descricao.trim()
            ),
        )
        .slice(0, 5)
        .map((r) => ({
          empresa: r.empresa.trim() || undefined,
          cargo: r.cargo.trim() || undefined,
          dataInicio: toIsoDate(r.dataInicio),
          dataFim: r.atual ? null : (toIsoDate(r.dataFim) ?? null),
          atual: Boolean(r.atual),
          descricao: r.descricao.trim() || undefined,
          tecnologias: null,
          conquistas: null,
        }));

      const formacoesPayload = (formacoes || [])
        .filter((r) => !isEmptyEducationRow(r))
        .slice(0, 5)
        .map((r) => {
          const isOngoing =
            Boolean(r.emAndamento) || r.status === "EM_ANDAMENTO";
          return {
            tipo: r.tipo || undefined,
            curso: r.curso.trim() || undefined,
            instituicao: r.instituicao.trim() || undefined,
            status: isOngoing ? "EM_ANDAMENTO" : r.status || undefined,
            dataInicio: toIsoDate(r.dataInicio),
            dataFim: isOngoing ? null : (toIsoDate(r.dataFim) ?? null),
          };
        });

      const cursosPayload = (cursos || [])
        .filter((r) => !isEmptyCursoRow(r))
        .slice(0, 5)
        .map((r) => {
          const carga = parseIntLike(r.cargaHoraria);
          return {
            nome: r.nome.trim() || undefined,
            instituicao: r.instituicao.trim() || undefined,
            cargaHoraria: carga ?? undefined,
            dataConclusao: toIsoDate(r.dataConclusao),
            certificado: Boolean(r.certificado),
            certificadoUrl: r.certificadoUrl.trim() || undefined,
          };
        });

      const certificacoesPayload = (certificacoes || [])
        .filter((r) => !isEmptyCertificacaoRow(r))
        .slice(0, 5)
        .map((r) => ({
          nome: r.nome.trim() || undefined,
          organizacao: r.organizacao.trim() || undefined,
          numeroCertificado: r.numeroCertificado.trim() || undefined,
          dataEmissao: toIsoDate(r.dataEmissao),
          dataExpiracao: toIsoDate(r.dataExpiracao) ?? null,
          certificadoUrl: r.certificadoUrl.trim() || undefined,
        }));

      const premiosPayload = (premios || [])
        .filter((r) => !isEmptyPremioRow(r))
        .slice(0, 5)
        .map((r) => ({
          titulo: r.titulo.trim() || undefined,
          organizacao: r.organizacao.trim() || undefined,
          data: toIsoDate(r.data),
          descricao: r.descricao.trim() || undefined,
        }));

      const publicacoesPayload = (publicacoes || [])
        .filter((r) => !isEmptyPublicacaoRow(r))
        .slice(0, 5)
        .map((r) => ({
          titulo: r.titulo.trim() || undefined,
          tipo: r.tipo || undefined,
          veiculo: r.veiculo.trim() || undefined,
          data: toIsoDate(r.data),
          url: r.url.trim() || undefined,
        }));

      const acessibilidadePayload = {
        necessitaAcomodacoes,
        tipoAcomodacao: necessitaAcomodacoes ? tipoAcomodacao : [],
        descricao: necessitaAcomodacoes
          ? acessibilidadeDescricao.trim() || null
          : null,
        disponibilidade: {
          horariosFlexiveis,
          trabalhoRemoto: trabalhoRemotoAcessibilidade,
        },
      };

      const consentimentosPayload = {
        compartilharDados,
        receberOfertas,
        autorizarContato,
        aceitaLGPD,
        dataConsentimento: isEditMode
          ? (dataConsentimento ?? new Date().toISOString())
          : new Date().toISOString(),
      };

      const areaNome = (areaInteresseLabel || "").trim();
      const areaIdFromState = areaInteresseId?.trim() || "";
      const areaIdParsed = areaIdFromState ? Number(areaIdFromState) : NaN;

      const subareasPayload = subareasInteresseIds
        .map((idStr) => {
          const idNum = Number(idStr);
          if (!Number.isFinite(idNum)) return null;
          const found = subareasInteresseOptions.find((o) => o.value === idStr);
          if (!found?.label) return null;
          return { subareaId: idNum, subareaNome: found.label };
        })
        .filter(Boolean);

      const payload: CreateCurriculoPayload = {
        titulo: titulo.trim(),
        resumo: resumo.trim() || (emptyOptionalValue as any),
        objetivo: objetivo.trim() || (emptyOptionalValue as any),
        principal,
        areasInteresse:
          areaNome && Number.isFinite(areaIdParsed)
            ? ({
                areas: [
                  {
                    areaId: areaIdParsed,
                    areaNome,
                    subareas: subareasPayload,
                  },
                ],
              } as any)
            : (emptyOptionalValue as any),
        preferencias: hasPreferencias
          ? preferencias
          : (emptyOptionalValue as any),
        habilidades:
          tecnicasPayload.length > 0
            ? ({ tecnicas: tecnicasPayload } as any)
            : (emptyOptionalValue as any),
        idiomas:
          idiomas.length > 0 ? (idiomas as any) : (emptyOptionalValue as any),
        experiencias:
          experienciasPayload.length > 0
            ? ({ experiencias: experienciasPayload } as any)
            : (emptyOptionalValue as any),
        formacao:
          formacoesPayload.length > 0
            ? (formacoesPayload as any)
            : (emptyOptionalValue as any),
        cursosCertificacoes:
          cursosPayload.length > 0 || certificacoesPayload.length > 0
            ? ({
                cursos: cursosPayload,
                certificacoes: certificacoesPayload,
              } as any)
            : (emptyOptionalValue as any),
        premiosPublicacoes:
          premiosPayload.length > 0 || publicacoesPayload.length > 0
            ? ({
                premios: premiosPayload,
                publicacoes: publicacoesPayload,
              } as any)
            : (emptyOptionalValue as any),
        acessibilidade: acessibilidadePayload as any,
        consentimentos: consentimentosPayload as any,
      };

      if (isEditMode && curriculoId) {
        await updateCurriculo(curriculoId, payload as any);
      } else {
        await createCurriculo(payload);
      }

      toastCustom.success({
        title: isEditMode ? "Currículo atualizado" : "Currículo criado",
        description: isEditMode
          ? "Seu currículo foi atualizado com sucesso."
          : "Seu currículo foi criado com sucesso.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/curriculo");
      }
    } catch (error: any) {
      console.error(
        isEditMode
          ? "Erro ao atualizar currículo:"
          : "Erro ao criar currículo:",
        error,
      );

      if (error?.code === "CURRICULO_LIMIT") {
        toastCustom.error({
          title: "Limite atingido",
          description: "Você já possui o máximo de 5 currículos.",
        });
      } else if (error?.code === "VALIDATION_ERROR" && error?.issues) {
        const issues = error.issues as Record<string, string[]>;
        const newErrors: FormErrors = {};
        Object.keys(issues).forEach((key) => {
          newErrors[key] = issues[key]?.[0] || "Erro de validação";
        });
        setErrors(newErrors);
        toastCustom.error({
          title: "Erro de validação",
          description: "Verifique os campos destacados.",
        });
      } else {
        toastCustom.error({
          title: isEditMode
            ? "Erro ao atualizar currículo"
            : "Erro ao criar currículo",
          description:
            error?.message ||
            (isEditMode
              ? "Não foi possível atualizar o currículo agora."
              : "Não foi possível criar o currículo agora."),
        });
      }
    } finally {
      setIsSubmitting(false);
      setLoadingStep("");
    }
  };

  if (isInitialPageLoading) {
    return (
      <div className="space-y-6 relative">
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-3 md:grid-cols-5">
            {Array.from({ length: CURRICULO_STEPS.length }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-md bg-white/60 p-3"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-64 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isErrorCurriculoEdit) {
    return (
      <div className="py-12">
        <EmptyState
          title="Não foi possível carregar o currículo"
          description="Tente novamente mais tarde ou volte para a listagem."
          illustration="fileNotFound"
          actions={
            onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="text-sm font-semibold text-[var(--primary-color)]"
              >
                Voltar
              </button>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <FormLoadingModal
        isLoading={isSubmitting}
        title={isEditMode ? "Atualizando currículo..." : "Criando currículo..."}
        loadingStep={loadingStep}
        icon={FileText}
      />

      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
        <Stepper
          value={step}
          onValueChange={() => {}}
          variant="minimal"
          indicators={{
            completed: <Check className="h-3 w-3 text-white" />,
            loading: <Loader2 className="h-3 w-3 animate-spin text-blue-600" />,
          }}
        >
          <StepperNav className="items-center gap-2 md:gap-3 overflow-x-auto pb-2">
            {CURRICULO_STEPS.map((s, idx, arr) => (
              <StepperItem
                key={s.t}
                step={idx + 1}
                isLast={idx === arr.length - 1}
                disabled
                className={`flex-1 min-w-[240px] ${
                  idx + 1 <= step ? "opacity-100" : "opacity-60"
                }`}
              >
                <StepperTrigger
                  disabled
                  className="flex items-center gap-2 text-left rounded-md cursor-default"
                >
                  <StepperIndicator>
                    {idx + 1 < step ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </StepperIndicator>
                  <div className="flex flex-col max-w-[280px] md:max-w-[320px]">
                    <StepperTitle className="!mb-0 !pt-0">{s.t}</StepperTitle>
                    <StepperDescription className="!mt-0">
                      {s.d}
                    </StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator hidden={idx === arr.length - 1} />
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      <div className="bg-white rounded-3xl p-6">
        <Stepper value={step} onValueChange={() => {}} variant="minimal">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isLastStep) {
                handleNext();
                return;
              }
              void handleSubmit();
            }}
            className="flex flex-col gap-8"
          >
            <StepperPanel>
              <StepperContent value={1} className="space-y-6">
                <div className="mb-6">
                  <h3 className="!mb-0">Dados iniciais</h3>
                  <p className="!text-sm">
                    Informe título, resumo, objetivo e preferências de
                    acessibilidade.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Linha 1: Título e principal */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {isBootstrappingCurriculos ? (
                      <div className="space-y-2 md:col-span-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ) : (
                      <SelectCustom
                        label="Principal"
                        placeholder="Selecionar"
                        options={PRINCIPAL_OPTIONS}
                        value={principalChoice}
                        onChange={(v) => {
                          handlePrincipalChange(v);
                          clearError("principal");
                        }}
                        disabled={
                          isSubmitting ||
                          isEditMode ||
                          (isFirstCurriculo && !isErrorCurriculos)
                        }
                        required
                        className="md:col-span-1"
                        error={errors.principal}
                      />
                    )}

                    <InputCustom
                      label="Título do currículo"
                      value={titulo}
                      onChange={(e) => {
                        setTitulo(e.target.value);
                        clearError("titulo");
                      }}
                      placeholder="Ex.: Currículo Principal - Desenvolvedor Full Stack"
                      error={errors.titulo}
                      maxLength={255}
                      disabled={isSubmitting}
                      required
                      className="md:col-span-3"
                    />
                  </div>

                  {/* Linha 2: Resumo e objetivo */}
                  <div className="space-y-4">
                    <RichTextarea
                      label="Resumo profissional"
                      placeholder="Descreva brevemente sua experiência e qualificações..."
                      value={resumo}
                      onChange={(e) => {
                        setResumo((e.target as HTMLTextAreaElement).value);
                        clearError("resumo");
                      }}
                      maxLength={5000}
                      showCharCount
                      error={errors.resumo}
                      disabled={isSubmitting}
                    />

                    <RichTextarea
                      label="Objetivo profissional"
                      placeholder="Ex.: Vaga na área de..."
                      value={objetivo}
                      onChange={(e) => {
                        setObjetivo((e.target as HTMLTextAreaElement).value);
                        clearError("objetivo");
                      }}
                      maxLength={1000}
                      showCharCount
                      error={errors.objetivo}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="text-sm font-semibold text-gray-900">
                      Acessibilidade
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                      <div className="space-y-0.5">
                        <div className="text-md font-medium text-foreground">
                          Necessita acomodações
                        </div>
                        <div className="text-xs text-gray-500">
                          Informe se você precisa de adaptações no processo ou
                          no ambiente.
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                            necessitaAcomodacoes
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {necessitaAcomodacoes ? "Sim" : "Não"}
                        </span>
                        <Switch
                          checked={necessitaAcomodacoes}
                          onCheckedChange={(checked) => {
                            setNecessitaAcomodacoes(checked);
                            clearError("tipoAcomodacao");
                            if (!checked) {
                              setTipoAcomodacao([]);
                              setAcessibilidadeDescricao("");
                            }
                          }}
                          disabled={isSubmitting}
                          aria-label="Alternar necessidade de acomodações"
                          className="shadow-none"
                        />
                      </div>
                    </div>

                    {necessitaAcomodacoes && (
                      <div className="space-y-4">
                        <div>
                          <MultiSelectCustom
                            label="Tipo de acomodação"
                            placeholder="Selecionar"
                            options={
                              ACESSIBILIDADE_ACOMODACAO_OPTIONS as MultiSelectOption[]
                            }
                            value={tipoAcomodacaoSelected}
                            onChange={(opts) => {
                              setTipoAcomodacao(opts.map((o) => o.value));
                              clearError("tipoAcomodacao");
                            }}
                            disabled={isSubmitting}
                            required
                          />
                          {errors.tipoAcomodacao && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.tipoAcomodacao}
                            </p>
                          )}
                        </div>

                        <RichTextarea
                          label="Descrição"
                          placeholder="Descreva as acomodações necessárias..."
                          value={acessibilidadeDescricao}
                          onChange={(e) => {
                            setAcessibilidadeDescricao(
                              (e.target as HTMLTextAreaElement).value,
                            );
                          }}
                          maxLength={2000}
                          showCharCount
                          disabled={isSubmitting}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                        <div className="text-sm font-medium text-foreground">
                          Horários flexíveis
                        </div>
                        <Switch
                          checked={horariosFlexiveis}
                          onCheckedChange={(checked) =>
                            setHorariosFlexiveis(checked)
                          }
                          disabled={isSubmitting}
                          aria-label="Alternar horários flexíveis"
                          className="shadow-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                        <div className="text-sm font-medium text-foreground">
                          Trabalho remoto
                        </div>
                        <Switch
                          checked={trabalhoRemotoAcessibilidade}
                          onCheckedChange={(checked) =>
                            setTrabalhoRemotoAcessibilidade(checked)
                          }
                          disabled={isSubmitting}
                          aria-label="Alternar trabalho remoto"
                          className="shadow-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="text-sm font-semibold text-gray-900">
                      Consentimentos
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                        <div className="text-sm font-medium text-foreground">
                          Compartilhar dados
                        </div>
                        <Switch
                          checked={compartilharDados}
                          onCheckedChange={(checked) =>
                            setCompartilharDados(checked)
                          }
                          disabled={isSubmitting}
                          aria-label="Alternar compartilhamento de dados"
                          className="shadow-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                        <div className="text-sm font-medium text-foreground">
                          Receber ofertas
                        </div>
                        <Switch
                          checked={receberOfertas}
                          onCheckedChange={(checked) =>
                            setReceberOfertas(checked)
                          }
                          disabled={isSubmitting}
                          aria-label="Alternar recebimento de ofertas"
                          className="shadow-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                        <div className="text-sm font-medium text-foreground">
                          Autorizar contato
                        </div>
                        <Switch
                          checked={autorizarContato}
                          onCheckedChange={(checked) =>
                            setAutorizarContato(checked)
                          }
                          disabled={isSubmitting}
                          aria-label="Alternar autorização de contato"
                          className="shadow-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium text-foreground">
                              Aceitar LGPD
                            </div>
                            <div className="text-xs text-gray-500">
                              Obrigatório para cadastrar o currículo.
                            </div>
                          </div>
                          <Switch
                            checked={aceitaLGPD}
                            onCheckedChange={(checked) => {
                              setAceitaLGPD(checked);
                              clearError("aceitaLGPD");
                            }}
                            disabled={isSubmitting}
                            aria-label="Alternar aceite LGPD"
                            className="shadow-none"
                          />
                        </div>
                        {errors.aceitaLGPD && (
                          <p className="text-sm text-destructive">
                            {errors.aceitaLGPD}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </StepperContent>

              <StepperContent value={2} className="space-y-6">
                <div className="mb-6">
                  <h3 className="!mb-0">Preferências e habilidades</h3>
                  <p className="!text-sm">
                    Informe preferências, habilidades técnicas e idiomas.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Linha 1: Área + Subáreas + Remoto */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      {isLoadingAreasInteresse ? (
                        <>
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-12 w-full" />
                        </>
                      ) : (
                        <SelectCustom
                          label="Área de interesse"
                          helperText={
                            isAreasInteresseEmpty
                              ? "Nenhuma área cadastrada. Cadastre em Configurações > Candidatos."
                              : undefined
                          }
                          placeholder="Selecionar"
                          options={areasInteresseOptions}
                          value={areaInteresseId}
                          onChange={handleAreaChange}
                          disabled={isSubmitting || isAreasInteresseEmpty}
                          required
                          error={errors.areaInteresseId}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      {isLoadingSubareasFallback &&
                      Boolean(areaInteresseId) &&
                      subareasInteresseOptions.length === 0 ? (
                        <>
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-12 w-full" />
                        </>
                      ) : (
                        <MultiSelectCustom
                          label="Subáreas"
                          placeholder={
                            areaInteresseId
                              ? "Selecionar até 3"
                              : "Selecione a área"
                          }
                          options={subareasInteresseOptions}
                          value={subareasSelected}
                          onChange={(opts) =>
                            setSubareasInteresseIds(opts.map((o) => o.value))
                          }
                          maxSelected={3}
                          onMaxSelected={() => {
                            toastCustom.error({
                              title: "Limite atingido",
                              description:
                                "Você pode selecionar no máximo 3 subáreas.",
                            });
                          }}
                          disabled={isSubmitting || !areaInteresseId}
                        />
                      )}
                    </div>

                    <SelectCustom
                      label="Trabalhos remotos"
                      placeholder="Selecionar"
                      options={REMOTO_OPTIONS}
                      value={remotoChoice}
                      onChange={(v) => {
                        setRemotoChoice(v);
                        clearError("remotoChoice");
                      }}
                      disabled={isSubmitting}
                      required
                      error={errors.remotoChoice}
                    />
                  </div>

                  {/* Linha 2: Pretensão + Estado + Cidade */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputCustom
                      label="Pretensão salarial (R$)"
                      value={salarioMinimo}
                      onChange={(e) => {
                        setSalarioMinimo(e.target.value);
                        clearError("salarioMinimo");
                      }}
                      placeholder="Ex.: R$ 5.000,00"
                      disabled={isSubmitting}
                      error={errors.salarioMinimo}
                      mask="money"
                      required
                    />

                    <SelectCustom
                      label="Estado"
                      placeholder="Selecionar"
                      options={ESTADOS_OPTIONS}
                      value={estado ? estado : null}
                      onChange={(v) => {
                        handleEstadoChange(v);
                        clearError("estado");
                        clearError("cidade");
                      }}
                      disabled={isSubmitting}
                      error={errors.estado}
                      required
                    />

                    <div className="space-y-2">
                      {isLoadingCidades &&
                      cidadeOptions.length === 0 &&
                      estado ? (
                        <>
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-12 w-full" />
                        </>
                      ) : (
                        <SelectCustom
                          label="Cidade"
                          placeholder={
                            estado
                              ? isLoadingCidades
                                ? "Carregando cidades..."
                                : "Selecionar"
                              : "Selecione o estado"
                          }
                          options={cidadeOptions}
                          value={cidade ? cidade : null}
                          onChange={(v) => {
                            handleCidadeChange(v);
                            clearError("cidade");
                          }}
                          disabled={isSubmitting || !estado || isLoadingCidades}
                          required
                          error={errors.cidade}
                        />
                      )}
                    </div>
                  </div>

                  {/* Linha 3: Modalidade + Regime + Jornada */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <MultiSelectCustom
                        label="Modalidade"
                        placeholder="Selecionar"
                        options={MODALIDADE_OPTIONS as MultiSelectOption[]}
                        value={modalidadeSelected}
                        onChange={(opts) => {
                          setModalidade(opts.map((o) => o.value));
                          clearError("modalidade");
                        }}
                        disabled={isSubmitting}
                        required
                      />
                      {errors.modalidade && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.modalidade}
                        </p>
                      )}
                    </div>
                    <div>
                      <MultiSelectCustom
                        label="Regime"
                        placeholder="Selecionar"
                        options={REGIME_OPTIONS as MultiSelectOption[]}
                        value={regimeSelected}
                        onChange={(opts) => {
                          setRegime(opts.map((o) => o.value));
                          clearError("regime");
                        }}
                        disabled={isSubmitting}
                        required
                      />
                      {errors.regime && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.regime}
                        </p>
                      )}
                    </div>
                    <div>
                      <MultiSelectCustom
                        label="Jornada"
                        placeholder="Selecionar"
                        options={JORNADA_OPTIONS as MultiSelectOption[]}
                        value={jornadaSelected}
                        onChange={(opts) => {
                          setJornada(opts.map((o) => o.value));
                          clearError("jornada");
                        }}
                        disabled={isSubmitting}
                        required
                      />
                      {errors.jornada && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.jornada}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <div className="space-y-4">
                      <TechnicalSkillsEditor
                        value={habilidadesTecnicas}
                        onChange={(next) => {
                          setHabilidadesTecnicas(next);
                          clearError("habilidadesTecnicas");
                        }}
                        disabled={isSubmitting}
                        error={errors.habilidadesTecnicas}
                      />

                      <MultiSelectCustom
                        label="Idiomas"
                        placeholder="Selecionar"
                        options={IDIOMAS_OPTIONS}
                        value={idiomasSelected}
                        onChange={(opts) =>
                          setIdiomasSelectedValues(opts.map((o) => o.value))
                        }
                        maxVisibleTags={999}
                        showCountBadge={false}
                        className="h-auto py-2"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </StepperContent>

              <StepperContent value={3} className="space-y-6">
                <div className="mb-6">
                  <h3 className="!mb-0">Experiência</h3>
                  <p className="!text-sm">
                    Adicione até 5 experiências profissionais.
                  </p>
                </div>

                <div className="space-y-4">
                  <ExperiencesEditor
                    value={experiencias}
                    onChange={(next) => {
                      setExperiencias(next);
                      clearError("experiencias");
                    }}
                    disabled={isSubmitting}
                    error={errors.experiencias}
                    maxItems={5}
                  />
                </div>
              </StepperContent>

              <StepperContent value={4} className="space-y-6">
                <div className="mb-6">
                  <h3 className="!mb-0">Formação</h3>
                  <p className="!text-sm">
                    Adicione formação, cursos e certificações (até 5 em cada).
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-white">
                    <Accordion
                      type="single"
                      collapsible
                      value={step4OpenFormacao ? "formacao" : undefined}
                      onValueChange={(v) =>
                        setStep4OpenFormacao(v === "formacao")
                      }
                      className="p-2"
                    >
                      <AccordionItem value="formacao" className="border-b-0">
                        <AccordionTrigger className="group cursor-pointer items-center rounded-lg px-3 py-3 text-sm font-semibold text-gray-900 no-underline transition-colors hover:bg-gray-50 hover:no-underline active:bg-gray-100 data-[state=open]:bg-gray-50 [&>svg]:translate-y-0 [&>svg]:text-gray-500 group-hover:[&>svg]:text-gray-700 data-[state=open]:[&>svg]:text-gray-700">
                          <div className="flex flex-1 items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  step4HasFormacaoError
                                    ? "bg-destructive"
                                    : formacaoFilledCount > 0
                                      ? "bg-emerald-500"
                                      : "bg-gray-300"
                                }`}
                              />
                              <span>Formação acadêmica</span>
                              {step4HasFormacaoError ? (
                                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-destructive">
                                  Revisar
                                </span>
                              ) : null}
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                step4HasFormacaoError
                                  ? "bg-red-50 text-destructive"
                                  : formacaoFilledCount > 0
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {formacaoFilledCount}/5
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-6">
                          <EducationEditor
                            value={formacoes}
                            onChange={(next) => {
                              setFormacoes(next);
                              clearError("formacao");
                            }}
                            disabled={isSubmitting}
                            error={errors.formacao}
                            maxItems={5}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white">
                    <Accordion
                      type="single"
                      collapsible
                      value={step4OpenCursos ? "cursos" : undefined}
                      onValueChange={(v) => setStep4OpenCursos(v === "cursos")}
                      className="p-2"
                    >
                      <AccordionItem value="cursos" className="border-b-0">
                        <AccordionTrigger className="group cursor-pointer items-center rounded-lg px-3 py-3 text-sm font-semibold text-gray-900 no-underline transition-colors hover:bg-gray-50 hover:no-underline active:bg-gray-100 data-[state=open]:bg-gray-50 [&>svg]:translate-y-0 [&>svg]:text-gray-500 group-hover:[&>svg]:text-gray-700 data-[state=open]:[&>svg]:text-gray-700">
                          <div className="flex flex-1 items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  step4HasCursosError
                                    ? "bg-destructive"
                                    : cursosFilledCount +
                                          certificacoesFilledCount >
                                        0
                                      ? "bg-emerald-500"
                                      : "bg-gray-300"
                                }`}
                              />
                              <span>Cursos e certificações</span>
                              {step4HasCursosError ? (
                                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-destructive">
                                  Revisar
                                </span>
                              ) : null}
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                step4HasCursosError
                                  ? "bg-red-50 text-destructive"
                                  : cursosFilledCount +
                                        certificacoesFilledCount >
                                      0
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {cursosFilledCount + certificacoesFilledCount}/10
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-6">
                          <CursosCertificacoesEditor
                            cursos={cursos}
                            certificacoes={certificacoes}
                            onChangeCursos={(next) => {
                              setCursos(next);
                              clearError("cursosCertificacoes");
                            }}
                            onChangeCertificacoes={(next) => {
                              setCertificacoes(next);
                              clearError("certificacoes");
                            }}
                            disabled={isSubmitting}
                            errorCursos={errors.cursosCertificacoes}
                            errorCertificacoes={errors.certificacoes}
                            maxItems={5}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white">
                    <Accordion
                      type="single"
                      collapsible
                      value={step4OpenPremios ? "premios" : undefined}
                      onValueChange={(v) =>
                        setStep4OpenPremios(v === "premios")
                      }
                      className="p-2"
                    >
                      <AccordionItem value="premios" className="border-b-0">
                        <AccordionTrigger className="group cursor-pointer items-center rounded-lg px-3 py-3 text-sm font-semibold text-gray-900 no-underline transition-colors hover:bg-gray-50 hover:no-underline active:bg-gray-100 data-[state=open]:bg-gray-50 [&>svg]:translate-y-0 [&>svg]:text-gray-500 group-hover:[&>svg]:text-gray-700 data-[state=open]:[&>svg]:text-gray-700">
                          <div className="flex flex-1 items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  step4HasPremiosError
                                    ? "bg-destructive"
                                    : premiosFilledCount +
                                          publicacoesFilledCount >
                                        0
                                      ? "bg-emerald-500"
                                      : "bg-gray-300"
                                }`}
                              />
                              <span>Prêmios e publicações</span>
                              {step4HasPremiosError ? (
                                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-destructive">
                                  Revisar
                                </span>
                              ) : null}
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                step4HasPremiosError
                                  ? "bg-red-50 text-destructive"
                                  : premiosFilledCount +
                                        publicacoesFilledCount >
                                      0
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {premiosFilledCount + publicacoesFilledCount}/10
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4">
                          <PremiosPublicacoesEditor
                            premios={premios}
                            publicacoes={publicacoes}
                            onChangePremios={(next) => {
                              setPremios(next);
                              clearError("premiosPublicacoes");
                            }}
                            onChangePublicacoes={(next) => {
                              setPublicacoes(next);
                              clearError("publicacoes");
                            }}
                            disabled={isSubmitting}
                            errorPremios={errors.premiosPublicacoes}
                            errorPublicacoes={errors.publicacoes}
                            maxItems={5}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </StepperContent>

              <StepperContent value={5} className="space-y-4">
                <div className="mb-6">
                  <h3 className="!mb-0">Revisão</h3>
                  <p className="!text-sm">
                    Confira os dados antes de{" "}
                    {isEditMode ? "salvar" : "cadastrar"}.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/60">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-base! font-semibold! text-gray-900! mb-0!">
                          Informações do Currículo
                        </h4>
                        <p className="text-sm! text-gray-600!">
                          Revise os dados para confirmar antes de{" "}
                          {isEditMode ? "salvar" : "cadastrar"}.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            Experiências: {Math.min(experienciasFilledCount, 5)}
                            /5
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            Formação: {Math.min(formacaoFilledCount, 5)}/5
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            Cursos: {Math.min(cursosFilledCount, 5)}/5
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            Certificações:{" "}
                            {Math.min(certificacoesFilledCount, 5)}/5
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            Habilidades: {habilidadesFilledCount}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            Idiomas: {idiomasSelectedLabels.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            principal
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {principal ? "Currículo principal" : "Não principal"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <section className="rounded-xl border border-gray-200 bg-gray-50/30 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5>Dados iniciais</h5>
                          <ButtonCustom
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep(1)}
                            className="h-8 px-3"
                            disabled={isSubmitting}
                          >
                            Editar
                          </ButtonCustom>
                        </div>
                        <div className="mt-4 space-y-4 text-sm">
                          <div>
                            <div className="text-xs font-medium text-gray-500">
                              Título
                            </div>
                            <div className="mt-1 text-gray-900 font-medium">
                              {titulo.trim() ? titulo.trim() : "—"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-500">
                              Resumo profissional
                            </div>
                            <div className="mt-1 text-gray-900 whitespace-pre-wrap">
                              {resumo.trim() ? resumo.trim() : "—"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-500">
                              Objetivo profissional
                            </div>
                            <div className="mt-1 text-gray-900 whitespace-pre-wrap">
                              {objetivo.trim() ? objetivo.trim() : "—"}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-xl border border-gray-200 bg-gray-50/30 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5>Acessibilidade e consentimentos</h5>
                          <ButtonCustom
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep(1)}
                            className="h-8 px-3"
                            disabled={isSubmitting}
                          >
                            Editar
                          </ButtonCustom>
                        </div>

                        <div className="mt-4 space-y-4 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                necessitaAcomodacoes
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {necessitaAcomodacoes
                                ? "Necessita acomodações"
                                : "Não necessita acomodações"}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                horariosFlexiveis
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {horariosFlexiveis
                                ? "Horários flexíveis"
                                : "Sem horários flexíveis"}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                trabalhoRemotoAcessibilidade
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {trabalhoRemotoAcessibilidade
                                ? "Trabalho remoto"
                                : "Sem trabalho remoto"}
                            </span>
                          </div>

                          {necessitaAcomodacoes ? (
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs font-medium text-gray-500">
                                  Tipo de acomodação
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {tipoAcomodacaoLabels.length > 0 ? (
                                    tipoAcomodacaoLabels.map((label) => (
                                      <span
                                        key={label}
                                        className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800"
                                      >
                                        {label}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-600">—</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-medium text-gray-500">
                                  Descrição
                                </div>
                                <div className="mt-1 text-gray-900 whitespace-pre-wrap">
                                  {acessibilidadeDescricao.trim()
                                    ? acessibilidadeDescricao.trim()
                                    : "—"}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          <div className="pt-2 border-t border-gray-200">
                            <div className="text-xs font-medium text-gray-500">
                              Consentimentos
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {[
                                {
                                  label: "Compartilhar dados",
                                  value: compartilharDados,
                                },
                                {
                                  label: "Receber ofertas",
                                  value: receberOfertas,
                                },
                                {
                                  label: "Autorizar contato",
                                  value: autorizarContato,
                                },
                                { label: "Aceita LGPD", value: aceitaLGPD },
                              ].map((item) => (
                                <span
                                  key={item.label}
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                    item.value
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {item.label}: {item.value ? "Sim" : "Não"}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-xl border border-gray-200 bg-gray-50/30 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5>Preferências</h5>
                          <ButtonCustom
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep(2)}
                            className="h-8 px-3"
                            disabled={isSubmitting}
                          >
                            Editar
                          </ButtonCustom>
                        </div>

                        <div className="mt-4 space-y-4 text-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Área de interesse
                              </div>
                              <div className="mt-1 text-gray-900">
                                {areaInteresseLabel?.trim() || "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Trabalho remoto
                              </div>
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                    aceitaRemoto
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {aceitaRemoto ? "Sim" : "Não"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-500">
                              Subáreas
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {subareasSelectedLabels.length > 0 ? (
                                subareasSelectedLabels.map((label) => (
                                  <span
                                    key={label}
                                    className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800"
                                  >
                                    {label}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Modalidade
                              </div>
                              <div className="mt-1 text-gray-900">
                                {modalidade.length > 0
                                  ? labelsFromOptions(
                                      MODALIDADE_OPTIONS,
                                      modalidade,
                                    ).join(" • ")
                                  : "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Regime
                              </div>
                              <div className="mt-1 text-gray-900">
                                {regime.length > 0
                                  ? labelsFromOptions(
                                      REGIME_OPTIONS,
                                      regime,
                                    ).join(" • ")
                                  : "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Jornada
                              </div>
                              <div className="mt-1 text-gray-900">
                                {jornada.length > 0
                                  ? labelsFromOptions(
                                      JORNADA_OPTIONS,
                                      jornada,
                                    ).join(" • ")
                                  : "—"}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Localização
                              </div>
                              <div className="mt-1 text-gray-900">
                                {[cidade.trim(), estado.trim().toUpperCase()]
                                  .filter(Boolean)
                                  .join(" - ") || "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Pretensão salarial
                              </div>
                              <div className="mt-1 text-gray-900">
                                {salarioMinimo.trim() || "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-xl border border-gray-200 bg-gray-50/30 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5>Habilidades e idiomas</h5>
                          <ButtonCustom
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep(2)}
                            className="h-8 px-3"
                            disabled={isSubmitting}
                          >
                            Editar
                          </ButtonCustom>
                        </div>

                        <div className="mt-4 space-y-4 text-sm">
                          <div>
                            <div className="text-xs font-medium text-gray-500">
                              Habilidades técnicas
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {habilidadesTecnicas.filter(
                                (r) => !isEmptyTechnicalSkillRow(r),
                              ).length > 0 ? (
                                habilidadesTecnicas
                                  .filter((r) => !isEmptyTechnicalSkillRow(r))
                                  .map((r, idx) => (
                                    <span
                                      key={`${r.nome}-${idx}`}
                                      className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary-color)]/10 px-2 py-1 text-xs font-medium text-[var(--primary-color)]"
                                    >
                                      {r.nome.trim()}
                                      {r.nivel ? `• ${r.nivel}` : ""}
                                      {r.anosExperiencia?.trim()
                                        ? `• ${r.anosExperiencia} ano(s)`
                                        : ""}
                                    </span>
                                  ))
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-500">
                              Idiomas
                            </div>
                            <div className="mt-1 text-gray-900">
                              {idiomasSelectedLabels.length > 0
                                ? idiomasSelectedLabels.join(" • ")
                                : "—"}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-xl border border-gray-200 bg-gray-50/30 p-4 lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5>Experiências e formação</h5>
                          <div className="flex items-center gap-2">
                            <ButtonCustom
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setStep(3)}
                              className="h-8 px-3"
                              disabled={isSubmitting}
                            >
                              Editar experiências
                            </ButtonCustom>
                            <ButtonCustom
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setStep(4)}
                              className="h-8 px-3"
                              disabled={isSubmitting}
                            >
                              Editar formação
                            </ButtonCustom>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <div className="text-xs font-medium text-gray-500">
                              Experiências
                            </div>
                            <div className="mt-3 space-y-2">
                              {experiencias.filter(
                                (r) =>
                                  !(
                                    !r.empresa.trim() &&
                                    !r.cargo.trim() &&
                                    !r.dataInicio &&
                                    !r.dataFim &&
                                    !r.descricao.trim()
                                  ),
                              ).length > 0 ? (
                                experiencias
                                  .filter(
                                    (r) =>
                                      !(
                                        !r.empresa.trim() &&
                                        !r.cargo.trim() &&
                                        !r.dataInicio &&
                                        !r.dataFim &&
                                        !r.descricao.trim()
                                      ),
                                  )
                                  .slice(0, 5)
                                  .map((exp, idx) => (
                                    <div
                                      key={`exp-review-${idx}`}
                                      className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                                    >
                                      <div className="text-sm font-medium text-gray-900">
                                        {exp.cargo.trim() || "Cargo"}{" "}
                                        {exp.empresa.trim()
                                          ? `• ${exp.empresa.trim()}`
                                          : ""}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-0.5">
                                        {formatExperiencePeriod(
                                          exp.dataInicio,
                                          exp.dataFim,
                                          exp.atual,
                                        )}
                                      </div>
                                      {exp.descricao.trim() ? (
                                        <div className="text-xs text-gray-700 mt-2 whitespace-pre-wrap">
                                          {exp.descricao.trim()}
                                        </div>
                                      ) : null}
                                    </div>
                                  ))
                              ) : (
                                <div className="text-sm text-gray-600">—</div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Formação
                              </div>
                              <div className="mt-3 space-y-2">
                                {formacoes.filter(
                                  (r) => !isEmptyEducationRow(r),
                                ).length > 0 ? (
                                  formacoes
                                    .filter((r) => !isEmptyEducationRow(r))
                                    .slice(0, 5)
                                    .map((f, idx) => (
                                      <div
                                        key={`form-review-${idx}`}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                                      >
                                        <div className="text-sm font-medium text-gray-900">
                                          {f.curso.trim() || "Curso"}{" "}
                                          {f.instituicao.trim()
                                            ? `• ${f.instituicao.trim()}`
                                            : ""}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-0.5">
                                          {formatExperiencePeriod(
                                            f.dataInicio,
                                            f.dataFim,
                                            f.emAndamento,
                                          )}
                                        </div>
                                      </div>
                                    ))
                                ) : (
                                  <div className="text-sm text-gray-600">—</div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs font-medium text-gray-500">
                                  Cursos
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {cursos.filter((r) => !isEmptyCursoRow(r))
                                    .length > 0 ? (
                                    cursos
                                      .filter((r) => !isEmptyCursoRow(r))
                                      .slice(0, 5)
                                      .map((c) => c.nome.trim())
                                      .filter(Boolean)
                                      .map((label) => (
                                        <span
                                          key={label}
                                          className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800"
                                        >
                                          {label}
                                        </span>
                                      ))
                                  ) : (
                                    <span className="text-sm text-gray-600">
                                      —
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-medium text-gray-500">
                                  Certificações
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {certificacoes.filter(
                                    (r) => !isEmptyCertificacaoRow(r),
                                  ).length > 0 ? (
                                    certificacoes
                                      .filter((r) => !isEmptyCertificacaoRow(r))
                                      .slice(0, 5)
                                      .map((c) => c.nome.trim())
                                      .filter(Boolean)
                                      .map((label) => (
                                        <span
                                          key={label}
                                          className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800"
                                        >
                                          {label}
                                        </span>
                                      ))
                                  ) : (
                                    <span className="text-sm text-gray-600">
                                      —
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs font-medium text-gray-500">
                                  Prêmios
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {premios.filter((r) => !isEmptyPremioRow(r))
                                    .length > 0 ? (
                                    premios
                                      .filter((r) => !isEmptyPremioRow(r))
                                      .slice(0, 5)
                                      .map((p) => p.titulo.trim())
                                      .filter(Boolean)
                                      .map((label) => (
                                        <span
                                          key={label}
                                          className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800"
                                        >
                                          {label}
                                        </span>
                                      ))
                                  ) : (
                                    <span className="text-sm text-gray-600">
                                      —
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-medium text-gray-500">
                                  Publicações
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {publicacoes.filter(
                                    (r) => !isEmptyPublicacaoRow(r),
                                  ).length > 0 ? (
                                    publicacoes
                                      .filter((r) => !isEmptyPublicacaoRow(r))
                                      .slice(0, 5)
                                      .map((p) => p.titulo.trim())
                                      .filter(Boolean)
                                      .map((label) => (
                                        <span
                                          key={label}
                                          className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-800"
                                        >
                                          {label}
                                        </span>
                                      ))
                                  ) : (
                                    <span className="text-sm text-gray-600">
                                      —
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {!isEditMode ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mt-6">
                        <p className="text-sm! text-amber-900! mb-0!">
                          <strong className="font-medium">Importante:</strong>{" "}
                          Após criar, você pode editar este currículo para
                          adicionar ou ajustar informações.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mt-6">
                        <p className="text-sm text-blue-900">
                          <strong className="font-medium">Dica:</strong> Revise
                          as informações e clique em{" "}
                          <span className="font-medium">Salvar alterações</span>{" "}
                          para atualizar seu currículo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </StepperContent>
            </StepperPanel>

            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
              {isFirstStep && onCancel && (
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </ButtonCustom>
              )}

              {!isFirstStep && (
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  Voltar
                </ButtonCustom>
              )}

              {!isLastStep && (
                <ButtonCustom
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  disabled={
                    isSubmitting ||
                    (step === 1 &&
                      (isBootstrappingCurriculos || isBootstrappingEdit))
                  }
                  withAnimation
                >
                  Avançar
                </ButtonCustom>
              )}

              {isLastStep && (
                <ButtonCustom
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  withAnimation
                >
                  {isSubmitting
                    ? isEditMode
                      ? "Salvando..."
                      : "Cadastrando..."
                    : isEditMode
                      ? "Salvar alterações"
                      : "Cadastrar currículo"}
                </ButtonCustom>
              )}
            </footer>
          </form>
        </Stepper>
      </div>

      <ModalCustom
        isOpen={showPrincipalConfirm}
        onOpenChange={setShowPrincipalConfirm}
        size="lg"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContentWrapper>
          <ModalHeader className="pb-4">
            <ModalTitle className="mb-0!">
              Alterar currículo principal?
            </ModalTitle>
            <ModalDescription className="text-sm! text-gray-600!">
              Já existe um currículo principal. Se você continuar, o currículo
              atual será desmarcado e este novo currículo será definido como
              principal.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-3">
            {existingPrincipal ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Atual principal:{" "}
                <span className="font-medium">{existingPrincipal.titulo}</span>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter className="border-t border-gray-100 pt-6">
            <div className="flex w-full items-center justify-end gap-3">
              <ButtonCustom
                variant="outline"
                onClick={() => {
                  setPrincipalChoice("NAO");
                  setShowPrincipalConfirm(false);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                variant="primary"
                onClick={() => {
                  setPrincipalChoice("SIM");
                  setShowPrincipalConfirm(false);
                }}
                disabled={isSubmitting}
              >
                Sim, tornar principal
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}
