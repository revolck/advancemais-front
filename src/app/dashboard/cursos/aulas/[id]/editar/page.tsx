import { notFound, redirect } from "next/navigation";

import { getAulaById } from "@/api/aulas";
import { EditAulaView } from "@/theme/dashboard/components/admin/aula-details";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

// Force this page to be a Server Component
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface EditAulaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAulaPage({ params }: EditAulaPageProps) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const safeAulaPath = `/dashboard/cursos/aulas/${encodeURIComponent(id)}/editar`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeAulaPath);

  let aulaResponse: Awaited<ReturnType<typeof getAulaById>> | null = null;

  try {
    // ✅ SEMPRE usar noCache: true para garantir dados frescos na edição
    // Isso evita que dados antigos sejam exibidos após uma edição
    aulaResponse = await getAulaById(id, { headers: authHeaders }, { noCache: true });
  } catch (error) {
    handleDashboardApiError(error, loginUrl, {
      scope: "dashboard-aula-edit",
      aulaId: id,
    });
  }

  if (!aulaResponse) {
    console.error("Aula não encontrada:", id);
    notFound();
  }

  return (
    <div className="space-y-8">
      <EditAulaView aulaId={id} initialData={aulaResponse} />
    </div>
  );
}



