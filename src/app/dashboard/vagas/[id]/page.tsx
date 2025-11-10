import { redirect } from "next/navigation";

interface VagaRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function VagaRedirectPage({
  params,
}: VagaRedirectPageProps) {
  const { id } = await params;
  
  // Redireciona permanentemente para a rota correta
  redirect(`/dashboard/empresas/vagas/${id}`);
}

