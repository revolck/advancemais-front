"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  deleteRecipientList,
  getRecipientListStatuses,
  listRecipientLists,
  recalculateRecipientList,
  type ListRecipientListsParams,
  type RecipientListListItem,
  type RecipientListMembershipMode,
  type RecipientListPagination,
  type RecipientListStatus,
} from "@/api/websites/components/recipientlists";
import { toastCustom } from "@/components/ui/custom";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { EMPTY_DATE_RANGE } from "../constants/filters";
import type { RecipientListsDashboardDataReturn } from "../types/dashboard";
import {
  getVisiblePages,
  toRangeEndIso,
  toRangeStartIso,
} from "../utils/pagination";

function mergeListStatuses(
  lists: RecipientListListItem[],
  statuses: Awaited<ReturnType<typeof getRecipientListStatuses>>,
) {
  if (!statuses.length) return lists;
  const statusMap = new Map(statuses.map((item) => [item.id, item]));

  return lists.map((list) => {
    const status = statusMap.get(list.id);
    return status
      ? {
          ...list,
          recipientCount: status.recipientCount,
          lastCalculatedAt: status.lastCalculatedAt,
          recalculationStatus: status.recalculationStatus,
          recalculationStartedAt: status.recalculationStartedAt,
          recalculationFinishedAt: status.recalculationFinishedAt,
          recalculationError: status.recalculationError,
          atualizadoEm: status.atualizadoEm,
        }
      : list;
  });
}

export function useRecipientListsDashboardData(): RecipientListsDashboardDataReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ListRecipientListsParams>({
    page: 1,
    pageSize: 10,
  });
  const [pendingSearch, setPendingSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedMembershipMode, setSelectedMembershipMode] = useState<
    string | null
  >(null);
  const [selectedUpdatedAt, setSelectedUpdatedAt] =
    useState<DateRange>(EMPTY_DATE_RANGE);
  const [listToDelete, setListToDelete] = useState<RecipientListListItem | null>(
    null,
  );

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-marketing-recipient-lists"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-marketing-email-recipient-options"],
      }),
    ]);
  };

  const listQuery = useQuery({
    queryKey: queryKeys.marketingRecipientLists.list(filters),
    queryFn: () => listRecipientLists(filters),
    refetchOnWindowFocus: false,
  });

  const processingIds = useMemo(
    () =>
      (listQuery.data?.lists ?? [])
        .filter((list) => list.recalculationStatus === "PROCESSING")
        .map((list) => list.id),
    [listQuery.data?.lists],
  );

  const statusesQuery = useQuery({
    queryKey: queryKeys.marketingRecipientLists.statuses(processingIds),
    queryFn: () => getRecipientListStatuses({ listIds: processingIds }),
    enabled: processingIds.length > 0,
    refetchInterval: processingIds.length > 0 ? 3000 : false,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipientList,
    onSuccess: async () => {
      toastCustom.success("Lista removida com sucesso.");
      setListToDelete(null);
      await invalidateAll();
    },
    onError: (error) => {
      toastCustom.error(error?.message || "Erro ao remover lista.");
    },
  });

  const recalculateMutation = useMutation({
    mutationFn: recalculateRecipientList,
    onSuccess: async (updatedList) => {
      queryClient.setQueryData(
        queryKeys.marketingRecipientLists.list(filters),
        (current:
          | {
              lists: RecipientListListItem[];
              pagination: RecipientListPagination;
            }
          | undefined) => {
          if (!current) return current;
          return {
            ...current,
            lists: current.lists.map((list) =>
              list.id === updatedList.id
                ? {
                    ...list,
                    recipientCount: updatedList.recipientCount,
                    lastCalculatedAt: updatedList.lastCalculatedAt,
                    recalculationStatus: updatedList.recalculationStatus,
                    recalculationStartedAt: updatedList.recalculationStartedAt,
                    recalculationFinishedAt: updatedList.recalculationFinishedAt,
                    recalculationError: updatedList.recalculationError,
                    atualizadoEm: updatedList.atualizadoEm,
                  }
                : list,
            ),
          };
        },
      );
      toastCustom.success("Recalculo iniciado.");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.marketingRecipientLists.statuses([updatedList.id]),
      });
    },
    onError: (error) => {
      toastCustom.error(error?.message || "Erro ao recalcular lista.");
    },
  });

  const lists = useMemo(
    () => mergeListStatuses(listQuery.data?.lists ?? [], statusesQuery.data ?? []),
    [listQuery.data?.lists, statusesQuery.data],
  );

  const pagination = listQuery.data?.pagination;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const updateFilters = (next: Partial<ListRecipientListsParams>) => {
    setFilters((previous) => ({ ...previous, ...next, page: 1 }));
  };

  const handleFilterChange = (
    key: string,
    value: string | string[] | DateRange | Date | null,
  ) => {
    const nextValue =
      typeof value === "string"
        ? value
        : Array.isArray(value)
          ? (value.find((item): item is string => typeof item === "string") ??
            null)
          : null;

    if (key === "status") {
      setSelectedStatus(nextValue);
      updateFilters({
        status: (nextValue ?? undefined) as RecipientListStatus | undefined,
      });
      return;
    }

    if (key === "membershipMode") {
      setSelectedMembershipMode(nextValue);
      updateFilters({
        membershipMode:
          (nextValue ?? undefined) as RecipientListMembershipMode | undefined,
      });
      return;
    }

    if (key === "updatedAt") {
      const range = (value as DateRange | null) ?? EMPTY_DATE_RANGE;
      setSelectedUpdatedAt(range);
      updateFilters({
        updatedFrom: toRangeStartIso(range.from),
        updatedTo: toRangeEndIso(range.to),
      });
    }
  };

  return {
    lists,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    error: listQuery.error?.message || null,
    pagination,
    visiblePages,
    filters: {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10,
      search: filters.search,
      folderId: filters.folderId,
      status: filters.status,
      membershipMode: filters.membershipMode,
      updatedFrom: filters.updatedFrom,
      updatedTo: filters.updatedTo,
    },
    pendingSearch,
    selectedStatus,
    selectedMembershipMode,
    selectedUpdatedAt,
    listToDelete,
    deletingId: deleteMutation.variables,
    recalculatingId:
      typeof recalculateMutation.variables === "string"
        ? recalculateMutation.variables
        : undefined,
    showEmptyState:
      !listQuery.isLoading && !listQuery.isFetching && lists.length === 0,
    updateFilters,
    setPendingSearch,
    handleFilterChange,
    handlePageChange: (page) =>
      setFilters((previous) => ({ ...previous, page })),
    handleOpenDelete: (id) =>
      setListToDelete(lists.find((item) => item.id === id) ?? null),
    handleDeleteOpenChange: (open) => {
      if (!open) setListToDelete(null);
    },
    handleConfirmDelete: (item) => deleteMutation.mutate(item.id),
    handleRecalculate: (id) => recalculateMutation.mutate(id),
    handleEdit: (id) => router.push(`/dashboard/marketing/listas/${id}/editar`),
  };
}
