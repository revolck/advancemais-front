import { notFound } from "next/navigation";

import { getUsuarioById } from "@/api/usuarios";
import { UsuarioDetailsView } from "@/theme/dashboard/components/admin";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

interface UsuarioDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UsuarioDetailsPage({
  params,
}: UsuarioDetailsPageProps) {
  const { id } = await params;
  const safeUsuarioPath = `/dashboard/usuarios/${encodeURIComponent(id)}`;
  const { token, loginUrl } = await requireDashboardAuth(safeUsuarioPath);

  let usuarioResponse: Awaited<ReturnType<typeof getUsuarioById>>;

  try {
    usuarioResponse = await getUsuarioById(id, token);
  } catch (error) {
    handleDashboardApiError(error, loginUrl, {
      scope: "dashboard-usuario-details",
      usuarioId: id,
    });
  }

  if (!usuarioResponse?.usuario) {
    console.error("Usuário não encontrado:", id);
    notFound();
  }

  return (
    <div className="space-y-8">
      <UsuarioDetailsView
        usuarioId={id}
        initialData={usuarioResponse.usuario}
      />
    </div>
  );
}
