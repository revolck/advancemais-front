"use client";

import React, { useState } from "react";
import { ButtonCustom, EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/custom/Icons";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Questao } from "@/api/provas";
import { useQuestoes, useDeleteQuestao } from "../hooks/useQuestoes";
import { CreateQuestaoModal } from "./CreateQuestaoModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toastCustom } from "@/components/ui/custom";

interface QuestoesListProps {
  cursoId: string | number;
  turmaId: string;
  provaId: string;
  allowQuestionManagement?: boolean;
}

const ITEMS_PER_PAGE = 5;

/* ── questão card ────────────────────────────────────── */

function QuestaoItem({
  questao,
  index,
  cursoId,
  turmaId,
  provaId,
  onSuccess,
  onRequestDelete,
  allowQuestionManagement,
}: {
  questao: Questao;
  index: number;
  cursoId: string | number;
  turmaId: string;
  provaId: string;
  onSuccess: () => void;
  onRequestDelete: (q: Questao) => void;
  allowQuestionManagement: boolean;
}) {
  const alternativas = Array.isArray(questao.alternativas)
    ? questao.alternativas
    : [];
  const hasCorreta = alternativas.some((a) => a.correta);
  const numero = questao.ordem ?? index + 1;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white overflow-hidden",
        hasCorreta ? "border-violet-200" : "border-slate-200",
      )}
    >
      {/* header */}
      <div
        className={cn(
          "px-5 py-4 border-b",
          hasCorreta
            ? "bg-violet-50/60 border-violet-100"
            : "bg-slate-50/60 border-slate-100",
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-2.5">
          {/* título = enunciado */}
          <h3 className="text-base! font-bold! text-slate-900! mb-0! leading-snug! flex-1 min-w-0">
            {questao.enunciado}
          </h3>

          {/* ações */}
          {allowQuestionManagement ? (
            <div className="flex items-center gap-0.5 shrink-0 -mt-0.5">
              <CreateQuestaoModal
                cursoId={cursoId}
                turmaId={turmaId}
                provaId={provaId}
                questao={questao}
                onSuccess={onSuccess}
                trigger={
                  <ButtonCustom
                    variant="ghost"
                    size="sm"
                    icon="Edit"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                  />
                }
              />
              <ButtonCustom
                variant="ghost"
                size="sm"
                icon="Trash2"
                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => onRequestDelete(questao)}
              />
            </div>
          ) : null}
        </div>

        {/* badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]! font-semibold! rounded-md!",
              hasCorreta
                ? "bg-violet-100 text-violet-700 border-violet-200"
                : "bg-slate-100 text-slate-600 border-slate-200",
            )}
          >
            Questão {numero}
          </Badge>

          {questao.obrigatoria && (
            <Badge
              variant="outline"
              className="text-[10px]! font-semibold! rounded-md! bg-rose-50 text-rose-600 border-rose-200"
            >
              Obrigatória
            </Badge>
          )}

          {typeof questao.peso === "number" && (
            <Badge
              variant="outline"
              className="text-[10px]! font-semibold! rounded-md! bg-slate-50 text-slate-500 border-slate-200"
            >
              Peso {questao.peso}
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
            const isCorreta = alt.correta;
            const letra = String.fromCharCode(65 + altIndex);

            return (
              <div
                key={alt.id}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-xl border",
                  isCorreta
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50/50 border-slate-100",
                )}
              >
                <div
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs! font-bold!",
                    isCorreta
                      ? "bg-emerald-500 border-emerald-500 text-white!"
                      : "bg-white border-slate-300 text-slate-400!",
                  )}
                >
                  {isCorreta ? <CheckCircle2 className="h-4 w-4" /> : letra}
                </div>

                <span
                  className={cn(
                    "text-sm! flex-1 min-w-0",
                    isCorreta
                      ? "text-emerald-900! font-semibold!"
                      : "text-slate-600!",
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
            : "border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer",
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
              : "bg-white text-slate-600! border-slate-200 hover:bg-slate-50",
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
            : "border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ── main ────────────────────────────────────────────── */

export function QuestoesList({
  cursoId,
  turmaId,
  provaId,
  allowQuestionManagement = true,
}: QuestoesListProps) {
  const [questaoToDelete, setQuestaoToDelete] = useState<Questao | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: questoes,
    isLoading,
    error,
    refetch,
  } = useQuestoes({ cursoId, turmaId, provaId });

  const deleteQuestao = useDeleteQuestao({ cursoId, turmaId, provaId });

  const handleDelete = async () => {
    if (!questaoToDelete) return;
    try {
      await deleteQuestao.mutateAsync(questaoToDelete.id);
      toastCustom.success("Questão removida com sucesso!");
      setQuestaoToDelete(null);
      refetch();
    } catch (err: any) {
      toastCustom.error(
        err?.message || "Erro ao remover questão. Tente novamente.",
      );
    }
  };

  const handleSuccess = () => refetch();

  const totalPages = questoes ? Math.ceil(questoes.length / ITEMS_PER_PAGE) : 0;
  const paginatedQuestoes = questoes
    ? questoes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    : [];

  /* loading */
  if (isLoading) {
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
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
          >
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

  /* error */
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar questões: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  /* empty */
  if (!questoes || questoes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Icon name="FileQuestion" className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-base! font-semibold! text-slate-900! mb-0!">
                  Questões
                </h3>
                <p className="text-xs! text-slate-500! mb-0!">0 questões</p>
              </div>
            </div>
            {allowQuestionManagement ? (
              <CreateQuestaoModal
                cursoId={cursoId}
                turmaId={turmaId}
                provaId={provaId}
                onSuccess={handleSuccess}
                trigger={
                  <ButtonCustom variant="primary" size="sm" icon="Plus">
                    Adicionar Questão
                  </ButtonCustom>
                }
              />
            ) : null}
          </div>
        </div>
        <EmptyState
          illustration="books"
          title="Nenhuma questão cadastrada"
          description="Comece adicionando a primeira questão à prova."
        />
      </div>
    );
  }

  /* list */
  return (
    <div className="space-y-4">
      {/* header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Icon name="FileQuestion" className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-base! font-semibold! text-slate-900! mb-0!">
                Questões
              </h3>
              <p className="text-xs! text-slate-500! mb-0!">
                {questoes.length}{" "}
                {questoes.length === 1
                  ? "questão cadastrada"
                  : "questões cadastradas"}
              </p>
            </div>
          </div>
          {allowQuestionManagement ? (
            <CreateQuestaoModal
              cursoId={cursoId}
              turmaId={turmaId}
              provaId={provaId}
              onSuccess={handleSuccess}
              trigger={
                <ButtonCustom variant="primary" size="sm" icon="Plus">
                  Adicionar Questão
                </ButtonCustom>
              }
            />
          ) : null}
        </div>
      </div>

      {/* questões paginadas */}
      {paginatedQuestoes.map((questao, index) => {
        const globalIndex = (page - 1) * ITEMS_PER_PAGE + index;
        return (
          <QuestaoItem
            key={questao.id}
            questao={questao}
            index={globalIndex}
            cursoId={cursoId}
            turmaId={turmaId}
            provaId={provaId}
            onSuccess={handleSuccess}
            onRequestDelete={setQuestaoToDelete}
            allowQuestionManagement={allowQuestionManagement}
          />
        );
      })}

      {/* paginação */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* modal de exclusão */}
      <AlertDialog
        open={!!questaoToDelete}
        onOpenChange={(open) => !open && setQuestaoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta questão? Esta ação não pode
              ser desfeita e todas as respostas relacionadas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteQuestao.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteQuestao.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
