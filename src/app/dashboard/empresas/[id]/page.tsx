import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getAdminCompanyConsolidated } from "@/api/empresas/admin";
import { CompanyDetailsView } from "@/theme/dashboard/components/admin";

interface CompanyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailsPage(
  props: CompanyDetailsPageProps
) {
  const { id } = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  const consolidatedResult = await getAdminCompanyConsolidated(id, {
    headers: authHeaders,
  });

  if (!("empresa" in consolidatedResult)) {
    console.error("Erro na resposta da API consolidada:", consolidatedResult);
    notFound();
  }

  const empresa = consolidatedResult.empresa;
  const payments = consolidatedResult.pagamentos?.recentes || [];
  const bans = consolidatedResult.bloqueios?.historico || [];
  const vacancies = consolidatedResult.vagas?.recentes || [];
  const auditoria = consolidatedResult.auditoria?.recentes || [];

  // Extrair plano ativo e pagamento atual da estrutura consolidada
  const planAtivo = consolidatedResult.planos?.ativos?.[0] || null;
  const pagamentoAtual = consolidatedResult.pagamentos?.recentes?.[0] || null;

  // Adicionar plano e pagamento aos dados da empresa para compatibilidade
  const empresaComPlano = {
    ...empresa,
    plano: planAtivo,
    pagamento: pagamentoAtual,
  };

  return (
    <CompanyDetailsView
      company={empresaComPlano}
      payments={payments}
      bans={bans}
      vacancies={vacancies}
      auditoria={auditoria}
    />
  );
}
