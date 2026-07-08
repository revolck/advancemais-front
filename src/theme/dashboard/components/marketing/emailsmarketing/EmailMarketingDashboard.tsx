"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import {
  createMarketingEmail,
  deleteMarketingEmail,
  getMarketingEmailFilterOptions,
  getMarketingEmailById,
  listMarketingEmails,
  updateMarketingEmail,
} from "@/api/websites/components/emailsmarketing";
import type {
  CreateMarketingEmailPayload,
  ListMarketingEmailsParams,
  MarketingEmailListItem,
  MarketingEmailStatus,
  MarketingEmailWorkflowStatus,
} from "@/api/websites/components/emailsmarketing";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ButtonCustom,
  EmptyState,
  FilterBar,
  toastCustom,
} from "@/components/ui/custom";
import type { DateRange } from "@/components/ui/custom/date-picker";
import type { FilterField } from "@/components/ui/custom/filters";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { cn } from "@/lib/utils";
import { EmailMarketingTable } from "./EmailMarketingTable";
import { getDeliveryFailureMessage } from "./deliveryFeedback";

const EMPTY_DATE_RANGE: DateRange = { from: null, to: null };

function normalizePickerDate(date: Date | null | undefined) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

function toRangeStartIso(date: Date | null | undefined) {
  const normalized = normalizePickerDate(date);
  if (!normalized) return undefined;
  const value = new Date(normalized);
  value.setHours(0, 0, 0, 0);
  return value.toISOString();
}

function toRangeEndIso(date: Date | null | undefined) {
  const normalized = normalizePickerDate(date);
  if (!normalized) return undefined;
  const value = new Date(normalized);
  value.setHours(23, 59, 59, 999);
  return value.toISOString();
}

