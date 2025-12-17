"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { Building2 } from "lucide-react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import type {
  AdminCompanyDetail,
  UpdateAdminCompanyPayload,
} from "@/api/empresas/admin/types";
import MaskService from "@/services/components/input/maskService";
import { useCompanyMutations } from "../hooks/useCompanyMutations";

interface EditarEmpresaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: AdminCompanyDetail;
}

type CompanyFormState = {
  telefone: string;
  email: string;
  instagram: string;
  linkedin: string;
  descricao: string;
};

export function EditarEmpresaModal({
  isOpen,
  onOpenChange,
  company,
}: EditarEmpresaModalProps) {
  const initialValues = useMemo<CompanyFormState>(() => {
    const maskService = MaskService.getInstance();
    const telefoneRaw = company.telefone ?? "";
    const telefoneMasked = telefoneRaw
      ? maskService.applyMask(telefoneRaw, "phone")
      : "";

    return {
      telefone: telefoneMasked,
      email: company.email ?? "",
      instagram: company.socialLinks?.instagram ?? "",
      linkedin: company.socialLinks?.linkedin ?? "",
      descricao: company.descricao ?? company.informacoes?.descricao ?? "",
    };
  }, [company]);

  const [formState, setFormState] = useState<CompanyFormState>(initialValues);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const { updateCompanyProfile } = useCompanyMutations(company.id);
  const isSaving = updateCompanyProfile.status === "pending";

  useEffect(() => {
    if (isOpen) {
      setFormState(initialValues);
    }
  }, [initialValues, isOpen]);

  const handleInputChange = useCallback(
    (field: keyof CompanyFormState) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      },
    []
  );

  const handleTextareaChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value.slice(0, 500);
      setFormState((prev) => ({
        ...prev,
        descricao: value,
      }));
    },
    []
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    const sanitize = (value: string): string | null => {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const emailSanitizado = sanitize(formState.email);
    if (!emailSanitizado) {
      toastCustom.error({
        title: "Email obrigatório",
        description: "O campo email é obrigatório.",
      });
      return;
    }

    // Preparar payload apenas com campos que mudaram
    const maskService = MaskService.getInstance();
    const payload: UpdateAdminCompanyPayload = {};
    let hasChanges = false;

    if (emailSanitizado !== (company.email || "")) {
      payload.email = emailSanitizado;
      hasChanges = true;
    }

    const telefoneSanitizado = sanitize(formState.telefone);
    if (telefoneSanitizado) {
      if (!maskService.validate(telefoneSanitizado, "phone")) {
        toastCustom.error({
          title: "Telefone inválido",
          description: "Informe um telefone completo com DDD antes de salvar.",
        });
        return;
      }

      const digits = maskService.removeMask(telefoneSanitizado, "phone");
      const currentDigits = (company.telefone || "").replace(/\D/g, "");
      if (digits !== currentDigits) {
        payload.telefone = digits;
        hasChanges = true;
      }
    } else if (company.telefone) {
      payload.telefone = null;
      hasChanges = true;
    }

    const descricaoSanitizada = sanitize(formState.descricao);
    const descricaoAtual =
      company.descricao ?? company.informacoes?.descricao ?? "";
    if (descricaoSanitizada !== null) {
      if (descricaoAtual !== descricaoSanitizada) {
        payload.descricao = descricaoSanitizada;
        hasChanges = true;
      }
    } else if (company.descricao || company.informacoes?.descricao) {
      payload.descricao = null;
      hasChanges = true;
    }

    const instagramSanitizado = sanitize(formState.instagram);
    const instagramAtual = company.socialLinks?.instagram;
    if (instagramSanitizado !== null) {
      if (instagramAtual !== instagramSanitizado) {
        payload.instagram = instagramSanitizado;
        hasChanges = true;
      }
    } else if (instagramAtual) {
      payload.instagram = null;
      hasChanges = true;
    }

    const linkedinSanitizado = sanitize(formState.linkedin);
    const linkedinAtual = company.socialLinks?.linkedin;
    if (linkedinSanitizado !== null) {
      if (linkedinAtual !== linkedinSanitizado) {
        payload.linkedin = linkedinSanitizado;
        hasChanges = true;
      }
    } else if (linkedinAtual) {
      payload.linkedin = null;
      hasChanges = true;
    }

    if (!hasChanges) {
      toastCustom.info({
        title: "Nenhuma alteração",
        description:
          "Atualize os campos antes de salvar ou feche a modal para sair.",
      });
      return;
    }

    try {
      setLoadingStep("Salvando alterações...");
      await updateCompanyProfile.mutateAsync(payload);
      
      setLoadingStep("Finalizando...");
      toastCustom.success({
        title: "Dados atualizados",
        description: "As informações da empresa foram salvas com sucesso.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao atualizar empresa", error);

      // Determinar tipo de erro para mensagem mais específica
      let errorMessage =
        "Não foi possível atualizar os dados da empresa. Tente novamente em instantes.";

      if (error instanceof Error) {
        if (
          error.message.includes("404") ||
          error.message.includes("não encontrada")
        ) {
          errorMessage =
            "Empresa não encontrada. Verifique se o ID da empresa está correto.";
        } else if (
          error.message.includes("400") ||
          error.message.includes("Dados inválidos")
        ) {
          errorMessage =
            "Dados inválidos. Verifique se todos os campos obrigatórios estão preenchidos corretamente.";
        } else if (error.message.includes("telefone")) {
          errorMessage =
            "Formato de telefone inválido. Verifique se o telefone está no formato correto.";
        }
      }

      toastCustom.error({
        title: "Erro ao salvar",
        description: errorMessage,
      });
    } finally {
      setLoadingStep("");
    }
  }, [
    company.email,
    company.telefone,
    company.descricao,
    company.informacoes,
    company.socialLinks,
    formState,
    handleClose,
    isSaving,
    updateCompanyProfile,
  ]);

  return (
    <>
      <FormLoadingModal
        isLoading={isSaving}
        title="Salvando..."
        loadingStep={loadingStep}
        icon={Building2}
      />

      <ModalCustom
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="2xl"
        backdrop="blur"
      >
        <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Editar empresa</ModalTitle>
        </ModalHeader>

        <ModalBody className="max-h-[70vh] overflow-y-auto pr-1 p-1">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="Telefone/Whatsapp"
                size="sm"
                value={formState.telefone}
                onChange={handleInputChange("telefone")}
                disabled={isSaving}
                mask="phone"
              />
              <InputCustom
                label="E-mail"
                type="email"
                size="sm"
                value={formState.email}
                onChange={handleInputChange("email")}
                disabled={isSaving}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="Instagram"
                size="sm"
                value={formState.instagram}
                onChange={handleInputChange("instagram")}
                disabled={isSaving}
                placeholder="instagram.com/empresa/"
              />
              <InputCustom
                label="LinkedIn"
                size="sm"
                value={formState.linkedin}
                onChange={handleInputChange("linkedin")}
                disabled={isSaving}
                placeholder="linkedin.com/in/empresa"
              />
            </div>

            <SimpleTextarea
              label="Descrição da empresa"
              value={formState.descricao}
              onChange={handleTextareaChange}
              disabled={isSaving}
              placeholder="Descreva brevemente a empresa."
              maxLength={500}
              showCharCount
              className="min-h-[100px]"
            />
          </div>
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="outline"
            onClick={handleClose}
            size="md"
            disabled={isSaving}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSave}
            size="md"
            isLoading={isSaving}
            loadingText="Salvando..."
          >
            Salvar alterações
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
    </>
  );
}
