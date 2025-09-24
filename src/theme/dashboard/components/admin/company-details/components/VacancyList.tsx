import { Button } from "@/components/ui/button";
import type { AdminCompanyVagaItem } from "@/api/empresas/admin/types";
import {
  CalendarDays,
  Clock3,
  Eye,
  Pencil,
  Briefcase,
  Globe2,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VacancyListProps {
  vacancies: AdminCompanyVagaItem[];
  onView: (vacancy: AdminCompanyVagaItem) => void;
  onEdit: (vacancy: AdminCompanyVagaItem) => void;
  formatDate: (value?: string | null) => string;
  formatRelativeTime: (value?: string | null) => string;
  formatStatus: (status?: string | null) => string;
  getStatusClasses: (status?: string | null) => string;
  emptyMessage?: string;
  companyFallback?: {
    nome: string;
    cidade?: string | null;
    estado?: string | null;
  };
}

export function VacancyList({
  vacancies,
  onView,
  onEdit,
  formatDate,
  formatRelativeTime,
  formatStatus,
  getStatusClasses,
  emptyMessage,
  companyFallback,
}: VacancyListProps) {
  if (vacancies.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center text-sm text-slate-500">
        {emptyMessage ?? "Nenhuma vaga encontrada."}
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <header className="hidden rounded-3xl border border-slate-200/80 bg-slate-50/70 px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:grid sm:grid-cols-[minmax(0,_2.2fr)_minmax(0,_1.6fr)_minmax(0,_1.8fr)_minmax(0,_1.6fr)_minmax(0,_1.2fr)_auto]">
        <span>Vaga</span>
        <span>Empresa</span>
        <span>Datas</span>
        <span>Perfil</span>
        <span>Status</span>
        <span className="text-right">Ações</span>
      </header>

      <div className="space-y-3">
        {vacancies.map((vacancy) => {
          const statusLabel = formatStatus(vacancy.status);
          const statusClasses = getStatusClasses(vacancy.status);
          const heading = vacancy.titulo ?? `Vaga ${vacancy.id.slice(0, 8)}`;
          const code = vacancy.codigo ?? vacancy.id;
          const createdRelative = formatRelativeTime(vacancy.inseridaEm);
          const updatedRelative = formatRelativeTime(vacancy.atualizadoEm);
          const companyName = "Empresa";
          const companyLocation = "";

          const candidatesCount = 0;
          const applicationsCount = 0;

          return (
            <article
              key={vacancy.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors duration-200 hover:border-[var(--primary-color)]/40 hover:shadow-[0_20px_45px_-35px_rgba(15,23,42,0.4)] sm:grid sm:grid-cols-[minmax(0,_2.2fr)_minmax(0,_1.6fr)_minmax(0,_1.8fr)_minmax(0,_1.6fr)_minmax(0,_1.2fr)_auto] sm:items-center sm:gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                    {heading}
                  </h3>
                  <span
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    title={code}
                  >
                    #{code.slice(0, 12)}
                  </span>
                </div>
                {(updatedRelative || createdRelative) && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    {updatedRelative
                      ? `Atualizada ${updatedRelative}`
                      : `Criada ${createdRelative}`}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{companyName}</p>
                {companyLocation && (
                  <p className="text-xs text-slate-500">{companyLocation}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {vacancy.inseridaEm && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                    <CalendarDays className="h-3 w-3" />
                    Criada em {formatDate(vacancy.inseridaEm)}
                  </span>
                )}
                {vacancy.atualizadoEm && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                    <Clock3 className="h-3 w-3" />
                    Atualizada em {formatDate(vacancy.atualizadoEm)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1">
                  <Briefcase className="h-3 w-3 text-slate-400" />—
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1">
                  <Clock3 className="h-3 w-3 text-slate-400" />—
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1">
                  <BadgeCheck className="h-3 w-3 text-slate-400" />
                  Vaga geral
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1">
                  <Globe2 className="h-3 w-3 text-slate-400" />
                  Pública
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      statusClasses
                    )}
                  >
                    <span className="inline-block size-2 rounded-full bg-current" />
                    {statusLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {typeof candidatesCount === "number" ||
                  typeof applicationsCount === "number"
                    ? `Candidatos ${candidatesCount ?? 0} · Inscrições ${
                        applicationsCount ?? 0
                      }`
                    : "Candidatos e inscrições não informados"}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => onView(vacancy)}
                >
                  <Eye className="size-4" /> Ver detalhes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => onEdit(vacancy)}
                >
                  <Pencil className="size-4" /> Editar
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
