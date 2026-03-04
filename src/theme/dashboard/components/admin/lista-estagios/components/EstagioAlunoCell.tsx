"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { getCursoAlunoDetalhes, type EstagioFrequencia } from "@/api/cursos";

function formatCpf(cpf?: string | null): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function isLikelyMockId(alunoId: string): boolean {
  return alunoId.startsWith("mock-") || alunoId.startsWith("mock::");
}

function isUuidLike(value?: string | null): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

interface EstagioAlunoCellProps {
  item: EstagioFrequencia;
}

export function EstagioAlunoCell({ item }: EstagioAlunoCellProps) {
  const shouldFetchDetails =
    !isLikelyMockId(item.alunoId) &&
    !item.alunoCpf &&
    !item.codigoMatricula &&
    !item.alunoCodigo &&
    !item.codigoInscricao &&
    !item.avatarUrl;

  const detailsQuery = useQuery({
    queryKey: ["cursos", "alunos", "detalhes", item.alunoId],
    queryFn: async () => {
      const response = await getCursoAlunoDetalhes(item.alunoId);
      return response.data;
    },
    enabled: Boolean(item.alunoId) && shouldFetchDetails,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });

  const codigoMatriculaCandidate =
    item.codigoMatricula || item.alunoCodigo || item.codigoInscricao || detailsQuery.data?.codigo || null;
  const codigoMatricula =
    codigoMatriculaCandidate && !isUuidLike(codigoMatriculaCandidate)
      ? codigoMatriculaCandidate
      : null;

  const cpf = item.alunoCpf || detailsQuery.data?.cpf || null;
  const avatarUrl = item.avatarUrl || detailsQuery.data?.avatarUrl || null;

  const displayName = useMemo(
    () => item.alunoNome || detailsQuery.data?.nome || "Aluno",
    [detailsQuery.data?.nome, item.alunoNome]
  );

  return (
    <div className="flex items-center gap-3">
      <AvatarCustom
        src={avatarUrl || undefined}
        name={displayName}
        size="sm"
        showStatus={false}
      />

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm! font-medium! text-gray-900!">
            {displayName}
          </span>
          {codigoMatricula ? (
            <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
              {codigoMatricula}
            </code>
          ) : null}
        </div>

        <span className="mt-1 block truncate font-mono text-xs text-gray-500">
          {formatCpf(cpf)}
        </span>
      </div>
    </div>
  );
}
