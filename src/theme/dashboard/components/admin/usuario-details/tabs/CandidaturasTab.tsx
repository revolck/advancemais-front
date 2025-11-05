"use client";

import { EmptyState } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar } from "lucide-react";
import type { UsuarioDetailsData } from "../types";
import type { UsuarioCandidatura } from "@/api/usuarios/types";
import { formatDate } from "../utils/formatters";

interface CandidaturasTabProps {
  usuario: UsuarioDetailsData;
  isLoading?: boolean;
}

export function CandidaturasTab({
  usuario,
  isLoading = false,
}: CandidaturasTabProps) {
  const candidaturas = usuario.candidaturas || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-32" />
        ))}
      </div>
    );
  }

  if (candidaturas.length === 0) {
    return (
      <EmptyState
        illustration="fileNotFound"
        illustrationAlt="Nenhuma candidatura"
        title="Nenhuma candidatura encontrada"
        description="Este candidato ainda não se candidatou a nenhuma vaga."
        maxContentWidth="md"
      />
    );
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "CONTRATADO":
        return "bg-green-100 text-green-800 border-green-200";
      case "ENTREVISTA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EM_ANALISE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RECUSADO":
      case "DESISTIU":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {candidaturas.map((candidatura) => (
        <div
          key={candidatura.id}
          className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {candidatura.vaga?.titulo || "Vaga sem título"}
                </h3>
              </div>
            </div>
            <Badge
              variant="outline"
              className={getStatusColor(candidatura.status)}
            >
              {candidatura.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Aplicada em: {formatDate(candidatura.aplicadaEm)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
