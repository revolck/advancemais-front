import { notFound, redirect } from "next/navigation";

import { getCursoById } from "@/api/cursos";
import { requireDashboardAuth } from "@/lib/auth/server";
import { EditCursoView } from "@/theme/dashboard/components/admin/curso-edit";

// Force this page to be a Server Component
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface EditCursoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCursoPage({ params }: EditCursoPageProps) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const safeCursoPath = `/dashboard/cursos/${encodeURIComponent(id)}/editar`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeCursoPath);

  let curso: Awaited<ReturnType<typeof getCursoById>> | null = null;

  try {
    curso = await getCursoById(id, { headers: authHeaders });
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

    console.error("Erro ao buscar curso:", {
      error: err,
      cursoId: id,
      scope: "edit-curso-page",
    });
    notFound();
  }

  if (!curso) {
    notFound();
  }

  return <EditCursoView curso={curso} />;
}

