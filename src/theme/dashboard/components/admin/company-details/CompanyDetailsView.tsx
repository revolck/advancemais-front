"use client";

import { useCallback, useEffect, useState } from "react";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type {
  AdminCompanyDetail,
  AdminCompanyBanItem,
  AdminCompanyVagaItem,
  AdminCompanyPlano,
  AdminCompanyPagamento,
  AdminCompanyAuditoriaItem,
} from "@/api/empresas/admin/types";
import { getAdminCompanyConsolidated } from "@/api/empresas/admin";
import {
  EditarEmpresaModal,
  EditarEmpresaEnderecoModal,
  BloquearEmpresaModal,
  EditarAssinaturaModal,
  AdicionarAssinaturaModal,
  ResetarSenhaModal,
  ViewVacancyModal,
  EditVacancyModal,
} from "./modals";
import { DesbloquearEmpresaModal } from "./modal-acoes/DesbloquearEmpresaModal";
import type { CompanyDetailsViewProps } from "./types";
import { AboutTab } from "./tabs/AboutTab";
import { VacancyTab } from "./tabs/VacancyTab";
import { PlanTab } from "./tabs/PlanTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { HeaderInfo } from "./components/HeaderInfo";

export function CompanyDetailsView({
  company,
  payments = [],
  vacancies = [],
  auditoria = [],
}: CompanyDetailsViewProps & { auditoria?: AdminCompanyAuditoriaItem[] }) {
  const [companyData, setCompanyData] = useState(company);
  const [allPayments, setAllPayments] = useState(payments);
  const [allVacancies, setAllVacancies] = useState(vacancies);
  const [allAuditoria, setAllAuditoria] = useState(auditoria);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    setCompanyData(company);
    setAllPayments(payments);
    setAllVacancies(vacancies);
    setAllAuditoria(auditoria);
  }, [company, payments, vacancies, auditoria]);

  // Função para recarregar todos os dados da API consolidada
  const reloadCompanyData = useCallback(async () => {
    setIsReloading(true);
    try {
      const consolidatedResult = await getAdminCompanyConsolidated(
        companyData.id
      );

      if ("empresa" in consolidatedResult) {
        const planAtivo = consolidatedResult.planos?.ativos?.[0] || null;
        const pagamentoAtual =
          consolidatedResult.pagamentos?.recentes?.[0] || null;

        const empresaComPlano = {
          ...consolidatedResult.empresa,
          plano: planAtivo,
          pagamento: {
            modelo: planAtivo?.modeloPagamento || "MENSAL",
            metodo: planAtivo?.metodoPagamento || "CREDITO",
            status: planAtivo?.statusPagamento || "PENDENTE",
            ultimoPagamentoEm:
              pagamentoAtual?.criadoEm || new Date().toISOString(),
          },
          enderecos: [],
          vagas: {
            publicadas: consolidatedResult.vagas?.total || 0,
            limitePlano: planAtivo?.quantidadeVagas || 0,
          },
          banida: false,
          banimentoAtivo: consolidatedResult.bloqueios?.ativos?.[0] || null,
        };

        setCompanyData(empresaComPlano);
        setAllPayments(consolidatedResult.pagamentos?.recentes || []);
        setAllVacancies(consolidatedResult.vagas?.recentes || []);
        setAllAuditoria(consolidatedResult.auditoria?.recentes || []);
      }
    } catch (error) {
      console.error("Erro ao recarregar dados da empresa:", error);
    } finally {
      setIsReloading(false);
    }
  }, [companyData.id]);

  const plan = companyData.plano;
  const payment = companyData.pagamento;

  // Calcular vagas publicadas + em análise baseado nos dados das vagas
  const publishedVacancies = allVacancies.reduce((count, vacancy) => {
    const status = vacancy.status?.toUpperCase();
    return count + (status === "PUBLICADO" || status === "EM_ANALISE" ? 1 : 0);
  }, 0);

  const totalVacancies =
    plan?.quantidadeVagas ?? companyData.vagas?.limitePlano ?? 0;

  // Contar apenas vagas relevantes para o badge (excluindo RASCUNHO e DESPUBLICADA)
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

  const [viewVacancy, setViewVacancy] = useState<AdminCompanyVagaItem | null>(
    null
  );
  const [isViewVacancyOpen, setIsViewVacancyOpen] = useState(false);
  const [editVacancy, setEditVacancy] = useState<AdminCompanyVagaItem | null>(
    null
  );
  const [isEditVacancyOpen, setIsEditVacancyOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isBanCompanyOpen, setIsBanCompanyOpen] = useState(false);
  const [isUnbanCompanyOpen, setIsUnbanCompanyOpen] = useState(false);
  const [isEditSubscriptionOpen, setIsEditSubscriptionOpen] = useState(false);
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const handleCompanyUpdated = useCallback(
    async (updates: Partial<AdminCompanyDetail>) => {
      // Atualizar dados locais imediatamente para UX responsivo
      setCompanyData((prev) => ({
        ...prev,
        ...updates,
      }));

      // Recarregar dados completos da API para atualizar auditoria e histórico
      await reloadCompanyData();
    },
    [reloadCompanyData]
  );

  const handleBanApplied = useCallback(
    async (ban: AdminCompanyBanItem) => {
      // Atualizar dados locais imediatamente para UX responsivo
      setCompanyData((prev) => ({
        ...prev,
        banimentoAtivo: ban,
        banida: true,
        status: "INATIVO",
        ativa: false,
      }));

      // Recarregar dados completos da API para atualizar auditoria e histórico
      await reloadCompanyData();
    },
    [reloadCompanyData]
  );

  const handleUnbanApplied = useCallback(async () => {
    // Atualizar dados locais imediatamente para UX responsivo
    setCompanyData((prev) => ({
      ...prev,
      banimentoAtivo: null,
      banida: false,
      bloqueada: false,
      bloqueioAtivo: null,
      status: "ATIVO",
      ativa: true,
    }));

    // Recarregar dados completos da API para atualizar auditoria e histórico
    await reloadCompanyData();
  }, [reloadCompanyData]);

  const handleSubscriptionUpdated = useCallback(
    async (plan: AdminCompanyPlano, payment: AdminCompanyPagamento) => {
      // Atualizar dados locais imediatamente para UX responsivo
      setCompanyData((prev) => ({
        ...prev,
        plano: plan,
        pagamento: payment,
      }));

      // Recarregar dados completos da API para atualizar auditoria e histórico
      await reloadCompanyData();
    },
    [reloadCompanyData]
  );

  // Verificar se a empresa tem um plano
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

  const handleViewVacancyDialogChange = (open: boolean) => {
    setIsViewVacancyOpen(open);
    if (!open) {
      setViewVacancy(null);
    }
  };

  const handleEditVacancyDialogChange = (open: boolean) => {
    setIsEditVacancyOpen(open);
    if (!open) {
      setEditVacancy(null);
    }
  };

  const aboutTabContent = (
    <AboutTab company={companyData} isLoading={isReloading} />
  );

  const vacancyTabContent = (
    <VacancyTab
      vacancies={allVacancies}
      publishedVacancies={publishedVacancies}
      totalVacancies={totalVacancies}
      onViewVacancy={(vacancy) => {
        setViewVacancy(vacancy);
        setIsViewVacancyOpen(true);
      }}
      onEditVacancy={(vacancy) => {
        setEditVacancy(vacancy);
        setIsEditVacancyOpen(true);
      }}
    />
  );

  const planTabContent = (
    <PlanTab
      isCompanyActive={isCompanyActive}
      plan={plan}
      payment={payment}
      payments={allPayments}
      isLoading={isReloading}
    />
  );

  const historyTabContent = (
    <HistoryTab auditoria={allAuditoria} isLoading={isReloading} />
  );

  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "FileText",
      content: aboutTabContent,
    },
    {
      value: "assinatura",
      label: "Assinatura",
      icon: "CreditCard",
      content: planTabContent,
    },
    {
      value: "vagas",
      label: "Vagas",
      icon: "Briefcase",
      content: vacancyTabContent,
      badge: relevantVacanciesCount ? (
        <span>{relevantVacanciesCount}</span>
      ) : null,
    },
    {
      value: "historico",
      label: "Histórico",
      icon: "History",
      content: historyTabContent,
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
        onCompanyUpdated={handleCompanyUpdated}
      />

      <EditarEmpresaEnderecoModal
        isOpen={isEditAddressOpen}
        onOpenChange={setIsEditAddressOpen}
        company={companyData}
        onCompanyUpdated={handleCompanyUpdated}
      />

      <BloquearEmpresaModal
        isOpen={isBanCompanyOpen}
        onOpenChange={setIsBanCompanyOpen}
        companyId={companyData.id}
        onBanApplied={handleBanApplied}
      />

      <EditarAssinaturaModal
        isOpen={isEditSubscriptionOpen}
        onOpenChange={setIsEditSubscriptionOpen}
        company={companyData}
        onSubscriptionUpdated={handleSubscriptionUpdated}
      />

      <AdicionarAssinaturaModal
        isOpen={isAddSubscriptionOpen}
        onOpenChange={setIsAddSubscriptionOpen}
        company={companyData}
        onSubscriptionAdded={handleSubscriptionUpdated}
      />

      <ResetarSenhaModal
        isOpen={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        email={companyData.email}
        companyId={companyData.id}
      />

      <ViewVacancyModal
        isOpen={isViewVacancyOpen}
        onOpenChange={handleViewVacancyDialogChange}
        vacancy={viewVacancy}
        company={companyData}
        onEditVacancy={(vacancy) => {
          setEditVacancy(vacancy);
          setIsEditVacancyOpen(true);
        }}
      />

      <EditVacancyModal
        isOpen={isEditVacancyOpen}
        onOpenChange={handleEditVacancyDialogChange}
        vacancy={editVacancy}
      />

      <DesbloquearEmpresaModal
        isOpen={isUnbanCompanyOpen}
        onOpenChange={setIsUnbanCompanyOpen}
        company={companyData}
        onUnbanApplied={handleUnbanApplied}
      />
    </div>
  );
}
