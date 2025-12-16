"use client";

import React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Aula } from "@/api/aulas";
import { useAuth } from "@/hooks/useAuth";

interface DeleteAulaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aula: Aula | null;
  onConfirmDelete: (aula: Aula) => void;
  isDeleting?: boolean;
}

/**
 * Calcula se a aula pode ser excluída baseado nas regras:
 * - Aula ainda não aconteceu
 * - Mínimo 5 dias antes da data da aula
 */
function podeExcluirAula(aula: Aula | null): {
  pode: boolean;
  motivo?: string;
} {
  if (!aula) {
    return { pode: false, motivo: "Aula não encontrada" };
  }

  // Verificar se tem data de início
  if (!aula.dataInicio) {
    // Aulas ONLINE podem não ter data, permitir exclusão
    if (aula.modalidade === "ONLINE") {
      return { pode: true };
    }
    return { pode: false, motivo: "Aula sem data de início definida" };
  }

  const dataAula = new Date(aula.dataInicio);
  const hoje = new Date();
  
  // Normalizar para comparar apenas datas (ignorar horas)
  hoje.setHours(0, 0, 0, 0);
  dataAula.setHours(0, 0, 0, 0);

  // Verificar se a aula já aconteceu
  if (dataAula < hoje) {
    return {
      pode: false,
      motivo: "Não é possível excluir aulas que já foram realizadas",
    };
  }

  // Calcular diferença em dias
  const diffTime = dataAula.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Verificar se há pelo menos 5 dias antes da aula
  if (diffDays < 5) {
    return {
      pode: false,
      motivo: `A exclusão deve ser feita com no mínimo 5 dias de antecedência. A aula acontece em ${diffDays} dia(s).`,
    };
  }

  return { pode: true };
}

export function DeleteAulaModal({
  isOpen,
  onOpenChange,
  aula,
  onConfirmDelete,
  isDeleting = false,
}: DeleteAulaModalProps) {
  const { user } = useAuth();

  // Verificar permissões
  const rolesPermitidos = ["ADMIN", "MODERADOR", "PEDAGOGICO"];
  const temPermissao = user?.role && rolesPermitidos.includes(user.role);

  // Verificar regras de exclusão
  const validacaoExclusao = podeExcluirAula(aula);
  const podeExcluir = temPermissao && validacaoExclusao.pode;

  const handleConfirmDelete = () => {
    if (aula && podeExcluir) {
      onConfirmDelete(aula);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  /**
   * Retorna os impactos específicos baseados na modalidade da aula
   */
  const getImpactosPorModalidade = (aula: Aula): string[] => {
    const impactosBase = [
      "Todos os dados relacionados serão perdidos permanentemente",
      "Materiais complementares serão removidos",
      "Eventos na agenda serão removidos",
      "Progresso dos alunos será perdido",
      "A operação não poderá ser desfeita",
      "A aula será removida permanentemente do sistema",
    ];

    const modalidade = aula.modalidade?.toUpperCase();

    switch (modalidade) {
      case "ONLINE":
        return [
          ...impactosBase,
          "Links do YouTube serão removidos",
          "Conteúdo online será perdido",
        ];

      case "AO_VIVO":
        return [
          ...impactosBase,
          "Links do Google Meet serão cancelados",
          "Transmissão ao vivo será interrompida",
        ];

      case "PRESENCIAL":
        return [
          ...impactosBase,
          "Reserva de sala será cancelada",
          "Presença dos alunos será perdida",
        ];

      case "SEMIPRESENCIAL":
        return [
          ...impactosBase,
          "Links do Google Meet serão cancelados (se houver)",
          "Links do YouTube serão removidos (se houver)",
          "Reserva de sala será cancelada (se houver)",
        ];

      default:
        return impactosBase;
    }
  };

  const customDeleteContent = (aula: Aula) => {
    const impactos = getImpactosPorModalidade(aula);

    return (
      <div className="space-y-4">
        {/* Alerta de ação irreversível */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium !text-red-800 !leading-normal">
                Esta ação é irreversível e pode impactar todo o sistema!
              </p>
              <ul className="text-xs text-gray-700 space-y-1 ml-3">
                {impactos.map((impacto, index) => (
                  <li key={index}>• {impacto}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mensagem de confirmação */}
        <p className="!text-base text-gray-600 !leading-normal !mb-0">
          Tem certeza absoluta que deseja continuar com esta exclusão?
        </p>
      </div>
    );
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Confirmar Exclusão</ModalTitle>
          <ModalDescription className="!mb-0 !leading-normal">
            Você está prestes a excluir a aula{" "}
            <span className="font-semibold text-gray-900">
              "{aula?.titulo || "N/A"}"
            </span>
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          {/* Mensagens de erro/permissão */}
          {!temPermissao && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ação não permitida:</strong> Apenas administradores,
                moderadores e equipe pedagógica podem excluir aulas.
              </AlertDescription>
            </Alert>
          )}

          {temPermissao && !validacaoExclusao.pode && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ação não permitida:</strong> {validacaoExclusao.motivo}
              </AlertDescription>
            </Alert>
          )}

          {/* Conteúdo do modal */}
          {aula && podeExcluir && customDeleteContent(aula)}
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            {podeExcluir && (
              <ButtonCustom
                variant="danger"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                loadingText="Excluindo..."
                size="md"
              >
                Sim, excluir
              </ButtonCustom>
            )}
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
