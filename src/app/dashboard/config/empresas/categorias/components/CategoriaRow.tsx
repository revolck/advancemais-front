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
import type { EmpresaVagaCategoria } from "@/api/empresas";
import { DeleteConfirmModal } from "@/components/ui/custom/list-manager/components/DeleteConfirmModal";
import { SubcategoriasModal } from "./SubcategoriasModal";

interface CategoriaRowProps {
  categoria: EmpresaVagaCategoria;
  onEdit: (categoria: EmpresaVagaCategoria) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function CategoriaRow({
  categoria,
  onEdit,
  onDelete,
  isDeleting: externalIsDeleting = false,
}: CategoriaRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubcategoriasModal, setShowSubcategoriasModal] = useState(false);

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

  const subcategoriasCount = categoria.subcategorias?.length || 0;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(categoria.id);
    setShowDeleteModal(false);
  };

  const handleShowSubcategorias = () => {
    setShowSubcategoriasModal(true);
  };

  const customDeleteContent = (item: EmpresaVagaCategoria) => {
    const count = item.subcategorias?.length || 0;

    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium !text-red-800 !leading-normal">
              Excluir uma categoria impacta diretamente as vagas cadastradas.
            </p>
            <ul className="text-xs text-gray-700 space-y-1 ml-3">
              {count > 0 && (
                <li>
                  • {count} subcategoria{count > 1 ? "s" : ""} será
                  removida juntamente com esta categoria
                </li>
              )}
              <li>• As vagas vinculadas a esta categoria perderão o vínculo</li>
              <li>• Dados históricos não poderão ser recuperados</li>
            </ul>
          </div>
        </div>

        <p className="!text-base text-gray-600 !leading-normal !mb-0">
          Deseja realmente remover esta categoria corporativa?
        </p>
      </div>
    );
  };

  return (
    <>
      <TableCell className="font-medium min-w-[200px] max-w-[300px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {categoria.nome}
          </span>
          {categoria.codCategoria && (
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0 w-fit">
              {categoria.codCategoria}
            </code>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="max-w-[220px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-help">
                {categoria.descricao.length > 40
                  ? `${categoria.descricao.substring(0, 40)}...`
                  : categoria.descricao}
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {categoria.descricao}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

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
                Clique para ver as subcategorias vinculadas
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-sm text-muted-foreground">
              {subcategoriasCount}
            </span>
          )}

          {subcategoriasCount > 0 && (
            <Badge variant="outline" className="text-xs text-blue-600">
              subcategoria{subcategoriasCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(categoria.criadoEm)}
        </span>
      </TableCell>

      <TableCell className="text-right w-16">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(categoria)}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
                aria-label="Editar categoria"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edita a categoria de vagas</TooltipContent>
          </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="h-8 w-8 rounded-full text-red-500 hover:text-white hover:bg-red-500"
                  disabled={externalIsDeleting}
                  aria-label="Remover categoria"
                >
                  {externalIsDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remover categoria</TooltipContent>
            </Tooltip>
        </div>
      </TableCell>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        item={categoria}
        itemName="a categoria corporativa"
        onConfirmDelete={handleConfirmDelete}
        isDeleting={externalIsDeleting}
        customDeleteContent={customDeleteContent}
        confirmButtonText="Excluir categoria"
        title="Excluir categoria corporativa"
        description={`Deseja excluir a categoria "${categoria.nome}"?`}
      />

      {showSubcategoriasModal && (
        <SubcategoriasModal
          categoria={categoria}
          isOpen={showSubcategoriasModal}
          onOpenChange={setShowSubcategoriasModal}
        />
      )}
    </>
  );
}
