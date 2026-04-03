"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";

import { listRecrutadorCandidatos } from "@/api/recrutador";
import type { RecrutadorCandidatoResumo } from "@/api/recrutador";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarCustom, ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import type { DateRange } from "@/components/ui/custom/date-picker";
import type { FilterField } from "@/components/ui/custom/filters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;
const FETCH_PAGE_SIZE = 100;

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

function formatDate(value?: string | null): string {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

function formatLocalizacao(candidato: Pick<RecrutadorCandidatoResumo, "cidade" | "estado">): string {
  return [candidato.cidade, candidato.estado].filter(Boolean).join(", ") || "Não informado";
}

function formatCandidaturasCount(total: number): string {
  return `${total} candidatura${total === 1 ? "" : "s"}`;
}

function CandidateTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50/50">
            <TableHead className="py-4 min-w-[280px]">Candidato</TableHead>
            <TableHead className="min-w-[220px]">Contato</TableHead>
            <TableHead className="min-w-[160px]">Localização</TableHead>
            <TableHead className="min-w-[150px]">Candidaturas</TableHead>
            <TableHead className="min-w-[160px]">Última atividade</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <TableRow key={index} className="border-gray-100">
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

async function fetchAllRecrutadorCandidatos(params: {
  search?: string;
  criadoDe?: string;
  criadoAte?: string;
}): Promise<RecrutadorCandidatoResumo[]> {
  const firstResponse = await listRecrutadorCandidatos({
    ...params,
    page: 1,
    pageSize: FETCH_PAGE_SIZE,
  });

  if (!firstResponse.success) {
    throw new Error(firstResponse.message || "Não foi possível carregar os candidatos.");
  }

  const firstPageItems = firstResponse.data ?? [];
  const totalPages = Math.max(1, firstResponse.pagination?.totalPages ?? 1);

  if (totalPages === 1) {
    return firstPageItems;
  }

  const remainingResponses = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      listRecrutadorCandidatos({
        ...params,
        page: index + 2,
        pageSize: FETCH_PAGE_SIZE,
      })
    )
  );

  const remainingItems = remainingResponses.flatMap((response) => {
    if (!response.success) {
      throw new Error(response.message || "Não foi possível carregar os candidatos.");
    }
    return response.data ?? [];
  });

  return [...firstPageItems, ...remainingItems];
}

