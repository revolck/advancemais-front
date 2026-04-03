"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Accessibility,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  Clock,
  Database,
  Download,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Gift,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Settings,
  Shield,
  Tag,
  Users,
} from "lucide-react";

import {
  getRecrutadorCandidatoCurriculoById,
  getRecrutadorVagaById,
  listRecrutadorVagaCandidatos,
  updateRecrutadorVagaCandidaturaStatus,
} from "@/api/recrutador";
import type {
  RecrutadorVagaResumo,
  RecrutadorVagaCandidatosItem,
} from "@/api/recrutador";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AvatarCustom,
  ButtonCustom,
  CardsStatistics,
  ChartsCustom,
  EmptyState,
  FilterBar,
  HorizontalTabs,
  type HorizontalTabItem,
} from "@/components/ui/custom";
import type { DateRange } from "@/components/ui/custom/date-picker";
import type { FilterField } from "@/components/ui/custom/filters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDate,
  formatModalidade,
  formatRegimeTrabalho,
  formatSenioridade,
  formatVagaStatus,
  formatCurrency,
  getVagaStatusBadgeClasses,
  formatJornada,
} from "../../admin/vaga-details/utils";
import { generateCurriculoPdf } from "../../admin/candidato-details/utils/generateCurriculoPdf";
import { EditarStatusCandidatoModal } from "../../admin/vaga-details/modal-acoes";
import { VerCandidatoDetalheModal } from "../../admin/vaga-details/modal-acoes";
import type { CandidatoItem as AdminVagaCandidatoItem } from "../../admin/vaga-details/types";

interface RecruiterVagaDetailsViewProps {
  vagaId: string;
}

