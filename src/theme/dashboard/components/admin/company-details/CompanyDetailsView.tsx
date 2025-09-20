"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HorizontalTabs, EmptyState } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  AdminCompanyDetail,
  AdminCompanyPaymentLog,
  AdminCompanyBanInfo,
  AdminCompanyVacancyListItem,
  AdminCompanyPlanSummary,
  AdminCompanyPaymentInfo,
} from "@/api/empresas/admin/types";
import {
  ChevronLeft,
  Ban,
  CreditCard,
  MoreVertical,
  UserCog,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VacancyTable } from "./components";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatCnpj,
  formatPlanType,
  formatPaymentStatus,
  getPaymentStatusBadgeClasses,
} from "./utils";
import {
  EditarEmpresaModal,
  BanirEmpresaModal,
  EditarAssinaturaModal,
  ResetarSenhaModal,
} from "./modal-acoes";
import { ViewVacancyModal, EditVacancyModal } from "./modal-vagas";

interface CompanyDetailsViewProps {
  company: AdminCompanyDetail;
  payments?: AdminCompanyPaymentLog[];
  bans?: AdminCompanyBanInfo[];
  vacancies?: AdminCompanyVacancyListItem[];
}

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

const paymentStatusBadgeBaseClasses =
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-primary/90 text-[10px] uppercase tracking-wide";

function formatSocialLink(value?: string | null) {
  if (!value) return "—";
  const href = value.startsWith("http")
    ? value
    : `https://${value.replace(/^@/, "")}`;
  return (
    <Link
      href={href}
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {value}
    </Link>
  );
}

