"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonCustom, EmptyState } from "@/components/ui/custom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  listAdminCompanyVacancies,
  type AdminCompanyVagaItem,
  type AdminCompanyPagination,
} from "@/api/empresas";
import { useTenantCompany } from "@/hooks/useTenantCompany";

const STATUS_LABELS: Record<string, string> = {
  RASCUNHO: "Rascunho",
  EM_ANALISE: "Em análise",
  PUBLICADO: "Publicada",
  DESPUBLICADA: "Despublicada",
  PAUSADA: "Pausada",
  ENCERRADA: "Encerrada",
  EXPIRADO: "Expirada",
};

const STATUS_TONES: Record<string, string> = {
  RASCUNHO: "bg-slate-100 text-slate-600 border border-slate-200",
  EM_ANALISE: "bg-amber-100 text-amber-700 border border-amber-200",
  PUBLICADO: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  DESPUBLICADA: "bg-orange-100 text-orange-700 border border-orange-200",
  PAUSADA: "bg-blue-100 text-blue-700 border border-blue-200",
  ENCERRADA: "bg-rose-100 text-rose-700 border border-rose-200",
  EXPIRADO: "bg-gray-200 text-gray-600 border border-gray-300",
};

const PAGE_SIZE = 10;

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  const minutes = Math.round(diffMs / (1000 * 60));
  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(days) < 30) {
    return formatter.format(days, "day");
  }
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) {
    return formatter.format(months, "month");
  }
  const years = Math.round(months / 12);
  return formatter.format(years, "year");
}

