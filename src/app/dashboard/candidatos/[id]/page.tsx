import { redirect } from "next/navigation";

interface CandidatoRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidatoRedirectPage({
  params,
}: CandidatoRedirectPageProps) {
  const { id } = await params;
  
  // Redireciona permanentemente para a rota correta
  redirect(`/dashboard/empresas/candidatos/${id}`);
}



