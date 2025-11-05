"use client";

import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ExternalLink,
  GraduationCap,
  Users,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { InscricoesTabProps } from "../types";
import { formatDate, getStatusBadge } from "../utils/formatters";
import { useMemo, useState, useEffect } from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { ButtonCustom } from "@/components/ui/custom/button";
import { SelectCustom } from "@/components/ui/custom/select";
import type { SelectOption } from "@/components/ui/custom/select";

// Função para calcular progresso baseado no status (fallback caso progresso não venha da API)
function calculateProgress(status?: string): number {
  if (!status) return 0;
  const normalized = status.toUpperCase();
  const progressMap: Record<string, number> = {
    MATRICULADO: 10,
    EM_ANDAMENTO: 50,
    EM_CURSO: 50,
    EM_ESTAGIO: 80,
    CONCLUIDO: 100,
    CONCLUÍDO: 100,
    CANCELADO: 0,
    TRANCADO: 0,
  };
  return progressMap[normalized] || 0;
}

// Função para obter cor do progresso baseado no valor do progresso
function getProgressColor(progress: number): string {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 80) return "bg-blue-500";
  if (progress >= 50) return "bg-yellow-500";
  if (progress >= 20) return "bg-orange-500";
  return "bg-gray-400";
}

export function CursosTurmasTab({
  aluno,
  inscricoes,
  isLoading,
}: InscricoesTabProps) {
  const inscricoesData =
    (inscricoes && inscricoes.length > 0 ? inscricoes : aluno.inscricoes) || [];
  const pageSize = 12;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");

  // Função para executar a busca
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  // Função para limpar a busca
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  // Handler para pressionar Enter no input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Filtrar inscrições por busca e status
  const filteredInscricoes = useMemo(() => {
    let filtered = inscricoesData;

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((inscricao) => {
        const cursoNome = inscricao.curso?.nome?.toLowerCase() || "";
        const turmaNome = inscricao.turma?.nome?.toLowerCase() || "";
        const turmaCodigo = inscricao.turma?.codigo?.toLowerCase() || "";
        return (
          cursoNome.includes(query) ||
          turmaNome.includes(query) ||
          turmaCodigo.includes(query)
        );
      });
    }

    // Filtro por status
    if (statusFilter !== "TODOS") {
      filtered = filtered.filter((inscricao) => {
        const status = (inscricao.statusInscricao || "").toUpperCase();
        if (statusFilter === "ATIVAS") {
          return [
            "MATRICULADO",
            "EM_ANDAMENTO",
            "EM_ESTAGIO",
            "EM_CURSO",
          ].includes(status);
        }
        if (statusFilter === "CONCLUIDOS") {
          return ["CONCLUIDO", "CONCLUÍDO"].includes(status);
        }
        if (statusFilter === "CANCELADOS") {
          return ["CANCELADO"].includes(status);
        }
        return status === statusFilter;
      });
    }

    return filtered;
  }, [inscricoesData, searchQuery, statusFilter]);

  const total = filteredInscricoes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  // Resetar página quando filtrar
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  const pageItems = useMemo(
    () =>
      filteredInscricoes.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [currentPage, filteredInscricoes]
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Skeleton para estatísticas */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border border-gray-100 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-9 w-12 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md shrink-0" />
              </div>
            </div>
          ))}
        </div>
        {/* Skeleton para cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
            >
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ativos = inscricoesData.filter((i) =>
    ["MATRICULADO", "EM_ANDAMENTO", "EM_ESTAGIO", "EM_CURSO"].includes(
      (i.statusInscricao || "").toUpperCase()
    )
  ).length;
  const concluidos = inscricoesData.filter((i) =>
    ["CONCLUIDO", "CONCLUÍDO"].includes((i.statusInscricao || "").toUpperCase())
  ).length;
  const cancelados = inscricoesData.filter((i) =>
    ["CANCELADO"].includes((i.statusInscricao || "").toUpperCase())
  ).length;
  const totalOriginal = inscricoesData.length;

  // Opções do filtro de status
  const statusOptions: SelectOption[] = [
    { value: "TODOS", label: "Todos os status" },
    { value: "ATIVAS", label: "Ativas" },
    { value: "CONCLUIDOS", label: "Concluídos" },
    { value: "CANCELADOS", label: "Reprovados" },
  ];

  if (inscricoesData.length === 0) {
    return (
      <EmptyState
        illustration="books"
        illustrationAlt="Ilustração sem cursos/turmas"
        title="Nenhuma inscrição encontrada"
        description="Este aluno ainda não possui cursos/turmas associados."
        className="rounded-2xl border border-gray-200/60 bg-white p-6"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas criativas e coloridas */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-50 via-indigo-50/50 to-white border border-indigo-100 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="!mb-0">
                {String(totalOriginal).padStart(2, "0")}
              </h4>
              <p>Inscrições</p>
            </div>
            <div className="rounded-md bg-indigo-100 p-2 shrink-0">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 h-12 w-12 rounded-full bg-indigo-200/20 blur-xl" />
        </div>

        {/* Ativas */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white border border-emerald-100 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="!mb-0">{String(ativos).padStart(2, "0")}</h4>
              <p>Em andamento</p>
            </div>
            <div className="rounded-md bg-emerald-100 p-2 shrink-0">
              <PlayCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 h-12 w-12 rounded-full bg-emerald-200/20 blur-xl" />
        </div>

        {/* Concluídos */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 via-blue-50/50 to-white border border-blue-100 p-4">
          <div className="flex items-start justify-between">
            <div>
              {concluidos === 0 ? (
                <>
                  <h4 className="!mb-0">00</h4>
                  <p>Nenhum concluído</p>
                </>
              ) : (
                <>
                  <h4 className="!mb-0">
                    {String(
                      Math.round((concluidos / totalOriginal) * 100)
                    ).padStart(2, "0")}
                    %
                  </h4>
                  <p>concluído</p>
                </>
              )}
            </div>
            <div className="rounded-md bg-blue-100 p-2 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 h-12 w-12 rounded-full bg-blue-200/20 blur-xl" />
        </div>

        {/* Reprovados */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-rose-50 via-rose-50/50 to-white border border-rose-100 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="!mb-0">{String(cancelados).padStart(2, "0")}</h4>
              <p>Reprovados</p>
            </div>
            <div className="rounded-md bg-rose-100 p-2 shrink-0">
              <XCircle className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 h-12 w-12 rounded-full bg-rose-200/20 blur-xl" />
        </div>
      </div>

      {/* Busca e Filtro */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <InputCustom
            type="text"
            placeholder="Buscar por curso, turma..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rightIcon={searchInput || searchQuery ? "X" : undefined}
            onRightIconClick={handleClearSearch}
            size="md"
            fullWidth
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <SelectCustom
            mode="single"
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value || "TODOS");
              setPage(1);
            }}
            placeholder="Filtrar por status"
            fullWidth
          />
        </div>
        <ButtonCustom
          variant="primary"
          size="lg"
          icon="Search"
          onClick={handleSearch}
          className="w-full sm:w-auto shrink-0"
        >
          Pesquisar
        </ButtonCustom>
      </div>

      {/* Resultados */}
      {total === 0 ? (
        <EmptyState
          illustration="books"
          illustrationAlt="Nenhum resultado"
          title="Nenhum resultado encontrado"
          description="Tente ajustar os filtros de busca."
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      ) : (
        <>
          {/* Grid de cards estilo Apple - limpo e minimalista */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {pageItems.map((inscricao) => {
              const img = inscricao.curso?.imagemUrl;
              const statusBadge = getStatusBadge(inscricao.statusInscricao);
              // Usa progresso da API se disponível (incluindo 0), caso contrário usa fallback baseado no status
              // Verifica se progresso é um número válido (incluindo 0)
              const rawProgress =
                typeof inscricao.progresso === "number"
                  ? inscricao.progresso
                  : calculateProgress(inscricao.statusInscricao);
              // Garante que o progresso está entre 0 e 100
              const progress = Math.max(0, Math.min(100, rawProgress));
              const progressColor = getProgressColor(progress);
              const isConcluido = ["CONCLUIDO", "CONCLUÍDO"].includes(
                (inscricao.statusInscricao || "").toUpperCase()
              );
              const isCancelado = ["CANCELADO"].includes(
                (inscricao.statusInscricao || "").toUpperCase()
              );

              return (
                <article
                  key={inscricao.id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-300 bg-white transition-all duration-200 hover:border-gray-400"
                >
                  {/* Imagem limpa */}
                  <div className="relative h-40 w-full overflow-hidden bg-gray-50">
                    {img ? (
                      <img
                        src={img}
                        alt={inscricao.curso?.nome || "Imagem do curso"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        <GraduationCap className="h-12 w-12 text-gray-300" />
                      </div>
                    )}

                    {/* Status badge suave */}
                    <div className="absolute right-2.5 top-2.5">
                      {statusBadge}
                    </div>
                  </div>

                  {/* Conteúdo minimalista */}
                  <div className="p-4">
                    <h5>{inscricao.curso?.nome || "Curso não informado"}</h5>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{formatDate(inscricao.turma?.dataInicio)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span>Turma {inscricao.turma?.codigo || "—"}</span>
                      </div>
                    </div>

                    {/* Progresso sutil */}
                    {!isConcluido && !isCancelado && (
                      <div className="mt-3">
                        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-600">
                          <span>Progresso</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              progressColor
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Botão de ação */}
                    {inscricao.curso?.id && (
                      <a
                        href={`/dashboard/cursos/${inscricao.curso.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90 hover:shadow-sm"
                      >
                        Ver curso
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Paginação minimalista */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 sm:flex-row">
              <p className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-medium text-gray-900">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium text-gray-900">
                  {Math.min(currentPage * pageSize, total)}
                </span>{" "}
                de <span className="font-medium text-gray-900">{total}</span>
              </p>
              <div className="inline-flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 text-sm"
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === currentPage ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-9 w-9",
                        p === currentPage &&
                          "bg-gray-900 text-white hover:bg-gray-800"
                      )}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-3 text-sm"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CursosTurmasTab;
