"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ButtonCustom,
  EmptyState,
  FilterBar,
} from "@/components/ui/custom";
import { toastCustom } from "@/components/ui/custom/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { aplicarVaga, listCurriculos } from "@/api/candidatos";
import { usePublicVagas } from "@/theme/website/components/career-opportunities/hooks/usePublicVagas";
import type { JobFilters } from "@/theme/website/components/career-opportunities/types";
import type { JobData } from "@/theme/website/components/career-opportunities/types";
import { ViewVagaModal } from "./components/ViewVagaModal";
import { AlunoVagaCard } from "./components/AlunoVagaCard";
import {
  SelectCurriculoApplyModal,
  type CurriculoApplyOption,
} from "./components/SelectCurriculoApplyModal";

const PAGE_SIZE = 10;

function isUuid(value: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    value,
  );
}

function getDefaultCurriculoId(raw: unknown): string | null {
  if (!Array.isArray(raw)) return null;
  const items = raw.filter((item) => item && typeof item === "object") as Array<
    Record<string, any>
  >;
  const principal = items.find(
    (c) => c.principal === true && typeof c.id === "string",
  );
  if (principal?.id) return principal.id;
  const first = items.find((c) => typeof c.id === "string");
  return first?.id ?? null;
}

function coerceCurriculoApplyOption(value: unknown): CurriculoApplyOption | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || typeof v.titulo !== "string") return null;
  return {
    id: v.id,
    titulo: v.titulo,
    resumo: typeof v.resumo === "string" ? v.resumo : null,
    principal: typeof v.principal === "boolean" ? v.principal : undefined,
  };
}

function buildJobFilters({
  search,
  modalidade,
  regime,
  senioridade,
}: {
  search: string;
  modalidade: string | null;
  regime: string | null;
  senioridade: string | null;
}): JobFilters {
  return {
    busca: search,
    categorias: [],
    modalidades: modalidade ? [modalidade] : [],
    tiposContrato: regime ? [regime] : [],
    niveis: senioridade ? [senioridade] : [],
    apenasDestaque: false,
    apenasVagasPCD: false,
  };
}

