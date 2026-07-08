"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import {
  getPopupContact,
  getPopupContactHistory,
  listPopupContacts,
  listPopups,
} from "@/api/websites/components/popups";
import type {
  ListPopupContactsParams,
  PopupContactHistoryItem,
  PopupLeadDetail,
  PopupLeadListItem,
} from "@/api/websites/components/popups";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ButtonCustom,
  EmptyState,
  FilterBar,
  toastCustom,
} from "@/components/ui/custom";
import type { DateRange } from "@/components/ui/custom/date-picker";
import type { FilterField } from "@/components/ui/custom/filters";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { InscricoesHistoricoModal } from "./InscricoesHistoricoModal";
import { PopupContactsTable } from "./PopupContactsTable";

export function PopupContactsDashboard() {
  const router = useRouter();
  const [filters, setFilters] = useState<ListPopupContactsParams>({
    page: 1,
    pageSize: 10,
  });
  const [pendingSearch, setPendingSearch] = useState("");
  const [selectedPopupId, setSelectedPopupId] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const prevFiltersRef = useRef(filters);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<PopupLeadListItem | null>(
    null,
  );
  const [contactDetail, setContactDetail] = useState<PopupLeadDetail | null>(null);
  const [contactHistory, setContactHistory] = useState<PopupContactHistoryItem[]>([]);
  const [loadingAction, setLoadingAction] = useState<{
    type: "view" | "history" | null;
    id: string | null;
  }>({ type: null, id: null });

  const contactsQuery = useQuery({
    queryKey: queryKeys.marketingPopups.contacts(filters),
    queryFn: () => listPopupContacts(filters),
    refetchOnWindowFocus: false,
  });

  const popupsQuery = useQuery({
    queryKey: queryKeys.marketingPopups.list({ page: 1, pageSize: 50 }),
    queryFn: () => listPopups({ page: 1, pageSize: 50 }),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.search !== filters.search ||
      prevFiltersRef.current.popupId !== filters.popupId ||
      prevFiltersRef.current.origemPath !== filters.origemPath ||
      prevFiltersRef.current.from !== filters.from ||
      prevFiltersRef.current.to !== filters.to ||
      prevFiltersRef.current.page !== filters.page;

    if (filtersChanged) {
      setIsFiltering(true);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  useEffect(() => {
    if (!contactsQuery.isFetching && !contactsQuery.isLoading) {
      setIsFiltering(false);
    }
  }, [contactsQuery.isFetching, contactsQuery.isLoading]);

  const contatos = useMemo(
    () => contactsQuery.data?.contatos ?? [],
    [contactsQuery.data?.contatos],
  );
  const pagination = contactsQuery.data?.pagination;

  const popupOptions = useMemo(
    () =>
      (popupsQuery.data?.popups ?? []).map((popup) => ({
        value: popup.id,
        label: popup.nome,
      })),
    [popupsQuery.data?.popups],
  );

  const originOptions = useMemo(
    () =>
      Array.from(
        new Set(
          contatos
            .map((contato) => contato.origemPath?.trim())
            .filter((origem): origem is string => Boolean(origem)),
        ),
      ).map((origem) => ({
        value: origem,
        label: origem,
      })),
    [contatos],
  );

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, Math.max(5, currentPage + 2));

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  const showLoading =
    contactsQuery.isLoading || (isFiltering && contactsQuery.isFetching);
  const showEmpty =
    !showLoading && !contactsQuery.isFetching && contatos.length === 0;

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "popupId",
        label: "Pop-up",
        mode: "single",
        options: popupOptions,
        placeholder: "Todas as rotinas",
        clearable: true,
      },
      {
        key: "origemPath",
        label: "Página de captura",
        mode: "single",
        options: originOptions,
        placeholder: "Todas as páginas",
        emptyPlaceholder: "Sem páginas disponíveis",
        clearable: true,
      },
      {
        key: "captura",
        label: "Período de captura",
        type: "date-range",
        clearable: true,
      },
    ],
    [originOptions, popupOptions],
  );

  const filterValues = useMemo(
    () => ({
      popupId: selectedPopupId,
      origemPath: selectedOrigin,
      captura: selectedDateRange,
    }),
    [selectedDateRange, selectedOrigin, selectedPopupId],
  );

  const handleSearch = useCallback(() => {
    setFilters((previous) => ({
      ...previous,
      search: pendingSearch.trim() || undefined,
      page: 1,
    }));
  }, [pendingSearch]);

  const handleFilterChange = useCallback(
    (key: string, value: string | string[] | DateRange | Date | null) => {
      if (key === "popupId") {
        const next = Array.isArray(value)
          ? value[0] ?? null
          : typeof value === "string"
            ? value
            : null;
        setSelectedPopupId(next);
        setFilters((previous) => ({
          ...previous,
          popupId: next || undefined,
          page: 1,
        }));
        return;
      }

      if (key === "origemPath") {
        const next = typeof value === "string" ? value : null;
        setSelectedOrigin(next);
        setFilters((previous) => ({
          ...previous,
          origemPath: next?.trim() || undefined,
          page: 1,
        }));
        return;
      }

      if (key === "captura") {
        const nextRange = (value as DateRange) ?? { from: null, to: null };
        setSelectedDateRange(nextRange);
        setFilters((previous) => ({
          ...previous,
          from: nextRange.from ? nextRange.from.toISOString() : undefined,
          to: nextRange.to ? nextRange.to.toISOString() : undefined,
          page: 1,
        }));
      }
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    setPendingSearch("");
    setSelectedPopupId(null);
    setSelectedDateRange({ from: null, to: null });
    setSelectedOrigin(null);
    setFilters({ page: 1, pageSize: 10 });
  }, []);

  const handleOpenLead = useCallback(
    (contato: PopupLeadListItem) => {
      setLoadingAction({ type: "view", id: contato.id });
      router.push(`/dashboard/marketing/contatos/${contato.id}`);
    },
    [router],
  );

  const handleOpenHistory = useCallback(async (contato: PopupLeadListItem) => {
    setLoadingAction({ type: "history", id: contato.id });
    setSelectedContact(contato);

    try {
      const [detail, history] = await Promise.all([
        getPopupContact(contato.id),
        getPopupContactHistory(contato.id),
      ]);

      setContactDetail(detail);
      setContactHistory(history);
      setHistoryModalOpen(true);
    } catch (error) {
      toastCustom.error(
        error instanceof Error ? error.message : "Erro ao carregar histórico.",
      );
    } finally {
      setLoadingAction({ type: null, id: null });
    }
  }, []);

  return (
    <div className="min-h-full space-y-6">
      <FilterBar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClearAll={handleClearAll}
        search={{
          label: "Pesquisar contato",
          value: pendingSearch,
          onChange: setPendingSearch,
          placeholder: "Buscar por nome, email, telefone ou WhatsApp...",
          onKeyDown: (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          },
        }}
        rightActions={
          <ButtonCustom
            variant="primary"
            size="lg"
            disabled={contactsQuery.isFetching}
            onClick={handleSearch}
          >
            Pesquisar
          </ButtonCustom>
        }
      />

      {contactsQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {contactsQuery.error.message || "Erro ao carregar contatos."}
          </AlertDescription>
        </Alert>
      )}

      {!showEmpty && (
        <PopupContactsTable
          contatos={contatos}
          isLoading={showLoading}
          pagination={pagination}
          visiblePages={visiblePages}
          viewingId={loadingAction.type === "view" ? loadingAction.id : null}
          onPageChange={(page) =>
            setFilters((previous) => ({ ...previous, page }))
          }
          onView={handleOpenLead}
          onHistory={handleOpenHistory}
        />
      )}

      {showEmpty && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <EmptyState
            fullHeight
            illustration="fileNotFound"
            illustrationAlt="Nenhum contato encontrado"
            title="Nenhum contato encontrado"
            description="Os leads capturados pelos pop-ups aparecerão aqui."
          />
        </div>
      )}

      <InscricoesHistoricoModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        contactDetail={contactDetail}
        contactHistory={contactHistory}
      />
    </div>
  );
}
