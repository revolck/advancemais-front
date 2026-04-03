"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";

import { listRecrutadorVagas } from "@/api/recrutador";
import type {
  ListRecrutadorVagasParams,
  RecrutadorVagaResumo,
  RecrutadorVagasResponse,
} from "@/api/recrutador";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import type { FilterField } from "@/components/ui/custom/filters";
import type { SelectOption } from "@/components/ui/custom/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../../admin/shared/filterUtils";

const PAGE_SIZE = 10;

const FALLBACK_STATUS_OPTIONS: SelectOption[] = [
  { value: "PUBLICADO", label: "Publicada" },
  { value: "EM_ANALISE", label: "Em análise" },
  { value: "PAUSADA", label: "Pausada" },
  { value: "ENCERRADA", label: "Encerrada" },
  { value: "EXPIRADO", label: "Expirada" },
  { value: "DESPUBLICADA", label: "Despublicada" },
];

type SortField = "titulo" | "inseridaEm" | null;
type SortDirection = "asc" | "desc";

function getStatusClasses(status?: string | null): string {
  switch (String(status || "").toUpperCase()) {
    case "PUBLICADO":
      return "bg-green-100 text-green-800 border-green-200";
    case "EM_ANALISE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "DESPUBLICADA":
      return "bg-red-100 text-red-800 border-red-200";
    case "PAUSADA":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "ENCERRADA":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "EXPIRADO":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusLabel(vaga: RecrutadorVagaResumo): string {
  if (vaga.statusLabel) return vaga.statusLabel;

  switch (String(vaga.status || "").toUpperCase()) {
    case "PUBLICADO":
      return "Publicada";
    case "EM_ANALISE":
      return "Em análise";
    case "DESPUBLICADA":
      return "Despublicada";
    case "PAUSADA":
      return "Pausada";
    case "ENCERRADA":
      return "Encerrada";
    case "EXPIRADO":
      return "Expirada";
    default:
      return vaga.status || "Sem status";
  }
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCnpj(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8,
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function buildCompanyName(vaga: RecrutadorVagaResumo): string {
  return (
    vaga.empresa?.nomeExibicao ||
    vaga.empresa?.nome ||
    "Empresa indisponível"
  );
}

function buildCompanyCode(vaga: RecrutadorVagaResumo): string | null {
  return vaga.empresa?.codUsuario || null;
}

function buildLocationLabel(vaga: RecrutadorVagaResumo): string {
  if (vaga.localizacao?.label?.trim()) return vaga.localizacao.label;

  const cidade = vaga.localizacao?.cidade?.trim();
  const estado = vaga.localizacao?.estado?.trim();

  if (cidade || estado) {
    return [cidade || "—", estado || "—"].join(", ");
  }

  return "—, —";
}

function buildModalidadeLabel(vaga: RecrutadorVagaResumo): string {
  return vaga.localizacao?.modalidadeLabel?.trim() || "—";
}

function VagasTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead className="font-medium text-gray-700 py-4 min-w-[220px]">
                Vaga
              </TableHead>
              <TableHead className="font-medium text-gray-700 min-w-[220px]">
                Empresa
              </TableHead>
              <TableHead className="font-medium text-gray-700 min-w-[150px]">
                Localização
              </TableHead>
              <TableHead className="font-medium text-gray-700 min-w-[100px]">
                Status
              </TableHead>
              <TableHead className="font-medium text-gray-700 min-w-[120px]">
                Publicada em
              </TableHead>
              <TableHead className="font-medium text-gray-700 min-w-[120px]">
                Inscrições até
              </TableHead>
              <TableHead className="font-medium text-gray-700 min-w-[100px]">
                Nº de vagas
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <TableRow key={index} className="border-gray-100">
                {Array.from({ length: 8 }).map((__, cellIndex) => (
                  <TableCell key={cellIndex} className="py-4">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RecruiterVagaRow({
  vaga,
  isDisabled,
  onNavigateStart,
}: {
  vaga: RecrutadorVagaResumo;
  isDisabled?: boolean;
  onNavigateStart?: () => void;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const isRowDisabled = Boolean(isDisabled || isNavigating);

  const companyName = buildCompanyName(vaga);
  const companyCode = buildCompanyCode(vaga);
  const locationLabel = buildLocationLabel(vaga);
  const modalidadeLabel = buildModalidadeLabel(vaga);

  return (
    <TableRow
      className={cn(
        "border-gray-100 transition-colors",
        isRowDisabled ? "opacity-50 pointer-events-none" : "hover:bg-gray-50/50",
      )}
    >
      <TableCell className="py-4 min-w-[220px]">
        <div className="flex items-center gap-3">
          <div className="font-medium text-gray-900">{vaga.titulo}</div>
          {vaga.codigo ? (
            <Badge
              variant="outline"
              className="text-xs font-mono bg-gray-50 text-gray-600 border-gray-200 flex-shrink-0"
            >
              {vaga.codigo}
            </Badge>
          ) : null}
        </div>
      </TableCell>

      <TableCell className="py-4 min-w-[220px] max-w-[260px]">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 cursor-help">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={vaga.empresa?.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-xs font-medium">
                  {companyName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {companyName}
                  </div>
                  {companyCode ? (
                    <code className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                      {companyCode}
                    </code>
                  ) : null}
                </div>
                {vaga.empresa?.cnpj ? (
                  <div className="truncate font-mono text-xs text-gray-500">
                    {formatCnpj(vaga.empresa.cnpj)}
                  </div>
                ) : null}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 p-1">
              <p className="mb-1! font-medium! text-white! text-xs!">
                {companyName}
              </p>
              {companyCode ? (
                <p className="mb-0! font-mono! text-[11px]! text-slate-300!">
                  {companyCode}
                </p>
              ) : null}
            </div>
          </TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell className="py-4 min-w-[150px]">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
          <div className="flex flex-col">
            <div className="text-sm text-gray-900">{locationLabel}</div>
            <div className="text-sm text-gray-500">{modalidadeLabel}</div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 min-w-[100px]">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", getStatusClasses(vaga.status))}
        >
          {getStatusLabel(vaga)}
        </Badge>
      </TableCell>

      <TableCell className="py-4 min-w-[120px]">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{formatDate(vaga.inseridaEm || vaga.criadoEm)}</span>
        </div>
      </TableCell>

      <TableCell className="py-4 min-w-[120px]">
        {vaga.inscricoesAte ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span>{formatDate(vaga.inscricoesAte)}</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-500">—</div>
        )}
      </TableCell>

      <TableCell className="py-4 min-w-[100px]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
            <span className="text-xs font-medium text-blue-600">
              {vaga.numeroVagas ?? "?"}
            </span>
          </div>
          <span className="text-sm text-gray-900">
            {typeof vaga.numeroVagas === "number"
              ? `vaga${vaga.numeroVagas > 1 ? "s" : ""}`
              : "—"}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-4 w-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              size="icon"
              disabled={isRowDisabled}
              className={cn(
                "h-8 w-8 rounded-full cursor-pointer",
                isNavigating
                  ? "text-blue-600 bg-blue-100"
                  : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
              )}
            >
              <Link
                href={`/dashboard/empresas/vagas/${encodeURIComponent(vaga.id)}`}
                onClick={() => {
                  setIsNavigating(true);
                  onNavigateStart?.();
                }}
                aria-label="Visualizar vaga"
              >
                {isNavigating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar vaga"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export function RecruiterVagasDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["PUBLICADO"]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const normalizedFilters = useMemo<ListRecrutadorVagasParams>(
    () => ({
      page: currentPage,
      pageSize: PAGE_SIZE,
      search: getNormalizedSearchOrUndefined(
        appliedSearchTerm,
        DEFAULT_SEARCH_MIN_LENGTH,
      ),
      empresaUsuarioId: selectedCompanies[0] || undefined,
      localizacao: selectedLocations[0] || undefined,
      status: selectedStatuses.length ? selectedStatuses : undefined,
      sortBy: sortField ?? undefined,
      sortDir: sortField ? sortDirection : undefined,
    }),
    [
      appliedSearchTerm,
      currentPage,
      selectedCompanies,
      selectedLocations,
      selectedStatuses,
      sortDirection,
      sortField,
    ],
  );

  const vagasQuery = useQuery<
    {
      vagas: RecrutadorVagaResumo[];
      pagination: NonNullable<RecrutadorVagasResponse["pagination"]>;
      filtrosDisponiveis: NonNullable<RecrutadorVagasResponse["filtrosDisponiveis"]>;
    },
    Error
  >({
    queryKey: ["recrutador-vagas-list", normalizedFilters],
    queryFn: async () => {
      const response = await listRecrutadorVagas(normalizedFilters);

      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar as vagas.");
      }

      return {
        vagas: response.data ?? [],
        pagination: {
          page: response.pagination?.page ?? currentPage,
          pageSize: response.pagination?.pageSize ?? PAGE_SIZE,
          total: response.pagination?.total ?? (response.data?.length ?? 0),
          totalPages: response.pagination?.totalPages ?? 1,
        },
        filtrosDisponiveis: response.filtrosDisponiveis ?? {
          status: [],
          empresas: [],
          localizacoes: [],
        },
      };
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, selectedCompanies, selectedLocations]);

  useEffect(() => {
    if (currentPage > (vagasQuery.data?.pagination.totalPages ?? 1)) {
      setCurrentPage(Math.max(1, vagasQuery.data?.pagination.totalPages ?? 1));
    }
  }, [currentPage, vagasQuery.data?.pagination.totalPages]);

  const vagas = vagasQuery.data?.vagas ?? [];
  const pagination = vagasQuery.data?.pagination ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    total: vagas.length,
    totalPages: 1,
  };
  const filtrosDisponiveis = vagasQuery.data?.filtrosDisponiveis;

  const statusOptions = useMemo<SelectOption[]>(
    () =>
      filtrosDisponiveis?.status?.length
        ? filtrosDisponiveis.status.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        : FALLBACK_STATUS_OPTIONS,
    [filtrosDisponiveis?.status],
  );

  const companyOptions = useMemo<SelectOption[]>(
    () =>
      (filtrosDisponiveis?.empresas ?? []).map((item) => ({
        value: item.id,
        label: item.label,
      })),
    [filtrosDisponiveis?.empresas],
  );

  const locationOptions = useMemo<SelectOption[]>(
    () =>
      (filtrosDisponiveis?.localizacoes ?? []).map((item) => ({
        value: item.value,
        label: item.label,
      })),
    [filtrosDisponiveis?.localizacoes],
  );

  useEffect(() => {
    if (selectedCompanies.length > 0) {
      const allowed = new Set(companyOptions.map((opt) => opt.value));
      if (!allowed.has(selectedCompanies[0])) {
        setSelectedCompanies([]);
      }
    }
  }, [companyOptions, selectedCompanies]);

  useEffect(() => {
    if (selectedLocations.length > 0) {
      const allowed = new Set(locationOptions.map((opt) => opt.value));
      if (!allowed.has(selectedLocations[0])) {
        setSelectedLocations([]);
      }
    }
  }, [locationOptions, selectedLocations]);

  useEffect(() => {
    if (selectedStatuses.length > 0) {
      const allowed = new Set(statusOptions.map((opt) => opt.value));
      const filtered = selectedStatuses.filter((item) => allowed.has(item));
      if (filtered.length !== selectedStatuses.length) {
        setSelectedStatuses(filtered);
      }
    }
  }, [selectedStatuses, statusOptions]);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm],
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        mode: "multiple",
        options: statusOptions,
        placeholder: "Selecione status",
      },
      {
        key: "empresa",
        label: "Empresa",
        mode: "multiple",
        options: companyOptions,
        placeholder: "Selecione empresa",
      },
      {
        key: "localizacao",
        label: "Localização",
        mode: "multiple",
        options: locationOptions,
        placeholder: "Selecione localização",
      },
    ],
    [companyOptions, locationOptions, statusOptions],
  );

  const filterValues = useMemo(
    () => ({
      status: selectedStatuses,
      empresa: selectedCompanies,
      localizacao: selectedLocations,
    }),
    [selectedCompanies, selectedLocations, selectedStatuses],
  );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const totalPages = pagination.totalPages;
    const page = pagination.page;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [pagination.page, pagination.totalPages]);

  const errorMessage = vagasQuery.error?.message || null;
  const isLoading =
    vagasQuery.status === "pending" || (vagasQuery.isLoading && vagas.length === 0);
  const isFetching = vagasQuery.isFetching;
  const showEmptyState = !isLoading && !isFetching && !errorMessage && vagas.length === 0;

  const handleSearchSubmit = (rawValue?: string) => {
    const value = rawValue ?? pendingSearchTerm;
    const validationMessage = getSearchValidationMessage(
      value,
      DEFAULT_SEARCH_MIN_LENGTH,
    );
    if (validationMessage) return;

    setPendingSearchTerm(value);
    setAppliedSearchTerm(value.trim());
    setCurrentPage(1);
  };

  const setSort = (field: Exclude<SortField, null>, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const toggleSort = (field: Exclude<SortField, null>) => {
    setSortField((prev) => {
      if (prev !== field) {
        setSortDirection("asc");
        setCurrentPage(1);
        return field;
      }

      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      setCurrentPage(1);
      return field;
    });
  };

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, Math.max(1, pagination.totalPages)));
    setCurrentPage(nextPage);
  };

  return (
    <div className="min-h-full space-y-6">
      <div className="border-b border-gray-200">
        <FilterBar
          fields={filterFields}
          values={filterValues}
          onChange={(key, value) => {
            if (key === "status") {
              setSelectedStatuses(Array.isArray(value) ? (value as string[]) : []);
            }
            if (key === "empresa") {
              setSelectedCompanies(Array.isArray(value) ? (value as string[]) : []);
            }
            if (key === "localizacao") {
              setSelectedLocations(Array.isArray(value) ? (value as string[]) : []);
            }
          }}
          onClearAll={() => {
            setPendingSearchTerm("");
            setAppliedSearchTerm("");
            setSelectedStatuses(["PUBLICADO"]);
            setSelectedCompanies([]);
            setSelectedLocations([]);
            setCurrentPage(1);
            setSortField(null);
            setSortDirection("asc");
          }}
          search={{
            label: "Pesquisar vaga",
            value: pendingSearchTerm,
            onChange: setPendingSearchTerm,
            placeholder: "Título ou código da vaga",
            helperText: "Pesquise por título da vaga ou código da vaga.",
            helperPlacement: "tooltip",
            error: searchValidationMessage,
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearchSubmit(event.currentTarget.value);
              }
            },
          }}
          rightActions={
            <ButtonCustom
              variant="primary"
              size="lg"
              onClick={() => handleSearchSubmit()}
              disabled={Boolean(searchValidationMessage)}
            >
              Pesquisar
            </ButtonCustom>
          }
        />
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center justify-between">
            <span>{errorMessage}</span>
            <ButtonCustom
              size="sm"
              variant="ghost"
              onClick={() => vagasQuery.refetch()}
            >
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <VagasTableSkeleton />
      ) : showEmptyState ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="fileNotFound"
            illustrationAlt="Nenhuma vaga encontrada"
            title="Nenhuma vaga encontrada"
            description="Não encontramos vagas dentro do escopo atual do recrutador."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4 min-w-[220px]">
                    <div className="flex items-center gap-1">
                      <span>Vaga</span>
                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar A para Z"
                              onClick={() => setSort("titulo", "asc")}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "titulo" && sortDirection === "asc"
                                    ? "text-[var(--primary-color)]"
                                    : undefined,
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>A → Z</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar Z para A"
                              onClick={() => setSort("titulo", "desc")}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "titulo" && sortDirection === "desc"
                                    ? "text-[var(--primary-color)]"
                                    : undefined,
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Z → A</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 min-w-[220px]">
                    Empresa
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 min-w-[150px]">
                    Localização
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 min-w-[100px]">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 min-w-[120px]">
                    <div className="flex items-center gap-1">
                      <span>Publicada em</span>
                      <button
                        type="button"
                        className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                        onClick={() => toggleSort("inseridaEm")}
                        aria-label="Ordenar por data"
                      >
                        {sortField === "inseridaEm" && sortDirection === "desc" ? (
                          <ChevronDown className="h-3 w-3 text-[var(--primary-color)]" />
                        ) : (
                          <ChevronUp className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 min-w-[120px]">
                    Inscrições até
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 min-w-[100px]">
                    Nº de vagas
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {vagas.map((vaga) => (
                  <RecruiterVagaRow
                    key={vaga.id}
                    vaga={vaga}
                    isDisabled={Boolean(navigatingId)}
                    onNavigateStart={() => setNavigatingId(vaga.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination.total > 0 ? (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} a{" "}
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
                </span>
              </div>

              {pagination.totalPages > 1 ? (
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
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
                    >
                      {page}
                    </ButtonCustom>
                  ))}

                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="h-8 px-3"
                  >
                    Próxima
                  </ButtonCustom>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default RecruiterVagasDashboard;
