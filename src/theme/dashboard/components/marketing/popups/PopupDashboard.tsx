"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import {
  deletePopup,
  listPopups,
  updatePopup,
} from "@/api/websites/components/popups";
import type {
  ListPopupsParams,
  PopupDevice,
  PopupScope,
  WebsitePopupListItem,
  WebsiteStatus,
} from "@/api/websites/components/popups";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ButtonCustom,
  EmptyState,
  FilterBar,
  toastCustom,
} from "@/components/ui/custom";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { cn } from "@/lib/utils";
import { PopupTable } from "./PopupTable";

const filterFields: FilterField[] = [
  {
    key: "status",
    label: "Status",
    mode: "single",
    placeholder: "Selecionar status",
    options: [
      { value: "PUBLICADO", label: "Publicado" },
      { value: "RASCUNHO", label: "Rascunho" },
    ],
  },
  {
    key: "dispositivo",
    label: "Dispositivo",
    mode: "single",
    placeholder: "Selecionar dispositivo",
    options: [
      { value: "AMBOS", label: "Ambos" },
      { value: "MOBILE", label: "Mobile" },
      { value: "DESKTOP", label: "Desktop" },
    ],
  },
  {
    key: "escopo",
    label: "Local",
    mode: "single",
    placeholder: "Selecionar local",
    options: [
      { value: "WEBSITE", label: "Site" },
      { value: "DASHBOARD", label: "Painel" },
      { value: "AMBOS", label: "Ambos" },
    ],
  },
];

