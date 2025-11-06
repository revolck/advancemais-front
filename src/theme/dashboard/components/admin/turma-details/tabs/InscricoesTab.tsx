"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { InputCustom } from "@/components/ui/custom/input";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, ChevronRight, Mail, Calendar, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { TurmaInscricao } from "@/api/cursos";

interface InscricoesTabProps {
  inscricoes: TurmaInscricao[];
  isLoading?: boolean;
}

const getStatusColor = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
  
  const normalized = status.toUpperCase().replace(/_/g, "");
  
  switch (normalized) {
    case "INSCRITO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "EMANDAMENTO":
      return "bg-green-100 text-green-800 border-green-200";
    case "CONCLUIDO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "REPROVADO":
      return "bg-red-100 text-red-800 border-red-200";
    case "EMESTAGIO":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "CANCELADO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "TRANCADO":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  
  const normalized = status.toUpperCase().replace(/_/g, "_");
  
  // Mapeamento direto dos status da API
  const statusMap: Record<string, string> = {
    INSCRITO: "Inscrito",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDO: "Concluído",
    REPROVADO: "Reprovado",
    EM_ESTAGIO: "Em Estágio",
    CANCELADO: "Cancelado",
    TRANCADO: "Trancado",
  };
  
  // Retorna o label mapeado ou formata o status
  if (statusMap[normalized]) {
    return statusMap[normalized];
  }
  
  // Fallback: formatação genérica
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function InscricoesTab({
  inscricoes,
  isLoading = false,
}: InscricoesTabProps) {
  // Estados de busca
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  // Estados de paginação
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de ordenação
  type SortField = "nome" | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Função para aplicar a busca
  const handleSearchSubmit = useCallback((rawValue?: string) => {
    const value = rawValue ?? pendingSearchQuery;
    const trimmedValue = value.trim();
    setAppliedSearchQuery(trimmedValue);
    setCurrentPage(1); // Reset para página 1 ao buscar
  }, [pendingSearchQuery]);

  // Funções de ordenação
  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset para página 1 ao ordenar
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    if (field === null) return;
    setSortField((prev) => {
      if (prev !== field) {
        setSortDirection("asc");
        return field;
      }
      setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      return prev;
    });
    setCurrentPage(1); // Reset para página 1 ao ordenar
  }, []);

  // Função de ordenação
  const sortList = useCallback(
    <T extends (typeof inscricoes)[number]>(list: T[]) => {
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        if (sortField === "nome") {
          const aNome = (a.aluno?.nomeCompleto || a.aluno?.nome || "").toLowerCase();
          const bNome = (b.aluno?.nomeCompleto || b.aluno?.nome || "").toLowerCase();
          const cmp = aNome.localeCompare(bNome, "pt-BR", {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? cmp : -cmp;
        }
        return 0;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  // Filtrar inscrições por nome do aluno (usa o termo aplicado, não o pendente)
  const filteredInscricoes = useMemo(() => {
    let result = inscricoes;

    // Aplicar filtro de busca
    if (appliedSearchQuery) {
      const query = appliedSearchQuery.toLowerCase();
      result = result.filter((inscricao) => {
        const nomeCompleto = (inscricao.aluno?.nomeCompleto || inscricao.aluno?.nome || "").toLowerCase();
        const codigo = (inscricao.aluno?.codigo || inscricao.aluno?.codUsuario || "").toLowerCase();
        return nomeCompleto.includes(query) || codigo.includes(query);
      });
    }

    // Aplicar ordenação
    return sortList(result);
  }, [inscricoes, appliedSearchQuery, sortList]);

  // Paginação
  const totalItems = filteredInscricoes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInscricoes = filteredInscricoes.slice(startIndex, endIndex);

  // Páginas visíveis para paginação
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback((page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
  }, [totalPages]);

  // Validação do input de busca
  const isSearchInputValid = useMemo(() => {
    return pendingSearchQuery.trim().length >= 2 || pendingSearchQuery.trim().length === 0;
  }, [pendingSearchQuery]);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchQuery]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (inscricoes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <EmptyState
          illustration="userProfiles"
          illustrationAlt="Nenhuma inscrição encontrada"
          title="Nenhuma inscrição encontrada"
          description="Esta turma ainda não possui alunos inscritos."
          maxContentWidth="md"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Campo de pesquisa */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <InputCustom
              label="Pesquisar aluno"
              placeholder="Buscar por nome ou código de matrícula..."
              value={pendingSearchQuery}
              onChange={(e) => setPendingSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              icon="Search"
            />
          </div>
          <ButtonCustom
            variant="primary"
            size="lg"
            onClick={() => handleSearchSubmit()}
            disabled={!isSearchInputValid}
          >
            Pesquisar
          </ButtonCustom>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead
                className="font-medium text-gray-700 py-4"
                aria-sort={
                  sortField === "nome"
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
                        onClick={() => toggleSort("nome")}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                          sortField === "nome" && "text-gray-900"
                        )}
                      >
                        Aluno
                      </button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      {sortField === "nome"
                        ? sortDirection === "asc"
                          ? "A → Z"
                          : "Z → A"
                        : "Ordenar por nome"}
                    </TooltipContent>
                  </Tooltip>

                  <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                          aria-label="Ordenar A → Z"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSort("nome", "asc");
                          }}
                        >
                          <ChevronUp
                            className={cn(
                              "h-3 w-3 text-gray-400",
                              sortField === "nome" &&
                                sortDirection === "asc" &&
                                "text-[var(--primary-color)]"
                            )}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>
                        A → Z
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                          aria-label="Ordenar Z → A"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSort("nome", "desc");
                          }}
                        >
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 text-gray-400 -mt-0.5",
                              sortField === "nome" &&
                                sortDirection === "desc" &&
                                "text-[var(--primary-color)]"
                            )}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>
                        Z → A
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700">Email</TableHead>
              <TableHead className="font-medium text-gray-700">Status</TableHead>
              <TableHead className="font-medium text-gray-700">Inscrito em</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInscricoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-500">
                  {appliedSearchQuery ? (
                    <>Nenhum aluno encontrado com o termo "{appliedSearchQuery}"</>
                  ) : (
                    <>Nenhum aluno encontrado</>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedInscricoes.map((inscricao) => (
                <TableRow
                  key={inscricao.id}
                  className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-medium">
                          {inscricao.aluno?.nomeCompleto ||
                            inscricao.aluno?.nome ||
                            "—"}
                        </span>
                        {(inscricao.aluno?.codigo || inscricao.aluno?.codUsuario) && (
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                            {inscricao.aluno?.codigo || inscricao.aluno?.codUsuario}
                          </code>
                        )}
                      </div>
                    </div>
                  </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{inscricao.aluno?.email || "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      getStatusColor(inscricao.status)
                    )}
                  >
                    {getStatusLabel(inscricao.status)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>
                      {inscricao.criadoEm
                        ? new Date(inscricao.criadoEm).toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {inscricao.aluno?.id && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
                          aria-label="Visualizar aluno"
                        >
                          <Link
                            href={`/dashboard/cursos/alunos/${inscricao.aluno.id}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={8}>
                        Visualizar aluno
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalItems > 0 && (
        <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Mostrando{" "}
              {Math.min(startIndex + 1, totalItems)}{" "}
              a {Math.min(endIndex, totalItems)}{" "}
              de {totalItems} aluno{totalItems === 1 ? "" : "s"}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                Anterior
              </ButtonCustom>

              {visiblePages[0] > 1 && (
                <>
                  <ButtonCustom
                    variant={
                      currentPage === 1 ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className="h-8 w-8 p-0"
                  >
                    1
                  </ButtonCustom>
                  {visiblePages[0] > 2 && (
                    <span className="text-gray-400">...</span>
                  )}
                </>
              )}

              {visiblePages.map((page) => (
                <ButtonCustom
                  key={page}
                  variant={
                    currentPage === page ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </ButtonCustom>
              ))}

              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] <
                    totalPages - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                  <ButtonCustom
                    variant={
                      currentPage === totalPages
                        ? "primary"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="h-8 w-8 p-0"
                  >
                    {totalPages}
                  </ButtonCustom>
                </>
              )}

              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Próxima
              </ButtonCustom>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
