"use client";

import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { EmptyState } from "@/components/ui/custom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMockTurmaEstrutura } from "@/mockData/aluno-candidato";
import { AlunoTurmaEstruturaView } from "@/theme/dashboard/components/aluno-candidato/cursos/AlunoTurmaEstruturaView";

export default function AlunoTurmaEstruturaPage() {
  const role = useUserRole();
  const params = useParams();
  const { cursoId, turmaId } = params as {
    cursoId: string;
    turmaId: string;
  };

  // Buscar estrutura da turma - hooks devem ser chamados antes de qualquer early return
  const { data: estrutura, isLoading } = useQuery({
    queryKey: ["turma-estrutura", cursoId, turmaId],
    queryFn: async () => {
      return getMockTurmaEstrutura(cursoId, turmaId);
    },
    enabled: !!cursoId && !!turmaId,
    staleTime: 5 * 60 * 1000,
  });

  if (role !== UserRole.ALUNO_CANDIDATO) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Esta página é exclusiva para alunos e candidatos."
        illustration="pass"
        actions={
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[var(--primary-color)]"
          >
            Voltar ao início
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-sm! text-gray-600">
            Carregando estrutura do curso...
          </p>
        </div>
      </div>
    );
  }

  if (!estrutura) {
    return (
      <EmptyState
        title="Estrutura não encontrada"
        description="Não foi possível carregar a estrutura desta turma."
        illustration="books"
        actions={
          <Link
            href="/dashboard/cursos/alunos/cursos"
            className="text-sm font-semibold text-[var(--primary-color)]"
          >
            Voltar aos cursos
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <AlunoTurmaEstruturaView
        cursoId={cursoId}
        turmaId={turmaId}
        estrutura={estrutura}
      />
    </div>
  );
}
