"use client";

import { useCallback, useEffect, useState } from "react";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import type {
  AdminCompanyDetail,
  AdminCompanyBanInfo,
  AdminCompanyVacancyListItem,
  AdminCompanyPlanSummary,
  AdminCompanyPaymentInfo,
} from "@/api/empresas/admin/types";
import {
  EditarEmpresaModal,
  BanirEmpresaModal,
  EditarAssinaturaModal,
  ResetarSenhaModal,
  ViewVacancyModal,
  EditVacancyModal,
} from "./modals";
import type { CompanyDetailsViewProps } from "./types";
import { AboutTab } from "./tabs/AboutTab";
import { VacancyTab } from "./tabs/VacancyTab";
import { PlanTab } from "./tabs/PlanTab";
import { HeaderInfo } from "./components/HeaderInfo";

export function CompanyDetailsView({
  company,
  payments = [],
  vacancies = [],
}: CompanyDetailsViewProps) {
  const [companyData, setCompanyData] = useState(company);

  useEffect(() => {
    setCompanyData(company);
  }, [company]);

  const plan = companyData.plano;
  const payment = companyData.pagamento;

  const publishedVacancies =
    plan?.vagasPublicadas ??
    companyData.vagas?.publicadas ??
    companyData.vagasPublicadas ??
    0;

  const totalVacancies =
    plan?.quantidadeVagas ??
    companyData.vagas?.limitePlano ??
    companyData.limiteVagasPlano ??
    0;

  const isCompanyActive = companyData.status === "ATIVO" || companyData.ativa;

  const [viewVacancy, setViewVacancy] =
    useState<AdminCompanyVacancyListItem | null>(null);
  const [isViewVacancyOpen, setIsViewVacancyOpen] = useState(false);
  const [editVacancy, setEditVacancy] =
    useState<AdminCompanyVacancyListItem | null>(null);
  const [isEditVacancyOpen, setIsEditVacancyOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isBanCompanyOpen, setIsBanCompanyOpen] = useState(false);
  const [isEditSubscriptionOpen, setIsEditSubscriptionOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const handleCompanyUpdated = useCallback(
    (updates: Partial<AdminCompanyDetail>) => {
      setCompanyData((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  const handleBanApplied = useCallback((ban: AdminCompanyBanInfo) => {
    setCompanyData((prev) => ({
      ...prev,
      banimentoAtivo: ban,
      banida: true,
      status: "INATIVO",
      ativa: false,
    }));
  }, []);

  const handleSubscriptionUpdated = useCallback(
    (plan: AdminCompanyPlanSummary, payment: AdminCompanyPaymentInfo) => {
      setCompanyData((prev) => ({
        ...prev,
        plano: plan,
        pagamento: payment,
      }));
    },
    []
  );

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

  const aboutTabContent = <AboutTab company={companyData} />;

  const vacancyTabContent = (
    <VacancyTab
      vacancies={vacancies}
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
      payments={payments}
    />
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
      badge: vacancies.length ? <span>{vacancies.length}</span> : null,
    },
  ];

  return (
    <div className="space-y-8">
      <HeaderInfo
        company={companyData}
        onEditCompany={() => setIsEditCompanyOpen(true)}
        onBanCompany={() => setIsBanCompanyOpen(true)}
        onEditSubscription={() => setIsEditSubscriptionOpen(true)}
        onResetPassword={() => setIsResetPasswordOpen(true)}
      />

      <HorizontalTabs items={tabs} defaultValue="sobre" />

      <EditarEmpresaModal
        isOpen={isEditCompanyOpen}
        onOpenChange={setIsEditCompanyOpen}
        company={companyData}
        onCompanyUpdated={handleCompanyUpdated}
      />

      <BanirEmpresaModal
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

      <ResetarSenhaModal
        isOpen={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        email={companyData.email}
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
    </div>
  );
}
