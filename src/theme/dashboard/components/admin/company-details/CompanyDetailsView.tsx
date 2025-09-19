"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HorizontalTabs, EmptyState } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  AdminCompanyDetail,
  AdminCompanyPaymentLog,
  AdminCompanyBanInfo,
  AdminCompanyVacancyListItem,
} from "@/api/empresas/admin/types";
import {
  ChevronLeft,
  Wallet2,
  Ban,
  Phone,
  Mail,
  Link2,
  Building2,
  Instagram,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VacancyList, VacancyTable } from "./components";

interface CompanyDetailsViewProps {
  company: AdminCompanyDetail;
  payments?: AdminCompanyPaymentLog[];
  bans?: AdminCompanyBanInfo[];
  vacancies?: AdminCompanyVacancyListItem[];
}

interface InfoItem {
  label: string;
  value: ReactNode;
}

interface InfoGroupProps {
  title: string;
  items: InfoItem[];
  columns?: 1 | 2 | 3 | 4;
}

interface HistoryEvent {
  id: string;
  type: "payment" | "ban";
  title: string;
  description?: string;
  status?: string;
  meta?: string;
  date?: string | null;
}

function InfoGroup({ title, items, columns = 2 }: InfoGroupProps) {
  const columnsClass: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <dl
        className={cn(
          "mt-4 grid gap-4 text-sm text-slate-700",
          columnsClass[columns] ?? "md:grid-cols-2"
        )}
      >
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {item.label}
            </dt>
            <dd className="text-sm font-medium text-slate-900">
              {item.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value?: string | null): string {
  if (!value) return "—";
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsed);
}

function formatCnpj(value?: string | null): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatPlanType(type?: string | null): string {
  if (!type) return "—";
  const normalized = type.toLowerCase();
  const map: Record<string, string> = {
    parceiro: "Parceiro",
    "7_dias": "7 dias",
    "15_dias": "15 dias",
    "30_dias": "30 dias",
    "60_dias": "60 dias",
    "90_dias": "90 dias",
    "120_dias": "120 dias",
    assinatura_mensal: "Assinatura",
  };
  if (map[normalized]) {
    return map[normalized];
  }
  return normalized
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const paymentStatusBadgeBaseClasses =
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-primary/90 text-[10px] uppercase tracking-wide";

function formatPaymentStatus(status?: string | null): string {
  if (!status) return "—";
  const humanized: Record<string, string> = {
    APROVADO: "Pago",
    PAGO: "Pago",
    PENDENTE: "Pendente",
    EM_ANALISE: "Em análise",
    EM_PROCESSAMENTO: "Em processamento",
    PROCESSANDO: "Em processamento",
    CANCELADO: "Cancelado",
    RECUSADO: "Recusado",
    ESTORNADO: "Estornado",
  };
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  return humanized[normalized] ?? status;
}

function getPaymentStatusBadgeClasses(status?: string | null): string {
  if (!status) return "border-slate-200 bg-slate-100 text-slate-600";
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  switch (normalized) {
    case "APROVADO":
    case "PAGO":
      return "bg-green-100 text-green-800 border-green-200";
    case "PENDENTE":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "EM_PROCESSAMENTO":
    case "PROCESSANDO":
    case "EM_ANALISE":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "CANCELADO":
    case "RECUSADO":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "ESTORNADO":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function formatVacancyStatus(status?: string | null): string {
  if (!status) return "—";
  const normalized = status.toUpperCase();
  const readable: Record<string, string> = {
    PUBLICADO: "Publicado",
    EM_ANALISE: "Em análise",
    RASCUNHO: "Rascunho",
    EXPIRADO: "Expirado",
  };
  return readable[normalized] ?? status;
}

function getVacancyStatusClasses(status?: string | null): string {
  const normalized = status?.toUpperCase();
  switch (normalized) {
    case "PUBLICADO":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "EM_ANALISE":
      return "border-sky-200 bg-sky-100 text-sky-700";
    case "RASCUNHO":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "EXPIRADO":
      return "border-rose-200 bg-rose-100 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function formatRelativeTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = date.getTime() - Date.now();
  const absDiff = Math.abs(diff);

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day", ms: 1000 * 60 * 60 * 24 },
    { unit: "hour", ms: 1000 * 60 * 60 },
    { unit: "minute", ms: 1000 * 60 },
    { unit: "second", ms: 1000 },
  ];

  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  for (const { unit, ms } of units) {
    if (absDiff >= ms || unit === "second") {
      const valueInUnit = diff / ms;
      const rounded = Math.round(valueInUnit);
      if (rounded === 0 && unit === "second") {
        return "agora";
      }
      return rtf.format(rounded, unit);
    }
  }

  return "";
}

function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatBoolean(
  value?: boolean | null,
  affirmative = "Sim",
  negative = "Não"
) {
  if (value == null) return "—";
  return value ? affirmative : negative;
}

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

function HistoryTimeline({ events }: { events: HistoryEvent[] }) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-sm text-gray-500">
        Ainda não há histórico registrado para esta empresa.
      </div>
    );
  }

  const iconMap: Record<HistoryEvent["type"], ReactNode> = {
    payment: <Wallet2 className="h-4 w-4" />,
    ban: <Ban className="h-4 w-4" />,
  };

  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6">
      {events.map((event, index) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-[22px] flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
            {iconMap[event.type]}
          </span>
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">
                  {event.title}
                </p>
                {event.description && (
                  <p className="text-sm text-slate-600">{event.description}</p>
                )}
                {event.meta && (
                  <p className="text-xs text-slate-500">{event.meta}</p>
                )}
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {formatDateTime(event.date)}
              </span>
            </div>
            {event.type === "payment" && event.status && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <span>Status</span>
                <span className="text-slate-900">
                  {formatPaymentStatus(event.status)}
                </span>
              </div>
            )}
          </div>
          {index !== events.length - 1 && (
            <span
              className="absolute -left-[13px] top-10 h-full w-[1px] bg-slate-200"
              aria-hidden
            />
          )}
        </li>
      ))}
    </ol>
  );
}

