import { notFound, redirect } from "next/navigation";

import { getTurmaById, getCursoById, listCursos } from "@/api/cursos";
import { TurmaDetailsView } from "@/theme/dashboard/components/admin/turma-details";
import { requireDashboardAuth } from "@/lib/auth/server";

// Force this page to be a Server Component
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface TurmaDetailsPageProps {
  params: Promise<{ turmaId: string }>;
  searchParams?: Promise<{ cursoId?: string | string[] }>;
}

const TURMA_CURSO_CACHE_TTL_MS = 5 * 60 * 1000;
const turmaCursoCache = new Map<
  string,
  { cursoId: number | string; expiresAt: number }
>();

function getSearchParamAsString(
  value: string | string[] | undefined
): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

/**
 * Busca o cursoId de uma turma procurando em todos os cursos
 * Isso é necessário porque a API ainda requer cursoId para buscar a turma
 */
async function findCursoIdByTurmaId(
  turmaId: string,
  authHeaders: HeadersInit
): Promise<number | string | null> {
  const cached = turmaCursoCache.get(String(turmaId));
  if (cached && cached.expiresAt > Date.now()) {
    return cached.cursoId;
  }

  try {
    // Busca todos os cursos com paginação para garantir que pegamos todos
    let page = 1;
    const pageSize = 200; // aproveita o novo limite da API para reduzir chamadas
    let allCursos: any[] = [];
    let hasMore = true;
    
    // Busca todas as páginas de cursos
    while (hasMore) {
      const cursosResponse = await listCursos(
        { page, pageSize },
        { headers: authHeaders }
      );
      
      const cursos = cursosResponse.data || [];
      allCursos = [...allCursos, ...cursos];
      
      // Verifica se há mais páginas
      const totalPages = cursosResponse.pagination?.totalPages || 1;
      hasMore = page < totalPages;
      page++;
      
      // Limite de segurança para evitar loop infinito
      if (page > 100) {
        console.warn("⚠️ Limite de páginas atingido ao buscar cursos");
        break;
      }
    }
    
    // Log para debug
    console.log("📋 Buscando cursoId para turma:", {
      turmaId,
      totalCursos: allCursos.length,
      totalPages: page - 1,
    });
    
    // Primeiro, tenta encontrar nas turmas já incluídas na resposta
    for (const curso of allCursos) {
      const cursoComTurmas = curso as any;
      if (cursoComTurmas.turmas && Array.isArray(cursoComTurmas.turmas)) {
        const turmaEncontrada = cursoComTurmas.turmas.find((t: any) => String(t.id) === String(turmaId));
        if (turmaEncontrada) {
          console.log("✅ Turma encontrada no curso (turmas incluídas):", {
            cursoId: curso.id,
            cursoNome: curso.nome,
            turmaId,
          });
          turmaCursoCache.set(String(turmaId), {
            cursoId: curso.id,
            expiresAt: Date.now() + TURMA_CURSO_CACHE_TTL_MS,
          });
          return curso.id;
        }
      }
    }
    
    // Se não encontrou, busca cada curso individualmente para garantir que pegamos as turmas
    console.log("⚠️ Turma não encontrada nas turmas incluídas, buscando individualmente...");
    
    for (const curso of allCursos) {
      try {
        const cursoCompleto = await getCursoById(curso.id, { headers: authHeaders });
        if (cursoCompleto.turmas && Array.isArray(cursoCompleto.turmas)) {
          const turmaEncontrada = cursoCompleto.turmas.find((t) => String(t.id) === String(turmaId));
          if (turmaEncontrada) {
            console.log("✅ Turma encontrada no curso (busca individual):", {
              cursoId: curso.id,
              cursoNome: curso.nome,
              turmaId,
            });
            turmaCursoCache.set(String(turmaId), {
              cursoId: curso.id,
              expiresAt: Date.now() + TURMA_CURSO_CACHE_TTL_MS,
            });
            return curso.id;
          }
        }
      } catch (err) {
        // Continua para o próximo curso se houver erro
        continue;
      }
    }
    
    console.error("❌ Turma não encontrada em nenhum curso:", turmaId);
    return null;
  } catch (error) {
    console.error("Erro ao buscar cursoId da turma:", error);
    return null;
  }
}

