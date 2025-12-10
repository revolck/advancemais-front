"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PaymentAlertModal } from "./PaymentAlertModal";
import {
  Briefcase,
  Users,
  FileText,
  Bell,
  ChevronRight,
  Clock,
  CreditCard,
  CheckCircle2,
  XCircle,
  PauseCircle,
  AlertTriangle,
} from "lucide-react";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { getVisaoGeralEmpresa } from "@/api/empresas/dashboard";
import type { CandidaturaRecente, NotificacaoRecente } from "@/api/empresas/dashboard/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Cores e ícones para status do plano (UX Writing)
const PLANO_STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string; tooltip: string }> = {
  ATIVO: { 
    color: "text-emerald-600 bg-emerald-50", 
    icon: <CheckCircle2 className="size-4" />,
    label: "Ativo",
    tooltip: "Tudo certo! Seu plano está ativo."
  },
  SUSPENSO: { 
    color: "text-amber-600 bg-amber-50", 
    icon: <PauseCircle className="size-4" />,
    label: "Suspenso",
    tooltip: "Plano suspenso. Regularize o pagamento para continuar."
  },
  EXPIRADO: { 
    color: "text-red-600 bg-red-50", 
    icon: <XCircle className="size-4" />,
    label: "Expirado",
    tooltip: "Plano expirado. Renove para voltar a publicar vagas."
  },
  CANCELADO: { 
    color: "text-gray-600 bg-gray-50", 
    icon: <XCircle className="size-4" />,
    label: "Cancelado",
    tooltip: "Plano cancelado. Acesse Assinatura para reativar."
  },
};

// Cores para tipos de notificação
const NOTIFICACAO_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  VAGA_APROVADA: { color: "bg-emerald-100 text-emerald-600", icon: <CheckCircle2 className="size-4" /> },
  VAGA_REJEITADA: { color: "bg-red-100 text-red-600", icon: <XCircle className="size-4" /> },
  NOVO_CANDIDATO: { color: "bg-blue-100 text-blue-600", icon: <Users className="size-4" /> },
  DEFAULT: { color: "bg-gray-100 text-gray-600", icon: <Bell className="size-4" /> },
};

function CandidaturaCard({ candidatura }: { candidatura: CandidaturaRecente }) {
  const timeAgo = formatDistanceToNow(new Date(candidatura.aplicadaEm), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
      <div className="p-2 rounded-full bg-blue-100">
        <Users className="size-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="!text-sm !font-medium !text-gray-900 !mb-0.5 truncate">
          {candidatura.candidatoNome}
        </p>
        <p className="!text-xs !text-gray-500 !mb-0 truncate">
          {candidatura.vagaTitulo} • {candidatura.vagaCodigo}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          {candidatura.status}
        </span>
        <p className="!text-xs !text-gray-400 !mb-0 !mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}

function NotificacaoCard({ notificacao }: { notificacao: NotificacaoRecente }) {
  const config = NOTIFICACAO_CONFIG[notificacao.tipo] || NOTIFICACAO_CONFIG.DEFAULT;
  const timeAgo = formatDistanceToNow(new Date(notificacao.criadoEm), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border transition-colors",
      notificacao.status === "NAO_LIDA" 
        ? "border-blue-200 bg-blue-50/50" 
        : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
    )}>
      <div className={cn("p-2 rounded-full shrink-0", config.color)}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="!text-sm !font-medium !text-gray-900 !mb-0.5">
          {notificacao.titulo}
        </p>
        <p className="!text-xs !text-gray-500 !mb-1 line-clamp-2">
          {notificacao.mensagem}
        </p>
        <p className="!text-xs !text-gray-400 !mb-0">{timeAgo}</p>
      </div>
      {notificacao.status === "NAO_LIDA" && (
        <span className="size-2 rounded-full bg-blue-500 shrink-0 mt-2" />
      )}
    </div>
  );
}

// Chave para localStorage - controlar se modal já foi mostrada na sessão
const PAYMENT_MODAL_DISMISSED_KEY = "payment_modal_dismissed";

/**
 * Visão geral para Empresa
 * Inclui: dados do plano, resumo de vagas, candidaturas recentes, notificações
 */
