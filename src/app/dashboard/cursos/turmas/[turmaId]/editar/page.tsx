import { notFound, redirect } from "next/navigation";

import { getTurmaById, getCursoById, listCursos } from "@/api/cursos";
import { EditTurmaForm } from "@/theme/dashboard/components/admin/lista-turmas/components/EditTurmaForm";
import { requireDashboardAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface EditarTurmaPageProps {
  params: Promise<{ turmaId: string }>;
  searchParams?: Promise<{ cursoId?: string | string[] }>;
}

function getSearchParamAsString(
  value: string | string[] | undefined
): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

async function findCursoByTurmaId(
  turmaId: string,
  authHeaders: HeadersInit
): Promise<{ cursoId: string; cursoNome?: string } | null> {
  try {
    let page = 1;
    const pageSize = 50;
    let allCursos: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const cursosResponse = await listCursos(
        { page, pageSize },
        { headers: authHeaders }
      );

      const cursos = cursosResponse.data || [];
      allCursos = [...allCursos, ...cursos];

      const totalPages = cursosResponse.pagination?.totalPages || 1;
      hasMore = page < totalPages;
      page++;

      if (page > 100) break;
    }

    for (const curso of allCursos) {
      const cursoComTurmas = curso as any;
      if (Array.isArray(cursoComTurmas.turmas)) {
        const turmaEncontrada = cursoComTurmas.turmas.find(
          (t: any) => String(t.id) === String(turmaId)
        );
        if (turmaEncontrada) {
          return { cursoId: String(curso.id), cursoNome: curso.nome };
        }
      }
    }

    for (const curso of allCursos) {
      try {
        const cursoCompleto = await getCursoById(curso.id, {
          headers: authHeaders,
        });
        if (Array.isArray(cursoCompleto.turmas)) {
          const turmaEncontrada = cursoCompleto.turmas.find(
            (t) => String(t.id) === String(turmaId)
          );
          if (turmaEncontrada) {
            return { cursoId: String(curso.id), cursoNome: cursoCompleto.nome };
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default async function EditarTurmaPage({
  params,
  searchParams,
}: EditarTurmaPageProps) {
  const { turmaId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!turmaId) {
    notFound();
  }

  const safeTurmaPath = `/dashboard/cursos/turmas/${encodeURIComponent(
    turmaId
  )}/editar`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeTurmaPath);

  let turma: Awaited<ReturnType<typeof getTurmaById>> | null = null;
  let cursoNome: string | undefined;
  let cursoId: string | null = null;

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
          includeAlunos: false,
          includeEstrutura: true,
        });
      } catch (directError: any) {
        const status = Number(directError?.status ?? 0);
        if (status !== 404) throw directError;
        turma = null;
        cursoId = null;
      }
    }

    if (!turma) {
      const cursoInfo = await findCursoByTurmaId(turmaId, authHeaders);

      if (!cursoInfo) {
        notFound();
      }

      cursoId = cursoInfo.cursoId;
      cursoNome = cursoInfo.cursoNome;

      turma = await getTurmaById(cursoId, turmaId, {
        headers: authHeaders,
        includeAlunos: false,
        includeEstrutura: true,
      });
    }

    if (!cursoNome && cursoId) {
      try {
        const curso = await getCursoById(cursoId, { headers: authHeaders });
        cursoNome = curso.nome;
      } catch {
        // ignora
      }
    }
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

    throw err;
  }

  if (!cursoId) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <EditTurmaForm
        turmaId={turmaId}
        cursoId={cursoId}
        cursoNome={cursoNome}
        initialTurma={turma}
        backHref={`/dashboard/cursos/turmas/${encodeURIComponent(
          turmaId
        )}?cursoId=${encodeURIComponent(String(cursoId))}`}
      />
    </div>
  );
}