export function EmailMarketingDashboard({ className }: { className?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ListMarketingEmailsParams>({
    page: 1,
    pageSize: 10,
  });
  const [pendingSearch, setPendingSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [selectedSentAt, setSelectedSentAt] =
    useState<DateRange>(EMPTY_DATE_RANGE);
  const [emailPendingDelete, setEmailPendingDelete] =
    useState<MarketingEmailListItem | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);
  const previousDeliveryStatusRef = useRef<Record<string, string | null>>({});

  const query = useQuery({
    queryKey: queryKeys.marketingEmails.list(filters),
    queryFn: () => listMarketingEmails(filters),
    refetchOnWindowFocus: false,
    refetchInterval: (currentQuery) => {
      const data = currentQuery.state.data as
        | { emails?: MarketingEmailListItem[] }
        | undefined;
      const hasProcessing = (data?.emails ?? []).some(
        (email) => email.settingsConfig?.deliveryStatus === "PROCESSING",
      );
      return hasProcessing ? 3000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const filterOptionsQuery = useQuery({
    queryKey: ["admin-marketing-emails-filter-options"],
    queryFn: getMarketingEmailFilterOptions,
    refetchOnWindowFocus: false,
  });

  const duplicateMutation = useMutation({
    mutationFn: async (email: MarketingEmailListItem) => {
      const detail = await getMarketingEmailById(email.id);

      const payload: CreateMarketingEmailPayload = {
        nome: `${detail.nome} - cópia`,
        status: "RASCUNHO",
        tipo: detail.tipo,
        assunto: detail.assunto ?? null,
        previewText: detail.previewText ?? null,
        templateSlug: detail.templateSlug ?? null,
        htmlContent: detail.htmlContent ?? null,
        contentConfig: detail.contentConfig ?? null,
        targetConfig: detail.targetConfig ?? null,
        senderConfig: detail.senderConfig ?? null,
        settingsConfig: detail.settingsConfig
          ? {
              ...detail.settingsConfig,
              deliveryStatus: "IDLE",
              processingStartedAt: null,
              lastSentAt: null,
              lastError: null,
            }
          : null,
        destinatariosEstimados: detail.destinatariosEstimados,
      };

      return createMarketingEmail(payload);
    },
    onSuccess: async (result) => {
      toastCustom.success("Cópia criada com sucesso.");
      await queryClient.invalidateQueries({
        queryKey: ["admin-marketing-emails-list"],
      });
      router.push(
        `/dashboard/marketing/emails/${result.id}/editar?step=configuracao`,
      );
    },
    onError: (error) => {
      toastCustom.error(error?.message || "Não foi possível duplicar o e-mail.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMarketingEmail,
    onSuccess: async () => {
      toastCustom.success("E-mail removido com sucesso.");
      setEmailPendingDelete(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin-marketing-emails-list"],
      });
    },
    onError: (error) => {
      const status = Number((error as { status?: number })?.status);

      if (status === 404) {
        toastCustom.error("Esse e-mail já foi removido.");
        setEmailPendingDelete(null);
        void queryClient.invalidateQueries({
          queryKey: ["admin-marketing-emails-list"],
        });
        return;
      }

      toastCustom.error(error?.message || "Erro ao remover e-mail.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      email,
      action,
    }: {
      email: MarketingEmailListItem;
      action: "send" | "resend";
    }) => {
      if (action === "resend") {
        return updateMarketingEmail(email.id, {
          status: "PUBLICADO",
          settingsConfig: {
            ...(email.settingsConfig ?? {
              trackOpens: true,
              trackClicks: true,
            }),
            deliveryStatus: "IDLE",
            processingStartedAt: null,
            lastSentAt: null,
            lastError: null,
          },
        });
      }

      return updateMarketingEmail(email.id, { status: "PUBLICADO" });
    },
    onMutate: async ({ email }) => {
      setStatusPendingId(email.id);
      await queryClient.cancelQueries({
        queryKey: ["admin-marketing-emails-list"],
      });

      const affectedQueries = queryClient.getQueriesData({
        queryKey: ["admin-marketing-emails-list"],
      });

      affectedQueries.forEach(([queryKey, previousValue]) => {
        if (!previousValue) return;

        queryClient.setQueryData(queryKey, (current) => {
          const typedCurrent = current as
            | {
                emails?: MarketingEmailListItem[];
                pagination?: unknown;
              }
            | undefined;

          if (!typedCurrent?.emails) return current;

          return {
            ...typedCurrent,
            emails: typedCurrent.emails.map((item) =>
              item.id === email.id
                ? {
                    ...item,
                    status: "PUBLICADO" as MarketingEmailStatus,
                    workflowStatus:
                      "PROCESSANDO" as MarketingEmailWorkflowStatus,
                    settingsConfig: item.settingsConfig
                      ? {
                          ...item.settingsConfig,
                          deliveryStatus: "PROCESSING",
                          lastError: null,
                        }
                      : item.settingsConfig,
                  }
                : item,
            ),
          };
        });
      });

      return { affectedQueries };
    },
    onSuccess: async (_, variables) => {
      toastCustom.success(
        variables.action === "resend"
          ? "Reenvio iniciado."
          : "Envio iniciado.",
      );
      await queryClient.invalidateQueries({
        queryKey: ["admin-marketing-emails-list"],
      });
    },
    onError: (error, _, context) => {
      context?.affectedQueries?.forEach(([queryKey, previousValue]) => {
        queryClient.setQueryData(queryKey, previousValue);
      });

      toastCustom.error(
        error?.message || "Não foi possível atualizar o status do e-mail.",
      );
    },
    onSettled: () => {
      setStatusPendingId(null);
    },
  });

  const emails = query.data?.emails ?? [];
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

  useEffect(() => {
    if (!emails.length) {
      previousDeliveryStatusRef.current = {};
      return;
    }

    const nextStatuses: Record<string, string | null> = {};

    emails.forEach((email) => {
      const currentStatus = email.settingsConfig?.deliveryStatus ?? null;
      const previousStatus = previousDeliveryStatusRef.current[email.id] ?? null;

      if (previousStatus === "PROCESSING" && currentStatus === "SENT") {
        toastCustom.success("Campanha enviada com sucesso.");
      }

      if (previousStatus === "PROCESSING" && currentStatus === "FAILED") {
        toastCustom.error(getDeliveryFailureMessage(email.settingsConfig?.lastError));
      }

      nextStatuses[email.id] = currentStatus;
    });

    previousDeliveryStatusRef.current = nextStatuses;
  }, [emails]);

  const filterValues = useMemo(
    () => ({
      workflowStatus: selectedStatus,
      actorId: selectedActorId,
      sentAt: selectedSentAt,
    }),
    [selectedActorId, selectedSentAt, selectedStatus],
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        key: "workflowStatus",
        label: "Status",
        mode: "single",
        placeholder: "Selecionar status",
        options: [
          { value: "RASCUNHO", label: "Em rascunho" },
          { value: "PROCESSANDO", label: "Processando" },
          { value: "FALHOU", label: "Falhou" },
          { value: "AGENDADO", label: "Agendado" },
          { value: "ENVIADO", label: "Enviado" },
        ],
      },
      {
        key: "actorId",
        label: "Usuário",
        mode: "single",
        placeholder: "Selecionar usuário",
        options: (filterOptionsQuery.data?.users ?? []).map((user) => ({
          value: user.id,
          label: user.nomeCompleto,
        })),
        searchable: true,
      },
      {
        key: "sentAt",
        label: "Data de envio",
        type: "date-range",
        placeholder: "Selecionar período",
      },
    ],
    [filterOptionsQuery.data?.users],
  );

  const updateFilters = (next: Partial<ListMarketingEmailsParams>) => {
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

    if (key === "workflowStatus") {
      setSelectedStatus(nextValue);
      updateFilters({
        workflowStatus:
          (nextValue ?? undefined) as MarketingEmailWorkflowStatus | undefined,
      });
      return;
    }

    if (key === "actorId") {
      setSelectedActorId(nextValue);
      updateFilters({
        actorId: nextValue ?? undefined,
      });
      return;
    }

    if (key === "sentAt") {
      const range = (value as DateRange | null) ?? EMPTY_DATE_RANGE;
      setSelectedSentAt(range);
      updateFilters({
        sentFrom: toRangeStartIso(range.from),
        sentTo: toRangeEndIso(range.to),
      });
    }
  };

  const handleDelete = (id: string) => {
    setEmailPendingDelete(emails.find((email) => email.id === id) ?? null);
  };

  const handleTriggerDelivery = (email: MarketingEmailListItem) => {
    statusMutation.mutate({
      email,
      action:
        email.settingsConfig?.deliveryStatus === "FAILED" ? "resend" : "send",
    });
  };

  const showEmpty =
    !query.isLoading && !query.isFetching && emails.length === 0;

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
          <Link href="/dashboard/marketing/emails/criar">Novo e-mail</Link>
        </ButtonCustom>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <div className="py-4">
          <FilterBar
            gridClassName="lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
            rightActionsClassName="xl:flex xl:h-full xl:items-end xl:justify-end"
            fields={filterFields}
            values={filterValues}
            onChange={handleFilterChange}
            search={{
              label: "Pesquisar campanha",
              value: pendingSearch,
              onChange: setPendingSearch,
              placeholder: "Buscar por nome ou assunto...",
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
            {query.error.message || "Erro ao carregar campanhas de e-mail."}
          </AlertDescription>
        </Alert>
      )}

      {!showEmpty && (
        <EmailMarketingTable
          emails={emails}
          isLoading={query.isLoading}
          pagination={pagination}
          visiblePages={visiblePages}
          onPageChange={(page) =>
            setFilters((previous) => ({ ...previous, page }))
          }
          onDelete={handleDelete}
          deletingId={deleteMutation.variables}
          onTriggerDelivery={handleTriggerDelivery}
          togglingStatusId={statusPendingId ?? undefined}
          duplicatingId={duplicateMutation.variables?.id}
          onDuplicate={(email) => duplicateMutation.mutate(email)}
        />
      )}

      {showEmpty && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <EmptyState
            fullHeight
            illustration="fileNotFound"
            illustrationAlt="Nenhum e-mail encontrado"
            title="Nenhuma campanha de e-mail encontrada"
            description="Crie seu primeiro e-mail para organizar rascunhos e preparar disparos em massa."
          />
        </div>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(emailPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setEmailPendingDelete(null);
        }}
        item={emailPendingDelete}
        itemName="o e-mail"
        isDeleting={deleteMutation.isPending}
        confirmButtonText="Excluir e-mail"
        title="Excluir e-mail"
        description="Remova esta campanha da lista."
        onConfirmDelete={(email) => deleteMutation.mutate(email.id)}
        defaultDeleteContent={(email) => (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="!mb-1 !text-sm font-semibold text-slate-950">
                {email.nome}
              </p>
              <p className="!mb-0 !text-sm text-slate-600">
                {email.assunto || "Sem assunto definido"}
              </p>
            </div>
            <p className="!mb-0 !text-sm leading-6 text-slate-600">
              Esta campanha deixará de aparecer no painel.
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
