"use client";

import React, { useState } from "react";
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
import { Users } from "lucide-react";
import type { CandidatoItem } from "../types";

interface EditarStatusCandidatoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidato: CandidatoItem | null;
  onSaveStatus: (
    candidatoId: string,
    newStatus: CandidatoItem["status"]
  ) => void;
}

// Opções de status para o select
const STATUS_OPTIONS = [
  {
    label: "Pendente",
    value: "pendente" as const,
  },
  {
    label: "Aprovado",
    value: "aprovado" as const,
  },
  {
    label: "Rejeitado",
    value: "rejeitado" as const,
  },
  {
    label: "Em Análise",
    value: "em_analise" as const,
  },
];

export function EditarStatusCandidatoModal({
  isOpen,
  onOpenChange,
  candidato,
  onSaveStatus,
}: EditarStatusCandidatoModalProps) {
  const [newStatus, setNewStatus] =
    useState<CandidatoItem["status"]>("pendente");

  // Atualizar o status quando o candidato mudar
  React.useEffect(() => {
    if (candidato) {
      setNewStatus(candidato.status);
    }
  }, [candidato]);

  const handleSave = () => {
    if (candidato) {
      onSaveStatus(candidato.id, newStatus);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!candidato) return null;

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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm !mb-0">
                  {candidato.nome}
                </div>
                <div className="text-[11px] text-gray-600">
                  Código:{" "}
                  <span className="font-mono px-2 py-1 rounded">
                    {candidato.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seleção de Status */}
          <div className="space-y-4">
            <SelectCustom
              mode="single"
              label="Novo Status"
              required
              options={STATUS_OPTIONS}
              value={newStatus}
              onChange={(value) =>
                setNewStatus(value as CandidatoItem["status"])
              }
              placeholder="Selecione o novo status"
              size="md"
              fullWidth
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <ButtonCustom
              variant="outline"
              size="md"
              onClick={handleCancel}
              className="px-6"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="md"
              onClick={handleSave}
              className="px-6"
            >
              Salvar Alterações
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
