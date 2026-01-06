"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { SelectCustom } from "@/components/ui/custom/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { CandidatoItem } from "../types";
import { getInitials } from "../utils/formatters";
import { listarStatusCandidatura } from "@/api/candidatos";
import { queryKeys } from "@/lib/react-query/queryKeys";

interface EditarStatusCandidatoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidato: CandidatoItem | null;
  currentStatusId?: string;
  onSaveStatus: (candidaturaId: string, statusId: string) => Promise<void>;
  isSaving?: boolean;
}

export function EditarStatusCandidatoModal({
  isOpen,
  onOpenChange,
  candidato,
  currentStatusId,
  onSaveStatus,
  isSaving = false,
}: EditarStatusCandidatoModalProps) {
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");

  // Buscar status disponíveis da API
  const {
    data: statusResponse,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: queryKeys.statusCandidatura.list(),
    queryFn: () => listarStatusCandidatura(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // Cache de 5 minutos
  });

  const statusList = useMemo(
    () => statusResponse?.data ?? [],
    [statusResponse?.data]
  );

  // Converter lista de status para opções do select
  const statusOptions = statusList.map((status) => ({
    label: status.nome.replace(/_/g, " "),
    value: status.id,
    description: status.descricao || undefined,
  }));

  // Atualizar o status selecionado quando o candidato mudar ou os status carregarem
  useEffect(() => {
    if (candidato && statusList.length > 0) {
      // Tentar encontrar o status atual pelo ID ou pelo nome
      let initialStatusId = currentStatusId;
      
      if (!initialStatusId && candidato.status) {
        // Tentar encontrar pelo nome do status
        const statusNome = String(candidato.status).toUpperCase().replace(/ /g, "_");
        const foundStatus = statusList.find(
          (s) => s.nome.toUpperCase() === statusNome || s.nome === candidato.status
        );
        initialStatusId = foundStatus?.id;
      }
      
      // Se ainda não encontrou, usar o status padrão
      if (!initialStatusId) {
        const defaultStatus = statusList.find((s) => s.isDefault);
        initialStatusId = defaultStatus?.id || statusList[0]?.id;
      }
      
      setSelectedStatusId(initialStatusId || "");
    }
  }, [candidato, currentStatusId, statusList]);

  const handleSave = async () => {
    if (candidato?.candidaturaId && selectedStatusId) {
      await onSaveStatus(candidato.candidaturaId, selectedStatusId);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!candidato) return null;

  // Encontrar o nome do status selecionado para exibição
  const selectedStatus = statusList.find((s) => s.id === selectedStatusId);
  const hasChanges = selectedStatusId !== currentStatusId;

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Editar Status do Candidato</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4 p-1">
          {/* Informações do Candidato */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={candidato.avatarUrl || undefined}
                  alt={candidato.nome}
                />
                <AvatarFallback className="bg-primary/10 text-primary/80 text-xs font-semibold">
                  {getInitials(candidato.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm !mb-0">
                  {candidato.nome}
                </div>
                {candidato.codUsuario && (
                  <div className="text-[11px] text-gray-600">
                    Código:{" "}
                    <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {candidato.codUsuario}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seleção de Status */}
          <div className="space-y-4">
            {isLoadingStatus ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : statusError ? (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                Erro ao carregar status disponíveis. Tente novamente.
              </div>
            ) : (
              <SelectCustom
                mode="single"
                label="Novo Status"
                required
                options={statusOptions}
                value={selectedStatusId}
                onChange={(value) => setSelectedStatusId(value as string)}
                placeholder="Selecione o novo status"
                size="md"
                fullWidth
              />
            )}

            {/* Info sobre o status atual */}
            {selectedStatus?.descricao && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                <strong>Descrição:</strong> {selectedStatus.descricao}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <ButtonCustom
              variant="outline"
              size="md"
              onClick={handleCancel}
              className="px-6"
              disabled={isSaving}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="md"
              onClick={handleSave}
              className="px-6"
              disabled={isSaving || isLoadingStatus || !selectedStatusId}
              isLoading={isSaving}
              loadingText="Salvando..."
            >
              Salvar Alterações
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
