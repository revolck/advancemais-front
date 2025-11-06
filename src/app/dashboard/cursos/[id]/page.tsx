import { notFound, redirect } from "next/navigation";

import { getCursoById } from "@/api/cursos";
import { CursoDetailsView } from "@/theme/dashboard/components/admin";
import { requireDashboardAuth } from "@/lib/auth/server";

// Force this page to be a Server Component
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CursoDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CursoDetailsPage({
  params,
}: CursoDetailsPageProps) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const safeCursoPath = `/dashboard/cursos/${encodeURIComponent(id)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeCursoPath);

  let curso: Awaited<ReturnType<typeof getCursoById>> | null = null;
  let error: Error | null = null;

  try {
    curso = await getCursoById(id, { headers: authHeaders });
  } catch (err) {
    const apiError = err as { status?: number };
    const status = apiError?.status;

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
    error = err instanceof Error ? err : new Error("Erro ao buscar curso");
    console.error("Erro ao buscar curso:", {
      error: err,
      cursoId: id,
      scope: "dashboard-curso-details",
    });
  }

  // Se não há curso e não é um erro tratável, mostra notFound
  if (!curso && !error) {
    console.error("Curso não encontrado:", id);
    notFound();
  }

  // Se há erro mas não é um status específico, passa null e configura retry: false
  // para evitar tentativas infinitas que causam loading infinito
  if (error && !curso) {
    // Para erros 500 ou outros, ainda renderiza o componente mas ele vai tratar o erro
    // O React Query vai tentar uma vez no cliente, mas não vai fazer retry infinito
    return (
      <div className="space-y-8">
        <CursoDetailsView
          cursoId={id}
          initialCurso={null as any}
          initialError={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CursoDetailsView cursoId={id} initialCurso={curso!} />
    </div>
  );
}

