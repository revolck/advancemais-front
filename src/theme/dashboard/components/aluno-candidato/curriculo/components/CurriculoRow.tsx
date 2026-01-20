"use client";

import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Eye,
  Loader2,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CurriculoListItem = {
  id: string;
  titulo: string;
  principal?: boolean;
  resumo?: string | null;
  criadoEm?: string | null;
  ultimaAtualizacao?: string | null;
  pretensaoSalarial?: number | null;
  receberOfertas?: boolean | null;
  autorizarContato?: boolean | null;
};

type CurriculoRowProps = {
  curriculo: CurriculoListItem;
  isBusy?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onSetPrincipal: (id: string) => void;
  onRemove: (id: string) => void;
};

export function CurriculoRow({
  curriculo,
  isBusy = false,
  onView,
  onEdit,
  onSetPrincipal,
  onRemove,
}: CurriculoRowProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const isRowDisabled = isBusy || isNavigating;
  const salaryLabel =
    typeof curriculo.pretensaoSalarial === "number" &&
    Number.isFinite(curriculo.pretensaoSalarial) &&
    curriculo.pretensaoSalarial > 0
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(curriculo.pretensaoSalarial)
      : "—";

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRowDisabled) return;
    setIsNavigating(true);
    onView(curriculo.id);
    setTimeout(() => setIsNavigating(false), 3000);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRowDisabled) return;
    onEdit(curriculo.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRowDisabled) return;
    onRemove(curriculo.id);
  };

  return (
    <TableRow
      className={cn(
        "border-gray-100 transition-colors",
        isRowDisabled ? "opacity-50 pointer-events-none" : "hover:bg-gray-50/50",
        isNavigating && "bg-blue-50/50",
      )}
    >
      <TableCell className="py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-900 font-medium truncate max-w-[320px]">
              {curriculo.titulo}
            </div>
            {curriculo.principal && (
              <Badge
                variant="outline"
                className="text-xs font-medium bg-emerald-100 text-emerald-800 border-emerald-200"
              >
                Principal
              </Badge>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        {curriculo.resumo?.trim() ? (
          <div className="text-sm text-gray-700 line-clamp-2 max-w-[420px]">
            {curriculo.resumo.trim()}
          </div>
        ) : (
          <div className="text-sm text-gray-400">—</div>
        )}
      </TableCell>

      <TableCell className="py-4">
        <div className="text-sm text-gray-700 whitespace-nowrap">
          {salaryLabel}
        </div>
      </TableCell>

      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            curriculo.receberOfertas === true
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : "bg-gray-100 text-gray-800 border-gray-200",
          )}
        >
          {curriculo.receberOfertas === null ? "—" : curriculo.receberOfertas ? "Sim" : "Não"}
        </Badge>
      </TableCell>

      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            curriculo.autorizarContato === true
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : "bg-gray-100 text-gray-800 border-gray-200",
          )}
        >
          {curriculo.autorizarContato === null ? "—" : curriculo.autorizarContato ? "Sim" : "Não"}
        </Badge>
      </TableCell>

      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            curriculo.principal
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : "bg-gray-100 text-gray-800 border-gray-200",
          )}
        >
          {curriculo.principal ? "Sim" : "Não"}
        </Badge>
      </TableCell>

      <TableCell className="text-right w-[168px]">
        <div className="flex items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                disabled={isRowDisabled}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                aria-label="Editar currículo"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              Editar
            </TooltipContent>
          </Tooltip>

          {!curriculo.principal && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isRowDisabled) return;
                    onSetPrincipal(curriculo.id);
                  }}
                  disabled={isRowDisabled}
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                  aria-label="Definir como currículo principal"
                >
                  <Star className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                Definir como principal
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={isRowDisabled}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                aria-label="Remover currículo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              Remover
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleView}
                disabled={isRowDisabled}
                className={cn(
                  "h-8 w-8 rounded-full cursor-pointer",
                  isNavigating
                    ? "text-blue-600 bg-blue-100"
                    : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                  "disabled:opacity-50 disabled:cursor-wait",
                )}
                aria-label="Visualizar currículo"
              >
                {isNavigating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              Visualizar
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
