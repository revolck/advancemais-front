// src/theme/dashboard/components/admin/lista-solicitacoes/components/VisualizarVagaModal.tsx

"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Accessibility,
  User,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getSolicitacaoById } from "@/api/vagas/solicitacoes";
import type { SolicitacaoVaga } from "@/api/vagas/solicitacoes/types";

interface VisualizarVagaModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitacao: SolicitacaoVaga | null;
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
  isAprovando?: boolean;
}

// Labels
const REGIME_LABELS: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ / Freelance",
  ESTAGIO: "Estágio",
  TEMPORARIO: "Temporário",
  HOME_OFFICE: "Home Office",
  JOVEM_APRENDIZ: "Jovem Aprendiz",
  // Valores legados para compatibilidade
  TRAINEE: "Trainee",
  FREELANCE: "Freelance",
};

const MODALIDADE_LABELS: Record<string, string> = {
  PRESENCIAL: "Presencial",
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
};

const JORNADA_LABELS: Record<string, string> = {
  INTEGRAL: "Integral",
  MEIO_PERIODO: "Meio período",
  FLEXIVEL: "Flexível",
};

const SENIORIDADE_LABELS: Record<string, string> = {
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  ESPECIALISTA: "Especialista",
  GERENTE: "Gerente",
  DIRETOR: "Diretor",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  EM_ANALISE: {
    label: "Em Análise",
    className: "!bg-amber-100 !text-amber-800",
  },
  PUBLICADO: { label: "Publicada", className: "!bg-green-100 !text-green-800" },
  RASCUNHO: { label: "Rascunho", className: "!bg-gray-100 !text-gray-800" },
  DESPUBLICADA: {
    label: "Despublicada",
    className: "!bg-red-100 !text-red-800",
  },
  PAUSADA: { label: "Pausada", className: "!bg-blue-100 !text-blue-800" },
  ENCERRADA: { label: "Encerrada", className: "!bg-gray-100 !text-gray-800" },
  EXPIRADO: { label: "Expirada", className: "!bg-red-100 !text-red-800" },
};

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value?: string | number | null): string {
  if (!value) return "N/A";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "N/A";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

// Lista de items
function ItemList({
  items,
  emptyMessage = "Não informado",
}: {
  items?: string[];
  emptyMessage?: string;
}) {
  if (!items || items.length === 0) {
    return (
      <p className="!text-sm !text-gray-400 !italic !m-0">{emptyMessage}</p>
    );
  }

  return (
    <ul className="!m-0 !p-0 !list-none space-y-1.5">
      {items.map((item: string, index: number) => (
        <li key={index} className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="!text-sm !text-gray-600 !m-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function VisualizarVagaModal({
  isOpen,
  onClose,
  solicitacao,
  onAprovar,
  onRejeitar,
  isAprovando = false,
}: VisualizarVagaModalProps) {
  const {
    data: vagaDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["solicitacao-details", solicitacao?.id],
    queryFn: () => getSolicitacaoById(solicitacao!.id),
    enabled: isOpen && !!solicitacao?.id,
    staleTime: 1000 * 60 * 5,
  });

  const vaga = vagaDetails;
  const isPendente = solicitacao?.status === "PENDENTE";

  const handleAprovar = () => {
    if (solicitacao) onAprovar(solicitacao.id);
  };

  const handleRejeitar = () => {
    if (solicitacao) onRejeitar(solicitacao.id);
  };

  // Salário
  const salarioText = vaga?.salarioConfidencial
    ? "Confidencial"
    : vaga?.salarioMin && vaga?.salarioMax
    ? `${formatCurrency(vaga.salarioMin)} - ${formatCurrency(vaga.salarioMax)}`
    : vaga?.salarioMin
    ? `A partir de ${formatCurrency(vaga.salarioMin)}`
    : null;

  // Localização
  const localizacaoText = vaga?.localizacao
    ? [vaga.localizacao.cidade, vaga.localizacao.estado]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="3xl" backdrop="blur">
      <ModalContentWrapper>
        {/* Header */}
        <ModalHeader className="!pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              {vaga?.empresa?.avatarUrl && (
                <AvatarImage
                  src={vaga.empresa.avatarUrl}
                  alt={vaga.empresa?.nome}
                />
              )}
              <AvatarFallback className="!bg-primary/10 !text-primary !text-sm !font-semibold">
                {solicitacao?.empresa?.nome?.substring(0, 2).toUpperCase() ||
                  "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <ModalTitle className="!text-base !font-semibold !mb-0 !text-gray-900 truncate">
                  {solicitacao?.vaga?.titulo || "Carregando..."}
                </ModalTitle>
                {vaga?.status && (
                  <Badge
                    className={cn(
                      "!text-[10px] !uppercase !font-medium",
                      STATUS_CONFIG[vaga.status]?.className
                    )}
                  >
                    {STATUS_CONFIG[vaga.status]?.label || vaga.status}
                  </Badge>
                )}
                {vaga?.paraPcd && (
                  <Badge className="!bg-purple-100 !text-purple-700 !text-[10px] gap-0.5">
                    <Accessibility className="w-2.5 h-2.5" />
                    PCD
                  </Badge>
                )}
              </div>
              <ModalDescription className="!text-xs !text-gray-500 !mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                {solicitacao?.empresa?.nome}
                {solicitacao?.empresa?.codigo && (
                  <code className="!text-[10px] !bg-gray-100 !px-1 !py-0.5 !rounded">
                    {solicitacao.empresa.codigo}
                  </code>
                )}
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {/* Body */}
        <ModalBody className="!py-4 max-h-[65vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-5">
              {/* Tags skeleton */}
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-md" />
                ))}
              </div>

              {/* Descrição skeleton */}
              <div className="bg-gray-50 rounded-lg p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>

              {/* Requisitos skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Skeleton className="h-4 w-40 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Skeleton className="h-4 w-36 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>

              {/* Atividades skeleton */}
              <div className="bg-gray-50 rounded-lg p-4">
                <Skeleton className="h-4 w-36 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>

              {/* Benefícios skeleton */}
              <div className="bg-green-50/50 rounded-lg p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-24 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <AlertCircle className="w-6 h-6 mb-2" />
              <p className="!text-sm !m-0">Erro ao carregar detalhes</p>
            </div>
          ) : vaga ? (
            <div className="space-y-5">
              {/* Info Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs">
                  <Briefcase className="w-3 h-3" />
                  {REGIME_LABELS[vaga.regimeDeTrabalho] ||
                    vaga.regimeDeTrabalho ||
                    "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                  <MapPin className="w-3 h-3" />
                  {MODALIDADE_LABELS[vaga.modalidade] ||
                    vaga.modalidade ||
                    "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs">
                  <Clock className="w-3 h-3" />
                  {JORNADA_LABELS[vaga.jornada] || vaga.jornada || "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs">
                  <User className="w-3 h-3" />
                  {SENIORIDADE_LABELS[vaga.senioridade] ||
                    vaga.senioridade ||
                    "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs">
                  <Users className="w-3 h-3" />
                  {vaga.numeroVagas || 1} vaga
                  {(vaga.numeroVagas || 1) > 1 ? "s" : ""}
                </span>
                {salarioText && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs">
                    <DollarSign className="w-3 h-3" />
                    {salarioText}
                  </span>
                )}
                {localizacaoText && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs">
                    <MapPin className="w-3 h-3" />
                    {localizacaoText}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs">
                  <Calendar className="w-3 h-3" />
                  Até {formatDate(vaga.inscricoesAte)}
                </span>
              </div>

              {/* Descrição */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="!text-sm !font-semibold !text-gray-700 !m-0 !mb-2">
                  Descrição
                </h3>
                <p className="!text-sm !text-gray-600 !m-0 whitespace-pre-wrap leading-relaxed">
                  {vaga.descricao || "Não informada"}
                </p>
              </div>

              {/* Requisitos */}
              {(vaga.requisitos?.obrigatorios?.length > 0 ||
                vaga.requisitos?.desejaveis?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vaga.requisitos?.obrigatorios?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="!text-sm !font-semibold !text-gray-700 !m-0 !mb-3">
                        Requisitos Obrigatórios
                      </h3>
                      <ItemList items={vaga.requisitos.obrigatorios} />
                    </div>
                  )}
                  {vaga.requisitos?.desejaveis?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="!text-sm !font-semibold !text-gray-700 !m-0 !mb-3">
                        Requisitos Desejáveis
                      </h3>
                      <ItemList items={vaga.requisitos.desejaveis} />
                    </div>
                  )}
                </div>
              )}

              {/* Atividades */}
              {(vaga.atividades?.principais?.length > 0 ||
                vaga.atividades?.extras?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vaga.atividades?.principais?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="!text-sm !font-semibold !text-gray-700 !m-0 !mb-3">
                        Atividades Principais
                      </h3>
                      <ItemList items={vaga.atividades.principais} />
                    </div>
                  )}
                  {vaga.atividades?.extras?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="!text-sm !font-semibold !text-gray-700 !m-0 !mb-3">
                        Atividades Extras
                      </h3>
                      <ItemList items={vaga.atividades.extras} />
                    </div>
                  )}
                </div>
              )}

              {/* Benefícios */}
              {vaga.beneficios?.lista?.length > 0 && (
                <div className="bg-green-50/50 rounded-lg p-4">
                  <h3 className="!text-sm !font-semibold !text-green-700 !m-0 !mb-3">
                    Benefícios
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {vaga.beneficios.lista.map(
                      (beneficio: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs"
                        >
                          {beneficio}
                        </span>
                      )
                    )}
                  </div>
                  {vaga.beneficios.observacoes && (
                    <p className="!text-xs !text-green-600 !mt-3 !m-0 !italic">
                      {vaga.beneficios.observacoes}
                    </p>
                  )}
                </div>
              )}

              {/* Observações */}
              {vaga.observacoes && (
                <div className="bg-amber-50/50 rounded-lg p-4">
                  <h3 className="!text-sm !font-semibold !text-amber-700 !m-0 !mb-2">
                    Observações
                  </h3>
                  <p className="!text-sm !text-amber-700 !m-0 whitespace-pre-wrap">
                    {vaga.observacoes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle className="w-6 h-6 mb-2" />
              <p className="!text-sm !m-0">Vaga não encontrada</p>
            </div>
          )}
        </ModalBody>

        {/* Footer */}
        {isPendente && (
          <ModalFooter className="!pt-3 border-t border-gray-100">
            <div className="flex items-center justify-end w-full gap-2">
              <ButtonCustom
                variant="danger"
                size="sm"
                onClick={handleRejeitar}
                disabled={isLoading || isAprovando}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Rejeitar
              </ButtonCustom>
              <ButtonCustom
                variant="primary"
                size="sm"
                onClick={handleAprovar}
                disabled={isLoading || isAprovando}
                isLoading={isAprovando}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Aprovar
              </ButtonCustom>
            </div>
          </ModalFooter>
        )}
      </ModalContentWrapper>
    </ModalCustom>
  );
}
