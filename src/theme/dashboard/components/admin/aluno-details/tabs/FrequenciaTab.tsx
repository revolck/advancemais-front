"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  History,
  Loader2,
  PenSquare,
  XCircle,
} from "lucide-react";

import {
  listFrequenciasByAluno,
  listFrequenciaHistoricoByAluno,
  listFrequenciaHistoricoByAlunoNaturalKey,
  upsertFrequenciaLancamentoByAluno,
  type Frequencia,
  type FrequenciaHistoryEntry,
  type FrequenciaOrigemTipo,
  type FrequenciaStatus,
  type ListFrequenciasResponse,
} from "@/api/cursos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ButtonCustom,
  EmptyState,
  FilterBar,
  toastCustom,
} from "@/components/ui/custom";
import { FrequenciaConfirmModal } from "../../lista-frequencia/components/FrequenciaConfirmModal";
import { FrequenciaHistoryModal } from "../../lista-frequencia/components/FrequenciaHistoryModal";
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
import { useAulasForSelect } from "../../lista-frequencia/hooks/useAulasForSelect";
import { useAvaliacoesForSelect } from "../../lista-frequencia/hooks/useAvaliacoesForSelect";
import { EvidenceCell } from "../../lista-frequencia/components/EvidenceCell";
import type { FrequenciaListItem } from "../../lista-frequencia/hooks/useFrequenciaDashboardQuery";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface AlunoFrequenciaItem extends FrequenciaListItem {
  atualizadoEm?: string | null;
  acaoFrequencia?: {
    podeMarcarPresente?: boolean;
    podeMarcarAusente?: boolean;
    podeEditar?: boolean;
    podeVerHistorico?: boolean;
    bloqueado?: boolean;
    motivoBloqueio?: string | null;
  };
}

function parseFrequenciasResponse(response: ListFrequenciasResponse): Frequencia[] {
  const raw = response as any;

  return (
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.data?.data) && raw.data.data) ||
    (Array.isArray(raw?.data?.data?.items) && raw.data.data.items) ||
    (Array.isArray(raw?.items) && raw.items) ||
    []
  );
}

