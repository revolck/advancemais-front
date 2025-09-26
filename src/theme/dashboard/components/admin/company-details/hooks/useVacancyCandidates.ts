import { useState, useEffect, useCallback } from "react";
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
  const [vacanciesWithCandidates, setVacanciesWithCandidates] = useState<
    VacancyWithCandidates[]
  >([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [errorStates, setErrorStates] = useState<Record<string, string>>({});

  // Função para carregar candidatos de uma vaga específica
  const loadVacancyCandidates = useCallback(
    async (vacancyId: string) => {
      console.log(`🔄 Tentando carregar candidatos da vaga ${vacancyId}...`);

      // Verificar se já está carregando ou já foi carregado
      if (
        loadingStates[vacancyId] ||
        vacanciesWithCandidates.find((v) => v.id === vacancyId)
          ?.candidatesLoaded
      ) {
        console.log(
          `⏭️ Vaga ${vacancyId} já está carregando ou já foi carregada`
        );
        return;
      }

      console.log(`✅ Iniciando carregamento da vaga ${vacancyId}`);
      setLoadingStates((prev) => ({ ...prev, [vacancyId]: true }));
      setErrorStates((prev) => ({ ...prev, [vacancyId]: "" }));

      try {
        const fullVacancy = await getAdminCompanyVacancyById(vacancyId);
        console.log(
          `🎉 Candidatos carregados para vaga ${vacancyId}:`,
          fullVacancy.candidaturas?.length || 0
        );

        setVacanciesWithCandidates((prev) =>
          prev.map((vacancy) =>
            vacancy.id === vacancyId
              ? { ...vacancy, ...fullVacancy, candidatesLoaded: true }
              : vacancy
          )
        );
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
    [loadingStates, vacanciesWithCandidates]
  );

  // Função para carregar candidatos de vagas que têm candidatos mas não têm dados completos
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
      const notLoaded = !vacanciesWithCandidates.find(
        (v) => v.id === vacancy.id
      )?.candidatesLoaded;

      console.log(`Vaga ${vacancy.id}:`, {
        hasCandidates,
        candidaturasResumo: vacancy.candidaturasResumo,
        hasFullData,
        candidaturas: vacancy.candidaturas?.length || 0,
        notLoading,
        notLoaded,
      });

      return hasCandidates && !hasFullData && notLoading && notLoaded;
    });

    console.log("Vagas para carregar:", vacanciesToLoad.length);

    // Carregar apenas as primeiras 3 vagas para não sobrecarregar
    const limitedVacancies = vacanciesToLoad.slice(0, 3);

    if (limitedVacancies.length > 0) {
      console.log("🚀 Iniciando carregamento de candidatos...");
      // Carregar em paralelo, mas com limite de concorrência
      const loadPromises = limitedVacancies.map((vacancy) =>
        loadVacancyCandidates(vacancy.id)
      );
      await Promise.allSettled(loadPromises);
    } else {
      console.log("ℹ️ Nenhuma vaga precisa de carregamento de candidatos");
    }
  }, [
    vacancies,
    loadingStates,
    vacanciesWithCandidates,
    loadVacancyCandidates,
  ]);

  // Inicializar com as vagas básicas
  useEffect(() => {
    setVacanciesWithCandidates(
      vacancies.map((vacancy) => ({
        ...vacancy,
        candidatesLoaded: !!(
          vacancy.candidaturas && vacancy.candidaturas.length > 0
        ),
      }))
    );
  }, [vacancies]);

  // Carregar candidatos automaticamente quando a aba é acessada
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCandidatesForVacanciesWithCandidates();
    }, 500); // Delay de 500ms para não sobrecarregar

    return () => clearTimeout(timer);
  }, [loadCandidatesForVacanciesWithCandidates]);

  // Função para forçar o carregamento de uma vaga específica
  const forceLoadVacancyCandidates = useCallback(
    (vacancyId: string) => {
      loadVacancyCandidates(vacancyId);
    },
    [loadVacancyCandidates]
  );

  return {
    vacanciesWithCandidates,
    loadingStates,
    errorStates,
    loadVacancyCandidates: forceLoadVacancyCandidates,
    isLoading: Object.values(loadingStates).some((loading) => loading),
  };
}
