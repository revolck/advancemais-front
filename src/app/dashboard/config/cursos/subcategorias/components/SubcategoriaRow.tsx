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
  SubcategoriaCurso,
  CategoriaCurso,
} from "@/api/cursos/categorias/types";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";

interface SubcategoriaRowProps {
  subcategoria: SubcategoriaCurso & { categoriaPai?: CategoriaCurso };
  onEdit: (subcategoria: SubcategoriaCurso) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function SubcategoriaRow({
  subcategoria,
  onEdit,
  onDelete,
  isDeleting: externalIsDeleting = false,
}: SubcategoriaRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Formatar data de criação
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

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Conteúdo customizado para delete de subcategoria
  const customDeleteContent = (item: SubcategoriaCurso) => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium !text-red-800 !leading-normal">
              Esta ação é irreversível e pode impactar todo o sistema!
            </p>
            <ul className="text-xs text-gray-700 space-y-1 ml-3">
              <li>
                • Todos os cursos associados a esta subcategoria serão afetados
              </li>
              <li>
                • Todas as configurações e dados relacionados serão perdidos
              </li>
              <li>• A subcategoria será removida permanentemente do sistema</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="!text-base text-gray-600 !leading-normal !mb-0">
        Tem certeza absoluta que deseja continuar com esta exclusão?
      </p>
    </div>
  );

  return (
    <>
      {/* Nome da Subcategoria + Código */}
      <TableCell className="font-medium min-w-[200px] max-w-[300px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {subcategoria.nome}
          </span>
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0 w-fit">
            {subcategoria.codSubcategoria}
          </code>
        </div>
      </TableCell>

      {/* Categoria Pai */}
      <TableCell>
        <div className="max-w-[180px]">
          <span className="text-sm text-muted-foreground">
            {(subcategoria as any).categoriaPai?.nome || "N/A"}
          </span>
        </div>
      </TableCell>

      {/* Descrição */}
      <TableCell>
        <div className="max-w-[200px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-help">
                {subcategoria.descricao.length > 30
                  ? `${subcategoria.descricao.substring(0, 30)}...`
                  : subcategoria.descricao}
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {subcategoria.descricao}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      {/* Data de Criação */}
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(subcategoria.criadoEm)}
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
                onClick={() => onEdit(subcategoria)}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                aria-label="Editar subcategoria"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Editar subcategoria</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                disabled={externalIsDeleting}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-red-500 cursor-pointer"
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

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal<SubcategoriaCurso>
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        item={subcategoria}
        itemName="a subcategoria de curso"
        onConfirmDelete={handleConfirmDelete}
        isDeleting={externalIsDeleting}
        customDeleteContent={customDeleteContent}
        confirmButtonText="Sim, excluir subcategoria"
      />
    </>
  );
}
