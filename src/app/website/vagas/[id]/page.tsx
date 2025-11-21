import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { JobData } from "@/theme/website/components/career-opportunities/types";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  MapPin,
  DollarSign,
  Monitor,
  Briefcase,
  User,
  Award,
  Clock,
  ArrowLeft,
  Link2,
  CheckCircle2,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { CompanyLogo } from "@/theme/website/components/career-opportunities/components/CompanyLogo";
import { ShareJobButton } from "@/theme/website/components/career-opportunities/components/ShareJobButton";
import { env } from "@/lib/env";

const APPLY_FALLBACK =
  "mailto:talentos@advancemais.com?subject=Interesse%20em%20vaga";

type VagaApiResponse =
  | (Record<string, any> & { id: string; slug?: string; status?: string })
  | null;

function normalizeList(value: any): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeList(item))
      .filter((item) => typeof item === "string" && item.length > 0);
  }

  if (typeof value === "object") {
    return Object.values(value)
      .flatMap((item) => normalizeList(item))
      .filter((item) => typeof item === "string" && item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|•|·|-|;|,/)
      .map((item) => item.replace(/^[•·-\s]+/, "").trim())
      .filter(Boolean);
  }

  return [String(value)];
}

function mapVagaToJob(vaga: any): JobData {
  const empresaAnonima = Boolean(vaga?.modoAnonimo);
  const empresa = empresaAnonima
    ? "Oportunidade confidencial"
    : vaga?.empresa?.nome || "Empresa";
  const empresaLogo = empresaAnonima
    ? undefined
    : vaga?.empresa?.avatarUrl || undefined;
  const cidade = vaga?.localizacao?.cidade || vaga?.empresa?.cidade || "";
  const estado = vaga?.localizacao?.estado || vaga?.empresa?.estado || "";
  const localizacao = [cidade, estado].filter(Boolean).join(", ");
  const requisitosList = normalizeList(vaga?.requisitos);
  const beneficiosList = normalizeList(vaga?.beneficios);

  return {
    id: vaga?.id?.toString() || "",
    slug: vaga?.slug?.toString() || undefined,
    titulo: vaga?.titulo || "Vaga",
    empresa,
    empresaLogo,
    empresaAnonima,
    localizacao: localizacao || "Não informado",
    tipoContrato: vaga?.regimeDeTrabalho || "Não informado",
    modalidade: vaga?.modalidade || "Não informado",
    categoria: vaga?.CandidatosAreasInteresse?.categoria || "Geral",
    nivel: vaga?.senioridade || "Não informado",
    descricao: vaga?.descricao || "",
    dataPublicacao: vaga?.inseridaEm
      ? new Date(vaga.inseridaEm).toLocaleDateString("pt-BR")
      : "Não informado",
    inscricoesAte: vaga?.inscricoesAte
      ? new Date(vaga.inscricoesAte).toLocaleDateString("pt-BR")
      : undefined,
    pcd: Boolean(vaga?.paraPcd),
    destaque: Boolean(vaga?.destaque || vaga?.EmpresasVagasDestaque?.ativo),
    salario: vaga?.salarioConfidencial
      ? undefined
      : vaga?.salarioMin || vaga?.salarioMax
      ? {
          min: vaga?.salarioMin || undefined,
          max: vaga?.salarioMax || undefined,
          moeda: "BRL",
        }
      : undefined,
    beneficios: beneficiosList.length > 0 ? beneficiosList : undefined,
    requisitos: requisitosList.length > 0 ? requisitosList : undefined,
    vagasDisponiveis: vaga?.numeroVagas || undefined,
    urlCandidatura: vaga?.urlPublicaCandidatura || undefined,
    isActive: vaga?.status === "PUBLICADO",
  };
}

