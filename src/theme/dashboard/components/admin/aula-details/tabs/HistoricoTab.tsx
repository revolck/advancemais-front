"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { User, Calendar, Edit } from "lucide-react";
import { getAulaHistorico, type AulaHistorico } from "@/api/aulas";
import { formatDateTime } from "../utils";

export interface HistoricoTabProps {
  aulaId: string;
  isLoading?: boolean;
}

// Mapeamento de ações para português
const acaoLabels: Record<string, string> = {
  AULA_CRIADA: "Aula criada",
  AULA_ATUALIZADA: "Aula atualizada",
  AULA_EXCLUIDA: "Aula excluída",
  STATUS_ALTERADO: "Status alterado",
  MATERIAL_ADICIONADO: "Material adicionado",
  MATERIAL_REMOVIDO: "Material removido",
  MATERIAL_ATUALIZADO: "Material atualizado",
};

// Cores para badges de ação
const getAcaoBadgeColor = (acao: string): string => {
  const colorMap: Record<string, string> = {
    AULA_CRIADA: "bg-green-50 text-green-700 border-green-200",
    AULA_ATUALIZADA: "bg-blue-50 text-blue-700 border-blue-200",
    AULA_EXCLUIDA: "bg-red-50 text-red-700 border-red-200",
    STATUS_ALTERADO: "bg-purple-50 text-purple-700 border-purple-200",
    MATERIAL_ADICIONADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MATERIAL_REMOVIDO: "bg-orange-50 text-orange-700 border-orange-200",
    MATERIAL_ATUALIZADO: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return colorMap[acao] || "bg-gray-50 text-gray-700 border-gray-200";
};

export function HistoricoTab({ aulaId, isLoading: parentLoading = false }: HistoricoTabProps) {
  const {
    data: historico,
    isLoading: queryLoading,
    error,
  } = useQuery<AulaHistorico[], Error>({
    queryKey: ["aulaHistorico", aulaId],
    queryFn: () => getAulaHistorico(aulaId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const isLoading = parentLoading || queryLoading;

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <EmptyState
          fullHeight
          maxContentWidth="sm"
          illustration="fileNotFound"
          illustrationAlt="Erro"
          title="Erro ao carregar histórico"
          description="Não foi possível carregar o histórico de alterações."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!historico || historico.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <EmptyState
          fullHeight
          maxContentWidth="sm"
          illustration="myFiles"
          illustrationAlt="Sem histórico"
          title="Nenhuma alteração registrada"
          description="Ainda não há histórico de alterações para esta aula."
        />
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6">
      <h4 className="mb-6 text-base font-semibold text-gray-900">
        Histórico de Alterações
      </h4>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead className="font-medium text-gray-700 py-4 px-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Data/Hora
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-4 px-4">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-gray-400" />
                  Ação
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-4 px-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  Alterado por
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 py-4 px-4">
                Detalhes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historico.map((item) => (
              <TableRow key={item.id} className="border-gray-100">
                <TableCell className="py-4 px-4">
                  <span className="text-sm text-gray-600">
                    {formatDateTime(item.criadoEm)}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getAcaoBadgeColor(item.acao)}`}
                  >
                    {acaoLabels[item.acao] || item.acao}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className="text-sm text-gray-900 font-medium">
                    {item.usuario?.nome || "—"}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4">
                  {item.camposAlterados && Object.keys(item.camposAlterados).length > 0 ? (
                    <div className="text-xs text-gray-600 space-y-1">
                      {Object.entries(item.camposAlterados).map(([campo, mudanca]) => {
                        const { de, para } = mudanca as { de: any; para: any };
                        return (
                          <div key={campo}>
                            <span className="font-medium">{campo}:</span>{" "}
                            <span className="text-red-600">{String(de)}</span> →{" "}
                            <span className="text-green-600">{String(para)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

