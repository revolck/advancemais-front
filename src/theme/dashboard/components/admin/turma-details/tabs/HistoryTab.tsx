"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import type { CursoTurma, TurmaInscricao } from "@/api/cursos";
import { getAulaHistorico, type AulaHistorico } from "@/api/aulas";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/config/roles";
import { Calendar, User, Crown, Users, PenTool, Eye, X } from "lucide-react";

type EventKind = "TURMA" | "AULA" | "INSCRICAO";

type TurmaHistoryEvent = {
  id: string;
  kind: EventKind;
  action: string;
  actionLabel: string;
  description: string;
  date: string;
  actorName?: string;
  actorRole?: string;
};

interface FilterValues {
  tipo: string[];
  acao: string[];
  alteradoPor: string[];
  periodo: DateRange;
}

interface HistoryTabProps {
  turma: CursoTurma;
  inscricoes?: TurmaInscricao[];
  isLoading?: boolean;
  turmaId: string;
}

const AULA_ACAO_LABELS: Record<string, string> = {
  CRIADA: "Aula criada",
  EDITADA: "Aula atualizada",
  STATUS_ALTERADO: "Status da aula alterado",
  VINCULADA_TURMA: "Aula vinculada a turma",
  DESVINCULADA_TURMA: "Aula desvinculada da turma",
  CANCELADA: "Aula cancelada",
  RESTAURADA: "Aula restaurada",
};

const TURMA_STATUS_LABELS: Record<string, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADO: "Publicado",
  INSCRICOES_ABERTAS: "Inscricoes abertas",
  INSCRICOES_ENCERRADAS: "Inscricoes encerradas",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluido",
  SUSPENSO: "Suspenso",
  CANCELADO: "Cancelado",
};

const KIND_LABELS: Record<EventKind, string> = {
  TURMA: "Turma",
  AULA: "Aula",
  INSCRICAO: "Inscrição",
};

const getKindBadgeColor = (kind: EventKind): string => {
  const map: Record<EventKind, string> = {
    TURMA: "bg-blue-50 text-blue-700 border-blue-200",
    AULA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INSCRICAO: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return map[kind];
};

const getRoleBadgeColor = (role?: string): string => {
  const map: Record<string, string> = {
    ADMIN: "bg-red-50 text-red-700 border-red-200",
    MODERADOR: "bg-blue-50 text-blue-700 border-blue-200",
    PEDAGOGICO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INSTRUTOR: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return map[String(role || "").toUpperCase()] || "bg-gray-50 text-gray-700 border-gray-200";
};

const getRoleIcon = (role?: string) => {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "ADMIN") return <Crown className="h-3 w-3" />;
  if (normalized === "MODERADOR") return <Users className="h-3 w-3" />;
  if (normalized === "PEDAGOGICO") return <PenTool className="h-3 w-3" />;
  if (normalized === "INSTRUTOR") return <Eye className="h-3 w-3" />;
  return <User className="h-3 w-3" />;
};

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Agora";
  if (diffInMinutes < 60) return `Ha ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Ha ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `Ha ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
};

const extractAulaIds = (turma: CursoTurma): string[] => {
  const ids = new Set<string>();
  const turmaAny = turma as any;
  const estrutura = turmaAny?.estrutura;
  const modules = Array.isArray(estrutura?.modules) ? estrutura.modules : [];
  const standalone = Array.isArray(estrutura?.standaloneItems)
    ? estrutura.standaloneItems
    : [];
  const itens = Array.isArray(turmaAny?.itens) ? turmaAny.itens : [];
  const aulas = Array.isArray(turmaAny?.aulas) ? turmaAny.aulas : [];

  modules.forEach((mod: any) => {
    const modItems = Array.isArray(mod?.items) ? mod.items : [];
    modItems.forEach((item: any) => {
      if (String(item?.type).toUpperCase() !== "AULA") return;
      if (item?.id) ids.add(String(item.id));
      if (item?.aulaId) ids.add(String(item.aulaId));
    });
  });

  standalone.forEach((item: any) => {
    if (String(item?.type).toUpperCase() !== "AULA") return;
    if (item?.id) ids.add(String(item.id));
    if (item?.aulaId) ids.add(String(item.aulaId));
  });

  itens.forEach((item: any) => {
    if (String(item?.tipo).toUpperCase() !== "AULA") return;
    if (item?.aulaId) ids.add(String(item.aulaId));
    if (item?.aula?.id) ids.add(String(item.aula.id));
  });

  aulas.forEach((aula: any) => {
    if (aula?.id) ids.add(String(aula.id));
  });

  return Array.from(ids).sort();
};

