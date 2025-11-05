import { notFound } from "next/navigation";

import { getAdminCandidatoConsolidated } from "@/api/candidatos/admin";
import type { AdminCandidatoConsolidatedData } from "@/api/candidatos/admin";
import { CandidatoDetailsView } from "@/theme/dashboard/components/admin";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

interface CandidatoDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidatoDetailsPage({
  params,
}: CandidatoDetailsPageProps) {
  const { id } = await params;
  const safeCandidatoPath = `/dashboard/candidatos/${encodeURIComponent(id)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(
    safeCandidatoPath
  );

  let consolidatedResult: AdminCandidatoConsolidatedData | null = null;

  try {
    consolidatedResult = await getAdminCandidatoConsolidated(id, {
      headers: authHeaders,
    });
  } catch (error) {
    handleDashboardApiError(error, loginUrl, {
      scope: "dashboard-candidato-details",
      candidatoId: id,
    });
  }

  if (!consolidatedResult) {
    console.error("Candidato não encontrado:", id);
    notFound();
  }

  return (
    <div className="space-y-8">
      <CandidatoDetailsView
        candidatoId={id}
        initialConsolidated={consolidatedResult}
      />
    </div>
  );
}