function mapFrequenciaToListItem(
  freq: Frequencia,
  fallback: {
    cursoNomeById: Map<string, string>;
    turmaNomeById: Map<string, string>;
    turmaCodigoById: Map<string, string | null>;
  }
): AlunoFrequenciaItem {
  const rawFreq = freq as Frequencia & {
    cursoNome?: string | null;
    turmaNome?: string | null;
    turmaCodigo?: string | null;
    curso?: { nome?: string | null };
    turma?: { nome?: string | null; codigo?: string | null };
    acaoFrequencia?: AlunoFrequenciaItem["acaoFrequencia"];
  };

  const tipoOrigem = freq.tipoOrigem ?? "AULA";
  const origemId = freq.origemId ?? freq.aulaId ?? null;
  const alunoNome =
    freq.alunoNome ??
    freq.aluno?.nomeCompleto ??
    freq.aluno?.nome ??
    "—";

  const fallbackKey = `${freq.turmaId}::${freq.inscricaoId}::${tipoOrigem}::${
    origemId ?? "sem-origem"
  }`;

  return {
    id: freq.id,
    syntheticId: freq.syntheticId ?? null,
    isPersisted: freq.isPersisted,
    key: freq.id ?? freq.syntheticId ?? fallbackKey,
    cursoId: freq.cursoId,
    cursoNome:
      rawFreq.cursoNome ??
      rawFreq.curso?.nome ??
      fallback.cursoNomeById.get(freq.cursoId) ??
      null,
    turmaId: freq.turmaId,
    turmaNome:
      rawFreq.turmaNome ??
      rawFreq.turma?.nome ??
      fallback.turmaNomeById.get(freq.turmaId) ??
      null,
    turmaCodigo:
      rawFreq.turmaCodigo ??
      rawFreq.turma?.codigo ??
      fallback.turmaCodigoById.get(freq.turmaId) ??
      null,
    aulaId: freq.aulaId ?? null,
    tipoOrigem,
    origemId,
    origemTitulo: freq.origemTitulo ?? null,
    inscricaoId: freq.inscricaoId,
    alunoId: freq.aluno?.id ?? freq.alunoId ?? freq.inscricaoId,
    alunoNome,
    alunoCodigo: freq.aluno?.codigo ?? null,
    alunoCpf: freq.aluno?.cpf ?? null,
    avatarUrl: freq.aluno?.avatarUrl ?? null,
    statusAtual: freq.status,
    modoLancamento: freq.modoLancamento,
    minutosPresenca: freq.minutosPresenca ?? null,
    minimoMinutosParaPresenca: freq.minimoMinutosParaPresenca ?? null,
    justificativa: freq.justificativa,
    observacoes: freq.observacoes,
    dataReferencia: freq.dataReferencia ?? null,
    atualizadoEm:
      freq.atualizadoEm ?? freq.lancadoEm ?? freq.criadoEm ?? null,
    naturalKey:
      freq.naturalKey ??
      (origemId
        ? {
            inscricaoId: freq.inscricaoId,
            tipoOrigem,
            origemId,
          }
        : undefined),
    evidence: {
      acessou: freq.evidencia?.acessou,
      primeiroAcessoEm: freq.evidencia?.primeiroAcessoEm ?? null,
      ultimoAcessoEm: freq.evidencia?.ultimoAcessoEm ?? null,
      minutosEngajados:
        typeof freq.evidencia?.minutosEngajados === "number"
          ? freq.evidencia.minutosEngajados
          : freq.minutosPresenca ?? null,
      respondeu: freq.evidencia?.respondeu,
      statusSugerido: freq.evidencia?.statusSugerido,
    },
    acaoFrequencia: rawFreq.acaoFrequencia,
  };
}

