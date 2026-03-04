import { redirect } from "next/navigation";

export default async function CertificadoVisualizarPage({
  params,
}: {
  params: Promise<{ certificadoId: string }>;
}) {
  const { certificadoId } = await params;
  redirect(`/api/certificados/${certificadoId}/preview`);
}