const buildTurmaEvents = (
  turma: CursoTurma,
  inscricoes: TurmaInscricao[]
): TurmaHistoryEvent[] => {
  const turmaAny = turma as any;
  const events: TurmaHistoryEvent[] = [];

  const createdByName =
    turmaAny?.criadoPor?.nomeCompleto ||
    turmaAny?.criadoPor?.nome ||
    turmaAny?.criadoPorId;
  const editedByName =
    turmaAny?.EditadoPor?.nomeCompleto ||
    turmaAny?.editadoPor?.nomeCompleto ||
    turmaAny?.editadoPor?.nome ||
    turmaAny?.editadoPorId;

  if (turma.criadoEm) {
    events.push({
      id: `turma-criada-${turma.id}`,
      kind: "TURMA",
      action: "TURMA_CRIADA",
      actionLabel: "Turma criada",
      description: `Turma "${turma.nome}" foi criada`,
      date: turma.criadoEm,
      actorName: createdByName || undefined,
    });
  }

  if (turma.editadoEm) {
    const statusAtual = TURMA_STATUS_LABELS[String(turma.status || "").toUpperCase()] || turma.status || "Nao informado";
    events.push({
      id: `turma-editada-${turma.id}-${turma.editadoEm}`,
      kind: "TURMA",
      action: "TURMA_EDITADA",
      actionLabel: "Turma atualizada",
      description: `Status atual: ${statusAtual}`,
      date: turma.editadoEm,
      actorName: editedByName || undefined,
    });
  }

  inscricoes.forEach((inscricao) => {
    if (!inscricao.criadoEm) return;
    const alunoNome =
      inscricao.aluno?.nomeCompleto ||
      inscricao.aluno?.nome ||
      inscricao.alunoId;
    events.push({
      id: `inscricao-${inscricao.id}`,
      kind: "INSCRICAO",
      action: "INSCRICAO_CRIADA",
      actionLabel: "Inscrição registrada",
      description: `Aluno: ${alunoNome} | Status: ${inscricao.status || "N/A"}`,
      date: inscricao.criadoEm,
    });
  });

  return events;
};

const buildAulaEvents = (
  historicosPorAula: Array<{ aulaId: string; historico: AulaHistorico[] }>
): TurmaHistoryEvent[] => {
  const events: TurmaHistoryEvent[] = [];
  historicosPorAula.forEach(({ aulaId, historico }) => {
    historico.forEach((item) => {
      const action = String(item.acao || "").toUpperCase();
      const changedFields =
        item.camposAlterados && typeof item.camposAlterados === "object"
          ? Object.keys(item.camposAlterados)
          : [];
      events.push({
        id: `aula-${aulaId}-${item.id}`,
        kind: "AULA",
        action,
        actionLabel: AULA_ACAO_LABELS[action] || `Aula: ${item.acao}`,
        description:
          changedFields.length > 0
            ? `Aula ${aulaId.slice(0, 8)} | Campos: ${changedFields.slice(0, 4).join(", ")}`
            : `Aula ${aulaId.slice(0, 8)}`,
        date: item.criadoEm,
        actorName: item.usuario?.nome,
        actorRole: item.usuario?.role,
      });
    });
  });
  return events;
};

