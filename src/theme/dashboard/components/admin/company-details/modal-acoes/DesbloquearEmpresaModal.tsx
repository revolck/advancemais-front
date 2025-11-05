"use client";
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
import { toastCustom } from "@/components/ui/custom/toast";
import { formatCnpj } from "../utils";
import type { AdminCompanyDetail } from "@/api/empresas/admin/types";
import { useCompanyMutations } from "../hooks/useCompanyMutations";

interface DesbloquearEmpresaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: AdminCompanyDetail;
}

export function DesbloquearEmpresaModal({
  isOpen,
  onOpenChange,
  company,
}: DesbloquearEmpresaModalProps) {
  const { revokeCompanyBan } = useCompanyMutations(company.id);
  const isLoading = revokeCompanyBan.status === "pending";

  const handleDesbloquear = async () => {
    try {
      await revokeCompanyBan.mutateAsync({
        observacoes: "Empresa desbloqueada pelo administrador",
      });

      toastCustom.success("Empresa desbloqueada com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao desbloquear empresa:", error);
      toastCustom.error("Erro ao desbloquear empresa. Tente novamente.");
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
