import { notFound } from "next/navigation";

import { getAdminCompanyConsolidated } from "@/api/empresas/admin";
import { CompanyDetailsView } from "@/theme/dashboard/components/admin";
import {
  handleDashboardApiError,
  requireDashboardAuth,
} from "@/lib/auth/server";

interface CompanyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailsPage({
  params,
}: CompanyDetailsPageProps) {
  const { id } = await params;
  const safeCompanyPath = `/dashboard/empresas/${encodeURIComponent(id)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(
    safeCompanyPath
  );

  let consolidatedResult: Awaited<
    ReturnType<typeof getAdminCompanyConsolidated>
  >;

  try {
    consolidatedResult = await getAdminCompanyConsolidated(id, {
      headers: authHeaders,
    });
  } catch (error) {
    handleDashboardApiError(error, loginUrl, {
      scope: "dashboard-company-details",
      companyId: id,
    });
  }

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

  // Adicionar plano, pagamento e propriedades faltantes aos dados da empresa para compatibilidade
  const empresaComPlano = {
    ...empresa,
    plano: planAtivo,
    pagamento: {
      modelo: planAtivo?.modeloPagamento || "MENSAL",
      metodo: planAtivo?.metodoPagamento || "CREDITO",
      status: planAtivo?.statusPagamento || "PENDENTE",
      ultimoPagamentoEm: pagamentoAtual?.criadoEm || new Date().toISOString(),
    },
    enderecos: [],
    vagas: {
      publicadas: consolidatedResult.vagas?.total || 0,
      limitePlano: planAtivo?.quantidadeVagas || 0,
    },
    banida: false,
    banimentoAtivo: consolidatedResult.bloqueios?.ativos?.[0] || null,
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