function getStatusBadge(status: FrequenciaStatus) {
  switch (status) {
    case "PRESENTE":
      return {
        label: "Presente",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    case "AUSENTE":
      return {
        label: "Ausente",
        className: "bg-red-100 text-red-700 border-red-200",
      };
    case "JUSTIFICADO":
      return {
        label: "Justificado",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case "ATRASADO":
      return {
        label: "Atrasado",
        className: "bg-orange-100 text-orange-700 border-orange-200",
      };
    default:
      return {
        label: "Pendente",
        className: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

function getTipoBadge(tipo: FrequenciaOrigemTipo) {
  if (tipo === "PROVA") {
    return {
      label: "Prova",
      className: "bg-indigo-100 text-indigo-700 border-indigo-200",
      icon: ClipboardList,
    };
  }

  if (tipo === "ATIVIDADE") {
    return {
      label: "Atividade",
      className: "bg-violet-100 text-violet-700 border-violet-200",
      icon: PenSquare,
    };
  }

  return {
    label: "Aula",
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
    icon: BookOpen,
  };
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

export function FrequenciaTab({ aluno, inscricoes, isLoading }: InscricoesTabProps) {
  const queryClient = useQueryClient();
  const hasAutoSelectedCursoRef = useRef(false);
  const hasAutoSelectedTurmaRef = useRef(false);

  const [selectedCursoId, setSelectedCursoId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedOrigemTipo, setSelectedOrigemTipo] =
    useState<FrequenciaOrigemTipo | null>(null);
  const [selectedOrigemId, setSelectedOrigemId] = useState<string | null>(null);
  const [pendingSearch, setPendingSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<AlunoFrequenciaItem | null>(null);
  const [pendingStatus, setPendingStatus] = useState<FrequenciaStatus | null>(null);
  const [pendingMotivo, setPendingMotivo] = useState("");
  const [pendingItem, setPendingItem] = useState<AlunoFrequenciaItem | null>(null);
  const pageSize = 10;

  const inscricoesValidas = useMemo(
    () =>
      (inscricoes && inscricoes.length > 0 ? inscricoes : aluno.inscricoes).filter(
        (inscricao) => inscricao.curso?.id && inscricao.turma?.id && inscricao.id
      ),
    [aluno.inscricoes, inscricoes]
  );

  const cursoNomeById = useMemo(() => {
    const map = new Map<string, string>();
    inscricoesValidas.forEach((inscricao) => {
      const cursoId = inscricao.curso?.id;
      if (!cursoId || map.has(cursoId)) return;
      map.set(cursoId, inscricao.curso?.nome || cursoId);
    });
    return map;
  }, [inscricoesValidas]);

  const turmaNomeById = useMemo(() => {
    const map = new Map<string, string>();
    inscricoesValidas.forEach((inscricao) => {
      const turmaId = inscricao.turma?.id;
      if (!turmaId || map.has(turmaId)) return;
      map.set(turmaId, inscricao.turma?.nome || turmaId);
    });
    return map;
  }, [inscricoesValidas]);

  const turmaCodigoById = useMemo(() => {
    const map = new Map<string, string | null>();
    inscricoesValidas.forEach((inscricao) => {
      const turmaId = inscricao.turma?.id;
      if (!turmaId || map.has(turmaId)) return;
      map.set(turmaId, inscricao.turma?.codigo || null);
    });
    return map;
  }, [inscricoesValidas]);

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
  }, [cursosOptions, selectedCursoId]);

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
    setSelectedTurmaId(null);
    setSelectedOrigemTipo(null);
    setSelectedOrigemId(null);
    hasAutoSelectedTurmaRef.current = false;
  }, [selectedCursoId]);

  useEffect(() => {
    if (hasAutoSelectedTurmaRef.current) return;
    if (!selectedCursoId) return;
    if (selectedTurmaId) return;
    if (turmaOptions.length === 0) return;
    setSelectedTurmaId(turmaOptions[0].value);
    hasAutoSelectedTurmaRef.current = true;
  }, [selectedCursoId, selectedTurmaId, turmaOptions]);

  const aulasQuery = useAulasForSelect({ turmaId: selectedTurmaId });
  const provasQuery = useAvaliacoesForSelect({
    cursoId: selectedCursoId,
    turmaId: selectedTurmaId,
    tipo: "PROVA",
  });
  const atividadesQuery = useAvaliacoesForSelect({
    cursoId: selectedCursoId,
    turmaId: selectedTurmaId,
    tipo: "ATIVIDADE",
  });

  const origemTipoOptions = useMemo(
    () => [
      { value: "AULA", label: "Aula" },
      { value: "PROVA", label: "Prova" },
      { value: "ATIVIDADE", label: "Atividade" },
    ],
    []
  );

  const origemOptions = useMemo(() => {
    if (selectedOrigemTipo === "PROVA") return provasQuery.options;
    if (selectedOrigemTipo === "ATIVIDADE") return atividadesQuery.options;
    if (selectedOrigemTipo === "AULA") return aulasQuery.options;
    return [];
  }, [
    atividadesQuery.options,
    aulasQuery.options,
    provasQuery.options,
    selectedOrigemTipo,
  ]);

  useEffect(() => {
    setSelectedOrigemId(null);
  }, [selectedOrigemTipo, selectedTurmaId]);

  const hasTurmaFilter = Boolean(selectedCursoId && selectedTurmaId);
  const frequenciasQuery = useQuery<AlunoFrequenciaItem[], Error>({
    queryKey: [
      "aluno-frequencias",
      aluno.id,
      selectedCursoId,
      selectedTurmaId,
      selectedOrigemTipo,
      selectedOrigemId,
      appliedSearch,
    ],
    enabled: inscricoesValidas.length > 0 && hasTurmaFilter,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      const response = await listFrequenciasByAluno(aluno.id, {
        cursoId: selectedCursoId ?? undefined,
        turmaIds: selectedTurmaId ?? undefined,
        tipoOrigem: selectedOrigemTipo ?? undefined,
        origemId: selectedOrigemId ?? undefined,
        search: appliedSearch || undefined,
        orderBy: "atualizadoEm",
        order: "desc",
        page: 1,
        pageSize: 200,
      });

      return parseFrequenciasResponse(response).map((freq) =>
        mapFrequenciaToListItem(freq, {
          cursoNomeById,
          turmaNomeById,
          turmaCodigoById,
        })
      );
    },
  });

  const frequencias = useMemo(() => frequenciasQuery.data ?? [], [frequenciasQuery.data]);
  const isTabLoading = isLoading || frequenciasQuery.isLoading;

  const updateFrequenciaMutation = useMutation<
    Frequencia,
    Error,
    {
      item: AlunoFrequenciaItem;
      status: FrequenciaStatus;
      motivo?: string | null;
    }
  >({
    mutationFn: async ({ item, status, motivo }) =>
      upsertFrequenciaLancamentoByAluno(aluno.id, {
        cursoId: item.cursoId,
        turmaId: item.turmaId,
        inscricaoId: item.inscricaoId,
        tipoOrigem: item.tipoOrigem,
        origemId: item.origemId ?? item.aulaId ?? "",
        status,
        justificativa: status === "AUSENTE" ? motivo ?? null : null,
        observacoes: null,
        modoLancamento: "MANUAL",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["aluno-frequencias", aluno.id],
      });
    },
  });

  const historyQuery = useQuery<FrequenciaHistoryEntry[], Error>({
    queryKey: [
      "aluno-frequencia-history",
      aluno.id,
      historyTarget?.id ?? null,
      historyTarget?.key ?? null,
    ],
    enabled: historyOpen && Boolean(historyTarget),
    queryFn: async () => {
      if (!historyTarget) return [];

      if (historyTarget.id) {
        return listFrequenciaHistoricoByAluno(aluno.id, historyTarget.id);
      }

      if (
        !historyTarget.naturalKey ||
        !historyTarget.cursoId ||
        !historyTarget.turmaId
      ) {
        return [];
      }

      return listFrequenciaHistoricoByAlunoNaturalKey(aluno.id, {
        cursoId: historyTarget.cursoId,
        turmaId: historyTarget.turmaId,
        inscricaoId: historyTarget.naturalKey.inscricaoId,
        tipoOrigem: historyTarget.naturalKey.tipoOrigem,
        origemId: historyTarget.naturalKey.origemId,
      });
    },
    staleTime: 0,
  });

  const historyItems = useMemo(
    () =>
      (historyQuery.data ?? []).map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus ?? "PENDENTE",
        toStatus: entry.toStatus,
        fromMotivo: entry.fromMotivo ?? null,
        toMotivo: entry.toMotivo ?? entry.motivo ?? null,
        changedAt: entry.changedAt,
        actorId: entry.actor?.id ?? entry.actorId ?? null,
        actorName: entry.actor?.nome ?? entry.actorName ?? null,
        actorRole:
          entry.actor?.roleLabel ??
          entry.actor?.role ??
          entry.actorRole ??
          null,
        overrideReason: entry.overrideReason ?? null,
      })),
    [historyQuery.data]
  );

  useEffect(() => {
    if (!historyQuery.isError) return;
    toastCustom.error(
      historyQuery.error?.message || "Não foi possível carregar o histórico."
    );
  }, [historyQuery.error, historyQuery.isError]);

  const pendingMotivoTrimmed = useMemo(() => pendingMotivo.trim(), [pendingMotivo]);

  const openConfirm = (item: AlunoFrequenciaItem, nextStatus: FrequenciaStatus) => {
    const canPerform =
      nextStatus === "PRESENTE"
        ? item.acaoFrequencia?.podeMarcarPresente ?? item.acaoFrequencia?.podeEditar ?? true
        : item.acaoFrequencia?.podeMarcarAusente ?? item.acaoFrequencia?.podeEditar ?? true;

    if (!canPerform || item.acaoFrequencia?.bloqueado) {
      toastCustom.warning(
        item.acaoFrequencia?.motivoBloqueio || "Ação de frequência indisponível."
      );
      return;
    }

    setPendingItem(item);
    setPendingStatus(nextStatus);
    setPendingMotivo(nextStatus === "AUSENTE" ? item.justificativa ?? "" : "");
    setConfirmOpen(true);
  };

  const openHistory = (item: AlunoFrequenciaItem) => {
    const canSeeHistory = item.acaoFrequencia?.podeVerHistorico ?? true;
    if (!canSeeHistory) {
      toastCustom.warning(
        item.acaoFrequencia?.motivoBloqueio || "Histórico indisponível para este registro."
      );
      return;
    }
    setHistoryTarget(item);
    setHistoryOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingItem || !pendingStatus) return;

    if (pendingStatus === "AUSENTE" && pendingMotivoTrimmed.length === 0) {
      toastCustom.error("Informe o motivo da ausência.");
      return;
    }

    try {
      await updateFrequenciaMutation.mutateAsync({
        item: pendingItem,
        status: pendingStatus,
        motivo: pendingStatus === "AUSENTE" ? pendingMotivoTrimmed : null,
      });
      toastCustom.success("Frequência salva com sucesso.");
      setConfirmOpen(false);
      setPendingItem(null);
      setPendingStatus(null);
      setPendingMotivo("");
    } catch (error) {
      toastCustom.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a frequência."
      );
    }
  };

  const filteredFrequencias = useMemo(
    () =>
      [...frequencias].sort((a, b) => {
        const aDate = a.atualizadoEm ? new Date(a.atualizadoEm).getTime() : 0;
        const bDate = b.atualizadoEm ? new Date(b.atualizadoEm).getTime() : 0;
        return bDate - aDate;
      }),
    [frequencias]
  );

  const resumo = useMemo(() => {
    const total = filteredFrequencias.length;
    const presentes = filteredFrequencias.filter(
      (item) => item.statusAtual === "PRESENTE" || item.statusAtual === "ATRASADO"
    ).length;
    const lancadas = filteredFrequencias.filter(
      (item) => item.statusAtual !== "PENDENTE"
    ).length;
    const taxaPresenca = lancadas > 0 ? (presentes / lancadas) * 100 : null;

    const ultimaAtualizacao =
      filteredFrequencias
        .map((item) => (item.atualizadoEm ? new Date(item.atualizadoEm).getTime() : 0))
        .filter((timestamp) => Number.isFinite(timestamp) && timestamp > 0)
        .sort((a, b) => b - a)[0] ?? null;

    return {
      total,
      lancadas,
      presentes,
      taxaPresenca,
      ultimaAtualizacao,
    };
  }, [filteredFrequencias]);

  useEffect(() => {
    setPage(1);
  }, [selectedCursoId, selectedTurmaId, selectedOrigemTipo, selectedOrigemId, appliedSearch]);

  const totalItems = filteredFrequencias.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () =>
      filteredFrequencias.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [currentPage, filteredFrequencias]
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

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        options: cursosOptions,
        placeholder: "Selecionar curso",
      },
      {
        key: "turmaId",
        label: "Turma",
        options: turmaOptions,
        placeholder: "Selecionar turma",
        disabled: !selectedCursoId,
        emptyPlaceholder: "Sem turmas disponíveis",
      },
      {
        key: "origemTipo",
        label: "Tipo de origem",
        options: origemTipoOptions,
        placeholder: "Selecionar",
        disabled: !selectedTurmaId,
      },
      {
        key: "origemId",
        label: "Origem",
        options: origemOptions,
        placeholder: !selectedOrigemTipo
          ? "Selecione o tipo de origem"
          : "Selecionar",
        disabled:
          !selectedTurmaId ||
          !selectedOrigemTipo ||
          aulasQuery.isLoading ||
          provasQuery.isLoading ||
          atividadesQuery.isLoading,
        emptyPlaceholder: selectedOrigemTipo
          ? "Sem opções disponíveis"
          : "Selecione o tipo de origem primeiro",
      },
    ],
    [
      atividadesQuery.isLoading,
      aulasQuery.isLoading,
      cursosOptions,
      origemOptions,
      origemTipoOptions,
      provasQuery.isLoading,
      selectedCursoId,
      selectedOrigemTipo,
      selectedTurmaId,
      turmaOptions,
    ]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCursoId,
      turmaId: selectedTurmaId,
      origemTipo: selectedOrigemTipo,
      origemId: selectedOrigemId,
    }),
    [selectedCursoId, selectedOrigemId, selectedOrigemTipo, selectedTurmaId]
  );

  const filterGridClassName = useMemo(
    () =>
      [
        "lg:grid-cols-12 lg:gap-3 xl:gap-4",
        "lg:[&>*:nth-child(1)]:row-start-1 lg:[&>*:nth-child(1)]:col-start-1 lg:[&>*:nth-child(1)]:col-span-12",
        "lg:[&>*:nth-child(2)]:row-start-2 lg:[&>*:nth-child(2)]:col-start-1 lg:[&>*:nth-child(2)]:col-span-6",
        "lg:[&>*:nth-child(3)]:row-start-2 lg:[&>*:nth-child(3)]:col-start-7 lg:[&>*:nth-child(3)]:col-span-6",
        "lg:[&>*:nth-child(4)]:row-start-3 lg:[&>*:nth-child(4)]:col-start-1 lg:[&>*:nth-child(4)]:col-span-3",
        "lg:[&>*:nth-child(5)]:row-start-3 lg:[&>*:nth-child(5)]:col-start-4 lg:[&>*:nth-child(5)]:col-span-7",
        "lg:[&>*:nth-child(6)]:row-start-3 lg:[&>*:nth-child(6)]:col-start-11 lg:[&>*:nth-child(6)]:col-span-2",
      ].join(" "),
    []
  );

  if (isTabLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (frequenciasQuery.isError && hasTurmaFilter) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {frequenciasQuery.error?.message ??
            "Não foi possível carregar as frequências do aluno."}
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
        description="Este aluno ainda não possui cursos/turmas vinculados para exibir frequência."
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
                <p className="text-sm! font-medium! text-slate-700! mb-1!">
                  Taxa de presença
                </p>
                <p className="text-xl! font-semibold! text-slate-900! mb-0!">
                  {resumo.taxaPresenca === null
                    ? "—"
                    : `${Math.round(resumo.taxaPresenca)}%`}
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1 text-sm! text-slate-500! mb-0!">
              Presentes: {resumo.presentes} de {resumo.lancadas} lançamentos
            </p>
          </article>

          <article className="rounded-xl border border-violet-100 bg-violet-50/40 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm! font-medium! text-slate-700! mb-1!">
                  Registros
                </p>
                <p className="text-xl! font-semibold! text-slate-900! mb-0!">
                  {resumo.total}
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <ClipboardList className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1 text-sm! text-slate-500! mb-0!">
              Total de frequências para os filtros aplicados
            </p>
          </article>

          <article className="rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm! font-medium! text-slate-700! mb-1!">
                  Atualizado em
                </p>
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
        fields={filterFields}
        values={filterValues}
        gridClassName={filterGridClassName}
        rightActionsClassName="lg:justify-stretch lg:items-stretch xl:flex-row xl:justify-stretch xl:items-stretch"
        onChange={(key, value) => {
          if (key === "cursoId") {
            setSelectedCursoId((value as string) || null);
          }
          if (key === "turmaId") {
            setSelectedTurmaId((value as string) || null);
          }
          if (key === "origemTipo") {
            setSelectedOrigemTipo((value as FrequenciaOrigemTipo) || null);
            setSelectedOrigemId(null);
          }
          if (key === "origemId") {
            setSelectedOrigemId((value as string) || null);
          }
        }}
        onClearAll={() => {
          setSelectedCursoId(null);
          setSelectedTurmaId(null);
          setSelectedOrigemTipo(null);
          setSelectedOrigemId(null);
          setPendingSearch("");
          setAppliedSearch("");
          setPage(1);
          hasAutoSelectedCursoRef.current = false;
          hasAutoSelectedTurmaRef.current = false;
        }}
        search={{
          label: "Pesquisar conteúdo",
          value: pendingSearch,
          onChange: setPendingSearch,
          placeholder:
            "Buscar por nome da aula, atividade, prova, curso ou turma...",
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
            className="w-full"
          >
            Pesquisar
          </ButtonCustom>
        }
      />

      {!hasTurmaFilter ? (
        <EmptyState
          illustration="books"
          illustrationAlt="Selecione curso e turma"
          title="Selecione curso e turma"
          description="A frequência será exibida após selecionar um curso e uma turma."
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      ) : filteredFrequencias.length === 0 ? (
        <EmptyState
          illustration="books"
          illustrationAlt="Sem frequência"
          title="Nenhuma frequência encontrada"
          description="Não há registros de frequência para os filtros selecionados."
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <Table className="min-w-[1160px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="py-4 px-3 font-medium text-gray-700">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="py-4 px-3 font-medium text-gray-700">
                    Tipo
                  </TableHead>
                  <TableHead className="py-4 px-3 font-medium text-gray-700">
                    Evidência
                  </TableHead>
                  <TableHead className="py-4 px-3 text-center font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="py-4 px-3 font-medium text-gray-700 w-[320px]">
                    Motivo
                  </TableHead>
                  <TableHead className="py-4 px-3 text-right font-medium text-gray-700">
                    Frequência
                  </TableHead>
                  <TableHead className="py-4 px-3 text-center font-medium text-gray-700">
                    Atualizado em
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((item) => {
                  const status = getStatusBadge(item.statusAtual);
                  const tipo = getTipoBadge(item.tipoOrigem);
                  const TipoIcon = tipo.icon;
                  const aula =
                    item.tipoOrigem === "AULA"
                      ? aulasQuery.itemById.get(item.origemId ?? item.aulaId ?? "") ??
                        null
                      : null;
                  const motivo = item.justificativa?.trim() || "";
                  const isPresent =
                    item.statusAtual === "PRESENTE" || item.statusAtual === "ATRASADO";
                  const isAbsent =
                    item.statusAtual === "AUSENTE" || item.statusAtual === "JUSTIFICADO";
                  const canMarcarPresente =
                    item.acaoFrequencia?.podeMarcarPresente ??
                    item.acaoFrequencia?.podeEditar ??
                    true;
                  const canMarcarAusente =
                    item.acaoFrequencia?.podeMarcarAusente ??
                    item.acaoFrequencia?.podeEditar ??
                    true;
                  const canVerHistorico = item.acaoFrequencia?.podeVerHistorico ?? true;
                  const isRowSaving =
                    updateFrequenciaMutation.isPending &&
                    updateFrequenciaMutation.variables?.item.key === item.key;

                  return (
                    <TableRow key={item.key} className="border-gray-100">
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

                      <TableCell className="py-4 px-3">
                        <Badge
                          variant="outline"
                          className={cn("font-medium text-xs inline-flex items-center gap-1.5", tipo.className)}
                        >
                          <TipoIcon className="h-3.5 w-3.5" />
                          {tipo.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 px-3">
                        <EvidenceCell aula={aula} item={item} />
                      </TableCell>

                      <TableCell className="py-4 px-3 text-center">
                        <Badge
                          variant="outline"
                          className={cn("text-xs font-medium", status.className)}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 px-3">
                        {motivo ? (
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="cursor-default">
                                <p className="line-clamp-2 text-sm text-gray-800 break-words">
                                  {motivo}
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8} className="max-w-lg">
                              <div className="space-y-1">
                                <div className="text-xs font-semibold">Motivo</div>
                                <div className="text-xs whitespace-pre-wrap break-words">
                                  {motivo}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4 px-3">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openConfirm(item, "PRESENTE")}
                                disabled={!canMarcarPresente || isRowSaving}
                                className={cn(
                                  "h-8 w-8 rounded-full cursor-pointer border transition-all",
                                  isPresent
                                    ? "text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700"
                                    : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:text-white hover:bg-emerald-600 hover:border-emerald-600",
                                  isPresent && "ring-2 ring-emerald-200 ring-offset-1",
                                  (!canMarcarPresente || isRowSaving) &&
                                    "opacity-50 cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                )}
                              >
                                <span className="sr-only">Marcar presença</span>
                                {isRowSaving && pendingStatus === "PRESENTE" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>Presente</TooltipContent>
                          </Tooltip>

                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openConfirm(item, "AUSENTE")}
                                disabled={!canMarcarAusente || isRowSaving}
                                className={cn(
                                  "h-8 w-8 rounded-full cursor-pointer border transition-all",
                                  isAbsent
                                    ? "text-white bg-red-600 border-red-600 hover:bg-red-700 hover:text-white hover:border-red-700"
                                    : "text-red-600 bg-red-50 border-red-200 hover:text-white hover:bg-red-600 hover:border-red-600",
                                  isAbsent && "ring-2 ring-red-200 ring-offset-1",
                                  (!canMarcarAusente || isRowSaving) &&
                                    "opacity-50 cursor-not-allowed hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                )}
                              >
                                <span className="sr-only">Marcar ausência</span>
                                {isRowSaving && pendingStatus === "AUSENTE" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>Ausente</TooltipContent>
                          </Tooltip>

                          {canVerHistorico ? (
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openHistory(item)}
                                  className="h-8 w-8 rounded-full cursor-pointer border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                >
                                  <span className="sr-only">Histórico</span>
                                  <History className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={8}>Histórico</TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-3 text-center text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(item.atualizadoEm)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalItems > 0 && totalPages > 1 ? (
            <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                {Math.min(currentPage * pageSize, totalItems)} de {totalItems}
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

      <FrequenciaConfirmModal
        isOpen={confirmOpen}
        onOpenChange={(open) => {
          if (!open && updateFrequenciaMutation.isPending) return;
          setConfirmOpen(open);
          if (!open) {
            setPendingItem(null);
            setPendingStatus(null);
            setPendingMotivo("");
          }
        }}
        currentStatus={pendingItem?.statusAtual ?? "PENDENTE"}
        pendingStatus={pendingStatus}
        isOverrideFlow={Boolean(
          pendingItem &&
            pendingStatus &&
            pendingItem.statusAtual !== "PENDENTE" &&
            pendingItem.statusAtual !== pendingStatus
        )}
        pendingMotivo={pendingMotivo}
        onChangeMotivo={setPendingMotivo}
        confirmDisabled={
          !pendingStatus ||
          (pendingStatus === "AUSENTE" && pendingMotivoTrimmed.length === 0)
        }
        isSaving={updateFrequenciaMutation.isPending}
        onConfirm={handleConfirmSubmit}
      />

      <FrequenciaHistoryModal
        isOpen={historyOpen}
        onClose={() => {
          setHistoryOpen(false);
          setHistoryTarget(null);
        }}
        alunoNome={aluno.nomeCompleto || aluno.nome || "Aluno"}
        aulaNome={historyTarget?.origemTitulo ?? null}
        history={historyItems}
        isLoading={historyQuery.isLoading || historyQuery.isFetching}
      />
    </div>
  );
}
