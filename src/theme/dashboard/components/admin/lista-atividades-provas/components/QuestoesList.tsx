"use client";

import React, { useState } from "react";
import { ButtonCustom, EmptyState } from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Edit, Trash2, GripVertical, FileText, List, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Questao,
  CursosTipoQuestao,
} from "@/api/provas";
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
}

const getTipoLabel = (tipo: CursosTipoQuestao): string => {
  switch (tipo) {
    case CursosTipoQuestao.TEXTO:
      return "Texto";
    case CursosTipoQuestao.MULTIPLA_ESCOLHA:
      return "Múltipla Escolha";
    case CursosTipoQuestao.ANEXO:
      return "Anexo";
    default:
      return tipo;
  }
};

const getTipoIcon = (tipo: CursosTipoQuestao) => {
  switch (tipo) {
    case CursosTipoQuestao.TEXTO:
      return FileText;
    case CursosTipoQuestao.MULTIPLA_ESCOLHA:
      return List;
    case CursosTipoQuestao.ANEXO:
      return Paperclip;
    default:
      return FileText;
  }
};

export function QuestoesList({
  cursoId,
  turmaId,
  provaId,
}: QuestoesListProps) {
  const [questaoToDelete, setQuestaoToDelete] = useState<Questao | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const { data: questoes, isLoading, error, refetch } = useQuestoes({
    cursoId,
    turmaId,
    provaId,
  });

  const deleteQuestao = useDeleteQuestao({ cursoId, turmaId, provaId });

  const handleDelete = async () => {
    if (!questaoToDelete) return;

    try {
      await deleteQuestao.mutateAsync(questaoToDelete.id);
      toastCustom.success("Questão removida com sucesso!");
      setQuestaoToDelete(null);
      refetch();
    } catch (error: any) {
      toastCustom.error(
        error?.message || "Erro ao remover questão. Tente novamente."
      );
    }
  };

  const handleSuccess = () => {
    setRefetchKey((prev) => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

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

  if (!questoes || questoes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <CreateQuestaoModal
            cursoId={cursoId}
            turmaId={turmaId}
            provaId={provaId}
            onSuccess={handleSuccess}
            trigger={
              <ButtonCustom variant="primary" icon="Plus">
                Adicionar Questão
              </ButtonCustom>
            }
          />
        </div>
        <EmptyState
          illustration="books"
          title="Nenhuma questão cadastrada"
          description="Comece adicionando a primeira questão à prova."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateQuestaoModal
          cursoId={cursoId}
          turmaId={turmaId}
          provaId={provaId}
          onSuccess={handleSuccess}
          trigger={
            <ButtonCustom variant="primary" icon="Plus">
              Adicionar Questão
            </ButtonCustom>
          }
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Enunciado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Peso</TableHead>
              <TableHead className="text-center">Obrigatória</TableHead>
              <TableHead className="text-center">Alternativas</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questoes.map((questao, index) => {
              const TipoIcon = getTipoIcon(questao.tipo);
              return (
                <TableRow key={questao.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      {questao.ordem}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm font-medium line-clamp-2">
                        {questao.enunciado}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1.5">
                      <TipoIcon className="h-3 w-3" />
                      {getTipoLabel(questao.tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {questao.peso ? (
                      <span className="text-sm font-medium">{questao.peso}</span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {questao.obrigatoria ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">
                        Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {questao.tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA ? (
                      <span className="text-sm">
                        {questao.alternativas?.length || 0}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreateQuestaoModal
                        cursoId={cursoId}
                        turmaId={turmaId}
                        provaId={provaId}
                        questao={questao}
                        onSuccess={handleSuccess}
                        trigger={
                          <ButtonCustom
                            variant="ghost"
                            size="sm"
                            icon="Edit"
                            className="h-8 w-8 p-0"
                          />
                        }
                      />
                      <ButtonCustom
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setQuestaoToDelete(questao)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal de confirmação de exclusão */}
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

