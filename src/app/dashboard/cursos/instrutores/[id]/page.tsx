import { notFound } from "next/navigation";

import { getInstrutorById } from "@/api/usuarios";
import { InstrutorDetailsView } from "@/theme/dashboard/components/admin";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

interface InstrutorDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InstrutorDetailsPage({
  params,
}: InstrutorDetailsPageProps) {
  const { id } = await params;
  const safeInstrutorPath = `/dashboard/cursos/instrutores/${encodeURIComponent(
    id
  )}`;
  const { token, loginUrl } = await requireDashboardAuth(safeInstrutorPath);

  let instrutorResponse: Awaited<ReturnType<typeof getInstrutorById>>;

  try {
    instrutorResponse = await getInstrutorById(id, token);
  } catch (error) {
    handleDashboardApiError(error, loginUrl, {
      scope: "dashboard-curso-instrutor-details",
      instrutorId: id,
    });
  }

  if (!instrutorResponse?.data) {
    console.error("Instrutor não encontrado:", id);
    notFound();
  }

  return (
    <div className="space-y-8">
      <InstrutorDetailsView
        instrutorId={id}
        initialData={instrutorResponse.data}
      />
    </div>
  );
}
