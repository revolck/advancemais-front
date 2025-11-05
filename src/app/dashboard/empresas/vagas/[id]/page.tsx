"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { VagaDetailsView } from "@/theme/dashboard/components/admin/vaga-details";
import { useParams } from "next/navigation";

export default function VagaDetailPage() {
  const params = useParams();
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

  return <VagaDetailsView vagaId={vagaId} />;
}
