import { notFound, redirect } from "next/navigation";

import { getAvaliacao } from "@/api/cursos";
import { getAvaliacaoRespostaById } from "@/api/provas";
import { requireDashboardAuth } from "@/lib/auth/server";
import { RespostaDetailsView } from "@/theme/dashboard/components/admin/prova-details/RespostaDetailsView";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RespostaDetalhePageProps {
  params: Promise<{ id: string; respostaId: string }>;
}

export default async function RespostaDetalhePage({ params }: RespostaDetalhePageProps) {
  const { id: avaliacaoId, respostaId } = await params;

  if (!avaliacaoId || !respostaId) {
    notFound();
  }

  const safePath = `/dashboard/cursos/atividades-provas/${encodeURIComponent(avaliacaoId)}/respostas/${encodeURIComponent(respostaId)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safePath);

  let avaliacao = null;
  let resposta = null;
  let error: Error | null = null;

  try {
    avaliacao = await getAvaliacao(avaliacaoId, { headers: authHeaders });
    resposta = await getAvaliacaoRespostaById(avaliacaoId, respostaId, {
      headers: authHeaders,
      cache: "no-cache",
    });
  } catch (err) {
    const apiError = err as { status?: number };

    if (apiError?.status === 401) {
      redirect(loginUrl);
    }

    if (apiError?.status === 403) {
      redirect("/dashboard/unauthorized");
    }

    if (apiError?.status === 404) {
      notFound();
    }

    error = err instanceof Error ? err : new Error("Erro ao carregar resposta");

    console.error("Erro ao buscar detalhe de resposta", {
      avaliacaoId,
      respostaId,
      error: err,
      scope: "dashboard-avaliacao-resposta-details",
    });
  }

  return (
    <RespostaDetailsView
      avaliacaoId={avaliacaoId}
      respostaId={respostaId}
      initialAvaliacao={avaliacao}
      initialData={resposta}
      initialError={error}
    />
  );
}
