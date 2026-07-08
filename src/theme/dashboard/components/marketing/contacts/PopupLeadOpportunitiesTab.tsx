"use client";

import { useMemo, useState } from "react";
import { Calendar, Pencil, Plus, Target, Trash2, X } from "lucide-react";

import type {
  CreatePopupLeadOpportunityPayload,
  PopupLeadOpportunity,
  PopupLeadOpportunityStatus,
  UpdatePopupLeadOpportunityPayload,
} from "@/api/websites/components/popups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ButtonCustom,
  EmptyState,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SelectCustom,
} from "@/components/ui/custom";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AddPopupLeadOpportunityModal } from "./AddPopupLeadOpportunityModal";
import { EditPopupLeadOpportunityModal } from "./EditPopupLeadOpportunityModal";
import {
  formatPopupLeadOpportunityCurrency,
  formatPopupLeadOpportunityDate,
  getPopupLeadOpportunityStatusBadgeClass,
  getPopupLeadOpportunityStatusLabel,
  POPUP_LEAD_OPPORTUNITY_STATUS_OPTIONS,
} from "./PopupLeadOpportunities.shared";

const ITEMS_PER_PAGE = 10;

export function PopupLeadOpportunitiesTab({
  opportunities,
  ownerOptions,
  defaultOwnerUsuarioId,
  isLoading,
  isCreating,
  isUpdating,
  deletingId,
  onCreateOpportunity,
  onUpdateOpportunity,
  onDeleteOpportunity,
}: {
  opportunities: PopupLeadOpportunity[];
  ownerOptions: Array<{ value: string; label: string }>;
  defaultOwnerUsuarioId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  deletingId: string | null;
  onCreateOpportunity: (
    payload: CreatePopupLeadOpportunityPayload,
  ) => Promise<void> | void;
  onUpdateOpportunity: (
    opportunityId: string,
    payload: UpdatePopupLeadOpportunityPayload,
  ) => Promise<void> | void;
  onDeleteOpportunity: (opportunityId: string) => Promise<void> | void;
}) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [pendingOwner, setPendingOwner] = useState<string | null>(null);
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);
  const [appliedOwner, setAppliedOwner] = useState<string | null>(null);
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] =
    useState<PopupLeadOpportunity | null>(null);
  const [opportunityPendingDelete, setOpportunityPendingDelete] =
    useState<PopupLeadOpportunity | null>(null);

  const sortedOpportunities = useMemo(
    () =>
      [...opportunities].sort(
        (left, right) =>
          new Date(right.criadoEm).getTime() -
          new Date(left.criadoEm).getTime(),
      ),
    [opportunities],
  );

  const filteredOpportunities = useMemo(() => {
    return sortedOpportunities.filter((opportunity) => {
      if (appliedStatus && opportunity.status !== appliedStatus) {
        return false;
      }

      if (appliedOwner && (opportunity.owner?.id ?? null) !== appliedOwner) {
        return false;
      }

      if (appliedDateRange.from || appliedDateRange.to) {
        const createdAt = new Date(opportunity.criadoEm);

        if (appliedDateRange.from) {
          const fromDate = new Date(appliedDateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (createdAt < fromDate) return false;
        }

        if (appliedDateRange.to) {
          const toDate = new Date(appliedDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (createdAt > toDate) return false;
        }
      }

      return true;
    });
  }, [appliedDateRange, appliedOwner, appliedStatus, sortedOpportunities]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOpportunities = filteredOpportunities.slice(
    startIndex,
    endIndex,
  );

  const hasActiveFilters = Boolean(
    appliedStatus ||
    appliedOwner ||
    appliedDateRange.from ||
    appliedDateRange.to,
  );
  const isDeleteConfirmPending =
    opportunityPendingDelete !== null &&
    deletingId === opportunityPendingDelete.id;

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

  const handleStatusChange = (value: string | null) => {
    setPendingStatus(value);
    setAppliedStatus(value);
    setCurrentPage(1);
  };

  const handleOwnerChange = (value: string | null) => {
    setPendingOwner(value);
    setAppliedOwner(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (value: DateRange) => {
    const nextValue = {
      from: value?.from ?? null,
      to: value?.to ?? null,
    };

    setPendingDateRange(nextValue);
    setAppliedDateRange(nextValue);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setPendingStatus(null);
    setPendingOwner(null);
    setPendingDateRange({ from: null, to: null });
    setAppliedStatus(null);
    setAppliedOwner(null);
    setAppliedDateRange({ from: null, to: null });
    setCurrentPage(1);
  };

  if (isLoading) {
    return <PopupLeadOpportunitiesTabSkeleton />;
  }

  if (opportunities.length === 0) {
    return (
      <>
        <div className="space-y-4">
          <div className="flex justify-end">
            <ButtonCustom
              variant="primary"
              size="lg"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar oportunidade
            </ButtonCustom>
          </div>
          <EmptyState
            illustration="fileNotFound"
            title="Nenhuma oportunidade encontrada"
            description="Este lead ainda não possui oportunidades cadastradas."
          />
        </div>

        <AddPopupLeadOpportunityModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          isSubmitting={isCreating}
          ownerOptions={ownerOptions}
          defaultOwnerUsuarioId={defaultOwnerUsuarioId}
          onSubmit={async (payload) => {
            try {
              await Promise.resolve(onCreateOpportunity(payload));
              setIsAddModalOpen(false);
            } catch {
              return;
            }
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-[220px] md:w-[220px]">
            <SelectCustom
              mode="single"
              options={POPUP_LEAD_OPPORTUNITY_STATUS_OPTIONS}
              value={pendingStatus}
              onChange={(value) =>
                handleStatusChange((value as string) || null)
              }
              placeholder="Filtrar por status"
              size="md"
              fullWidth
            />
          </div>

          <div className="w-full sm:w-[260px] md:w-[260px]">
            <SelectCustom
              mode="single"
              options={ownerOptions}
              value={pendingOwner}
              onChange={(value) => handleOwnerChange((value as string) || null)}
              placeholder="Filtrar por responsável"
              size="md"
              fullWidth
            />
          </div>

          <div className="w-full sm:w-[280px] md:w-[280px]">
            <DatePickerRangeCustom
              value={pendingDateRange}
              onChange={(range) =>
                handleDateRangeChange(range ?? { from: null, to: null })
              }
              placeholder="Filtrar por data"
              size="md"
              clearable
              format="dd/MM/yyyy"
            />
          </div>

          <div className="w-full sm:w-auto sm:ml-auto">
            <ButtonCustom
              variant="primary"
              size="lg"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Adicionar oportunidade
            </ButtonCustom>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {appliedStatus ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                Status:{" "}
                {getPopupLeadOpportunityStatusLabel(
                  appliedStatus as PopupLeadOpportunityStatus,
                )}
                <button
                  type="button"
                  onClick={() => handleStatusChange(null)}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  aria-label="Limpar status"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ) : null}

            {appliedOwner ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                Responsável:{" "}
                {ownerOptions.find((item) => item.value === appliedOwner)
                  ?.label ?? "Responsável"}
                <button
                  type="button"
                  onClick={() => handleOwnerChange(null)}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  aria-label="Limpar responsável"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ) : null}

            {(appliedDateRange.from || appliedDateRange.to) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                Período:{" "}
                {appliedDateRange.from?.toLocaleDateString("pt-BR") || "..."} -{" "}
                {appliedDateRange.to?.toLocaleDateString("pt-BR") || "..."}
                <button
                  type="button"
                  onClick={() =>
                    handleDateRangeChange({ from: null, to: null })
                  }
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  aria-label="Limpar período"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto cursor-pointer text-sm font-medium text-[var(--secondary-color)] hover:text-[var(--secondary-color)]/90"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                <TableHead className="py-4 font-medium text-gray-700">
                  Oportunidade
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Responsável
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Criado em
                </TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <p className="text-gray-500">
                      {hasActiveFilters
                        ? "Nenhuma oportunidade encontrada com os filtros aplicados."
                        : "Nenhuma oportunidade encontrada."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOpportunities.map((opportunity) => {
                  const isDeleting = deletingId === opportunity.id;
                  const ownerLabel =
                    opportunity.owner?.nome ||
                    opportunity.owner?.email ||
                    "Sem responsável";

                  return (
                    <TableRow
                      key={opportunity.id}
                      className="border-gray-100 transition-colors hover:bg-gray-50/50"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <Target className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">
                              {opportunity.titulo}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPopupLeadOpportunityCurrency(
                                opportunity.valorEsperado,
                              )}{" "}
                              • Fechamento:{" "}
                              {formatPopupLeadOpportunityDate(
                                opportunity.closeDate,
                              )}
                            </div>
                            <div className="truncate text-xs text-gray-400">
                              {opportunity.descricao || "Sem descrição"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium",
                            getPopupLeadOpportunityStatusBadgeClass(
                              opportunity.status,
                            ),
                          )}
                        >
                          {getPopupLeadOpportunityStatusLabel(
                            opportunity.status,
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            {ownerLabel}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {opportunity.owner?.email || "Equipe interna"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>
                            {formatPopupLeadOpportunityDate(
                              opportunity.criadoEm,
                            )}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setEditingOpportunity(opportunity)
                                }
                                className="h-8 w-8 cursor-pointer rounded-full text-gray-500 hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Editar oportunidade"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                              Editar oportunidade
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setOpportunityPendingDelete(opportunity)
                                }
                                disabled={isDeleting}
                                className="h-8 w-8 cursor-pointer rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Excluir oportunidade"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                              {isDeleting
                                ? "Removendo..."
                                : "Excluir oportunidade"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando{" "}
                {Math.min(startIndex + 1, filteredOpportunities.length)} a{" "}
                {Math.min(endIndex, filteredOpportunities.length)} de{" "}
                {filteredOpportunities.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                Anterior
              </ButtonCustom>

              <div className="flex items-center gap-1">
                {visiblePages.map((pageNum) => (
                  <ButtonCustom
                    key={pageNum}
                    variant={pageNum === currentPage ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </ButtonCustom>
                ))}
              </div>

              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Próxima
              </ButtonCustom>
            </div>
          </div>
        )}
      </div>

      <AddPopupLeadOpportunityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        isSubmitting={isCreating}
        ownerOptions={ownerOptions}
        defaultOwnerUsuarioId={defaultOwnerUsuarioId}
        onSubmit={async (payload) => {
          try {
            await Promise.resolve(onCreateOpportunity(payload));
            setIsAddModalOpen(false);
          } catch {
            return;
          }
        }}
      />

      <EditPopupLeadOpportunityModal
        isOpen={editingOpportunity !== null}
        opportunity={editingOpportunity}
        onClose={() => setEditingOpportunity(null)}
        isSubmitting={isUpdating}
        ownerOptions={ownerOptions}
        onSubmit={async (opportunityId, payload) => {
          try {
            await Promise.resolve(onUpdateOpportunity(opportunityId, payload));
            setEditingOpportunity(null);
          } catch {
            return;
          }
        }}
      />

      <ModalCustom
        isOpen={opportunityPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleteConfirmPending) {
            setOpportunityPendingDelete(null);
          }
        }}
        size="md"
        backdrop="blur"
        isDismissable={!isDeleteConfirmPending}
      >
        <ModalContentWrapper hideCloseButton={isDeleteConfirmPending}>
          <ModalHeader>
            <ModalTitle>Excluir oportunidade</ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <p className="!mb-0 !text-sm leading-6 text-slate-600">
              Esta oportunidade será removida do histórico deste contato.
              Deseja continuar?{" "}
              {opportunityPendingDelete ? (
                <span className="font-medium text-slate-900">
                  "{opportunityPendingDelete.titulo}"
                </span>
              ) : null}
            </p>
          </ModalBody>

          <ModalFooter className="flex justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={() => setOpportunityPendingDelete(null)}
              disabled={isDeleteConfirmPending}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="danger"
              onClick={async () => {
                if (!opportunityPendingDelete) return;

                try {
                  await Promise.resolve(
                    onDeleteOpportunity(opportunityPendingDelete.id),
                  );
                  setOpportunityPendingDelete(null);
                } catch {
                  return;
                }
              }}
              disabled={isDeleteConfirmPending}
              isLoading={isDeleteConfirmPending}
              loadingText="Excluindo..."
            >
              Excluir oportunidade
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}

export function PopupLeadOpportunitiesTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-[220px]">
            <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
          </div>
          <div className="w-full sm:w-[260px]">
            <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
          </div>
          <div className="w-full sm:w-[280px]">
            <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
          </div>
          <div className="w-full sm:w-52 sm:ml-auto">
            <Skeleton className="h-10 w-full rounded-md bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead className="py-4 font-medium text-gray-700">
                Oportunidade
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                Status
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                Responsável
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                Criado em
              </TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={`opportunity-skeleton-${index}`}>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48 rounded bg-gray-200" />
                      <Skeleton className="h-3 w-40 rounded bg-gray-200" />
                      <Skeleton className="h-3 w-56 rounded bg-gray-200" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-32 rounded bg-gray-200" />
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-32 rounded bg-gray-200" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