export function HistoryTab({
  turma,
  inscricoes = [],
  isLoading = false,
  turmaId,
}: HistoryTabProps) {
  const [filters, setFilters] = useState<FilterValues>({
    tipo: [],
    acao: [],
    alteradoPor: [],
    periodo: { from: null, to: null },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const aulaIds = useMemo(() => extractAulaIds(turma), [turma]);

  const {
    data: aulaEvents = [],
    isLoading: isLoadingAulaHistory,
    error: aulaHistoryError,
  } = useQuery<TurmaHistoryEvent[], Error>({
    queryKey: ["turma-details-aulas-historico", turmaId, aulaIds],
    enabled: aulaIds.length > 0,
    queryFn: async () => {
      const responses: PromiseSettledResult<{
        aulaId: string;
        historico: AulaHistorico[];
      }>[] = [];
      const AULA_HISTORY_FETCH_CONCURRENCY = 4;

      for (
        let startIndex = 0;
        startIndex < aulaIds.length;
        startIndex += AULA_HISTORY_FETCH_CONCURRENCY
      ) {
        const batch = aulaIds.slice(
          startIndex,
          startIndex + AULA_HISTORY_FETCH_CONCURRENCY
        );
        const batchResults = await Promise.allSettled(
          batch.map(async (aulaId) => ({
            aulaId,
            historico: await getAulaHistorico(aulaId),
          }))
        );
        responses.push(...batchResults);
      }

      const fulfilled = responses
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<{
            aulaId: string;
            historico: AulaHistorico[];
          }> => result.status === "fulfilled"
        )
        .map((result) => result.value);

      return buildAulaEvents(fulfilled);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const allEvents = useMemo(() => {
    const turmaEvents = buildTurmaEvents(turma, inscricoes);
    return [...turmaEvents, ...aulaEvents].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return bTime - aTime;
    });
  }, [aulaEvents, inscricoes, turma]);

  const tipoOptions = useMemo(
    () =>
      (Object.keys(KIND_LABELS) as EventKind[]).map((kind) => ({
        value: kind,
        label: KIND_LABELS[kind],
      })),
    []
  );

  const acaoOptions = useMemo(() => {
    const unique = new Map<string, string>();
    allEvents.forEach((item) => {
      if (!unique.has(item.action)) {
        unique.set(item.action, item.actionLabel);
      }
    });
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [allEvents]);

  const alteradoPorOptions = useMemo(() => {
    const names = Array.from(
      new Set(allEvents.map((item) => item.actorName).filter(Boolean))
    ) as string[];
    return names.map((name) => ({ value: name, label: name }));
  }, [allEvents]);

  const handleFilterChange = useCallback(
    (key: keyof FilterValues, value: string[] | DateRange | null) => {
      setFilters((prev) => ({
        ...prev,
        [key]:
          key === "periodo"
            ? (value as DateRange | null) || { from: null, to: null }
            : (value as string[] | null) || [],
      }));
      setCurrentPage(1);
    },
    []
  );

  const filteredEvents = useMemo(() => {
    return allEvents.filter((item) => {
      const matchesTipo =
        filters.tipo.length === 0 || filters.tipo.includes(item.kind);
      const matchesAcao =
        filters.acao.length === 0 || filters.acao.includes(item.action);
      const matchesAlteradoPor =
        filters.alteradoPor.length === 0 ||
        (item.actorName ? filters.alteradoPor.includes(item.actorName) : false);

      const itemDate = new Date(item.date);
      const matchesStart =
        !filters.periodo.from || itemDate >= filters.periodo.from;
      const matchesEnd = !filters.periodo.to || itemDate <= filters.periodo.to;

      return (
        matchesTipo &&
        matchesAcao &&
        matchesAlteradoPor &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [allEvents, filters]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filteredEvents.slice(startIndex, endIndex);

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

  const activeChips = useMemo(() => {
    const chips: { key: keyof FilterValues; label: string }[] = [];
    if (filters.tipo.length > 0) {
      const labels = filters.tipo
        .map((v) => tipoOptions.find((o) => o.value === v)?.label || v)
        .join(", ");
      chips.push({ key: "tipo", label: `Tipo: ${labels}` });
    }
    if (filters.acao.length > 0) {
      const labels = filters.acao
        .map((v) => acaoOptions.find((o) => o.value === v)?.label || v)
        .join(", ");
      chips.push({ key: "acao", label: `Ação: ${labels}` });
    }
    if (filters.alteradoPor.length > 0) {
      chips.push({
        key: "alteradoPor",
        label: `Alterado por: ${filters.alteradoPor.join(", ")}`,
      });
    }
    if (filters.periodo.from || filters.periodo.to) {
      const from = filters.periodo.from?.toLocaleDateString("pt-BR") || "...";
      const to = filters.periodo.to?.toLocaleDateString("pt-BR") || "...";
      chips.push({ key: "periodo", label: `Período: ${from} - ${to}` });
    }
    return chips;
  }, [filters, tipoOptions, acaoOptions]);

  const loading = isLoading || isLoadingAulaHistory;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="space-y-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-52" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (allEvents.length === 0) {
    return (
      <EmptyState
        illustration="myFiles"
        illustrationAlt="Ilustracao de historico vazio"
        title="Nenhum historico encontrado"
        description="Nao ha registros de alteracoes para esta turma no momento."
        maxContentWidth="md"
        className="rounded-2xl border border-gray-200/60 bg-white p-8"
      />
    );
  }

  return (
    <div className="space-y-6">
      {aulaHistoryError && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            Parte do historico de aulas nao foi carregada. Os demais eventos continuam disponiveis.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Tipo</Label>
            <MultiSelectFilter
              title="Tipo"
              placeholder="Selecionar tipo"
              options={tipoOptions}
              selectedValues={filters.tipo}
              onSelectionChange={(val) => handleFilterChange("tipo", val)}
              showApplyButton
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Ação</Label>
            <MultiSelectFilter
              title="Ação"
              placeholder="Selecionar ação"
              options={acaoOptions}
              selectedValues={filters.acao}
              onSelectionChange={(val) => handleFilterChange("acao", val)}
              showApplyButton
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Alterado por
            </Label>
            <MultiSelectFilter
              title="Alterado por"
              placeholder="Selecionar usuário"
              options={alteradoPorOptions}
              selectedValues={filters.alteradoPor}
              onSelectionChange={(val) =>
                handleFilterChange("alteradoPor", val)
              }
              showApplyButton
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Período
            </Label>
            <DatePickerRangeCustom
              value={filters.periodo}
              onChange={(range) => handleFilterChange("periodo", range)}
              placeholder="Selecionar período"
              size="md"
              clearable
              format="dd/MM/yyyy"
              maxDate={new Date()}
            />
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => handleFilterChange(chip.key, null)}
                    className="ml-1 rounded-full p-0.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label={`Limpar ${chip.key}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({
                  tipo: [],
                  acao: [],
                  alteradoPor: [],
                  periodo: { from: null, to: null },
                });
                setCurrentPage(1);
              }}
            >
              Limpar filtros
            </ButtonCustom>
          </div>
        )}
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          illustration="myFiles"
          illustrationAlt="Ilustracao de historico vazio"
          title="Nenhum historico encontrado"
          description="Nao encontramos registros para os filtros aplicados."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Data</TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Alterado Por
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Ação</TableHead>
                <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Descrição
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                        <Calendar className="h-3 w-3 text-gray-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {formatDate(item.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatRelativeTime(item.date)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {(() => {
                      const actorName = (item.actorName || "").trim();
                      const isSystemActor =
                        !actorName || actorName.toLowerCase() === "sistema";

                      return (
                    <div className="text-sm">
                      {!isSystemActor && (
                        <div className="font-medium text-gray-900">
                          {actorName}
                        </div>
                      )}
                      <div className="mt-1">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                            getRoleBadgeColor(item.actorRole)
                          )}
                        >
                          {getRoleIcon(item.actorRole)}
                          {isSystemActor
                            ? "Sistema"
                            : item.actorRole
                            ? getRoleLabel(item.actorRole as any)
                            : "Usuario"}
                        </span>
                      </div>
                    </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className="border border-slate-200 bg-slate-50 text-slate-700">
                      {item.actionLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      className={cn(
                        "border",
                        getKindBadgeColor(item.kind)
                      )}
                    >
                      {KIND_LABELS[item.kind]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-700">
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredEvents.length)} de{" "}
            {filteredEvents.length} registros
          </div>
          <div className="flex items-center space-x-2">
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3"
            >
              Anterior
            </ButtonCustom>
            {visiblePages.map((page) => (
              <ButtonCustom
                key={page}
                variant={currentPage === page ? "primary" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="h-8 w-8 p-0"
              >
                {page}
              </ButtonCustom>
            ))}
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3"
            >
              Proxima
            </ButtonCustom>
          </div>
        </div>
      )}
    </div>
  );
}