export function EmpresaVagasDashboard() {
  const {
    company,
    isLoading: isLoadingCompany,
    error: companyError,
    tenantId,
  } = useTenantCompany();

  const [vacancies, setVacancies] = useState<AdminCompanyVagaItem[]>([]);
  const [pagination, setPagination] = useState<AdminCompanyPagination | null>(null);
  const [isLoadingVacancies, setIsLoadingVacancies] = useState(false);
  const [vacanciesError, setVacanciesError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const plan = company?.plano ?? null;
  const vagasInfo = company?.vagas ?? null;

  const limitFromPlan = plan?.quantidadeVagas ?? 0;
  const limitFromUsage = vagasInfo?.limitePlano ?? 0;
  const totalLimit = limitFromUsage || limitFromPlan;
  const publishedCount = vagasInfo?.publicadas ?? 0;

  const hasLimitedPlan = totalLimit > 0;
  const remainingSlots = hasLimitedPlan ? Math.max(totalLimit - publishedCount, 0) : null;
  const hasReachedLimit = hasLimitedPlan && remainingSlots === 0;

  const planStatus = plan?.status ?? null;
  const hasActivePlan = Boolean(plan) && (planStatus ? planStatus === "ATIVO" : true);

  const fetchVacancies = useCallback(
    async (page = 1) => {
      if (!tenantId || !hasActivePlan) return;

      setIsLoadingVacancies(true);
      setVacanciesError(null);

      try {
        const response = await listAdminCompanyVacancies(
          tenantId,
          { page, pageSize: PAGE_SIZE }
        );

        if ("data" in response) {
          setVacancies(response.data ?? []);
          setPagination(response.pagination ?? null);
        } else {
          const message = response?.message ?? "Erro ao carregar vagas da empresa.";
          setVacancies([]);
          setVacanciesError(message);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as vagas da sua empresa.";
        setVacancies([]);
        setVacanciesError(message);
      } finally {
        setIsLoadingVacancies(false);
      }
    },
    [tenantId, hasActivePlan]
  );

  useEffect(() => {
    if (!hasActivePlan) return;
    setCurrentPage(1);
  }, [hasActivePlan]);

  useEffect(() => {
    if (!hasActivePlan) return;
    fetchVacancies(currentPage);
  }, [fetchVacancies, currentPage, hasActivePlan]);

  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.total ?? vacancies.length;

  const headerContent = useMemo(() => {
    if (isLoadingCompany) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      );
    }

    if (companyError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar sua empresa</AlertTitle>
          <AlertDescription>
            {companyError}
            <br />
            Tente atualizar a página ou entre em contato com o suporte.
          </AlertDescription>
        </Alert>
      );
    }

    if (!company) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Empresa não encontrada</AlertTitle>
          <AlertDescription>
            Não conseguimos identificar a empresa vinculada ao seu usuário. Configure o tenant e tente novamente.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Vagas da empresa</h1>
            <p className="text-sm text-slate-600">
              Gerencie as vagas publicadas, em análise ou em andamento da sua empresa.
            </p>
          </div>
          <ButtonCustom
            variant="primary"
            size="md"
            icon="Plus"
            asChild
            disabled={hasReachedLimit || !hasActivePlan}
            className={cn(
              hasReachedLimit && "opacity-50 cursor-not-allowed",
              "md:self-center"
            )}
          >
            <Link href="/dashboard/vagas/cadastrar">
              {hasReachedLimit ? "Limite atingido" : "Cadastrar vaga"}
            </Link>
          </ButtonCustom>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Plano atual
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {plan?.nome ?? "Sem assinatura"}
            </p>
            <p className="text-sm text-slate-500">
              Status: {planStatus ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Vagas publicadas/em análise
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {publishedCount}
            </p>
            <p className="text-sm text-slate-500">
              Inclui vagas em análise e publicadas.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Limite disponível
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {hasLimitedPlan ? remainingSlots : "Ilimitado"}
            </p>
            <p className="text-sm text-slate-500">
              Limite do plano: {hasLimitedPlan ? totalLimit : "—"}
            </p>
          </div>
        </div>
      </div>
    );
  }, [
    company,
    companyError,
    hasActivePlan,
    hasLimitedPlan,
    hasReachedLimit,
    isLoadingCompany,
    plan?.nome,
    planStatus,
    publishedCount,
    remainingSlots,
    totalLimit,
  ]);

  if (isLoadingCompany) {
    return (
      <div className="space-y-6">
        {headerContent}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-8">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (companyError) {
    return <div className="space-y-6">{headerContent}</div>;
  }

  if (!company) {
    return <div className="space-y-6">{headerContent}</div>;
  }

  if (!hasActivePlan) {
    return (
      <div className="space-y-6">
        {headerContent}
        <EmptyState
          illustration="subscription"
          title="Você não possui um plano ativo"
          description="Para publicar e acompanhar vagas, você precisa contratar um plano de assinatura."
          actions={
            <ButtonCustom variant="primary" size="md" asChild icon="Sparkles">
              <Link href="/dashboard/assinaturas">Clique aqui e assine agora</Link>
            </ButtonCustom>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {headerContent}

      {hasReachedLimit && (
        <Alert variant="destructive" className="border-rose-200 bg-rose-50">
          <AlertTitle>Limite de vagas atingido</AlertTitle>
          <AlertDescription>
            Seu plano atual permite publicar até {totalLimit} vagas simultaneamente. Para liberar espaço, encerre alguma vaga ativa ou atualize seu plano.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-3xl border border-gray-200/80 bg-white p-2">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70">
              <TableHead className="w-[30%] text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vaga
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Código
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Criada em
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Atualizada em
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Inscrições até
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingVacancies && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-center py-10">
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoadingVacancies && vacancies.length === 0 && !vacanciesError && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    size="sm"
                    illustration="companyDetails"
                    title="Nenhuma vaga cadastrada ainda"
                    description="As vagas que você publicar aparecerão aqui. Use o botão acima para cadastrar a sua primeira vaga."
                  />
                </TableCell>
              </TableRow>
            )}

            {!isLoadingVacancies && vacanciesError && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Alert variant="destructive">
                    <AlertTitle>Erro ao carregar vagas</AlertTitle>
                    <AlertDescription>{vacanciesError}</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            )}

            {!isLoadingVacancies && !vacanciesError &&
              vacancies.map((vaga) => {
                const statusKey = vaga.status?.toUpperCase?.() ?? "";
                const statusLabel = STATUS_LABELS[statusKey] ?? vaga.status ?? "—";
                const statusTone = STATUS_TONES[statusKey] ??
                  "bg-slate-100 text-slate-600 border border-slate-200";

                return (
                  <TableRow key={vaga.id} className="hover:bg-slate-50/80">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {vaga.titulo || "Vaga sem título"}
                        </span>
                        {vaga.descricao && (
                          <span className="text-xs text-slate-500 line-clamp-2">
                            {vaga.descricao}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-600">
                      {vaga.codigo ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          statusTone
                        )}
                      >
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex flex-col">
                        <span>{formatDate(vaga.inseridaEm)}</span>
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(vaga.inseridaEm)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex flex-col">
                        <span>{formatDate(vaga.atualizadoEm)}</span>
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(vaga.atualizadoEm)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {vaga.inscricoesAte ? formatDate(vaga.inscricoesAte) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-gray-200/70 bg-gray-50/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1} até
              {" "}
              {Math.min(currentPage * PAGE_SIZE, totalItems)} de {totalItems} vagas
            </div>
            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              >
                Anterior
              </ButtonCustom>
              <span className="text-xs font-medium text-slate-600">
                Página {currentPage} de {totalPages}
              </span>
              <ButtonCustom
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
              >
                Próxima
              </ButtonCustom>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