export function PopupDashboard({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ListPopupsParams>({
    page: 1,
    pageSize: 10,
  });
  const [pendingSearch, setPendingSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [popupPendingDelete, setPopupPendingDelete] =
    useState<WebsitePopupListItem | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.marketingPopups.list(filters),
    queryFn: () => listPopups(filters),
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePopup,
    onSuccess: async () => {
      toastCustom.success("Pop-up removido com sucesso.");
      setPopupPendingDelete(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin-marketing-popups-list"],
      });
    },
    onError: (error) => {
      const status = Number((error as { status?: number })?.status);

      if (status === 404) {
        toastCustom.error("Esse pop-up já foi removido.");
        setPopupPendingDelete(null);
        void queryClient.invalidateQueries({
          queryKey: ["admin-marketing-popups-list"],
        });
        return;
      }

      if (status === 409) {
        toastCustom.error(
          error?.message ||
            "Não foi possível remover o pop-up porque ainda existem vínculos ativos.",
        );
        return;
      }

      toastCustom.error(error?.message || "Erro ao remover pop-up.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      popup,
      nextStatus,
    }: {
      popup: WebsitePopupListItem;
      nextStatus: WebsiteStatus;
    }) => updatePopup(popup.id, { status: nextStatus }),
    onMutate: async ({ popup, nextStatus }) => {
      setStatusPendingId(popup.id);
      await queryClient.cancelQueries({
        queryKey: ["admin-marketing-popups-list"],
      });

      const affectedQueries = queryClient.getQueriesData({
        queryKey: ["admin-marketing-popups-list"],
      });

      affectedQueries.forEach(([queryKey, previousValue]) => {
        if (!previousValue) return;

        queryClient.setQueryData(queryKey, (current) => {
          const typedCurrent = current as
            | {
                popups?: WebsitePopupListItem[];
                pagination?: unknown;
              }
            | undefined;

          if (!typedCurrent?.popups) return current;

          return {
            ...typedCurrent,
            popups: typedCurrent.popups.map((item) =>
              item.id === popup.id ? { ...item, status: nextStatus } : item,
            ),
          };
        });
      });

      return { affectedQueries };
    },
    onSuccess: async (_, variables) => {
      toastCustom.success(
        variables.nextStatus === "PUBLICADO"
          ? "Pop-up publicado com sucesso."
          : "Pop-up movido para rascunho.",
      );
      await queryClient.invalidateQueries({
        queryKey: ["admin-marketing-popups-list"],
      });
    },
    onError: (error, variables, context) => {
      context?.affectedQueries?.forEach(([queryKey, previousValue]) => {
        queryClient.setQueryData(queryKey, previousValue);
      });

      toastCustom.error(
        error?.message || "Não foi possível atualizar o status do pop-up.",
      );
    },
    onSettled: () => {
      setStatusPendingId(null);
    },
  });

  const popups = query.data?.popups ?? [];
  const pagination = query.data?.pagination;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, Math.max(5, currentPage + 2));
    for (let page = start; page <= end; page += 1) pages.push(page);
    return pages;
  }, [currentPage, totalPages]);

  const filterValues = useMemo(
    () => ({
      status: selectedStatus,
      dispositivo: selectedDevice,
      escopo: selectedScope,
    }),
    [selectedDevice, selectedScope, selectedStatus],
  );

  const updateFilters = (next: Partial<ListPopupsParams>) => {
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
      updateFilters({ status: (nextValue ?? undefined) as WebsiteStatus | undefined });
    }
    if (key === "dispositivo") {
      setSelectedDevice(nextValue);
      updateFilters({ dispositivo: (nextValue ?? undefined) as PopupDevice | undefined });
    }
    if (key === "escopo") {
      setSelectedScope(nextValue);
      updateFilters({ escopo: (nextValue ?? undefined) as PopupScope | undefined });
    }
  };

  const handleDelete = (id: string) => {
    setPopupPendingDelete(popups.find((popup) => popup.id === id) ?? null);
  };

  const handleToggleStatus = (popup: WebsitePopupListItem) => {
    statusMutation.mutate({
      popup,
      nextStatus: popup.status === "PUBLICADO" ? "RASCUNHO" : "PUBLICADO",
    });
  };

  const showEmpty =
    !query.isLoading && !query.isFetching && popups.length === 0;

  return (
    <div className={cn("min-h-full space-y-6", className)}>
      <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
        <ButtonCustom
          variant="primary"
          size="md"
          icon="Plus"
          fullWidth
          className="sm:w-auto"
          asChild
        >
          <Link
            href="/dashboard/marketing/popup/criar"
            data-popup-target="dashboard-popup-new-button"
          >
            Novo popup
          </Link>
        </ButtonCustom>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={handleFilterChange}
            search={{
              label: "Pesquisar pop-up",
              value: pendingSearch,
              onChange: setPendingSearch,
              placeholder: "Buscar por nome, template ou tag...",
            }}
            rightActions={
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={() => updateFilters({ search: pendingSearch.trim() })}
                disabled={query.isLoading}
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {query.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {query.error.message || "Erro ao carregar pop-ups."}
          </AlertDescription>
        </Alert>
      )}

      {!showEmpty && (
        <PopupTable
          popups={popups}
          isLoading={query.isLoading || query.isFetching}
          pagination={pagination}
          visiblePages={visiblePages}
          onPageChange={(page) =>
            setFilters((previous) => ({ ...previous, page }))
          }
          onDelete={handleDelete}
          deletingId={deleteMutation.variables}
          onToggleStatus={handleToggleStatus}
          togglingStatusId={statusPendingId ?? undefined}
        />
      )}

      {showEmpty && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <EmptyState
            fullHeight
            illustration="fileNotFound"
            illustrationAlt="Nenhum popup encontrado"
            title="Nenhum pop-up encontrado"
            description="Crie seu primeiro pop-up para capturar contatos ou divulgar campanhas."
          />
        </div>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(popupPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPopupPendingDelete(null);
        }}
        item={popupPendingDelete}
        itemName="o pop-up"
        isDeleting={deleteMutation.isPending}
        confirmButtonText="Excluir pop-up"
        title="Excluir pop-up"
        description="Remova este pop-up da lista."
        onConfirmDelete={(popup) => deleteMutation.mutate(popup.id)}
        defaultDeleteContent={(popup) => (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="!mb-1 !text-sm font-semibold text-slate-950">
                {popup.nome}
              </p>
              <p className="!mb-0 !text-sm text-slate-600">
                Ele deixará de aparecer no painel.
              </p>
            </div>
            <p className="!mb-0 !text-sm leading-6 text-slate-600">
              Os contatos já capturados permanecem salvos.
            </p>
            <p className="!mb-0 !text-sm leading-6 text-slate-600">
              Esta ação é permanente.
            </p>
          </div>
        )}
      />
    </div>
  );
}
