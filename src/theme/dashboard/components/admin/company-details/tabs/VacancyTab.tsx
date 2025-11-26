"use client";

import { EmptyState } from "@/components/ui/custom";
import { VacancyTable } from "../components";
import { VacancyUsageCard } from "../components/VacancyUsageCard";
import { useVacancyCandidates } from "../hooks/useVacancyCandidates";
import type { VacancyTabProps } from "../types";

export function VacancyTab({
  vacancies,
  publishedVacancies,
  totalVacancies,
}: VacancyTabProps) {
  // Usar o hook para gerenciar candidatos
  const {
    vacanciesWithCandidates,
    loadingStates,
    errorStates,
    loadVacancyCandidates,
  } = useVacancyCandidates({
    vacancies: vacancies ?? [],
  });

  // Filtrar vagas para mostrar todas exceto RASCUNHO e DESPUBLICADA
  const relevantVacancies = vacanciesWithCandidates.filter((vacancy) => {
    const status = vacancy.status?.toUpperCase();
    return (
      status === "PUBLICADO" ||
      status === "EM_ANALISE" ||
      status === "PAUSADA" ||
      status === "ENCERRADA" ||
      status === "EXPIRADO"
    );
  });

  // Contar todos os status de vagas
  const statusCounts = (vacancies ?? []).reduce(
    (acc, vacancy) => {
      const status = vacancy.status?.toUpperCase();
      switch (status) {
        case "RASCUNHO":
          acc.rascunho += 1;
          break;
        case "EM_ANALISE":
          acc.emAnalise += 1;
          break;
        case "PUBLICADO":
          acc.publicado += 1;
          break;
        case "DESPUBLICADA":
          acc.despublicada += 1;
          break;
        case "PAUSADA":
          acc.pausada += 1;
          break;
        case "ENCERRADA":
          acc.encerrada += 1;
          break;
        case "EXPIRADO":
          acc.expirado += 1;
          break;
      }
      return acc;
    },
    {
      rascunho: 0,
      emAnalise: 0,
      publicado: 0,
      despublicada: 0,
      pausada: 0,
      encerrada: 0,
      expirado: 0,
    }
  );

  const vacancyMainSection = relevantVacancies.length ? (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-2">
      <VacancyTable
        vacancies={relevantVacancies}
        loadingStates={loadingStates}
        errorStates={errorStates}
        onLoadCandidates={loadVacancyCandidates}
      />
    </section>
  ) : (
    <EmptyState
      illustration="companyDetails"
      illustrationAlt="Ilustração de vagas"
      title="Nenhuma vaga encontrada"
      description="Não encontramos vagas ativas para esta empresa. As vagas aparecem aqui quando estão publicadas, em análise, pausadas, encerradas ou expiradas."
      maxContentWidth="sm"
      className="rounded-2xl border border-gray-200/60 bg-white p-6"
    />
  );

  // Calcular vagas em análise e publicadas corretamente
  const publishedAndInReview = statusCounts.emAnalise + statusCounts.publicado;

  const vacancySidebar = (
    <aside className="space-y-4">
      <VacancyUsageCard
        published={publishedAndInReview}
        total={totalVacancies}
        statusCounts={statusCounts}
      />
    </aside>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      {vacancyMainSection}
      {vacancySidebar}
    </div>
  );
}
