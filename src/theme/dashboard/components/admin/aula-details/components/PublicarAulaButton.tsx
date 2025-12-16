"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicarAula } from "@/api/aulas";
import { toastCustom } from "@/components/ui/custom";
import type { Aula } from "@/api/aulas";
import { PublicarAulaModal } from "../modals/PublicarAulaModal";
import {
  validarPublicacao,
  validarDespublicacao,
  podeAlterarStatus,
} from "../utils/validations";
import { useAuth } from "@/hooks/useAuth";

interface PublicarAulaButtonProps {
  aula: Aula;
  onSuccess?: () => void;
}

export function PublicarAulaButton({
  aula,
  onSuccess,
}: PublicarAulaButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPublicada = aula.status === "PUBLICADA";
  const validacao = isPublicada ? null : validarPublicacao(aula);
  const validacaoDespublicacao = isPublicada
    ? validarDespublicacao(aula, user?.role)
    : null;

  const podeAlterar = podeAlterarStatus(
    aula.status,
    isPublicada ? "RASCUNHO" : "PUBLICADA",
    user?.role
  );

  const publicarMutation = useMutation({
    mutationFn: (publicar: boolean) => publicarAula(aula.id, publicar),
    onSuccess: (data) => {
      const acao = isPublicada ? "despublicada" : "publicada";
      toastCustom.success(`Aula ${acao} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["aula", aula.id] });
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      setIsModalOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorData = error.response?.data || error;

      switch (errorData?.code) {
        case "CAMPOS_OBRIGATORIOS_FALTANDO":
          toastCustom.error(
            `Não é possível publicar. Campos faltando: ${errorData.camposFaltando?.join(", ") || "verifique os campos obrigatórios"}`
          );
          break;
        case "FORBIDDEN":
          toastCustom.error(
            "Você não tem permissão para publicar esta aula"
          );
          break;
        case "DATA_INVALIDA":
          toastCustom.error(
            "A data de início deve ser no futuro para aulas AO_VIVO"
          );
          break;
        case "STATUS_INVALIDO":
          toastCustom.error(
            "Não é possível despublicar uma aula em andamento ou concluída"
          );
          break;
        case "AULA_JA_REALIZADA":
          toastCustom.error(
            "Não é possível despublicar uma aula que já foi realizada"
          );
          break;
        default:
          toastCustom.error(
            errorData?.message || "Erro ao publicar/despublicar aula"
          );
      }
    },
  });

  const handleClick = () => {
    if (isPublicada) {
      // Despublicar
      if (!validacaoDespublicacao?.podeDespublicar) {
        toastCustom.error(
          validacaoDespublicacao?.motivo ||
            "Não é possível despublicar esta aula"
        );
        return;
      }
    } else {
      // Publicar
      if (!validacao?.podePublicar) {
        toastCustom.error(
          "Preencha todos os campos obrigatórios antes de publicar"
        );
        return;
      }
    }
    setIsModalOpen(true);
  };

  const handleConfirm = (publicar: boolean) => {
    publicarMutation.mutate(publicar);
  };

  const isDisabled =
    !podeAlterar ||
    publicarMutation.isPending ||
    (isPublicada
      ? !validacaoDespublicacao?.podeDespublicar
      : !validacao?.podePublicar);

  return (
    <>
      <Button
        variant={isPublicada ? "outline" : "default"}
        onClick={handleClick}
        disabled={isDisabled}
        className="flex items-center gap-2"
      >
        {publicarMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isPublicada ? "Despublicando..." : "Publicando..."}
          </>
        ) : (
          <>
            {isPublicada ? (
              <>
                <EyeOff className="h-4 w-4" />
                Despublicar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Publicar
              </>
            )}
          </>
        )}
      </Button>

      <PublicarAulaModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        aula={aula}
        onConfirm={handleConfirm}
        isProcessing={publicarMutation.isPending}
      />
    </>
  );
}

