"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import {
  getEstagioById,
  listEstagioFrequencias,
  listEstagioFrequenciasPeriodo,
  listEstagioFrequenciaHistorico,
  listEstagioFrequenciaHistoricoPaginado,
  upsertEstagioFrequenciaLancamento,
  type Estagio,
  type EstagioFrequencia,
  type FrequenciaHistoryEntry,
} from "@/api/cursos";
import {
  ButtonCustom,
  EmptyState,
  FilterBar,
  HorizontalTabs,
  EstagioAttendanceByDate,
  toastCustom,
} from "@/components/ui/custom";
import type { FilterField } from "@/components/ui/custom/filters";
import { Skeleton } from "@/components/ui/skeleton";
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
import { FrequenciaHistoryModal } from "../lista-frequencia/components/FrequenciaHistoryModal";
import { EstagioAlunoCell } from "./components/EstagioAlunoCell";

interface EstagioDetailsViewProps {
  estagioId: string;
}

type ActionStatus = "PRESENTE" | "AUSENTE";

interface PendingAction {
  item: EstagioFrequencia;
  status: ActionStatus;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  // Evita shift de fuso para valores no formato YYYY-MM-DD
  // (ex.: 2026-03-31 virando 30/03 em UTC-3).
  let date: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    date = new Date(year, (month ?? 1) - 1, day ?? 1);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
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

export function EstagioDetailsView({ estagioId }: EstagioDetailsViewProps) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"DIARIA" | "PERIODO">("DIARIA");
  const [dataReferencia, setDataReferencia] = useState<string | null>(null);
  const [pendingSearch, setPendingSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [motivo, setMotivo] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<FrequenciaHistoryEntry[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{
    frequenciaId: string | null;
  } | null>(null);
  const [historyMeta, setHistoryMeta] = useState<{
    alunoNome: string;
    origemTitulo?: string | null;
  }>({ alunoNome: "Aluno" });

  const detailQuery = useQuery({
    queryKey: ["estagios", "details", estagioId],
    queryFn: () => getEstagioById(estagioId),
    enabled: Boolean(estagioId),
  });

  const estagio = detailQuery.data as Estagio | undefined;
  const calendarioObrigatorio = useMemo(
    () =>
      (estagio?.calendarioObrigatorio ?? [])
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .sort((a, b) => a.localeCompare(b)),
    [estagio?.calendarioObrigatorio]
  );
  const isPeriodoCompletoMode = viewMode === "PERIODO";
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
    () =>
      dataReferencia ? calendarioObrigatorio.indexOf(dataReferencia) : -1,
    [calendarioObrigatorio, dataReferencia]
  );
  const canGoPrevDate = currentDateIndex > 0;
  const canGoNextDate =
    currentDateIndex >= 0 && currentDateIndex < calendarioObrigatorio.length - 1;

  const frequenciasQuery = useQuery({
    queryKey: [
      "estagios",
      "details",
      estagioId,
      "frequencias",
      dataReferencia,
      appliedSearch,
      statusFilter,
      page,
      pageSize,
    ],
    queryFn: () =>
      listEstagioFrequencias(estagioId, {
        data: dataReferencia || undefined,
        search: appliedSearch || undefined,
        status: (statusFilter as any) || undefined,
        page,
        pageSize,
      }),
    enabled: Boolean(estagioId && dataReferencia && viewMode === "DIARIA"),
  });

  const periodoFrequenciasQuery = useQuery({
    queryKey: [
      "estagios",
      "details",
      estagioId,
      "frequencias-periodo-completo",
      calendarioObrigatorio,
      appliedSearch,
      statusFilter,
    ],
    queryFn: () =>
      listEstagioFrequenciasPeriodo(estagioId, {
        dataInicio:
          calendarioObrigatorio.length > 0 ? calendarioObrigatorio[0] : undefined,
        dataFim:
          calendarioObrigatorio.length > 0
            ? calendarioObrigatorio[calendarioObrigatorio.length - 1]
            : undefined,
        search: appliedSearch || undefined,
        status: (statusFilter as any) || undefined,
        page: 1,
        pageSize: 200,
      }),
    enabled:
      Boolean(estagioId) &&
      isPeriodoCompletoMode &&
      calendarioObrigatorio.length > 0,
  });

  const mutation = useMutation({
    mutationFn: async (payload: {
      item: EstagioFrequencia;
      status: ActionStatus;
      motivo?: string;
    }) => {
      const dataLancamento =
        viewMode === "DIARIA"
          ? dataReferencia || payload.item.dataReferencia || getTodayIso()
          : payload.item.dataReferencia || dataReferencia || getTodayIso();

      return upsertEstagioFrequenciaLancamento(estagioId, {
        estagioAlunoId: payload.item.estagioAlunoId,
        dataReferencia: dataLancamento,
        status: payload.status,
        motivo: payload.motivo,
      });
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ["estagios", "details", estagioId, "frequencias"],
      });
      await queryClient.cancelQueries({
      queryKey: ["estagios", "details", estagioId, "frequencias-periodo-completo"],
      });

      const dataLancamento =
        viewMode === "DIARIA"
          ? dataReferencia || payload.item.dataReferencia || getTodayIso()
          : payload.item.dataReferencia || dataReferencia || getTodayIso();

      const updatedAt = new Date().toISOString();

      const previousDaily = queryClient.getQueriesData({
        queryKey: ["estagios", "details", estagioId, "frequencias"],
      });
      const previousPeriodo = queryClient.getQueriesData({
        queryKey: ["estagios", "details", estagioId, "frequencias-periodo-completo"],
      });

      queryClient.setQueriesData(
        { queryKey: ["estagios", "details", estagioId, "frequencias"] },
        (oldData: any) => {
          if (!oldData?.items) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item: EstagioFrequencia) => {
              const isSameAluno =
                item.estagioAlunoId === payload.item.estagioAlunoId;
              const isSameData =
                item.dataReferencia === dataLancamento ||
                item.dataReferencia === payload.item.dataReferencia;
              const shouldUpdate =
                viewMode === "DIARIA" ? isSameAluno : isSameAluno && isSameData;

              if (
                !shouldUpdate
              ) {
                return item;
              }
              return {
                ...item,
                status: payload.status,
                motivo:
                  payload.status === "AUSENTE"
                    ? payload.motivo ?? null
                    : null,
                atualizadoEm: updatedAt,
              };
            }),
          };
        }
      );

      queryClient.setQueriesData(
        {
          queryKey: [
            "estagios",
            "details",
            estagioId,
            "frequencias-periodo-completo",
          ],
        },
        (oldData: any) => {
          const groups = Array.isArray(oldData)
            ? oldData
            : Array.isArray(oldData?.gruposPorData)
              ? oldData.gruposPorData
              : null;
          if (!groups) return oldData;

          const nextGroups = groups.map((group: any) => {
            if (!Array.isArray(group?.items)) return group;
            return {
              ...group,
              items: group.items.map((item: EstagioFrequencia) => {
                const isSameAluno =
                  item.estagioAlunoId === payload.item.estagioAlunoId;
                const isSameData =
                  item.dataReferencia === dataLancamento ||
                  item.dataReferencia === payload.item.dataReferencia;
                const shouldUpdate =
                  viewMode === "DIARIA" ? isSameAluno : isSameAluno && isSameData;

                if (
                  !shouldUpdate
                ) {
                  return item;
                }
                return {
                  ...item,
                  status: payload.status,
                  motivo:
                    payload.status === "AUSENTE"
                      ? payload.motivo ?? null
                      : null,
                  atualizadoEm: updatedAt,
                };
              }),
            };
          });

          if (Array.isArray(oldData)) return nextGroups;
          return {
            ...oldData,
            gruposPorData: nextGroups,
          };
        }
      );

      return {
        previousDaily,
        previousPeriodo,
      };
    },
    onSuccess: (saved, variables) => {
      setPendingAction(null);
      setMotivo("");

      const savedStatus = saved?.status ?? variables.status;
      const savedMotivo =
        savedStatus === "AUSENTE"
          ? (saved?.motivo ?? variables.motivo ?? null)
          : null;
      const savedUpdatedAt = saved?.atualizadoEm ?? new Date().toISOString();

      queryClient.setQueriesData(
        { queryKey: ["estagios", "details", estagioId, "frequencias"] },
        (oldData: any) => {
          if (!oldData?.items) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item: EstagioFrequencia) => {
              const isSameAluno =
                item.estagioAlunoId === variables.item.estagioAlunoId;
              const isSameData =
                item.dataReferencia ===
                  (saved?.dataReferencia ?? variables.item.dataReferencia) ||
                item.dataReferencia === dataReferencia;
              const shouldUpdate =
                viewMode === "DIARIA" ? isSameAluno : isSameAluno && isSameData;

              if (!shouldUpdate) return item;
              return {
                ...item,
                id: saved?.id ?? item.id,
                status: savedStatus,
                motivo: savedMotivo,
                atualizadoEm: savedUpdatedAt,
              };
            }),
          };
        }
      );
      queryClient.setQueriesData(
        {
          queryKey: [
            "estagios",
            "details",
            estagioId,
            "frequencias-periodo-completo",
          ],
        },
        (oldData: any) => {
          const groups = Array.isArray(oldData)
            ? oldData
            : Array.isArray(oldData?.gruposPorData)
              ? oldData.gruposPorData
              : null;
          if (!groups) return oldData;

          const nextGroups = groups.map((group: any) => {
            if (!Array.isArray(group?.items)) return group;
            return {
              ...group,
              items: group.items.map((item: EstagioFrequencia) => {
                const isSameAluno =
                  item.estagioAlunoId === variables.item.estagioAlunoId;
                const isSameData =
                  item.dataReferencia ===
                    (saved?.dataReferencia ?? variables.item.dataReferencia) ||
                  item.dataReferencia === dataReferencia;
                const shouldUpdate =
                  viewMode === "DIARIA" ? isSameAluno : isSameAluno && isSameData;

                if (!shouldUpdate) return item;
                return {
                  ...item,
                  id: saved?.id ?? item.id,
                  status: savedStatus,
                  motivo: savedMotivo,
                  atualizadoEm: savedUpdatedAt,
                };
              }),
            };
          });

          if (Array.isArray(oldData)) return nextGroups;
          return {
            ...oldData,
            gruposPorData: nextGroups,
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["estagios", "details", estagioId, "frequencias"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["estagios", "details", estagioId, "frequencias-periodo-completo"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["estagios", "details", estagioId],
        refetchType: "active",
      });
      toastCustom.success({
        title: "Frequência atualizada",
        description: "Lançamento realizado com sucesso.",
      });
    },
    onError: (error: any, _variables, context) => {
      context?.previousDaily?.forEach(([queryKey, data]: any) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousPeriodo?.forEach(([queryKey, data]: any) => {
        queryClient.setQueryData(queryKey, data);
      });
      toastCustom.error({
        title: "Erro ao lançar frequência",
        description:
          error?.message || "Não foi possível atualizar a frequência do estágio.",
      });
    },
  });
  const items = useMemo(
    () => frequenciasQuery.data?.items ?? [],
    [frequenciasQuery.data]
  );
  const periodGroups = useMemo(
    () => periodoFrequenciasQuery.data?.gruposPorData ?? [],
    [periodoFrequenciasQuery.data]
  );
  const periodGroupsForTable = useMemo(
    () =>
      periodGroups.map((group) => ({
        date: group.data,
        items: group.items,
      })),
    [periodGroups]
  );
  const periodItems = useMemo(
    () => periodGroups.flatMap((group) => group.items),
    [periodGroups]
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
  const attendanceTabs = [
    {
      value: "DIARIA",
      label: "Visão por data",
      badge: dataReferencia ? formatDate(dataReferencia) : "Sem data",
        content: (
        <EstagioAttendanceByDate
          groups={[{ date: dataReferencia || getTodayIso(), items }]}
          isLoading={frequenciasQuery.isLoading}
          renderAlunoCell={(item) => <EstagioAlunoCell item={item} />}
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
                disabled={!canGoPrevDate || frequenciasQuery.isFetching}
                onClick={() => {
                  if (!canGoPrevDate) return;
                  const prevDate = calendarioObrigatorio[currentDateIndex - 1];
                  if (!prevDate) return;
                  setDataReferencia(prevDate);
                  setPage(1);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </ButtonCustom>
              <ButtonCustom
                type="button"
                variant="outline"
                size="sm"
                className="h-7! w-7! p-0!"
                disabled={!canGoNextDate || frequenciasQuery.isFetching}
                onClick={() => {
                  if (!canGoNextDate) return;
                  const nextDate = calendarioObrigatorio[currentDateIndex + 1];
                  if (!nextDate) return;
                  setDataReferencia(nextDate);
                  setPage(1);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </ButtonCustom>
              <span className="inline-flex h-7 items-center rounded-full border border-gray-200 bg-white px-2.5 text-xs! font-medium! text-gray-600!">
                {group.items.length} aluno{group.items.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
          renderGroupFooter={() => {
            const total = pagination.total ?? 0;
            const start = Math.min((page - 1) * pageSize + 1, total);
            const end = Math.min(page * pageSize, total);

            if (total <= 0) return null;

            return (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm! text-gray-600! mb-0!">
                  Mostrando {start} a {end} de {total}
                </span>
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1 || frequenciasQuery.isFetching}
                  >
                    Anterior
                  </ButtonCustom>
                  <span className="text-sm! text-gray-600! mb-0!">
                    Página {page} de {totalPages}
                  </span>
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages || frequenciasQuery.isFetching}
                  >
                    Próxima
                  </ButtonCustom>
                </div>
              </div>
            );
          }}
          formatDate={formatDate}
          formatStatus={formatStatus}
          onMarkStatus={(item, status) => {
            setPendingAction({ item, status });
            if (status === "AUSENTE") {
              setMotivo(item.motivo || "");
            } else {
              setMotivo("");
            }
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
        <div className="space-y-2">
          <p className="text-xs! text-gray-500! mb-0!">
            Frequências organizadas por cada dia obrigatório do período.
          </p>
          <EstagioAttendanceByDate
            groups={periodGroupsForTable}
            isLoading={periodoFrequenciasQuery.isLoading}
            renderAlunoCell={(item) => <EstagioAlunoCell item={item} />}
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
              if (status === "AUSENTE") {
                setMotivo(item.motivo || "");
              } else {
                setMotivo("");
              }
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
        </div>
      ),
    },
  ];
  const pagination = frequenciasQuery.data?.pagination ?? {
    page,
    pageSize,
    total: items.length,
    totalPages: 1,
  };
  const totalPages = Math.max(1, pagination.totalPages ?? 1);
  const selectedDate = useMemo(() => {
    if (!dataReferencia) return null;
    const date = new Date(`${dataReferencia}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }, [dataReferencia]);

  const resumo = useMemo(() => {
    const sourceItems = isPeriodoCompletoMode ? periodItems : items;
    const total = isPeriodoCompletoMode
      ? sourceItems.length
      : (pagination.total ?? sourceItems.length);
    const presentes = sourceItems.filter((item) => item.status === "PRESENTE").length;
    const lancadas = sourceItems.filter(
      (item) => item.status === "PRESENTE" || item.status === "AUSENTE"
    ).length;

    const taxa =
      typeof estagio?.resumo?.mediaFrequencia === "number"
        ? estagio.resumo.mediaFrequencia
        : lancadas > 0
          ? (presentes / lancadas) * 100
          : null;

    const ultimaAtualizacao =
      sourceItems
        .map((item) => item.atualizadoEm || item.criadoEm)
        .filter((value): value is string => Boolean(value))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ??
      estagio?.atualizadoEm ??
      null;

    return {
      total,
      presentes,
      lancadas,
      taxaPresenca: taxa,
      ultimaAtualizacao,
    };
  }, [
    estagio?.atualizadoEm,
    estagio?.resumo?.mediaFrequencia,
    isPeriodoCompletoMode,
    items,
    pagination.total,
    periodItems,
  ]);

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
      calendarioDateObjects,
      calendarioObrigatorio.length,
      maxCalendarioDate,
      minCalendarioDate,
    ]
  );

  const filterValues = useMemo(
    () => ({
      dataReferencia: selectedDate,
      status: statusFilter,
    }),
    [selectedDate, statusFilter]
  );

  const handleSearchSubmit = () => {
    setIsSearching(true);
    setAppliedSearch(pendingSearch.trim());
    setPage(1);
  };

  useEffect(() => {
    if (!isSearching) return;

    const activeFetching =
      viewMode === "DIARIA"
        ? frequenciasQuery.isFetching
        : periodoFrequenciasQuery.isFetching;

    if (!activeFetching) {
      setIsSearching(false);
    }
  }, [
    isSearching,
    viewMode,
    frequenciasQuery.isFetching,
    periodoFrequenciasQuery.isFetching,
  ]);

  async function openHistory(item: EstagioFrequencia) {
    setHistoryPage(1);
    setHistoryPagination(null);

    if (!item.id) {
      setHistoryEntries([]);
      setHistoryTarget(null);
      setHistoryMeta({
        alunoNome: item.alunoNome || "Aluno",
        origemTitulo: estagio?.titulo || "Estágio",
      });
      setHistoryOpen(true);
      return;
    }

    setHistoryMeta({
      alunoNome: item.alunoNome || "Aluno",
      origemTitulo: estagio?.titulo || "Estágio",
    });
    setHistoryTarget({ frequenciaId: item.id });
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const history = await listEstagioFrequenciaHistoricoPaginado(
        estagioId,
        item.id,
        {
          page: 1,
          pageSize: 5,
        }
      );
      setHistoryEntries(history.items ?? []);
      setHistoryPagination(
        history.pagination
          ? {
              page: history.pagination.page ?? 1,
              pageSize: history.pagination.pageSize ?? 5,
              total: history.pagination.total ?? history.items.length,
              totalPages: history.pagination.totalPages ?? 1,
            }
          : {
              page: 1,
              pageSize: 5,
              total: history.items.length,
              totalPages: 1,
            }
      );
    } catch (error) {
      const fallback = await listEstagioFrequenciaHistorico(estagioId, item.id);
      setHistoryEntries(fallback);
      setHistoryPagination({
        page: 1,
        pageSize: 5,
        total: fallback.length,
        totalPages: Math.max(1, Math.ceil(fallback.length / 5)),
      });
    } finally {
      setHistoryLoading(false);
    }
  }

  const loadHistoryPage = async (page: number) => {
    if (!historyTarget?.frequenciaId) return;

    setHistoryLoading(true);
    try {
      const history = await listEstagioFrequenciaHistoricoPaginado(
        estagioId,
        historyTarget.frequenciaId,
        {
          page,
          pageSize: 5,
        }
      );
      setHistoryEntries(history.items ?? []);
      setHistoryPagination(
        history.pagination
          ? {
              page: history.pagination.page ?? page,
              pageSize: history.pagination.pageSize ?? 5,
              total: history.pagination.total ?? history.items.length,
              totalPages: history.pagination.totalPages ?? 1,
            }
          : {
              page,
              pageSize: 5,
              total: history.items.length,
              totalPages: 1,
            }
      );
      setHistoryPage(page);
    } catch (error) {
      setHistoryEntries([]);
      toastCustom.error({
        title: "Erro ao carregar histórico",
        description:
          (error as Error)?.message ||
          "Não foi possível carregar o histórico da frequência.",
      });
    }
    setHistoryLoading(false);
  }

  const canConfirm =
    Boolean(pendingAction) &&
    (pendingAction?.status !== "AUSENTE" || motivo.trim().length > 0) &&
    !mutation.isPending;

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (detailQuery.isError || !estagio) {
    return (
      <EmptyState
        illustration="books"
        illustrationAlt="Erro ao carregar estágio"
        title="Não foi possível carregar o estágio"
        description={(detailQuery.error as Error)?.message || "Tente novamente em alguns instantes."}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                {formatDateTime(resumo.ultimaAtualizacao)}
              </p>
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <CalendarDays className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-1 text-sm! text-slate-500! mb-0!">
            Última atualização registrada neste estágio.
          </p>
          <p className="mt-0.5 text-xs! text-slate-600! mb-0! truncate">
            {estagio.titulo || "Estágio"}
          </p>
        </article>
        <article className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm! font-medium! text-slate-700! mb-1!">
                Curso/Turma
              </p>
              <p className="text-sm! font-semibold! text-slate-900! mb-0! truncate">
                {estagio.cursoNome || "Curso não informado"}
              </p>
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-1 text-sm! text-slate-500! mb-0! truncate">
            {estagio.turmaNome || estagio.turmaCodigo || "Turma não informada"}
          </p>
        </article>
      </section>

      <FilterBar
        fields={filterFields}
        values={filterValues}
        gridClassName={[
          "lg:grid-cols-12 lg:gap-3 xl:gap-4",
          "lg:[&>*:nth-child(1)]:col-span-5",
          "lg:[&>*:nth-child(2)]:col-span-3",
          "lg:[&>*:nth-child(3)]:col-span-2",
          "lg:[&>*:nth-child(4)]:col-span-2",
        ].join(" ")}
        rightActionsClassName="lg:justify-stretch lg:items-stretch xl:flex-row xl:justify-stretch xl:items-stretch"
        onChange={(key, value) => {
          if (key === "dataReferencia") {
            const nextDate = value as Date | null;
            if (!nextDate) {
              setDataReferencia(defaultDataReferencia);
              setPage(1);
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
            setPage(1);
          }
          if (key === "status") {
            setStatusFilter((value as string) || null);
            setPage(1);
          }
        }}
        onClearAll={() => {
          setDataReferencia(defaultDataReferencia);
          setPendingSearch("");
          setAppliedSearch("");
          setStatusFilter(null);
          setPage(1);
        }}
        search={{
          label: "Pesquisar aluno",
          value: pendingSearch,
          onChange: setPendingSearch,
          placeholder: "Buscar por nome do aluno ou código da inscrição...",
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
            isLoading={isSearching}
          >
            Pesquisar
          </ButtonCustom>
        }
      />

      <HorizontalTabs
        items={attendanceTabs}
        value={viewMode}
        onValueChange={(value) => setViewMode(value as "DIARIA" | "PERIODO")}
        className="!gap-2"
        listClassName="w-full max-w-[420px] !p-1.5 !gap-1.5 !rounded-xl !bg-gray-50 !border !border-gray-200/80"
        contentClassName="!p-0 !bg-transparent !border-0 !rounded-none"
      />

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
                  motivo:
                    pendingAction.status === "AUSENTE"
                      ? motivo.trim()
                      : undefined,
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
        history={historyEntries as any}
        isLoading={historyLoading}
        page={historyPagination?.page ?? historyPage}
        pageSize={historyPagination?.pageSize ?? 5}
        total={historyPagination?.total ?? historyEntries.length}
        totalPages={historyPagination?.totalPages ?? 1}
        onPageChange={loadHistoryPage}
      />
    </div>
  );
}
