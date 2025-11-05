"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusProcesso } from "../types";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";

interface StatusProcessoRowProps {
  status: StatusProcesso;
  onEdit: () => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function StatusProcessoRow({
  status,
  onEdit,
  onDelete,
  isDeleting = false,
}: StatusProcessoRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Função para obter cor baseada no código do status removida

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(status.id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Skeleton de loading durante delete
  if (isDeleting) {
    return (
      <>
        {/* Coluna Nome */}
        <TableCell className="py-4 min-w-[200px] max-w-[240px]">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-32" />
          </div>
        </TableCell>

        {/* Coluna Código removida */}

        {/* Coluna Ordem removida */}

        {/* Coluna Padrão */}
        <TableCell className="min-w-[80px] max-w-[100px]">
          <Skeleton className="h-5 w-16 rounded-full" />
        </TableCell>

        {/* Coluna Status */}
        <TableCell className="min-w-[80px] max-w-[100px]">
          <Skeleton className="h-5 w-16 rounded-full" />
        </TableCell>

        {/* Coluna Criado em */}
        <TableCell className="min-w-[140px] max-w-[180px]">
          <Skeleton className="h-4 w-20" />
        </TableCell>

        {/* Coluna Ações */}
        <TableCell className="text-right w-16">
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="h-8 w-8 rounded-full border border-dashed border-red-200 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            </div>
          </div>
        </TableCell>
      </>
    );
  }

  return (
    <>
      {/* Coluna Nome */}
      <TableCell className="py-4 min-w-[200px] max-w-[240px]">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-gray-900 truncate text-sm">
            {status.nome}
          </div>
          {status.descricao && (
            <div className="text-xs text-gray-500 truncate mt-1">
              {status.descricao}
            </div>
          )}
        </div>
      </TableCell>

      {/* Coluna Código removida */}

      {/* Coluna Ordem removida */}

      {/* Coluna Padrão */}
      <TableCell className="min-w-[80px] max-w-[100px]">
        {status.isDefault ? (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 uppercase tracking-wide text-[10px]">
            Sim
          </Badge>
        ) : (
          <span className="text-sm text-gray-500">—</span>
        )}
      </TableCell>

      {/* Coluna Status */}
      <TableCell className="min-w-[80px] max-w-[100px]">
        <Badge
          className={cn(
            "uppercase tracking-wide text-[10px]",
            status.ativo
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200",
          )}
        >
          {status.ativo ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>

      {/* Coluna Criado em */}
      <TableCell className="min-w-[140px] max-w-[180px]">
        <div className="text-sm text-gray-600">
          {formatDate(status.criadoEm)}
        </div>
      </TableCell>

      {/* Coluna Ações */}
      <TableCell className="text-right w-16">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                aria-label="Editar status"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Editar status</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-red-500 cursor-pointer"
                aria-label="Excluir status"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {isDeleting ? "Excluindo..." : "Excluir status"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal<StatusProcesso>
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        item={status}
        itemName="o status de processo"
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        confirmButtonText="Sim, excluir status"
        title="Excluir Status de Processo"
      />
    </>
  );
}
