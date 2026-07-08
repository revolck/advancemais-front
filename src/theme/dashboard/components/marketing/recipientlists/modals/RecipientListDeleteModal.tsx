"use client";

import type { RecipientListListItem } from "@/api/websites/components/recipientlists";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";

interface RecipientListDeleteModalProps {
  item: RecipientListListItem | null;
  isOpen: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (item: RecipientListListItem) => void;
}

export function RecipientListDeleteModal({
  item,
  isOpen,
  isDeleting,
  onOpenChange,
  onConfirmDelete,
}: RecipientListDeleteModalProps) {
  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      item={item}
      itemName="a lista"
      onConfirmDelete={onConfirmDelete}
      isDeleting={isDeleting}
      confirmButtonText="Sim, excluir lista"
      title="Excluir lista"
      description="Remova esta lista de audiência."
      defaultDeleteContent={(currentItem) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="!mb-1 !text-sm font-semibold text-slate-950">
              {currentItem.nome}
            </p>
            <p className="!mb-0 !text-sm text-slate-600">
              Ela deixará de aparecer na seleção de destinatários.
            </p>
          </div>
          <p className="!mb-0 !text-sm leading-6 text-slate-600">
            As campanhas não usarão mais esta audiência salva.
          </p>
          <p className="!mb-0 !text-sm leading-6 text-slate-600">
            Esta ação é permanente.
          </p>
        </div>
      )}
    />
  );
}
