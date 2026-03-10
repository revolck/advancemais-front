"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Crown,
  Eye,
  PenTool,
  User,
  Users,
  X,
} from "lucide-react";

import type { TurmaProva } from "@/api/cursos";
import { getAvaliacaoStatusEfetivo } from "../../lista-atividades-provas/utils/avaliacaoStatus";
import {
  listAvaliacaoHistorico,
  listAvaliacaoRespostas,
  type AvaliacaoHistoricoActor,
  type AvaliacaoHistoricoItem,
} from "@/api/provas";
import { getRoleLabel } from "@/config/roles";
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type EventKind = "AVALIACAO" | "RESPOSTA";

type ProvaHistoryEvent = {
  id: string;
  kind: EventKind;
  tipoAvaliacao?: "ATIVIDADE" | "PROVA" | null;
  tipoAvaliacaoLabel?: string;
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
  prova: TurmaProva;
}

const KIND_LABELS: Record<EventKind, string> = {
  AVALIACAO: "Avaliação",
  RESPOSTA: "Resposta",
};

const ACTION_LABELS: Record<string, string> = {
  AVALIACAO_CRIADA: "Registro criado",
  AVALIACAO_ATUALIZADA: "Registro atualizado",
  RESPOSTA_ENVIADA: "Resposta enviada",
  RESPOSTA_CORRIGIDA: "Resposta corrigida",
  CORRECAO_MANUAL: "Correção atualizada",
  NOTA_REGISTRADA: "Nota registrada",
  NOTA_EDITADA: "Nota editada",
  RESPOSTA_REGISTRADA: "Resposta enviada",
};

const STATUS_LABELS: Record<string, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADA: "Publicada",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

const ITEMS_PER_PAGE = 10;
const TIPO_AVALIACAO_LABELS: Record<string, string> = {
  ATIVIDADE: "Atividade",
  PROVA: "Prova",
};
const UUID_REGEX =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;

const formatNotaBr = (value: unknown): string | null => {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(",", "."))
        : NaN;

  if (!Number.isFinite(num)) return null;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

const normalizeActionLabel = (action: string, actionLabel?: string) => {
  if (actionLabel?.trim()) return actionLabel.trim();
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  if (!action) return "Evento";
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
};

const normalizeKind = (item: AvaliacaoHistoricoItem): EventKind => {
  const raw = String(item.tipo || item.entidade || item.kind || "").toUpperCase();
  const action = String(item.acao || item.action || "").toUpperCase();
  if (
    raw.includes("RESPOSTA") ||
    raw.includes("CORRECAO") ||
    action.includes("RESPOSTA") ||
    action.includes("NOTA") ||
    action.includes("CORRECAO")
  ) {
    return "RESPOSTA";
  }
  return "AVALIACAO";
};

const normalizeTipoAvaliacao = (
  item: AvaliacaoHistoricoItem
): "ATIVIDADE" | "PROVA" | null => {
  const metadata = (item.metadata || {}) as Record<string, unknown>;
  const raw = String(
    item.tipoAvaliacao ||
      metadata.tipoAvaliacao ||
      metadata.avaliacaoTipo ||
      metadata.tipo ||
      ""
  ).toUpperCase();

  if (raw.includes("ATIVIDADE")) return "ATIVIDADE";
  if (raw.includes("PROVA")) return "PROVA";
  return null;
};

