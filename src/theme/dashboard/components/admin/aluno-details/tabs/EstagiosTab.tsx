"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getEstagioByAluno,
  listEstagioFrequenciasByAluno,
  listEstagioFrequenciasPeriodoByAluno,
  listEstagioFrequenciaHistoricoByAlunoPaginado,
  listEstagiosByAluno,
  upsertEstagioFrequenciaLancamentoByAluno,
  type Estagio,
  type EstagioStatus,
  type EstagioFrequencia,
  type FrequenciaHistoryEntry,
} from "@/api/cursos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ButtonCustom,
  EmptyState,
  EstagioAttendanceByDate,
  FilterBar,
  HorizontalTabs,
  toastCustom,
} from "@/components/ui/custom";
import type { FilterField } from "@/components/ui/custom/filters";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { FrequenciaHistoryModal } from "../../lista-frequencia/components/FrequenciaHistoryModal";
import type { InscricoesTabProps } from "../types";
import { formatDate } from "../utils/formatters";

type ViewMode = "DIARIA" | "PERIODO";
type ActionStatus = "PRESENTE" | "AUSENTE";

interface PendingAction {
  item: EstagioFrequencia;
  status: ActionStatus;
}

interface AlunoEstagioOption {
  id: string;
  titulo: string;
  status?: string | null;
}