export function VisaoGeralEmpresa() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["empresa", "visao-geral"],
    queryFn: () => getVisaoGeralEmpresa(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const data = response?.data;

  // Verificar se deve mostrar modal de pagamento
  useEffect(() => {
    if (!data?.plano) return;

    const status = data.plano.status;
    const needsPaymentAlert = status === "SUSPENSO" || status === "CANCELADO" || status === "EXPIRADO";
    
    if (needsPaymentAlert) {
      // Para CANCELADO/EXPIRADO: sempre mostrar (não pode fechar)
      if (status === "CANCELADO" || status === "EXPIRADO") {
        setShowPaymentModal(true);
        return;
      }
      
      // Para SUSPENSO: verificar se já foi dispensada nesta sessão
      const dismissed = sessionStorage.getItem(PAYMENT_MODAL_DISMISSED_KEY);
      if (!dismissed) {
        setShowPaymentModal(true);
      }
    }
  }, [data?.plano]);

  const handleClosePaymentModal = () => {
    // Só permite fechar para SUSPENSO
    if (data?.plano?.status === "SUSPENSO") {
      sessionStorage.setItem(PAYMENT_MODAL_DISMISSED_KEY, "true");
      setShowPaymentModal(false);
    }
  };

  const primaryMetrics = useMemo((): StatisticCard[] => {
    if (!data) return [];

    return [
      {
        icon: Briefcase,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: data.resumoVagas.publicadas,
        label: "Vagas Publicadas",
        cardBg: "bg-emerald-50/50",
      },
      {
        icon: FileText,
        iconBg: "bg-gray-100 text-gray-600",
        value: data.resumoVagas.rascunho,
        label: "Rascunhos",
        cardBg: "bg-gray-50/50",
      },
      {
        icon: Users,
        iconBg: "bg-blue-100 text-blue-600",
        value: data.estatisticas.totalCandidaturas,
        label: "Total de Candidaturas",
        cardBg: "bg-blue-50/50",
      },
      {
        icon: Clock,
        iconBg: "bg-indigo-100 text-indigo-600",
        value: data.estatisticas.candidaturasNovas,
        label: "Novas (7 dias)",
        cardBg: "bg-indigo-50/50",
      },
    ];
  }, [data]);

  const planoStatusConfig = data?.plano 
    ? PLANO_STATUS_CONFIG[data.plano.status] || PLANO_STATUS_CONFIG.ATIVO
    : null;

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        {/* Header Skeleton */}
        <div className="rounded-xl bg-white p-6 border border-gray-200/60">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        {/* Metrics Skeleton */}
        <div className="rounded-xl bg-white p-4 md:p-5 border border-gray-200/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl p-6 border border-gray-200/60 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="size-14 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Erro ao carregar dados"
        description="Não foi possível carregar os dados da visão geral. Tente novamente."
        illustration="fileNotFound"
        actions={
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-[var(--primary-color)] hover:underline"
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <>
      {/* Modal de alerta de pagamento */}
      {data.plano && (data.plano.status === "SUSPENSO" || data.plano.status === "CANCELADO" || data.plano.status === "EXPIRADO") && (
        <PaymentAlertModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          status={data.plano.status as "SUSPENSO" | "CANCELADO" | "EXPIRADO"}
          planoNome={data.plano.nome}
        />
      )}

      <div className="space-y-8 pb-8">
        {/* Card do Plano */}
        {data.plano && (() => {
        const cobrancaDate = data.plano.proximaCobranca 
          ? new Date(data.plano.proximaCobranca) 
          : null;
        
        // Status baseado na API:
        // SUSPENSO = dentro dos 5 dias de tolerância (pagamento pendente)
        // CANCELADO/EXPIRADO = tolerância expirou (bloqueado)
        const isPagamentoPendente = data.plano.status === "SUSPENSO";
        const isBloqueado = data.plano.status === "CANCELADO" || data.plano.status === "EXPIRADO";
        
        // Calcular dias restantes para regularização (grace period)
        const graceDate = data.plano.graceUntil ? new Date(data.plano.graceUntil) : null;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação justa
        
        // Calcular diferença em dias
        const diasRestantesCalc = graceDate ? differenceInCalendarDays(graceDate, hoje) : null;
        const dataLimite = graceDate ? format(graceDate, "dd/MM/yyyy", { locale: ptBR }) : null;
        
        // Construir mensagem dinâmica para tooltip (UX Writing)
        let tooltipPendente: string;
        if (diasRestantesCalc !== null && diasRestantesCalc > 1 && dataLimite) {
          // Mais de 1 dia restante - mostrar prazo
          tooltipPendente = `Não identificamos seu pagamento. Regularize até ${dataLimite} (${diasRestantesCalc} dias) para manter seu plano ativo.`;
        } else {
          // 1 dia ou menos (urgente) - mensagem única
          tooltipPendente = "Não identificamos seu pagamento. Regularize hoje para continuar usando o sistema.";
        }
        
        // Determinar qual config usar
        const statusConfig = isBloqueado 
          ? { 
              color: "text-red-600 bg-red-50", 
              icon: <XCircle className="size-4" />,
              label: "Cancelado",
              tooltip: "Plano cancelado por inadimplência. Acesse Assinatura para reativar."
            }
          : isPagamentoPendente
          ? {
              color: "text-amber-600 bg-amber-50",
              icon: <AlertTriangle className="size-4" />,
              label: "Pagamento Pendente",
              tooltip: tooltipPendente
            }
          : planoStatusConfig;

        return (
          <TooltipProvider>
            <div className="rounded-xl bg-white p-6 border border-gray-200/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    isBloqueado ? "bg-red-100" : isPagamentoPendente ? "bg-amber-100" : "bg-violet-100"
                  )}>
                    <CreditCard className={cn(
                      "size-6",
                      isBloqueado ? "text-red-600" : isPagamentoPendente ? "text-amber-600" : "text-violet-600"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="!text-lg !font-semibold !text-gray-900 !mb-0">
                        {data.plano.nome}
                      </h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-help",
                            statusConfig?.color
                          )}>
                            {statusConfig?.icon}
                            {statusConfig?.label}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8} className="max-w-72 p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-lg",
                                isBloqueado ? "bg-red-500/20" : isPagamentoPendente ? "bg-amber-500/20" : "bg-white/10"
                              )}>
                                <CreditCard className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-white">
                                Status do Plano
                              </span>
                            </div>
                            <p className="text-white/80 text-xs leading-relaxed">
                              {statusConfig?.tooltip}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="!text-2xl !font-bold !text-blue-600 !mb-0">
                      {data.resumoVagas.publicadas}
                    </p>
                    <p className="!text-xs !text-gray-500 !mb-0">Publicadas</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-6">
                    <p className="!text-2xl !font-bold !text-emerald-600 !mb-0">
                      {data.plano.vagasDisponiveis}
                    </p>
                    <p className="!text-xs !text-gray-500 !mb-0">Disponíveis</p>
                  </div>
                  {cobrancaDate && (
                    <div className="text-center border-l border-gray-200 pl-6">
                      <p className={cn(
                        "!text-sm !font-medium !mb-0",
                        isPagamentoPendente || isBloqueado ? "!text-red-600" : "!text-gray-900"
                      )}>
                        {cobrancaDate.toLocaleDateString("pt-BR")}
                      </p>
                      <p className={cn(
                        "!text-xs !mb-0",
                        isPagamentoPendente || isBloqueado ? "!text-red-500" : "!text-gray-500"
                      )}>
                        {isPagamentoPendente || isBloqueado ? "Vencido" : "Próxima Cobrança"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TooltipProvider>
        );
      })()}

      {/* Métricas Principais */}
      <div className="rounded-xl bg-white p-4 md:p-5 space-y-4">
        <CardsStatistics
          cards={primaryMetrics}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>

      {/* Candidaturas Recentes e Notificações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidaturas Recentes */}
        <div className="rounded-xl bg-white border border-gray-200/60 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="size-4 text-blue-600" />
              </div>
              <h3 className="!text-base !font-semibold !text-gray-900 !mb-0">
                Candidaturas Recentes
              </h3>
            </div>
            <Link 
              href="/dashboard/empresas/candidatos"
              className="text-sm text-[var(--primary-color)] hover:underline flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {data.candidaturasRecentes.length > 0 ? (
              data.candidaturasRecentes.map((candidatura) => (
                <CandidaturaCard key={candidatura.id} candidatura={candidatura} />
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="size-10 text-gray-300 mx-auto mb-3" />
                <p className="!text-sm !text-gray-500 !mb-0">
                  Nenhuma candidatura recente
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notificações Recentes */}
        <div className="rounded-xl bg-white border border-gray-200/60 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Bell className="size-4 text-amber-600" />
              </div>
              <h3 className="!text-base !font-semibold !text-gray-900 !mb-0">
                Notificações Recentes
              </h3>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {data.notificacoesRecentes.length > 0 ? (
              data.notificacoesRecentes.map((notificacao) => (
                <NotificacaoCard key={notificacao.id} notificacao={notificacao} />
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="size-10 text-gray-300 mx-auto mb-3" />
                <p className="!text-sm !text-gray-500 !mb-0">
                  Nenhuma notificação recente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
