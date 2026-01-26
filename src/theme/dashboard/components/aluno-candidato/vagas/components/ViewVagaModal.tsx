"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Skeleton } from "@/components/ui/skeleton";
import { verificarCandidatura } from "@/api/candidatos";
import type { VerificarCandidaturaResponse } from "@/api/candidatos/types";
import type { JobData } from "@/theme/website/components/career-opportunities/types";
import { CompanyLogo } from "@/theme/website/components/career-opportunities/components/CompanyLogo";
import {
  MapPin,
  DollarSign,
  Monitor,
  Briefcase,
  User,
  Award,
  Clock,
  CalendarDays,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

type VagaApiResponse =
  | (Record<string, any> & { id?: string; slug?: string; status?: string })
  | null;

function isUuid(value: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    value,
  );
}

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
    ? "Empresa anônima"
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

function normalizeApiPayload(data: any): any {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  if (Array.isArray(data?.data)) return data.data[0] ?? null;
  if (data?.data?.data && typeof data.data.data === "object")
    return data.data.data;
  if (data?.data && typeof data.data === "object") return data.data;
  return data;
}

async function doFetch(path: string): Promise<VagaApiResponse> {
  try {
    const token =
      typeof document === "undefined"
        ? null
        : document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1] ?? null;

    const res = await fetch(path, {
      cache: "no-store",
      credentials: "include",
      headers: token
        ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
        : { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeApiPayload(data);
  } catch {
    return null;
  }
}

async function fetchVagaByIdOrSlug(idOrSlug: string): Promise<JobData | null> {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const looksLikeUuid = uuidRegex.test(idOrSlug);
  let vaga: VagaApiResponse = null;

  if (!looksLikeUuid) {
    vaga = await doFetch(
      `/api/v1/empresas/vagas/slug/${encodeURIComponent(idOrSlug)}`,
    );
    if (!vaga) {
      vaga = await doFetch(
        `/api/v1/empresas/vagas/${encodeURIComponent(idOrSlug)}`,
      );
    }
  } else {
    vaga = await doFetch(
      `/api/v1/empresas/vagas/${encodeURIComponent(idOrSlug)}`,
    );
    if (!vaga) {
      vaga = await doFetch(
        `/api/v1/empresas/vagas/slug/${encodeURIComponent(idOrSlug)}`,
      );
    }
  }

  if (!vaga) {
    vaga = await doFetch(
      `/api/v1/empresas/vagas?status=PUBLICADO&slug=${encodeURIComponent(idOrSlug)}`,
    );
  }

  if (!vaga) {
    const listBySlug = await doFetch(
      `/api/v1/candidatos/vagas?slug=${encodeURIComponent(idOrSlug)}&page=1&pageSize=1`,
    );
    if (listBySlug) {
      const cidade = listBySlug?.cidade || "";
      const estado = listBySlug?.estado || "";
      const localizacao = [cidade, estado].filter(Boolean).join(", ");
      const mappedFromList: JobData = {
        id: listBySlug?.id?.toString() || "",
        slug: listBySlug?.slug || undefined,
        titulo: listBySlug?.titulo || "Vaga",
        empresa: Boolean(listBySlug?.empresa?.modoAnonimo)
          ? "Empresa anônima"
          : listBySlug?.empresa?.nome || "Empresa",
        empresaLogo: Boolean(listBySlug?.empresa?.modoAnonimo)
          ? undefined
          : listBySlug?.empresa?.avatarUrl ||
            listBySlug?.empresa?.logoUrl ||
            undefined,
        empresaAnonima: Boolean(listBySlug?.empresa?.modoAnonimo),
        localizacao: localizacao || "Não informado",
        tipoContrato: listBySlug?.regimeDeTrabalho || "Não informado",
        modalidade: listBySlug?.modalidade || "Não informado",
        categoria: "Geral",
        nivel: listBySlug?.senioridade || "Não informado",
        descricao:
          "Detalhes completos indisponíveis pela listagem pública. Abra a vaga para visualizar mais informações.",
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
  return mapVagaToJob(vaga);
}

export interface ViewVagaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  idOrSlug: string | null;
  initialJob?: JobData | null;
  onApplyClick?: (vagaId: string, vagaTitulo?: string | null) => void;
}

export function ViewVagaModal({
  isOpen,
  onOpenChange,
  idOrSlug,
  initialJob,
  onApplyClick,
}: ViewVagaModalProps) {
  const effectiveId = idOrSlug ?? "";

  const {
    data: job,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["aluno-candidato", "vagas", "detalhe", effectiveId],
    queryFn: () => fetchVagaByIdOrSlug(effectiveId),
    enabled: isOpen && Boolean(effectiveId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    initialData: initialJob ?? undefined,
  });

  const requirements = useMemo(() => job?.requisitos ?? [], [job]);
  const benefits = useMemo(() => job?.beneficios ?? [], [job]);

  const salaryLabel = useMemo(() => {
    if (!job?.salario) return "A combinar";
    const min = job.salario.min;
    const max = job.salario.max;
    if (min && max) {
      return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
    }
    if (min) return `A partir de R$ ${min.toLocaleString()}`;
    if (max) return `Até R$ ${max.toLocaleString()}`;
    return "A combinar";
  }, [job]);

  const vagaId = job?.id ?? null;
  const shouldCheckApplied = Boolean(isOpen && vagaId && isUuid(vagaId));

  const appliedQuery = useQuery<VerificarCandidaturaResponse>({
    queryKey: ["aluno-candidato", "candidaturas", "verificar", vagaId],
    queryFn: () =>
      verificarCandidatura(vagaId as string, { cache: "no-store" }),
    enabled: shouldCheckApplied,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const hasApplied = appliedQuery.data?.hasApplied === true;
  const canApply = Boolean(
    !hasApplied &&
    typeof onApplyClick === "function" &&
    typeof job?.id === "string" &&
    isUuid(job.id),
  );
  const appliedStatusLabel =
    appliedQuery.data?.candidatura?.status?.nome ?? null;
  const appliedAtLabel = appliedQuery.data?.candidatura?.aplicadaEm
    ? new Date(appliedQuery.data.candidatura.aplicadaEm).toLocaleDateString(
        "pt-BR",
      )
    : null;

  const infoCards = useMemo(() => {
    if (!job) return [];
    return [
      { label: "Localização", value: job.localizacao, icon: MapPin },
      { label: "Modalidade", value: job.modalidade, icon: Monitor },
      { label: "Contrato", value: job.tipoContrato, icon: Briefcase },
      { label: "Nível", value: job.nivel, icon: User },
      { label: "Faixa salarial", value: salaryLabel, icon: DollarSign },
      {
        label: "Inclusiva para PCD",
        value: job.pcd ? "Sim" : "—",
        icon: Award,
      },
      { label: "Publicado em", value: job.dataPublicacao, icon: Clock },
      {
        label: "Inscrições até",
        value: job.inscricoesAte || "—",
        icon: CalendarDays,
      },
    ];
  }, [job, salaryLabel]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      backdrop="blur"
      scrollBehavior="normal"
    >
      <ModalContentWrapper>
        <ModalHeader className="!pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                <CompanyLogo
                  src={job?.empresaLogo}
                  alt={
                    job?.empresaAnonima
                      ? "Logo empresa anônima"
                      : `Logo ${job?.empresa || "Empresa"}`
                  }
                  size={56}
                />
              </div>
              <div className="min-w-0">
                <p className="!text-xs !font-semibold !uppercase !text-gray-400 !mb-0 truncate">
                  {job?.empresaAnonima
                    ? "Empresa anônima"
                    : job?.empresa || "—"}
                </p>
                <ModalTitle className="!text-base sm:!text-lg !font-semibold !mb-0 !text-gray-900 truncate">
                  {job?.titulo || (isLoading ? "Carregando vaga..." : "Vaga")}
                </ModalTitle>
                <ModalDescription className="!text-xs !text-gray-500 !mt-0.5">
                  {job?.localizacao || " "}
                </ModalDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2" />
          </div>
        </ModalHeader>

        <ModalBody className="!py-4 max-h-[72vh] overflow-y-auto">
          {error ? (
            <div className="p-6">
              <EmptyState
                title="Erro ao carregar vaga"
                description="Não foi possível carregar os detalhes desta vaga."
                illustration="fileNotFound"
                actions={
                  <ButtonCustom
                    variant="primary"
                    onClick={() => refetch()}
                    disabled={isLoading}
                  >
                    Tentar novamente
                  </ButtonCustom>
                }
              />
            </div>
          ) : !job && !isLoading ? (
            <div className="p-6">
              <EmptyState
                title="Vaga não encontrada"
                description="Esta vaga pode não estar mais disponível."
                illustration="fileNotFound"
                actions={
                  <ButtonCustom
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Fechar
                  </ButtonCustom>
                }
              />
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_3fr] lg:gap-10 space-y-10 lg:space-y-0">
              <main className="space-y-8">
                <section className="space-y-3">
                  <h6 className="uppercase text-gray-500">Sobre</h6>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-10/12" />
                      <Skeleton className="h-4 w-9/12" />
                    </div>
                  ) : (
                    <p className="!text-gray-700 !leading-relaxed !whitespace-pre-line">
                      {job?.descricao?.trim()
                        ? job.descricao
                        : "Descrição não informada."}
                    </p>
                  )}
                </section>

                {!isLoading && requirements.length > 0 && (
                  <section className="space-y-2">
                    <h6 className="uppercase text-gray-500">Requisitos</h6>
                    <ul className="space-y-2">
                      {requirements.map((req, index) => (
                        <li
                          key={`${req}-${index}`}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--secondary-color)]" />
                          <span className="leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {!isLoading && benefits.length > 0 && (
                  <section className="space-y-2">
                    <h6 className="uppercase text-gray-500">Benefícios</h6>
                    <ul className="space-y-2">
                      {benefits.map((benefit, index) => (
                        <li
                          key={`${benefit}-${index}`}
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
                    {isLoading
                      ? Array.from({ length: 6 }).map((_, idx) => (
                          <div
                            key={`info-skeleton-${idx}`}
                            className="flex items-start gap-3"
                          >
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-4 w-40" />
                            </div>
                          </div>
                        ))
                      : infoCards.map(({ label, value, icon: Icon }) => (
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
          )}
        </ModalBody>

        <ModalFooter className="!pt-3">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <ButtonCustom variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </ButtonCustom>
            {canApply && (
              <ButtonCustom
                variant="default"
                onClick={() => {
                  if (!job?.id) return;
                  onApplyClick?.(job.id, job.titulo ?? null);
                }}
                disabled={appliedQuery.isFetching}
                className="!bg-[#1f8454] hover:!bg-[#16603d] !text-white !px-6"
              >
                Candidatar-se
              </ButtonCustom>
            )}
            {hasApplied && (
              <div className="text-sm text-gray-600 sm:mr-2 sm:self-center">
                Você já se candidatou
                {appliedStatusLabel ? ` (${appliedStatusLabel})` : ""}.
                {appliedAtLabel ? ` Em ${appliedAtLabel}.` : ""}
              </div>
            )}
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
