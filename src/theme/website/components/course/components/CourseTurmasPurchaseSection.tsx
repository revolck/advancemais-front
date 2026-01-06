"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  Lock,
  Percent,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import { addMonths } from "date-fns";
import { createCheckoutAndGetUrl } from "@/lib/checkout-session";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { getUserProfile } from "@/api/usuarios";
import { createInscricao } from "@/api/cursos";
import type {
  CourseTurmaPublica,
  CourseData,
} from "@/theme/website/components/course/types";

const PENDING_COURSE_PURCHASE_KEY = "pending_course_purchase_v1";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie?.split("=")[1] || null;
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("pt-BR");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getTurmaDisplayName(turma: CourseTurmaPublica): string {
  return turma.nome?.trim() || `Turma ${turma.id.slice(0, 6)}`;
}

function isTurmaWithinThreeMonthsFromDate(
  turma: CourseTurmaPublica,
  now: Date,
  cutoff: Date
): boolean {
  const start = parseDate(turma.dataInicio);
  const end = parseDate(turma.dataFim);

  if (end && end.getTime() < now.getTime()) return false;
  if (end && end.getTime() > cutoff.getTime()) return false;
  if (start && start.getTime() > cutoff.getTime()) return false;
  return true;
}

function resolvePrice(
  course: CourseData,
  turma: CourseTurmaPublica
): {
  isFree: boolean;
  valor: number;
  valorPromocional?: number;
} {
  const turmaGratuito = turma.gratuito ?? false;
  const cursoGratuito = course.gratuito ?? false;
  const isFree = Boolean(turmaGratuito || cursoGratuito);

  const valor =
    turma.valor != null ? turma.valor : course.valor != null ? course.valor : 0;
  const valorPromocional =
    turma.valorPromocional != null
      ? turma.valorPromocional
      : course.valorPromocional;

  return { isFree: isFree || valor <= 0, valor, valorPromocional };
}

export interface CourseTurmasPurchaseSectionProps {
  course: Pick<
    CourseData,
    "id" | "nome" | "gratuito" | "valor" | "valorPromocional"
  >;
  turmas: CourseTurmaPublica[];
  className?: string;
  variant?: "section" | "sidebar";
}

