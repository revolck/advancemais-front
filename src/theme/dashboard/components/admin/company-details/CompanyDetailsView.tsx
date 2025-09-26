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
} from "@/api/empresas/admin/types";
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

  const publishedVacancies = companyData.vagas?.publicadas ?? 0;

  const totalVacancies =
    plan?.quantidadeVagas ?? companyData.vagas?.limitePlano ?? 0;

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
    (updates: Partial<AdminCompanyDetail>) => {
      setCompanyData((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  const handleBanApplied = useCallback((ban: AdminCompanyBanItem) => {
    setCompanyData((prev) => ({
      ...prev,
      banimentoAtivo: ban,
      banida: true,
      status: "INATIVO",
      ativa: false,
    }));
  }, []);

  const handleUnbanApplied = useCallback(() => {
    setCompanyData((prev) => ({
      ...prev,
      banimentoAtivo: null,
      banida: false,
      bloqueada: false,
      bloqueioAtivo: null,
      status: "ATIVO",
      ativa: true,
    }));
  }, []);

  const handleSubscriptionUpdated = useCallback(
    (plan: AdminCompanyPlano, payment: AdminCompanyPagamento) => {
      setCompanyData((prev) => ({
        ...prev,
        plano: plan,
        pagamento: payment,
      }));
    },
    []
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
        onSuccess={handleUnbanApplied}
      />
    </div>
  );
}
