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
import type { CategoriaCurso } from "@/api/cursos/categorias/types";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
import { SubcategoriasModal } from "./SubcategoriasModal";

interface CategoriaRowProps {
  categoria: CategoriaCurso;
  linkedCoursesCount?: number;
  onEdit: (categoria: CategoriaCurso) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function CategoriaRow({
  categoria,
  linkedCoursesCount = 0,
  onEdit,
  onDelete,
  isDeleting: externalIsDeleting = false,
}: CategoriaRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubcategoriasModal, setShowSubcategoriasModal] = useState(false);

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

  // Contar subcategorias
  const subcategoriasCount = categoria.subcategorias?.length || 0;
  const hasLinkedCourses = linkedCoursesCount > 0;
  const canDelete = !hasLinkedCourses && !externalIsDeleting;
  const deleteBlockedMessage = `Não é possível excluir: existe${
    linkedCoursesCount > 1 ? "m" : ""
  } ${linkedCoursesCount} curso${
    linkedCoursesCount > 1 ? "s" : ""
  } vinculado${linkedCoursesCount > 1 ? "s" : ""}.`;

  const handleDeleteClick = () => {
    if (!canDelete) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(categoria.id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleShowSubcategorias = () => {
    setShowSubcategoriasModal(true);
  };

  // Conteúdo customizado para delete de categoria
  const customDeleteContent = (item: CategoriaCurso) => {
    const subcategoriasCount = item.subcategorias?.length || 0;

    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <div className="space-y-1">
              <p className="text-sm font-medium !text-red-800 !leading-normal">
                Esta ação é irreversível e pode impactar todo o sistema!
              </p>
              <ul className="text-xs text-gray-700 space-y-1 ml-3">
                {subcategoriasCount > 0 && (
                  <li>
                    • {subcategoriasCount} subcategoria
                    {subcategoriasCount > 1 ? "s" : ""} vinculada
                    {subcategoriasCount > 1 ? "s" : ""} a esta categoria serão
                    removidas
                  </li>
                )}
                <li>
                  • Todos os cursos associados a esta categoria serão afetados
                </li>
                <li>
                  • Todas as configurações e dados relacionados serão perdidos
                </li>
                <li>• A categoria será removida permanentemente do sistema</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="!text-base text-gray-600 !leading-normal !mb-0">
          Tem certeza absoluta que deseja continuar com esta exclusão?
        </p>
      </div>
    );
  };

  return (
    <>
      {/* Nome da Categoria + Código */}
      <TableCell className="font-medium min-w-[200px] max-w-[300px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {categoria.nome}
          </span>
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0 w-fit">
            {categoria.codCategoria}
          </code>
        </div>
      </TableCell>

      {/* Descrição */}
      <TableCell>
        <div className="max-w-[200px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-help">
                {categoria.descricao.length > 30
                  ? `${categoria.descricao.substring(0, 30)}...`
                  : categoria.descricao}
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {categoria.descricao}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      {/* Subcategorias */}
      <TableCell>
        <div className="flex items-center gap-2">
          {subcategoriasCount > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShowSubcategorias}
                  className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer underline-offset-2 hover:underline transition-colors"
                >
                  {subcategoriasCount}
                </button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                Clique para ver as subcategorias
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-sm text-muted-foreground">
              {subcategoriasCount}
            </span>
          )}

          {subcategoriasCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-blue-600 cursor-help">
                  subcategoria{subcategoriasCount > 1 ? "s" : ""}
                </span>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                {subcategoriasCount} subcategoria
                {subcategoriasCount > 1 ? "s" : ""} vinculada
                {subcategoriasCount > 1 ? "s" : ""}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>

      {/* Data de Criação */}
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(categoria.criadoEm)}
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
                onClick={() => onEdit(categoria)}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                aria-label="Editar categoria"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Editar categoria</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  disabled={!canDelete}
                  className={cn(
                    "h-8 w-8 rounded-full text-gray-500",
                    canDelete
                      ? "hover:text-white hover:bg-red-500 cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  )}
                  aria-label="Excluir categoria"
                >
                  {externalIsDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {externalIsDeleting
                ? "Excluindo..."
                : hasLinkedCourses
                  ? deleteBlockedMessage
                  : "Excluir categoria"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal<CategoriaCurso>
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        item={categoria}
        itemName="a categoria de curso"
        onConfirmDelete={handleConfirmDelete}
        isDeleting={externalIsDeleting}
        customDeleteContent={customDeleteContent}
        confirmButtonText="Sim, excluir categoria"
      />

      {/* Modal de Listagem de Subcategorias */}
      <SubcategoriasModal
        isOpen={showSubcategoriasModal}
        onOpenChange={setShowSubcategoriasModal}
        categoria={categoria}
      />
    </>
  );
}
