"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteAvaliacao,
  publicarAvaliacao,
  type TurmaProva,
} from "@/api/cursos";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toastCustom } from "@/components/ui/custom";
import { getAvaliacaoActionRestrictions } from "../utils/validations";
import { DeleteAvaliacaoModal } from "../modals/DeleteAvaliacaoModal";
import { PublicarAvaliacaoModal } from "../modals/PublicarAvaliacaoModal";
import { getAvaliacaoStatusEfetivo } from "../../lista-atividades-provas/utils/avaliacaoStatus";

interface HeaderInfoProps {
  prova: TurmaProva;
  hasRespostas?: boolean;
}

function mergeAvaliacaoIntoProva(
  prova: TurmaProva,
  avaliacao: Partial<TurmaProva> & {
    titulo?: string;
    nome?: string;
    horaTermino?: string;
  }
): TurmaProva {
  return {
    ...prova,
    ...avaliacao,
    titulo: avaliacao.titulo || avaliacao.nome || prova.titulo,
    nome: avaliacao.nome ?? prova.nome,
    status: avaliacao.status ?? prova.status,
    ativo: avaliacao.ativo ?? prova.ativo,
    dataInicio: avaliacao.dataInicio ?? prova.dataInicio,
    dataFim: avaliacao.dataFim ?? prova.dataFim,
    horaInicio: avaliacao.horaInicio ?? prova.horaInicio,
    horaFim: avaliacao.horaTermino ?? avaliacao.horaFim ?? prova.horaFim,
    horaTermino:
      avaliacao.horaTermino ?? avaliacao.horaFim ?? prova.horaTermino,
    turmaId:
      avaliacao.turmaId === undefined ? prova.turmaId : avaliacao.turmaId,
    turma: avaliacao.turma === undefined ? prova.turma : avaliacao.turma,
    turmaNome:
      avaliacao.turmaNome === undefined ? prova.turmaNome : avaliacao.turmaNome,
    cursoId:
      avaliacao.cursoId === undefined ? prova.cursoId : avaliacao.cursoId,
    curso: avaliacao.curso === undefined ? prova.curso : avaliacao.curso,
    cursoNome:
      avaliacao.cursoNome === undefined ? prova.cursoNome : avaliacao.cursoNome,
    instrutorId:
      avaliacao.instrutorId === undefined
        ? prova.instrutorId
        : avaliacao.instrutorId,
    instrutor:
      avaliacao.instrutor === undefined ? prova.instrutor : avaliacao.instrutor,
    atualizadoEm: avaliacao.atualizadoEm ?? prova.atualizadoEm,
  };
}

