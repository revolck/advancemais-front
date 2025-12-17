"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { TurmaProximoInicio } from "@/api/cursos";

interface CursosProximosListProps {
  turmas: any[];
  isLoading?: boolean;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd MMM, yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

export function CursosProximosList({
  turmas,
  isLoading = false,
}: CursosProximosListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/60 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="size-4 text-gray-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Cursos Próximos a Começar
          </h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="size-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!turmas || turmas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/60 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="size-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
            Cursos Próximos a Começar
          </h3>
        </div>
        <p className="text-xs text-gray-500 text-center py-4">
          Nenhum curso próximo encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="size-4 text-gray-600" />
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
          Cursos Próximos a Começar
        </h3>
      </div>
      <div className="space-y-2">
        {turmas.map((turma, index) => (
          <Link
            key={turma.turmaId ?? index}
            href={`/dashboard/cursos/${turma.cursoId ?? turma.turmaId}/turmas/${turma.turmaId}`}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-gray-50 group",
              index !== turmas.length - 1 && "border-b border-gray-200/60 pb-2"
            )}
          >
            {/* Avatar/Icon */}
            <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="size-4 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                {turma.cursoNome ?? turma.nome}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {turma.turmaNome ?? turma.codigo ?? ""}
              </p>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold text-gray-900">
                {turma.diasParaInicio != null ? `${turma.diasParaInicio} ${turma.diasParaInicio === 1 ? "dia" : "dias"}` : "Em breve"}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(turma.dataInicio)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

