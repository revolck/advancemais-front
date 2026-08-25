"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getTurmaAlerta } from "@/api/cursos";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonCustom, EmptyState } from "@/components/ui/custom";

export default function TurmaAlertaPage() {
  const router = useRouter();
  const params = useParams<{ turmaId: string; token: string }>();
  const turmaId = params?.turmaId ?? "";
  const token = params?.token ?? "";

  const {
    data: alerta,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["turma-alerta", turmaId, token],
    queryFn: () => getTurmaAlerta(turmaId, token),
    enabled: Boolean(turmaId && token),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
          <Skeleton className="h-6 w-72" />
          <Skeleton className="mt-3 h-4 w-48" />
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error || !alerta) {
    return (
      <div className="space-y-8 pb-24">
        <section className="rounded-3xl border border-gray-200 bg-white px-6 py-8 sm:px-8 sm:py-10">
          <EmptyState
            title="Alerta não encontrado"
            description="Este alerta expirou (os alertas ficam disponíveis por 7 dias) ou não existe mais."
            illustration="fileNotFound"
            size="lg"
            fullHeight={false}
            maxContentWidth="md"
            actions={
              <div className="flex justify-center items-center mt-6">
                <ButtonCustom
                  onClick={() => router.push(`/dashboard/cursos/turmas/${turmaId}`)}
                  variant="primary"
                  size="lg"
                >
                  Ir para a turma
                </ButtonCustom>
              </div>
            }
          />
        </section>
      </div>
    );
  }

  const criadoEmLabel = new Date(alerta.criadoEm).toLocaleString("pt-BR");
  const expiraEmLabel = new Date(alerta.expiraEm).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-3xl border border-gray-200 bg-white px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl! font-semibold! text-gray-900! mb-1!">
              Alerta de frequência — Turma &quot;{alerta.turma.nome}&quot;
            </h1>
            <p className="text-sm! text-gray-500! mb-0!">
              Curso &quot;{alerta.curso.nome}&quot; · Checkpoint de {alerta.checkpoint}% do
              cronograma · Gerado em {criadoEmLabel}
            </p>
          </div>
          <ButtonCustom
            variant="outline"
            size="md"
            onClick={() => router.push(`/dashboard/cursos/turmas/${turmaId}`)}
          >
            Ver turma
          </ButtonCustom>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white px-6 py-6 sm:px-8 sm:py-8">
        <h2 className="text-base! font-semibold! text-gray-900! mb-4!">
          Alunos abaixo do esperado ({alerta.alunosAfetados.length})
        </h2>

        <div className="space-y-2">
          {alerta.alunosAfetados.map((aluno) => (
            <div
              key={aluno.alunoId}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <span className="text-sm font-medium text-gray-800">{aluno.nomeCompleto}</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                {aluno.frequenciaPercentual}% de frequência
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs! text-gray-400! mb-0!">
          Este alerta fica disponível até {expiraEmLabel}.
        </p>
      </section>
    </div>
  );
}
