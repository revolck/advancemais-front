"use client";

import React, { useMemo } from "react";
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
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { Aula, AulaStatus } from "@/api/aulas";
import { useAuth } from "@/hooks/useAuth";

interface PublishAulaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aula: Aula | null;
  onConfirm: (aula: Aula, novoStatus: AulaStatus) => void;
  isUpdating?: boolean;
}

/**
 * Valida se a aula pode ser publicada baseado nos pré-requisitos por modalidade
 */
function validarPreRequisitosPublicacao(aula: Aula | null): {
  podePublicar: boolean;
  camposFaltando: string[];
  erros: string[];
} {
  if (!aula) {
    return {
      podePublicar: false,
      camposFaltando: [],
      erros: ["Aula não encontrada"],
    };
  }

  const camposFaltando: string[] = [];
  const erros: string[] = [];

  // Campos obrigatórios para todas as modalidades
  if (!aula.titulo || aula.titulo.trim() === "") {
    camposFaltando.push("título");
  }
  if (!aula.descricao || aula.descricao.trim() === "") {
    camposFaltando.push("descrição");
  }

  const modalidade = aula.modalidade?.toUpperCase();

  switch (modalidade) {
    case "PRESENCIAL":
      if (!aula.dataInicio) {
        camposFaltando.push("data de início");
      }
      break;

    case "AO_VIVO":
      if (!aula.dataInicio) {
        camposFaltando.push("data de início");
      } else {
        const dataInicio = new Date(aula.dataInicio);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataInicio.setHours(0, 0, 0, 0);
        if (dataInicio <= hoje) {
          erros.push("Aulas AO_VIVO devem ter data de início no futuro");
        }
      }
      break;

    case "SEMIPRESENCIAL":
      // SEMIPRESENCIAL precisa de título e descrição (já validados acima)
      // Se tiver dataInicio, deve ser no futuro
      if (aula.dataInicio) {
        const dataInicio = new Date(aula.dataInicio);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataInicio.setHours(0, 0, 0, 0);
        if (dataInicio <= hoje) {
          erros.push("Se informada, a data de início deve ser no futuro");
        }
      }
      break;

    case "ONLINE":
      if (!aula.youtubeUrl || aula.youtubeUrl.trim() === "") {
        camposFaltando.push("link do YouTube");
      }
      break;

    default:
      erros.push("Modalidade não reconhecida");
  }

  return {
    podePublicar: camposFaltando.length === 0 && erros.length === 0,
    camposFaltando,
    erros,
  };
}

/**
 * Verifica se o usuário pode alterar o status da aula
 */
function podeAlterarStatus(
  aula: Aula | null,
  userRole?: string,
  userId?: string
): {
  pode: boolean;
  motivo?: string;
} {
  if (!aula) {
    return { pode: false, motivo: "Aula não encontrada" };
  }

  // Verificar se aula está em andamento
  if (aula.status === "EM_ANDAMENTO") {
    return {
      pode: false,
      motivo: "Não é possível alterar o status de uma aula em andamento",
    };
  }

  // Verificar se aula está concluída
  if (aula.status === "CONCLUIDA") {
    if (userRole !== "ADMIN") {
      return {
        pode: false,
        motivo: "Apenas administradores podem alterar aulas concluídas",
      };
    }
  }

  // Verificar permissões de INSTRUTOR
  if (userRole === "INSTRUTOR") {
    // INSTRUTOR só pode editar aulas que ele criou
    // Assumindo que temos acesso ao criadoPorId (pode precisar ajustar)
    // Por enquanto, vamos permitir se não houver restrição explícita
  }

  return { pode: true };
}

export function PublishAulaModal({
  isOpen,
  onOpenChange,
  aula,
  onConfirm,
  isUpdating = false,
}: PublishAulaModalProps) {
  const { user } = useAuth();

  const isPublicada = aula?.status === "PUBLICADA";
  const novoStatus: AulaStatus = isPublicada ? "RASCUNHO" : "PUBLICADA";
  const acao = isPublicada ? "despublicar" : "publicar";

  // Validar pré-requisitos (apenas ao publicar)
  const validacaoPreRequisitos = useMemo(() => {
    if (isPublicada) {
      // Ao despublicar, não precisa validar pré-requisitos
      return { podePublicar: true, camposFaltando: [], erros: [] };
    }
    return validarPreRequisitosPublicacao(aula);
  }, [aula, isPublicada]);

  // Validar permissões
  const validacaoPermissoes = useMemo(() => {
    return podeAlterarStatus(aula, user?.role, user?.id);
  }, [aula, user?.role, user?.id]);

  const podeConfirmar =
    validacaoPermissoes.pode &&
    (isPublicada || validacaoPreRequisitos.podePublicar);

  const handleConfirm = () => {
    if (aula && podeConfirmar) {
      onConfirm(aula, novoStatus);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
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
          <ModalTitle>
            {isPublicada ? "Despublicar Aula" : "Publicar Aula"}
          </ModalTitle>
          <ModalDescription className="!mb-0 !leading-normal">
            Você está prestes a {acao} a aula{" "}
            <span className="font-semibold text-gray-900">
              "{aula?.titulo || "N/A"}"
            </span>
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          {/* Mensagens de erro/permissão */}
          {!validacaoPermissoes.pode && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ação não permitida:</strong>{" "}
                {validacaoPermissoes.motivo}
              </AlertDescription>
            </Alert>
          )}

          {/* Validação de pré-requisitos (apenas ao publicar) */}
          {!isPublicada &&
            validacaoPermissoes.pode &&
            !validacaoPreRequisitos.podePublicar && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Não é possível publicar esta aula:</strong>
                  {validacaoPreRequisitos.camposFaltando.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Campos obrigatórios faltando:</p>
                      <ul className="list-disc list-inside mt-1">
                        {validacaoPreRequisitos.camposFaltando.map(
                          (campo, index) => (
                            <li key={index}>{campo}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {validacaoPreRequisitos.erros.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Erros:</p>
                      <ul className="list-disc list-inside mt-1">
                        {validacaoPreRequisitos.erros.map((erro, index) => (
                          <li key={index}>{erro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

          {/* Informações sobre a ação */}
          {podeConfirmar && (
            <Alert
              variant={isPublicada ? "default" : "default"}
              className={
                isPublicada
                  ? "bg-amber-50 border-amber-200"
                  : "bg-blue-50 border-blue-200"
              }
            >
              {isPublicada ? (
                <XCircle className="h-4 w-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription
                className={
                  isPublicada ? "text-amber-800" : "text-blue-800"
                }
              >
                {isPublicada ? (
                  <>
                    <strong>Atenção:</strong> Ao despublicar, a aula voltará
                    para rascunho e pode não estar mais visível para os alunos.
                  </>
                ) : (
                  <>
                    <strong>Informação:</strong> Ao publicar, a aula ficará
                    visível para os alunos da turma (se houver turma vinculada).
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            {podeConfirmar && (
              <ButtonCustom
                variant={isPublicada ? "secondary" : "default"}
                onClick={handleConfirm}
                isLoading={isUpdating}
                loadingText={isPublicada ? "Despublicando..." : "Publicando..."}
                size="md"
              >
                {isPublicada ? "Sim, despublicar" : "Sim, publicar"}
              </ButtonCustom>
            )}
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

