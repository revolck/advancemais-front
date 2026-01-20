"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
import type { CandidatoAreaInteresse, CandidatoSubareaInteresse } from "@/api/candidatos/types";

interface SubareaInteresseRowProps {
  subarea: CandidatoSubareaInteresse & { areaPai?: CandidatoAreaInteresse };
  onEdit: (subarea: CandidatoSubareaInteresse) => void;
  onDelete: (id: number | string) => void;
  isDeleting?: boolean;
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Data inválida";
  }
}

export function SubareaInteresseRow({
  subarea,
  onEdit,
  onDelete,
  isDeleting: externalIsDeleting = false,
}: SubareaInteresseRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const customDeleteContent = () => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium !text-red-800 !leading-normal">
          Esta ação é irreversível.
        </p>
        <p className="text-xs text-gray-700 !leading-normal">
          A subárea será removida permanentemente do sistema.
        </p>
      </div>
      <p className="!text-base text-gray-600 !leading-normal !mb-0">
        Tem certeza que deseja excluir esta subárea?
      </p>
    </div>
  );

  return (
    <>
      {/* Subárea */}
      <TableCell className="font-medium min-w-[240px] max-w-[420px]">
        <span className="text-sm font-semibold text-foreground">
          {subarea.nome}
        </span>
      </TableCell>

      {/* Área Pai */}
      <TableCell className="min-w-[220px] max-w-[320px]">
        <span className="text-sm text-muted-foreground">
          {(subarea as any).areaPai?.categoria || `ID ${subarea.areaId}`}
        </span>
      </TableCell>

      {/* Criado em */}
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(subarea.criadoEm)}
        </span>
      </TableCell>

      {/* Ações */}
      <TableCell className="text-right w-16">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(subarea)}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                aria-label="Editar subárea"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Editar subárea</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteModal(true)}
                disabled={externalIsDeleting}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-red-500 cursor-pointer"
                aria-label="Excluir subárea"
              >
                {externalIsDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {externalIsDeleting ? "Excluindo..." : "Excluir subárea"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      <DeleteConfirmModal<CandidatoSubareaInteresse>
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        item={subarea}
        itemName="a subárea de interesse"
        onConfirmDelete={() => {
          onDelete(subarea.id);
          setShowDeleteModal(false);
        }}
        isDeleting={externalIsDeleting}
        customDeleteContent={customDeleteContent as any}
        confirmButtonText="Sim, excluir subárea"
      />
    </>
  );
}

