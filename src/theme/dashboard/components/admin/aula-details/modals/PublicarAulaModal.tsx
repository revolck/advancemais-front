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
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Aula } from "@/api/aulas";
import {
  validarPublicacao,
  validarDespublicacao,
  type ValidacaoPublicacao,
} from "../utils/validations";

interface PublicarAulaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aula: Aula | null;
  onConfirm: (publicar: boolean) => void;
  isProcessing?: boolean;
}

export function PublicarAulaModal({
  isOpen,
  onOpenChange,
  aula,
  onConfirm,
  isProcessing = false,
}: PublicarAulaModalProps) {
  if (!aula) return null;

  const isPublicada = aula.status === "PUBLICADA";
  const validacao: ValidacaoPublicacao | null = isPublicada
    ? null
    : validarPublicacao(aula);
  const validacaoDespublicacao = isPublicada
    ? validarDespublicacao(aula)
    : null;

  const handleConfirm = () => {
    onConfirm(!isPublicada);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const podeConfirmar = isPublicada
    ? validacaoDespublicacao?.podeDespublicar ?? false
    : validacao?.podePublicar ?? false;

  const customContent = () => {
    if (isPublicada) {
      // Conteúdo para despublicação
      return (
        <div className="space-y-4">
          {!validacaoDespublicacao?.podeDespublicar ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium !text-red-800 !leading-normal">
                    Esta ação não pode ser realizada!
                  </p>
                  <p className="text-xs text-gray-700 !leading-normal">
                    {validacaoDespublicacao?.motivo}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium !text-amber-800 !leading-normal">
                      Atenção: Esta ação pode impactar os alunos!
                    </p>
                    <ul className="text-xs text-gray-700 space-y-1 ml-3">
                      <li>• A aula será ocultada dos alunos</li>
                      <li>• Os eventos do Google Calendar serão cancelados</li>
                      <li>• Os alunos serão notificados sobre a despublicação</li>
                      <li>• O acesso aos materiais será bloqueado</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="!text-base text-gray-600 !leading-normal !mb-0">
                Tem certeza absoluta que deseja continuar com esta despublicação?
              </p>
            </>
          )}
        </div>
      );
    } else {
      // Conteúdo para publicação
      return (
        <div className="space-y-4">
          {validacao && validacao.camposFaltando.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium !text-red-800 !leading-normal">
                    Não é possível publicar a aula. Campos obrigatórios faltando!
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 ml-3">
                    {validacao.camposFaltando.map((campo) => (
                      <li key={campo}>• {campo}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validacao && validacao.bloqueios.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium !text-red-800 !leading-normal">
                    A publicação está bloqueada!
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 ml-3">
                    {validacao.bloqueios.map((bloqueio) => (
                      <li key={bloqueio}>• {bloqueio}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validacao && validacao.avisos.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium !text-amber-800 !leading-normal">
                    Avisos importantes:
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 ml-3">
                    {validacao.avisos.map((aviso) => (
                      <li key={aviso}>• {aviso}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validacao && validacao.podePublicar && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium !text-green-800 !leading-normal">
                      Todos os campos obrigatórios estão preenchidos!
                    </p>
                    <p className="text-xs text-gray-700 !leading-normal">
                      A aula pode ser publicada. Ao publicar, os alunos da turma
                      serão notificados e um evento será criado na agenda.
                    </p>
                  </div>
                </div>
              </div>

              <p className="!text-base text-gray-600 !leading-normal !mb-0">
                Tem certeza absoluta que deseja continuar com esta publicação?
              </p>
            </>
          )}
        </div>
      );
    }
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
            {isPublicada ? "Confirmar Despublicação" : "Confirmar Publicação"}
          </ModalTitle>
          <ModalDescription className="!mb-0 !leading-normal">
            Você está prestes a {isPublicada ? "despublicar" : "publicar"} a aula{" "}
            <span className="font-semibold text-gray-900">
              "{aula.titulo || "N/A"}"
            </span>
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          {customContent()}
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            {podeConfirmar && (
              <ButtonCustom
                variant={isPublicada ? "secondary" : "secondary"}
                onClick={handleConfirm}
                isLoading={isProcessing}
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

