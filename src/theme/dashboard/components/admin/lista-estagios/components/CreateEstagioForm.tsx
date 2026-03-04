"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, Trash2 } from "lucide-react";
import {
  ButtonCustom,
  MultiSelectCustom,
  TimeInputCustom,
  toastCustom,
} from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { cn } from "@/lib/utils";
import {
  createEstagioGlobal,
  vincularAlunosEstagio,
  type CreateEstagioGlobalPayload,
  type CreateEstagioGroupPayload,
} from "@/api/cursos";
import { getAdminCompanyById } from "@/api/empresas";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import { useCursosForSelect } from "../../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../../lista-alunos/hooks/useTurmaOptions";
import { useInscricoesForTurmaSelect } from "../hooks/useInscricoesForTurmaSelect";
import { useEmpresasForSelect } from "../hooks/useEmpresasForSelect";
import { MaskService } from "@/services";
import { lookupCep } from "@/lib/cep";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteEstagioGroupModal } from "./DeleteEstagioGroupModal";

export interface CreateEstagioFormProps {
  defaultCursoId?: string | null;
  defaultTurmaId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

type FormErrors = Partial<
  Record<
    | "titulo"
    | "descricao"
    | "cursoId"
    | "turmaId"
    | "modoAlocacao"
    | "periodicidade"
    | "diasSemana"
    | "periodo"
    | "inscricaoIds",
    string
  >
>;
type DynamicGroupErrorKey =
  `group_${number}_${"nome" | "capacidade" | "horaInicio" | "horaFim"}`;
type DynamicGroupAllocationErrorKey = `group_${number}_inscricaoIds`;
type ExtendedFormErrors = FormErrors &
  Partial<
    Record<DynamicGroupErrorKey | DynamicGroupAllocationErrorKey, string>
  > & {
    usarGrupos?: string;
    grupos?: string;
    capacidadeGrupos?: string;
    empresaVinculo?: string;
    empresaId?: string;
    empresaNome?: string;
    rua?: string;
    cep?: string;
    cidade?: string;
    estado?: string;
    numero?: string;
    complemento?: string;
    horarioInicioGeral?: string;
    horarioFimGeral?: string;
    cargaHorariaMinutos?: string;
  };

type Periodicidade = "DIAS_SEMANA" | "INTERVALO";
type ModoAlocacao = "TODOS" | "ESPECIFICOS";
type Turno = "MANHA" | "TARDE" | "NOITE";

interface EstagioGroupDraft {
  nome: string;
  turno: Turno;
  capacidade: string;
  horaInicio: string;
  horaFim: string;
  inscricaoIds: string[];
}

type EmpresaVinculoModo = "CADASTRADA" | "MANUAL";
type UsarGrupos = "SIM" | "NAO";

const DIAS_SEMANA_OPTIONS = [
  { value: "SEG", label: "Segunda" },
  { value: "TER", label: "Terça" },
  { value: "QUA", label: "Quarta" },
  { value: "QUI", label: "Quinta" },
  { value: "SEX", label: "Sexta" },
  { value: "SAB", label: "Sábado" },
] as const;

const TURNO_OPTIONS = [
  { value: "MANHA", label: "Manhã" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOITE", label: "Noite" },
] as const;
const MAX_ESTAGIO_GROUPS = 5;
const TITULO_MIN_LENGTH = 3;
const TITULO_MAX_LENGTH = 255;
const DESCRICAO_MIN_LENGTH = 1;
const DESCRICAO_MAX_LENGTH = 2000;

const UF_OPTIONS = [
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
] as const;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeUfCode(value?: string | null): string {
  const raw = (value || "").trim();
  if (!raw) return "";

  const upper = raw.toUpperCase();
  if (UF_OPTIONS.some((option) => option.value === upper)) {
    return upper;
  }

  const byName = UF_OPTIONS.find(
    (option) => normalizeText(option.label) === normalizeText(raw),
  );

  return byName?.value ?? upper.slice(0, 2);
}

function toIsoDateLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function resolveApiErrorCode(error: any): string | undefined {
  return (
    error?.details?.code ||
    error?.code ||
    error?.details?.error?.code ||
    undefined
  );
}

function normalizeGroups(
  groups: EstagioGroupDraft[],
): CreateEstagioGroupPayload[] {
  return groups
    .map((group) => ({
      nome: group.nome.trim(),
      turno: group.turno,
      capacidade: group.capacidade ? Number(group.capacidade) : undefined,
      horaInicio: group.horaInicio || undefined,
      horaFim: group.horaFim || undefined,
    }))
    .filter((group) => group.nome.length > 0);
}

function isValidHour(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function toMinutes(value: string): number {
  const [hh, mm] = value.split(":").map(Number);
  return hh * 60 + mm;
}

function getDurationMinutes(start: string, end: string): number | null {
  if (!isValidHour(start) || !isValidHour(end)) return null;
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (endMinutes <= startMinutes) return null;
  return endMinutes - startMinutes;
}

function mapJsWeekdayToCode(
  day: number,
): "DOM" | "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB" {
  if (day === 0) return "DOM";
  if (day === 1) return "SEG";
  if (day === 2) return "TER";
  if (day === 3) return "QUA";
  if (day === 4) return "QUI";
  if (day === 5) return "SEX";
  return "SAB";
}

function countRequiredDays(params: {
  periodicidade: Periodicidade;
  from: Date | null;
  to: Date | null;
  diasSemana: string[];
  incluirSabados: boolean;
}): number {
  const { periodicidade, from, to, diasSemana, incluirSabados } = params;
  if (!from || !to) return 0;

  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  if (end < start) return 0;

  const selected = new Set(diasSemana);
  let count = 0;

  for (
    const current = new Date(start);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    const code = mapJsWeekdayToCode(current.getDay());
    if (code === "DOM") continue;
    if (!incluirSabados && code === "SAB") continue;

    if (periodicidade === "INTERVALO") {
      count += 1;
      continue;
    }

    if (selected.has(code)) {
      count += 1;
    }
  }

  return count;
}

export function CreateEstagioForm({
  defaultCursoId = null,
  defaultTurmaId = null,
  onSuccess,
  onCancel,
  className,
}: CreateEstagioFormProps) {
  const queryClient = useQueryClient();
  const maskService = MaskService.getInstance();
  const cursosQuery = useCursosForSelect();
  const [cursoId, setCursoId] = useState<string | null>(defaultCursoId);
  const turmasQuery = useTurmaOptions(cursoId);
  const [turmaId, setTurmaId] = useState<string | null>(defaultTurmaId);
  const inscricoesQuery = useInscricoesForTurmaSelect({ cursoId, turmaId });
  const empresasQuery = useEmpresasForSelect(true);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [obrigatorio, setObrigatorio] = useState<"SIM" | "NAO">("SIM");
  const [modoAlocacao, setModoAlocacao] = useState<ModoAlocacao>("TODOS");
  const [usarGrupos, setUsarGrupos] = useState<UsarGrupos>("NAO");
  const [periodicidade, setPeriodicidade] =
    useState<Periodicidade>("DIAS_SEMANA");
  const [diasSemana, setDiasSemana] = useState<string[]>(["SEG", "QUA", "SEX"]);
  const [periodo, setPeriodo] = useState<DateRange>({ from: null, to: null });
  const [incluirSabados, setIncluirSabados] = useState<"SIM" | "NAO">("NAO");
  const [horarioInicioGeral, setHorarioInicioGeral] = useState("");
  const [horarioFimGeral, setHorarioFimGeral] = useState("");
  const [empresaVinculoModo, setEmpresaVinculoModo] =
    useState<EmpresaVinculoModo>("CADASTRADA");
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaCnpj, setEmpresaCnpj] = useState("");
  const [empresaTelefone, setEmpresaTelefone] = useState("");
  const [empresaEmail, setEmpresaEmail] = useState("");
  const [enderecoRua, setEnderecoRua] = useState("");
  const [enderecoCep, setEnderecoCep] = useState("");
  const [enderecoCidade, setEnderecoCidade] = useState("");
  const [enderecoEstado, setEnderecoEstado] = useState("");
  const [enderecoNumero, setEnderecoNumero] = useState("");
  const [enderecoComplemento, setEnderecoComplemento] = useState("");
  const [inscricaoIds, setInscricaoIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<EstagioGroupDraft[]>([]);

  const [errors, setErrors] = useState<ExtendedFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isCompanyAutofillLoading, setIsCompanyAutofillLoading] =
    useState(false);
  const [groupToDeleteIndex, setGroupToDeleteIndex] = useState<number | null>(
    null,
  );
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [cidadeOptions, setCidadeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const lastCepLookupRef = useRef<string | null>(null);
  const cidadesCacheRef = useRef<
    Record<string, Array<{ value: string; label: string }>>
  >({});

  const cursosOptions = useMemo(
    () => cursosQuery.cursos ?? [],
    [cursosQuery.cursos],
  );
  const turmasOptions = useMemo(
    () => turmasQuery.turmas ?? [],
    [turmasQuery.turmas],
  );
  const inscricoesOptions = useMemo(
    () => inscricoesQuery.inscricoes ?? [],
    [inscricoesQuery.inscricoes],
  );
  const empresasOptions = useMemo(
    () => empresasQuery.empresas ?? [],
    [empresasQuery.empresas],
  );
  const diasSemanaOptions = useMemo(
    () =>
      DIAS_SEMANA_OPTIONS.filter(
        (option) => incluirSabados === "SIM" || option.value !== "SAB",
      ).map((option) => ({ ...option })),
    [incluirSabados],
  );
  const selectedInscricoesOptions = useMemo(
    () =>
      inscricoesOptions.filter((option) => inscricaoIds.includes(option.value)),
    [inscricoesOptions, inscricaoIds],
  );
  const selectedDiasSemanaOptions = useMemo(
    () =>
      diasSemanaOptions.filter((option) => diasSemana.includes(option.value)),
    [diasSemana, diasSemanaOptions],
  );
  const groupToDelete = useMemo(() => {
    if (groupToDeleteIndex === null) return null;
    return groups[groupToDeleteIndex] ?? null;
  }, [groupToDeleteIndex, groups]);
  const totalCapacidadeGrupos = useMemo(
    () =>
      groups.reduce((total, group) => {
        const capacidade = Number(group.capacidade);
        return total + (Number.isFinite(capacidade) && capacidade > 0 ? capacidade : 0);
      }, 0),
    [groups],
  );
  const totalAlunosSelecionadosEmGrupos = useMemo(
    () => new Set(groups.flatMap((group) => group.inscricaoIds)).size,
    [groups],
  );

  useEffect(() => {
    if (incluirSabados !== "NAO") return;
    setDiasSemana((prev) => prev.filter((day) => day !== "SAB"));
  }, [incluirSabados]);

  const requiredDaysCount = useMemo(
    () =>
      countRequiredDays({
        periodicidade,
        from: periodo.from,
        to: periodo.to,
        diasSemana,
        incluirSabados: incluirSabados === "SIM",
      }),
    [diasSemana, incluirSabados, periodicidade, periodo.from, periodo.to],
  );

  const groupDurations = useMemo(
    () =>
      groups
        .map((group) => getDurationMinutes(group.horaInicio, group.horaFim))
        .filter((duration): duration is number => duration !== null),
    [groups],
  );

  const hasInconsistentGroupDurations = useMemo(() => {
    if (groupDurations.length <= 1) return false;
    const first = groupDurations[0];
    return groupDurations.some((duration) => duration !== first);
  }, [groupDurations]);

  const baseDailyMinutes = useMemo(() => {
    if (usarGrupos === "SIM") {
      return groupDurations[0] ?? 0;
    }
    return getDurationMinutes(horarioInicioGeral, horarioFimGeral) ?? 0;
  }, [groupDurations, horarioFimGeral, horarioInicioGeral, usarGrupos]);

  const computedCargaHorariaMinutos = useMemo(
    () => baseDailyMinutes * requiredDaysCount,
    [baseDailyMinutes, requiredDaysCount],
  );

  const applyCidadeFromOptions = useCallback(
    (
      options: Array<{ value: string; label: string }>,
      cidadeToSelect?: string | null,
    ) => {
      if (cidadeToSelect === undefined) return;
      if (!cidadeToSelect) {
        setEnderecoCidade("");
        return;
      }

      const normalizedTarget = normalizeText(cidadeToSelect);
      const found = options.find(
        (option) => normalizeText(String(option.value)) === normalizedTarget,
      );
      setEnderecoCidade(found ? String(found.value) : "");
    },
    [],
  );

  const fetchCidadesByUf = useCallback(
    async (uf: string, cidadeToSelect?: string | null) => {
      const normalizedUf = (uf || "").toUpperCase();
      if (!normalizedUf) {
        setCidadeOptions([]);
        if (cidadeToSelect !== undefined) {
          setEnderecoCidade("");
        }
        return;
      }

      const cached = cidadesCacheRef.current[normalizedUf];
      if (cached) {
        setCidadeOptions(cached);
        applyCidadeFromOptions(cached, cidadeToSelect);
        return;
      }

      setIsLoadingCidades(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${normalizedUf}/municipios?orderBy=nome`,
        );
        if (!response.ok) {
          throw new Error("Erro ao carregar cidades");
        }

        const data: Array<{ nome: string }> = await response.json();
        const options = data.map((city) => ({
          value: city.nome,
          label: city.nome,
        }));
        cidadesCacheRef.current[normalizedUf] = options;
        setCidadeOptions(options);
        applyCidadeFromOptions(options, cidadeToSelect);
      } catch {
        setCidadeOptions([]);
        if (cidadeToSelect !== undefined) {
          setEnderecoCidade("");
        }
      } finally {
        setIsLoadingCidades(false);
      }
    },
    [applyCidadeFromOptions],
  );

  const handleEstadoChange = useCallback(
    (value: string | null) => {
      const uf = (value || "").toUpperCase();
      setEnderecoEstado(uf);
      setEnderecoCidade("");
      setErrors((prev) => ({ ...prev, estado: undefined, cidade: undefined }));
      void fetchCidadesByUf(uf, null);
    },
    [fetchCidadesByUf],
  );

  useEffect(() => {
    if (empresaVinculoModo !== "CADASTRADA" || !empresaId) {
      setIsCompanyAutofillLoading(false);
      return;
    }
    const selected = empresasQuery.empresasData?.find(
      (empresa) => empresa.id === empresaId,
    );
    if (!selected) return;

    let cancelled = false;

    const applyCompanyAddressData = async (company: {
      nome?: string | null;
      cnpj?: string | null;
      telefone?: string | null;
      email?: string | null;
      cidade?: string | null;
      estado?: string | null;
      enderecoPrincipal?: {
        logradouro?: string | null;
        numero?: string | null;
        bairro?: string | null;
        complemento?: string | null;
        cidade?: string | null;
        estado?: string | null;
        cep?: string | null;
      } | null;
      enderecos?: Array<{
        logradouro?: string | null;
        numero?: string | null;
        bairro?: string | null;
        complemento?: string | null;
        cidade?: string | null;
        estado?: string | null;
        cep?: string | null;
      }> | null;
    }) => {
      if (cancelled) return;

      const endereco =
        company.enderecoPrincipal ?? company.enderecos?.[0] ?? null;
      const companyUf = normalizeUfCode(
        endereco?.estado || company.estado || "",
      );
      const companyCity = (endereco?.cidade || company.cidade || "").trim();
      const companyComplemento = String(
        endereco?.complemento || endereco?.bairro || "",
      ).trim();

      setEmpresaNome(company.nome || "");
      setEmpresaCnpj(maskService.processInput(company.cnpj || "", "cnpj"));
      setEmpresaTelefone(
        maskService.processInput(company.telefone || "", "phone"),
      );
      setEmpresaEmail(company.email || "");
      setEnderecoCep(maskService.processInput(endereco?.cep || "", "cep"));
      setEnderecoRua(String(endereco?.logradouro || "").trim());
      setEnderecoNumero(String(endereco?.numero || "").trim());
      setEnderecoComplemento(companyComplemento);
      setEnderecoEstado(companyUf);

      if (companyUf) {
        await fetchCidadesByUf(companyUf, companyCity);
      } else {
        setCidadeOptions([]);
        setEnderecoCidade(companyCity);
      }

      setErrors((prev) => ({
        ...prev,
        empresaId: undefined,
        empresaNome: undefined,
        cep: undefined,
        cidade: undefined,
        estado: undefined,
        rua: undefined,
        numero: undefined,
        complemento: undefined,
      }));
    };

    const syncSelectedCompany = async () => {
      setIsCompanyAutofillLoading(true);
      try {
        const detail = await getAdminCompanyById(empresaId);
        if ("empresa" in detail) {
          await applyCompanyAddressData(detail.empresa);
          return;
        }
        if ("success" in detail && detail.success === false) {
          await applyCompanyAddressData(selected);
          return;
        }
        await applyCompanyAddressData(selected);
      } catch {
        await applyCompanyAddressData(selected);
      } finally {
        if (!cancelled) {
          setIsCompanyAutofillLoading(false);
        }
      }
    };

    void syncSelectedCompany();

    return () => {
      cancelled = true;
    };
  }, [
    empresaId,
    empresaVinculoModo,
    empresasQuery.empresasData,
    fetchCidadesByUf,
    maskService,
  ]);

  const handleCepLookup = useCallback(
    async (cepValue: string) => {
      const digits = cepValue.replace(/\D/g, "");
      if (digits.length !== 8 || isCepLoading) return;
      if (lastCepLookupRef.current === digits) return;

      setIsCepLoading(true);
      try {
        const result = await lookupCep(cepValue);
        if ("error" in result) {
          toastCustom.error({
            title: "Não foi possível buscar o CEP",
            description: result.error,
          });
          return;
        }

        const complementoFromCep = result.neighborhood || result.complement;

        setEnderecoCep(result.cep);
        setEnderecoRua(result.street || "");
        const ufFromCep = (result.state || "").toUpperCase();
        setEnderecoEstado(ufFromCep);
        if (ufFromCep) {
          await fetchCidadesByUf(ufFromCep, result.city || "");
        } else {
          setCidadeOptions([]);
          setEnderecoCidade("");
        }
        if (complementoFromCep) {
          setEnderecoComplemento(complementoFromCep);
        }

        setErrors((prev) => ({
          ...prev,
          cep: undefined,
          rua: undefined,
          cidade: undefined,
          estado: undefined,
          complemento: undefined,
        }));

        lastCepLookupRef.current = digits;
      } catch {
        toastCustom.error({
          title: "Erro de consulta",
          description: "Falha ao consultar o CEP informado.",
        });
      } finally {
        setIsCepLoading(false);
      }
    },
    [fetchCidadesByUf, isCepLoading],
  );

  const validate = (): boolean => {
    const next: ExtendedFormErrors = {};
    const tituloValue = titulo.trim();
    const descricaoValue = descricao.trim();

    if (!tituloValue) {
      next.titulo = "Informe o título do estágio";
    } else if (tituloValue.length < TITULO_MIN_LENGTH) {
      next.titulo = `Título deve ter no mínimo ${TITULO_MIN_LENGTH} caracteres`;
    } else if (tituloValue.length > TITULO_MAX_LENGTH) {
      next.titulo = `Título deve ter no máximo ${TITULO_MAX_LENGTH} caracteres`;
    }

    if (!descricaoValue) {
      next.descricao = "Informe a descrição do estágio";
    } else if (descricaoValue.length < DESCRICAO_MIN_LENGTH) {
      next.descricao = `Descrição deve ter no mínimo ${DESCRICAO_MIN_LENGTH} caractere`;
    } else if (descricaoValue.length > DESCRICAO_MAX_LENGTH) {
      next.descricao =
        `Descrição deve ter no máximo ${DESCRICAO_MAX_LENGTH} caracteres`;
    }
    if (!cursoId) next.cursoId = "Selecione um curso";
    if (!turmaId) next.turmaId = "Selecione uma turma";
    if (!modoAlocacao) next.modoAlocacao = "Selecione o modo de alocação";
    if (!usarGrupos) next.usarGrupos = "Defina se deseja criar grupos";
    if (!periodicidade) next.periodicidade = "Selecione a periodicidade";
    if (!periodo.from || !periodo.to) next.periodo = "Selecione o período";
    if (periodicidade === "DIAS_SEMANA" && diasSemana.length === 0) {
      next.diasSemana = "Selecione ao menos um dia da semana";
    }
    if (
      modoAlocacao === "ESPECIFICOS" &&
      usarGrupos === "NAO" &&
      inscricaoIds.length === 0
    ) {
      next.inscricaoIds = "Selecione ao menos um aluno";
    }
    if (empresaVinculoModo === "CADASTRADA" && !empresaId) {
      next.empresaId = "Selecione uma empresa cadastrada";
    }
    if (empresaVinculoModo === "MANUAL" && !empresaNome.trim()) {
      next.empresaNome = "Informe o nome da empresa";
    }
    if (!enderecoRua.trim()) next.rua = "Informe a rua";
    if (!enderecoCep.trim()) next.cep = "Informe o CEP";
    if (!enderecoCidade.trim()) next.cidade = "Informe a cidade";
    if (!enderecoEstado.trim()) next.estado = "Informe a UF";
    if (!enderecoNumero.trim()) next.numero = "Informe o número";
    if (!enderecoComplemento.trim()) next.complemento = "Informe o complemento";
    if (usarGrupos === "SIM") {
      if (groups.length === 0) {
        next.grupos = "Adicione ao menos um grupo de estágio.";
      }
      if (groups.length > MAX_ESTAGIO_GROUPS) {
        next.grupos = `Você pode cadastrar no máximo ${MAX_ESTAGIO_GROUPS} grupos por estágio.`;
      }

      let capacityTotal = 0;
      groups.forEach((group, index) => {
        if (!group.nome.trim()) {
          next[`group_${index}_nome`] = "Informe o nome do grupo";
        }
        const capacity = Number(group.capacidade);
        if (!Number.isFinite(capacity) || capacity <= 0) {
          next[`group_${index}_capacidade`] =
            "Capacidade deve ser maior que zero";
        }
        if (!group.horaInicio || !isValidHour(group.horaInicio)) {
          next[`group_${index}_horaInicio`] = "Informe horário início (HH:mm)";
        }
        if (!group.horaFim || !isValidHour(group.horaFim)) {
          next[`group_${index}_horaFim`] = "Informe horário fim (HH:mm)";
        }
        if (Number.isFinite(capacity) && capacity > 0) {
          capacityTotal += capacity;
        }
      });

      if (hasInconsistentGroupDurations) {
        next.cargaHorariaMinutos =
          "Padronize os horários dos grupos para cálculo automático da carga horária.";
      }

      const alunosConsiderados =
        modoAlocacao === "TODOS"
          ? inscricoesOptions.length
          : inscricaoIds.length;

      if (alunosConsiderados > 0 && capacityTotal < alunosConsiderados) {
        next.capacidadeGrupos =
          "A capacidade total dos grupos é insuficiente para a quantidade de alunos da turma. Ajuste as capacidades ou crie novos grupos.";
      }

      if (modoAlocacao === "ESPECIFICOS") {
        const groupedInscricaoIds = groups.flatMap(
          (group) => group.inscricaoIds,
        );
        const uniqueGroupedInscricaoIds = new Set(groupedInscricaoIds);

        if (uniqueGroupedInscricaoIds.size === 0) {
          next.inscricaoIds = "Selecione ao menos um aluno em um grupo.";
        }

        groups.forEach((group, index) => {
          if (group.inscricaoIds.length === 0) {
            next[`group_${index}_inscricaoIds`] =
              "Selecione ao menos um aluno para este grupo.";
          }
        });

        if (groupedInscricaoIds.length !== uniqueGroupedInscricaoIds.size) {
          next.grupos =
            "Um aluno não pode estar em mais de um grupo. Revise as seleções.";
        }

        if (capacityTotal < uniqueGroupedInscricaoIds.size) {
          next.capacidadeGrupos =
            "A capacidade total dos grupos é insuficiente para os alunos selecionados. Ajuste as capacidades ou crie novos grupos.";
        }
      }
    } else {
      if (!horarioInicioGeral || !isValidHour(horarioInicioGeral)) {
        next.horarioInicioGeral = "Informe horário início (HH:mm)";
      }
      if (!horarioFimGeral || !isValidHour(horarioFimGeral)) {
        next.horarioFimGeral = "Informe horário fim (HH:mm)";
      }
    }

    if (requiredDaysCount <= 0) {
      next.cargaHorariaMinutos =
        "Não foi possível calcular a carga horária: verifique período e dias obrigatórios.";
    } else if (computedCargaHorariaMinutos <= 0) {
      next.cargaHorariaMinutos =
        "Não foi possível calcular a carga horária: configure horário de início e fim.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!cursoId || !turmaId || !periodo.from || !periodo.to) return;

    setIsSaving(true);
    try {
      const payload: CreateEstagioGlobalPayload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        cursoId,
        turmaId,
        obrigatorio: obrigatorio === "SIM",
        modoAlocacao,
        usarGrupos: usarGrupos === "SIM",
        periodo: {
          periodicidade,
          diasSemana:
            periodicidade === "DIAS_SEMANA"
              ? (diasSemana as Array<
                  "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB"
                >)
              : undefined,
          dataInicio: toIsoDateLocal(periodo.from),
          dataFim: toIsoDateLocal(periodo.to),
          incluirSabados: incluirSabados === "SIM",
        },
        horarioPadrao:
          usarGrupos === "NAO"
            ? {
                horaInicio: horarioInicioGeral,
                horaFim: horarioFimGeral,
              }
            : undefined,
        grupos: usarGrupos === "SIM" ? normalizeGroups(groups) : undefined,
        empresa: {
          vinculoModo: empresaVinculoModo,
          empresaId:
            empresaVinculoModo === "CADASTRADA"
              ? (empresaId ?? undefined)
              : undefined,
          nome:
            empresaVinculoModo === "MANUAL" ? empresaNome.trim() : undefined,
          cnpj: empresaCnpj.trim() || undefined,
          telefone: empresaTelefone.trim() || undefined,
          email: empresaEmail.trim() || undefined,
          endereco: {
            rua: enderecoRua.trim(),
            cep: enderecoCep.trim(),
            cidade: enderecoCidade.trim(),
            estado: enderecoEstado.trim().toUpperCase(),
            numero: enderecoNumero.trim(),
            complemento: enderecoComplemento.trim(),
          },
        },
      };

      const created = await createEstagioGlobal(payload);

      if (
        modoAlocacao === "ESPECIFICOS" &&
        ((usarGrupos === "SIM" &&
          groups.some((group) => group.inscricaoIds.length > 0)) ||
          (usarGrupos === "NAO" && inscricaoIds.length > 0))
      ) {
        if (usarGrupos === "SIM") {
          for (const [index, group] of groups.entries()) {
            if (group.inscricaoIds.length === 0) continue;
            const resolvedGroupId = created.grupos?.[index]?.id;
            if (!resolvedGroupId) {
              throw new Error(
                `Não foi possível identificar o grupo "${group.nome || index + 1}" no retorno da API.`,
              );
            }
            await vincularAlunosEstagio(created.id, {
              modo: "ESPECIFICOS",
              inscricaoIds: group.inscricaoIds,
              grupoIdDefault: resolvedGroupId,
              tipoParticipacao: "INICIAL",
            });
          }
        } else {
          await vincularAlunosEstagio(created.id, {
            modo: "ESPECIFICOS",
            inscricaoIds,
            tipoParticipacao: "INICIAL",
          });
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["estagios", "dashboard-v2"] }),
        queryClient.invalidateQueries({ queryKey: ["estagios", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["estagios"] }),
      ]);

      toastCustom.success({
        title: "Estágio cadastrado",
        description: "As informações do estágio foram salvas com sucesso.",
      });
      onSuccess?.();
    } catch (error: any) {
      const code = resolveApiErrorCode(error);

      if (code === "TURMA_CURSO_INVALIDOS") {
        setErrors((prev) => ({
          ...prev,
          cursoId: "Curso e turma informados não são compatíveis.",
          turmaId: "Curso e turma informados não são compatíveis.",
        }));
      }

      if (code === "HORARIO_INVALIDO") {
        setErrors((prev) => ({
          ...prev,
          horarioInicioGeral:
            usarGrupos === "NAO" ? "Revise os horários informados." : undefined,
          horarioFimGeral:
            usarGrupos === "NAO" ? "Revise os horários informados." : undefined,
          cargaHorariaMinutos:
            usarGrupos === "SIM"
              ? "Revise os horários dos grupos para continuar."
              : prev.cargaHorariaMinutos,
        }));
      }

      if (code === "CAPACIDADE_GRUPOS_INSUFICIENTE") {
        setErrors((prev) => ({
          ...prev,
          capacidadeGrupos:
            "A capacidade total dos grupos é insuficiente para os alunos considerados.",
        }));
      }

      if (code === "GRUPO_OBRIGATORIO_PARA_ALOCACAO") {
        setErrors((prev) => ({
          ...prev,
          grupos: "Defina os grupos e vincule os alunos corretamente.",
        }));
      }

      if (code === "ALUNO_EM_GRUPOS_DUPLICADOS") {
        setErrors((prev) => ({
          ...prev,
          grupos: "Um aluno não pode ser vinculado em mais de um grupo.",
        }));
      }

      toastCustom.error({
        title: "Erro ao cadastrar estágio",
        description: error?.message || "Não foi possível cadastrar o estágio.",
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
        <fieldset disabled={isSaving} className="space-y-5">
          <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
            <div>
              <h3 className="!text-sm !font-semibold text-gray-900 mb-1!">
                Informações gerais
              </h3>
              <p className="!text-xs text-gray-500 mb-0!">
                Defina o título, curso e turma base do estágio.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px]">
              <InputCustom
                label="Título"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  setErrors((prev) => ({ ...prev, titulo: undefined }));
                }}
                placeholder="Ex.: Estágio Supervisionado 2026.1"
                minLength={TITULO_MIN_LENGTH}
                maxLength={TITULO_MAX_LENGTH}
                error={errors.titulo}
                required
              />

              <SelectCustom
                label="Obrigatório?"
                options={[
                  { value: "SIM", label: "Sim" },
                  { value: "NAO", label: "Não" },
                ]}
                value={obrigatorio}
                onChange={(value) =>
                  setObrigatorio((value as "SIM" | "NAO") || "SIM")
                }
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SelectCustom
                label="Curso"
                options={cursosOptions}
                value={cursoId}
                onChange={(value) => {
                  setCursoId(value || null);
                  setTurmaId(null);
                  setInscricaoIds([]);
                  setGroups((prev) =>
                    prev.map((group) => ({ ...group, inscricaoIds: [] })),
                  );
                  setErrors((prev) => ({ ...prev, cursoId: undefined }));
                }}
                placeholder={
                  cursosQuery.isLoading ? "Carregando..." : "Selecionar"
                }
                disabled={cursosQuery.isLoading}
                error={errors.cursoId}
                required
              />

              <SelectCustom
                label="Turma"
                options={turmasOptions}
                value={turmaId}
                onChange={(value) => {
                  setTurmaId(value || null);
                  setInscricaoIds([]);
                  setGroups((prev) =>
                    prev.map((group) => ({ ...group, inscricaoIds: [] })),
                  );
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

            <SimpleTextarea
              label="Descrição"
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                setErrors((prev) => ({ ...prev, descricao: undefined }));
              }}
              placeholder="Descreva o objetivo e o contexto do estágio"
              maxLength={DESCRICAO_MAX_LENGTH}
              showCharCount
              rows={4}
              error={errors.descricao}
              required
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <h3 className="!text-sm !font-semibold text-gray-900 mb-1!">
                Empresa e endereço do estágio
              </h3>
              <p className="!text-xs text-gray-500 mb-0!">
                Defina a empresa vinculada e preencha o endereço completo do
                local de estágio.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <SelectCustom
                className="lg:col-span-4"
                label="Vínculo da empresa"
                options={[
                  {
                    value: "CADASTRADA",
                    label: "Empresa cadastrada no sistema",
                  },
                  {
                    value: "MANUAL",
                    label: "Informar nome da empresa manualmente",
                  },
                ]}
                value={empresaVinculoModo}
                onChange={(value) => {
                  const nextMode =
                    (value as EmpresaVinculoModo) || "CADASTRADA";
                  setEmpresaVinculoModo(nextMode);
                  setEmpresaId(null);
                  setEmpresaNome("");
                  setEmpresaCnpj("");
                  setEmpresaTelefone("");
                  setEmpresaEmail("");
                  setEnderecoCep("");
                  setEnderecoCidade("");
                  setEnderecoEstado("");
                  setEnderecoRua("");
                  setEnderecoNumero("");
                  setEnderecoComplemento("");
                  setCidadeOptions([]);
                  lastCepLookupRef.current = null;
                  setErrors((prev) => ({
                    ...prev,
                    empresaId: undefined,
                    empresaNome: undefined,
                    cep: undefined,
                    cidade: undefined,
                    estado: undefined,
                    rua: undefined,
                    numero: undefined,
                    complemento: undefined,
                  }));
                }}
                required
              />

              {empresaVinculoModo === "CADASTRADA" ? (
                <SelectCustom
                  className="lg:col-span-8"
                  label="Empresa cadastrada"
                  options={empresasOptions}
                  searchable
                  searchThreshold={-1}
                  value={empresaId}
                  onChange={(value) => {
                    setEmpresaId(value || null);
                    setErrors((prev) => ({ ...prev, empresaId: undefined }));
                  }}
                  placeholder={
                    empresasQuery.isLoading
                      ? "Carregando..."
                      : empresasQuery.error
                        ? "Não foi possível carregar empresas"
                        : "Selecionar empresa"
                  }
                  disabled={empresasQuery.isLoading}
                  error={errors.empresaId || empresasQuery.error || undefined}
                  helperText={
                    !empresasQuery.isLoading &&
                    !empresasQuery.error &&
                    empresasOptions.length === 0
                      ? "Nenhuma empresa disponível para vincular."
                      : undefined
                  }
                  required
                />
              ) : (
                <InputCustom
                  className="lg:col-span-8"
                  label="Nome da empresa"
                  value={empresaNome}
                  onChange={(e) => {
                    setEmpresaNome(e.target.value);
                    setErrors((prev) => ({ ...prev, empresaNome: undefined }));
                  }}
                  placeholder="Nome da empresa"
                  error={errors.empresaNome}
                  required
                />
              )}

              {empresaVinculoModo === "CADASTRADA" &&
              isCompanyAutofillLoading ? (
                <div className="lg:col-span-12 grid gap-4 lg:grid-cols-12">
                  <Skeleton className="lg:col-span-4 h-12 rounded-md" />
                  <Skeleton className="lg:col-span-4 h-12 rounded-md" />
                  <Skeleton className="lg:col-span-4 h-12 rounded-md" />
                  <Skeleton className="lg:col-span-2 h-12 rounded-md" />
                  <Skeleton className="lg:col-span-2 h-12 rounded-md" />
                  <Skeleton className="lg:col-span-4 h-12 rounded-md" />
                  <Skeleton className="lg:col-span-4 h-12 rounded-md" />
                  <Skeleton className="lg:col-span-2 h-12 rounded-md" />
                  <Skeleton className="lg:col-span-4 h-12 rounded-md" />
                </div>
              ) : (
                <>
                  <InputCustom
                    className="lg:col-span-4"
                    label="CNPJ"
                    value={empresaCnpj}
                    onChange={(e) => setEmpresaCnpj(e.target.value)}
                    placeholder="Opcional"
                    mask="cnpj"
                  />
                  <InputCustom
                    className="lg:col-span-4"
                    label="Telefone"
                    value={empresaTelefone}
                    onChange={(e) => setEmpresaTelefone(e.target.value)}
                    placeholder="Opcional"
                    mask="phone"
                  />
                  <InputCustom
                    className="lg:col-span-4"
                    label="E-mail"
                    value={empresaEmail}
                    onChange={(e) => setEmpresaEmail(e.target.value)}
                    placeholder="Opcional"
                  />

                  <InputCustom
                    className="lg:col-span-2"
                    label="CEP"
                    value={enderecoCep}
                    onChange={(e) => {
                      const nextCep = e.target.value;
                      setEnderecoCep(nextCep);
                      setErrors((prev) => ({ ...prev, cep: undefined }));

                      const digits = nextCep.replace(/\D/g, "");
                      if (digits.length === 8) {
                        void handleCepLookup(nextCep);
                      } else {
                        lastCepLookupRef.current = null;
                      }
                    }}
                    error={errors.cep}
                    mask="cep"
                    helperText={
                      isCepLoading ? "Buscando endereço pelo CEP..." : undefined
                    }
                    required
                  />

                  <SelectCustom
                    className="lg:col-span-2"
                    label="Estado (UF)"
                    options={UF_OPTIONS.map((option) => ({ ...option }))}
                    value={enderecoEstado || null}
                    onChange={handleEstadoChange}
                    error={errors.estado}
                    required
                  />

                  <SelectCustom
                    className="lg:col-span-4"
                    label="Cidade"
                    options={cidadeOptions}
                    value={enderecoCidade || null}
                    onChange={(value) => {
                      setEnderecoCidade(value || "");
                      setErrors((prev) => ({ ...prev, cidade: undefined }));
                    }}
                    placeholder={
                      !enderecoEstado
                        ? "Selecione uma UF primeiro"
                        : isLoadingCidades
                          ? "Carregando cidades..."
                          : "Selecionar cidade"
                    }
                    disabled={!enderecoEstado || isLoadingCidades}
                    searchable
                    error={errors.cidade}
                    helperText={
                      enderecoEstado &&
                      !isLoadingCidades &&
                      cidadeOptions.length === 0
                        ? "Nenhuma cidade encontrada para esta UF."
                        : undefined
                    }
                    required
                  />
                  <InputCustom
                    className="lg:col-span-4"
                    label="Rua"
                    value={enderecoRua}
                    onChange={(e) => {
                      setEnderecoRua(e.target.value);
                      setErrors((prev) => ({ ...prev, rua: undefined }));
                    }}
                    error={errors.rua}
                    required
                  />
                  <InputCustom
                    className="lg:col-span-2"
                    label="Número"
                    value={enderecoNumero}
                    onChange={(e) => {
                      setEnderecoNumero(e.target.value);
                      setErrors((prev) => ({ ...prev, numero: undefined }));
                    }}
                    error={errors.numero}
                    required
                  />
                  <InputCustom
                    className="lg:col-span-4"
                    label="Complemento"
                    value={enderecoComplemento}
                    onChange={(e) => {
                      setEnderecoComplemento(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        complemento: undefined,
                      }));
                    }}
                    error={errors.complemento}
                    required
                  />
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <h3 className="!text-sm !font-semibold text-gray-900 mb-0!">
                Alocação e grupos
              </h3>
              <p className="!text-xs text-gray-500 mb-0!">
                Configure se os alunos serão distribuídos por grupos de estágio.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <SelectCustom
                className="lg:col-span-3"
                label="Modo de alocação"
                options={[
                  { value: "TODOS", label: "Todos os alunos da turma" },
                  { value: "ESPECIFICOS", label: "Alunos específicos" },
                ]}
                value={modoAlocacao}
                onChange={(value) => {
                  const next = (value as ModoAlocacao) || "TODOS";
                  setModoAlocacao(next);
                  setErrors((prev) => ({ ...prev, modoAlocacao: undefined }));
                }}
                error={errors.modoAlocacao}
                required
              />

              <SelectCustom
                className="lg:col-span-3"
                label="Criar grupos de estágio?"
                options={[
                  { value: "SIM", label: "Sim, quero usar grupos" },
                  { value: "NAO", label: "Não, sem grupos" },
                ]}
                value={usarGrupos}
                onChange={(value) => {
                  setUsarGrupos((value as UsarGrupos) || "NAO");
                  setErrors((prev) => ({
                    ...prev,
                    usarGrupos: undefined,
                    grupos: undefined,
                    capacidadeGrupos: undefined,
                    horarioInicioGeral: undefined,
                    horarioFimGeral: undefined,
                    cargaHorariaMinutos: undefined,
                  }));
                }}
                error={errors.usarGrupos}
                required
              />

              {usarGrupos === "NAO" ? (
                <>
                  <TimeInputCustom
                    className="lg:col-span-2"
                    label="Horário de início do estágio"
                    name="horarioInicioGeral"
                    placeholder="HH:mm"
                    value={horarioInicioGeral}
                    onChange={(value) => {
                      setHorarioInicioGeral(value);
                      setErrors((prev) => ({
                        ...prev,
                        horarioInicioGeral: undefined,
                      }));
                    }}
                    error={errors.horarioInicioGeral}
                    disabled={isSaving}
                    required
                  />
                  <TimeInputCustom
                    className="lg:col-span-2"
                    label="Horário de fim do estágio"
                    name="horarioFimGeral"
                    placeholder="HH:mm"
                    value={horarioFimGeral}
                    onChange={(value) => {
                      setHorarioFimGeral(value);
                      setErrors((prev) => ({
                        ...prev,
                        horarioFimGeral: undefined,
                      }));
                    }}
                    error={errors.horarioFimGeral}
                    disabled={isSaving}
                    required
                  />
                  <InputCustom
                    className="lg:col-span-2"
                    label="Minutos por dia (calculado)"
                    value={String(baseDailyMinutes || 0)}
                    disabled
                  />
                </>
              ) : null}
            </div>

            {modoAlocacao === "ESPECIFICOS" && usarGrupos === "NAO" ? (
              <div className="space-y-1">
                <MultiSelectCustom
                  label="Alunos do estágio"
                  options={inscricoesOptions}
                  value={selectedInscricoesOptions}
                  onChange={(values) => {
                    setInscricaoIds(values.map((item) => item.value));
                    setErrors((prev) => ({ ...prev, inscricaoIds: undefined }));
                  }}
                  emptyIndicator="Nenhum aluno encontrado"
                  hideClearAllButton={false}
                  showCountBadge
                  maxVisibleTags={2}
                  placeholder={
                    !turmaId
                      ? "Selecione uma turma"
                      : inscricoesQuery.isLoading
                        ? "Carregando..."
                        : "Buscar por nome, matrícula ou CPF"
                  }
                  disabled={!turmaId || inscricoesQuery.isLoading}
                  size="md"
                  required
                />
                {errors.inscricaoIds ? (
                  <p className="text-xs text-red-600">{errors.inscricaoIds}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <h3 className="!text-sm !font-semibold text-gray-900 mb-1!">
                Período e carga horária
              </h3>
              <p className="!text-xs text-gray-500 mb-0!">
                A carga horária é calculada automaticamente pelo período e
                horários.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <SelectCustom
                label="Periodicidade"
                options={[
                  { value: "DIAS_SEMANA", label: "Dias da semana" },
                  { value: "INTERVALO", label: "Todos os dias do intervalo" },
                ]}
                value={periodicidade}
                onChange={(value) => {
                  const next = (value as Periodicidade) || "DIAS_SEMANA";
                  setPeriodicidade(next);
                  setErrors((prev) => ({ ...prev, periodicidade: undefined }));
                }}
                error={errors.periodicidade}
                required
              />

              <SelectCustom
                label="Incluir sábados na contagem?"
                options={[
                  { value: "SIM", label: "Sim" },
                  { value: "NAO", label: "Não" },
                ]}
                value={incluirSabados}
                onChange={(value) =>
                  setIncluirSabados((value as "SIM" | "NAO") || "NAO")
                }
                required
              />

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

              <InputCustom
                label="Carga horária total"
                value={String(computedCargaHorariaMinutos)}
                disabled
                error={errors.cargaHorariaMinutos}
                required
              />
            </div>

            {periodicidade === "DIAS_SEMANA" ? (
              <div className="space-y-1">
                <MultiSelectCustom
                  label="Dias obrigatórios"
                  options={diasSemanaOptions}
                  value={selectedDiasSemanaOptions}
                  onChange={(values) => {
                    setDiasSemana(values.map((item) => item.value));
                    setErrors((prev) => ({ ...prev, diasSemana: undefined }));
                  }}
                  emptyIndicator="Nenhum dia disponível"
                  hideClearAllButton={false}
                  showCountBadge
                  maxVisibleTags={diasSemanaOptions.length}
                  placeholder="Selecionar dias"
                  size="md"
                  required
                />
                {errors.diasSemana ? (
                  <p className="text-xs text-red-600">{errors.diasSemana}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {usarGrupos === "SIM" ? (
            <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="!text-sm !font-semibold text-gray-900 mb-0!">
                    Grupos de estágio
                  </h3>
                  <p className="!text-xs !text-gray-500 mb-0!">
                    {groups.length} grupo{groups.length === 1 ? "" : "s"} • capacidade total{" "}
                    {totalCapacidadeGrupos}
                    {modoAlocacao === "ESPECIFICOS"
                      ? ` • ${totalAlunosSelecionadosEmGrupos} aluno(s) selecionado(s)`
                      : ""}
                  </p>
                </div>
                <ButtonCustom
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setGroups((prev) => {
                      if (prev.length >= MAX_ESTAGIO_GROUPS) return prev;
                      return [
                        ...prev,
                        {
                          nome: "",
                          turno: "MANHA",
                          capacidade: "",
                          horaInicio: "",
                          horaFim: "",
                          inscricaoIds: [],
                        },
                      ];
                    })
                  }
                  icon="Plus"
                  disabled={groups.length >= MAX_ESTAGIO_GROUPS}
                >
                  Adicionar grupo
                </ButtonCustom>
              </div>

              {errors.grupos ? (
                <p className="!text-xs !text-red-600 mb-0!">{errors.grupos}</p>
              ) : null}
              {errors.capacidadeGrupos ? (
                <p className="!text-xs !text-red-600 mb-0!">
                  {errors.capacidadeGrupos}
                </p>
              ) : null}
              {groups.length >= MAX_ESTAGIO_GROUPS ? (
                <p className="!text-xs !text-gray-500 mb-0!">
                  Limite de {MAX_ESTAGIO_GROUPS} grupos atingido.
                </p>
              ) : null}

              {groups.map((group, index) => {
                const selectedInOtherGroups = new Set(
                  groups
                    .flatMap((item, i) =>
                      i === index ? [] : item.inscricaoIds,
                    )
                    .filter(Boolean),
                );
                const availableInscricoes = inscricoesOptions.filter(
                  (option) =>
                    !selectedInOtherGroups.has(option.value) ||
                    group.inscricaoIds.includes(option.value),
                );
                const selectedGroupInscricoes = availableInscricoes.filter(
                  (option) => group.inscricaoIds.includes(option.value),
                );

                return (
                  <div
                    key={`group-${index}`}
                    className="rounded-xl border border-gray-200/90 bg-gray-50/40 p-3 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="mb-0! !text-sm !font-semibold text-gray-800">
                          Grupo {index + 1}
                        </h4>
                        {modoAlocacao === "ESPECIFICOS" ? (
                          <p className="mb-0! !text-xs !text-gray-500">
                            {selectedGroupInscricoes.length} aluno(s) selecionado(s)
                          </p>
                        ) : null}
                      </div>
                      <ButtonCustom
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setGroupToDeleteIndex(index)}
                        className="min-w-8 h-8 !px-2 !pr-2 !pl-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ButtonCustom>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-12">
                      <InputCustom
                        className="lg:col-span-4"
                        label="Nome do grupo"
                        value={group.nome}
                        onChange={(e) =>
                          setGroups((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, nome: e.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Ex.: Grupo Manhã"
                        error={errors[`group_${index}_nome`]}
                        required
                      />

                      <SelectCustom
                        className="lg:col-span-2"
                        label="Turno"
                        options={TURNO_OPTIONS.map((option) => ({ ...option }))}
                        value={group.turno}
                        onChange={(value) =>
                          setGroups((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, turno: (value as Turno) || "MANHA" }
                              : item,
                            ),
                          )
                        }
                        required
                      />

                      <InputCustom
                        className="lg:col-span-2"
                        label="Capacidade"
                        type="number"
                        min={1}
                        value={group.capacidade}
                        onChange={(e) =>
                          setGroups((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, capacidade: e.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Ex.: 10"
                        error={errors[`group_${index}_capacidade`]}
                        required
                      />

                      <TimeInputCustom
                        className="lg:col-span-2"
                        label="Início"
                        name={`groupHoraInicio_${index}`}
                        placeholder="HH:mm"
                        value={group.horaInicio}
                        onChange={(value) =>
                          setGroups((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, horaInicio: value } : item,
                            ),
                          )
                        }
                        error={errors[`group_${index}_horaInicio`]}
                        disabled={isSaving}
                        required
                      />

                      <TimeInputCustom
                        className="lg:col-span-2"
                        label="Fim"
                        name={`groupHoraFim_${index}`}
                        placeholder="HH:mm"
                        value={group.horaFim}
                        onChange={(value) =>
                          setGroups((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, horaFim: value } : item,
                            ),
                          )
                        }
                        error={errors[`group_${index}_horaFim`]}
                        disabled={isSaving}
                        required
                      />
                    </div>

                    {modoAlocacao === "ESPECIFICOS" ? (
                      <div className="space-y-1 border-t border-gray-200 pt-3">
                        <MultiSelectCustom
                          label="Alunos do grupo"
                          options={availableInscricoes}
                          value={selectedGroupInscricoes}
                          onChange={(values) => {
                            setGroups((prev) =>
                              prev.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      inscricaoIds: values.map(
                                        (value) => value.value,
                                      ),
                                    }
                                  : item,
                              ),
                            );
                            setErrors((prev) => ({
                              ...prev,
                              inscricaoIds: undefined,
                              [`group_${index}_inscricaoIds`]: undefined,
                            }));
                          }}
                          emptyIndicator="Nenhum aluno disponível"
                          hideClearAllButton={false}
                          showCountBadge
                          maxVisibleTags={2}
                          placeholder={
                            !turmaId
                              ? "Selecione uma turma"
                              : inscricoesQuery.isLoading
                                ? "Carregando..."
                                : "Buscar por nome, matrícula ou CPF"
                          }
                          disabled={!turmaId || inscricoesQuery.isLoading}
                          size="md"
                          required
                        />
                        {errors[`group_${index}_inscricaoIds`] ? (
                          <p className="!text-xs !text-red-600">
                            {errors[`group_${index}_inscricaoIds`]}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
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

      <DeleteEstagioGroupModal
        isOpen={groupToDeleteIndex !== null}
        groupLabel={
          groupToDelete?.nome?.trim()
            ? groupToDelete.nome.trim()
            : groupToDeleteIndex !== null
              ? `Grupo ${groupToDeleteIndex + 1}`
              : undefined
        }
        onCancel={() => setGroupToDeleteIndex(null)}
        onConfirm={() => {
          if (groupToDeleteIndex === null) return;
          setGroups((prev) => prev.filter((_, i) => i !== groupToDeleteIndex));
          setGroupToDeleteIndex(null);
          setErrors((prev) => ({
            ...prev,
            grupos: undefined,
            capacidadeGrupos: undefined,
          }));
        }}
      />
    </div>
  );
}