export default async function TurmaDetailsPage({
  params,
  searchParams,
}: TurmaDetailsPageProps) {
  const { turmaId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!turmaId) {
    notFound();
  }

  const safeTurmaPath = `/dashboard/cursos/turmas/${encodeURIComponent(turmaId)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeTurmaPath);

  let turma: Awaited<ReturnType<typeof getTurmaById>> | null = null;
  let cursoNome: string | undefined;
  let cursoId: number | string | null = null;
  let error: Error | null = null;

  try {
    const cursoIdFromQuery = getSearchParamAsString(
      resolvedSearchParams?.cursoId
    );
    const hasValidCursoIdFromQuery = Boolean(cursoIdFromQuery?.trim());

    if (hasValidCursoIdFromQuery && cursoIdFromQuery) {
      cursoId = cursoIdFromQuery.trim();
      try {
        turma = await getTurmaById(cursoId, turmaId, {
          headers: authHeaders,
        });
      } catch (directError: any) {
        const status = Number(directError?.status ?? 0);
        if (status !== 404) {
          throw directError;
        }
        turma = null;
        cursoId = null;
      }
    }

    if (!turma) {
      cursoId = await findCursoIdByTurmaId(turmaId, authHeaders);

      if (!cursoId) {
        console.error("Não foi possível encontrar cursoId para a turma:", turmaId);
        notFound();
      }

      turma = await getTurmaById(cursoId, turmaId, {
        headers: authHeaders,
      });
    }

    if (cursoId != null) {
      // Buscar nome do curso
      try {
        const curso = await getCursoById(cursoId, {
          headers: authHeaders,
        });
        cursoNome = curso.nome;
      } catch {
        // Se falhar ao buscar curso, continua sem o nome
      }
    }
  } catch (err) {
    const apiError = err as { status?: number; message?: string };
    const status = apiError?.status;

    // Log detalhado para diagnóstico
    console.error("Erro ao buscar turma:", {
      error: err,
      status,
      errorMessage: apiError?.message,
      turmaId: turmaId,
      cursoId,
      scope: "dashboard-turma-details",
    });

    // Tratamento de erros específicos que devem redirecionar
    if (status === 401) {
      redirect(loginUrl);
    }

    if (status === 403) {
      redirect("/dashboard/unauthorized");
    }

    if (status === 404) {
      notFound();
    }

    // Para outros erros, captura mas não lança exceção
    // O componente cliente vai tratar via React Query
    error = err instanceof Error ? err : new Error("Erro ao buscar turma");
    
    // Preserva o status no erro se existir
    if (status && !(error as any).status) {
      (error as any).status = status;
    }
  }

  // Se não há turma e não é um erro tratável, mostra notFound
  if (!turma && !error) {
    console.error("Turma não encontrada:", turmaId);
    notFound();
  }

  // Se não temos cursoId, não podemos continuar
  if (!cursoId) {
    notFound();
  }

  // Se há erro mas não é um status específico, passa null e configura retry: false
  // para evitar tentativas infinitas que causam loading infinito
  if (error && !turma) {
    // Para erros 500 ou outros, ainda renderiza o componente mas ele vai tratar o erro
    // O React Query vai tentar uma vez no cliente, mas não vai fazer retry infinito
    return (
      <div className="space-y-8">
        <TurmaDetailsView
          cursoId={cursoId}
          turmaId={turmaId}
          initialTurma={null as any}
          initialError={error}
          cursoNome={cursoNome}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TurmaDetailsView
        cursoId={cursoId}
        turmaId={turmaId}
        initialTurma={turma!}
        cursoNome={cursoNome}
      />
    </div>
  );
}
