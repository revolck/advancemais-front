"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  Eye,
  ExternalLink,
  Loader2,
  MapPin,
  PlayCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AvatarCustom,
  ButtonCustom,
  EmptyState,
  FilterBar,
} from "@/components/ui/custom";
import type { DateRange } from "@/components/ui/custom/date-picker";
import type { FilterField } from "@/components/ui/custom/filters";
import type { SelectOption } from "@/components/ui/custom/select";
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
  getRecrutadorEntrevistaById,
  type GetRecrutadorEntrevistaResponse,
} from "@/api/recrutador";
import type { EntrevistaOverviewItem } from "@/api/entrevistas";
import { EntrevistaModalView } from "@/theme/dashboard/components/admin/lista-entrevistas/components/EntrevistaModalView";
import { cn } from "@/lib/utils";
import { AddEntrevistaRecrutadorModal } from "./components/AddEntrevistaRecrutadorModal";
import { useRecruiterEntrevistasDashboardQuery } from "./hooks/useRecruiterEntrevistasDashboardQuery";

const MIN_SEARCH_LENGTH = 3;
const PAGE_SIZE = 10;
const EMPTY_DATE_RANGE: DateRange = { from: null, to: null };
const MAX_INTERVIEW_FILTER_DATE = new Date("2100-12-31T23:59:59.999Z");

const FALLBACK_STATUS_OPTIONS: SelectOption[] = [
  { value: "AGENDADA", label: "Agendada" },
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "REALIZADA", label: "Realizada" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "REAGENDADA", label: "Reagendada" },
  { value: "NAO_COMPARECEU", label: "Não compareceu" },
];

const FALLBACK_MODALIDADE_OPTIONS: SelectOption[] = [
  { value: "ONLINE", label: "Online" },
  { value: "PRESENCIAL", label: "Presencial" },
];

function getSearchValidationMessage(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return `Informe pelo menos ${MIN_SEARCH_LENGTH} caracteres para pesquisar.`;
  }
  return null;
}

function toRangeStartIso(date: Date | null): string | undefined {
  if (!date) return undefined;
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toISOString();
}

function toRangeEndIso(date: Date | null): string | undefined {
  if (!date) return undefined;
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value.toISOString();
}

