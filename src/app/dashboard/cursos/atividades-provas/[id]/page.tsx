import { notFound, redirect } from "next/navigation";

import { getProvaById, listCursos, listTurmas } from "@/api/cursos";
import { ProvaDetailsView } from "@/theme/dashboard/components/admin/prova-details";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

// Force this page to be a Server Component
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ProvaDetailsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Busca cursoId e turmaId a partir do provaId
 * Percorre todas as turmas de todos os cursos para encontrar a prova
 */
async function findProvaContext(
  provaId: string,
  authHeaders: HeadersInit
): Promise<{ cursoId: number; turmaId: string } | null> {
  try {
    // Busca todos os cursos
    let page = 1;
    const pageSize = 50;
    let allCursos: { id: string | number }[] = [];
    let hasMore = true;

    while (hasMore) {
      const cursosResponse = await listCursos({ page, pageSize }, { headers: authHeaders });
      const cursos = cursosResponse.data || [];
      allCursos = [...allCursos, ...cursos];

      const totalPages = cursosResponse.pagination?.totalPages || 1;
      hasMore = page < totalPages;
      page++;

      if (page > 100) break; // Limite de segurança
    }

    // Busca provas em todas as turmas de todos os cursos
    for (const curso of allCursos) {
      try {
        const turmas = await listTurmas(curso.id, { headers: authHeaders });
        
        for (const turma of turmas) {
          try {
            // Tenta buscar a prova específica
            await getProvaById(curso.id, turma.id, provaId, { headers: authHeaders });
            // Se chegou aqui, encontrou a prova
            return {
              cursoId: Number(curso.id),
              turmaId: turma.id,
            };
          } catch (err: any) {
            // Se for 404, continua procurando em outras turmas
            // Se for outro erro, também continua (pode ser problema de permissão, etc)
            if (err?.status === 404) {
              continue;
            }
            // Para outros erros, também continua procurando
            continue;
          }
        }
      } catch {
        // Erro ao buscar turmas, continua
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar contexto da prova:", error);
    return null;
  }
}

export default async function ProvaDetailsPage({
  params,
}: ProvaDetailsPageProps) {
  const { id: provaId } = await params;

  if (!provaId || typeof provaId !== "string") {
    notFound();
  }

  const safeProvaPath = `/dashboard/cursos/atividades-provas/${encodeURIComponent(provaId)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeProvaPath);

  // Buscar contexto (cursoId e turmaId)
  const contexto = await findProvaContext(provaId, authHeaders);

  if (!contexto) {
    console.error("Não foi possível encontrar contexto da prova:", provaId);
    notFound();
  }

  const { cursoId, turmaId } = contexto;

  let provaResponse: Awaited<ReturnType<typeof getProvaById>> | null = null;
  let error: Error | null = null;

  try {
    provaResponse = await getProvaById(cursoId, turmaId, provaId, {
      headers: authHeaders,
    });
  } catch (err) {
    const apiError = err as { status?: number };
    const status = apiError?.status;

    if (status === 401) {
      redirect(loginUrl);
    }

    if (status === 403) {
      redirect("/dashboard/unauthorized");
    }

    if (status === 404) {
      notFound();
    }

    error = err instanceof Error ? err : new Error("Erro ao buscar prova");
    console.error("Erro ao buscar prova:", {
      error: err,
      provaId,
      cursoId,
      turmaId,
      scope: "dashboard-prova-details",
    });
  }

  if (!provaResponse && !error) {
    console.error("Prova não encontrada:", provaId);
    notFound();
  }

  if (error && !provaResponse) {
    return (
      <div className="space-y-8">
        <ProvaDetailsView
          cursoId={cursoId}
          turmaId={turmaId}
          provaId={provaId}
          initialProva={null}
          initialError={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProvaDetailsView
        cursoId={cursoId}
        turmaId={turmaId}
        provaId={provaId}
        initialProva={provaResponse!}
      />
    </div>
  );
}
