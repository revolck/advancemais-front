import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ certificadoId: string }>;
}

export default async function DashboardCertificadoVisualizarRedirectPage({
  params,
}: PageProps) {
  const { certificadoId } = await params;
  redirect(`/certificados/${certificadoId}/visualizar`);
}