function resolveApiUrl(path: string, origin: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base =
    (env.apiBaseUrl && env.apiBaseUrl.length > 0 ? env.apiBaseUrl : origin) ||
    origin;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function fetchVagaByIdOrSlug(
  idOrSlug: string,
  origin: string
): Promise<JobData | null> {
  const normalize = (data: any): any => {
    if (!data) return null;
    if (Array.isArray(data)) return data[0] ?? null;
    if (Array.isArray(data?.data)) return data.data[0] ?? null;
    if (data?.data?.data && typeof data.data.data === "object")
      return data.data.data;
    if (data?.data && typeof data.data === "object") return data.data;
    return data;
  };
  const doFetch = async (path: string): Promise<VagaApiResponse> => {
    const url = resolveApiUrl(path, origin);
    try {
      console.log("[vaga-detalhe][fetch] GET", url);
      const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
      if (!res.ok) {
        console.log("[vaga-detalhe][fetch] FAIL", res.status, url);
        return null;
      }
      const data = await res.json();
      console.log("[vaga-detalhe][fetch] OK", url);
      return normalize(data);
    } catch {
      console.log("[vaga-detalhe][fetch] ERROR", url);
      return null;
    }
  };

  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const looksLikeUuid = uuidRegex.test(idOrSlug);
  let vaga: VagaApiResponse = null;

  if (!looksLikeUuid) {
    vaga = await doFetch(
      `/api/v1/empresas/vagas/slug/${encodeURIComponent(idOrSlug)}`
    );
    if (!vaga) {
      vaga = await doFetch(
        `/api/v1/empresas/vagas/${encodeURIComponent(idOrSlug)}`
      );
    }
  } else {
    vaga = await doFetch(
      `/api/v1/empresas/vagas/${encodeURIComponent(idOrSlug)}`
    );
    if (!vaga) {
      vaga = await doFetch(
        `/api/v1/empresas/vagas/slug/${encodeURIComponent(idOrSlug)}`
      );
    }
  }

  if (!vaga) {
    vaga = await doFetch(
      `/api/v1/empresas/vagas?status=PUBLICADO&slug=${encodeURIComponent(
        idOrSlug
      )}`
    );
  }

  if (!vaga) {
    const listBySlug = await doFetch(
      `/api/v1/candidatos/vagas?slug=${encodeURIComponent(
        idOrSlug
      )}&page=1&pageSize=1`
    );
    if (listBySlug) {
      const cidade = listBySlug?.cidade || "";
      const estado = listBySlug?.estado || "";
      const localizacao = [cidade, estado].filter(Boolean).join(", ");
      const mappedFromList: JobData = {
        id: listBySlug?.id?.toString() || "",
        slug: listBySlug?.slug || undefined,
        titulo: listBySlug?.titulo || "Vaga",
        empresa: listBySlug?.empresa?.nome || "Empresa confidencial",
        empresaLogo:
          listBySlug?.empresa?.avatarUrl ||
          listBySlug?.empresa?.logoUrl ||
          undefined,
        empresaAnonima: Boolean(listBySlug?.empresa?.modoAnonimo),
        localizacao: localizacao || "Não informado",
        tipoContrato: listBySlug?.regimeDeTrabalho || "Não informado",
        modalidade: listBySlug?.modalidade || "Não informado",
        categoria: "Geral",
        nivel: listBySlug?.senioridade || "Não informado",
        descricao:
          "Detalhes completos indisponíveis pela listagem pública. Clique em Candidatar-se para mais informações.",
        dataPublicacao: listBySlug?.inseridaEm
          ? new Date(listBySlug.inseridaEm).toLocaleDateString("pt-BR")
          : "Não informado",
        inscricoesAte: listBySlug?.inscricoesAte
          ? new Date(listBySlug.inscricoesAte).toLocaleDateString("pt-BR")
          : undefined,
        pcd: Boolean(listBySlug?.paraPcd),
        destaque: false,
        salario: undefined,
        beneficios: undefined,
        requisitos: undefined,
        vagasDisponiveis: undefined,
        urlCandidatura: undefined,
        isActive: true,
      };
      return mappedFromList;
    }
  }

  if (!vaga) return null;
  const mapped = mapVagaToJob(vaga);
  // Se a API não enviar status ou enviar diferente, ainda renderizamos.
  // O backend já deve filtrar PUBLICADO para público.
  return mapped;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000";
  const origin = `${protocol}://${host}`;

  const job = await fetchVagaByIdOrSlug(id, origin);
  if (!job) {
    return {
      title: "Vaga não encontrada | Advance+",
      description: "A vaga solicitada não está mais disponível.",
    };
  }

  return {
    title: `${job.titulo} | Vagas | Advance+`,
    description:
      job.descricao?.slice(0, 155) ?? `Detalhes da vaga ${job.titulo}`,
  };
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000";
  const origin = `${protocol}://${host}`;

  const job = await fetchVagaByIdOrSlug(id, origin);
  if (!job) {
    notFound();
  }

  const salaryLabel = job.salario
    ? job.salario.min && job.salario.max
      ? `R$ ${job.salario.min.toLocaleString()} - R$ ${job.salario.max.toLocaleString()}`
      : job.salario.min
      ? `A partir de R$ ${job.salario.min.toLocaleString()}`
      : job.salario.max
      ? `Até R$ ${job.salario.max.toLocaleString()}`
      : "A combinar"
    : "A combinar";

  const infoCards = [
    { label: "Localização", value: job.localizacao, icon: MapPin },
    { label: "Modalidade", value: job.modalidade, icon: Monitor },
    { label: "Contrato", value: job.tipoContrato, icon: Briefcase },
    { label: "Nível", value: job.nivel, icon: User },
    { label: "Faixa salarial", value: salaryLabel, icon: DollarSign },
    {
      label: "Inclusiva para PCD",
      value: job.pcd ? "Sim" : null,
      icon: Award,
    },
    { label: "Publicado em", value: job.dataPublicacao, icon: Clock },
    {
      label: "Inscrições até",
      value: job.inscricoesAte || null,
      icon: CalendarDays,
    },
  ]
    .filter((item) => Boolean(item.value))
    .map((item) => ({
      ...item,
      value: item.value as string,
    })) as {
    label: string;
    value: string;
    icon: React.ElementType;
  }[];

  const applyLink = job.urlCandidatura || APPLY_FALLBACK;
  const requirements = job.requisitos ?? [];
  const benefits = job.beneficios ?? [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5">
        <header className="space-y-6 border-b border-gray-100 pb-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
        <Link
              href="/vagas"
              className="inline-flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
        >
              <ArrowLeft className="w-4 h-4" /> Todas as vagas
        </Link>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <CompanyLogo
                    src={job.empresaLogo}
                    alt={
                      job.empresaAnonima
                        ? "Logo empresa confidencial"
                        : `Logo ${job.empresa}`
                    }
                    size={56}
                  />
                </div>
                <div>
                  <p className="!text-xs !font-semibold !uppercase !text-gray-400 !mb-0">
                    {job.empresaAnonima ? "Empresa confidencial" : job.empresa}
                  </p>
                  <h3 className="!mb-0">{job.titulo}</h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ShareJobButton
                  url={`${origin}/vagas/${job.slug || job.id}`}
                  title={job.titulo}
                  description={job.descricao}
                />
                <ButtonCustom
                  asChild
                  variant="default"
                  className="rounded-full text-sm"
                >
                  <a href={applyLink} target="_blank" rel="noopener noreferrer">
                    Candidatar-se
                  </a>
                </ButtonCustom>
              </div>
            </div>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_3fr] lg:gap-10 space-y-10 lg:space-y-0">
          <main className="space-y-8">
            <section className="space-y-3">
              <h6 className="uppercase text-gray-500">Sobre</h6>
              <p className="!text-gray-700 !leading-relaxed !whitespace-pre-line">
                {job.descricao}
              </p>
            </section>

            {requirements.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <h6 className="uppercase text-gray-500">Requisitos</h6>
                </div>
                <ul className="space-y-2">
                  {requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--secondary-color)]" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {benefits.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <h6 className="uppercase text-gray-500">Benefícios</h6>
                </div>
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <Sparkles className="mt-0.5 h-4 w-4 text-[var(--secondary-color)]" />
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>

          <aside className="lg:pl-4">
            <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Informações
              </h4>
              <dl className="space-y-4 text-sm text-gray-700">
                {infoCards.map(({ label, value, icon: Icon }) => (
                  <div
                    key={`aside-${label}`}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col">
                      <dt className="text-xs font-medium uppercase text-gray-600">
                        {label}
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {value || "—"}
                      </dd>
                    </div>
              </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