const extractActor = (
  item: AvaliacaoHistoricoItem,
  action: string
): { actorName?: string; actorRole?: string } => {
  const isCorrectionAction =
    action.includes("NOTA") ||
    action.includes("CORRECAO") ||
    action === "RESPOSTA_CORRIGIDA";
  const possibleActors = isCorrectionAction
    ? [item.corrigidoPor, item.ator, item.usuario, item.alteradoPor]
    : [item.ator, item.alteradoPor, item.usuario, item.corrigidoPor];

  const parseActor = (value: AvaliacaoHistoricoActor | string | null | undefined) => {
    if (!value) return null;
    if (typeof value === "string") {
      return { actorName: value, actorRole: undefined };
    }
    const actorName = value.nome || value.name || value.nomeCompleto || undefined;
    const actorRole = value.role || value.papel || undefined;
    if (!actorName && !actorRole) return null;
    return { actorName, actorRole };
  };

  for (const actor of possibleActors) {
    const parsed = parseActor(actor);
    if (parsed) return parsed;
  }

  const metadata = (item.metadata || {}) as Record<string, unknown>;
  const metaActorName =
    typeof metadata.atorNome === "string"
      ? metadata.atorNome
      : typeof metadata.alteradoPorNome === "string"
        ? metadata.alteradoPorNome
        : undefined;
  const metaActorRole =
    typeof metadata.atorRole === "string"
      ? metadata.atorRole
      : typeof metadata.alteradoPorRole === "string"
        ? metadata.alteradoPorRole
        : undefined;
  const metaCorrectorName =
    typeof metadata.corrigidoPorNome === "string"
      ? metadata.corrigidoPorNome
      : typeof metadata.corrigidoPor === "string"
        ? metadata.corrigidoPor
        : undefined;
  const metaCorrectorRole =
    typeof metadata.corrigidoPorRole === "string"
      ? metadata.corrigidoPorRole
      : undefined;

  if (isCorrectionAction && (metaCorrectorName || metaCorrectorRole)) {
    return { actorName: metaCorrectorName, actorRole: metaCorrectorRole };
  }

  if (metaActorName || metaActorRole) {
    return { actorName: metaActorName, actorRole: metaActorRole };
  }

  if (action === "RESPOSTA_ENVIADA") return { actorRole: "ALUNO_CANDIDATO" };
  return { actorName: "Sistema", actorRole: "SISTEMA" };
};

const normalizeDescription = (
  item: AvaliacaoHistoricoItem,
  action: string
): string => {
  const tipoAvaliacao = normalizeTipoAvaliacao(item);

  const metadata = (item.metadata || {}) as Record<string, unknown>;
  const codigoInscricao =
    typeof metadata.codigoInscricao === "string"
      ? metadata.codigoInscricao
      : undefined;

  const descricaoApi =
    typeof item.descricao === "string" && item.descricao.trim()
      ? item.descricao.trim()
      : typeof item.description === "string" && item.description.trim()
        ? item.description.trim()
        : "";

  if (descricaoApi) {
    if (action === "RESPOSTA_REGISTRADA" && UUID_REGEX.test(descricaoApi)) {
      return codigoInscricao
        ? `Submissão ${codigoInscricao} registrada`
        : `Submissão da ${tipoAvaliacao === "PROVA" ? "prova" : "atividade"} registrada`;
    }

    return descricaoApi;
  }

  const notaAnterior = formatNotaBr(metadata.notaAnterior);
  const notaNova = formatNotaBr(metadata.notaNova);

  if (action === "NOTA_REGISTRADA" && notaNova) {
    return `Nota registrada: ${notaNova}`;
  }

  if (action === "NOTA_EDITADA" && notaAnterior && notaNova) {
    return `Nota editada: nota antiga ${notaAnterior}, nota nova ${notaNova}`;
  }

  if (action === "CORRECAO_MANUAL") {
    return "Correção atualizada (sem alteração de nota)";
  }

  if (action === "RESPOSTA_ENVIADA" || action === "RESPOSTA_REGISTRADA") {
    return codigoInscricao
      ? `Submissão ${codigoInscricao} registrada`
      : `Submissão da ${tipoAvaliacao === "PROVA" ? "prova" : "atividade"} registrada`;
  }

  if (action === "RESPOSTA_CORRIGIDA") {
    return codigoInscricao
      ? `Submissão ${codigoInscricao} foi corrigida`
      : "Submissão corrigida";
  }

  return "Evento registrado";
};

const normalizeTipoAvaliacaoLabel = (
  item: AvaliacaoHistoricoItem,
  tipoAvaliacao: "ATIVIDADE" | "PROVA" | null
): string | undefined => {
  const metadata = (item.metadata || {}) as Record<string, unknown>;
  const rawLabel =
    typeof item.tipoAvaliacaoLabel === "string"
      ? item.tipoAvaliacaoLabel
      : typeof metadata.tipoAvaliacaoLabel === "string"
        ? String(metadata.tipoAvaliacaoLabel)
        : "";

  if (rawLabel.trim()) return rawLabel.trim();
  if (tipoAvaliacao) return TIPO_AVALIACAO_LABELS[tipoAvaliacao];
  return undefined;
};

