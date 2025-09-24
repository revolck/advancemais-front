"use client";

import { EmptyState } from "@/components/ui/custom";
import { VacancyTable } from "../components";
import { VacancyUsageCard } from "../components/VacancyUsageCard";
import type { VacancyTabProps } from "../types";

export function VacancyTab({
  vacancies,
  publishedVacancies,
  totalVacancies,
  onViewVacancy,
  onEditVacancy,
}: VacancyTabProps) {
  const relevantVacancies = (vacancies ?? []).filter((vacancy) => {
    const status = vacancy.status?.toUpperCase();
    return status === "PUBLICADO" || status === "EM_ANALISE";
  });

  const statusCounts = relevantVacancies.reduce(
    (acc, vacancy) => {
      const status = vacancy.status?.toUpperCase();
      if (status === "PUBLICADO") acc.publicadas += 1;
      if (status === "EM_ANALISE") acc.emAnalise += 1;
      return acc;
    },
    { publicadas: 0, emAnalise: 0 }
  );

  const vacancyMainSection = relevantVacancies.length ? (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-2">
      <VacancyTable
        vacancies={relevantVacancies}
        onView={onViewVacancy}
        onEdit={onEditVacancy}
        getCandidateAvatars={(v) => {
          const urls: string[] = [];
          return urls;
        }}
      />
    </section>
  ) : (
    <EmptyState
      illustration="companyDetails"
      illustrationAlt="Ilustração de vagas"
      title="Nenhuma vaga publicada"
      description="Ainda não encontramos vagas publicadas ou em análise para esta empresa. Assim que uma vaga entrar na fila, ela aparece aqui."
      maxContentWidth="sm"
      className="rounded-2xl border border-gray-200/60 bg-white p-6"
    />
  );

  const vacancySidebar = (
    <aside className="space-y-4">
      <VacancyUsageCard published={publishedVacancies} total={totalVacancies} />

      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3>Resumo por status</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-3">
            <span className="font-medium text-gray-700">Em análise</span>
            <span className="text-green-900">{statusCounts.emAnalise}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-3">
            <span className="font-medium text-gray-700">Publicadas</span>
            <span className="text-gray-500">{statusCounts.publicadas}</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      {vacancyMainSection}
      {vacancySidebar}
    </div>
  );
}
