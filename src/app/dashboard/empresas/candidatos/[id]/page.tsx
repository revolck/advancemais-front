import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getAdminCandidatoConsolidated } from "@/api/candidatos/admin";
import type { AdminCandidatoConsolidatedData } from "@/api/candidatos/admin";
import { UserRole } from "@/config/roles";
import { CandidatoDetailsView } from "@/theme/dashboard/components/admin";
import { RecruiterCandidatoDetailsView } from "@/theme/dashboard/components/recrutador/candidatos";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

interface CandidatoDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function getUserRoleFromCookie(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user_role")?.value;

  if (!raw) return null;
  if (raw === "PSICOLOGO") return UserRole.RECRUTADOR;

  const validRoles = Object.values(UserRole);
  return validRoles.includes(raw as UserRole) ? (raw as UserRole) : null;
}

export default async function CandidatoDetailsPage({
  params,
}: CandidatoDetailsPageProps) {
  const { id } = await params;
  const role = await getUserRoleFromCookie();

  if (role === UserRole.RECRUTADOR) {
    return (
      <div className="space-y-8">
        <RecruiterCandidatoDetailsView candidatoId={id} />
      </div>
    );
  }

  const safeCandidatoPath = `/dashboard/empresas/candidatos/${encodeURIComponent(id)}`;
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
