import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getAdminCompanyConsolidated } from "@/api/empresas/admin";
import { CompanyDetailsView } from "@/theme/dashboard/components/admin";

interface CompanyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailsPage({
  params,
}: CompanyDetailsPageProps) {
  const { id } = await params;
  const safeCompanyPath = `/dashboard/empresas/${encodeURIComponent(id)}`;
  const encodedRedirect = encodeURIComponent(safeCompanyPath);

  const headerList = await headers();
  const hostHeader =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  const [hostnameRaw, port] = hostHeader.split(":");
  const hostname = hostnameRaw || "app.advancemais.com";
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (isLocalhost ? "http" : "https");
  const portSegment = port ? `:${port}` : "";

  const baseDomain = hostname
    .replace(/^www\./, "")
    .replace(/^app\./, "")
    .replace(/^auth\./, "");

  const loginUrl = isLocalhost
    ? `${protocol}://${hostname}${portSegment}/auth/login?redirect=${encodedRedirect}`
    : `${protocol}://auth.${baseDomain}${portSegment}/login?redirect=${encodedRedirect}`;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  if (!token) {
    redirect(loginUrl);
  }

  let consolidatedResult: Awaited<
    ReturnType<typeof getAdminCompanyConsolidated>
  >;

  try {
    consolidatedResult = await getAdminCompanyConsolidated(id, {
      headers: authHeaders,
    });
  } catch (error) {
    const status = (error as { status?: number } | undefined)?.status;

    if (status === 401) {
      redirect(loginUrl);
    }

    if (status === 403) {
      redirect("/dashboard/unauthorized");
    }

    if (status === 404) {
      notFound();
    }

    console.error("Erro inesperado ao carregar empresa", {
      id,
      error,
    });

    throw error;
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
