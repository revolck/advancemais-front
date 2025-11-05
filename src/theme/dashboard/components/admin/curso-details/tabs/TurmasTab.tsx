"use client";

import { EmptyState } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronRight,
  User,
  Monitor,
  Clock,
  Users,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { CursoTurma } from "@/api/cursos";

interface TurmasTabProps {
  turmas: CursoTurma[];
  cursoId: number;
}

const getStatusColor = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
  
  const normalized = status.toUpperCase().replace(/_/g, "");
  
  switch (normalized) {
    case "RASCUNHO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "PUBLICADO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "INSCRICOESABERTAS":
      return "bg-green-100 text-green-800 border-green-200";
    case "INSCRICOESENCERRADAS":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "EMANDAMENTO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CONCLUIDO":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "SUSPENSO":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "CANCELADO":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getMetodoLabel = (metodo?: string) => {
  switch (metodo?.toUpperCase()) {
    case "ONLINE":
      return "Online";
    case "PRESENCIAL":
      return "Presencial";
    case "LIVE":
      return "Live";
    case "SEMIPRESENCIAL":
      return "Semipresencial";
    default:
      return metodo || "—";
  }
};

const getTurnoLabel = (turno?: string) => {
  switch (turno?.toUpperCase()) {
    case "MANHA":
      return "Manhã";
    case "TARDE":
      return "Tarde";
    case "NOITE":
      return "Noite";
    case "INTEGRAL":
      return "Integral";
    default:
      return turno || "—";
  }
};

const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  
  const normalized = status.toUpperCase().replace(/_/g, "_");
  
  // Mapeamento direto dos status da API
  const statusMap: Record<string, string> = {
    RASCUNHO: "Rascunho",
    PUBLICADO: "Publicado",
    INSCRICOES_ABERTAS: "Inscrições Abertas",
    INSCRICOES_ENCERRADAS: "Inscrições Encerradas",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDO: "Concluído",
    SUSPENSO: "Suspenso",
    CANCELADO: "Cancelado",
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

export function TurmasTab({ turmas, cursoId }: TurmasTabProps) {
  // Função auxiliar para exibir vagas usando os campos calculados da API
  const getVagasDisplay = (turma: CursoTurma) => {
    if (turma.vagasTotais == null) return "—";

    // Usa vagasOcupadas (ou inscricoesCount como fallback) que vem calculado da API
    const vagasOcupadas =
      turma.vagasOcupadas ?? turma.inscricoesCount ?? 0;

    return `${vagasOcupadas}/${turma.vagasTotais}`;
  };

  if (turmas.length === 0) {
    return (
      <EmptyState
        illustration="books"
        illustrationAlt="Ilustração de turmas"
        title="Nenhuma turma cadastrada"
        description="Este curso ainda não possui turmas cadastradas. As turmas aparecerão aqui quando forem criadas."
        maxContentWidth="md"
        actions={
          <Link href={`/dashboard/cursos/turmas/cadastrar?cursoId=${cursoId}`}>
            <Button className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90">
              Cadastrar turma
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700">
                Turma
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Instrutor
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Método
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Turno
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Vagas
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Status
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmas.map((turma) => (
              <TableRow
                key={turma.id}
                className="border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span>{turma.nome}</span>
                    </div>
                    {turma.codigo && (
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                        {turma.codigo}
                      </code>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{turma.instrutor?.nome || "—"}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Monitor className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{getMetodoLabel(turma.metodo)}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{getTurnoLabel(turma.turno)}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Users className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{getVagasDisplay(turma)}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      getStatusColor(turma.status)
                    )}
                  >
                    {getStatusLabel(turma.status)}
                  </Badge>
                </TableCell>

                <TableCell className="py-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
                        aria-label="Visualizar turma"
                  >
                        <Link href={`/dashboard/cursos/turmas/${turma.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>Visualizar turma</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
