"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { getRecrutadorEmpresaById } from "@/api/recrutador";
import type { RecrutadorEmpresaDetailData } from "@/api/recrutador";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarCustom, EmptyState, HorizontalTabs } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { normalizeCep } from "@/lib/cep";
import { cn } from "@/lib/utils";
import {
  formatEmailLink,
  formatPhoneLink,
} from "@/theme/dashboard/components/admin/company-details/utils/formatters";
import { formatDate } from "@/theme/dashboard/components/admin/company-details/utils";

interface RecruiterCompanyDetailsViewProps {
  companyId: string;
}

function formatCnpj(value?: string | null): string {
  if (!value) return "—";

  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return value;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function getStatusClasses(status?: string | null): string {
  switch (String(status || "").toUpperCase()) {
    case "ATIVO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "INATIVO":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "BLOQUEADO":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getStatusLabel(status?: string | null): string {
  switch (String(status || "").toUpperCase()) {
    case "ATIVO":
      return "Empresa ativa";
    case "INATIVO":
      return "Empresa inativa";
    case "BLOQUEADO":
      return "Empresa bloqueada";
    default:
      return "Status indisponível";
  }
}

function getStatusDotColor(status?: string | null): string {
  switch (String(status || "").toUpperCase()) {
    case "ATIVO":
      return "bg-emerald-500";
    case "INATIVO":
      return "bg-amber-500";
    case "BLOQUEADO":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

function getVacancyStatusClasses(status?: string | null): string {
  switch (String(status || "").toUpperCase()) {
    case "PUBLICADO":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "EM_ANALISE":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "DESPUBLICADA":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "PAUSADA":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "ENCERRADA":
      return "bg-slate-200 text-slate-700 border-slate-300";
    case "EXPIRADO":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getVacancyStatusLabel(status?: string | null): string {
  switch (String(status || "").toUpperCase()) {
    case "PUBLICADO":
      return "Publicado";
    case "EM_ANALISE":
      return "Em análise";
    case "DESPUBLICADA":
      return "Despublicada";
    case "PAUSADA":
      return "Pausada";
    case "ENCERRADA":
      return "Encerrada";
    case "EXPIRADO":
      return "Expirado";
    default:
      return status || "Sem status";
  }
}

function getEscopoResumo(data: RecrutadorEmpresaDetailData): string {
  return data.escopo.tipoAcesso === "EMPRESA"
    ? "Acesso amplo às vagas operáveis da empresa."
    : "Acesso limitado às vagas vinculadas ao recrutador.";
}

function getLocationLabel(data: RecrutadorEmpresaDetailData): string | null {
  const company = data.empresa;
  const street = company.logradouro?.trim();
  const city = company.cidade?.trim();
  const state = company.estado?.trim();
  const cep = company.cep?.trim();
  const cepDisplay = cep ? `CEP ${normalizeCep(cep)}` : null;
  const cityState = [city, state].filter(Boolean).join("/");
  const parts = [cepDisplay, cityState].filter(Boolean).join(" ");

  if (street && parts) return `${street}, ${parts}`;
  if (street) return street;
  if (parts) return parts;
  return null;
}

function RecruiterCompanyDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
        <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
        </section>
        <aside className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function AboutSidebar({ data }: { data: RecrutadorEmpresaDetailData }) {
  const company = data.empresa;

  const items: Array<{
    label: string;
    value: React.ReactNode | null;
    icon: LucideIcon;
  }> = [
    {
      label: "Código da empresa",
      value: company.codUsuario ?? "—",
      icon: Building2,
    },
    {
      label: "Criada em",
      value: formatDate(company.criadoEm),
      icon: CalendarDays,
    },
    {
      label: "Telefone",
      value: formatPhoneLink(company.telefone, { companyName: company.nome }),
      icon: Phone,
    },
    {
      label: "E-mail",
      value: formatEmailLink(company.email),
      icon: Mail,
    },
    {
      label: "Localização",
      value: getLocationLabel(data),
      icon: MapPin,
    },
    {
      label: "Escopo atual",
      value: getEscopoResumo(data),
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <dl className="mt-4 space-y-4 text-sm">
          {items
            .filter((item) => item.value !== null)
            .map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="flex flex-1 flex-col">
                  <dt className="text-xs font-medium uppercase text-gray-600">
                    {item.label}
                  </dt>
                  <dd className="text-xs text-gray-500">{item.value ?? "—"}</dd>
                </div>
              </div>
            ))}
        </dl>
      </div>
    </aside>
  );
}

function CompanyAboutSection({ data }: { data: RecrutadorEmpresaDetailData }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de descrição vazia da empresa"
          title="Descrição não adicionada."
          description="Até o momento, esta empresa não disponibilizou informações institucionais em seu perfil."
          maxContentWidth="md"
        />
      </section>

      <AboutSidebar data={data} />
    </div>
  );
}

function CompanyVacanciesSection({ data }: { data: RecrutadorEmpresaDetailData }) {
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const vacancyMainSection = data.vagas.length ? (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-2">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 bg-slate-50/60">
            <TableHead>Vaga</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.vagas.map((vaga) => {
            const isNavigating = navigatingId === vaga.id;

            return (
              <TableRow key={vaga.id} className="border-slate-100">
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{vaga.titulo}</span>
                    {vaga.codigo && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {vaga.codigo}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    className={cn(
                      "uppercase tracking-wide text-[10px]",
                      getVacancyStatusClasses(vaga.status)
                    )}
                  >
                    {getVacancyStatusLabel(vaga.status)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 w-12">
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={Boolean(navigatingId)}
                    className={cn(
                      "h-8 w-8 rounded-full cursor-pointer",
                      isNavigating
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-500 hover:bg-[var(--primary-color)] hover:text-white"
                    )}
                  >
                    <Link
                      href={`/dashboard/empresas/vagas/${encodeURIComponent(vaga.id)}`}
                      onClick={() => setNavigatingId(vaga.id)}
                      aria-label="Visualizar vaga"
                    >
                      {isNavigating ? (
                        <span className="flex items-center justify-center">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  ) : (
    <EmptyState
      illustration="companyDetails"
      illustrationAlt="Ilustração de vagas"
      title="Nenhuma vaga encontrada"
      description="Não encontramos vagas disponíveis dentro do escopo atual do recrutador."
      maxContentWidth="sm"
      className="rounded-2xl border border-gray-200/60 bg-white p-6"
    />
  );

  return vacancyMainSection;
}

export function RecruiterCompanyDetailsView({
  companyId,
}: RecruiterCompanyDetailsViewProps) {
  const { data, isLoading, error, refetch } = useQuery<
    RecrutadorEmpresaDetailData,
    Error
  >({
    queryKey: ["recrutador-empresa-detail", companyId],
    queryFn: async () => {
      const response = await getRecrutadorEmpresaById(companyId);
      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar a empresa.");
      }
      return response.data;
    },
    enabled: Boolean(companyId),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <RecruiterCompanyDetailsSkeleton />;
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <div className="flex items-center justify-between gap-3">
            <span>{error?.message || "Não foi possível carregar os dados da empresa."}</span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-medium text-[var(--primary-color)]"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const company = data.empresa;
  const companyName = company.nomeExibicao || company.nome;
  const cnpjLabel = formatCnpj(company.cnpj);
  const statusLabel = getStatusLabel(company.status);
  const statusDotColor = getStatusDotColor(company.status);

  const tabs = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "FileText" as const,
      content: <CompanyAboutSection data={data} />,
    },
    {
      value: "vagas",
      label: "Vagas",
      icon: "Briefcase" as const,
      badge: data.vagas.length ? <span>{data.vagas.length}</span> : null,
      content: <CompanyVacanciesSection data={data} />,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-white">
        <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <AvatarCustom
                name={companyName || "Empresa"}
                src={company.avatarUrl || undefined}
                size="xl"
                showStatus={false}
                className="text-base"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "absolute bottom-1 right-1 inline-flex size-4 items-center justify-center rounded-full border-2 border-white cursor-pointer",
                      statusDotColor
                    )}
                    aria-label={statusLabel}
                  >
                    <span className="sr-only">{statusLabel}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{statusLabel}</TooltipContent>
              </Tooltip>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold !mb-0">{companyName}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
                <span>CNPJ: {cnpjLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
            >
              <Link href="/dashboard/empresas" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <HorizontalTabs items={tabs} defaultValue="sobre" />
    </div>
  );
}
