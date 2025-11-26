"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type {
  AdminCompanyDetail,
  AdminCompanyConsolidatedResponse,
  AdminCompanyPagamento,
  AdminCompanyVagaItem,
} from "@/api/empresas/admin/types";
import { getAdminCompanyConsolidated } from "@/api/empresas/admin";
import {
  EditarEmpresaModal,
  EditarEmpresaEnderecoModal,
  BloquearEmpresaModal,
  EditarAssinaturaModal,
  AdicionarAssinaturaModal,
  ResetarSenhaModal,
} from "./modals";
import { DesbloquearEmpresaModal } from "./modal-acoes/DesbloquearEmpresaModal";
import type { CompanyDetailsViewProps } from "./types";
import { AboutTab } from "./tabs/AboutTab";
import { VacancyTab } from "./tabs/VacancyTab";
import { PlanTab } from "./tabs/PlanTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { HeaderInfo } from "./components/HeaderInfo";

const COMPANY_QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutos
const COMPANY_QUERY_GC_TIME = 30 * 60 * 1000; // 30 minutos

async function fetchCompanyConsolidated(
  companyId: string
): Promise<AdminCompanyConsolidatedResponse> {
  const response = await getAdminCompanyConsolidated(companyId);
  if ("empresa" in response) {
    return response;
  }

  const message =
    (response as { message?: string }).message ??
    "Não foi possível carregar os dados da empresa.";
  throw new Error(message);
}

function deriveCompanyData(
  baseCompany: AdminCompanyDetail,
  consolidated: AdminCompanyConsolidatedResponse
): AdminCompanyDetail {
  const planAtivo = consolidated.planos.ativos?.[0] ?? baseCompany.plano ?? null;
  const pagamentoAtual =
    consolidated.pagamentos.recentes?.[0] ?? baseCompany.pagamento ?? null;

  const pagamento: AdminCompanyPagamento = {
    modelo:
      planAtivo?.modeloPagamento ??
      baseCompany.pagamento?.modelo ??
      "MENSAL",
    metodo:
      planAtivo?.metodoPagamento ??
      baseCompany.pagamento?.metodo ??
      "CREDITO",
    status:
      planAtivo?.statusPagamento ??
      baseCompany.pagamento?.status ??
      "PENDENTE",
    ultimoPagamentoEm:
      pagamentoAtual?.criadoEm ??
      baseCompany.pagamento?.ultimoPagamentoEm ??
      new Date().toISOString(),
  };

  return {
    ...baseCompany,
    ...consolidated.empresa,
    plano: planAtivo ?? null,
    pagamento,
    vagas: {
      publicadas:
        consolidated.vagas.total ??
        baseCompany.vagas?.publicadas ??
        consolidated.vagas.recentes.length ??
        0,
      limitePlano:
        planAtivo?.quantidadeVagas ?? baseCompany.vagas?.limitePlano ?? 0,
    },
    banida:
      Boolean(consolidated.bloqueios.ativos.length) || baseCompany.banida,
    banimentoAtivo:
      consolidated.bloqueios.ativos[0] ??
      baseCompany.banimentoAtivo ??
      null,
  };
}