export function CourseTurmasPurchaseSection({
  course,
  turmas,
  className,
  variant = "section",
}: CourseTurmasPurchaseSectionProps) {
  const role = useUserRole();
  const eligibleTurmas = useMemo(
    () => {
      const now = new Date();
      const cutoff = addMonths(now, 3);
      return (turmas ?? []).filter((turma) =>
        isTurmaWithinThreeMonthsFromDate(turma, now, cutoff)
      );
    },
    [turmas]
  );
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(
    variant === "sidebar" ? null : eligibleTurmas[0]?.id ?? null
  );
  const [submittingTurmaId, setSubmittingTurmaId] = useState<string | null>(
    null
  );
  const isSubmitting = submittingTurmaId != null;

  React.useEffect(() => {
    const hasSelection =
      selectedTurmaId != null &&
      eligibleTurmas.some((turma) => turma.id === selectedTurmaId);

    if (variant === "sidebar") {
      if (selectedTurmaId != null && !hasSelection) setSelectedTurmaId(null);
      return;
    }

    if (!hasSelection) setSelectedTurmaId(eligibleTurmas[0]?.id ?? null);
  }, [eligibleTurmas, selectedTurmaId, variant]);

  const selectedTurma = useMemo(() => {
    if (!selectedTurmaId)
      return variant === "sidebar" ? null : eligibleTurmas[0] ?? null;
    return (
      eligibleTurmas.find((t) => t.id === selectedTurmaId) ??
      eligibleTurmas[0] ??
      null
    );
  }, [eligibleTurmas, selectedTurmaId, variant]);

  const selectedPrice = useMemo(() => {
    if (!selectedTurma) return { isFree: true, valor: 0 };
    return resolvePrice(course as CourseData, selectedTurma);
  }, [course, selectedTurma]);

  const turmaDates = useMemo(() => {
    if (!selectedTurma) return { start: null, end: null };
    return {
      start: formatDate(selectedTurma.dataInicio),
      end: formatDate(selectedTurma.dataFim),
    };
  }, [selectedTurma]);

  const inscricaoDates = useMemo(() => {
    if (!selectedTurma) return { start: null, end: null };
    return {
      start: formatDate(selectedTurma.dataInscricaoInicio),
      end: formatDate(selectedTurma.dataInscricaoFim),
    };
  }, [selectedTurma]);

  const handleLoginRedirect = () => {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.pathname + "#turmas"
        : "/";
    sessionStorage.setItem("post_login_return_url", currentUrl);
    window.location.href = "/auth/login";
  };

  const handleActionForTurma = async (turma: CourseTurmaPublica) => {
    if (!turma) return;

    if (role && role !== UserRole.ALUNO_CANDIDATO) {
      toastCustom.error({
        title: "Acesso restrito",
        description: "A compra está disponível apenas para alunos/candidatos.",
      });
      return;
    }

    const token = getCookieValue("token");
    if (!token) {
      toastCustom.error({
        title: "Faça login para continuar",
        description: "Você precisa estar logado para comprar ou se matricular.",
      });
      handleLoginRedirect();
      return;
    }

    setSubmittingTurmaId(turma.id);
    try {
      const turmaName = getTurmaDisplayName(turma);
      const { isFree, valor, valorPromocional } = resolvePrice(
        course as CourseData,
        turma
      );
      const payable =
        !isFree && valorPromocional != null && valorPromocional < valor
          ? valorPromocional
          : valor;

      if (isFree || payable <= 0) {
        const profile = await getUserProfile(token);
        if (!profile?.success || !("usuario" in profile)) {
          throw new Error("Não foi possível identificar o usuário.");
        }
        const userId = (profile.usuario as any)?.id as string | undefined;
        if (!userId) throw new Error("Não foi possível identificar o usuário.");

        await createInscricao(course.id, turma.id, { alunoId: userId });
        toastCustom.success({
          title: "Matrícula realizada",
          description: "Você já pode acessar o curso na Academia.",
        });
        window.location.href = "/academia";
        return;
      }

      const courseOrigin =
        typeof window !== "undefined"
          ? window.location.pathname + "#turmas"
          : "/cursos";

      const { url } = createCheckoutAndGetUrl({
        productType: "curso",
        productId: turma.id,
        productName: `${course.nome} — ${turmaName}`,
        productPrice: payable,
        currency: "BRL",
        originUrl: courseOrigin,
        metadata: {
          cursoId: course.id,
          cursoNome: course.nome,
          turmaId: turma.id,
          turmaNome: turmaName,
          dataInicio: turma.dataInicio ?? null,
          dataFim: turma.dataFim ?? null,
          maxInstallments: 12,
        },
      });

      window.location.href = url;
    } catch (error: any) {
      const message =
        error?.message || "Não foi possível iniciar a compra. Tente novamente.";
      toastCustom.error({
        title: "Erro ao iniciar compra",
        description: message,
      });
    } finally {
      setSubmittingTurmaId(null);
    }
  };

  const handleAction = async () => {
    if (!selectedTurma) return;
    await handleActionForTurma(selectedTurma);
  };

  if (!eligibleTurmas || eligibleTurmas.length === 0) {
    return (
      <section id="turmas" className={cn("scroll-mt-24", className)}>
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Turmas disponíveis
              </h3>
              <p className="text-sm text-gray-600">
                No momento não há turmas com período de até 3 meses disponíveis
                para matrícula.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "sidebar") {
    return (
      <section id="turmas" className={cn("scroll-mt-24", className)}>
        <div className="rounded-3xl border border-gray-200/70 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="!text-base !font-semibold !text-gray-900 !mb-0">
                Escolha sua turma
              </h3>
              <p className="!text-xs !text-gray-500">
                Toque em uma turma e finalize na hora.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200/70 text-gray-700">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
            {eligibleTurmas.map((turma) => {
              const price = resolvePrice(course as CourseData, turma);
              const start = formatDate(turma.dataInicio);
              const end = formatDate(turma.dataFim);
              const turmaName = getTurmaDisplayName(turma);

              const dateLabel =
                start && end
                  ? `${start} — ${end}`
                  : start
                  ? `Início: ${start}`
                  : "Datas a confirmar";

              const hasPromo =
                !price.isFree &&
                price.valorPromocional != null &&
                price.valorPromocional < price.valor;

              return (
                <div
                  key={turma.id}
                  className={cn(
                    "rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white to-gray-50/40 p-4 transition",
                    "hover:border-[var(--primary-color)]/35 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {turmaName}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span className="truncate">{dateLabel}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {price.isFree ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Gratuito
                        </Badge>
                      ) : hasPromo ? (
                        <div className="leading-tight">
                          <div className="text-[11px] line-through text-gray-400">
                            {formatCurrency(price.valor)}
                          </div>
                          <div className="text-base font-bold text-emerald-600">
                            {formatCurrency(price.valorPromocional!)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-base font-bold text-gray-900">
                          {formatCurrency(price.valor)}
                        </div>
                      )}
                    </div>
                  </div>

                  {!price.isFree ? (
                    <div className="mt-3 rounded-xl border border-gray-200/70 bg-white/70 px-3 py-2 text-xs text-gray-600">
                      Pagamento único • até 12x sem juros no cartão
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-gray-200/70 bg-white/70 px-3 py-2 text-xs text-gray-600">
                      Matrícula gratuita • acesso liberado após confirmação
                    </div>
                  )}

                  <ButtonCustom
                    variant="primary"
                    className="w-full mt-3"
                    withAnimation={false}
                    isLoading={isSubmitting && submittingTurmaId === turma.id}
                    disabled={isSubmitting}
                    onClick={() => handleActionForTurma(turma)}
                  >
                    {price.isFree ? "Matricular-se" : "Continuar pagamento"}
                  </ButtonCustom>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            Matrícula/compra vinculada à turma.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="turmas" className={cn("scroll-mt-24", className)}>
      <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="!text-xl !font-semibold !text-gray-900 !mb-0">
              Escolha sua turma
            </h3>
            <p className="!text-sm !text-gray-600">
              Você compra o acesso escolhendo a turma (datas, vagas e valor).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-gray-50 text-gray-700">
              <Lock className="h-3 w-3 mr-1" /> Acesso por turma
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmação automática
            </Badge>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {eligibleTurmas.map((turma) => {
              const isSelected = turma.id === selectedTurma?.id;
              const price = resolvePrice(course as CourseData, turma);
              const start = formatDate(turma.dataInicio);
              const end = formatDate(turma.dataFim);
              const vagasValue =
                turma.vagasDisponiveis ??
                turma.vagas ??
                (typeof turma.vagasTotais === "number"
                  ? turma.vagasTotais
                  : null);

              const turmaName = getTurmaDisplayName(turma);
              const isFree = price.isFree;
              const hasPromo =
                !isFree &&
                price.valorPromocional != null &&
                price.valorPromocional < price.valor;

              return (
                <button
                  key={turma.id}
                  type="button"
                  onClick={() => setSelectedTurmaId(turma.id)}
                  className={cn(
                    "w-full text-left rounded-2xl border p-4 transition",
                    "hover:border-[var(--primary-color)]/35 hover:bg-[var(--primary-color)]/[0.02]",
                    isSelected
                      ? "border-[var(--primary-color)]/50 bg-[var(--primary-color)]/[0.03] ring-1 ring-[var(--primary-color)]/15"
                      : "border-gray-200/70 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-gray-900 truncate">
                          {turmaName}
                        </span>
                        {isSelected ? (
                          <Badge className="bg-[var(--primary-color)] text-white">
                            Selecionada
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {start && end
                            ? `${start} • ${end}`
                            : "Datas a confirmar"}
                        </span>
                        {typeof vagasValue === "number" ? (
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {vagasValue} vaga{vagasValue === 1 ? "" : "s"}
                          </span>
                        ) : null}
                        {turma.metodo ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {turma.metodo}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isFree ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Gratuito
                        </Badge>
                      ) : hasPromo ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs line-through text-gray-400">
                              {formatCurrency(price.valor)}
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0"
                            >
                              <Percent className="h-3 w-3 mr-1" />
                              Oferta
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600">
                            {formatCurrency(price.valorPromocional!)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(price.valor)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-2xl border border-gray-200/70 bg-gray-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Turma selecionada
                  </div>
                  <div className="mt-1 text-base font-semibold text-gray-900 truncate">
                    {selectedTurma ? getTurmaDisplayName(selectedTurma) : "—"}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-gray-200/70 text-gray-700">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-600">Período</span>
                  <span className="font-medium text-gray-900 text-right">
                    {turmaDates.start && turmaDates.end
                      ? `${turmaDates.start} • ${turmaDates.end}`
                      : turmaDates.start
                      ? `Início: ${turmaDates.start}`
                      : "A confirmar"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-600">Inscrições</span>
                  <span className="font-medium text-gray-900 text-right">
                    {inscricaoDates.start && inscricaoDates.end
                      ? `${inscricaoDates.start} • ${inscricaoDates.end}`
                      : "Consulte a turma"}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200/70 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Valor
                  </span>
                  {selectedPrice.isFree ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                    >
                      <Gift className="h-3 w-3 mr-1" />
                      Gratuito
                    </Badge>
                  ) : selectedPrice.valorPromocional != null &&
                    selectedPrice.valorPromocional < selectedPrice.valor ? (
                    <div className="text-right">
                      <div className="text-xs line-through text-gray-400">
                        {formatCurrency(selectedPrice.valor)}
                      </div>
                      <div className="text-lg font-bold text-emerald-600">
                        {formatCurrency(selectedPrice.valorPromocional)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedPrice.valor)}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Compra vinculada à turma selecionada.
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <ButtonCustom
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !selectedTurma}
                  onClick={handleAction}
                >
                  {selectedPrice.isFree ? "Matricular-se" : "Comprar acesso"}
                </ButtonCustom>
                <div className="text-xs text-gray-500 text-center">
                  Ao continuar, você confirma a turma selecionada.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
