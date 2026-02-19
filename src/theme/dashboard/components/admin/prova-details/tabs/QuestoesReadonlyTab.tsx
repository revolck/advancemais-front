"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/custom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/custom/Icons";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  listAvaliacaoQuestoes,
  type AvaliacaoQuestao,
  type AvaliacaoQuestaoLegacy,
} from "@/api/cursos";

interface QuestoesReadonlyTabProps {
  avaliacaoId: string;
  questoes?: AvaliacaoQuestao[] | AvaliacaoQuestaoLegacy[];
}

const ITEMS_PER_PAGE = 5;

/* ── questão card ────────────────────────────────────── */

function QuestaoCard({
  index,
  enunciado,
  peso,
  obrigatoria,
  alternativas,
}: {
  index: number;
  enunciado: string;
  peso: number | null;
  obrigatoria?: boolean;
  alternativas: { id?: string; texto: string; correta?: boolean }[];
}) {
  const hasCorreta = alternativas.some((a) => a.correta);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white overflow-hidden",
        hasCorreta ? "border-violet-200" : "border-slate-200"
      )}
    >
      {/* header */}
      <div
        className={cn(
          "px-5 py-4 border-b",
          hasCorreta
            ? "bg-violet-50/60 border-violet-100"
            : "bg-slate-50/60 border-slate-100"
        )}
      >
        {/* título = enunciado */}
        <h3 className="text-base! font-bold! text-slate-900! mb-2.5! leading-snug!">
          {enunciado}
        </h3>

        {/* badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]! font-semibold! rounded-md!",
              hasCorreta
                ? "bg-violet-100 text-violet-700 border-violet-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            Questão {index}
          </Badge>

          {obrigatoria && (
            <Badge
              variant="outline"
              className="text-[10px]! font-semibold! rounded-md! bg-rose-50 text-rose-600 border-rose-200"
            >
              Obrigatória
            </Badge>
          )}

          {typeof peso === "number" && (
            <Badge
              variant="outline"
              className="text-[10px]! font-semibold! rounded-md! bg-slate-50 text-slate-500 border-slate-200"
            >
              Peso {peso}
            </Badge>
          )}

          {hasCorreta && (
            <Badge
              variant="outline"
              className="text-[10px]! font-semibold! rounded-md! bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Gabarito definido
            </Badge>
          )}
        </div>
      </div>

      {/* alternativas */}
      {alternativas.length > 0 && (
        <div className="p-5 space-y-2.5">
          {alternativas.map((alt, altIndex) => {
            const isCorreta = !!alt.correta;
            const letra = String.fromCharCode(65 + altIndex);

            return (
              <div
                key={alt.id ?? `alt-${altIndex}`}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-xl border",
                  isCorreta
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50/50 border-slate-100"
                )}
              >
                <div
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs! font-bold!",
                    isCorreta
                      ? "bg-emerald-500 border-emerald-500 text-white!"
                      : "bg-white border-slate-300 text-slate-400!"
                  )}
                >
                  {isCorreta ? <CheckCircle2 className="h-4 w-4" /> : letra}
                </div>

                <span
                  className={cn(
                    "text-sm! flex-1 min-w-0",
                    isCorreta
                      ? "text-emerald-900! font-semibold!"
                      : "text-slate-600!"
                  )}
                >
                  {alt.texto}
                </span>

                {isCorreta && (
                  <span className="shrink-0 text-[10px]! font-bold! uppercase! tracking-wider! text-emerald-600!">
                    Correta
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── paginação ───────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center border transition-colors",
          page === 1
            ? "border-slate-100 text-slate-300 cursor-not-allowed"
            : "border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPageChange(i + 1)}
          className={cn(
            "h-8 min-w-8 px-2 rounded-lg flex items-center justify-center text-xs! font-semibold! border transition-colors cursor-pointer",
            page === i + 1
              ? "bg-violet-100 text-violet-700! border-violet-200"
              : "bg-white text-slate-600! border-slate-200 hover:bg-slate-50"
          )}
        >
          {i + 1}
        </button>
      ))}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center border transition-colors",
          page === totalPages
            ? "border-slate-100 text-slate-300 cursor-not-allowed"
            : "border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ── main ────────────────────────────────────────────── */

export function QuestoesReadonlyTab({ avaliacaoId, questoes }: QuestoesReadonlyTabProps) {
  const [page, setPage] = useState(1);

  const fallbackQuestoes = useMemo(
    () => (Array.isArray(questoes) ? questoes : []),
    [questoes]
  );

  const {
    data: questoesApi,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["avaliacao-questoes", avaliacaoId],
    queryFn: () => listAvaliacaoQuestoes(avaliacaoId),
    enabled: Boolean(avaliacaoId),
    staleTime: 30_000,
    retry: false,
  });

  const questoesList = useMemo(() => {
    if (Array.isArray(questoesApi) && questoesApi.length > 0) return questoesApi;
    return fallbackQuestoes;
  }, [fallbackQuestoes, questoesApi]);

  const totalPages = Math.ceil(questoesList.length / ITEMS_PER_PAGE);
  const paginatedQuestoes = questoesList.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (isLoading && fallbackQuestoes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>
            <div className="p-5 space-y-2.5">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && fallbackQuestoes.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Não foi possível carregar as questões desta atividade/prova.
        </AlertDescription>
      </Alert>
    );
  }

  if (questoesList.length === 0) {
    return (
      <EmptyState
        illustration="books"
        title="Nenhuma questão cadastrada"
        description="Esta atividade/prova ainda não possui questões registradas."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Icon name="FileQuestion" className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base! font-semibold! text-slate-900! mb-0!">
              Questões
            </h3>
            <p className="text-xs! text-slate-500! mb-0!">
              {questoesList.length}{" "}
              {questoesList.length === 1 ? "questão cadastrada" : "questões cadastradas"}
            </p>
          </div>
        </div>
      </div>

      {/* lista paginada */}
      {paginatedQuestoes.map((questao, index) => {
        const globalIndex = (page - 1) * ITEMS_PER_PAGE + index;
        const alternativas = Array.isArray(questao.alternativas) ? questao.alternativas : [];
        const ordem = "ordem" in questao ? questao.ordem : undefined;
        const enunciado = "enunciado" in questao ? questao.enunciado : (questao as any).titulo;
        const peso = "peso" in questao ? questao.peso : null;
        const obrigatoria = "obrigatoria" in questao ? questao.obrigatoria : undefined;

        return (
          <QuestaoCard
            key={questao.id ?? `${globalIndex}`}
            index={typeof ordem === "number" ? ordem : globalIndex + 1}
            enunciado={enunciado}
            peso={typeof peso === "number" ? peso : null}
            obrigatoria={typeof obrigatoria === "boolean" ? obrigatoria : undefined}
            alternativas={alternativas.map((a: any) => ({
              id: a.id,
              texto: a.texto,
              correta: "correta" in a ? a.correta : undefined,
            }))}
          />
        );
      })}

      {/* paginação */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