function VacancyUsageCard({
  published,
  total,
}: {
  published: number;
  total: number;
}) {
  const percent =
    total > 0 ? Math.min(100, Math.round((published / total) * 100)) : 0;
  const remaining = Math.max(total - published, 0);
  const tone = percent >= 80 ? "success" : percent >= 40 ? "warning" : "danger";
  const palette: Record<string, { bar: string; chip: string }> = {
    success: {
      bar: "from-emerald-400 to-emerald-500",
      chip: "bg-emerald-100 text-emerald-700",
    },
    warning: {
      bar: "from-amber-300 to-amber-500",
      chip: "bg-amber-100 text-amber-700",
    },
    danger: {
      bar: "from-rose-300 to-rose-500",
      chip: "bg-rose-100 text-rose-600",
    },
  };
  const colors = palette[tone];

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
      <h3>Uso de vagas</h3>
      <div className="mt-4 rounded-2xl border border-gray-200/60 bg-white p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            <span className="font-semibold text-gray-600">Publicadas:</span>{" "}
            {published}
          </span>
          <span>
            <span className="font-semibold text-gray-600">Restantes:</span>{" "}
            {remaining}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/90">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-300",
                colors.bar
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              colors.chip
            )}
          >
            {percent}%
          </span>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Limite do plano: {total > 0 ? total : "—"}
        </div>
      </div>
    </div>
  );
}

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

  const headerBadges: ReactNode[] = [];

  if (companyData.parceira) {
    headerBadges.push(
      <Badge
        key="parceira"
        className="inline-flex items-center gap-1 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700"
      >
        Parceira
      </Badge>
    );
  }

  if (companyData.banimentoAtivo) {
    headerBadges.push(
      <Badge
        key="banida"
        className="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
      >
        Banida
      </Badge>
    );
  }

  const aboutDescription = companyData.descricao?.trim();
  const aboutSidebar = [
    { label: "Código da empresa", value: companyData.codUsuario ?? "—" },
    { label: "Criada em", value: formatDate(companyData.criadoEm) },
    { label: "Telefone", value: companyData.telefone ?? "—" },
    { label: "E-mail", value: companyData.email ?? "—" },
    { label: "Instagram", value: formatSocialLink(companyData.instagram) },
    { label: "LinkedIn", value: formatSocialLink(companyData.linkedin) },
    {
      label: "Localização",
      value:
        companyData.cidade || companyData.estado
          ? `${companyData.cidade ?? ""}${
              companyData.cidade && companyData.estado ? ", " : ""
            }${companyData.estado ?? ""}`
          : "—",
    },
  ];

  const aboutTabContent = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3>Sobre a empresa</h3>
        {aboutDescription ? (
          <p className="mt-4 whitespace-pre-line !leading-relaxed text-muted-foreground">
            {aboutDescription}
          </p>
        ) : (
          <EmptyState
            illustration="companyDetails"
            illustrationAlt="Ilustração de descrição vazia da empresa"
            title="Sem informações sobre a empresa"
            description="Ainda não registramos um texto descritivo para esta empresa. Atualize os dados para contar a história dela por aqui."
            maxContentWidth="md"
          />
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h3>Informações gerais</h3>
          <dl className="mt-4 space-y-4 text-sm">
            {aboutSidebar.map((info) => (
              <div key={info.label} className="flex flex-col">
                <dt className="text-xs font-medium uppercase text-gray-600">
                  {info.label}
                </dt>
                <dd className="text-xs text-gray-500">{info.value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );

  const vacancyTabContent = (() => {
    const relevantVacancies = (vacancies ?? []).filter((vacancy) => {
      const status = vacancy.status?.toUpperCase();
      return status === "PUBLICADO" || status === "EM_ANALISE";
    });

    const statusCounts = relevantVacancies.reduce(
      (acc, vacancy) => {
        const status = vacancy.status?.toUpperCase();
        if (status === "PUBLICADO") acc.publicadas += 1;
        if (status === "EM_ANALISE") acc.emAnalise += 1;
        return acc;
      },
      { publicadas: 0, emAnalise: 0 }
    );

    const vacancyMainSection = relevantVacancies.length ? (
      <section className="rounded-3xl border border-slate-200/80 bg-white p-2">
        <VacancyTable
          vacancies={relevantVacancies}
          onView={(vacancy) => {
            setViewVacancy(vacancy);
            setIsViewVacancyOpen(true);
          }}
          onEdit={(vacancy) => {
            setEditVacancy(vacancy);
            setIsEditVacancyOpen(true);
          }}
          getCandidateAvatars={(v) => {
            const urls: string[] = [];
            if (v.logoExibicao) urls.push(v.logoExibicao);
            if (v.empresa?.avatarUrl) urls.push(v.empresa.avatarUrl);
            return urls;
          }}
        />
      </section>
    ) : (
      <EmptyState
        illustration="companyDetails"
        illustrationAlt="Ilustração de vagas"
        title="Nenhuma vaga publicada"
        description="Ainda não encontramos vagas publicadas ou em análise para esta empresa. Assim que uma vaga entrar na fila, ela aparece aqui."
        maxContentWidth="sm"
        className="rounded-2xl border border-gray-200/60 bg-white p-6"
      />
    );

    const vacancySidebar = (
      <aside className="space-y-4">
        <VacancyUsageCard
          published={publishedVacancies}
          total={totalVacancies}
        />

        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h3>Resumo por status</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-3">
              <span className="font-medium text-gray-700">Em análise</span>
              <span className="text-green-900">{statusCounts.emAnalise}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-3">
              <span className="font-medium text-gray-700">Publicadas</span>
              <span className="text-gray-500">{statusCounts.publicadas}</span>
            </div>
          </div>
        </div>
      </aside>
    );

    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
        {vacancyMainSection}
        {vacancySidebar}
      </div>
    );
  })();

  const planExists = Boolean(
    plan &&
      (plan.nome ||
        plan.valor ||
        plan.tipo ||
        plan.modeloPagamento ||
        plan.metodoPagamento ||
        plan.inicio ||
        plan.fim)
  );

  const planTypeLabel = plan?.tipo ? formatPlanType(plan.tipo) : null;
  const nextChargeLabel = formatDate(plan?.fim);
  const paymentMethodLabel = payment?.metodo ?? plan?.metodoPagamento ?? null;
  const planStartLabel = formatDate(plan?.inicio);
  const planCardTypeLabel =
    planTypeLabel && planTypeLabel !== "—" ? planTypeLabel : "Assinatura";
  const planCardStatusLabel = isCompanyActive ? "Ativo" : "Inativo";
  const planCardStatusClasses = isCompanyActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";
  const planCardDetails: { label: string; value: string }[] = [
    { label: "Início do plano", value: planStartLabel },
    { label: "Próxima cobrança", value: nextChargeLabel },
    {
      label: "Dias restantes",
      value: plan?.diasRestantes != null ? `${plan.diasRestantes} dias` : "—",
    },
    {
      label: "Método de pagamento",
      value: paymentMethodLabel ?? "—",
    },
  ];

  const recentPayments = payments.slice(0, 3);

  const planMainSection = planExists ? (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
        <div className="absolute inset-0" />
        <div className="relative flex justify-center p-6 md:p-8">
          <div className="relative flex w-full flex-col overflow-hidden text-slate-900">
            <div className="pointer-events-none absolute inset-y-4 right-4 w-32 rounded-3xl" />
            <div className="relative flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="!text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 !mb-1">
                    {planCardTypeLabel}
                  </p>
                  <div className="space-y-2">
                    <h4 className="!mb-0">
                      {plan?.nome ?? "Plano não informado"}
                    </h4>
                    <h4 className="!text-[1.75rem] !font-bold !leading-none !text-green-900">
                      {plan?.valor ? formatCurrency(plan.valor) : "R$ —"}
                    </h4>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
                      planCardStatusClasses
                    )}
                  >
                    {planCardStatusLabel}
                  </span>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-white">
                  <CreditCard className="h-5 w-5" />
                </span>
              </div>

              <dl className="space-y-2 text-sm">
                {planCardDetails.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-3"
                  >
                    <dt className="text-xs font-bold uppercase tracking-wide text-gray-600">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-gray-600">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  ) : (
    <EmptyState
      illustration="companyDetails"
      illustrationAlt="Ilustração de informações de assinatura"
      title="Plano não informado"
      description="Ainda não identificamos um plano ativo para esta empresa. Assim que houver uma assinatura, os detalhes aparecerão aqui."
      maxContentWidth="sm"
      className="rounded-2xl border border-gray-200/60 bg-white p-6"
    />
  );

  const planSidebar = (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3>Histórico recente</h3>
        {recentPayments.length > 0 ? (
          <ol className="mt-4 space-y-3">
            {recentPayments.map((log) => (
              <li
                key={log.id}
                className="rounded-2xl border border-gray-200/70 bg-gray-50/80 p-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">
                    {formatDateTime(log.criadoEm)}
                  </span>
                  <span
                    className={cn(
                      paymentStatusBadgeBaseClasses,
                      getPaymentStatusBadgeClasses(log.status)
                    )}
                  >
                    {formatPaymentStatus(log.status)}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  {log.plano?.nome && (
                    <div>
                      Plano:{" "}
                      <span className="font-medium text-gray-600">
                        {log.plano.nome}
                      </span>
                    </div>
                  )}
                  {log.tipo && (
                    <div>
                      Método:{" "}
                      <span className="font-medium text-gray-600">
                        {log.tipo}
                      </span>
                    </div>
                  )}
                  {log.mensagem && (
                    <div>
                      Detalhe:{" "}
                      <span className="font-medium text-gray-600">
                        {log.mensagem}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-gray-600">
            Nenhum pagamento registrado.
          </p>
        )}
      </div>
    </aside>
  );

  const planTabContent = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      {planMainSection}
      {planSidebar}
    </div>
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

  const formattedCnpj = formatCnpj(companyData.cnpj);
  const cnpjLabel =
    formattedCnpj !== "—" ? formattedCnpj : "CNPJ não informado";
  const statusColor = companyData.banimentoAtivo
    ? "bg-amber-500"
    : isCompanyActive
    ? "bg-emerald-500"
    : "bg-rose-500";
  const statusLabel = companyData.banimentoAtivo
    ? "Empresa banida"
    : isCompanyActive
    ? "Empresa ativa"
    : "Empresa inativa";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-white">
        <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 shrink-0 text-base">
                <AvatarImage
                  src={companyData.avatarUrl || undefined}
                  alt={companyData.nome}
                />
                <AvatarFallback className="bg-primary/10 text-primary/80 text-base font-semibold">
                  {getInitials(companyData.nome)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-1 right-1 inline-flex size-4 items-center justify-center rounded-full border-2 border-white",
                  statusColor
                )}
                aria-label={statusLabel}
              >
                <span className="sr-only">{statusLabel}</span>
              </span>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold !mb-0">{companyData.nome}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
                <span>CNPJ: {cnpjLabel}</span>
              </div>
              {headerBadges.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {headerBadges.map((badge) => badge)}
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-color)]/90">
                  Ações
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onSelect={() => setIsEditCompanyOpen(true)}
                  className="cursor-pointer"
                >
                  <UserCog className="h-4 w-4 text-gray-500" />
                  <span>Editar empresa</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setIsBanCompanyOpen(true)}
                  className="cursor-pointer"
                >
                  <Ban className="h-4 w-4 text-gray-500" />
                  <span>Banir empresa</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setIsEditSubscriptionOpen(true)}
                  className="cursor-pointer"
                >
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span>Editar assinatura</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setIsResetPasswordOpen(true)}
                  className="cursor-pointer"
                >
                  <KeyRound className="h-4 w-4 text-gray-500" />
                  <span>Resetar senha</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground  transition-all duration-200"
            >
              <Link
                href="/dashboard/empresas"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
