"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { VagaDetailsView } from "@/theme/dashboard/components/admin/vaga-details";
import { RecruiterVagaDetailsView } from "@/theme/dashboard/components/recrutador/vagas/RecruiterVagaDetailsView";
import { useParams } from "next/navigation";

export default function VagaDetailPage() {
  const params = useParams();
  const role = useUserRole();
  const rawId = params?.id;
  const vagaId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : null;

  if (!vagaId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Vaga inválida.</AlertDescription>
      </Alert>
    );
  }

  if (!role) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (role === UserRole.RECRUTADOR) {
    return <RecruiterVagaDetailsView vagaId={vagaId} />;
  }

  return <VagaDetailsView vagaId={vagaId} />;
}