function formatCNPJ(cnpj?: string | null): string {
  if (!cnpj) return "";
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

function formatLocation(vaga: RecrutadorVagaResumo): string {
  const cidade = vaga.localizacao?.cidade?.trim();
  const estado = vaga.localizacao?.estado?.trim();
  const base = [cidade, estado].filter(Boolean).join("/");

  return base || vaga.localizacao?.label?.trim() || "Não informado";
}

function buildHeaderSubtitle(vaga: RecrutadorVagaResumo): string {
  const parts = [
    vaga.empresa?.nomeExibicao || vaga.empresa?.nome || "Empresa não informada",
  ];

  if (vaga.empresa?.cnpj) {
    parts.push(`CNPJ: ${formatCNPJ(vaga.empresa.cnpj)}`);
  }

  return parts.join("  |  ");
}

function buildDescription(vaga: RecrutadorVagaResumo): string | null {
  return vaga.descricao?.trim() || null;
}

function buildList(values?: string[] | null): string[] {
  if (!values?.length) return [];
  return values.map((item) => item.trim()).filter(Boolean);
}

function SectionCard({
  title,
  items,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  items: string[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt={emptyTitle}
          title={emptyTitle}
          description={emptyDescription}
          maxContentWidth="md"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
      <h6 className="mb-4 text-sm font-medium text-gray-900">{title}</h6>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="flex gap-3 text-sm text-gray-700"
          >
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoAside({ vaga }: { vaga: RecrutadorVagaResumo }) {
  const items = [
    {
      label: "Código da vaga",
      value: vaga.codigo ?? "—",
      icon: Tag,
    },
    {
      label: "Status",
      value: vaga.status ? vaga.status.toUpperCase() : "—",
      icon: CheckCircle,
    },
    {
      label: "Criada em",
      value: formatDate(vaga.inseridaEm ?? vaga.criadoEm),
      icon: CalendarDays,
    },
    {
      label: "Atualizada em",
      value: formatDate(vaga.atualizadoEm),
      icon: CalendarDays,
    },
    {
      label: "Inscrições até",
      value: vaga.inscricoesAte
        ? formatDate(vaga.inscricoesAte)
        : "Não definida",
      icon: CalendarDays,
    },
    {
      label: "Vagas disponíveis",
      value:
        typeof vaga.numeroVagas === "number"
          ? vaga.numeroVagas.toString().padStart(2, "0")
          : "—",
      icon: Users,
    },
  ].filter((item) => item.value && item.value !== "—");

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Informações</h4>
        <dl className="space-y-4 text-sm">
          {items.map((info) => (
            <div key={info.label} className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <info.icon className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-1 flex-col">
                <dt className="text-xs font-medium uppercase text-gray-600">
                  {info.label}
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {info.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}

function AboutTab({ vaga }: { vaga: RecrutadorVagaResumo }) {
  const description = buildDescription(vaga);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        {description ? (
          <div>
            <h6 className="text-sm font-medium text-gray-900 mb-3">
              Descrição
            </h6>
            <p className="text-sm text-gray-700 leading-relaxed">
              {description}
            </p>
          </div>
        ) : (
          <EmptyState
            illustration="companyDetails"
            illustrationAlt="Descrição vazia da vaga"
            title="Descrição não adicionada"
            description="Até o momento, esta vaga não possui descrição detalhada."
            maxContentWidth="md"
          />
        )}

        {vaga.observacoes?.trim() ? (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h6 className="text-sm font-medium text-gray-900 mb-3">
              Observações
            </h6>
            <p className="text-sm text-gray-700 leading-relaxed">
              {vaga.observacoes}
            </p>
          </div>
        ) : null}
      </section>

      <InfoAside vaga={vaga} />
    </div>
  );
}

function SalarioVagasTab({ vaga }: { vaga: RecrutadorVagaResumo }) {
  const getVagaLocation = () => {
    const cidade = vaga.localizacao?.cidade?.trim();
    const estado = vaga.localizacao?.estado?.trim();

    if (cidade && estado) return `${cidade}/${estado}`;
    if (cidade) return cidade;
    if (estado) return estado;
    return "Brasil";
  };

  const getKPIMetrics = () => {
    const salarioMin = Number(vaga.salarioMin) || 0;
    const salarioMax = Number(vaga.salarioMax) || 0;

    let salarioValue = "";
    let salarioLabel = "";

    if (vaga.salarioConfidencial) {
      salarioValue = "Confidencial";
      salarioLabel = "Salário";
    } else if (salarioMin && salarioMax) {
      salarioValue = `${formatCurrency(salarioMin)} - ${formatCurrency(salarioMax)}`;
      salarioLabel = "Faixa Salarial";
    } else if (salarioMin) {
      salarioValue = formatCurrency(salarioMin);
      salarioLabel = "A partir de";
    } else if (salarioMax) {
      salarioValue = formatCurrency(salarioMax);
      salarioLabel = "Até";
    } else {
      salarioValue = "A combinar";
      salarioLabel = "Salário";
    }

    const totalCandidaturas = 0;

    return [
      {
        icon: DollarSign,
        iconBg: "bg-emerald-100 text-emerald-600",
        cardBg: "bg-emerald-50/50",
        value: salarioValue,
        label: salarioLabel,
      },
      {
        icon: Users,
        iconBg: "bg-indigo-100 text-indigo-600",
        cardBg: "bg-indigo-50/50",
        value: (vaga.numeroVagas || 0).toString().padStart(2, "0"),
        label: "Vagas Disponíveis",
      },
      {
        icon: Tag,
        iconBg: "bg-violet-100 text-violet-600",
        cardBg: "bg-violet-50/50",
        value: totalCandidaturas,
        label: "Candidaturas Recebidas",
      },
    ];
  };

  const getSalaryComparisonData = () => {
    const baseSalary = Number(vaga.salarioMin) || 3000;
    const vagaLocation = getVagaLocation();

    const localMarket = Math.round(baseSalary * 0.85);
    const brasilMarket = Math.round(baseSalary * 1.25);

    return [
      { region: vagaLocation, vaga: baseSalary, mercado: localMarket },
      { region: "Brasil", vaga: baseSalary, mercado: brasilMarket },
    ];
  };

  const getAgeRangeData = () => {
    const totalCandidates = 100;

    return [
      {
        name: "18-25 anos",
        value: Math.round(totalCandidates * 0.25),
        fill: "#8b5cf6",
      },
      {
        name: "26-35 anos",
        value: Math.round(totalCandidates * 0.45),
        fill: "#f59e0b",
      },
      {
        name: "36-45 anos",
        value: Math.round(totalCandidates * 0.2),
        fill: "#10b981",
      },
      {
        name: "46+ anos",
        value: Math.round(totalCandidates * 0.1),
        fill: "#6366f1",
      },
    ];
  };

  const getChartConfig = () => ({
    vaga: { label: "Vaga Atual", color: "#6366f1" },
    mercado: { label: "Mercado", color: "#10b981" },
    value: { label: "Valor", color: "#6366f1" },
  });

  const vagaLocation = getVagaLocation();

  return (
    <div className="space-y-6">
      <CardsStatistics
        cards={getKPIMetrics()}
        showBadges={false}
        gridClassName="grid-cols-1 sm:grid-cols-3 gap-4"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartsCustom
          type="bar"
          data={getSalaryComparisonData()}
          config={getChartConfig()}
          xAxisKey="region"
          title={`Comparativo Salarial: ${vagaLocation} vs Brasil`}
          description="Comparação entre salário da vaga e média do mercado"
          height={280}
          showLegend
        />

        <ChartsCustom
          type="pie"
          data={getAgeRangeData()}
          config={getChartConfig()}
          title="Candidaturas por Faixa Etária"
          description="Distribuição de candidatos por idade"
          height={280}
          showLegend
        />
      </div>
    </div>
  );
}

function LocalizacaoTab({ vaga }: { vaga: RecrutadorVagaResumo }) {
  const hasLocationInfo = Boolean(
    vaga.localizacao?.cidade ||
    vaga.localizacao?.estado ||
    vaga.localizacao?.label ||
    vaga.localizacao?.modalidadeLabel ||
    vaga.modalidade ||
    vaga.jornada ||
    vaga.regimeDeTrabalho ||
    vaga.senioridade,
  );

  if (!hasLocationInfo) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de localização vazia"
          title="Informações não definidas"
          description="Esta vaga ainda não possui informações de localização e modalidade."
          maxContentWidth="md"
        />
      </div>
    );
  }

  return (
    <CardsStatistics
      cards={[
        {
          icon: MapPin,
          iconBg: "bg-blue-100 text-blue-600",
          cardBg: "bg-blue-50/50",
          value: formatLocation(vaga),
          label: "Localização",
        },
        {
          icon: Building2,
          iconBg: "bg-emerald-100 text-emerald-600",
          cardBg: "bg-emerald-50/50",
          value:
            vaga.localizacao?.modalidadeLabel ||
            formatModalidade(vaga.modalidade),
          label: "Modalidade",
        },
        {
          icon: Clock,
          iconBg: "bg-amber-100 text-amber-600",
          cardBg: "bg-amber-50/50",
          value: formatJornada(vaga.jornada),
          label: "Jornada",
        },
        {
          icon: Briefcase,
          iconBg: "bg-violet-100 text-violet-600",
          cardBg: "bg-violet-50/50",
          value: formatRegimeTrabalho(vaga.regimeDeTrabalho),
          label: "Regime de Trabalho",
        },
        {
          icon: Settings,
          iconBg: "bg-indigo-100 text-indigo-600",
          cardBg: "bg-indigo-50/50",
          value: formatSenioridade(vaga.senioridade),
          label: "Senioridade",
        },
        {
          icon: CalendarDays,
          iconBg: "bg-slate-100 text-slate-600",
          cardBg: "bg-slate-50/50",
          value: formatDate(vaga.inseridaEm ?? vaga.criadoEm),
          label: "Criada em",
        },
      ]}
      showBadges={false}
      gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    />
  );
}

const EMPTY_DATE_RANGE: DateRange = { from: null, to: null };
const CANDIDATOS_PAGE_SIZE = 10;
const SEARCH_HELPER_TEXT = "Pesquise por nome, email ou código do candidato.";

function formatCpf(value?: string | null): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatTelefone(value?: string | null): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return value;
}

function formatCandidateLocation(
  candidato: RecrutadorVagaCandidatosItem["candidato"],
): string {
  return (
    [candidato.cidade, candidato.estado].filter(Boolean).join(", ") ||
    "Não informado"
  );
}

function VagaCandidatosSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
        <div className="grid min-w-[1080px] grid-cols-[280px_220px_160px_160px_160px_160px_96px] gap-0">
          {[
            "Candidato",
            "Contato",
            "Currículo",
            "Experiência",
            "Formação",
            "Status",
            "Ações",
          ].map((label) => (
            <div
              key={label}
              className="text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[1080px]">
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="border-gray-100">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-9 w-9 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CandidatosTab({ vaga }: { vaga: RecrutadorVagaResumo }) {
  const queryClient = useQueryClient();
  const [pendingSearch, setPendingSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pendingDateRange, setPendingDateRange] =
    useState<DateRange>(EMPTY_DATE_RANGE);
  const [appliedDateRange, setAppliedDateRange] =
    useState<DateRange>(EMPTY_DATE_RANGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingCurriculoId, setDownloadingCurriculoId] = useState<
    string | null
  >(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCandidato, setSelectedCandidato] =
    useState<AdminVagaCandidatoItem | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsCandidato, setDetailsCandidato] =
    useState<RecrutadorVagaCandidatosItem | null>(null);
  const [loadingCandidatoId, setLoadingCandidatoId] = useState<string | null>(
    null,
  );

  const candidatosQueryKey = [
    "recrutador-vaga-candidatos",
    vaga.id,
    appliedSearch,
    appliedDateRange.from?.toISOString() ?? null,
    appliedDateRange.to?.toISOString() ?? null,
    currentPage,
  ] as const;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: candidatosQueryKey,
    queryFn: async () =>
      listRecrutadorVagaCandidatos(vaga.id, {
        search: appliedSearch || undefined,
        inscricaoDe: appliedDateRange.from
          ? new Date(
              appliedDateRange.from.getFullYear(),
              appliedDateRange.from.getMonth(),
              appliedDateRange.from.getDate(),
              0,
              0,
              0,
              0,
            ).toISOString()
          : undefined,
        inscricaoAte: appliedDateRange.to
          ? new Date(
              appliedDateRange.to.getFullYear(),
              appliedDateRange.to.getMonth(),
              appliedDateRange.to.getDate(),
              23,
              59,
              59,
              999,
            ).toISOString()
          : undefined,
        page: currentPage,
        pageSize: CANDIDATOS_PAGE_SIZE,
      }),
    enabled: Boolean(vaga.id),
  });

  const items = useMemo(() => data?.data.items ?? [], [data?.data.items]);
  const pagination = data?.data.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const totalItems = pagination?.total ?? items.length;
  const page = pagination?.page ?? currentPage;
  const pageSize = pagination?.pageSize ?? CANDIDATOS_PAGE_SIZE;
  const safePage = Math.min(page, totalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);
  const shouldShowSkeleton = isLoading || (isFetching && items.length === 0);
  const showEmptyState = !isLoading && !isFetching && totalItems === 0;
  const hasActiveFilters = Boolean(
    appliedSearch || appliedDateRange.from || appliedDateRange.to,
  );
  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let nextPage = 1; nextPage <= totalPages; nextPage += 1) {
        pages.push(nextPage);
      }
      return pages;
    }

    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let nextPage = adjustedStart; nextPage <= end; nextPage += 1) {
      pages.push(nextPage);
    }

    return pages;
  }, [safePage, totalPages]);

  const filterFields: FilterField[] = [
    {
      key: "periodo",
      label: "Período de inscrição",
      type: "date-range",
      placeholder: "Selecionar período",
    },
  ];

  const handleSearchSubmit = () => {
    setAppliedSearch(pendingSearch.trim());
    setCurrentPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.max(1, Math.min(nextPage, totalPages)));
  };

  const handleEditStatus = (item: RecrutadorVagaCandidatosItem) => {
    setSelectedCandidato({
      id: item.candidato.id,
      codUsuario: item.candidato.codUsuario,
      cpf: item.candidato.cpf,
      candidaturaId: item.candidaturaId,
      curriculoId: item.curriculo?.id,
      nome: item.candidato.nomeCompleto,
      email: item.candidato.email || "",
      telefone: item.candidato.telefone || undefined,
      avatarUrl: item.candidato.avatarUrl || null,
      dataInscricao: item.criadoEm || "",
      status: (item.statusCandidatura ||
        "RECEBIDA") as unknown as AdminVagaCandidatoItem["status"],
      experiencia: item.experienciaResumo || undefined,
      formacao: item.formacaoResumo || undefined,
      createdAt: item.criadoEm || "",
    });
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (item: RecrutadorVagaCandidatosItem) => {
    setLoadingCandidatoId(item.candidato.id);
    setDetailsCandidato(item);
    setIsDetailsOpen(true);
    setTimeout(() => setLoadingCandidatoId(null), 500);
  };

  const handleSaveStatus = async (candidaturaId: string, statusId: string) => {
    setIsSavingStatus(true);

    try {
      const response = await updateRecrutadorVagaCandidaturaStatus(
        vaga.id,
        candidaturaId,
        {
          statusId,
        },
      );

      if (!response.success) {
        throw new Error(
          response.message || "Não foi possível atualizar o status.",
        );
      }

      toastCustom.success({
        title: "Status atualizado",
        description: "O status do candidato foi atualizado com sucesso.",
      });

      await queryClient.invalidateQueries({
        queryKey: ["recrutador-vaga-candidatos", vaga.id],
      });

      setIsEditModalOpen(false);
      setSelectedCandidato(null);
    } catch (saveError) {
      toastCustom.error({
        title: "Erro ao atualizar",
        description:
          saveError instanceof Error
            ? saveError.message
            : "Não foi possível atualizar o status da candidatura.",
      });
      throw saveError;
    } finally {
      setIsSavingStatus(false);
    }
  };

  const loadRecrutadorCandidaturaDetalhe = useCallback(
    async (candidaturaId: string) => {
      const selectedItem =
        items.find((item) => item.candidaturaId === candidaturaId) ??
        detailsCandidato;

      if (!selectedItem) {
        throw new Error("Não foi possível localizar a candidatura selecionada.");
      }

      let curriculo: unknown = null;

      if (selectedItem.curriculo?.id) {
        const curriculoResponse = await getRecrutadorCandidatoCurriculoById(
          selectedItem.candidato.id,
          selectedItem.curriculo.id,
        );

        if (!curriculoResponse.success) {
          throw new Error(
            curriculoResponse.message ||
              "Não foi possível carregar o currículo do candidato.",
          );
        }

        curriculo = curriculoResponse.data;
      }

      return {
        candidatura: {
          id: selectedItem.candidaturaId,
          status: selectedItem.statusCandidatura ?? null,
          aplicadaEm: selectedItem.criadoEm ?? null,
          candidato: {
            id: selectedItem.candidato.id,
            nome: selectedItem.candidato.nomeCompleto,
            nomeCompleto: selectedItem.candidato.nomeCompleto,
            email: selectedItem.candidato.email ?? null,
            telefone: selectedItem.candidato.telefone ?? null,
            avatarUrl: selectedItem.candidato.avatarUrl ?? null,
            cidade: selectedItem.candidato.cidade ?? null,
            estado: selectedItem.candidato.estado ?? null,
          },
          curriculo,
        },
      };
    },
    [detailsCandidato, items],
  );

  const statusBadgeClasses = (status?: string | null) => {
    const normalized = String(status || "").toUpperCase();
    if (["CONTRATADO", "APROVADO"].includes(normalized))
      return "border-green-200 bg-green-50 text-green-700";
    if (["RECUSADO", "REJEITADO", "CANCELADO", "DESISTIU"].includes(normalized))
      return "border-red-200 bg-red-50 text-red-700";
    if (
      ["EM_PROCESSO", "EM_ANALISE", "EM_TRIAGEM", "ENTREVISTA"].includes(
        normalized,
      )
    )
      return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-slate-200 bg-slate-50 text-slate-700";
  };

  const handleDownloadCurriculo = async (
    item: RecrutadorVagaCandidatosItem,
  ) => {
    const curriculoId = item.curriculo?.id;

    if (!curriculoId) {
      toastCustom.error({
        title: "Currículo indisponível",
        description:
          "Esta candidatura não possui currículo vinculado para download.",
      });
      return;
    }

    setDownloadingCurriculoId(item.candidaturaId);

    try {
      const response = await getRecrutadorCandidatoCurriculoById(
        item.candidato.id,
        curriculoId,
      );

      if (!response.success) {
        throw new Error(
          response.message || "Não foi possível carregar o currículo.",
        );
      }

      await generateCurriculoPdf(response.data, item.candidato.nomeCompleto, {
        avatarUrl: item.candidato.avatarUrl ?? null,
        email: item.candidato.email ?? null,
        telefone: item.candidato.telefone ?? null,
      } as never);

      toastCustom.success({
        title: "Download iniciado",
        description: "O currículo está sendo baixado em PDF.",
      });
    } catch (downloadError) {
      toastCustom.error({
        title: "Erro ao baixar currículo",
        description:
          downloadError instanceof Error
            ? downloadError.message
            : "Não foi possível baixar o currículo visível no escopo do recrutador.",
      });
    } finally {
      setDownloadingCurriculoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <FilterBar
          fields={filterFields}
          values={{ periodo: pendingDateRange }}
          onChange={(key, value) => {
            if (key === "periodo") {
              const range = (value as DateRange) ?? EMPTY_DATE_RANGE;
              setPendingDateRange(range);
              setAppliedDateRange(range);
              setCurrentPage(1);
            }
          }}
          onClearAll={() => {
            setPendingSearch("");
            setAppliedSearch("");
            setPendingDateRange(EMPTY_DATE_RANGE);
            setAppliedDateRange(EMPTY_DATE_RANGE);
            setCurrentPage(1);
          }}
          className="lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto]"
          showActiveChips={false}
          search={{
            label: "Pesquisar candidato",
            value: pendingSearch,
            onChange: setPendingSearch,
            placeholder: "Buscar por nome, email ou código...",
            helperText: SEARCH_HELPER_TEXT,
            helperPlacement: "tooltip",
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearchSubmit();
              }
            },
          }}
          rightActions={
            <ButtonCustom
              variant="primary"
              size="lg"
              onClick={handleSearchSubmit}
              fullWidth
              className="md:w-full xl:w-auto"
            >
              Pesquisar
            </ButtonCustom>
          }
        />
      </div>

      {error ? (
        <div className="mt-3 flex items-center gap-2 px-1 text-sm text-red-600">
          <span>{error.message || "Erro ao carregar candidatos."}</span>
          <Button
            variant="link"
            size="sm"
            onClick={() => void refetch()}
            className="h-auto p-0"
          >
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <div className="w-full max-w-none">
        {shouldShowSkeleton ? (
          <VagaCandidatosSkeleton />
        ) : showEmptyState ? (
          <EmptyState
            illustration="userProfiles"
            title="Nenhum candidato encontrado"
            description={
              hasActiveFilters
                ? "Nenhum candidato corresponde aos filtros aplicados. Tente ajustar sua busca."
                : "Ainda não há candidatos inscritos nesta vaga. Quando os candidatos se inscreverem, eles aparecerão aqui."
            }
            size="md"
          />
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 bg-gray-50/50">
                    <TableHead className="min-w-[200px] max-w-[250px]">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Candidato
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[180px] max-w-[220px]">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Contato
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[120px] max-w-[150px]">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Experiência
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[120px] max-w-[150px]">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Formação
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[120px] max-w-[150px]">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Status
                      </span>
                    </TableHead>
                    <TableHead className="min-w-[140px] max-w-[180px]">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Data de Inscrição
                      </span>
                    </TableHead>
                    <TableHead className="text-right w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                {items.map((item) => {
                  const isRowLoading = loadingCandidatoId === item.candidato.id;
                  const isDisabled =
                    loadingCandidatoId !== null && !isRowLoading;

                  return (
                  <TableRow
                    key={item.candidaturaId}
                    className={cn(
                      "border-gray-100 transition-colors",
                      isDisabled
                        ? "opacity-50 pointer-events-none"
                        : "hover:bg-gray-50/50",
                      isRowLoading && "bg-blue-50/50",
                    )}
                  >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarCustom
                            name={item.candidato.nomeCompleto}
                            src={item.candidato.avatarUrl || undefined}
                            size="sm"
                            showStatus={false}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-gray-900">
                                {item.candidato.nomeCompleto}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {item.candidato.codUsuario}
                              </span>
                            </div>
                            <div className="truncate font-mono text-sm text-gray-500">
                              {formatCpf(item.candidato.cpf)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">
                              {item.candidato.email || "—"}
                            </span>
                          </div>
                          {item.candidato.telefone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {formatTelefone(item.candidato.telefone)}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {item.experienciaResumo || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-gray-900">
                          {item.formacaoResumo || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            statusBadgeClasses(item.statusCandidatura),
                          )}
                        >
                          {item.statusCandidaturaLabel ||
                            item.statusCandidatura ||
                            "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(item.criadoEm)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(item)}
                                className="h-8 w-8 rounded-full cursor-pointer text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
                                aria-label="Ver detalhes"
                              >
                                {isRowLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                              Ver detalhes
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditStatus(item)}
                                className="h-8 w-8 rounded-full cursor-pointer text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
                                aria-label="Editar status"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                              Editar status
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  void handleDownloadCurriculo(item)
                                }
                                disabled={
                                  !item.curriculo?.id ||
                                  downloadingCurriculoId === item.candidaturaId
                                }
                                className={cn(
                                  "h-8 w-8 rounded-full cursor-pointer",
                                  downloadingCurriculoId === item.candidaturaId
                                    ? "text-green-600 bg-green-100"
                                    : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                                  "disabled:opacity-50 disabled:cursor-not-allowed",
                                )}
                                aria-label="Baixar currículo"
                              >
                                {downloadingCurriculoId ===
                                item.candidaturaId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                              {!item.curriculo?.id
                                ? "Currículo indisponível"
                                : downloadingCurriculoId === item.candidaturaId
                                  ? "Baixando..."
                                  : "Baixar currículo"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>

            <div className="flex flex-col gap-4 bg-gray-50/30 px-6 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Mostrando {startItem} a {endItem} de {totalItems}{" "}
                {totalItems === 1 ? "candidato" : "candidatos"}
                {isFetching && !isLoading ? " · Atualizando..." : ""}
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(safePage - 1)}
                    disabled={safePage === 1 || isFetching}
                  >
                    Anterior
                  </Button>

                  {visiblePages.map((visiblePage) => (
                    <Button
                      key={visiblePage}
                      type="button"
                      variant={visiblePage === safePage ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(visiblePage)}
                      disabled={isFetching}
                    >
                      {visiblePage}
                    </Button>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(safePage + 1)}
                    disabled={safePage === totalPages || isFetching}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <EditarStatusCandidatoModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        candidato={selectedCandidato}
        onSaveStatus={handleSaveStatus}
        isSaving={isSavingStatus}
      />

      <VerCandidatoDetalheModal
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        candidaturaId={detailsCandidato?.candidaturaId}
        loadCandidaturaDetalhe={loadRecrutadorCandidaturaDetalhe}
        fallback={
          detailsCandidato
            ? {
                nome: detailsCandidato.candidato.nomeCompleto,
                email: detailsCandidato.candidato.email ?? "",
                telefone: detailsCandidato.candidato.telefone ?? "",
                dataInscricao: detailsCandidato.criadoEm ?? "",
                avatarUrl: detailsCandidato.candidato.avatarUrl ?? null,
              }
            : undefined
        }
      />
    </div>
  );
}

function DetailsTab({ vaga }: { vaga: RecrutadorVagaResumo }) {
  return (
    <div className="space-y-6">
      <div>
        <h5 className="!mb-0">Detalhes Técnicos</h5>
        <p>
          Informações técnicas específicas e configurações avançadas da vaga
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h5 className="!mb-0 flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Metadados
          </h5>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Criada em:</span>
              <span className="text-sm font-medium">
                {formatDate(vaga.inseridaEm ?? vaga.criadoEm)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Atualizada em:</span>
              <span className="text-sm font-medium">
                {formatDate(vaga.atualizadoEm)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Inscrições até:</span>
              <span className="text-sm font-medium">
                {vaga.inscricoesAte
                  ? formatDate(vaga.inscricoesAte)
                  : "Não definida"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Última modificação:</span>
              <span className="text-sm font-medium">
                {formatDate(vaga.atualizadoEm)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h5 className="!mb-0 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Configurações de Segurança
          </h5>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Modo Anônimo:</span>
              <span
                className={cn(
                  "text-sm font-medium",
                  vaga.modoAnonimo ? "text-green-600" : "text-red-600",
                )}
              >
                {vaga.modoAnonimo ? "Ativado" : "Desativado"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Acessibilidade PCD:</span>
              <span
                className={cn(
                  "text-sm font-medium",
                  vaga.paraPcd ? "text-green-600" : "text-red-600",
                )}
              >
                {vaga.paraPcd ? "Ativado" : "Desativado"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">
                Salário Confidencial:
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  vaga.salarioConfidencial ? "text-green-600" : "text-red-600",
                )}
              >
                {vaga.salarioConfidencial ? "Sim" : "Não"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Categoria:</span>
              <span className="text-sm font-medium text-right">
                {vaga.areaInteresse?.categoria || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Subárea:</span>
              <span className="text-sm font-medium text-right">
                {vaga.subareaInteresse?.nome || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderSection({ vaga }: { vaga: RecrutadorVagaResumo }) {
  const companyName =
    vaga.empresa?.nomeExibicao || vaga.empresa?.nome || "Empresa não informada";
  const isPublished = vaga.status === "PUBLICADO";
  const statusColor = isPublished ? "bg-emerald-500" : "bg-amber-500";
  const subtitle = buildHeaderSubtitle(vaga);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <AvatarCustom
              name={companyName}
              src={vaga.empresa?.avatarUrl || undefined}
              size="xl"
              showStatus={false}
              className="text-base"
            />
            <span
              className={cn(
                "absolute bottom-1 right-1 inline-flex size-4 items-center justify-center rounded-full border-2 border-white",
                statusColor,
              )}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold !mb-0">{vaga.titulo}</h3>
              <Badge
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  getVagaStatusBadgeClasses(vaga.status),
                )}
              >
                {formatVagaStatus(vaga.status)}
              </Badge>
              {vaga.paraPcd ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <Accessibility className="h-4 w-4" />
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
              <span>{subtitle}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link
              href="/dashboard/empresas/vagas"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function RecruiterVagaDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-white">
        <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Skeleton className="h-20 w-20 rounded-full bg-gray-200" />
              <Skeleton className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-gray-200 border-2 border-white" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-64 bg-gray-200" />
                <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
              </div>
              <Skeleton className="h-4 w-56 bg-gray-200" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-full bg-gray-200" />
        </div>
      </section>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-1 overflow-x-auto px-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-4 border-b-2 border-transparent"
              >
                <Skeleton className="h-4 w-4 bg-gray-200" />
                <Skeleton className="h-4 w-20 bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)] gap-6">
            <Skeleton className="h-72 w-full rounded-2xl bg-gray-200" />
            <Skeleton className="h-72 w-full rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecruiterVagaDetailsView({
  vagaId,
}: RecruiterVagaDetailsViewProps) {
  const { data, isLoading, error, refetch } = useQuery<
    RecrutadorVagaResumo,
    Error
  >({
    queryKey: ["recrutador-vaga-detail", vagaId],
    queryFn: async () => {
      const response = await getRecrutadorVagaById(vagaId);
      if (!response.success) {
        throw new Error(
          response.message || "Não foi possível carregar a vaga.",
        );
      }
      return response.data;
    },
    enabled: Boolean(vagaId),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const tabs = useMemo<HorizontalTabItem[]>(() => {
    if (!data) return [];

    return [
      {
        value: "sobre",
        label: "Sobre",
        icon: "FileText",
        content: <AboutTab vaga={data} />,
      },
      {
        value: "requisitos",
        label: "Requisitos",
        icon: "CheckSquare",
        content: (
          <SectionCard
            title="Requisitos obrigatórios"
            items={[
              ...buildList(data.requisitos?.obrigatorios),
              ...buildList(data.requisitos?.desejaveis),
            ]}
            emptyTitle="Requisitos não adicionados"
            emptyDescription="Esta vaga ainda não possui requisitos detalhados."
          />
        ),
      },
      {
        value: "atividades",
        label: "Atividades",
        icon: "Briefcase",
        content: (
          <SectionCard
            title="Atividades da vaga"
            items={[
              ...buildList(data.atividades?.principais),
              ...buildList(data.atividades?.extras),
            ]}
            emptyTitle="Atividades não adicionadas"
            emptyDescription="Esta vaga ainda não possui atividades detalhadas."
          />
        ),
      },
      {
        value: "beneficios",
        label: "Benefícios",
        icon: "Gift",
        content: (
          <div className="space-y-6">
            <SectionCard
              title="Benefícios"
              items={buildList(data.beneficios?.lista)}
              emptyTitle="Benefícios não adicionados"
              emptyDescription="Esta vaga ainda não possui benefícios detalhados."
            />
            {data.beneficios?.observacoes?.trim() ? (
              <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
                <h6 className="text-sm font-medium text-gray-900 mb-3">
                  Observações sobre benefícios
                </h6>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {data.beneficios.observacoes}
                </p>
              </div>
            ) : null}
          </div>
        ),
      },
      {
        value: "salario-vagas",
        label: "Salário & Vagas",
        icon: "DollarSign",
        content: <SalarioVagasTab vaga={data} />,
      },
      {
        value: "localizacao",
        label: "Localização & Modalidade",
        icon: "MapPin",
        content: <LocalizacaoTab vaga={data} />,
      },
      {
        value: "candidatos",
        label: "Candidatos",
        icon: "Users",
        content: <CandidatosTab vaga={data} />,
      },
      {
        value: "detalhes",
        label: "Detalhes Técnicos",
        icon: "Settings",
        content: <DetailsTab vaga={data} />,
      },
    ];
  }, [data]);

  if (isLoading) {
    return <RecruiterVagaDetailsSkeleton />;
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || "Não foi possível carregar os dados da vaga."}
          </AlertDescription>
        </Alert>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm font-medium text-[var(--primary-color)]"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <HeaderSection vaga={data} />
      <HorizontalTabs items={tabs} defaultValue="sobre" />
    </div>
  );
}