export function RecruiterCandidatosDashboard() {
  const router = useRouter();
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery<
    RecrutadorCandidatoResumo[],
    Error
  >({
    queryKey: [
      "recrutador-candidatos-list",
      appliedSearchTerm,
      appliedDateRange.from?.toISOString() ?? null,
      appliedDateRange.to?.toISOString() ?? null,
    ],
    queryFn: async () =>
      fetchAllRecrutadorCandidatos({
        search: appliedSearchTerm || undefined,
        criadoDe: appliedDateRange.from
          ? new Date(
              appliedDateRange.from.getFullYear(),
              appliedDateRange.from.getMonth(),
              appliedDateRange.from.getDate(),
              0,
              0,
              0,
              0
            ).toISOString()
          : undefined,
        criadoAte: appliedDateRange.to
          ? new Date(
              appliedDateRange.to.getFullYear(),
              appliedDateRange.to.getMonth(),
              appliedDateRange.to.getDate(),
              23,
              59,
              59,
              999
            ).toISOString()
          : undefined,
      }),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(
      new Set((data ?? []).map((candidato) => formatLocalizacao(candidato)))
    ).filter((location) => location !== "Não informado");

    return uniqueLocations
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((location) => ({
        value: location,
        label: location,
      }));
  }, [data]);

  useEffect(() => {
    setSelectedLocations((current) =>
      current.filter((location) =>
        locationOptions.some((option) => option.value === location)
      )
    );
  }, [locationOptions]);

  const filteredCandidates = useMemo(() => {
    const base = data ?? [];

    return base.filter((candidato) => {
      if (selectedLocations.length === 0) return true;
      return selectedLocations.includes(formatLocalizacao(candidato));
    });
  }, [data, selectedLocations]);

  const sortedCandidates = useMemo(() => {
    if (!sortDirection) return filteredCandidates;

    return [...filteredCandidates].sort((a, b) => {
      const nameA = a.nomeCompleto.trim();
      const nameB = b.nomeCompleto.trim();
      const comparison = nameA.localeCompare(nameB, "pt-BR", {
        sensitivity: "base",
      });

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredCandidates, sortDirection]);

  const totalItems = sortedCandidates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCandidates = sortedCandidates.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let page = adjustedStart; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [safePage, totalPages]);

  const filterFields: FilterField[] = [
    {
      key: "location",
      mode: "multiple",
      label: "Localização",
      placeholder: "Selecionar localização",
      options: locationOptions,
    },
    {
      key: "dateRange",
      label: "Data de cadastro",
      type: "date-range",
      placeholder: "Selecionar período",
    },
  ];

  const handleSearchSubmit = (value?: string) => {
    setAppliedSearchTerm((value ?? pendingSearchTerm).trim());
    setCurrentPage(1);
  };

  const handleNavigate = (candidateId: string) => {
    setNavigatingId(candidateId);
    router.push(
      `/dashboard/empresas/candidatos/${encodeURIComponent(candidateId)}`
    );
  };

  const toggleSort = () => {
    setSortDirection((current) => {
      if (current === "asc") return "desc";
      if (current === "desc") return "asc";
      return "asc";
    });
    setCurrentPage(1);
  };

  const setSort = (direction: "asc" | "desc") => {
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="min-h-full">
      <div className="border-b border-gray-200">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={{
              location: selectedLocations,
              dateRange: pendingDateRange,
            }}
            onChange={(key, value) => {
              if (key === "location") {
                setSelectedLocations(Array.isArray(value) ? (value as string[]) : []);
                setCurrentPage(1);
              }

              if (key === "dateRange") {
                const range = value as DateRange;
                setPendingDateRange(range);
                setAppliedDateRange(range);
                setCurrentPage(1);
              }
            }}
            showActiveChips={false}
            gridClassName="lg:grid-cols-[minmax(0,3fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_auto]"
            search={{
              label: "Pesquisar candidato",
              value: pendingSearchTerm,
              onChange: setPendingSearchTerm,
              placeholder: "Buscar nome, email, CPF ou código...",
              onKeyDown: (event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearchSubmit((event.target as HTMLInputElement).value);
                }
              },
            }}
            rightActions={
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={() => handleSearchSubmit()}
                fullWidth
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />

          {error && (
            <div className="mt-3 flex items-center gap-2 px-1 text-sm text-red-600">
              <span>{error.message || "Erro ao carregar candidatos."}</span>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-medium text-[var(--primary-color)]"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="py-6">
        {isLoading ? (
          <CandidateTableSkeleton />
        ) : totalItems === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <EmptyState
              fullHeight
              maxContentWidth="sm"
              illustration="userProfiles"
              illustrationAlt="Nenhum candidato encontrado"
              title="Nenhum candidato encontrado"
              description="Não encontramos candidatos dentro do escopo atual do recrutador."
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead
                    className="py-4 min-w-[280px]"
                    aria-sort={
                      sortDirection
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={toggleSort}
                        className={cn(
                          "inline-flex items-center gap-1 bg-transparent px-2 py-1 transition-colors cursor-pointer",
                          sortDirection && "text-gray-900"
                        )}
                      >
                        Candidato
                      </button>

                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <button
                          type="button"
                          className="rounded bg-transparent p-0.5 cursor-pointer hover:bg-transparent"
                          aria-label="Ordenar A → Z"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSort("asc");
                          }}
                        >
                          <ChevronUp
                            className={cn(
                              "h-3 w-3 text-gray-400",
                              sortDirection === "asc" &&
                                "text-[var(--primary-color)]"
                            )}
                          />
                        </button>
                        <button
                          type="button"
                          className="rounded bg-transparent p-0.5 cursor-pointer hover:bg-transparent"
                          aria-label="Ordenar Z → A"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSort("desc");
                          }}
                        >
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 -mt-0.5 text-gray-400",
                              sortDirection === "desc" &&
                                "text-[var(--primary-color)]"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[220px]">Contato</TableHead>
                  <TableHead className="min-w-[160px]">Localização</TableHead>
                  <TableHead className="min-w-[150px]">Candidaturas</TableHead>
                  <TableHead className="min-w-[160px]">Última atividade</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCandidates.map((candidato) => {
                  const isNavigating = navigatingId === candidato.id;
                  const totalCandidaturas = candidato.candidaturasResumo?.total ?? 0;
                  const lastActivity = candidato.atualizadoEm || candidato.criadoEm;

                  return (
                    <TableRow
                      key={candidato.id}
                      className={cn(
                        "border-gray-100 transition-colors",
                        isNavigating ? "bg-blue-50/50" : "hover:bg-gray-50/50"
                      )}
                    >
                      <TableCell className="py-4 min-w-[280px] max-w-[320px]">
                        <div className="flex items-center gap-3">
                          <AvatarCustom
                            name={candidato.nomeCompleto}
                            src={candidato.avatarUrl || undefined}
                            size="sm"
                            showStatus={false}
                          />
                          <div className="min-w-0 flex flex-1 flex-col">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-gray-900">
                                {candidato.nomeCompleto}
                              </span>
                              <span className="inline-flex flex-shrink-0 items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {candidato.codUsuario}
                              </span>
                            </div>
                            <div className="truncate font-mono text-sm text-gray-500">
                              {formatCpf(candidato.cpf)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        <div className="flex flex-col gap-[6px]">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{candidato.email || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{formatTelefone(candidato.telefone)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        {formatLocalizacao(candidato)}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-100 px-2 text-xs font-medium text-blue-600">
                            {totalCandidaturas}
                          </span>
                          <span>{formatCandidaturasCount(totalCandidaturas)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        {formatDate(lastActivity)}
                      </TableCell>
                      <TableCell className="py-4 w-12">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleNavigate(candidato.id)}
                          disabled={Boolean(navigatingId)}
                          className={cn(
                            "h-8 w-8 rounded-full cursor-pointer",
                            isNavigating
                              ? "bg-blue-100 text-blue-600"
                              : "text-gray-500 hover:bg-[var(--primary-color)] hover:text-white"
                          )}
                          aria-label="Visualizar candidato"
                        >
                          {isNavigating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, totalItems)} a{" "}
                {Math.min(safePage * ITEMS_PER_PAGE, totalItems)} de {totalItems} candidatos
                {isFetching && !isLoading ? " · Atualizando..." : ""}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(safePage - 1)}
                    disabled={safePage === 1}
                  >
                    Anterior
                  </Button>

                  {visiblePages.map((page) => (
                    <Button
                      key={page}
                      type="button"
                      variant={page === safePage ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(safePage + 1)}
                    disabled={safePage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
