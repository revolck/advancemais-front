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

interface EditAtividadeProvaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAtividadeProvaPage({ params }: EditAtividadeProvaPageProps) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const safeAtividadeProvaPath = `/dashboard/cursos/atividades-provas/${encodeURIComponent(id)}/editar`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeAtividadeProvaPath);

  let atividadeProvaResponse: Awaited<ReturnType<typeof getAulaById>> | null = null;

  try {
    // ✅ SEMPRE usar noCache: true para garantir dados frescos na edição
    // Isso evita que dados antigos sejam exibidos após uma edição
    atividadeProvaResponse = await getAulaById(id, { headers: authHeaders }, { noCache: true });
  } catch (error) {
    handleDashboardApiError(error, loginUrl, {
      scope: "dashboard-atividade-prova-edit",
      atividadeProvaId: id,
    });
  }

  if (!atividadeProvaResponse) {
    console.error("Atividade/Prova não encontrada:", id);
    notFound();
  }

  return (
    <div className="space-y-8">
      <EditAulaView aulaId={id} initialData={atividadeProvaResponse} />
    </div>
  );
}

