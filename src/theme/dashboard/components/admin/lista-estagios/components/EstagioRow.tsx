"use client";

import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CalendarDays, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Estagio } from "@/api/cursos";

export interface EstagioRowProps {
  estagio: Estagio;
}

const STATUS_LABEL: Record<string, string> = {
  PLANEJADO: "Planejado",
  EM_ANDAMENTO: "Em andamento",
  ENCERRADO: "Encerrado",
  CANCELADO: "Cancelado",
  CONCLUIDO: "Concluído",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  PENDENTE: "Pendente",
};

const STATUS_CLASS: Record<string, string> = {
  PLANEJADO: "bg-blue-100 text-blue-700 border-blue-200",
  EM_ANDAMENTO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ENCERRADO: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELADO: "bg-red-100 text-red-700 border-red-200",
  CONCLUIDO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  APROVADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REPROVADO: "bg-rose-100 text-rose-700 border-rose-200",
  PENDENTE: "bg-amber-100 text-amber-700 border-amber-200",
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

function formatRelativeUpdate(value?: string | null): string {
  if (!value) return "Sem atualização";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem atualização";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Atualização futura";

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) {
    return diffMinutes <= 1
      ? "Atualizado há 1 minuto"
      : `Atualizado há ${diffMinutes} minutos`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1
      ? "Atualizado há 1 hora"
      : `Atualizado há ${diffHours} horas`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1
    ? "Atualizado há 1 dia"
    : `Atualizado há ${diffDays} dias`;
}

function formatModoAlocacao(value?: string | null): string {
  if (!value) return "Sem modo";
  return value === "TODOS" ? "Todos" : "Específicos";
}

function formatPeriodicidade(value?: string | null): string {
  if (!value) return "Sem período";
  return value === "DIAS_SEMANA" ? "Dias da semana" : "Intervalo";
}

export function EstagioRow({ estagio }: EstagioRowProps) {
  const status = (estagio.status || "PENDENTE").toUpperCase();
  const label = STATUS_LABEL[status] ?? estagio.status ?? "—";
  const badgeClass =
    STATUS_CLASS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <TableRow className="border-gray-100 bg-white transition-colors hover:bg-blue-50/40">
      <TableCell className="py-4 px-3">
        <div className="min-w-0 space-y-1">
          <span className="min-w-0 truncate font-medium text-gray-900 cursor-help mb-0!">
            {estagio.titulo || "Estágio"}
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                estagio.obrigatorio
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-700",
              )}
            >
              {estagio.obrigatorio ? "Obrigatório" : "Opcional"}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-medium border-indigo-200 bg-indigo-50 text-indigo-700"
            >
              {formatPeriodicidade(estagio.periodo?.periodicidade)}
            </Badge>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="flex min-w-0 items-start gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] text-gray-500">Curso</span>
              <span className="min-w-0 truncate text-sm text-gray-700">
                {estagio.cursoNome || estagio.cursoId}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] text-gray-500">Turma</span>
              <span className="min-w-0 truncate text-sm text-gray-700">
                {estagio.turmaNome || estagio.turmaId}
              </span>
              {estagio.turmaCodigo && (
                <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                  {estagio.turmaCodigo}
                </code>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="inline-flex items-center gap-2 text-sm text-gray-800">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">
            {estagio.totalAlunosVinculados ?? 0}
          </span>
          <span className="text-xs text-gray-500">vinculados</span>
          <Badge
            variant="outline"
            className="text-[11px] border-gray-200 bg-gray-50 text-gray-600"
          >
            {formatModoAlocacao(estagio.modoAlocacao)}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", badgeClass)}
        >
          {label}
        </Badge>
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="space-y-1">
          <span
            className="inline-flex items-center gap-1.5 text-sm text-gray-700"
            title={
              estagio.atualizadoEm
                ? new Date(estagio.atualizadoEm).toLocaleString("pt-BR")
                : undefined
            }
          >
            <CalendarDays className="h-4 w-4 text-gray-400" />
            {formatDate(estagio.atualizadoEm)}
          </span>
          <div className="text-xs text-gray-500">
            {formatRelativeUpdate(estagio.atualizadoEm)}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3 text-right">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
          aria-label="Visualizar estágio"
        >
          <Link href={`/dashboard/cursos/estagios/${estagio.id}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
