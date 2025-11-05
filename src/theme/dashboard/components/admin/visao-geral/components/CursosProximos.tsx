"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Users, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CursosProximosInicio, TurmaProximoInicio } from "@/api/cursos";

interface CursosProximosProps {
  data: CursosProximosInicio;
  isLoading?: boolean;
}

type Periodo = "7" | "15" | "30";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    INSCRICOES_ABERTAS: { label: "Inscrições Abertas", variant: "default" },
    INSCRICOES_ENCERRADAS: { label: "Inscrições Encerradas", variant: "secondary" },
    EM_ANDAMENTO: { label: "Em Andamento", variant: "default" },
    CONCLUIDA: { label: "Concluída", variant: "outline" },
  };

  const mapped = statusMap[status] || { label: status, variant: "outline" };
  return <Badge variant={mapped.variant}>{mapped.label}</Badge>;
};

function TurmaCard({ turma }: { turma: TurmaProximoInicio }) {
  const ocupacaoPercent = turma.vagasTotais > 0 
    ? (turma.inscricoesAtivas / turma.vagasTotais) * 100 
    : 0;

  return (
    <Link href={`/dashboard/cursos/${turma.cursoId}/turmas/${turma.turmaId}`}>
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
              <BookOpen className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 mb-1 leading-tight">{turma.cursoNome}</h3>
              <p className="text-xs text-gray-500 font-medium">Turma: {turma.turmaCodigo}</p>
            </div>
          </div>
          {getStatusBadge(turma.status)}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="size-4 text-gray-500" />
            <span className="font-medium">
              Inicia em {turma.diasParaInicio} {turma.diasParaInicio === 1 ? "dia" : "dias"}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 text-xs">{formatDate(turma.dataInicio)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="size-4 text-gray-500" />
                <span className="font-medium">
                  {turma.inscricoesAtivas}/{turma.vagasTotais} vagas ocupadas
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-600">{ocupacaoPercent.toFixed(0)}%</span>
            </div>
            <Progress value={ocupacaoPercent} className="h-2.5 bg-gray-200" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CursosProximos({ data, isLoading }: CursosProximosProps) {
  const [periodo, setPeriodo] = useState<Periodo>("7");

  const turmas = periodo === "7" 
    ? data.proximos7Dias 
    : periodo === "15" 
    ? data.proximos15Dias 
    : data.proximos30Dias;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
          <Calendar className="size-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Cursos Próximos a Começar</h2>
      </div>

      <div className="flex gap-2 mb-6 pb-2 border-b border-gray-100">
        {(["7", "15", "30"] as Periodo[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriodo(p)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              periodo === p
                ? "bg-[var(--primary-color)] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            )}
          >
            {p} dias
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {turmas.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <BookOpen className="size-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">
              Nenhum curso próximo a começar neste período
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {turmas.map((turma) => (
              <TurmaCard key={turma.turmaId} turma={turma} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

