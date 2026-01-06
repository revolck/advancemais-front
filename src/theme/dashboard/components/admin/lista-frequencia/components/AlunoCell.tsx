"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCursoAlunoDetalhes } from "@/api/cursos";
import { formatCpf, getInitials } from "../utils/alunoFormat";

function isLikelyMockId(alunoId: string): boolean {
  return alunoId.startsWith("mock-") || alunoId.startsWith("mock::");
}

export function AlunoCell(props: {
  alunoId: string;
  alunoNome: string;
  alunoCodigo?: string | null;
  alunoCpf?: string | null;
  avatarUrl?: string | null;
}) {
  const { alunoId, alunoNome, alunoCodigo, alunoCpf, avatarUrl } = props;

  const shouldFetch =
    !isLikelyMockId(alunoId) && (!alunoCpf || !alunoCodigo);

  const detailsQuery = useQuery({
    queryKey: ["cursos", "alunos", "detalhes", alunoId],
    queryFn: async () => {
      const res = await getCursoAlunoDetalhes(alunoId);
      return res.data;
    },
    enabled: Boolean(alunoId) && shouldFetch,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });

  const resolvedCodigo = alunoCodigo ?? detailsQuery.data?.codigo ?? null;
  const resolvedCpf = alunoCpf ?? detailsQuery.data?.cpf ?? null;
  const resolvedAvatarUrl = avatarUrl ?? detailsQuery.data?.avatarUrl ?? null;

  const displayName = useMemo(() => alunoNome || detailsQuery.data?.nomeCompleto || alunoId, [alunoId, alunoNome, detailsQuery.data?.nomeCompleto]);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={resolvedAvatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm text-gray-900 font-medium truncate max-w-[220px]">
            {displayName}
          </div>
          {resolvedCodigo && (
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
              {resolvedCodigo}
            </code>
          )}
        </div>
        {resolvedCpf && (
          <div className="text-xs text-gray-500 font-mono truncate max-w-[220px]">
            {formatCpf(resolvedCpf)}
          </div>
        )}
      </div>
    </div>
  );
}

