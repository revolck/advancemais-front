"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CursoPerformance } from "@/api/cursos";

interface CursosMaisPopularesListProps {
  cursos: any[];
  isLoading?: boolean;
}

export function CursosMaisPopularesList({
  cursos,
  isLoading = false,
}: CursosMaisPopularesListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/60 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-gray-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Cursos Mais Populares
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

  if (!cursos || cursos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/60 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
            Cursos Mais Populares
          </h3>
        </div>
        <p className="text-xs text-gray-500 text-center py-4">
          Nenhum curso encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="size-4 text-gray-600" />
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
          Cursos Mais Populares
        </h3>
      </div>
      <div className="space-y-2">
        {cursos.map((curso, index) => (
          <Link
            key={curso.cursoId ?? curso.id ?? index}
            href={`/dashboard/cursos/${curso.cursoId ?? curso.id}`}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-gray-50 group",
              index !== cursos.length - 1 && "border-b border-gray-200/60 pb-2"
            )}
          >
            {/* Avatar/Icon */}
            <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="size-4 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                {curso.cursoNome ?? curso.nome}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {curso.cursoCodigo ?? curso.codigo ?? ""}
              </p>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold text-gray-900">
                {(curso.totalInscricoes ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-gray-500">
                {curso.totalTurmas ?? 0} turmas
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

