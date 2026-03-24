"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  School,
} from "lucide-react";

import {
  listNotasByAluno,
  type NotaLancamento,
  type NotaOrigemTipo,
} from "@/api/cursos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ButtonCustom,
  EmptyState,
  FilterBar,
} from "@/components/ui/custom";
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
import type { InscricoesTabProps } from "../types";
import { formatDate } from "../utils/formatters";

interface NotaAlunoItem extends NotaLancamento {
  cursoNome?: string;
  cursoCodigo?: string;
  turmaNome?: string;
  turmaCodigo?: string;
}

function formatNota(value: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Sem atualização";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem atualização";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSituacao(nota: number | null) {
  if (nota === null) {
    return {
      label: "Sem nota",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    };
  }

  if (nota >= 7) {
    return {
      label: "Aprovado",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  }

  if (nota >= 5) {
    return {
      label: "Recuperação",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Reprovado",
    className: "bg-red-100 text-red-700 border-red-200",
  };
}

function getOrigemLabel(tipo?: NotaOrigemTipo | string | null) {
  if (tipo === "PROVA") return "Prova";
  if (tipo === "ATIVIDADE") return "Atividade";
  if (tipo === "AULA") return "Aula";
  if (tipo === "OUTRO") return "Outro";
  return "Sem origem";
}

const ORIGEM_CONFIG: Record<
  NotaOrigemTipo,
  { label: string; icon: typeof BookOpen; badgeClassName: string }
> = {
  AULA: {
    label: "Aulas",
    icon: BookOpen,
    badgeClassName: "bg-blue-100 text-blue-700 border-blue-200",
  },
  PROVA: {
    label: "Provas",
    icon: ClipboardList,
    badgeClassName: "bg-violet-100 text-violet-700 border-violet-200",
  },
  ATIVIDADE: {
    label: "Atividades",
    icon: FileCheck2,
    badgeClassName: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  SISTEMA: {
    label: "Sistema",
    icon: GraduationCap,
    badgeClassName: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  OUTRO: {
    label: "Outros",
    icon: School,
    badgeClassName: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

async function fetchAlunoNotasPorInscricoes(params: {
  alunoId: string;
  cursoId: string;
  turmaIds: string[];
  search?: string;
  page?: number;
  pageSize?: number;
  orderBy?: "alunoNome" | "nota" | "atualizadoEm";
  order?: "asc" | "desc";
}): Promise<NotaAlunoItem[]> {
  const {
    alunoId,
    cursoId,
    turmaIds,
    search,
    page = 1,
    pageSize = 200,
    orderBy = "atualizadoEm",
    order = "desc",
  } = params;

  const response = await listNotasByAluno(alunoId, {
    cursoId,
    turmaIds: turmaIds.join(","),
    search,
    page,
    pageSize,
    orderBy,
    order,
  });
  return (response.data?.items ?? []) as NotaAlunoItem[];
}

export function NotasTab({ aluno, inscricoes, isLoading }: InscricoesTabProps) {
  const hasAutoSelectedCursoRef = useRef(false);
  const hasAutoSelectedTurmaRef = useRef(false);
  const [selectedCursoId, setSelectedCursoId] = useState<string | null>(null);
  const [selectedTurmaIds, setSelectedTurmaIds] = useState<string[]>([]);
  const [selectedOrigem, setSelectedOrigem] = useState<string | null>(null);
  const [pendingSearch, setPendingSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const inscricoesValidas = useMemo(
    () =>
      (inscricoes && inscricoes.length > 0 ? inscricoes : aluno.inscricoes).filter(
        (inscricao) => inscricao.curso?.id && inscricao.turma?.id
      ),
    [aluno.inscricoes, inscricoes]
  );

  const cursosOptions = useMemo(() => {
    const map = new Map<string, { nome: string; codigo?: string }>();

    for (const inscricao of inscricoesValidas) {
      const cursoId = inscricao.curso?.id;
      if (!cursoId || map.has(cursoId)) continue;
      map.set(cursoId, {
        nome: inscricao.curso?.nome || cursoId,
        codigo: inscricao.curso?.codigo,
      });
    }

    return Array.from(map.entries())
      .map(([value, data]) => ({
        value,
        label: data.codigo ? `${data.nome} • ${data.codigo}` : data.nome,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [inscricoesValidas]);

  useEffect(() => {
    if (hasAutoSelectedCursoRef.current) return;
    if (selectedCursoId) return;
    if (cursosOptions.length === 0) return;
    setSelectedCursoId(cursosOptions[0].value);
    hasAutoSelectedCursoRef.current = true;
  }, [selectedCursoId, cursosOptions]);
  const selectedTurmasSignature = useMemo(
    () => [...selectedTurmaIds].sort().join("|"),
    [selectedTurmaIds]
  );
  const hasCursoSelecionado = Boolean(selectedCursoId);
  const hasTurmaFilter = hasCursoSelecionado && selectedTurmaIds.length > 0;

  const notasQuery = useQuery<NotaAlunoItem[], Error>({
    queryKey: [
      "aluno-notas",
      aluno.id,
      selectedCursoId,
      selectedTurmasSignature,
      appliedSearch,
    ],
    enabled: inscricoesValidas.length > 0 && hasTurmaFilter,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    queryFn: () =>
      fetchAlunoNotasPorInscricoes({
        alunoId: aluno.id,
        cursoId: selectedCursoId as string,
        turmaIds: selectedTurmaIds,
        search: appliedSearch || undefined,
      }),
  });

  const notas = useMemo(() => notasQuery.data ?? [], [notasQuery.data]);
  const isTabLoading = isLoading || notasQuery.isLoading;

  const turmaOptions = useMemo(() => {
    const map = new Map<string, { turma: string; curso: string }>();

    for (const inscricao of inscricoesValidas) {
      if (selectedCursoId && inscricao.curso?.id !== selectedCursoId) continue;
      const turmaId = inscricao.turma?.id;
      if (!turmaId || map.has(turmaId)) continue;

      map.set(turmaId, {
        turma: inscricao.turma?.nome || turmaId,
        curso: inscricao.curso?.nome || "Curso",
      });
    }

    return Array.from(map.entries())
      .map(([value, labels]) => ({
        value,
        label: `${labels.turma} - ${labels.curso}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [inscricoesValidas, selectedCursoId]);

  useEffect(() => {
    setSelectedTurmaIds([]);
    hasAutoSelectedTurmaRef.current = false;
  }, [selectedCursoId]);

  useEffect(() => {
    if (hasAutoSelectedTurmaRef.current) return;
    if (!selectedCursoId) return;
    if (selectedTurmaIds.length > 0) return;
    if (turmaOptions.length === 0) return;
    setSelectedTurmaIds([turmaOptions[0].value]);
    hasAutoSelectedTurmaRef.current = true;
  }, [selectedCursoId, selectedTurmaIds.length, turmaOptions]);

  const origemOptions = useMemo(
    () => [
      { value: "AULA", label: "Aula" },
      { value: "PROVA", label: "Prova" },
      { value: "ATIVIDADE", label: "Atividade" },
      { value: "OUTRO", label: "Outro" },
    ],
    []
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        key: "origem",
        label: "Origem",
        options: origemOptions,
        placeholder: "Selecionar origem",
      },
      {
        key: "cursoId",
        label: "Curso",
        options: cursosOptions,
        placeholder: "Selecionar curso",
      },
      {
        key: "turmaIds",
        label: "Turmas",
        mode: "multiple",
        options: turmaOptions,
        placeholder: "Selecionar turmas",
        disabled: !selectedCursoId,
        emptyPlaceholder: "Sem turmas disponíveis",
      },
    ],
    [cursosOptions, origemOptions, selectedCursoId, turmaOptions]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCursoId,
      turmaIds: selectedTurmaIds,
      origem: selectedOrigem,
    }),
    [selectedCursoId, selectedOrigem, selectedTurmaIds]
  );

  const filteredNotas = useMemo(() => {
    const search = appliedSearch.trim().toLowerCase();

    return notas.filter((item) => {
      if (selectedTurmaIds.length > 0 && !selectedTurmaIds.includes(item.turmaId)) {
        return false;
      }

      if (selectedOrigem && item.origem?.tipo !== selectedOrigem) {
        return false;
      }

      if (!search) return true;

      const curso = (item.cursoNome || "").toLowerCase();
      const turma = (item.turmaNome || "").toLowerCase();
      const origemTitulo = (item.origem?.titulo || "").toLowerCase();
      const origemTipo = getOrigemLabel(item.origem?.tipo).toLowerCase();

      return (
        curso.includes(search) ||
        turma.includes(search) ||
        origemTitulo.includes(search) ||
        origemTipo.includes(search)
      );
    });
  }, [appliedSearch, notas, selectedOrigem, selectedTurmaIds]);

  const resumo = useMemo(() => {
    const notasComValor = filteredNotas.filter(
      (item) => typeof item.nota === "number" && Number.isFinite(item.nota)
    );

    const mediaGeral =
      notasComValor.length > 0
        ? notasComValor.reduce((acc, item) => acc + (item.nota ?? 0), 0) /
          notasComValor.length
        : null;

    const ultimaAtualizacao =
      filteredNotas.length > 0
        ? filteredNotas
            .map((item) => new Date(item.atualizadoEm).getTime())
            .filter((ts) => Number.isFinite(ts))
            .sort((a, b) => b - a)[0] ?? null
        : null;

    return {
      mediaGeral,
      totalTurmas: filteredNotas.length,
      turmasComNota: notasComValor.length,
      ultimaAtualizacao,
    };
  }, [filteredNotas]);

  useEffect(() => {
    setPage(1);
  }, [selectedCursoId, selectedTurmaIds, selectedOrigem, appliedSearch]);

  const totalItems = filteredNotas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () =>
      filteredNotas.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [currentPage, filteredNotas]
  );

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

  const handleSearchSubmit = () => {
    setAppliedSearch(pendingSearch.trim());
  };

  if (isTabLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (hasTurmaFilter && notasQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {notasQuery.error?.message ?? "Não foi possível carregar as notas do aluno."}
        </AlertDescription>
      </Alert>
    );
  }

  if (inscricoesValidas.length === 0) {
    return (
      <EmptyState
        illustration="books"
        illustrationAlt="Sem inscrições"
        title="Sem inscrições ativas"
        description="Este aluno ainda não possui cursos/turmas vinculados para exibir notas."
        className="rounded-2xl border border-gray-200/60 bg-white p-6"
      />
    );
  }

  return (
    <div className="space-y-5">
      {hasTurmaFilter ? (
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm! font-medium! text-slate-700! mb-1!">Nota geral</p>
              <p className="text-xl! font-semibold! text-slate-900! mb-0!">
                {resumo.mediaGeral === null ? "—" : formatNota(resumo.mediaGeral)}
              </p>
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <GraduationCap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-1 text-sm! text-slate-500! mb-0!">
            Situação: {getSituacao(resumo.mediaGeral).label}
          </p>
        </article>

        <article className="rounded-xl border border-violet-100 bg-violet-50/40 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm! font-medium! text-slate-700! mb-1!">Notas por turma</p>
              <p className="text-xl! font-semibold! text-slate-900! mb-0!">
                {resumo.turmasComNota}/{resumo.totalTurmas}
              </p>
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <School className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-1 text-sm! text-slate-500! mb-0!">
            Turmas com nota consolidada
          </p>
        </article>

        <article className="rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm! font-medium! text-slate-700! mb-1!">Atualizado em</p>
              <p className="text-sm! font-semibold! text-slate-900! mb-0!">
                {formatDateTime(
                  resumo.ultimaAtualizacao
                    ? new Date(resumo.ultimaAtualizacao).toISOString()
                    : null
                )}
              </p>
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <CalendarDays className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-1 text-sm! text-slate-500! mb-0!">
            Última atualização da listagem
          </p>
        </article>
      </section>
      ) : null}

      <FilterBar
        gridClassName="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_max-content] [&>*:nth-child(1)]:lg:row-start-1 [&>*:nth-child(1)]:lg:col-start-1 [&>*:nth-child(1)]:lg:col-end-3 [&>*:nth-child(2)]:lg:row-start-1 [&>*:nth-child(2)]:lg:col-start-3 [&>*:nth-child(3)]:lg:row-start-2 [&>*:nth-child(3)]:lg:col-start-1 [&>*:nth-child(4)]:lg:row-start-2 [&>*:nth-child(4)]:lg:col-start-2 [&>*:nth-child(5)]:lg:row-start-2 [&>*:nth-child(5)]:lg:col-start-3"
        rightActionsClassName="!w-auto md:col-span-1 md:flex-row md:items-end md:justify-start xl:col-span-1 xl:flex-row xl:items-end xl:justify-start"
        fields={filterFields}
        values={filterValues}
        onChange={(key, value) => {
          if (key === "cursoId") {
            setSelectedCursoId((value as string) || null);
          }
          if (key === "turmaIds") {
            setSelectedTurmaIds(Array.isArray(value) ? (value as string[]) : []);
          }
          if (key === "origem") {
            setSelectedOrigem((value as string) || null);
          }
        }}
        onClearAll={() => {
          setSelectedCursoId(null);
          setSelectedTurmaIds([]);
          setSelectedOrigem(null);
          setPendingSearch("");
          setAppliedSearch("");
          setPage(1);
        }}
        search={{
          label: "Pesquisar",
          value: pendingSearch,
          onChange: setPendingSearch,
          placeholder: "Buscar por curso, turma ou origem...",
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchSubmit();
            }
          },
        }}
        rightActions={
          <ButtonCustom
            variant="primary"
            size="lg"
            onClick={handleSearchSubmit}
            className="w-full md:w-auto"
          >
            Pesquisar
          </ButtonCustom>
        }
      />
      {!hasTurmaFilter ? (
        <EmptyState
          illustration="books"
          illustrationAlt="Selecione turmas"
          title="Selecione ao menos uma turma"
          description="As notas serão exibidas somente após filtrar por turma."
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      ) : notas.length === 0 ? (
        <EmptyState
          illustration="books"
          illustrationAlt="Sem notas"
          title="Nenhuma nota encontrada"
          description="Não há notas para as turmas selecionadas."
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="py-4 px-3 font-medium text-gray-700">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="py-4 px-3 text-center font-medium text-gray-700">
                    Nota / Situação
                  </TableHead>
                  <TableHead className="py-4 px-3 text-center font-medium text-gray-700">
                    Origem
                  </TableHead>
                  <TableHead className="py-4 px-3 text-center font-medium text-gray-700">
                    Atualizado em
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-gray-500">
                      Nenhuma nota encontrada para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((item) => {
                    const situacao = getSituacao(item.nota);
                    return (
                      <TableRow key={`${item.cursoId}-${item.turmaId}`} className="border-gray-100">
                        <TableCell className="py-4 px-3">
                          <div className="flex min-w-0 items-start gap-2">
                            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                            <div className="min-w-0 space-y-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0 text-[11px] text-gray-500">
                                  Curso
                                </span>
                                <span className="min-w-0 truncate text-sm text-gray-700">
                                  {item.cursoNome || item.cursoId}
                                </span>
                              </div>
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0 text-[11px] text-gray-500">
                                  Turma
                                </span>
                                <span className="min-w-0 truncate text-sm text-gray-700">
                                  {item.turmaNome || item.turmaId}
                                </span>
                                {item.turmaCodigo ? (
                                  <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                                    {item.turmaCodigo}
                                  </code>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 px-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {formatNota(item.nota)}
                            </span>
                            <Badge variant="outline" className={cn("text-xs font-medium", situacao.className)}>
                              {situacao.label}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 px-3 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium",
                              item.origem?.tipo && ORIGEM_CONFIG[item.origem.tipo]
                                ? ORIGEM_CONFIG[item.origem.tipo].badgeClassName
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            {getOrigemLabel(item.origem?.tipo)}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4 px-3 text-center text-sm text-gray-700">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {formatDate(item.atualizadoEm)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalItems > 0 && totalPages > 1 ? (
            <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, totalItems)} de {totalItems}
              </span>

              <div className="flex items-center gap-2">
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3"
                >
                  Anterior
                </ButtonCustom>

                {visiblePages.map((p) => (
                  <ButtonCustom
                    key={p}
                    variant={p === currentPage ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className="h-8 w-8 p-0"
                  >
                    {p}
                  </ButtonCustom>
                ))}

                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3"
                >
                  Próxima
                </ButtonCustom>
              </div>
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
}
