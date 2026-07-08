"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import { recipientListsFilterFields } from "./constants";
import { RecipientListsTable } from "./components";
import { useRecipientListsDashboardData } from "./hooks";
import { RecipientListDeleteModal } from "./modals";

export function RecipientListsDashboard({ className }: { className?: string }) {
  const router = useRouter();
  const {
    lists,
    isLoading,
    error,
    pagination,
    visiblePages,
    pendingSearch,
    selectedStatus,
    selectedMembershipMode,
    selectedUpdatedAt,
    listToDelete,
    deletingId,
    recalculatingId,
    showEmptyState,
    updateFilters,
    setPendingSearch,
    handleFilterChange,
    handlePageChange,
    handleOpenDelete,
    handleDeleteOpenChange,
    handleConfirmDelete,
    handleRecalculate,
    handleEdit,
  } = useRecipientListsDashboardData();

  return (
    <div className={cn("min-h-full space-y-6", className)}>
      <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
        <ButtonCustom
          variant="primary"
          size="md"
          icon="Plus"
          fullWidth
          className="sm:w-auto"
          onClick={() => router.push("/dashboard/marketing/listas/criar")}
        >
          Criar lista
        </ButtonCustom>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <div className="py-4">
          <FilterBar
            fields={recipientListsFilterFields}
            values={{
              status: selectedStatus,
              membershipMode: selectedMembershipMode,
              updatedAt: selectedUpdatedAt,
            }}
            onChange={handleFilterChange}
            search={{
              label: "Pesquisar lista",
              value: pendingSearch,
              onChange: setPendingSearch,
              placeholder: "Buscar por nome ou ID da lista...",
            }}
            rightActions={
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={() =>
                  updateFilters({ search: pendingSearch.trim() || undefined })
                }
                disabled={isLoading}
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!showEmptyState && (
        <RecipientListsTable
          lists={lists}
          isLoading={isLoading}
          pagination={pagination}
          visiblePages={visiblePages}
          recalculatingId={recalculatingId}
          deletingId={deletingId}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleOpenDelete}
          onRecalculate={handleRecalculate}
        />
      )}

      {showEmptyState && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <EmptyState
            fullHeight
            illustration="fileNotFound"
            illustrationAlt="Nenhuma lista encontrada"
            title="Nenhuma lista encontrada"
            description="Crie audiências salvas para reutilizar no editor de e-mails."
          />
        </div>
      )}

      <RecipientListDeleteModal
        item={listToDelete}
        isOpen={Boolean(listToDelete)}
        isDeleting={Boolean(deletingId)}
        onOpenChange={handleDeleteOpenChange}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
