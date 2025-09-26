"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { revokeAdminCompanyUserBan } from "@/api/empresas/admin";
import { toastCustom } from "@/components/ui/custom/toast";
import { formatCnpj } from "../utils";
import type { AdminCompanyDetail } from "@/api/empresas/admin/types";

interface DesbloquearEmpresaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: AdminCompanyDetail;
  onSuccess?: () => void;
}

export function DesbloquearEmpresaModal({
  isOpen,
  onOpenChange,
  company,
  onSuccess,
}: DesbloquearEmpresaModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDesbloquear = async () => {
    try {
      setIsLoading(true);

      await revokeAdminCompanyUserBan(company.id, {
        observacoes: "Empresa desbloqueada pelo administrador",
      });

      toastCustom.success("Empresa desbloqueada com sucesso!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao desbloquear empresa:", error);
      toastCustom.error("Erro ao desbloquear empresa. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      backdrop="blur"
      scrollBehavior="inside"
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Desbloquear empresa</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <p>
            Deseja desbloquear a empresa{" "}
            <strong className="text-[var(--secondary-color)]">
              {company.nome}
            </strong>
            {formatCnpj(company.cnpj) !== "—" && (
              <>
                {" "}
                (CNPJ:{" "}
                <strong className="text-[var(--secondary-color)]">
                  {formatCnpj(company.cnpj)}
                </strong>
                )
              </>
            )}
            ? A empresa terá acesso completo ao sistema novamente.
          </p>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <ButtonCustom
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="md"
              onClick={handleDesbloquear}
              isLoading={isLoading}
              loadingText="Desbloqueando..."
              disabled={isLoading}
            >
              Sim, desbloquear empresa
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
