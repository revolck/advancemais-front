"use client";

import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { EmptyState } from "@/components/ui/custom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { buscarEstruturaCursoCandidato } from "@/api/candidatos";
import { AlunoTurmaEstruturaView } from "@/theme/dashboard/components/aluno-candidato/cursos/AlunoTurmaEstruturaView";
import { Skeleton } from "@/components/ui/skeleton";

function AlunoTurmaEstruturaSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-7 w-72 rounded-md" />
            <Skeleton className="h-4 w-96 max-w-full rounded-md" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, moduleIndex) => (
            <div
              key={moduleIndex}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-56 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                  >
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/5 rounded-md" />
                      <Skeleton className="h-3 w-2/5 rounded-md" />
                    </div>
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-4/5 rounded-md" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-3 flex-1 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default function AlunoTurmaEstruturaPage() {
  const role = useUserRole();
  const params = useParams();
  const { cursoId, turmaId } = params as {
    cursoId: string;
    turmaId: string;
  };

  // Buscar estrutura da turma - hooks devem ser chamados antes de qualquer early return
  const { data: estruturaPayload, isLoading } = useQuery({
    queryKey: ["turma-estrutura", cursoId, turmaId],
    queryFn: async () => {
      const response = await buscarEstruturaCursoCandidato(cursoId, turmaId);
      return response.success ? response.data : null;
    },
    enabled: !!cursoId && !!turmaId,
    staleTime: 30 * 1000,
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
    return <AlunoTurmaEstruturaSkeleton />;
  }

  if (!estruturaPayload?.estrutura) {
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
        estrutura={estruturaPayload.estrutura}
        turmaInfo={estruturaPayload.turma}
      />
    </div>
  );
}
