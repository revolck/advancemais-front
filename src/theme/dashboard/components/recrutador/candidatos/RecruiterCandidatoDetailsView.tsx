"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Eye,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  PlayCircle,
} from "lucide-react";

import {
  getRecrutadorCandidatoById,
  getRecrutadorCandidatoCurriculoById,
  getRecrutadorEntrevistaById,
  listRecrutadorCandidatoEntrevistas,
} from "@/api/recrutador";
import type {
  RecrutadorCandidatoCandidatura,
  RecrutadorCandidatoDetailData,
  RecrutadorCandidatoEntrevistaItem,
} from "@/api/recrutador";
import type { Curriculo } from "@/api/candidatos/types";
import type { EntrevistaOverviewItem } from "@/api/entrevistas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AvatarCustom,
  ButtonCustom,
  EmptyState,
  HorizontalTabs,
} from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ViewCurriculoModal } from "@/theme/dashboard/components/admin/candidato-details/modal-acoes/ViewCurriculoModal";
import { EntrevistaModalView } from "@/theme/dashboard/components/admin/lista-entrevistas/components/EntrevistaModalView";
import { generateCurriculoPdf } from "@/theme/dashboard/components/admin/candidato-details/utils/generateCurriculoPdf";
import { MarcarEntrevistaRecrutadorModal } from "./modal-acoes/MarcarEntrevistaRecrutadorModal";

interface RecruiterCandidatoDetailsViewProps {
  candidatoId: string;
}

