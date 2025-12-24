"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { AlunoComInscricao } from "@/api/cursos";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";

interface AlunoRowProps {
  aluno: AlunoComInscricao;
  cursoFiltradoId?: string | null; // UUID (string) - alterado de number para string
  isDisabled?: boolean;
  onNavigateStart?: () => void;
}

const getStatusColor = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

  switch (status) {
    case "INSCRITO":
      return "bg-green-100 text-green-800 border-green-200";
    case "EM_ANDAMENTO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CONCLUIDO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "REPROVADO":
      return "bg-red-100 text-red-800 border-red-200";
    case "EM_ESTAGIO":
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

  switch (status) {
    case "INSCRITO":
      return "Inscrito";
    case "EM_ANDAMENTO":
      return "Em Andamento";
    case "CONCLUIDO":
      return "Concluído";
    case "REPROVADO":
      return "Reprovado";
    case "EM_ESTAGIO":
      return "Em Estágio";
    case "CANCELADO":
      return "Cancelado";
    case "TRANCADO":
      return "Trancado";
    default:
      return status;
  }
};

const formatCpf = (cpf?: string | null) => {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const getModalidadeLabel = (metodo?: string) => {
  switch (metodo) {
    case "PRESENCIAL":
      return "Presencial";
    case "ONLINE":
      return "Remoto";
    case "SEMIPRESENCIAL":
      return "Híbrido";
    case "LIVE":
      return "Ao vivo";
    default:
      return null;
  }
};

const getModalidadeColor = (metodo?: string) => {
  switch (metodo) {
    case "PRESENCIAL":
      return "text-blue-600";
    case "ONLINE":
      return "text-purple-600";
    case "SEMIPRESENCIAL":
      return "text-orange-600";
    case "LIVE":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

const getUltimoCurso = (
  aluno: AlunoComInscricao,
  cursoFiltradoId?: string | null
) => {
  const ultimoCurso = aluno.ultimoCurso;
  if (!ultimoCurso) return null;

  // Se houver filtro de curso, garante que estamos usando o curso filtrado.
  if (cursoFiltradoId && ultimoCurso.curso?.id !== cursoFiltradoId) {
    return null;
  }

  return ultimoCurso;
};

const getTipoLabel = (tipo: string) => {
  switch (tipo) {
    case "PESSOA_FISICA":
      return "Pessoa Física";
    case "PESSOA_JURIDICA":
      return "Pessoa Jurídica";
    default:
      return tipo;
  }
};

export function AlunoRow({
  aluno,
  cursoFiltradoId,
  isDisabled = false,
  onNavigateStart,
}: AlunoRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const ultimoCurso = getUltimoCurso(aluno, cursoFiltradoId);
  const isRowDisabled = isDisabled || isNavigating;

  const alunoNome = aluno.nomeCompleto || aluno.id;
  const cursoNome = ultimoCurso?.curso?.nome;
  const turmaNome = ultimoCurso?.turma?.nome;
  const statusInscricao = ultimoCurso?.statusInscricao;

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRowDisabled) return;

    setIsNavigating(true);
    onNavigateStart?.();
    router.push(`/dashboard/cursos/alunos/${encodeURIComponent(aluno.id)}`);

    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow
      className={cn(
        "border-gray-100 transition-colors",
        isRowDisabled
          ? "opacity-50 pointer-events-none"
          : "hover:bg-gray-50/50",
        isNavigating && "bg-blue-50/50"
      )}
    >
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage
              src={(aluno as any)?.avatarUrl || undefined}
              alt={alunoNome}
            />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
              {alunoNome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-gray-900 font-medium truncate max-w-[220px]">
                {alunoNome}
              </div>
              {aluno.codigo && (
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                  {aluno.codigo}
                </code>
              )}
            </div>
            {aluno.cpf && (
              <div className="text-xs text-gray-500 font-mono truncate max-w-[220px]">
                {formatCpf(aluno.cpf)}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-900 flex items-center gap-2">
          <Icon name="Mail" size={16} className="text-gray-400 flex-shrink-0" />
          <span>{aluno.email || "—"}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {aluno.cidade || aluno.estado ? (
          <div className="flex items-start gap-2">
            <Icon
              name="MapPin"
              size={16}
              className="text-gray-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">
                {aluno.cidade && aluno.estado
                  ? `${aluno.cidade}, ${aluno.estado}`
                  : aluno.cidade || aluno.estado}
              </div>
              {/* modalidade removida - campo não disponível no tipo atual */}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        {cursoNome ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 max-w-[240px]">
                <Icon
                  name="BookOpen"
                  size={16}
                  className="text-gray-400 flex-shrink-0"
                />
                <div
                  className="text-sm text-gray-900 truncate"
                  title={cursoNome}
                >
                  {cursoNome}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{cursoNome}</TooltipContent>
          </Tooltip>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        {turmaNome ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 max-w-[240px]">
                <Icon
                  name="Users"
                  size={16}
                  className="text-gray-400 flex-shrink-0"
                />
                <div
                  className="text-sm text-gray-900 truncate"
                  title={turmaNome}
                >
                  {turmaNome}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{turmaNome}</TooltipContent>
          </Tooltip>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        {statusInscricao ? (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              getStatusColor(statusInscricao)
            )}
          >
            {getStatusLabel(statusInscricao)}
          </Badge>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="text-right w-16">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigate}
              disabled={isRowDisabled}
              className={cn(
                "h-8 w-8 rounded-full cursor-pointer",
                isNavigating
                  ? "text-blue-600 bg-blue-100"
                  : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                "disabled:opacity-50 disabled:cursor-wait"
              )}
              aria-label="Visualizar aluno"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar aluno"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