function VacanciesTable({
  vacancies,
}: {
  vacancies: AdminCompanyVacancyListItem[];
}) {
  if (!vacancies.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-sm text-slate-500">
        Nenhuma vaga encontrada para esta empresa.
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const normalized = status.toUpperCase();
    const palette: Record<string, string> = {
      PUBLICADO: "bg-emerald-100 text-emerald-700",
      EM_ANALISE: "bg-amber-100 text-amber-700",
      RASCUNHO: "bg-slate-200 text-slate-700",
      EXPIRADO: "bg-rose-100 text-rose-700",
    };
    const cls = palette[normalized] ?? "bg-blue-100 text-blue-700";
    return (
      <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", cls)}>
        {status}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 shadow-sm">
      <div className="max-h-[380px] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Criada em</th>
              <th className="px-6 py-3">Atualizada em</th>
              <th className="px-6 py-3">Inscrições até</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vacancies.map((vacancy) => (
              <tr key={vacancy.id} className="bg-white">
                <td className="px-6 py-3 font-medium text-slate-900">
                  {vacancy.id}
                </td>
                <td className="px-6 py-3">{statusBadge(vacancy.status)}</td>
                <td className="px-6 py-3 text-slate-600">
                  {formatDate(vacancy.inseridaEm)}
                </td>
                <td className="px-6 py-3 text-slate-600">
                  {formatDate(vacancy.atualizadoEm)}
                </td>
                <td className="px-6 py-3 text-slate-600">
                  {formatDate(vacancy.inscricoesAte)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  href?: string;
}) {
  const content = (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="text-sm font-medium text-slate-900">{value ?? "—"}</div>
    </div>
  );

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        {icon}
      </span>
      {href ? (
        <Link
          href={href}
          className="group flex-1 text-slate-900 hover:text-primary"
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {content}
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Abrir
          </span>
        </Link>
      ) : (
        <div className="flex-1">{content}</div>
      )}
    </div>
  );
}

export function CompanyDetailsView({
  company,
  payments = [],
  bans = [],
  vacancies = [],
}: CompanyDetailsViewProps) {
  const plan = company.plano;
  const payment = company.pagamento;
  const latestPayment = payments[0];

  const publishedVacancies =
    plan?.vagasPublicadas ??
    company.vagas?.publicadas ??
    company.vagasPublicadas ??
    0;

  const totalVacancies =
    plan?.quantidadeVagas ??
    company.vagas?.limitePlano ??
    company.limiteVagasPlano ??
    0;

  const isCompanyActive = company.status === "ATIVO" || company.ativa;

  const [viewVacancy, setViewVacancy] =
    useState<AdminCompanyVacancyListItem | null>(null);
  const [isViewVacancyOpen, setIsViewVacancyOpen] = useState(false);
  const [editVacancy, setEditVacancy] =
    useState<AdminCompanyVacancyListItem | null>(null);
  const [isEditVacancyOpen, setIsEditVacancyOpen] = useState(false);

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

  if (company.parceira) {
    headerBadges.push(
      <Badge
        key="parceira"
        className="inline-flex items-center gap-1 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700"
      >
        Parceira
      </Badge>
    );
  }

  if (company.banimentoAtivo) {
    headerBadges.push(
      <Badge
        key="banida"
        className="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
      >
        Banida
      </Badge>
    );
  }

  const historyEvents: HistoryEvent[] = [
    ...payments.map((log) => ({
      id: `payment-${log.id}`,
      type: "payment" as const,
      title: log.plano?.nome ?? log.tipo ?? "Transação",
      description: log.mensagem ?? undefined,
      status: log.status,
      meta: log.tipo ? `Tipo: ${log.tipo}` : undefined,
      date: log.criadoEm,
    })),
    ...bans.map((ban) => ({
      id: `ban-${ban.id}`,
      type: "ban" as const,
      title: "Banimento aplicado",
      description: ban.motivo,
      meta: `Período: ${formatDate(ban.inicio)} — ${formatDate(ban.fim)}`,
      date: ban.criadoEm ?? ban.inicio,
    })),
  ].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });

  const aboutDescription = company.descricao?.trim();
  const aboutSidebar = [
    { label: "Criada em", value: formatDate(company.criadoEm) },
    { label: "Telefone", value: company.telefone ?? "—" },
    { label: "E-mail", value: company.email ?? "—" },
    { label: "Instagram", value: formatSocialLink(company.instagram) },
    { label: "LinkedIn", value: formatSocialLink(company.linkedin) },
    {
      label: "Localização",
      value:
        company.cidade || company.estado
          ? `${company.cidade ?? ""}${
              company.cidade && company.estado ? ", " : ""
            }${company.estado ?? ""}`
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
      <section className="rounded-3xl border border-slate-200/80 bg-white p-2 shadow-sm">
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

  const viewVacancyTitle = viewVacancy
    ? viewVacancy.titulo ??
      viewVacancy.nome ??
      `Vaga ${viewVacancy.id.slice(0, 8)}`
    : "";
  const viewVacancyCode = viewVacancy
    ? viewVacancy.codigo ?? viewVacancy.id
    : "";
  const viewVacancyCompany = viewVacancy?.empresa;

  const vacancyDetailFields = viewVacancy
    ? [
        {
          label: "Código da vaga",
          value: viewVacancy.codigo ?? viewVacancy.id,
        },
        {
          label: "Status",
          value: formatVacancyStatus(viewVacancy.status),
        },
        {
          label: "Modalidade",
          value: viewVacancy.modalidade ?? "—",
        },
        {
          label: "Regime",
          value: viewVacancy.regimeDeTrabalho ?? "—",
        },
        {
          label: "Acesso",
          value: viewVacancy.modoAnonimo ? "Anônima" : "Pública",
        },
        {
          label: "Para PCD",
          value: viewVacancy.paraPcd ? "Sim" : "Não",
        },
        {
          label: "Criada em",
          value: formatDate(viewVacancy.inseridaEm),
        },
        {
          label: "Atualizada em",
          value: formatDate(viewVacancy.atualizadoEm),
        },
        {
          label: "Inscrições até",
          value: formatDate(viewVacancy.inscricoesAte),
        },
        {
          label: "Carga horária",
          value: viewVacancy.cargaHoraria ?? "—",
        },
        {
          label: "Empresa",
          value:
            viewVacancyCompany?.nome ??
            company.nome ??
            viewVacancy.nomeExibicao ??
            "—",
        },
        {
          label: "Código do usuário",
          value: viewVacancyCompany?.codUsuario ?? "—",
        },
      ]
    : [];

  const vacancyDetailSections = viewVacancy
    ? [
        {
          label: "Descrição",
          content: viewVacancy.descricao ?? viewVacancy.descricaoExibicao ?? "",
        },
        {
          label: "Atividades",
          content: viewVacancy.atividades ?? "",
        },
        {
          label: "Requisitos",
          content: viewVacancy.requisitos ?? "",
        },
        {
          label: "Benefícios",
          content: viewVacancy.beneficios ?? "",
        },
        {
          label: "Observações",
          content: viewVacancy.observacoes ?? "",
        },
      ].filter(
        (section) => section.content && section.content.trim().length > 0
      )
    : [];

  const editVacancyTitle = editVacancy
    ? editVacancy.titulo ?? editVacancy.nome ?? ""
    : "";
  const editVacancyCode = editVacancy
    ? editVacancy.codigo ?? editVacancy.id
    : "";
  const editVacancyInscricoes = toDateInputValue(editVacancy?.inscricoesAte);

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
  const billingModelLabel = payment?.modelo ?? plan?.modeloPagamento ?? null;
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

  const formattedCnpj = formatCnpj(company.cnpj);
  const cnpjLabel =
    formattedCnpj !== "—" ? formattedCnpj : "CNPJ não informado";
  const editHref = `/dashboard/empresas/${company.id}/editar`;

  const statusColor = company.banimentoAtivo
    ? "bg-amber-500"
    : isCompanyActive
    ? "bg-emerald-500"
    : "bg-rose-500";
  const statusLabel = company.banimentoAtivo
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
                  src={company.avatarUrl || undefined}
                  alt={company.nome}
                />
                <AvatarFallback className="bg-primary/10 text-primary/80 text-base font-semibold">
                  {getInitials(company.nome)}
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
              <h3 className="font-semibold !mb-0">{company.nome}</h3>
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
            <Button
              asChild
              className="rounded-full px-6 py-2 text-sm font-semibold bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90"
            >
              <Link href={editHref}>Editar</Link>
            </Button>
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

      <Dialog
        open={isViewVacancyOpen}
        onOpenChange={handleViewVacancyDialogChange}
      >
        <DialogContent className="sm:max-w-2xl space-y-0">
          {viewVacancy ? (
            <>
              <DialogHeader className="space-y-2">
                <DialogTitle>{viewVacancyTitle}</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {`Código: ${viewVacancyCode}`}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6 py-2">
                  {vacancyDetailFields.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {vacancyDetailFields.map((field) => (
                        <div
                          key={field.label}
                          className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {field.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {vacancyDetailSections.length > 0 && (
                    <div className="space-y-4">
                      {vacancyDetailSections.map((section) => (
                        <div
                          key={section.label}
                          className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
                        >
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            {section.label}
                          </h4>
                          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsViewVacancyOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsViewVacancyOpen(false);
                    setEditVacancy(viewVacancy);
                    setIsEditVacancyOpen(true);
                  }}
                >
                  Editar vaga
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 text-center text-sm text-slate-500">
              Nenhuma vaga selecionada.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditVacancyOpen}
        onOpenChange={handleEditVacancyDialogChange}
      >
        <DialogContent
          key={editVacancy?.id ?? "nova"}
          className="sm:max-w-2xl space-y-0"
        >
          {editVacancy ? (
            <>
              <DialogHeader className="space-y-1">
                <DialogTitle>Editar vaga</DialogTitle>
                <DialogDescription>
                  {editVacancyCode ? `Código: ${editVacancyCode}` : undefined}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[65vh] pr-4">
                <form
                  className="space-y-6 py-2"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-title-${editVacancy.id}`}>
                        Nome da vaga
                      </Label>
                      <Input
                        id={`vacancy-title-${editVacancy.id}`}
                        defaultValue={editVacancyTitle}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-code-${editVacancy.id}`}>
                        Código
                      </Label>
                      <Input
                        id={`vacancy-code-${editVacancy.id}`}
                        defaultValue={editVacancyCode}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-modalidade-${editVacancy.id}`}>
                        Modalidade
                      </Label>
                      <Input
                        id={`vacancy-modalidade-${editVacancy.id}`}
                        defaultValue={editVacancy.modalidade ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-regime-${editVacancy.id}`}>
                        Regime de trabalho
                      </Label>
                      <Input
                        id={`vacancy-regime-${editVacancy.id}`}
                        defaultValue={editVacancy.regimeDeTrabalho ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-carga-${editVacancy.id}`}>
                        Carga horária
                      </Label>
                      <Input
                        id={`vacancy-carga-${editVacancy.id}`}
                        defaultValue={editVacancy.cargaHoraria ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-inscricoes-${editVacancy.id}`}>
                        Inscrições até
                      </Label>
                      <Input
                        id={`vacancy-inscricoes-${editVacancy.id}`}
                        type="date"
                        defaultValue={editVacancyInscricoes}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`vacancy-descricao-${editVacancy.id}`}>
                      Descrição
                    </Label>
                    <Textarea
                      id={`vacancy-descricao-${editVacancy.id}`}
                      className="min-h-[120px] resize-y"
                      defaultValue={
                        editVacancy.descricao ??
                        editVacancy.descricaoExibicao ??
                        ""
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-atividades-${editVacancy.id}`}>
                        Atividades
                      </Label>
                      <Textarea
                        id={`vacancy-atividades-${editVacancy.id}`}
                        className="min-h-[100px] resize-y"
                        defaultValue={editVacancy.atividades ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-requisitos-${editVacancy.id}`}>
                        Requisitos
                      </Label>
                      <Textarea
                        id={`vacancy-requisitos-${editVacancy.id}`}
                        className="min-h-[100px] resize-y"
                        defaultValue={editVacancy.requisitos ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-beneficios-${editVacancy.id}`}>
                        Benefícios
                      </Label>
                      <Textarea
                        id={`vacancy-beneficios-${editVacancy.id}`}
                        className="min-h-[100px] resize-y"
                        defaultValue={editVacancy.beneficios ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-observacoes-${editVacancy.id}`}>
                        Observações
                      </Label>
                      <Textarea
                        id={`vacancy-observacoes-${editVacancy.id}`}
                        className="min-h-[100px] resize-y"
                        defaultValue={editVacancy.observacoes ?? ""}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-empresa-${editVacancy.id}`}>
                        Empresa (exibição)
                      </Label>
                      <Input
                        id={`vacancy-empresa-${editVacancy.id}`}
                        defaultValue={
                          editVacancy.nomeExibicao ??
                          editVacancy.empresa?.nome ??
                          ""
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`vacancy-modo-${editVacancy.id}`}>
                        Acesso (pública/anônima)
                      </Label>
                      <Input
                        id={`vacancy-modo-${editVacancy.id}`}
                        defaultValue={
                          editVacancy.modoAnonimo ? "Anônima" : "Pública"
                        }
                      />
                    </div>
                  </div>
                </form>
              </ScrollArea>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditVacancyOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button">Salvar alterações</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 text-center text-sm text-slate-500">
              Nenhuma vaga selecionada.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