function buildStatusClasses(status: string): string {
  switch (status) {
    case "AGENDADA":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "CONFIRMADA":
      return "bg-cyan-100 text-cyan-800 border border-cyan-200";
    case "REALIZADA":
      return "bg-green-100 text-green-800 border border-green-200";
    case "CANCELADA":
      return "bg-red-100 text-red-800 border border-red-200";
    case "REAGENDADA":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "NAO_COMPARECEU":
      return "bg-gray-100 text-gray-800 border border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
}

function buildModalidadeClasses(modalidade?: string | null): string {
  switch (modalidade) {
    case "ONLINE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PRESENCIAL":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function formatCpf(cpf?: string | null): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  return cpf;
}

function buildCompanyDisplayName(entrevista: EntrevistaOverviewItem): string | undefined {
  return (
    entrevista.empresa?.labelExibicao ??
    (entrevista.empresaAnonima || entrevista.empresa?.anonima
      ? "Empresa anônima"
      : entrevista.empresa?.nomeExibicao ?? undefined)
  );
}

function buildAddressText(
  endereco?: EntrevistaOverviewItem["enderecoPresencial"],
): string | null {
  if (!endereco) return null;

  const line1 = [endereco.logradouro, endereco.numero]
    .filter(Boolean)
    .join(", ")
    .trim();
  const line2 = [endereco.bairro, endereco.cidade, endereco.estado]
    .filter(Boolean)
    .join(", ")
    .trim();
  const line3 = [endereco.cep, endereco.complemento, endereco.pontoReferencia]
    .filter(Boolean)
    .join(" · ")
    .trim();

  return [line1, line2, line3].filter(Boolean).join(" — ") || null;
}

function buildInterviewActionHref(entrevista: EntrevistaOverviewItem): string | null {
  if (entrevista.meetUrl) {
    return entrevista.meetUrl;
  }

  const locationQuery = entrevista.local?.trim() || buildAddressText(entrevista.enderecoPresencial);
  if (!locationQuery) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
}

function buildInterviewActionLabel(entrevista: EntrevistaOverviewItem): string {
  return entrevista.modalidade === "ONLINE" ? "Começar" : "Ver local";
}

function mergeInterviewDetails(
  entrevistaBase: EntrevistaOverviewItem,
  response: GetRecrutadorEntrevistaResponse,
): EntrevistaOverviewItem {
  const detalhe = (response.data ?? response.entrevista) as Partial<EntrevistaOverviewItem> | null;

  if (!detalhe) {
    return entrevistaBase;
  }

  return {
    ...entrevistaBase,
    ...detalhe,
    candidato: detalhe.candidato ?? entrevistaBase.candidato,
    vaga: detalhe.vaga ?? entrevistaBase.vaga,
    empresa: detalhe.empresa ?? entrevistaBase.empresa,
    recrutador: detalhe.recrutador ?? entrevistaBase.recrutador,
    agenda: detalhe.agenda ?? entrevistaBase.agenda,
    enderecoPresencial:
      detalhe.enderecoPresencial ?? entrevistaBase.enderecoPresencial,
    meta: detalhe.meta ?? entrevistaBase.meta,
  };
}

function SummaryCards({
  total,
  agendadas,
  realizadas,
  canceladas,
}: {
  total: number;
  agendadas: number;
  realizadas: number;
  canceladas: number;
}) {
  const cards = [
    { label: "Total", value: total },
    { label: "Agendadas", value: agendadas },
    { label: "Realizadas", value: realizadas },
    { label: "Canceladas", value: canceladas },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">{card.label}</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

function EntrevistaTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index} className="border-gray-100">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <TableCell key={cellIndex} className="py-4">
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EntrevistaRow({
  entrevista,
  onViewInterview,
  isViewing,
}: {
  entrevista: EntrevistaOverviewItem;
  onViewInterview: (entrevista: EntrevistaOverviewItem) => void;
  isViewing: boolean;
}) {
  const interviewDate = entrevista.agendadaParaFormatada ?? entrevista.agendadaPara ?? "—";
  const hasMeetUrl = Boolean(entrevista.meetUrl);
  const companyDisplayName = buildCompanyDisplayName(entrevista);
  const actionHref = buildInterviewActionHref(entrevista);
  const actionLabel = buildInterviewActionLabel(entrevista);
  const actionIcon = entrevista.modalidade === "ONLINE" ? PlayCircle : MapPin;

  return (
    <TableRow className="border-gray-100 transition-colors hover:bg-gray-50/50">
      <TableCell className="py-4">
        <div className="flex items-start gap-3">
          <AvatarCustom
            name={entrevista.candidato.nome}
            src={entrevista.candidato.avatarUrl ?? undefined}
            size="sm"
            showStatus={false}
          />
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {entrevista.candidato.nome}
              </span>
              {entrevista.candidato.codigo ? (
                <code className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                  {entrevista.candidato.codigo}
                </code>
              ) : null}
            </div>
            <span className="truncate font-mono text-xs text-gray-500">
              {formatCpf(entrevista.candidato.cpf)}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="min-w-0">
          <div className="font-medium text-gray-900">{entrevista.vaga.titulo}</div>
          <div className="mt-1">
            {entrevista.vaga.codigo ? (
              <code className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                {entrevista.vaga.codigo}
              </code>
            ) : (
              <span className="text-xs text-gray-400">Sem código</span>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="min-w-0">
          <div className="font-medium text-gray-900">
            {companyDisplayName || "Empresa não informada"}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarClock className="h-4 w-4 text-gray-400" />
            <span>{interviewDate}</span>
          </div>
          <div className="flex items-center gap-2">
            {entrevista.modalidadeLabel && (
              <Badge
                variant="outline"
                className={cn(
                  "font-medium",
                  buildModalidadeClasses(entrevista.modalidade),
                )}
              >
                {entrevista.modalidadeLabel}
              </Badge>
            )}
            {entrevista.modalidade === "ONLINE" && hasMeetUrl && (
              <a
                href={entrevista.meetUrl || undefined}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary-color)] hover:underline"
              >
                Abrir Meet
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <Badge className={cn("font-medium", buildStatusClasses(entrevista.statusEntrevista))}>
          {entrevista.statusEntrevistaLabel || entrevista.statusEntrevista}
        </Badge>
      </TableCell>

      <TableCell className="py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={() => onViewInterview(entrevista)}
            disabled={isViewing}
            className="!h-8 !px-3 text-gray-700 cursor-pointer"
            aria-label={`Visualizar entrevista de ${entrevista.candidato.nome}`}
          >
            {isViewing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            Visualizar
          </ButtonCustom>

          {actionHref ? (
            <ButtonCustom
              asChild
              variant="primary"
              size="sm"
              className="!h-8 !px-3 !pl-3 !pr-3 cursor-pointer"
            >
              <a
                href={actionHref}
                target="_blank"
                rel="noreferrer"
                aria-label={`${actionLabel} entrevista de ${entrevista.candidato.nome}`}
              >
                {React.createElement(actionIcon, { className: "h-3.5 w-3.5" })}
                {actionLabel}
              </a>
            </ButtonCustom>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function RecruiterEntrevistasDashboard({ className }: { className?: string }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEntrevista, setSelectedEntrevista] = useState<EntrevistaOverviewItem | null>(null);
  const [viewingEntrevistaId, setViewingEntrevistaId] = useState<string | null>(null);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedModalidades, setSelectedModalidades] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(EMPTY_DATE_RANGE);
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedFilters = useMemo(
    () => ({
      page: currentPage,
      pageSize: PAGE_SIZE,
      search: appliedSearchTerm.trim() || undefined,
      statusEntrevista: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      modalidades: selectedModalidades.length > 0 ? selectedModalidades : undefined,
      dataInicio: toRangeStartIso(selectedDateRange.from),
      dataFim: toRangeEndIso(selectedDateRange.to),
      sortBy: "agendadaPara",
      sortDir: "asc" as const,
    }),
    [
      appliedSearchTerm,
      currentPage,
      selectedDateRange.from,
      selectedDateRange.to,
      selectedModalidades,
      selectedStatuses,
    ],
  );

  const entrevistasQuery = useRecruiterEntrevistasDashboardQuery(normalizedFilters);
  const entrevistas = useMemo(
    () => entrevistasQuery.data?.entrevistas ?? [],
    [entrevistasQuery.data?.entrevistas],
  );
  const pagination = entrevistasQuery.data?.pagination ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    total: entrevistas.length,
    totalPages: Math.max(1, Math.ceil(entrevistas.length / PAGE_SIZE)),
  };
  const summary = entrevistasQuery.data?.summary;
  const filtrosDisponiveis = entrevistasQuery.data?.filtrosDisponiveis;
  const capabilities = entrevistasQuery.data?.capabilities;
  const canCreate = capabilities?.canCreate ?? false;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, selectedModalidades, selectedDateRange.from, selectedDateRange.to]);

  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(Math.max(1, pagination.totalPages));
    }
  }, [currentPage, pagination.totalPages]);

  const statusOptions = useMemo<SelectOption[]>(() => {
    if (filtrosDisponiveis?.statusEntrevista?.length) {
      return filtrosDisponiveis.statusEntrevista.map((status) => ({
        value: status.value,
        label: status.label,
      }));
    }

    return FALLBACK_STATUS_OPTIONS;
  }, [filtrosDisponiveis?.statusEntrevista]);

  const modalidadeOptions = useMemo<SelectOption[]>(() => {
    if (filtrosDisponiveis?.modalidades?.length) {
      return filtrosDisponiveis.modalidades.map((modalidade) => ({
        value: modalidade.value,
        label: modalidade.label,
      }));
    }

    return FALLBACK_MODALIDADE_OPTIONS;
  }, [filtrosDisponiveis?.modalidades]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "statusEntrevista",
        label: "Status",
        mode: "multiple",
        options: statusOptions,
        placeholder: "Selecionar status",
      },
      {
        key: "modalidades",
        label: "Modalidade",
        mode: "multiple",
        options: modalidadeOptions,
        placeholder: "Selecionar modalidade",
      },
      {
        key: "periodo",
        label: "Período da entrevista",
        type: "date-range",
        placeholder: "Selecionar período",
        clearable: true,
        maxDate: MAX_INTERVIEW_FILTER_DATE,
      },
    ],
    [modalidadeOptions, statusOptions],
  );

  const filterValues = useMemo(
    () => ({
      statusEntrevista: selectedStatuses,
      modalidades: selectedModalidades,
      periodo: selectedDateRange,
    }),
    [selectedDateRange, selectedModalidades, selectedStatuses],
  );

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm],
  );

  const handleSearchSubmit = (rawValue?: string) => {
    const value = rawValue ?? pendingSearchTerm;
    const validationMessage = getSearchValidationMessage(value);
    if (validationMessage) return;
    setPendingSearchTerm(value);
    setAppliedSearchTerm(value.trim());
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setPendingSearchTerm("");
    setAppliedSearchTerm("");
    setSelectedStatuses([]);
    setSelectedModalidades([]);
    setSelectedDateRange(EMPTY_DATE_RANGE);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
  };

  const handleViewInterview = async (entrevistaBase: EntrevistaOverviewItem) => {
    setViewingEntrevistaId(entrevistaBase.id);

    try {
      const response = await getRecrutadorEntrevistaById(entrevistaBase.id);
      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar a entrevista.");
      }

      setSelectedEntrevista(mergeInterviewDetails(entrevistaBase, response));
    } catch (viewError) {
      toastCustom.error({
        title: "Erro ao carregar entrevista",
        description:
          viewError instanceof Error
            ? viewError.message
            : "Não foi possível carregar os detalhes da entrevista.",
      });
    } finally {
      setViewingEntrevistaId(null);
    }
  };

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (pagination.totalPages <= 5) {
      for (let i = 1; i <= pagination.totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, pagination.page - 2);
    const end = Math.min(pagination.totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [pagination.page, pagination.totalPages]);

  const errorMessage = entrevistasQuery.error?.message || null;
  const showEmptyState =
    !entrevistasQuery.isLoading &&
    !entrevistasQuery.isFetching &&
    entrevistas.length === 0;

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      <AddEntrevistaRecrutadorModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        capabilities={capabilities}
      />
      <EntrevistaModalView
        entrevista={selectedEntrevista}
        isOpen={Boolean(selectedEntrevista)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntrevista(null);
          }
        }}
      />

      {canCreate && (
        <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
          <ButtonCustom
            variant="primary"
            size="md"
            icon="Plus"
            fullWidth
            className="sm:w-auto"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Marcar entrevista
          </ButtonCustom>
        </div>
      )}

      {summary && (
        <SummaryCards
          total={summary.totalEntrevistas}
          agendadas={summary.agendadas}
          realizadas={summary.realizadas}
          canceladas={summary.canceladas}
        />
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar entrevistas: {errorMessage}</AlertDescription>
        </Alert>
      )}

      <FilterBar
        className="w-full lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_auto]"
        fields={filterFields}
        values={filterValues}
        onChange={(key, value) => {
          if (key === "statusEntrevista") {
            setSelectedStatuses(Array.isArray(value) ? value : []);
            return;
          }
          if (key === "modalidades") {
            setSelectedModalidades(Array.isArray(value) ? value : []);
            return;
          }
          if (key === "periodo") {
            setSelectedDateRange((value as DateRange) ?? EMPTY_DATE_RANGE);
          }
        }}
        onClearAll={handleClearAll}
        search={{
          label: "Pesquisar entrevista",
          value: pendingSearchTerm,
          onChange: setPendingSearchTerm,
          placeholder: "Buscar por candidato, vaga, empresa ou recrutador...",
          onKeyDown: (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearchSubmit((event.target as HTMLInputElement).value);
            }
          },
          error: searchValidationMessage,
          helperText: "Pesquise por nome do candidato, vaga, empresa ou recrutador.",
          helperPlacement: "tooltip",
        }}
        rightActions={
          <ButtonCustom
            variant="primary"
            size="lg"
            onClick={() => handleSearchSubmit()}
            disabled={entrevistasQuery.isFetching || Boolean(searchValidationMessage)}
            fullWidth
            className="md:w-full xl:w-auto"
          >
            Pesquisar
          </ButtonCustom>
        }
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {showEmptyState ? (
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="userProfiles"
            illustrationAlt="Ilustração de entrevistas"
            title="Nenhuma entrevista encontrada"
            description="Não encontramos entrevistas dentro do escopo atual do recrutador."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-[1080px]">
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50/50">
                    <TableHead className="py-4 font-medium text-gray-700">Candidato</TableHead>
                    <TableHead className="py-4 font-medium text-gray-700">Vaga</TableHead>
                    <TableHead className="py-4 font-medium text-gray-700">Empresa</TableHead>
                    <TableHead className="py-4 font-medium text-gray-700">Entrevista</TableHead>
                    <TableHead className="py-4 font-medium text-gray-700">Status</TableHead>
                    <TableHead className="py-4 text-right font-medium text-gray-700">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entrevistasQuery.isLoading || entrevistasQuery.isFetching ? (
                    <EntrevistaTableSkeleton />
                  ) : (
                    entrevistas.map((entrevista) => (
                      <EntrevistaRow
                        key={entrevista.id}
                        entrevista={entrevista}
                        onViewInterview={(item) => void handleViewInterview(item)}
                        isViewing={viewingEntrevistaId === entrevista.id}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                {pagination.total === 0
                  ? "Nenhuma entrevista listada"
                  : `Mostrando ${Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} a ${Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total,
                    )} de ${pagination.total} entrevista${pagination.total === 1 ? "" : "s"}`}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || entrevistasQuery.isFetching}
                    className="h-8 px-3"
                  >
                    Anterior
                  </ButtonCustom>

                  {visiblePages.map((page) => (
                    <ButtonCustom
                      key={page}
                      variant={pagination.page === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="h-8 w-8 p-0"
                      disabled={entrevistasQuery.isFetching}
                    >
                      {page}
                    </ButtonCustom>
                  ))}

                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || entrevistasQuery.isFetching}
                    className="h-8 px-3"
                  >
                    Próxima
                  </ButtonCustom>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
