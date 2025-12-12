import { notFound, redirect } from "next/navigation";

import { getAulaById } from "@/api/aulas";
import { AulaDetailsView } from "@/theme/dashboard/components/admin/aula-details";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

// Force this page to be a Server Component
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AulaDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AulaDetailsPage({
  params,
}: AulaDetailsPageProps) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const safeAulaPath = `/dashboard/cursos/aulas/${encodeURIComponent(id)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeAulaPath);

  let aulaResponse: Awaited<ReturnType<typeof getAulaById>> | null = null;
  let error: Error | null = null;

  try {
    aulaResponse = await getAulaById(id, { headers: authHeaders });
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
    error = err instanceof Error ? err : new Error("Erro ao buscar aula");
    console.error("Erro ao buscar aula:", {
      error: err,
      aulaId: id,
      scope: "dashboard-aula-details",
    });
  }

  // Se não há aula e não é um erro tratável, mostra notFound
  if (!aulaResponse && !error) {
    console.error("Aula não encontrada:", id);
    notFound();
  }

  // Se há erro mas não é um status específico, passa null e configura retry: false
  if (error && !aulaResponse) {
    return (
      <div className="space-y-8">
        <AulaDetailsView
          aulaId={id}
          initialAula={null as any}
          initialError={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AulaDetailsView aulaId={id} initialAula={aulaResponse!} />
    </div>
  );
}