function formatDateOnly(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function formatStatus(status?: string | null) {
  switch ((status || "").toUpperCase()) {
    case "PRESENTE":
      return {
        label: "Presente",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "AUSENTE":
      return {
        label: "Ausente",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    default:
      return {
        label: "Pendente",
        className: "bg-violet-50 text-violet-700 border-violet-200",
      };
  }
}

function getTodayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toIsoDate(value: Date): string {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getDefaultReferenceDate(calendarioObrigatorio: string[]): string | null {
  if (calendarioObrigatorio.length === 0) return null;

  const todayIso = getTodayIso();
  if (calendarioObrigatorio.includes(todayIso)) return todayIso;

  const pastDates = calendarioObrigatorio.filter((date) => date < todayIso);
  if (pastDates.length > 0) return pastDates[pastDates.length - 1];

  const nextDate = calendarioObrigatorio.find((date) => date > todayIso);
  return nextDate ?? calendarioObrigatorio[0];
}

function normalizeCpf(value?: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

export function EstagiosTab({ aluno, inscricoes, isLoading }: InscricoesTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialEstagioStatus = useMemo(
    () => searchParams.get("estagiosStatus") || null,
    [searchParams]
  );
  const [selectedEstagioId, setSelectedEstagioId] = useState<string | null>(null);
  const [estagioStatusFilter, setEstagioStatusFilter] = useState<string | null>(
    initialEstagioStatus
  );
  const [viewMode, setViewMode] = useState<ViewMode>("DIARIA");
  const [dataReferencia, setDataReferencia] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [motivo, setMotivo] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<FrequenciaHistoryEntry[]>([]);
  const [historyPagination, setHistoryPagination] = useState<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ frequenciaId: string } | null>(null);
  const [historyMeta, setHistoryMeta] = useState<{
    alunoNome: string;
    origemTitulo?: string | null;
  }>({ alunoNome: aluno.nomeCompleto || aluno.nome || "Aluno" });

  const hasInscricoesValidas = useMemo(
    () =>
      inscricoes.some(
        (inscricao) => inscricao.curso?.id && inscricao.turma?.id && inscricao.id
      ),
    [inscricoes]
  );

  useEffect(() => {
    const urlStatus = searchParams.get("estagiosStatus") || null;

    if (urlStatus !== estagioStatusFilter) {
      setEstagioStatusFilter(urlStatus);
    }
  }, [estagioStatusFilter, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (estagioStatusFilter) {
      params.set("estagiosStatus", estagioStatusFilter);
    } else {
      params.delete("estagiosStatus");
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [estagioStatusFilter, pathname, router, searchParams]);

  const estagiosQuery = useQuery({
    queryKey: [
      "aluno-details",
      "estagios-tab",
      aluno.id,
      estagioStatusFilter,
    ],
    queryFn: async () => {
      const response = await listEstagiosByAluno(aluno.id, {
        status: (estagioStatusFilter as EstagioStatus | null) ?? undefined,
        page: 1,
        pageSize: 100,
      });

      const rawItems = Array.isArray(response.data)
        ? response.data
        : (response.data?.items ?? []);

      return rawItems
        .filter((item) => Boolean(item?.id))
        .map((item) => ({
          id: String(item.id),
          titulo: item.titulo || "Estágio",
          status: item.status ?? null,
        })) as AlunoEstagioOption[];
    },
    enabled: hasInscricoesValidas,
    staleTime: 30 * 1000,
  });

  const estagios = useMemo(
    () => estagiosQuery.data ?? [],
    [estagiosQuery.data]
  );
  const estagioStatusOptions = useMemo(
    () =>
      Array.from(
        new Set(
          estagios
            .map((item) => (item.status || "").trim())
            .filter(Boolean)
            .map((value) => value.toUpperCase())
        )
      ).map((value) => ({ value, label: value })),
    [estagios]
  );
  const estagiosFiltered = estagios;
  const estagioOptions = useMemo(
    () =>
      estagiosFiltered.map((item) => ({
        value: item.id,
        label: item.titulo,
      })),
    [estagiosFiltered]
  );

  useEffect(() => {
    if (!estagiosFiltered.length) {
      setSelectedEstagioId(null);
      return;
    }
    if (
      !selectedEstagioId ||
      !estagiosFiltered.some((item) => item.id === selectedEstagioId)
    ) {
      setSelectedEstagioId(estagiosFiltered[0].id);
    }
  }, [estagiosFiltered, selectedEstagioId]);

  const selectedEstagioListItem = useMemo(
    () => estagiosFiltered.find((item) => item.id === selectedEstagioId) ?? null,
    [estagiosFiltered, selectedEstagioId]
  );

  const estagioDetailQuery = useQuery({
    queryKey: ["aluno-details", "estagios-tab", "estagio-details", selectedEstagioId],
    queryFn: () => getEstagioByAluno(aluno.id, selectedEstagioId as string),
    enabled: Boolean(selectedEstagioId),
  });

  const estagio = estagioDetailQuery.data as Estagio | undefined;

  const calendarioObrigatorio = useMemo(
    () =>
      (estagio?.calendarioObrigatorio ?? [])
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .sort((a, b) => a.localeCompare(b)),
    [estagio?.calendarioObrigatorio]
  );

  const defaultDataReferencia = useMemo(
    () => getDefaultReferenceDate(calendarioObrigatorio),
    [calendarioObrigatorio]
  );

  useEffect(() => {
    if (!defaultDataReferencia) return;
    if (!dataReferencia || !calendarioObrigatorio.includes(dataReferencia)) {
      setDataReferencia(defaultDataReferencia);
    }
  }, [calendarioObrigatorio, dataReferencia, defaultDataReferencia]);

  const calendarioDateObjects = useMemo(
    () =>
      calendarioObrigatorio
        .map((date) => new Date(`${date}T00:00:00`))
        .filter((date) => !Number.isNaN(date.getTime())),
    [calendarioObrigatorio]
  );
  const minCalendarioDate = calendarioDateObjects[0];
  const maxCalendarioDate = calendarioDateObjects[calendarioDateObjects.length - 1];
  const currentDateIndex = useMemo(
    () => (dataReferencia ? calendarioObrigatorio.indexOf(dataReferencia) : -1),
    [calendarioObrigatorio, dataReferencia]
  );
  const canGoPrevDate = currentDateIndex > 0;
  const canGoNextDate =
    currentDateIndex >= 0 && currentDateIndex < calendarioObrigatorio.length - 1;

  const alunoCpfDigits = useMemo(() => normalizeCpf(aluno.cpf), [aluno.cpf]);
  const alunoNomeNormalized = useMemo(
    () => (aluno.nomeCompleto || aluno.nome || "").trim().toLowerCase(),
    [aluno.nome, aluno.nomeCompleto]
  );

  const isAlunoMatch = useCallback(
    (item: EstagioFrequencia) => {
      if (item.alunoId && item.alunoId === aluno.id) return true;
      if (alunoCpfDigits && normalizeCpf(item.alunoCpf) === alunoCpfDigits)
        return true;
      if (
        alunoNomeNormalized &&
        (item.alunoNome || "").trim().toLowerCase() === alunoNomeNormalized
      ) {
        return true;
      }
      return false;
    },
    [aluno.id, alunoCpfDigits, alunoNomeNormalized]
  );

  const dailyQueryKey = [
    "aluno-details",
    "estagios-tab",
    selectedEstagioId,
    "frequencias-diaria",
    dataReferencia,
    statusFilter,
  ];

  const dailyFrequenciasQuery = useQuery({
    queryKey: dailyQueryKey,
    queryFn: () =>
      listEstagioFrequenciasByAluno(aluno.id, selectedEstagioId as string, {
        data: dataReferencia || undefined,
        status: (statusFilter as any) || undefined,
        search:
          (aluno.nomeCompleto || aluno.nome || "").trim() || undefined,
        page: 1,
        pageSize: 100,
      }),
    enabled: Boolean(selectedEstagioId && dataReferencia && viewMode === "DIARIA"),
  });

  const dailyItems = useMemo(
    () => (dailyFrequenciasQuery.data?.items ?? []).filter(isAlunoMatch),
    [dailyFrequenciasQuery.data?.items, isAlunoMatch]
  );

  const periodQueryKey = [
    "aluno-details",
    "estagios-tab",
    selectedEstagioId,
    "frequencias-periodo",
    calendarioObrigatorio,
    statusFilter,
  ];

  const periodFrequenciasQuery = useQuery({
    queryKey: periodQueryKey,
    queryFn: () =>
      listEstagioFrequenciasPeriodoByAluno(aluno.id, selectedEstagioId as string, {
        dataInicio:
          calendarioObrigatorio.length > 0 ? calendarioObrigatorio[0] : undefined,
        dataFim:
          calendarioObrigatorio.length > 0
            ? calendarioObrigatorio[calendarioObrigatorio.length - 1]
            : undefined,
        status: (statusFilter as any) || undefined,
        search:
          (aluno.nomeCompleto || aluno.nome || "").trim() || undefined,
        page: 1,
        pageSize: 200,
      }),
    enabled: Boolean(
      selectedEstagioId &&
        viewMode === "PERIODO" &&
        calendarioObrigatorio.length > 0
    ),
  });

  const periodGroups = useMemo(
    () =>
      (periodFrequenciasQuery.data?.gruposPorData ?? []).map((group) => ({
        date: group.data,
        items: (group.items ?? []).filter(isAlunoMatch),
      })),
    [isAlunoMatch, periodFrequenciasQuery.data?.gruposPorData]
  );

  const gruposById = useMemo(() => {
    const map = new Map<string, NonNullable<Estagio["grupos"]>[number]>();
    (estagio?.grupos ?? []).forEach((grupo) => {
      if (!grupo?.id) return;
      map.set(grupo.id, grupo);
    });
    return map;
  }, [estagio?.grupos]);

  const resolveGrupo = (item: EstagioFrequencia) => {
    const byId = item.grupoId ? gruposById.get(item.grupoId) : undefined;
    if (byId) return byId;
    if (item.grupoNome) {
      return (estagio?.grupos ?? []).find((grupo) => grupo.nome === item.grupoNome);
    }
    return undefined;
  };

  const resolveHorario = (item: EstagioFrequencia): { inicio?: string | null; fim?: string | null } => {
    const grupo = resolveGrupo(item);
    if (grupo?.horaInicio && grupo?.horaFim) {
      return { inicio: grupo.horaInicio, fim: grupo.horaFim };
    }
    if (estagio?.horarioPadrao?.horaInicio && estagio?.horarioPadrao?.horaFim) {
      return {
        inicio: estagio.horarioPadrao.horaInicio,
        fim: estagio.horarioPadrao.horaFim,
      };
    }
    return {};
  };

  const mutation = useMutation({
    mutationFn: async (payload: {
      item: EstagioFrequencia;
      status: ActionStatus;
      motivo?: string;
    }) => {
      if (!selectedEstagioId) {
        throw new Error("Estágio não selecionado.");
      }
      return upsertEstagioFrequenciaLancamentoByAluno(aluno.id, selectedEstagioId, {
        estagioAlunoId: payload.item.estagioAlunoId,
        dataReferencia:
          payload.item.dataReferencia || dataReferencia || getTodayIso(),
        status: payload.status,
        motivo: payload.motivo,
      });
    },
    onSuccess: async () => {
      setPendingAction(null);
      setMotivo("");
      if (!selectedEstagioId) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dailyQueryKey, refetchType: "active" }),
        queryClient.invalidateQueries({ queryKey: periodQueryKey, refetchType: "active" }),
      ]);
      toastCustom.success({
        title: "Frequência atualizada",
        description: "Lançamento realizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toastCustom.error({
        title: "Erro ao lançar frequência",
        description: error?.message || "Não foi possível atualizar a frequência.",
      });
    },
  });

  async function openHistory(item: EstagioFrequencia) {
    setHistoryPagination(null);

    if (!item.id || !selectedEstagioId) {
      setHistoryEntries([]);
      setHistoryTarget(null);
      setHistoryMeta({
        alunoNome: item.alunoNome || aluno.nomeCompleto || aluno.nome || "Aluno",
        origemTitulo: estagio?.titulo || selectedEstagioListItem?.titulo || "Estágio",
      });
      setHistoryOpen(true);
      return;
    }

    setHistoryMeta({
      alunoNome: item.alunoNome || aluno.nomeCompleto || aluno.nome || "Aluno",
      origemTitulo: estagio?.titulo || selectedEstagioListItem?.titulo || "Estágio",
    });
    setHistoryTarget({ frequenciaId: item.id });
    setHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const history = await listEstagioFrequenciaHistoricoByAlunoPaginado(
        aluno.id,
        selectedEstagioId,
        item.id,
        { page: 1, pageSize: 5 }
      );
      setHistoryEntries(history.items ?? []);
      setHistoryPagination({
        page: history.pagination?.page ?? 1,
        pageSize: history.pagination?.pageSize ?? 5,
        total: history.pagination?.total ?? history.items.length,
        totalPages: history.pagination?.totalPages ?? 1,
      });
    } finally {
      setHistoryLoading(false);
    }
  }

  const loadHistoryPage = async (page: number) => {
    if (!selectedEstagioId || !historyTarget?.frequenciaId) return;
    setHistoryLoading(true);
    try {
      const history = await listEstagioFrequenciaHistoricoByAlunoPaginado(
        aluno.id,
        selectedEstagioId,
        historyTarget.frequenciaId,
        { page, pageSize: 5 }
      );
      setHistoryEntries(history.items ?? []);
      setHistoryPagination({
        page: history.pagination?.page ?? page,
        pageSize: history.pagination?.pageSize ?? 5,
        total: history.pagination?.total ?? history.items.length,
        totalPages: history.pagination?.totalPages ?? 1,
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const canConfirm =
    Boolean(pendingAction) &&
    (pendingAction?.status !== "AUSENTE" || motivo.trim().length > 0) &&
    !mutation.isPending;

  const selectedDate = useMemo(() => {
    if (!dataReferencia) return null;
    const date = new Date(`${dataReferencia}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }, [dataReferencia]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        key: "dataReferencia",
        label: "Data de referência",
        type: "date",
        placeholder:
          calendarioObrigatorio.length > 0
            ? "Selecionar data do período"
            : "Sem datas obrigatórias",
        minDate: minCalendarioDate,
        maxDate: maxCalendarioDate,
        disabledDates: calendarioDateObjects,
        disabled: calendarioObrigatorio.length === 0,
        clearable: false,
      },
      {
        key: "status",
        label: "Status",
        mode: "single",
        options: [
          { value: "PENDENTE", label: "Pendente" },
          { value: "PRESENTE", label: "Presente" },
          { value: "AUSENTE", label: "Ausente" },
        ],
        placeholder: "Todos",
      },
    ],
    [
      calendarioObrigatorio.length,
      minCalendarioDate,
      maxCalendarioDate,
      calendarioDateObjects,
    ]
  );

  const filterValues = useMemo(
    () => ({
      dataReferencia: selectedDate,
      status: statusFilter,
    }),
    [selectedDate, statusFilter]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (estagiosQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (estagiosQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {(estagiosQuery.error as Error)?.message ||
            "Não foi possível carregar os estágios do aluno."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!estagios.length) {
    return (
      <EmptyState
        illustration="books"
        title="Nenhum estágio encontrado"
        description="Este aluno ainda não possui estágios vinculados nas inscrições atuais."
      />
    );
  }

  const attendanceTabs = [
    {
      value: "DIARIA",
      label: "Visão por data",
      badge: dataReferencia ? formatDateOnly(dataReferencia) : "Sem data",
      content: (
        <EstagioAttendanceByDate
          groups={[{ date: dataReferencia || getTodayIso(), items: dailyItems }]}
          isLoading={dailyFrequenciasQuery.isLoading}
          hideAlunoColumn
          renderGrupoCell={(item) => (
            <span>{resolveGrupo(item)?.nome || item.grupoNome || "Sem grupo"}</span>
          )}
          renderPeriodoHorarioCell={(item) => {
            const horario = resolveHorario(item);
            return (
              <div className="min-w-0">
                <span className="block text-sm! font-medium! text-gray-900!">
                  {formatDate(item.dataReferencia)}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {horario.inicio && horario.fim
                    ? `${horario.inicio} às ${horario.fim}`
                    : "Sem horário definido"}
                </span>
              </div>
            );
          }}
          renderGroupHeaderRight={(group) => (
            <div className="flex items-center gap-2">
              <ButtonCustom
                type="button"
                variant="outline"
                size="sm"
                className="h-7! w-7! p-0!"
                disabled={!canGoPrevDate || dailyFrequenciasQuery.isFetching}
                onClick={() => {
                  if (!canGoPrevDate) return;
                  const prevDate = calendarioObrigatorio[currentDateIndex - 1];
                  if (!prevDate) return;
                  setDataReferencia(prevDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </ButtonCustom>
              <ButtonCustom
                type="button"
                variant="outline"
                size="sm"
                className="h-7! w-7! p-0!"
                disabled={!canGoNextDate || dailyFrequenciasQuery.isFetching}
                onClick={() => {
                  if (!canGoNextDate) return;
                  const nextDate = calendarioObrigatorio[currentDateIndex + 1];
                  if (!nextDate) return;
                  setDataReferencia(nextDate);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </ButtonCustom>
              <span className="inline-flex h-7 items-center rounded-full border border-gray-200 bg-white px-2.5 text-xs! font-medium! text-gray-600!">
                {group.items.length} registro{group.items.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
          formatDate={formatDate}
          formatStatus={formatStatus}
          onMarkStatus={(item, status) => {
            setPendingAction({ item, status });
            setMotivo(status === "AUSENTE" ? item.motivo || "" : "");
          }}
          onOpenHistory={openHistory}
          isSavingRow={(item) =>
            mutation.isPending &&
            mutation.variables?.item.estagioAlunoId === item.estagioAlunoId &&
            mutation.variables?.item.dataReferencia === item.dataReferencia
          }
          activeSavingStatus={(item) =>
            mutation.isPending &&
            mutation.variables?.item.estagioAlunoId === item.estagioAlunoId &&
            mutation.variables?.item.dataReferencia === item.dataReferencia
              ? mutation.variables?.status ?? null
              : null
          }
        />
      ),
    },
    {
      value: "PERIODO",
      label: "Visão do período",
      badge: calendarioObrigatorio.length,
      content: (
        <EstagioAttendanceByDate
          groups={periodGroups}
          isLoading={periodFrequenciasQuery.isLoading}
          hideAlunoColumn
          renderGrupoCell={(item) => (
            <span>{resolveGrupo(item)?.nome || item.grupoNome || "Sem grupo"}</span>
          )}
          renderPeriodoHorarioCell={(item) => {
            const horario = resolveHorario(item);
            return (
              <div className="min-w-0">
                <span className="block text-sm! font-medium! text-gray-900!">
                  {formatDate(item.dataReferencia)}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {horario.inicio && horario.fim
                    ? `${horario.inicio} às ${horario.fim}`
                    : "Sem horário definido"}
                </span>
              </div>
            );
          }}
          formatDate={formatDate}
          formatStatus={formatStatus}
          onMarkStatus={(item, status) => {
            setPendingAction({ item, status });
            setMotivo(status === "AUSENTE" ? item.motivo || "" : "");
          }}
          onOpenHistory={openHistory}
          isSavingRow={(item) =>
            mutation.isPending &&
            mutation.variables?.item.estagioAlunoId === item.estagioAlunoId &&
            mutation.variables?.item.dataReferencia === item.dataReferencia
          }
          activeSavingStatus={(item) =>
            mutation.isPending &&
            mutation.variables?.item.estagioAlunoId === item.estagioAlunoId &&
            mutation.variables?.item.dataReferencia === item.dataReferencia
              ? mutation.variables?.status ?? null
              : null
          }
        />
      ),
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden">
      <FilterBar
        fields={[
          {
            key: "estagioId",
            label: "Estágio",
            mode: "single",
            options: estagioOptions,
            placeholder: "Selecionar estágio",
            searchable: true,
          },
          {
            key: "estagioStatus",
            label: "Status do estágio",
            mode: "single",
            options: estagioStatusOptions,
            placeholder: "Todos",
          },
          ...filterFields,
        ]}
        values={{
          estagioId: selectedEstagioId,
          estagioStatus: estagioStatusFilter,
          ...filterValues,
        }}
        gridClassName={[
          "lg:grid-cols-12 lg:gap-3 xl:gap-4",
          "lg:[&>*:nth-child(1)]:col-span-4",
          "lg:[&>*:nth-child(2)]:col-span-2",
          "lg:[&>*:nth-child(3)]:col-span-3",
          "lg:[&>*:nth-child(4)]:col-span-3",
        ].join(" ")}
        showActiveChips={false}
        onChange={(key, value) => {
          if (key === "estagioId") {
            setSelectedEstagioId((value as string) || null);
          }
          if (key === "estagioStatus") {
            setEstagioStatusFilter((value as string) || null);
          }
          if (key === "dataReferencia") {
            const nextDate = value as Date | null;
            if (!nextDate) {
              setDataReferencia(defaultDataReferencia);
              return;
            }
            const nextIso = toIsoDate(nextDate);
            if (
              calendarioObrigatorio.length > 0 &&
              !calendarioObrigatorio.includes(nextIso)
            ) {
              toastCustom.error({
                title: "Data inválida",
                description:
                  "Selecione uma data dentro do período obrigatório do estágio.",
              });
              return;
            }
            setDataReferencia(nextIso);
          }
          if (key === "status") {
            setStatusFilter((value as string) || null);
          }
        }}
        onClearAll={() => {
          setSelectedEstagioId(estagiosFiltered[0]?.id ?? null);
          setEstagioStatusFilter(null);
          setDataReferencia(defaultDataReferencia);
          setStatusFilter(null);
        }}
      />

      {!estagiosFiltered.length ? (
        <EmptyState
          illustration="books"
          title="Nenhum estágio encontrado"
          description="Ajuste os filtros para visualizar os estágios deste aluno."
        />
      ) : null}

      {estagiosFiltered.length > 0 ? (
        <>
          {estagioDetailQuery.isLoading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : estagioDetailQuery.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(estagioDetailQuery.error as Error)?.message ||
                  "Não foi possível carregar o detalhamento do estágio selecionado."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <HorizontalTabs
                items={attendanceTabs}
                value={viewMode}
                onValueChange={(value) => setViewMode(value as ViewMode)}
                className="!gap-2"
                listClassName="w-full max-w-[420px] !p-1.5 !gap-1.5 !rounded-xl !bg-gray-50 !border !border-gray-200/80"
                contentClassName="!p-0 !bg-transparent !border-0 !rounded-none"
              />
            </>
          )}
        </>
      ) : null}

      <ModalCustom
        isOpen={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (mutation.isPending) return;
          if (!open) {
            setPendingAction(null);
            setMotivo("");
          }
        }}
        size="md"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>
              {pendingAction?.status === "PRESENTE"
                ? "Confirmar presença"
                : "Confirmar ausência"}
            </ModalTitle>
            <ModalDescription className="text-sm! mt-0! mb-0!">
              {pendingAction?.status === "PRESENTE"
                ? "Deseja confirmar a presença do aluno nesta data?"
                : "Deseja confirmar a ausência? Informe o motivo obrigatoriamente."}
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {pendingAction?.status === "AUSENTE" ? (
              <SimpleTextarea
                label="Motivo da ausência"
                required
                value={motivo}
                onChange={(e) =>
                  setMotivo((e.target as HTMLTextAreaElement).value)
                }
                disabled={mutation.isPending}
                maxLength={500}
                showCharCount
                size="lg"
                placeholder="Descreva o motivo da ausência."
              />
            ) : null}
          </ModalBody>

          <ModalFooter>
            <ButtonCustom
              variant="outline"
              onClick={() => {
                if (mutation.isPending) return;
                setPendingAction(null);
                setMotivo("");
              }}
              disabled={mutation.isPending}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={() => {
                if (!pendingAction) return;
                mutation.mutate({
                  item: pendingAction.item,
                  status: pendingAction.status,
                  motivo: pendingAction.status === "AUSENTE" ? motivo.trim() : undefined,
                });
              }}
              disabled={!canConfirm}
              isLoading={mutation.isPending}
            >
              Confirmar
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>

      <FrequenciaHistoryModal
        isOpen={historyOpen}
        onClose={() => {
          if (historyLoading) return;
          setHistoryOpen(false);
        }}
        alunoNome={historyMeta.alunoNome}
        aulaNome={historyMeta.origemTitulo}
        history={historyEntries}
        isLoading={historyLoading}
        page={historyPagination?.page ?? 1}
        pageSize={historyPagination?.pageSize ?? 5}
        total={historyPagination?.total ?? historyEntries.length}
        totalPages={historyPagination?.totalPages ?? 1}
        onPageChange={loadHistoryPage}
      />
    </div>
  );
}
