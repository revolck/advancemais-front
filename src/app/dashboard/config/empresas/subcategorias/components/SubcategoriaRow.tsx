"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EmpresaVagaSubcategoria,
  EmpresaVagaCategoria,
} from "@/api/empresas";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";

interface SubcategoriaRowProps {
  subcategoria: EmpresaVagaSubcategoria & { categoriaPai?: EmpresaVagaCategoria };
  onEdit: (subcategoria: EmpresaVagaSubcategoria & { categoriaPai?: EmpresaVagaCategoria }) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function SubcategoriaRow({
  subcategoria,
  onEdit,
  onDelete,
  isDeleting: externalIsDeleting = false,
}: SubcategoriaRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Data inválida";
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(subcategoria.id);
    setShowDeleteModal(false);
  };

  const customDeleteContent = (
    item: EmpresaVagaSubcategoria & { categoriaPai?: EmpresaVagaCategoria }
  ) => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium !text-red-800 !leading-normal">
            A exclusão remove imediatamente as vagas vinculadas a esta subcategoria.
          </p>
          <ul className="text-xs text-gray-700 space-y-1 ml-3">
            <li>
              • Vagas que usam esta subcategoria precisarão ser reclassificadas
            </li>
            <li>
              • A subcategoria será removida permanentemente do catálogo corporativo
            </li>
          </ul>
        </div>
      </div>

      <p className="!text-base text-gray-600 !leading-normal !mb-0">
        Deseja realmente excluir esta subcategoria?
      </p>
    </div>
  );

  return (
    <>
      <TableCell className="font-medium min-w-[200px] max-w-[300px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {subcategoria.nome}
          </span>
          {subcategoria.codSubcategoria && (
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0 w-fit">
              {subcategoria.codSubcategoria}
            </code>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="max-w-[200px]">
          <Badge variant="outline" className="text-xs">
            {subcategoria.categoriaPai?.nome || "Categoria não informada"}
          </Badge>
        </div>
      </TableCell>

      <TableCell>
        <div className="max-w-[240px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-help">
                {subcategoria.descricao.length > 40
                  ? `${subcategoria.descricao.substring(0, 40)}...`
                  : subcategoria.descricao}
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {subcategoria.descricao}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(subcategoria.criadoEm)}
        </span>
      </TableCell>

      <TableCell className="text-right w-16">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(subcategoria)}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
                aria-label="Editar subcategoria"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              Editar subcategoria
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                disabled={externalIsDeleting}
                className={cn(
                  "h-8 w-8 rounded-full text-red-500 hover:text-white",
                  externalIsDeleting ? "cursor-wait" : "hover:bg-red-500"
                )}
                aria-label="Excluir subcategoria"
              >
                {externalIsDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {externalIsDeleting ? "Excluindo..." : "Excluir subcategoria"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        item={subcategoria}
        itemName="a subcategoria de vagas"
        onConfirmDelete={handleConfirmDelete}
        isDeleting={externalIsDeleting}
        customDeleteContent={customDeleteContent}
        confirmButtonText="Excluir subcategoria"
        title="Excluir subcategoria"
        description={`Tem certeza que deseja remover "${subcategoria.nome}"?`}
      />
    </>
  );
}
