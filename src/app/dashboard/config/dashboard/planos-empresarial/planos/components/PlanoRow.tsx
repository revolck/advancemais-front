"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  Trash2,
  Building2,
  DollarSign,
  Users,
  Star,
  Loader2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanoEmpresarialBackendResponse } from "@/api/empresas/planos-empresariais/types";
import { DeletePlanoModal } from "./DeletePlanoModal";
import { Icon } from "@/components/ui/custom/Icons";

interface PlanoRowProps {
  plano: PlanoEmpresarialBackendResponse;
  onEdit: (plano: PlanoEmpresarialBackendResponse) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function PlanoRow({
  plano,
  onEdit,
  onDelete,
  isDeleting: externalIsDeleting = false,
}: PlanoRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Gerar cor de background aleatória mas estável baseada no ID do plano
  const iconBackgroundColor = useMemo(() => {
    const colors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-purple-100",
      "bg-pink-100",
      "bg-indigo-100",
      "bg-cyan-100",
      "bg-teal-100",
      "bg-orange-100",
      "bg-yellow-100",
      "bg-red-100",
      "bg-slate-100",
      "bg-emerald-100",
    ];

    // Usar o ID do plano para gerar um índice estável
    const hash = plano.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % colors.length;

    return colors[index];
  }, [plano.id]);

  // Cor do ícone baseada no background
  const iconColor = useMemo(() => {
    if (iconBackgroundColor.includes("blue")) return "text-blue-600";
    if (iconBackgroundColor.includes("green")) return "text-green-600";
    if (iconBackgroundColor.includes("purple")) return "text-purple-600";
    if (iconBackgroundColor.includes("pink")) return "text-pink-600";
    if (iconBackgroundColor.includes("indigo")) return "text-indigo-600";
    if (iconBackgroundColor.includes("cyan")) return "text-cyan-600";
    if (iconBackgroundColor.includes("teal")) return "text-teal-600";
    if (iconBackgroundColor.includes("orange")) return "text-orange-600";
    if (iconBackgroundColor.includes("yellow")) return "text-yellow-600";
    if (iconBackgroundColor.includes("red")) return "text-red-600";
    if (iconBackgroundColor.includes("slate")) return "text-slate-600";
    if (iconBackgroundColor.includes("emerald")) return "text-emerald-600";
    return "text-blue-600"; // fallback
  }, [iconBackgroundColor]);

  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(plano.id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Skeleton de loading durante delete - compatível com estrutura de tabela
  if (externalIsDeleting) {
    return (
      <>
        {/* Coluna Plano */}
        <TableCell className="py-4 min-w-[200px] max-w-[240px]">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-lg ${iconBackgroundColor} flex items-center justify-center`}
            >
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        </TableCell>

        {/* Coluna Valor */}
        <TableCell className="min-w-[140px] max-w-[180px]">
          <Skeleton className="h-4 w-20" />
        </TableCell>

        {/* Coluna Tipo */}
        <TableCell className="min-w-[120px] max-w-[150px]">
          <Skeleton className="h-5 w-24 rounded-full" />
        </TableCell>

        {/* Coluna Desconto */}
        <TableCell className="min-w-[120px] max-w-[150px]">
          <Skeleton className="h-5 w-16 rounded-full" />
        </TableCell>

        {/* Coluna Vagas */}
        <TableCell className="min-w-[120px] max-w-[150px]">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </TableCell>

        {/* Coluna Destaque */}
        <TableCell className="min-w-[120px] max-w-[150px]">
          <Skeleton className="h-5 w-20 rounded-full" />
        </TableCell>

        {/* Coluna Qtd. Destaque */}
        <TableCell className="min-w-[140px] max-w-[180px]">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
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

  // Verificar se o plano pode ser deletado (sem vínculos)
  const canDelete = true; // TODO: Implementar verificação de vínculos

  return (
    <>
      {/* Coluna Principal: Ícone + Nome + Status */}
      <TableCell className="py-4 min-w-[200px] max-w-[240px]">
        <div className="flex items-center gap-3">
          {/* Ícone do plano com background aleatório */}
          <div
            className={`h-8 w-8 flex-shrink-0 rounded-lg ${iconBackgroundColor} flex items-center justify-center shadow-sm`}
          >
            <Icon name={plano.icon as any} className={`h-4 w-4 ${iconColor}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 truncate text-sm">
              {plano.nome}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Coluna Valor */}
      <TableCell className="min-w-[140px] max-w-[180px]">
        <div className="font-medium text-sm text-gray-900">
          {formatCurrency(plano.valor)}/mês
        </div>
      </TableCell>

      {/* Coluna Tipo */}
      <TableCell className="min-w-[120px] max-w-[150px]">
        <Badge
          className={cn(
            "uppercase tracking-wide text-[10px]",
            plano.vagaEmDestaque
              ? "bg-purple-100 text-purple-800 border-purple-200"
              : "bg-blue-100 text-blue-800 border-blue-200"
          )}
        >
          {plano.vagaEmDestaque ? "Plano Destaque" : "Plano Padrão"}
        </Badge>
      </TableCell>

      {/* Coluna Desconto */}
      <TableCell className="min-w-[120px] max-w-[150px]">
        {plano.desconto > 0 ? (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 uppercase tracking-wide text-[10px]">
            {plano.desconto}% OFF
          </Badge>
        ) : (
          <span className="text-sm text-gray-500">—</span>
        )}
      </TableCell>

      {/* Coluna Vagas */}
      <TableCell className="min-w-[120px] max-w-[150px]">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
            {plano.quantidadeVagas}{" "}
            {plano.quantidadeVagas <= 1 ? "vaga" : "vagas"}
          </span>
        </div>
      </TableCell>

      {/* Coluna Destaque */}
      <TableCell className="min-w-[120px] max-w-[150px]">
        {plano.vagaEmDestaque ? (
          <Badge className="bg-green-100 text-green-800 border-green-200 uppercase tracking-wide text-[10px]">
            Ativado
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800 border-red-200 uppercase tracking-wide text-[10px]">
            Desativado
          </Badge>
        )}
      </TableCell>

      {/* Coluna Quantidade de Vagas em Destaque */}
      <TableCell className="min-w-[140px] max-w-[180px]">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Star className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
            {plano.quantidadeVagasDestaque || 0}{" "}
            {(plano.quantidadeVagasDestaque || 0) <= 1 ? "vaga" : "vagas"}
          </span>
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
                onClick={() => onEdit(plano)}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                aria-label="Editar plano"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Editar plano</TooltipContent>
          </Tooltip>

          {canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  disabled={externalIsDeleting}
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-red-500 cursor-pointer"
                  aria-label="Excluir plano"
                >
                  {externalIsDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                {externalIsDeleting ? "Excluindo..." : "Excluir plano"}
              </TooltipContent>
            </Tooltip>
          )}

          {!canDelete && (
            <div className="h-8 w-8 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            </div>
          )}
        </div>
      </TableCell>

      {/* Modal de Confirmação de Exclusão */}
      <DeletePlanoModal
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        plano={plano}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={externalIsDeleting}
      />
    </>
  );
}

export default PlanoRow;