const normalizeHistoryEvents = (items: AvaliacaoHistoricoItem[]): ProvaHistoryEvent[] => {
  return items
    .map((item, index) => {
      const date = item.ocorridoEm || item.criadoEm || item.data || item.date;
      if (!date) return null;

      const action = String(item.acao || item.action || "").toUpperCase();
      const actor = extractActor(item, action);
      const kind = normalizeKind(item);
      const tipoAvaliacao = normalizeTipoAvaliacao(item);
      const tipoAvaliacaoLabel = normalizeTipoAvaliacaoLabel(
        item,
        tipoAvaliacao
      );

      return {
        id: String(item.id || `${action || "evento"}-${date}-${index}`),
        kind,
        tipoAvaliacao,
        tipoAvaliacaoLabel,
        action,
        actionLabel: normalizeActionLabel(
          action,
          String(item.acaoLabel || item.actionLabel || "")
        ),
        description: normalizeDescription(item, action),
        date,
        actorName: actor.actorName,
        actorRole: actor.actorRole,
      } as ProvaHistoryEvent;
    })
    .filter((item): item is ProvaHistoryEvent => Boolean(item));
};

const getKindBadgeColor = (
  kind: EventKind,
  tipoAvaliacao?: "ATIVIDADE" | "PROVA" | null
): string => {
  if (tipoAvaliacao === "ATIVIDADE") {
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  }
  if (tipoAvaliacao === "PROVA") {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }
  const map: Record<EventKind, string> = {
    AVALIACAO: "bg-blue-50 text-blue-700 border-blue-200",
    RESPOSTA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return map[kind];
};

const getRoleBadgeColor = (role?: string): string => {
  const normalized = String(role || "").toUpperCase();

  const map: Record<string, string> = {
    ADMIN: "bg-red-50 text-red-700 border-red-200",
    MODERADOR: "bg-blue-50 text-blue-700 border-blue-200",
    PEDAGOGICO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INSTRUTOR: "bg-amber-50 text-amber-700 border-amber-200",
    ALUNO: "bg-violet-50 text-violet-700 border-violet-200",
    ALUNO_CANDIDATO: "bg-violet-50 text-violet-700 border-violet-200",
    SISTEMA: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return map[normalized] || "bg-gray-50 text-gray-700 border-gray-200";
};

const getRoleIcon = (role?: string) => {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "ADMIN") return <Crown className="h-3 w-3" />;
  if (normalized === "MODERADOR") return <Users className="h-3 w-3" />;
  if (normalized === "PEDAGOGICO") return <PenTool className="h-3 w-3" />;
  if (normalized === "INSTRUTOR") return <Eye className="h-3 w-3" />;
  if (normalized === "ALUNO" || normalized === "ALUNO_CANDIDATO")
    return <User className="h-3 w-3" />;
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
  if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Há ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `Há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
};

function buildBaseEvents(prova: TurmaProva): ProvaHistoryEvent[] {
  const events: ProvaHistoryEvent[] = [];
  const tipoAvaliacao =
    String(prova.tipo || "").toUpperCase() === "ATIVIDADE"
      ? "ATIVIDADE"
      : "PROVA";

  const titulo = prova.titulo || prova.nome || "Atividade/Prova";
  const createdAt = prova.criadoEm || prova.data;
  const updatedAt = prova.atualizadoEm;

  const actorName =
    prova.criadoPor?.nomeCompleto || prova.criadoPor?.nome || "Sistema";

  if (createdAt) {
    events.push({
      id: `avaliacao-criada-${prova.id}`,
      kind: "AVALIACAO",
      tipoAvaliacao,
      action: "AVALIACAO_CRIADA",
      actionLabel: ACTION_LABELS.AVALIACAO_CRIADA,
      description: `${titulo} foi cadastrada com status ${
        STATUS_LABELS[getAvaliacaoStatusEfetivo(prova)] ||
        getAvaliacaoStatusEfetivo(prova)
      }`,
      date: createdAt,
      actorName,
      actorRole: actorName === "Sistema" ? "SISTEMA" : prova.criadoPor?.role || "ADMIN",
    });
  }

  if (updatedAt && updatedAt !== createdAt) {
    events.push({
      id: `avaliacao-atualizada-${prova.id}-${updatedAt}`,
      kind: "AVALIACAO",
      tipoAvaliacao,
      action: "AVALIACAO_ATUALIZADA",
      actionLabel: ACTION_LABELS.AVALIACAO_ATUALIZADA,
      description: `Configurações da avaliação foram atualizadas`,
      date: updatedAt,
      actorName: "Sistema",
      actorRole: "SISTEMA",
    });
  }

  return events;
}

export function HistoryTab({ prova }: HistoryTabProps) {
  const [filters, setFilters] = useState<FilterValues>({
    tipo: [],
    acao: [],
    alteradoPor: [],
    periodo: { from: null, to: null },
  });
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: historicoApiResponse,
    isLoading: isLoadingHistoricoApi,
    error: historicoApiError,
  } = useQuery({
    queryKey: ["avaliacao-history-api", prova.id],
    queryFn: () =>
      listAvaliacaoHistorico(
        prova.id,
        { page: 1, pageSize: 200 },
        { cache: "no-cache" }
      ),
    enabled: Boolean(prova.id),
    staleTime: 15_000,
    retry: false,
  });

  const historicoApiEvents = useMemo<ProvaHistoryEvent[]>(
    () => normalizeHistoryEvents(historicoApiResponse || []),
    [historicoApiResponse]
  );

  const shouldLoadFallbackFromRespostas =
    Boolean(prova.id) &&
    !isLoadingHistoricoApi &&
    (historicoApiEvents.length === 0 || Boolean(historicoApiError));

  const {
    data: respostasResponse,
    isLoading: isLoadingRespostas,
    error: respostasError,
  } = useQuery({
    queryKey: ["avaliacao-history-respostas", prova.id],
    queryFn: () =>
      listAvaliacaoRespostas(prova.id, {
        page: 1,
        pageSize: 200,
        orderBy: "concluidoEm",
        order: "desc",
      }),
    enabled: shouldLoadFallbackFromRespostas,
    staleTime: 30_000,
    retry: false,
  });
  const isInitialHistoryLoading =
    isLoadingHistoricoApi ||
    (shouldLoadFallbackFromRespostas &&
      isLoadingRespostas &&
      !respostasResponse &&
      !respostasError);

  const respostaEvents = useMemo<ProvaHistoryEvent[]>(() => {
    const data = respostasResponse?.data;
    if (!Array.isArray(data) || data.length === 0) return [];

    const events: ProvaHistoryEvent[] = [];
    const tipoAvaliacaoDefault =
      String(prova.tipo || "").toUpperCase() === "ATIVIDADE"
        ? "ATIVIDADE"
        : "PROVA";

    data.forEach((item) => {
      const tipoAvaliacao =
        String(item.tipoAvaliacao || "").toUpperCase() === "ATIVIDADE"
          ? "ATIVIDADE"
          : tipoAvaliacaoDefault;
      if (item.concluidoEm) {
        events.push({
          id: `resposta-enviada-${item.id}`,
          kind: "RESPOSTA",
          tipoAvaliacao,
          tipoAvaliacaoLabel: TIPO_AVALIACAO_LABELS[tipoAvaliacao],
          action: "RESPOSTA_ENVIADA",
          actionLabel: ACTION_LABELS.RESPOSTA_ENVIADA,
          description: `Submissão ${item.codigoInscricao || item.id.slice(0, 8)} registrada`,
          date: item.concluidoEm,
          actorName: item.aluno?.nomeCompleto || "Aluno",
          actorRole: "ALUNO_CANDIDATO",
        });
      }

      if (item.corrigidoEm) {
        events.push({
          id: `resposta-corrigida-${item.id}`,
          kind: "RESPOSTA",
          tipoAvaliacao,
          tipoAvaliacaoLabel: TIPO_AVALIACAO_LABELS[tipoAvaliacao],
          action: "RESPOSTA_CORRIGIDA",
          actionLabel: ACTION_LABELS.RESPOSTA_CORRIGIDA,
          description: `Submissão ${item.codigoInscricao || item.id.slice(0, 8)} foi corrigida`,
          date: item.corrigidoEm,
          actorName: item.corrigidoPor?.nome || "Sistema",
          actorRole: item.corrigidoPor?.role || "SISTEMA",
        });
      }
    });

    return events;
  }, [respostasResponse?.data, prova.tipo]);

  const allEvents = useMemo(() => {
    const hasAvaliacaoEventsFromApi = historicoApiEvents.some(
      (event) => event.kind === "AVALIACAO"
    );
    const sourceEvents =
      historicoApiEvents.length > 0 ? historicoApiEvents : respostaEvents;
    const baseEvents = hasAvaliacaoEventsFromApi ? [] : buildBaseEvents(prova);

    return [...baseEvents, ...sourceEvents].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return bTime - aTime;
    });
  }, [prova, respostaEvents, historicoApiEvents]);

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

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
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

  if (isInitialHistoryLoading) {
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

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="grid grid-cols-5 gap-4 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`history-row-skeleton-${idx}`} className="grid grid-cols-5 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
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
        illustrationAlt="Ilustração de histórico vazio"
        title="Nenhum histórico encontrado"
        description="Não há registros desta atividade/prova no momento."
        maxContentWidth="md"
        className="rounded-2xl border border-gray-200/60 bg-white p-8"
      />
    );
  }

  return (
    <div className="space-y-6">
      {(historicoApiError || respostasError) && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            Parte do histórico não foi carregada. Os demais eventos continuam
            disponíveis.
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
            <Label className="text-sm font-semibold text-gray-700">Alterado por</Label>
            <MultiSelectFilter
              title="Alterado por"
              placeholder="Selecionar usuário"
              options={alteradoPorOptions}
              selectedValues={filters.alteradoPor}
              onSelectionChange={(val) => handleFilterChange("alteradoPor", val)}
              showApplyButton
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Período</Label>
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
          illustrationAlt="Ilustração de histórico vazio"
          title="Nenhum histórico encontrado"
          description="Não encontramos registros para os filtros aplicados."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Data</TableHead>
                <TableHead className="font-semibold text-gray-700">Alterado por</TableHead>
                <TableHead className="font-semibold text-gray-700">Ação</TableHead>
                <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                <TableHead className="font-semibold text-gray-700">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((item) => {
                const actorName = (item.actorName || "").trim();
                const isSystemActor = !actorName || actorName.toLowerCase() === "sistema";
                const normalizedRole = String(item.actorRole || "").toUpperCase();
                const tipoBadgeLabel =
                  item.tipoAvaliacaoLabel ||
                  (item.tipoAvaliacao
                    ? TIPO_AVALIACAO_LABELS[item.tipoAvaliacao]
                    : KIND_LABELS[item.kind]);

                return (
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
                          <div className="font-medium text-gray-900">{formatDate(item.date)}</div>
                          <div className="text-xs text-gray-500">{formatRelativeTime(item.date)}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="text-sm">
                        {!isSystemActor && (
                          <div className="font-medium text-gray-900">{actorName}</div>
                        )}
                        <div className="mt-1">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                              getRoleBadgeColor(isSystemActor ? "SISTEMA" : normalizedRole)
                            )}
                          >
                            {getRoleIcon(isSystemActor ? "SISTEMA" : normalizedRole)}
                            {isSystemActor
                              ? "Sistema"
                              : normalizedRole
                              ? getRoleLabel(normalizedRole)
                              : "Usuário"}
                          </span>
                        </div>
                      </div>
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
                          getKindBadgeColor(item.kind, item.tipoAvaliacao)
                        )}
                      >
                        {tipoBadgeLabel}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 text-sm text-gray-700">
                      {item.description}
                    </TableCell>
                  </TableRow>
                );
              })}
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
              Próxima
            </ButtonCustom>
          </div>
        </div>
      )}
    </div>
  );
}
