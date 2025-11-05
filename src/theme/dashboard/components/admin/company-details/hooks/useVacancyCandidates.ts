import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getAdminCompanyVacancyById } from "@/api/empresas/admin/vacancy-details";
import type { AdminCompanyVagaItem } from "@/api/empresas/admin/types";

interface UseVacancyCandidatesProps {
  vacancies: AdminCompanyVagaItem[];
}

interface VacancyWithCandidates extends AdminCompanyVagaItem {
  candidaturas?: AdminCompanyVagaItem["candidaturas"];
  candidatesLoaded?: boolean;
}

export function useVacancyCandidates({ vacancies }: UseVacancyCandidatesProps) {
  const queryClient = useQueryClient();

  const [vacanciesWithCandidates, setVacanciesWithCandidates] = useState<
    VacancyWithCandidates[]
  >([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [errorStates, setErrorStates] = useState<Record<string, string>>({});

  const getVacancyQueryKey = useCallback(
    (vacancyId: string) => ["admin-company-vacancy", vacancyId] as const,
    []
  );

  const applyVacancyData = useCallback(
    (vacancyId: string, data?: AdminCompanyVagaItem) => {
      setVacanciesWithCandidates((prev) =>
        prev.map((vacancy) =>
          vacancy.id === vacancyId
            ? {
                ...vacancy,
                ...(data ?? {}),
                candidatesLoaded:
                  data !== undefined
                    ? true
                    : vacancy.candidatesLoaded ??
                      !!(
                        vacancy.candidaturas && vacancy.candidaturas.length > 0
                      ),
              }
            : vacancy
        )
      );
    },
    []
  );

  const loadVacancyCandidates = useCallback(
    async (vacancyId: string) => {
      console.log(`🔄 Tentando carregar candidatos da vaga ${vacancyId}...`);

      if (loadingStates[vacancyId]) {
        console.log(`⏳ Vaga ${vacancyId} já está em carregamento`);
        return;
      }

      const queryKey = getVacancyQueryKey(vacancyId);
      const cachedVacancy =
        queryClient.getQueryData<AdminCompanyVagaItem>(queryKey);

      if (cachedVacancy) {
        console.log(
          `📋 Usando cache para candidatos da vaga ${vacancyId}`,
          cachedVacancy.candidaturas?.length || 0
        );
        applyVacancyData(vacancyId, cachedVacancy);
        if (
          vacanciesWithCandidates.find((v) => v.id === vacancyId)
            ?.candidatesLoaded
        ) {
          return;
        }
      }

      console.log(`✅ Iniciando carregamento da vaga ${vacancyId}`);
      setLoadingStates((prev) => ({ ...prev, [vacancyId]: true }));
      setErrorStates((prev) => ({ ...prev, [vacancyId]: "" }));

      try {
        const fullVacancy = await queryClient.fetchQuery({
          queryKey,
          queryFn: () => getAdminCompanyVacancyById(vacancyId),
          staleTime: 5 * 60 * 1000,
          gcTime: 30 * 60 * 1000,
        });

        console.log(
          `🎉 Candidatos carregados para vaga ${vacancyId}:`,
          fullVacancy.candidaturas?.length || 0
        );

        queryClient.setQueryData(queryKey, fullVacancy);
        applyVacancyData(vacancyId, fullVacancy);
      } catch (error) {
        console.error(
          `❌ Erro ao carregar candidatos da vaga ${vacancyId}:`,
          error
        );
        setErrorStates((prev) => ({
          ...prev,
          [vacancyId]: "Erro ao carregar candidatos",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, [vacancyId]: false }));
      }
    },
    [
      applyVacancyData,
      getVacancyQueryKey,
      loadingStates,
      queryClient,
      vacanciesWithCandidates,
    ]
  );

  const loadCandidatesForVacanciesWithCandidates = useCallback(async () => {
    console.log("🔍 Verificando vagas para carregar candidatos...");
    console.log("Vagas recebidas:", vacancies.length);

    const vacanciesToLoad = vacancies.filter((vacancy) => {
      const hasCandidates =
        vacancy.candidaturasResumo?.total &&
        vacancy.candidaturasResumo.total > 0;
      const hasFullData =
        vacancy.candidaturas && vacancy.candidaturas.length > 0;
      const notLoading = !loadingStates[vacancy.id];
      const cachedVacancy = queryClient.getQueryData<AdminCompanyVagaItem>(
        getVacancyQueryKey(vacancy.id)
      );
      const notLoaded =
        !vacanciesWithCandidates.find((v) => v.id === vacancy.id)
          ?.candidatesLoaded && !cachedVacancy;

      console.log(`Vaga ${vacancy.id}:`, {
        hasCandidates,
        candidaturasResumo: vacancy.candidaturasResumo,
        hasFullData,
        candidaturas: vacancy.candidaturas?.length || 0,
        notLoading,
        cached: !!cachedVacancy,
        notLoaded,
      });

      return hasCandidates && !hasFullData && notLoading && notLoaded;
    });

    console.log("Vagas para carregar:", vacanciesToLoad.length);

    const limitedVacancies = vacanciesToLoad.slice(0, 3);

    if (limitedVacancies.length > 0) {
      console.log("🚀 Iniciando carregamento de candidatos...");
      const loadPromises = limitedVacancies.map((vacancy) =>
        loadVacancyCandidates(vacancy.id)
      );
      await Promise.allSettled(loadPromises);
    } else {
      console.log("ℹ️ Nenhuma vaga precisa de carregamento de candidatos");
    }
  }, [
    getVacancyQueryKey,
    loadVacancyCandidates,
    loadingStates,
    queryClient,
    vacancies,
    vacanciesWithCandidates,
  ]);

  useEffect(() => {
    const nextVacancies = vacancies.map((vacancy) => {
      const cachedVacancy = queryClient.getQueryData<AdminCompanyVagaItem>(
        getVacancyQueryKey(vacancy.id)
      );

      if (cachedVacancy) {
        return {
          ...vacancy,
          ...cachedVacancy,
          candidatesLoaded: true,
        };
      }

      return {
        ...vacancy,
        candidatesLoaded: !!(
          vacancy.candidaturas && vacancy.candidaturas.length > 0
        ),
      };
    });

    setVacanciesWithCandidates(nextVacancies);
  }, [getVacancyQueryKey, queryClient, vacancies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCandidatesForVacanciesWithCandidates();
    }, 500);

    return () => clearTimeout(timer);
  }, [loadCandidatesForVacanciesWithCandidates]);

  const forceLoadVacancyCandidates = useCallback(
    (vacancyId: string) => {
      loadVacancyCandidates(vacancyId);
    },
    [loadVacancyCandidates]
  );

  const isLoading = useMemo(() => {
    const statesLoading = Object.values(loadingStates).some(
      (loading) => loading
    );
    if (statesLoading) return true;

    return vacancies.some((vacancy) => {
      const queryKey = getVacancyQueryKey(vacancy.id);
      return queryClient.isFetching({ queryKey }) > 0;
    });
  }, [getVacancyQueryKey, loadingStates, queryClient, vacancies]);

  return {
    vacanciesWithCandidates,
    loadingStates,
    errorStates,
    loadVacancyCandidates: forceLoadVacancyCandidates,
    isLoading,
  };
}

