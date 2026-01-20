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
import type { CandidatoAreaInteresse } from "@/api/candidatos/types";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";

interface AreaInteresseRowProps {
  area: CandidatoAreaInteresse;
  onEdit: (area: CandidatoAreaInteresse) => void;
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

export function AreaInteresseRow({
  area,
  onEdit,
  onDelete,
  isDeleting: externalIsDeleting = false,
}: AreaInteresseRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const subareasCount = area.subareas?.length || 0;

  const customDeleteContent = (item: CandidatoAreaInteresse) => {
    const count = item.subareas?.length || 0;
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium !text-red-800 !leading-normal">
            Esta ação é irreversível.
          </p>
          {count > 0 && (
            <p className="text-xs text-gray-700 !leading-normal">
              {count} subárea{count > 1 ? "s" : ""} vinculada
              {count > 1 ? "s" : ""} também será{count > 1 ? "ão" : ""} removida
              {count > 1 ? "s" : ""}.
            </p>
          )}
        </div>
        <p className="!text-base text-gray-600 !leading-normal !mb-0">
          Tem certeza que deseja excluir esta área de interesse?
        </p>
      </div>
    );
  };

  return (
    <>
      {/* Área */}
      <TableCell className="font-medium min-w-[260px] max-w-[420px]">
        <span className="text-sm font-semibold text-foreground">
          {area.categoria}
        </span>
      </TableCell>

      {/* Subáreas */}
      <TableCell>
        <span className="text-sm text-muted-foreground">{subareasCount}</span>
      </TableCell>

      {/* Criado em */}
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(area.criadoEm)}
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
                onClick={() => onEdit(area)}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                aria-label="Editar área"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Editar área</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteModal(true)}
                disabled={externalIsDeleting}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-red-500 cursor-pointer"
                aria-label="Excluir área"
              >
                {externalIsDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {externalIsDeleting ? "Excluindo..." : "Excluir área"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      <DeleteConfirmModal<CandidatoAreaInteresse>
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        item={area}
        itemName="a área de interesse"
        onConfirmDelete={() => {
          onDelete(area.id);
          setShowDeleteModal(false);
        }}
        isDeleting={externalIsDeleting}
        customDeleteContent={customDeleteContent}
        confirmButtonText="Sim, excluir área"
      />
    </>
  );
}