export function HeaderInfo({ prova, hasRespostas }: HeaderInfoProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const titulo = prova.titulo || prova.nome || "Atividade/Prova sem título";
  const status = getAvaliacaoStatusEfetivo(prova);
  const restrictions = getAvaliacaoActionRestrictions(prova, {
    hasRespostas,
    userRole: user?.role,
    userId: user?.id,
  });
  const normalizedStatus = String(status).toUpperCase();
  const isStatusActive = ["PUBLICADA", "ATIVO", "ATIVA"].includes(normalizedStatus);
  const isPublicada = normalizedStatus === "PUBLICADA";
  const canShowActions =
    restrictions.canEdit || restrictions.canPublish || restrictions.canDelete;

  const invalidateAvaliacaoCaches = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["avaliacoes"],
        exact: false,
      }),
      queryClient.invalidateQueries({
        queryKey: ["prova"],
        exact: false,
      }),
      queryClient.invalidateQueries({
        queryKey: ["avaliacao"],
        exact: false,
      }),
    ]);
  };

  const publishMutation = useMutation({
    mutationFn: (publicar: boolean) => publicarAvaliacao(prova.id, publicar),
    onSuccess: async (data, publicar) => {
      const provaAtualizada = mergeAvaliacaoIntoProva(
        prova,
        data as Partial<TurmaProva>
      );
      const novoStatus = getAvaliacaoStatusEfetivo(provaAtualizada);
      const nextQueryKey = [
        "prova",
        prova.cursoId ?? null,
        prova.turmaId ?? null,
        prova.id,
      ];

      queryClient.setQueryData(nextQueryKey, provaAtualizada);
      queryClient.setQueryData(["avaliacao", prova.id], provaAtualizada);

      if (publicar && novoStatus === "PUBLICADA") {
        toastCustom.success("Avaliação publicada com sucesso!");
      } else if (!publicar && novoStatus === "RASCUNHO") {
        toastCustom.success("Avaliação despublicada com sucesso!");
      } else {
        toastCustom.info(
          `A avaliação permaneceu com status ${novoStatus}.`
        );
      }

      setIsPublicarModalOpen(false);
      await invalidateAvaliacaoCaches();
    },
    onError: (error: any) => {
      const errorDetails = error?.details ?? error;
      const code = errorDetails?.code;
      const message = errorDetails?.message || error?.message;

      if (error?.status === 403 || code === "FORBIDDEN") {
        toastCustom.error("Você não tem permissão para esta avaliação");
        return;
      }

      if (
        error?.status === 409 ||
        code === "AVALIACAO_JA_INICIADA_OU_REALIZADA"
      ) {
        toastCustom.error(
          "A avaliação já iniciou ou foi realizada e não permite mais esta ação."
        );
        return;
      }

      if (code === "CAMPOS_OBRIGATORIOS_FALTANDO") {
        toastCustom.error(
          "Não foi possível publicar. Verifique os campos obrigatórios."
        );
        return;
      }

      if (code === "DATA_INVALIDA") {
        toastCustom.error("Data inválida para publicar/despublicar avaliação.");
        return;
      }

      if (code === "STATUS_INVALIDO") {
        toastCustom.error(
          "Status inválido para publicar/despublicar avaliação."
        );
        return;
      }

      if (code === "AVALIACAO_PUBLICACAO_EXIGE_TURMA_VINCULADA") {
        toastCustom.error("Vincule uma turma antes de publicar esta avaliação.");
        return;
      }

      toastCustom.error(message || "Erro ao publicar/despublicar avaliação.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAvaliacao(prova.id),
    onSuccess: async () => {
      toastCustom.success("Avaliação excluída com sucesso!");
      setIsDeleteModalOpen(false);
      await invalidateAvaliacaoCaches();
      router.replace("/dashboard/cursos/atividades-provas");
    },
    onError: (error: any) => {
      const errorDetails = error?.details ?? error;
      const code = errorDetails?.code;
      const message = errorDetails?.message || error?.message;

      if (error?.status === 403 || code === "FORBIDDEN") {
        toastCustom.error("Você não tem permissão para esta avaliação");
        return;
      }

      if (
        error?.status === 409 ||
        code === "AVALIACAO_JA_INICIADA_OU_REALIZADA"
      ) {
        toastCustom.error(
          "A avaliação já iniciou ou foi realizada e não pode ser excluída."
        );
        return;
      }

      if (code === "AVALIACAO_NOT_FOUND") {
        toastCustom.error("Avaliação não encontrada.");
        return;
      }

      toastCustom.error(message || "Erro ao excluir avaliação.");
    },
  });

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 min-w-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold !mb-0">{titulo}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  isStatusActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                )}
              >
                {status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          {canShowActions ? (
            <DropdownMenu
              open={isActionsOpen}
              onOpenChange={setIsActionsOpen}
              modal={false}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  aria-expanded={isActionsOpen}
                  className="flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-color)]/90 cursor-pointer"
                >
                  Ações
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isActionsOpen ? "rotate-180" : "rotate-0"
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {restrictions.canEdit ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href={`/dashboard/cursos/atividades-provas/${prova.id}/editar`}
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                      <span>Editar</span>
                    </Link>
                  </DropdownMenuItem>
                ) : null}

                {restrictions.canPublish ? (
                  <DropdownMenuItem
                    onSelect={() => {
                      setIsActionsOpen(false);
                      window.setTimeout(() => setIsPublicarModalOpen(true), 0);
                    }}
                    className="cursor-pointer"
                    disabled={publishMutation.isPending}
                  >
                    {publishMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    ) : isPublicada ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                    <span>
                      {publishMutation.isPending
                        ? isPublicada
                          ? "Despublicando..."
                          : "Publicando..."
                        : isPublicada
                        ? "Despublicar"
                        : "Publicar"}
                    </span>
                  </DropdownMenuItem>
                ) : null}

                {restrictions.canDelete ? (
                  <DropdownMenuItem
                    onSelect={() => {
                      setIsActionsOpen(false);
                      window.setTimeout(() => setIsDeleteModalOpen(true), 0);
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-700 data-[highlighted]:text-red-700"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-600" />
                    )}
                    <span>
                      {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                    </span>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link
              href="/dashboard/cursos/atividades-provas"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      <PublicarAvaliacaoModal
        isOpen={isPublicarModalOpen}
        onOpenChange={setIsPublicarModalOpen}
        avaliacao={prova}
        isPublicada={isPublicada}
        blockedReason={restrictions.publishReason}
        isProcessing={publishMutation.isPending}
        onConfirm={(publicar) => publishMutation.mutate(publicar)}
      />

      <DeleteAvaliacaoModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        avaliacao={prova}
        blockedReason={restrictions.deleteReason}
        isDeleting={deleteMutation.isPending}
        onConfirmDelete={() => deleteMutation.mutate()}
      />
    </section>
  );
}
