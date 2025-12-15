"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteAula } from "@/api/aulas";
import { toastCustom } from "@/components/ui/custom";
import type { Aula } from "@/api/aulas";
import { useAuth } from "@/hooks/useAuth";

interface DeleteAulaModalProps {
  aula: Aula;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAulaModal({
  aula,
  open,
  onOpenChange,
}: DeleteAulaModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // Verificar se o usuário pode excluir
  const isInstrutor = user?.role === "INSTRUTOR";
  const aulaJaComecou = aula.dataInicio
    ? new Date(aula.dataInicio) < new Date()
    : false;

  // Instrutores não podem excluir
  const podeExcluir = !isInstrutor && !aulaJaComecou;

  const deleteMutation = useMutation({
    mutationFn: () => deleteAula(aula.id),
    onSuccess: () => {
      toastCustom.success("Aula excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      router.push("/dashboard/cursos/aulas");
    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao excluir aula");
    },
  });

  const handleConfirm = async () => {
    if (!podeExcluir) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync();
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Excluir aula
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            {!podeExcluir ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {isInstrutor && (
                    <>
                      <strong>Ação não permitida:</strong> Instrutores não
                      podem excluir aulas. Entre em contato com a equipe
                      pedagógica.
                    </>
                  )}
                  {!isInstrutor && aulaJaComecou && (
                    <>
                      <strong>Ação não permitida:</strong> Não é possível
                      excluir aulas que já aconteceram.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <p>
                  Tem certeza que deseja excluir a aula{" "}
                  <strong className="text-gray-900">{aula.titulo}</strong>?
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-sm">
                    Esta ação não pode ser desfeita. Todos os dados relacionados
                    à aula serão permanentemente removidos.
                  </AlertDescription>
                </Alert>
                {aula.turma && (
                  <p className="text-sm text-gray-600">
                    <strong>Turma associada:</strong> {aula.turma.nome}
                  </p>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          {podeExcluir && (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir aula"
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}



