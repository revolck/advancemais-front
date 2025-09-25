"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit2,
  Trash2,
  Copy,
  Calendar,
  Users,
  Target,
  Percent,
  DollarSign,
} from "lucide-react";
import type { CupomDesconto } from "@/api/cupons/types";
import { toastCustom } from "@/components/ui/custom/toast";

interface CupomRowProps {
  cupom: CupomDesconto;
  onEdit: () => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function CupomRow({
  cupom,
  onEdit,
  onDelete,
  isDeleting,
}: CupomRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipoDescontoLabel = (tipo: string) => {
    return tipo === "PORCENTAGEM" ? "Porcentagem" : "Valor Fixo";
  };

  const getAplicarEmLabel = (aplicarEm: string) => {
    switch (aplicarEm) {
      case "TODA_PLATAFORMA":
        return "Toda a Plataforma";
      case "APENAS_ASSINATURA":
        return "Apenas Assinaturas";
      case "APENAS_CURSOS":
        return "Apenas Cursos";
      default:
        return aplicarEm;
    }
  };

  const getLimiteUsoLabel = (tipo: string, quantidade?: number) => {
    if (tipo === "ILIMITADO") return "Ilimitado";
    return `${quantidade || 0} usos`;
  };

  const getLimitePorUsuarioLabel = (tipo: string, quantidade?: number) => {
    switch (tipo) {
      case "ILIMITADO":
        return "Ilimitado";
      case "PRIMEIRA_COMPRA":
        return "Primeira compra";
      case "LIMITADO":
        return `${quantidade || 0} usos`;
      default:
        return tipo;
    }
  };

  const getPeriodoLabel = (
    periodoTipo: string,
    inicio?: string,
    fim?: string
  ) => {
    if (periodoTipo === "ILIMITADO") return "Sempre ativo";
    if (inicio && fim) {
      return `${formatDate(inicio)} - ${formatDate(fim)}`;
    }
    return "Período indefinido";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toastCustom.success("Código copiado para a área de transferência");
    } catch (error) {
      toastCustom.error("Erro ao copiar código");
    }
  };

  const getValorDesconto = () => {
    if (cupom.tipoDesconto === "PORCENTAGEM") {
      return `${cupom.valorPercentual || 0}%`;
    }
    return `R$ ${(cupom.valorFixo || 0).toFixed(2).replace(".", ",")}`;
  };

  if (isDeleting) {
    return (
      <Card className="border border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded bg-gray-200" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32 bg-gray-200" />
              <Skeleton className="h-4 w-48 bg-gray-200" />
            </div>
            <Skeleton className="h-8 w-16 bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg text-gray-900">
                  {cupom.codigo}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(cupom.codigo)}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {cupom.descricao}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                {cupom.tipoDesconto === "PORCENTAGEM" ? (
                  <Percent className="h-3 w-3" />
                ) : (
                  <DollarSign className="h-3 w-3" />
                )}
                <span className="font-medium">
                  {getTipoDescontoLabel(cupom.tipoDesconto)}:
                </span>
                <span className="font-semibold text-gray-700">
                  {getValorDesconto()}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span className="font-medium">Aplicar em:</span>
                <span className="font-semibold text-gray-700">
                  {getAplicarEmLabel(cupom.aplicarEm)}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span className="font-medium">Usos totais:</span>
                <span className="font-semibold text-gray-700">
                  {getLimiteUsoLabel(
                    cupom.limiteUsoTotalTipo,
                    cupom.limiteUsoTotalQuantidade
                  )}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Período:</span>
                <span className="font-semibold text-gray-700">
                  {getPeriodoLabel(
                    cupom.periodoTipo,
                    cupom.periodoInicio,
                    cupom.periodoFim
                  )}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Criado em: {formatDateTime(cupom.criadoEm)}</span>
                  {cupom.atualizadoEm !== cupom.criadoEm && (
                    <span>
                      Atualizado em: {formatDateTime(cupom.atualizadoEm)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-500">
                    Usos: {cupom.usosTotais}
                  </span>
                  {cupom.limitePorUsuarioTipo !== "ILIMITADO" && (
                    <span className="text-gray-400">
                      • Por usuário:{" "}
                      {getLimitePorUsuarioLabel(
                        cupom.limitePorUsuarioTipo,
                        cupom.limitePorUsuarioQuantidade
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 px-3"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(cupom.id)}
              className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
