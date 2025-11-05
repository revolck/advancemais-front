"use client";

import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { TurmaInscricao } from "@/api/cursos";

interface InscricoesTabProps {
  inscricoes: TurmaInscricao[];
  isLoading?: boolean;
}

const getStatusColor = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
  
  const normalized = status.toUpperCase().replace(/_/g, "");
  
  switch (normalized) {
    case "INSCRITO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "EMANDAMENTO":
      return "bg-green-100 text-green-800 border-green-200";
    case "CONCLUIDO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "REPROVADO":
      return "bg-red-100 text-red-800 border-red-200";
    case "EMESTAGIO":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "CANCELADO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "TRANCADO":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  
  const normalized = status.toUpperCase().replace(/_/g, "_");
  
  // Mapeamento direto dos status da API
  const statusMap: Record<string, string> = {
    INSCRITO: "Inscrito",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDO: "Concluído",
    REPROVADO: "Reprovado",
    EM_ESTAGIO: "Em Estágio",
    CANCELADO: "Cancelado",
    TRANCADO: "Trancado",
  };
  
  // Retorna o label mapeado ou formata o status
  if (statusMap[normalized]) {
    return statusMap[normalized];
  }
  
  // Fallback: formatação genérica
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function InscricoesTab({
  inscricoes,
  isLoading = false,
}: InscricoesTabProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (inscricoes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <EmptyState
          illustration="userProfiles"
          illustrationAlt="Nenhuma inscrição encontrada"
          title="Nenhuma inscrição encontrada"
          description="Esta turma ainda não possui alunos inscritos."
          maxContentWidth="md"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead className="font-medium text-gray-700 py-4">
                Aluno
              </TableHead>
              <TableHead className="font-medium text-gray-700">Email</TableHead>
              <TableHead className="font-medium text-gray-700">Status</TableHead>
              <TableHead className="font-medium text-gray-700">Inscrito em</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscricoes.map((inscricao) => (
              <TableRow
                key={inscricao.id}
                className="border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>
                      {inscricao.aluno?.nomeCompleto ||
                        inscricao.aluno?.nome ||
                        "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-gray-900">
                    {inscricao.aluno?.email || "—"}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      getStatusColor(inscricao.status)
                    )}
                  >
                    {getStatusLabel(inscricao.status)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-gray-900">
                    {inscricao.criadoEm
                      ? new Date(inscricao.criadoEm).toLocaleDateString("pt-BR")
                      : "—"}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {inscricao.aluno?.id && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
                          aria-label="Visualizar aluno"
                        >
                          <Link
                            href={`/dashboard/cursos/alunos/${inscricao.aluno.id}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={8}>
                        Visualizar aluno
                      </TooltipContent>
                    </Tooltip>
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