export function CompanyDetailsView({
  company,
  payments = [],
  vacancies = [],
  auditoria = [],
  initialConsolidated,
}: CompanyDetailsViewProps) {
  const queryKey = useMemo(
    () => queryKeys.empresas.detail(company.id),
    [company.id]
  );

  const {
    data: consolidatedData,
    isFetching,
    refetch,
  } = useQuery<AdminCompanyConsolidatedResponse, Error>({
    queryKey,
    queryFn: () => fetchCompanyConsolidated(company.id),
    initialData: initialConsolidated,
    staleTime: COMPANY_QUERY_STALE_TIME,
    gcTime: COMPANY_QUERY_GC_TIME,
  });

  const companyData = useMemo(
    () => deriveCompanyData(company, consolidatedData),
    [company, consolidatedData]
  );

  const allPayments =
    consolidatedData.pagamentos.recentes?.length !== undefined
      ? consolidatedData.pagamentos.recentes
      : payments;
  const allVacancies =
    consolidatedData.vagas.recentes?.length !== undefined
      ? consolidatedData.vagas.recentes
      : vacancies;
  const allAuditoria =
    consolidatedData.auditoria.recentes?.length !== undefined
      ? consolidatedData.auditoria.recentes
      : auditoria;

  const plan = companyData.plano;
  const payment = companyData.pagamento;

  const publishedVacancies = allVacancies.reduce((count, vacancy) => {
    const status = vacancy.status?.toUpperCase();
    return count + (status === "PUBLICADO" || status === "EM_ANALISE" ? 1 : 0);
  }, 0);

  const totalVacancies =
    plan?.quantidadeVagas ?? companyData.vagas?.limitePlano ?? 0;

  const relevantVacanciesCount = allVacancies.reduce((count, vacancy) => {
    const status = vacancy.status?.toUpperCase();
    return (
      count +
      (status === "PUBLICADO" ||
      status === "EM_ANALISE" ||
      status === "PAUSADA" ||
      status === "ENCERRADA" ||
      status === "EXPIRADO"
        ? 1
        : 0)
    );
  }, 0);

  const isCompanyActive = companyData.status === "ATIVO" || companyData.ativa;
  const isReloading = isFetching;

  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isBanCompanyOpen, setIsBanCompanyOpen] = useState(false);
  const [isUnbanCompanyOpen, setIsUnbanCompanyOpen] = useState(false);
  const [isEditSubscriptionOpen, setIsEditSubscriptionOpen] = useState(false);
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const reloadCompanyData = useCallback(async () => {
    const result = await refetch();
    if (result.error) {
      throw result.error;
    }
    return result.data;
  }, [refetch]);

  const hasPlan = Boolean(
    companyData.plano &&
      (companyData.plano.nome ||
        companyData.plano.valor ||
        companyData.plano.modo ||
        companyData.plano.inicio ||
        companyData.plano.fim)
  );

  const handleSubscriptionAction = useCallback(() => {
    if (hasPlan) {
      setIsEditSubscriptionOpen(true);
    } else {
      setIsAddSubscriptionOpen(true);
    }
  }, [hasPlan]);


  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "FileText",
      content: <AboutTab company={companyData} isLoading={isReloading} />,
    },
    {
      value: "assinatura",
      label: "Assinatura",
      icon: "CreditCard",
      content: (
        <PlanTab
          isCompanyActive={isCompanyActive}
          plan={plan}
          payment={payment}
          payments={allPayments}
          isLoading={isReloading}
        />
      ),
    },
    {
      value: "vagas",
      label: "Vagas",
      icon: "Briefcase",
      content: (
        <VacancyTab
          vacancies={allVacancies}
          publishedVacancies={publishedVacancies}
          totalVacancies={totalVacancies}
        />
      ),
      badge: relevantVacanciesCount ? <span>{relevantVacanciesCount}</span> : null,
    },
    {
      value: "historico",
      label: "Histórico",
      icon: "History",
      content: (
        <HistoryTab
          auditoria={allAuditoria}
          isLoading={isReloading}
        />
      ),
      badge: allAuditoria.length ? <span>{allAuditoria.length}</span> : null,
    },
  ];

  return (
    <div className="space-y-8">
      <HeaderInfo
        company={companyData}
        onEditCompany={() => setIsEditCompanyOpen(true)}
        onEditAddress={() => setIsEditAddressOpen(true)}
        onBanCompany={() => setIsBanCompanyOpen(true)}
        onUnbanCompany={() => setIsUnbanCompanyOpen(true)}
        onEditSubscription={handleSubscriptionAction}
        onResetPassword={() => setIsResetPasswordOpen(true)}
      />

      <HorizontalTabs items={tabs} defaultValue="sobre" />

      <EditarEmpresaModal
        isOpen={isEditCompanyOpen}
        onOpenChange={setIsEditCompanyOpen}
        company={companyData}
      />

      <EditarEmpresaEnderecoModal
        isOpen={isEditAddressOpen}
        onOpenChange={setIsEditAddressOpen}
        company={companyData}
      />

      <BloquearEmpresaModal
        isOpen={isBanCompanyOpen}
        onOpenChange={setIsBanCompanyOpen}
        companyId={companyData.id}
      />

      <DesbloquearEmpresaModal
        isOpen={isUnbanCompanyOpen}
        onOpenChange={setIsUnbanCompanyOpen}
        company={companyData}
      />

      <EditarAssinaturaModal
        isOpen={isEditSubscriptionOpen}
        onOpenChange={setIsEditSubscriptionOpen}
        company={companyData}
      />

      <AdicionarAssinaturaModal
        isOpen={isAddSubscriptionOpen}
        onOpenChange={setIsAddSubscriptionOpen}
        company={companyData}
      />

      <ResetarSenhaModal
        isOpen={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        companyId={companyData.id}
        email={companyData.email}
      />
    </div>
  );
}