function formatCpf(value?: string | null): string {
  if (!value) return "—";

  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatTelefone(value?: string | null): string {
  if (!value) return "—";

  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return value;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

function formatLocalizacao(data: { cidade?: string | null; estado?: string | null }): string {
  return [data.cidade, data.estado].filter(Boolean).join(", ") || "Não informado";
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

function normalizeStatus(value?: string | null): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function getStatusClasses(status?: string | null): string {
  switch (normalizeStatus(status)) {
    case "CONTRATADO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "ENTREVISTA":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "EM_PROCESSO":
    case "EM_ANALISE":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "RECUSADO":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "DESISTIU":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "PUBLICADO":
      return "bg-sky-100 text-sky-800 border-sky-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function buildInterviewStatusClasses(status: string): string {
  switch (status) {
    case "AGENDADA":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CONFIRMADA":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "REALIZADA":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELADA":
      return "bg-red-100 text-red-800 border-red-200";
    case "REAGENDADA":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "NAO_COMPARECEU":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function buildInterviewModalidadeClasses(modalidade?: string | null): string {
  switch (modalidade) {
    case "ONLINE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PRESENCIAL":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function buildInterviewCompanyDisplayName(
  entrevista: RecrutadorCandidatoEntrevistaItem
): string {
  return (
    entrevista.empresa?.labelExibicao ??
    (entrevista.empresaAnonima || entrevista.empresa?.anonima
      ? "Empresa anônima"
      : entrevista.empresa?.nomeExibicao ?? "Empresa não informada")
  );
}

function buildInterviewAddressText(
  endereco?: RecrutadorCandidatoEntrevistaItem["enderecoPresencial"]
): string | null {
  if (!endereco) return null;

  const line1 = [endereco.logradouro, endereco.numero]
    .filter(Boolean)
    .join(", ")
    .trim();
  const line2 = [endereco.bairro, endereco.cidade, endereco.estado]
    .filter(Boolean)
    .join(", ")
    .trim();
  const line3 = [endereco.cep, endereco.complemento, endereco.pontoReferencia]
    .filter(Boolean)
    .join(" · ")
    .trim();

  return [line1, line2, line3].filter(Boolean).join(" — ") || null;
}

function buildInterviewActionHref(
  entrevista: RecrutadorCandidatoEntrevistaItem
): string | null {
  if (entrevista.meetUrl) {
    return entrevista.meetUrl;
  }

  const locationQuery =
    entrevista.local?.trim() || buildInterviewAddressText(entrevista.enderecoPresencial);
  if (!locationQuery) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
}

function buildInterviewActionLabel(
  entrevista: RecrutadorCandidatoEntrevistaItem
): string {
  return entrevista.modalidade === "ONLINE" ? "Começar" : "Ver local";
}

function toEntrevistaOverviewItem(
  entrevista: RecrutadorCandidatoEntrevistaItem,
  candidato: RecrutadorCandidatoDetailData["candidato"]
): EntrevistaOverviewItem {
  return {
    id: entrevista.id,
    candidaturaId: entrevista.candidaturaId ?? null,
    empresaAnonima: entrevista.empresaAnonima,
    statusEntrevista: entrevista.statusEntrevista,
    statusEntrevistaLabel:
      entrevista.statusEntrevistaLabel ?? entrevista.statusEntrevista ?? null,
    modalidade: entrevista.modalidade ?? null,
    modalidadeLabel: entrevista.modalidadeLabel ?? entrevista.modalidade ?? null,
    agendadaPara: entrevista.agendadaPara ?? entrevista.dataInicio ?? null,
    agendadaParaFormatada:
      entrevista.agendadaParaFormatada ?? entrevista.agendadaPara ?? null,
    dataInicio: entrevista.dataInicio ?? entrevista.agendadaPara ?? null,
    dataFim: entrevista.dataFim ?? null,
    descricao: entrevista.descricao ?? null,
    meetUrl: entrevista.meetUrl ?? null,
    local: entrevista.local ?? null,
    enderecoPresencial: entrevista.enderecoPresencial ?? null,
    candidato: entrevista.candidato
      ? {
          id: entrevista.candidato.id,
          codigo: entrevista.candidato.codigo ?? candidato.codUsuario ?? null,
          nome: entrevista.candidato.nome ?? candidato.nomeCompleto,
          email: entrevista.candidato.email ?? candidato.email ?? null,
          cpf: entrevista.candidato.cpf ?? candidato.cpf ?? null,
          telefone: entrevista.candidato.telefone ?? candidato.telefone ?? null,
          avatarUrl: entrevista.candidato.avatarUrl ?? candidato.avatarUrl ?? null,
          cidade: entrevista.candidato.cidade ?? candidato.cidade ?? null,
          estado: entrevista.candidato.estado ?? candidato.estado ?? null,
        }
      : {
          id: candidato.id,
          codigo: candidato.codUsuario ?? null,
          nome: candidato.nomeCompleto,
          email: candidato.email ?? null,
          cpf: candidato.cpf ?? null,
          telefone: candidato.telefone ?? null,
          avatarUrl: candidato.avatarUrl ?? null,
          cidade: candidato.cidade ?? null,
          estado: candidato.estado ?? null,
        },
    vaga: {
      id: entrevista.vaga.id,
      codigo: entrevista.vaga.codigo ?? null,
      titulo: entrevista.vaga.titulo,
      status: entrevista.vaga.status ?? null,
    },
    empresa: entrevista.empresa
      ? {
          id: entrevista.empresa.id,
          nomeExibicao: entrevista.empresa.nomeExibicao ?? null,
          anonima: entrevista.empresa.anonima,
          labelExibicao: entrevista.empresa.labelExibicao ?? null,
          logoUrl: entrevista.empresa.logoUrl ?? null,
        }
      : null,
    recrutador: entrevista.recrutador
      ? {
          id: entrevista.recrutador.id,
          nome: entrevista.recrutador.nome,
          email: entrevista.recrutador.email ?? null,
          avatarUrl: entrevista.recrutador.avatarUrl ?? null,
        }
      : null,
    meta: entrevista.meta ?? null,
    agenda: entrevista.agenda ?? null,
    criadoEm: entrevista.criadoEm ?? null,
    atualizadoEm: entrevista.atualizadoEm ?? null,
  };
}

function RecruiterCandidatoDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </section>

      <div className="rounded-3xl bg-white p-6 sm:p-7">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function CandidateAboutSection({ data }: { data: RecrutadorCandidatoDetailData }) {
  const candidate = data.candidato;
  const infos = [
    {
      label: "Código do candidato",
      value: candidate.codUsuario || "—",
      icon: FileText,
    },
    {
      label: "Telefone",
      value: formatTelefone(candidate.telefone),
      icon: Phone,
    },
    {
      label: "E-mail",
      value: candidate.email || "—",
      icon: Mail,
    },
    {
      label: "Localização",
      value: formatLocalizacao(candidate),
      icon: MapPin,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="userProfiles"
          illustrationAlt="Descrição não disponível"
          title="Descrição não disponível."
          description="Este detalhe mostra apenas as informações do candidato visíveis no escopo atual do recrutador."
          maxContentWidth="md"
        />
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <dl className="mt-4 space-y-4 text-sm">
            {infos.map((info) => (
              <div key={info.label} className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <info.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="flex flex-1 flex-col">
                  <dt className="text-xs font-medium uppercase text-gray-600">
                    {info.label}
                  </dt>
                  <dd className="text-xs text-gray-500">{info.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}

function CandidateCandidaturasSection({
  candidatoId,
  candidatoNome,
  candidaturas,
}: {
  candidatoId: string;
  candidatoNome: string;
  candidaturas: RecrutadorCandidatoCandidatura[];
}) {
  const [selectedCurriculo, setSelectedCurriculo] = useState<Curriculo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingCurriculoId, setLoadingCurriculoId] = useState<string | null>(null);

  const handleViewCurriculo = async (
    curriculoId: string,
    candidaturaId: string
  ) => {
    if (!curriculoId) return;

    setLoadingCurriculoId(candidaturaId);

    try {
      const response = await getRecrutadorCandidatoCurriculoById(
        candidatoId,
        curriculoId
      );

      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar o currículo.");
      }

      setSelectedCurriculo(response.data);
      setIsModalOpen(true);
    } catch (error) {
      toastCustom.error({
        title: "Erro ao carregar currículo",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o currículo visível no escopo do recrutador.",
      });
    } finally {
      setLoadingCurriculoId(null);
    }
  };

  if (candidaturas.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Nenhuma candidatura visível"
          title="Nenhuma candidatura visível"
          description="Não há candidaturas disponíveis dentro do escopo atual do recrutador."
          maxContentWidth="sm"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white overflow-hidden">
      <Table className="min-w-[780px]">
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50/50">
            <TableHead className="py-4 min-w-[280px]">Vaga</TableHead>
            <TableHead className="min-w-[220px]">Empresa</TableHead>
            <TableHead className="min-w-[240px]">Currículo</TableHead>
            <TableHead className="min-w-[160px]">Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidaturas.map((candidatura) => (
            <TableRow key={candidatura.id} className="border-gray-100 hover:bg-gray-50/50">
              <TableCell className="py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900">
                      {candidatura.vaga.titulo}
                    </div>
                    {candidatura.vaga.codigo && (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {candidatura.vaga.codigo}
                        </span>
                        {candidatura.vaga.status && (
                          <Badge
                            className={cn(
                              "uppercase tracking-wide text-[10px]",
                              getStatusClasses(candidatura.vaga.status)
                            )}
                          >
                            {candidatura.vaga.status}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900">
                      {candidatura.empresa.nomeExibicao}
                    </div>
                    {candidatura.empresa.codigo && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {candidatura.empresa.codigo}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                {candidatura.curriculo ? (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-slate-900">
                          {candidatura.curriculo.titulo}
                        </span>
                        {candidatura.curriculo.principal ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 shrink-0"
                          >
                            <Crown className="h-3 w-3 fill-current" />
                            Principal
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleViewCurriculo(
                              candidatura.curriculo!.id,
                              candidatura.id
                            )
                          }
                          disabled={loadingCurriculoId === candidatura.id}
                          className="h-8 w-8 rounded-full text-gray-500 hover:bg-[var(--primary-color)] hover:text-white"
                          aria-label="Visualizar currículo"
                        >
                          {loadingCurriculoId === candidatura.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={8}>
                        Visualizar currículo
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell className="py-4">
                <Badge
                  className={cn(
                    "uppercase tracking-wide text-[10px]",
                    getStatusClasses(candidatura.status)
                  )}
                >
                  {candidatura.status}
                </Badge>
              </TableCell>
              <TableCell className="py-4 w-12">
                <Button
                  asChild
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-gray-500 hover:bg-[var(--primary-color)] hover:text-white"
                >
                  <Link
                    href={`/dashboard/empresas/vagas/${encodeURIComponent(candidatura.vaga.id)}`}
                    aria-label="Visualizar vaga"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedCurriculo ? (
        <ViewCurriculoModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          curriculo={selectedCurriculo}
          usuarioNome={candidatoNome}
        />
      ) : null}
    </div>
  );
}

function CandidateCurriculosSection({
  candidatoId,
  candidato,
  candidaturas,
}: {
  candidatoId: string;
  candidato: RecrutadorCandidatoDetailData["candidato"];
  candidaturas: RecrutadorCandidatoCandidatura[];
}) {
  const [selectedCurriculo, setSelectedCurriculo] = useState<Curriculo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingCurriculoId, setLoadingCurriculoId] = useState<string | null>(null);
  const [downloadingCurriculoId, setDownloadingCurriculoId] = useState<string | null>(null);

  const curriculosVisiveis = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        titulo: string;
        principal: boolean;
        ultimaAtualizacao?: string | null;
        vagas: Array<{ id: string; titulo: string; codigo?: string | null }>;
      }
    >();

    candidaturas.forEach((candidatura) => {
      const curriculo = candidatura.curriculo;
      if (!curriculo?.id) return;

      const existing = map.get(curriculo.id);
      const vagaInfo = {
        id: candidatura.vaga.id,
        titulo: candidatura.vaga.titulo,
        codigo: candidatura.vaga.codigo,
      };

      if (existing) {
        const alreadyAdded = existing.vagas.some((vaga) => vaga.id === vagaInfo.id);
        if (!alreadyAdded) {
          existing.vagas.push(vagaInfo);
        }
        return;
      }

      map.set(curriculo.id, {
        id: curriculo.id,
        titulo: curriculo.titulo,
        principal: Boolean(curriculo.principal),
        ultimaAtualizacao: curriculo.ultimaAtualizacao,
        vagas: [vagaInfo],
      });
    });

    return Array.from(map.values());
  }, [candidaturas]);

  const handleViewCurriculo = async (curriculoId: string) => {
    setLoadingCurriculoId(curriculoId);

    try {
      const response = await getRecrutadorCandidatoCurriculoById(
        candidatoId,
        curriculoId
      );

      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar o currículo.");
      }

      setSelectedCurriculo(response.data);
      setIsModalOpen(true);
    } catch (error) {
      toastCustom.error({
        title: "Erro ao carregar currículo",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o currículo visível no escopo do recrutador.",
      });
    } finally {
      setLoadingCurriculoId(null);
    }
  };

  const handleDownloadCurriculo = async (curriculoId: string) => {
    setDownloadingCurriculoId(curriculoId);

    try {
      const response = await getRecrutadorCandidatoCurriculoById(
        candidatoId,
        curriculoId
      );

      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar o currículo.");
      }

      await generateCurriculoPdf(response.data, candidato.nomeCompleto, {
        avatarUrl: candidato.avatarUrl ?? null,
        email: candidato.email ?? null,
        telefone: candidato.telefone ?? null,
      } as never);

      toastCustom.success({
        title: "Download iniciado",
        description: "O currículo está sendo baixado em PDF.",
      });
    } catch (error) {
      toastCustom.error({
        title: "Erro ao baixar currículo",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível baixar o currículo visível no escopo do recrutador.",
      });
    } finally {
      setDownloadingCurriculoId(null);
    }
  };

  if (curriculosVisiveis.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-12">
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Nenhum currículo visível"
          title="Nenhum currículo visível"
          description="Não há currículos vinculados às candidaturas visíveis no escopo atual do recrutador."
          maxContentWidth="sm"
        />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-2">
      <div className="overflow-x-auto">
      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50/50">
            <TableHead className="font-medium text-gray-700 py-4 min-w-[280px]">
              Currículo
            </TableHead>
            <TableHead className="font-medium text-gray-700 min-w-[280px]">
              Vagas vinculadas
            </TableHead>
            <TableHead className="font-medium text-gray-700 min-w-[180px]">
              Última atualização
            </TableHead>
            <TableHead className="font-medium text-gray-700 w-20 text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {curriculosVisiveis.map((curriculo) => (
            <TableRow key={curriculo.id} className="border-gray-100 hover:bg-gray-50/50">
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm text-gray-900 font-medium truncate max-w-[220px]">
                        {curriculo.titulo}
                      </div>
                      {curriculo.principal ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 shrink-0"
                        >
                          <Crown className="h-3 w-3 fill-current" />
                          Principal
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-1">
                  {curriculo.vagas.map((vaga) => (
                    <div
                      key={vaga.id}
                      className="text-sm font-mono text-slate-600"
                    >
                      {vaga.codigo || "—"}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{formatDate(curriculo.ultimaAtualizacao)}</span>
                </div>
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewCurriculo(curriculo.id)}
                        disabled={
                          loadingCurriculoId === curriculo.id ||
                          downloadingCurriculoId === curriculo.id
                        }
                        className="h-8 w-8 rounded-full !cursor-pointer text-gray-500 hover:bg-[var(--primary-color)] hover:text-white"
                        aria-label="Visualizar currículo"
                      >
                        {loadingCurriculoId === curriculo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      Visualizar currículo
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadCurriculo(curriculo.id)}
                        disabled={
                          downloadingCurriculoId === curriculo.id ||
                          loadingCurriculoId === curriculo.id
                        }
                        className="h-8 w-8 rounded-full !cursor-pointer text-gray-500 hover:bg-[var(--primary-color)] hover:text-white"
                        aria-label="Baixar currículo"
                      >
                        {downloadingCurriculoId === curriculo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      Baixar PDF
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {selectedCurriculo ? (
        <ViewCurriculoModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          curriculo={selectedCurriculo}
          usuarioNome={candidato.nomeCompleto}
        />
      ) : null}
    </div>
  );
}

const INTERVIEWS_PAGE_SIZE = 10;

function CandidateEntrevistasSection({
  candidatoId,
  candidato,
}: {
  candidatoId: string;
  candidato: RecrutadorCandidatoDetailData["candidato"];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntrevista, setSelectedEntrevista] =
    useState<EntrevistaOverviewItem | null>(null);
  const [viewingEntrevistaId, setViewingEntrevistaId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["recrutador-candidato-entrevistas", candidatoId, currentPage],
    queryFn: async () => {
      const response = await listRecrutadorCandidatoEntrevistas(candidatoId, {
        page: currentPage,
        pageSize: INTERVIEWS_PAGE_SIZE,
        sortBy: "agendadaPara",
        sortDir: "desc",
      });

      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar as entrevistas.");
      }

      return response;
    },
    enabled: Boolean(candidatoId),
    staleTime: 60 * 1000,
  });

  const entrevistas = data?.data.items ?? [];
  const pagination = data?.data.pagination ?? {
    page: currentPage,
    pageSize: INTERVIEWS_PAGE_SIZE,
    total: entrevistas.length,
    totalPages: entrevistas.length > 0 ? 1 : 0,
  };

  const handleViewEntrevista = async (
    entrevistaBase: RecrutadorCandidatoEntrevistaItem
  ) => {
    setViewingEntrevistaId(entrevistaBase.id);

    try {
      const response = await getRecrutadorEntrevistaById(entrevistaBase.id);
      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar a entrevista.");
      }

      const entrevistaDetalhe = response.data ?? response.entrevista;
      const entrevistaNormalizada = entrevistaDetalhe
        ? {
            ...entrevistaBase,
            ...entrevistaDetalhe,
            vaga: entrevistaDetalhe.vaga ?? entrevistaBase.vaga,
            empresa: entrevistaDetalhe.empresa ?? entrevistaBase.empresa,
            recrutador: entrevistaDetalhe.recrutador ?? entrevistaBase.recrutador,
            candidato: entrevistaDetalhe.candidato ?? entrevistaBase.candidato,
            agenda: entrevistaDetalhe.agenda ?? entrevistaBase.agenda,
            enderecoPresencial:
              entrevistaDetalhe.enderecoPresencial ?? entrevistaBase.enderecoPresencial,
            meta: entrevistaDetalhe.meta ?? entrevistaBase.meta,
          }
        : entrevistaBase;

      setSelectedEntrevista(
        toEntrevistaOverviewItem(entrevistaNormalizada, candidato)
      );
    } catch (viewError) {
      toastCustom.error({
        title: "Erro ao carregar entrevista",
        description:
          viewError instanceof Error
            ? viewError.message
            : "Não foi possível carregar os detalhes da entrevista.",
      });
    } finally {
      setViewingEntrevistaId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div className="flex justify-end">
          <ButtonCustom
            type="button"
            variant="primary"
            className="cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Marcar entrevista
          </ButtonCustom>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar as entrevistas visíveis do candidato."}
        </div>

        <MarcarEntrevistaRecrutadorModal
          candidatoId={candidatoId}
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    );
  }

  if (entrevistas.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex justify-end">
          <ButtonCustom
            type="button"
            variant="primary"
            className="cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Marcar entrevista
          </ButtonCustom>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-12">
          <EmptyState
            illustration="userProfiles"
            illustrationAlt="Nenhuma entrevista visível"
            title="Nenhuma entrevista encontrada"
            description="Este candidato ainda não possui entrevistas visíveis no escopo atual do recrutador."
            maxContentWidth="md"
          />
        </div>

        <MarcarEntrevistaRecrutadorModal
          candidatoId={candidatoId}
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <ButtonCustom
          type="button"
          variant="primary"
          className="cursor-pointer"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Marcar entrevista
        </ButtonCustom>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <Table className="min-w-[1120px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead className="py-4 font-medium text-gray-700">
                Entrevista
              </TableHead>
              <TableHead className="font-medium text-gray-700">Vaga</TableHead>
              <TableHead className="font-medium text-gray-700">Empresa</TableHead>
              <TableHead className="font-medium text-gray-700">
                Responsável
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                Modalidade
              </TableHead>
              <TableHead className="font-medium text-gray-700">Status</TableHead>
              <TableHead className="w-[220px] text-right font-medium text-gray-700">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entrevistas.map((entrevista) => {
              const actionHref = buildInterviewActionHref(entrevista);
              const actionLabel = buildInterviewActionLabel(entrevista);
              const actionIcon =
                entrevista.modalidade === "ONLINE" ? PlayCircle : MapPin;

              return (
                <TableRow
                  key={entrevista.id}
                  className="border-gray-100 transition-colors hover:bg-gray-50/40"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <CalendarClock className="h-4 w-4 text-gray-400" />
                      <span>
                        {entrevista.agendadaParaFormatada ||
                          formatDateTime(
                            entrevista.dataInicio ?? entrevista.agendadaPara
                          )}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {entrevista.vaga.titulo}
                      </div>
                      <div className="font-mono text-xs text-gray-500">
                        {entrevista.vaga.codigo || "Sem código"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-sm text-gray-700">
                      {buildInterviewCompanyDisplayName(entrevista)}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-sm text-gray-700">
                      {entrevista.recrutador?.nome ?? "Não informado"}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {entrevista.modalidadeLabel ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          buildInterviewModalidadeClasses(entrevista.modalidade)
                        )}
                      >
                        {entrevista.modalidadeLabel}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">Não informado</span>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        buildInterviewStatusClasses(entrevista.statusEntrevista)
                      )}
                    >
                      {entrevista.statusEntrevistaLabel || entrevista.statusEntrevista}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <ButtonCustom
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => void handleViewEntrevista(entrevista)}
                        disabled={viewingEntrevistaId === entrevista.id}
                      >
                        {viewingEntrevistaId === entrevista.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        Visualizar
                      </ButtonCustom>

                      {actionHref ? (
                        <ButtonCustom
                          asChild
                          type="button"
                          variant="primary"
                          size="sm"
                          className="cursor-pointer"
                        >
                          <a href={actionHref} target="_blank" rel="noreferrer">
                            {actionIcon === PlayCircle ? (
                              <PlayCircle className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            {actionLabel}
                          </a>
                        </ButtonCustom>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 ? (
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            {pagination.total === 0
              ? 0
              : (pagination.page - 1) * pagination.pageSize + 1}{" "}
            a {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{" "}
            {pagination.total}
          </p>

          <div className="flex items-center gap-2">
            <ButtonCustom
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                setCurrentPage((previousPage) => Math.max(1, previousPage - 1))
              }
              disabled={pagination.page <= 1}
            >
              Anterior
            </ButtonCustom>

            <span className="text-sm text-slate-500">
              Página {pagination.page} de {pagination.totalPages}
            </span>

            <ButtonCustom
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() =>
                setCurrentPage((previousPage) =>
                  Math.min(pagination.totalPages, previousPage + 1)
                )
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              Próxima
            </ButtonCustom>
          </div>
        </div>
      ) : null}

      <EntrevistaModalView
        entrevista={selectedEntrevista}
        isOpen={Boolean(selectedEntrevista)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntrevista(null);
          }
        }}
      />

      <MarcarEntrevistaRecrutadorModal
        candidatoId={candidatoId}
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}

export function RecruiterCandidatoDetailsView({
  candidatoId,
}: RecruiterCandidatoDetailsViewProps) {
  const { data, isLoading, error, refetch } = useQuery<
    RecrutadorCandidatoDetailData,
    Error
  >({
    queryKey: ["recrutador-candidato-detail", candidatoId],
    queryFn: async () => {
      const response = await getRecrutadorCandidatoById(candidatoId);
      if (!response.success) {
        throw new Error(response.message || "Não foi possível carregar o candidato.");
      }
      return response.data;
    },
    enabled: Boolean(candidatoId),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const tabs = useMemo(() => {
    if (!data) return [];

    return [
      {
        value: "sobre",
        label: "Sobre",
        icon: "User" as const,
        content: <CandidateAboutSection data={data} />,
      },
      {
        value: "candidaturas",
        label: "Candidaturas",
        icon: "Briefcase" as const,
        content: (
          <CandidateCandidaturasSection
            candidatoId={data.candidato.id}
            candidatoNome={data.candidato.nomeCompleto}
            candidaturas={data.candidaturas}
          />
        ),
      },
      {
        value: "curriculos",
        label: "Currículos",
        icon: "FileText" as const,
        content: (
          <CandidateCurriculosSection
            candidatoId={data.candidato.id}
            candidato={data.candidato}
            candidaturas={data.candidaturas}
          />
        ),
      },
      {
        value: "entrevistas",
        label: "Entrevistas",
        icon: "Calendar" as const,
        content: (
          <CandidateEntrevistasSection
            candidatoId={data.candidato.id}
            candidato={data.candidato}
          />
        ),
      },
    ];
  }, [data]);

  if (isLoading) {
    return <RecruiterCandidatoDetailsSkeleton />;
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <div className="flex items-center justify-between gap-3">
            <span>
              {error?.message || "Não foi possível carregar os dados do candidato."}
            </span>
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

  const candidate = data.candidato;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <AvatarCustom
              name={candidate.nomeCompleto}
              src={candidate.avatarUrl || undefined}
              size="xl"
              showStatus={false}
              className="text-base"
            />
            <div className="space-y-3">
              <h3 className="font-semibold !mb-0">{candidate.nomeCompleto}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
                <span>CPF: {formatCpf(candidate.cpf)}</span>
              </div>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link
              href="/dashboard/empresas/candidatos"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </section>

      <HorizontalTabs items={tabs} defaultValue="sobre" />
    </div>
  );
}