export function AlunoVagasView() {
  const queryClient = useQueryClient();
  const [viewVagaIdOrSlug, setViewVagaIdOrSlug] = useState<string | null>(null);
  const [viewVagaInitialJob, setViewVagaInitialJob] = useState<JobData | null>(
    null,
  );
  const [applyingVagaId, setApplyingVagaId] = useState<string | null>(null);
  const [applyTarget, setApplyTarget] = useState<{
    vagaId: string;
    vagaTitulo?: string | null;
  } | null>(null);
  const [selectedCurriculoId, setSelectedCurriculoId] = useState<string | null>(
    null,
  );

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  const [pendingModalidade, setPendingModalidade] = useState<string | null>(
    null,
  );
  const [appliedModalidade, setAppliedModalidade] = useState<string | null>(
    null,
  );

  const [pendingRegime, setPendingRegime] = useState<string | null>(null);
  const [appliedRegime, setAppliedRegime] = useState<string | null>(null);

  const [pendingSenioridade, setPendingSenioridade] = useState<string | null>(
    null,
  );
  const [appliedSenioridade, setAppliedSenioridade] = useState<string | null>(
    null,
  );

  const filters = useMemo(() => {
    return buildJobFilters({
      search: appliedSearchTerm,
      modalidade: appliedModalidade,
      regime: appliedRegime,
      senioridade: appliedSenioridade,
    });
  }, [appliedModalidade, appliedRegime, appliedSearchTerm, appliedSenioridade]);

  const {
    filteredData,
    isLoading,
    error,
    totalCount,
    currentPage,
    totalPages,
    setPage,
    refetch,
  } = usePublicVagas(filters, PAGE_SIZE, true);

  const curriculosQuery = useQuery({
    queryKey: ["aluno-candidato", "curriculos", "for-apply"],
    queryFn: () => listCurriculos({ cache: "no-store" }),
    staleTime: 60 * 1000,
    retry: 1,
  });

  const curriculosOptions = useMemo<CurriculoApplyOption[]>(() => {
    if (!Array.isArray(curriculosQuery.data)) return [];
    return curriculosQuery.data
      .map(coerceCurriculoApplyOption)
      .filter((v): v is CurriculoApplyOption => Boolean(v));
  }, [curriculosQuery.data]);

  const defaultCurriculoId = useMemo(() => {
    return getDefaultCurriculoId(curriculosQuery.data);
  }, [curriculosQuery.data]);

  const applyMutation = useMutation({
    mutationFn: async (payload: {
      vagaId: string;
      curriculoId: string;
      vagaTitulo?: string | null;
    }) => {
      return aplicarVaga({ vagaId: payload.vagaId, curriculoId: payload.curriculoId });
    },
    onSuccess: (_, variables) => {
      setApplyingVagaId(null);
      setApplyTarget(null);
      setSelectedCurriculoId(null);

      queryClient.setQueryData(
        ["aluno-candidato", "candidaturas", "verificar", variables.vagaId],
        { hasApplied: true },
      );
      queryClient.invalidateQueries({
        queryKey: [
          "aluno-candidato",
          "candidaturas",
          "verificar",
          variables.vagaId,
        ],
      });

      toastCustom.success({
        title: "Candidatura enviada",
        description: variables.vagaTitulo
          ? `Sua candidatura para "${variables.vagaTitulo}" foi registrada com sucesso.`
          : "Sua candidatura foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      setApplyingVagaId(null);

      const code = error?.details?.code || error?.code;
      const message = error?.details?.message || error?.message;

      if (code === "APPLY_ERROR" && typeof message === "string") {
        toastCustom.error({
          title: "Não foi possível se candidatar",
          description: message,
        });
        return;
      }

      toastCustom.error({
        title: "Erro ao se candidatar",
        description:
          typeof message === "string" && message.length > 0
            ? message
            : "Tente novamente em instantes.",
      });
    },
  });

  const handleApply = useCallback(
    (vagaId: string, vagaTitulo?: string | null) => {
      if (!vagaId || !isUuid(vagaId)) {
        toastCustom.error({
          title: "Vaga inválida",
          description:
            "Não foi possível identificar esta vaga para candidatura.",
        });
        return;
      }

      if (applyMutation.isPending) {
        return;
      }

      if (curriculosQuery.isLoading) {
        toastCustom.info({
          title: "Carregando currículos",
          description: "Aguarde um instante e tente novamente.",
        });
        return;
      }

      if (curriculosQuery.isError) {
        toastCustom.error({
          title: "Erro ao carregar currículos",
          description: "Tente novamente em instantes.",
        });
        return;
      }

      if (curriculosOptions.length === 0) {
        toastCustom.error({
          title: "Nenhum currículo encontrado",
          description: "Crie um currículo para conseguir se candidatar às vagas.",
          linkText: "Criar currículo",
          linkHref: "/dashboard/curriculo/cadastrar",
        });
        return;
      }

      if (curriculosOptions.length === 1) {
        setApplyingVagaId(vagaId);
        applyMutation.mutate({
          vagaId,
          curriculoId: curriculosOptions[0].id,
          vagaTitulo,
        });
        return;
      }

      const nextDefault =
        defaultCurriculoId ??
        curriculosOptions.find((c) => c.principal)?.id ??
        curriculosOptions[0]?.id ??
        null;

      setSelectedCurriculoId(nextDefault);
      setApplyTarget({ vagaId, vagaTitulo });
    },
    [
      applyMutation,
      applyMutation.isPending,
      curriculosQuery.isError,
      curriculosQuery.isLoading,
      curriculosOptions,
      defaultCurriculoId,
    ],
  );

  const applyFilters = useCallback(() => {
    setAppliedSearchTerm(pendingSearchTerm);
    setAppliedModalidade(pendingModalidade);
    setAppliedRegime(pendingRegime);
    setAppliedSenioridade(pendingSenioridade);
    setPage(1);
  }, [
    pendingModalidade,
    pendingRegime,
    pendingSearchTerm,
    pendingSenioridade,
    setPage,
  ]);

  const clearAll = useCallback(() => {
    setPendingSearchTerm("");
    setAppliedSearchTerm("");
    setPendingModalidade(null);
    setAppliedModalidade(null);
    setPendingRegime(null);
    setAppliedRegime(null);
    setPendingSenioridade(null);
    setAppliedSenioridade(null);
    setPage(1);
  }, [setPage]);

  const showEmptyState = !isLoading && !error && filteredData.length === 0;
  const showingRange = useMemo(() => {
    if (totalCount <= 0) return null;
    const start = Math.min(totalCount, (currentPage - 1) * PAGE_SIZE + 1);
    const end = Math.min(totalCount, currentPage * PAGE_SIZE);
    return { start, end };
  }, [currentPage, totalCount]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto]"
            fields={[
              {
                key: "modalidade",
                label: "Modalidade",
                type: "select",
                placeholder: "Selecionar",
                options: [
                  { value: "PRESENCIAL", label: "Presencial" },
                  { value: "REMOTO", label: "Remoto" },
                  { value: "HIBRIDO", label: "Híbrido" },
                ],
              },
              {
                key: "regime",
                label: "Regime",
                type: "select",
                placeholder: "Selecionar",
                options: [
                  { value: "CLT", label: "CLT" },
                  { value: "PJ", label: "PJ" },
                  { value: "ESTAGIO", label: "Estágio" },
                  { value: "TEMPORARIO", label: "Temporário" },
                  { value: "HOME_OFFICE", label: "Home office" },
                  { value: "JOVEM_APRENDIZ", label: "Jovem aprendiz" },
                ],
              },
              {
                key: "senioridade",
                label: "Senioridade",
                type: "select",
                placeholder: "Selecionar",
                options: [
                  { value: "ABERTO", label: "Aberto" },
                  { value: "ESTAGIARIO", label: "Estagiário" },
                  { value: "JUNIOR", label: "Júnior" },
                  { value: "PLENO", label: "Pleno" },
                  { value: "SENIOR", label: "Sênior" },
                  { value: "ESPECIALISTA", label: "Especialista" },
                  { value: "LIDER", label: "Líder" },
                ],
              },
            ]}
            values={{
              modalidade: pendingModalidade,
              regime: pendingRegime,
              senioridade: pendingSenioridade,
            }}
            onChange={(key, value) => {
              const next = (value as string) || null;

              if (key === "modalidade") {
                setPendingModalidade(next);
                if (value === null) {
                  setAppliedModalidade(null);
                  setPage(1);
                }
              }

              if (key === "regime") {
                setPendingRegime(next);
                if (value === null) {
                  setAppliedRegime(null);
                  setPage(1);
                }
              }

              if (key === "senioridade") {
                setPendingSenioridade(next);
                if (value === null) {
                  setAppliedSenioridade(null);
                  setPage(1);
                }
              }
            }}
            onClearAll={clearAll}
            search={{
              label: "Pesquisar vaga",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar por título, empresa ou cidade...",
              helperText:
                "Dica: a busca só é enviada para a API com 3+ caracteres.",
              helperPlacement: "tooltip",
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyFilters();
                }
              },
            }}
            rightActions={
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={applyFilters}
                disabled={isLoading}
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <EmptyState
            title="Erro ao carregar vagas"
            description={error}
            illustration="fileNotFound"
            actions={
              <ButtonCustom
                variant="primary"
                onClick={refetch}
                disabled={isLoading}
              >
                Tentar novamente
              </ButtonCustom>
            }
          />
        </div>
      ) : showEmptyState ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <EmptyState
            title="Nenhuma vaga encontrada"
            description="Ajuste a busca ou limpe os filtros para ver mais resultados."
            illustration="fileNotFound"
            actions={
              <ButtonCustom variant="outline" onClick={clearAll}>
                Limpar filtros
              </ButtonCustom>
            }
          />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`vaga-skeleton-${idx}`}
                      className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-14 w-14 rounded-2xl" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-5 w-72" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-28 rounded-full" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-end gap-2 pt-2">
                        <Skeleton className="h-10 w-28 rounded-md" />
                        <Skeleton className="h-10 w-32 rounded-md" />
                      </div>
                    </div>
                  ))
                : filteredData.map((job, index) => (
                    <AlunoVagaCard
                      key={job.slug || job.id}
                      job={job}
                      index={index}
                      onViewDetails={(selectedJob) => {
                        const idOrSlug = selectedJob.slug || selectedJob.id;
                        setViewVagaInitialJob(selectedJob);
                        setViewVagaIdOrSlug(idOrSlug);
                      }}
                      onApply={(jobId) => handleApply(jobId, job.titulo)}
                      isApplying={applyMutation.isPending}
                      isApplyingThis={applyMutation.isPending && applyingVagaId === job.id}
                    />
                  ))}
            </div>
          </div>

          {!isLoading && totalCount > 0 && (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {showingRange && (
                  <span>
                    Mostrando {showingRange.start} a {showingRange.end} de{" "}
                    {totalCount}
                  </span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                  >
                    Anterior
                  </ButtonCustom>

                  {visiblePages[0] > 1 && (
                    <>
                      <ButtonCustom
                        variant={currentPage === 1 ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setPage(1)}
                        className="h-8 w-8 p-0"
                      >
                        1
                      </ButtonCustom>
                      {visiblePages[0] > 2 && (
                        <span className="text-gray-400">...</span>
                      )}
                    </>
                  )}

                  {visiblePages.map((page) => (
                    <ButtonCustom
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </ButtonCustom>
                  ))}

                  {visiblePages[visiblePages.length - 1] < totalPages && (
                    <>
                      {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <ButtonCustom
                        variant={currentPage === totalPages ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        className="h-8 w-8 p-0"
                      >
                        {totalPages}
                      </ButtonCustom>
                    </>
                  )}

                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    Próxima
                  </ButtonCustom>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ViewVagaModal
        isOpen={Boolean(viewVagaIdOrSlug)}
        idOrSlug={viewVagaIdOrSlug}
        initialJob={viewVagaInitialJob}
        onApplyClick={(vagaId, vagaTitulo) => {
          setViewVagaIdOrSlug(null);
          setViewVagaInitialJob(null);
          handleApply(vagaId, vagaTitulo);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setViewVagaIdOrSlug(null);
            setViewVagaInitialJob(null);
          }
        }}
      />

      <SelectCurriculoApplyModal
        isOpen={Boolean(applyTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setApplyTarget(null);
            setSelectedCurriculoId(null);
          }
        }}
        vagaTitulo={applyTarget?.vagaTitulo}
        curriculos={curriculosOptions}
        selectedCurriculoId={selectedCurriculoId}
        onSelectCurriculoId={setSelectedCurriculoId}
        isSubmitting={applyMutation.isPending}
        onConfirm={() => {
          if (!applyTarget?.vagaId || !selectedCurriculoId) return;
          if (applyMutation.isPending) return;
          setApplyingVagaId(applyTarget.vagaId);
          applyMutation.mutate({
            vagaId: applyTarget.vagaId,
            curriculoId: selectedCurriculoId,
            vagaTitulo: applyTarget.vagaTitulo,
          });
        }}
      />
    </div>
  );
}
