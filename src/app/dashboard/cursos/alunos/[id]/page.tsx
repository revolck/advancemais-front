import { notFound } from "next/navigation";

import { getCursoAlunoDetalhes } from "@/api/cursos";
import { AlunoDetailsView } from "@/theme/dashboard/components/admin";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

interface AlunoDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlunoDetailsPage({
  params,
}: AlunoDetailsPageProps) {
  const { id } = await params;
  const safeAlunoPath = `/dashboard/cursos/alunos/${encodeURIComponent(id)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeAlunoPath);

  let alunoResponse: Awaited<ReturnType<typeof getCursoAlunoDetalhes>>;

  try {
    alunoResponse = await getCursoAlunoDetalhes(id, {
      headers: authHeaders,
    });
  } catch (error) {
    handleDashboardApiError(error, loginUrl, {
      scope: "dashboard-curso-aluno-details",
      alunoId: id,
    });
  }

  if (!alunoResponse?.data) {
    console.error("Aluno não encontrado:", id);
    notFound();
  }

  return (
    <div className="space-y-8">
      <AlunoDetailsView alunoId={id} initialData={alunoResponse.data} />
    </div>
  );
}
