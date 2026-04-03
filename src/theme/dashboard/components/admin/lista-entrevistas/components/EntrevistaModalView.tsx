"use client";

import React from "react";
import {
  Building2,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  PlayCircle,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { EntrevistaOverviewItem } from "@/api/entrevistas";
import { cn } from "@/lib/utils";
import {
  formatLocalizacao,
  formatTelefone,
} from "../../lista-candidatos/utils/formatters";

function buildStatusClasses(status: string): string {
  switch (status) {
    case "AGENDADA":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "CONFIRMADA":
      return "bg-cyan-100 text-cyan-800 border border-cyan-200";
    case "REALIZADA":
      return "bg-green-100 text-green-800 border border-green-200";
    case "CANCELADA":
      return "bg-red-100 text-red-800 border border-red-200";
    case "REAGENDADA":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "NAO_COMPARECEU":
      return "bg-gray-100 text-gray-800 border border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
}

function buildModalidadeClasses(modalidade?: string | null): string {
  switch (modalidade) {
    case "ONLINE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PRESENCIAL":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function formatCpf(cpf?: string | null): string {
  if (!cpf) return "—";

  const digits = cpf.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  return cpf;
}

function buildCompanyDisplayName(entrevista: EntrevistaOverviewItem): string {
  return (
    entrevista.empresa?.labelExibicao ??
    (entrevista.empresaAnonima || entrevista.empresa?.anonima
      ? "Empresa anônima"
      : entrevista.empresa?.nomeExibicao ?? "Empresa não informada")
  );
}

function buildAddressText(
  endereco?: EntrevistaOverviewItem["enderecoPresencial"],
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

function buildActionHref(entrevista: EntrevistaOverviewItem): string | null {
  if (entrevista.modalidade === "ONLINE" && entrevista.meetUrl) {
    return entrevista.meetUrl;
  }

  const locationQuery = entrevista.local?.trim() || buildAddressText(entrevista.enderecoPresencial);
  if (!locationQuery) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
}

function buildActionLabel(entrevista: EntrevistaOverviewItem): string {
  return entrevista.modalidade === "ONLINE" ? "Começar entrevista" : "Ver local";
}

type EntrevistaModalViewProps = {
  entrevista: EntrevistaOverviewItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EntrevistaModalView({
  entrevista,
  isOpen,
  onOpenChange,
}: EntrevistaModalViewProps) {
  if (!entrevista) return null;

  const companyDisplayName = buildCompanyDisplayName(entrevista);
  const candidateLocation = formatLocalizacao({
    cidade: entrevista.candidato.cidade,
    estado: entrevista.candidato.estado,
  });
  const interviewDate =
    entrevista.agendadaParaFormatada ??
    entrevista.agendadaPara ??
    entrevista.dataInicio ??
    "—";
  const presencialAddress =
    entrevista.local?.trim() || buildAddressText(entrevista.enderecoPresencial);
  const actionHref = buildActionHref(entrevista);
  const actionLabel = buildActionLabel(entrevista);
  const actionIcon = entrevista.modalidade === "ONLINE" ? PlayCircle : MapPin;

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader className="border-b border-gray-100 pb-4">
          <div className="space-y-1 pr-10">
            <ModalTitle className="!mb-0 text-lg! font-semibold">
              Entrevista de {entrevista.candidato.nome}
            </ModalTitle>
            <p className="!mb-0 text-sm text-gray-500">
              {entrevista.vaga.titulo}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4 py-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <CalendarClock className="h-4 w-4 text-gray-400" />
                <span>{interviewDate}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge
                  className={cn(
                    "font-medium",
                    buildStatusClasses(entrevista.statusEntrevista),
                  )}
                >
                  {entrevista.statusEntrevistaLabel || entrevista.statusEntrevista}
                </Badge>
                {entrevista.modalidadeLabel ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      buildModalidadeClasses(entrevista.modalidade),
                    )}
                  >
                    {entrevista.modalidadeLabel}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-900">
              <UserRound className="h-4 w-4 text-gray-400" />
              Candidato
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  Nome
                </div>
                <div className="font-medium text-gray-900">
                  {entrevista.candidato.nome}
                </div>
                <div className="font-mono text-xs text-gray-500">
                  {entrevista.candidato.codigo || "Sem código"} · {formatCpf(entrevista.candidato.cpf)}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    E-mail
                  </div>
                  <div className="mt-1 flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="min-w-0 break-all">
                      {entrevista.candidato.email || "Não informado"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Telefone
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{formatTelefone(entrevista.candidato.telefone)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Cidade
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{candidateLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-900">
              <Building2 className="h-4 w-4 text-gray-400" />
              Empresa e vaga
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1 text-sm text-gray-600">
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  Empresa
                </div>
                <div className="font-medium text-gray-900">
                  {companyDisplayName}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  Vaga
                </div>
                <div className="font-medium text-gray-900">
                  {entrevista.vaga.titulo}
                </div>
                <div className="font-mono text-xs text-gray-500">
                  {entrevista.vaga.codigo || "Sem código"}
                </div>
              </div>

              {entrevista.recrutador?.nome ? (
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Responsável
                  </div>
                  <div className="font-medium text-gray-900">
                    {entrevista.recrutador.nome}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-3 text-sm font-medium text-gray-900">
              Informações da entrevista
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {entrevista.modalidade === "ONLINE" && entrevista.meetUrl ? (
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Link da reunião
                  </div>
                  <a
                    href={entrevista.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[var(--primary-color)] hover:underline"
                  >
                    Abrir Google Meet
                    <PlayCircle className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : null}

              {presencialAddress ? (
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Local
                  </div>
                  <div className="text-gray-700">{presencialAddress}</div>
                </div>
              ) : null}

              {entrevista.descricao ? (
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Descrição
                  </div>
                  <div className="text-gray-700">{entrevista.descricao}</div>
                </div>
              ) : null}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 pt-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonCustom
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </ButtonCustom>

            {actionHref ? (
              <ButtonCustom asChild type="button" variant="primary">
                <a href={actionHref} target="_blank" rel="noreferrer">
                  {React.createElement(actionIcon, { className: "h-4 w-4" })}
                  {actionLabel}
                </a>
              </ButtonCustom>
            ) : null}
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
