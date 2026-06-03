import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getCursoById } from "@/api/cursos";
import { UserRole } from "@/config/roles";
import { requireDashboardAuth } from "@/lib/auth/server";
import { EditCursoView } from "@/theme/dashboard/components/admin/curso-edit";

// Force this page to be a Server Component
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface EditCursoPageProps {
  params: Promise<{ id: string }>;
}

async function getUserRoleFromCookie(): Promise<UserRole | null> {
  const raw = (await cookies()).get("user_role")?.value;
  if (raw === "PSICOLOGO") return UserRole.RECRUTADOR;
  return Object.values(UserRole).includes(raw as UserRole)
    ? (raw as UserRole)
    : null;
}

const ALLOWED_EDIT_ROLES = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.MODERADOR,
  UserRole.PEDAGOGICO,
]);

export default async function EditCursoPage({ params }: EditCursoPageProps) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const safeCursoPath = `/dashboard/cursos/${encodeURIComponent(id)}/editar`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeCursoPath);
  const role = await getUserRoleFromCookie();

  if (role && !ALLOWED_EDIT_ROLES.has(role)) {
    redirect("/dashboard/unauthorized");
  }

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
