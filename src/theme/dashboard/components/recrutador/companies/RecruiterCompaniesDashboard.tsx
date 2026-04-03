"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, ChevronUp, Loader2 } from "lucide-react";

import { getRecrutadorEmpresas } from "@/api/recrutador";
import type { RecrutadorEmpresa } from "@/api/recrutador";
import { AvatarCustom, ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import type { FilterField } from "@/components/ui/custom/filters";
import { Badge } from "@/components/ui/badge";
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

const ITEMS_PER_PAGE = 10;

function getCompanyLocationLabel(company: RecrutadorEmpresa): string {
  return [company.cidade, company.estado].filter(Boolean).join("/") || "—";
}

function formatCnpj(value?: string | null): string | null {
  if (!value) return null;

  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length !== 14) return value;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatPhone(value?: string | null): string {
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

function getCompanyStatusClasses(status?: string | null): string {
  switch (String(status || "").toUpperCase()) {
    case "ATIVO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "INATIVO":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "BLOQUEADO":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getCompanyStatusLabel(status?: string | null): string {
  switch (String(status || "").toUpperCase()) {
    case "ATIVO":
      return "Ativa";
    case "INATIVO":
      return "Inativa";
    case "BLOQUEADO":
      return "Bloqueada";
    default:
      return status || "Sem status";
  }
}

function CompanyTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50/50">
            <TableHead className="py-4">Empresa</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Status</TableHead>
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
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-44" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
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

export function RecruiterCompaniesDashboard() {
  const router = useRouter();
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery<
    RecrutadorEmpresa[],
    Error
  >({
    queryKey: ["recrutador-empresas-list"],
    queryFn: async () => {
      const response = await getRecrutadorEmpresas();
      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar as empresas.");
      }
      return response.data ?? [];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const filteredCompanies = useMemo(() => {
    const term = appliedSearchTerm.trim().toLowerCase();
    const companies = data ?? [];
    if (!term && selectedLocations.length === 0) return companies;

    const numericTerm = term.replace(/\D/g, "");

    return companies.filter((company) => {
      const name = String(company.nomeExibicao || company.nome || "").toLowerCase();
      const code = String(company.codUsuario || "").toLowerCase();
      const cnpj = String(company.cnpj || "");
      const normalizedCnpj = cnpj.replace(/\D/g, "");
      const locationLabel = getCompanyLocationLabel(company);

      const matchesSearch =
        !term ||
        name.includes(term) ||
        code.includes(term) ||
        cnpj.toLowerCase().includes(term) ||
        (numericTerm.length > 0 && normalizedCnpj.includes(numericTerm));

      const matchesLocation =
        selectedLocations.length === 0 || selectedLocations.includes(locationLabel);

      return matchesSearch && matchesLocation;
    });
  }, [appliedSearchTerm, data, selectedLocations]);

  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(
      new Set((data ?? []).map((company) => getCompanyLocationLabel(company)))
    ).filter((location) => location !== "—");

    return uniqueLocations
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((location) => ({
        value: location,
        label: location,
      }));
  }, [data]);

  const sortedCompanies = useMemo(() => {
    if (!sortDirection) return filteredCompanies;

    return [...filteredCompanies].sort((a, b) => {
      const nameA = String(a.nomeExibicao || a.nome || "").trim();
      const nameB = String(b.nomeExibicao || b.nome || "").trim();
      const comparison = nameA.localeCompare(nameB, "pt-BR", {
        sensitivity: "base",
      });

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredCompanies, sortDirection]);

  const totalItems = sortedCompanies.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCompanies = sortedCompanies.slice(
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

  const handleNavigate = (companyId: string) => {
    setNavigatingId(companyId);
    router.push(`/dashboard/empresas/${encodeURIComponent(companyId)}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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

  const handleSearchSubmit = (value?: string) => {
    setAppliedSearchTerm((value ?? pendingSearchTerm).trim());
    setCurrentPage(1);
  };

  const hasData = totalItems > 0;
  const filterFields: FilterField[] = [
    {
      key: "location",
      mode: "multiple",
      label: "Localização",
      placeholder: "Selecione localização",
      options: locationOptions,
    },
  ];

  return (
    <div className="min-h-full">
      <div className="border-b border-gray-200">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={{
              location: selectedLocations,
            }}
            onChange={(key, value) => {
              if (key === "location") {
                setSelectedLocations(Array.isArray(value) ? (value as string[]) : []);
                setCurrentPage(1);
              }
            }}
            showActiveChips={false}
            gridClassName="lg:grid-cols-[minmax(0,4fr)_minmax(0,1fr)_auto]"
            search={{
              label: "Pesquisar empresa",
              value: pendingSearchTerm,
              onChange: setPendingSearchTerm,
              placeholder: "Buscar empresa, código ou CNPJ...",
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
              <span>{error.message || "Erro ao carregar empresas."}</span>
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
          <CompanyTableSkeleton />
        ) : !hasData ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <EmptyState
              fullHeight
              maxContentWidth="sm"
              illustration="fileNotFound"
              illustrationAlt="Nenhuma empresa encontrada"
              title="Nenhuma empresa encontrada"
              description="Não encontramos empresas dentro do escopo atual do recrutador."
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={toggleSort}
                            className={cn(
                              "inline-flex items-center gap-1 bg-transparent px-2 py-1 transition-colors cursor-pointer",
                              sortDirection && "text-gray-900"
                            )}
                          >
                            Empresa
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortDirection
                            ? sortDirection === "asc"
                              ? "A → Z (clique para Z → A)"
                              : "Z → A (clique para A → Z)"
                            : "Ordenar por nome"}
                        </TooltipContent>
                      </Tooltip>

                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>A → Z</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Z → A</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[180px]">Telefone</TableHead>
                  <TableHead className="min-w-[240px]">E-mail</TableHead>
                  <TableHead className="min-w-[140px]">Localização</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCompanies.map((company) => {
                  const formattedCnpj = formatCnpj(company.cnpj);
                  const location = getCompanyLocationLabel(company);
                  const isNavigating = navigatingId === company.id;

                  return (
                    <TableRow
                      key={company.id}
                      className={cn(
                        "border-gray-100 transition-colors",
                        isNavigating ? "bg-blue-50/50" : "hover:bg-gray-50/50"
                      )}
                    >
                      <TableCell className="py-4 min-w-[280px] max-w-[320px]">
                        <div className="flex items-center gap-3">
                          <AvatarCustom
                            name={company.nomeExibicao || company.nome || "Empresa"}
                            src={company.avatarUrl || undefined}
                            size="sm"
                            showStatus={false}
                          />
                          <div className="min-w-0 flex flex-1 flex-col">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-gray-900">
                                {company.nomeExibicao || company.nome}
                              </span>
                              {company.codUsuario && (
                                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                  {company.codUsuario}
                                </span>
                              )}
                            </div>
                            {formattedCnpj && (
                              <div className="truncate font-mono text-sm text-gray-500">
                                {formattedCnpj}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        <span className="block truncate">
                          {formatPhone(company.telefone)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        <span className="block truncate">
                          {company.email || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        {location}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={cn(
                            "uppercase tracking-wide text-[10px]",
                            getCompanyStatusClasses(company.status)
                          )}
                        >
                          {getCompanyStatusLabel(company.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 w-12">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleNavigate(company.id)}
                          disabled={Boolean(navigatingId)}
                          className={cn(
                            "h-8 w-8 rounded-full cursor-pointer",
                            isNavigating
                              ? "bg-blue-100 text-blue-600"
                              : "text-gray-500 hover:bg-[var(--primary-color)] hover:text-white"
                          )}
                          aria-label="Visualizar empresa"
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
                {Math.min(safePage * ITEMS_PER_PAGE, totalItems)} de {totalItems} empresas
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
