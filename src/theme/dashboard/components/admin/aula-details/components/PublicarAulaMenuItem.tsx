"use client";

import React, { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { queryKeys } from "@/lib/react-query/queryKeys";

interface PublicarAulaMenuItemProps {
  aula: Aula;
  onSuccess?: () => void;
}

export function PublicarAulaMenuItem({
  aula,
  onSuccess,
}: PublicarAulaMenuItemProps) {
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
      
      // ✅ Atualizar o cache diretamente com os dados retornados (atualização IMEDIATA)
      // Isso garante que a UI seja atualizada instantaneamente sem precisar de refetch
      const detailKey = queryKeys.aulas.detail(aula.id);
      queryClient.setQueryData(detailKey, data);
      
      // Invalidar queries de listagem para atualizar a lista (em background)
      queryClient.invalidateQueries({ 
        queryKey: ["aulas"],
        exact: false,
      });
      
      setIsModalOpen(false);
      
      // Não chamar onSuccess aqui, pois ele invalida a query de detalhes
      // e isso pode sobrescrever os dados que acabamos de atualizar com setQueryData
      // A atualização já foi feita diretamente no cache acima
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
    
    // Usar setTimeout para garantir que o dropdown feche antes de abrir o modal
    setTimeout(() => {
      setIsModalOpen(true);
    }, 200);
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

  // Se não pode publicar/despublicar, não renderizar o item
  if (!podeAlterar) {
    return null;
  }

  if (isPublicada && !validacaoDespublicacao?.podeDespublicar) {
    return null;
  }

  if (!isPublicada && !validacao?.podePublicar) {
    return null;
  }

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          // Não fechar o dropdown imediatamente, deixar o setTimeout fazer isso
          handleClick();
        }}
        disabled={isDisabled}
        className="cursor-pointer"
        onPointerDown={(e) => {
          // Prevenir que o dropdown feche imediatamente
          e.preventDefault();
        }}
      >
        {publicarMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            <span>{isPublicada ? "Despublicando..." : "Publicando..."}</span>
          </>
        ) : (
          <>
            {isPublicada ? (
              <>
                <EyeOff className="h-4 w-4 text-gray-500" />
                <span>Despublicar</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-gray-500" />
                <span>Publicar</span>
              </>
            )}
          </>
        )}
      </DropdownMenuItem>

      {isModalOpen && (
        <PublicarAulaModal
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            // Só fechar se não estiver processando
            if (!publicarMutation.isPending) {
              setIsModalOpen(open);
            }
          }}
          aula={aula}
          onConfirm={handleConfirm}
          isProcessing={publicarMutation.isPending}
        />
      )}
    </>
  );
}

