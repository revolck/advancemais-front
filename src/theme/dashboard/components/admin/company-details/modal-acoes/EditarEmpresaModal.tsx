"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
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
import { updateAdminCompany } from "@/api/empresas";
import type {
  AdminCompanyDetail,
  UpdateAdminCompanyPayload,
} from "@/api/empresas/admin/types";
import MaskService from "@/services/components/input/maskService";

interface EditarEmpresaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: AdminCompanyDetail;
  onCompanyUpdated: (updates: Partial<AdminCompanyDetail>) => void;
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
  onCompanyUpdated,
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
      descricao: company.informacoes?.descricao ?? "",
    };
  }, [company]);

  const [formState, setFormState] = useState<CompanyFormState>(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialValues);
      setIsSaving(false);
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

    const payload: UpdateAdminCompanyPayload = {
      telefone: sanitize(formState.telefone) ?? undefined,
      descricao: sanitize(formState.descricao) ?? undefined,
    };

    setIsSaving(true);

    try {
      await updateAdminCompany(company.id, payload);

      onCompanyUpdated({
        telefone: payload.telefone ?? undefined,
        email: formState.email,
        informacoes: {
          ...company.informacoes,
          descricao: payload.descricao ?? "",
        },
        socialLinks: {
          instagram: formState.instagram || undefined,
          linkedin: formState.linkedin || undefined,
        },
      });

      toastCustom.success({
        title: "Dados atualizados",
        description: "As informações da empresa foram salvas com sucesso.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao atualizar empresa", error);
      toastCustom.error({
        title: "Erro ao salvar",
        description:
          "Não foi possível atualizar os dados da empresa. Tente novamente em instantes.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    company.id,
    company.informacoes,
    formState,
    handleClose,
    isSaving,
    onCompanyUpdated,
  ]);

  return (
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
            variant="ghost"
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
  );
}
