"use client";

import Link from "next/link";
import { useState } from "react";
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
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Aula } from "@/api/aulas";
import { useRouter } from "next/navigation";
import {
  getStatusBadgeColor,
  formatAulaStatus,
} from "../utils";
import { DeleteAulaModal } from "../modals/DeleteAulaModal";
import { PublicarAulaMenuItem } from "./PublicarAulaMenuItem";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAula } from "@/api/aulas";
import { toastCustom } from "@/components/ui/custom";
import { queryKeys } from "@/lib/react-query/queryKeys";
import {
  validarExclusao,
  validarPublicacao,
  validarDespublicacao,
  validarPermissaoGestaoAula,
  podeAlterarStatus,
} from "../utils/validations";

interface HeaderInfoProps {
  aula: Aula;
  onUpdate?: () => void;
}

export function HeaderInfo({ aula, onUpdate }: HeaderInfoProps) {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mutation para excluir aula (deve ser chamado antes de qualquer early return)
  const deleteMutation = useMutation({
    mutationFn: (aulaId: string) => deleteAula(aulaId),
    onSuccess: async () => {
      toastCustom.success("Aula excluída com sucesso!");

      // Fechar modal antes de invalidar
      setIsDeleteModalOpen(false);

      // Invalidar todas as queries de listagem de aulas (com diferentes filtros)
      // A queryKey usada na listagem é ["aulas", params], então precisamos invalidar todas
      await queryClient.invalidateQueries({
        queryKey: ["aulas"],
        exact: false, // Invalida todas as queries que começam com ["aulas"]
        refetchType: "all", // Força refetch de todas as queries (ativas e inativas)
      });

      // Forçar refetch explícito de todas as queries de listagem
      await queryClient.refetchQueries({
        queryKey: ["aulas"],
        exact: false,
      });

      // Invalidar query de detalhes da aula deletada
      await queryClient.invalidateQueries({
        queryKey: queryKeys.aulas.detail(aula.id),
        exact: true,
        refetchType: "all",
      });

      // Remover a aula deletada do cache
      queryClient.removeQueries({
        queryKey: queryKeys.aulas.detail(aula.id),
        exact: true,
      });

      // Usar replace para evitar voltar à página deletada com botão voltar
      router.replace("/dashboard/cursos/aulas");
    },
    onError: (error: any) => {
      const errorData = error.response?.data || error;

      switch (errorData?.code) {
        case "FORBIDDEN":
          toastCustom.error("Você não tem permissão para esta aula");
          break;
        case "AULA_JA_REALIZADA":
          toastCustom.error(
            "Não é possível excluir aulas que já foram realizadas"
          );
          break;
        case "PRAZO_INSUFICIENTE":
          toastCustom.error(
            `Prazo insuficiente. A aula acontece em ${errorData.diasRestantes} dia(s). Mínimo de 5 dias de antecedência necessário.`
          );
          break;
        case "AULA_NOT_FOUND":
          toastCustom.error("Aula não encontrada");
          break;
        default:
          toastCustom.error(errorData?.message || "Erro ao excluir aula");
      }
    },
  });

  // Verificação de segurança (após hooks)
  if (!aula) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-white">
        <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8">
          <p className="text-sm text-gray-500">Carregando dados da aula...</p>
        </div>
      </section>
    );
  }

  const isPublicada = aula.status === "PUBLICADA";
  const permissaoGestao = validarPermissaoGestaoAula(aula, user?.role, user?.id);
  const podeEditar = permissaoGestao.podeGerenciar;
  const validacaoPublicacao = isPublicada ? null : validarPublicacao(aula);
  const validacaoDespublicacao = isPublicada
    ? validarDespublicacao(aula, user?.role, user?.id)
    : null;
  const podeAlterarPublicacao = podeAlterarStatus(
    aula.status,
    isPublicada ? "RASCUNHO" : "PUBLICADA",
    user?.role,
    aula,
    user?.id
  );
  const podePublicarDespublicar = Boolean(
    podeAlterarPublicacao &&
      (isPublicada
        ? validacaoDespublicacao?.podeDespublicar
        : validacaoPublicacao?.podePublicar)
  );
  const validacaoExclusao = validarExclusao(aula, user?.role, user?.id);
  const podeExcluir = validacaoExclusao.podeExcluir;
  const podeExibirAcoes = podeEditar || podePublicarDespublicar || podeExcluir;

  const handleEditClick = () => {
    router.push(`/dashboard/cursos/aulas/${aula.id}/editar`);
    setIsActionsOpen(false);
  };

  const handleConfirmDelete = async (aulaToDelete: typeof aula) => {
    try {
      await deleteMutation.mutateAsync(aulaToDelete.id);
      // O modal fecha e o redirecionamento acontece no onSuccess da mutation
    } catch (error) {
      // Erro já tratado no onError da mutation
      // Não fechar o modal em caso de erro para o usuário tentar novamente
    }
  };

  const statusBadge = (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        getStatusBadgeColor(aula.status)
      )}
    >
      {formatAulaStatus(aula.status)}
    </Badge>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 min-w-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold !mb-0">{aula.titulo}</h3>
              {statusBadge}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          {podeExibirAcoes && (
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
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {podeEditar && (
                  <DropdownMenuItem
                    onSelect={handleEditClick}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                )}
                {podePublicarDespublicar && (
                  <PublicarAulaMenuItem aula={aula} onSuccess={onUpdate} />
                )}
                {podeExcluir && (
                  <DropdownMenuItem
                    onSelect={() => {
                      setIsActionsOpen(false);
                      window.setTimeout(() => {
                        setIsDeleteModalOpen(true);
                      }, 0);
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
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link
              href="/dashboard/cursos/aulas"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* Modal de exclusão */}
      <DeleteAulaModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        aula={aula}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </section>
  );
}
