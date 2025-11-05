"use client";

import { EmptyState } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users } from "lucide-react";
import type { UsuarioDetailsData } from "../types";
import type { UsuarioCursoInscricao } from "@/api/usuarios/types";

interface CursosInscricoesTabProps {
  usuario: UsuarioDetailsData;
  isLoading?: boolean;
}

export function CursosInscricoesTab({
  usuario,
  isLoading = false,
}: CursosInscricoesTabProps) {
  const inscricoes = usuario.cursosInscricoes || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-32" />
        ))}
      </div>
    );
  }

  if (inscricoes.length === 0) {
    return (
      <EmptyState
        illustration="fileNotFound"
        illustrationAlt="Nenhuma inscrição"
        title="Nenhuma inscrição encontrada"
        description="Este aluno ainda não está inscrito em nenhum curso."
        maxContentWidth="md"
      />
    );
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "CONCLUIDO":
      case "CONCLUÍDO":
        return "bg-green-100 text-green-800 border-green-200";
      case "EM_ANDAMENTO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "MATRICULADO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REPROVADO":
      case "CANCELADO":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {inscricoes.map((inscricao) => (
        <div
          key={inscricao.id}
          className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {inscricao.turma?.curso?.nome || "Curso sem nome"}
                  </h3>
                </div>
                {inscricao.turma?.nome && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{inscricao.turma.nome}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={getStatusColor(inscricao.status)}
            >
              {inscricao.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
