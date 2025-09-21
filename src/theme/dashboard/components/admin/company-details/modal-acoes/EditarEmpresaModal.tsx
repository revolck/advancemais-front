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
  ModalDescription,
} from "@/components/ui/custom/modal";
import { InputCustom } from "@/components/ui/custom/input";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import { lookupCep, normalizeCep, isValidCep } from "@/lib/cep";
import { updateAdminCompany } from "@/api/empresas";
import type {
  AdminCompanyDetail,
  UpdateAdminCompanyPayload,
} from "@/api/empresas/admin/types";

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
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  logradouro: string;
  complemento: string;
  numero: string;
};

export function EditarEmpresaModal({
  isOpen,
  onOpenChange,
  company,
  onCompanyUpdated,
}: EditarEmpresaModalProps) {
  const initialValues = useMemo<CompanyFormState>(
    () => ({
      telefone: company.telefone ?? "",
      email: company.email ?? "",
      instagram: company.instagram ?? "",
      linkedin: company.linkedin ?? "",
      cep: company.cep ? normalizeCep(company.cep) : "",
      cidade: company.cidade ?? "",
      estado: company.estado ?? "",
      bairro: company.bairro ?? "",
      logradouro: company.logradouro ?? "",
      complemento: company.complemento ?? "",
      numero: company.numero ?? "",
    }),
    [company]
  );

  const [formState, setFormState] = useState<CompanyFormState>(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialValues);
      setIsSaving(false);
      setIsCepLoading(false);
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

  const handleCepChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const normalized = normalizeCep(rawValue);

      setFormState((prev) => ({
        ...prev,
        cep: normalized,
      }));

      const digits = normalized.replace(/\D/g, "");
      if (digits.length !== 8 || isCepLoading) {
        return;
      }

      setIsCepLoading(true);

      try {
        const result = await lookupCep(normalized);

        if ("error" in result) {
          toastCustom.error({
            title: "Não foi possível buscar o CEP",
            description: result.error,
          });
          return;
        }

        setFormState((prev) => ({
          ...prev,
          cep: result.cep,
          logradouro: result.street || prev.logradouro,
          bairro: result.neighborhood || prev.bairro,
          cidade: result.city || prev.cidade,
          estado: result.state || prev.estado,
          complemento: result.complement || prev.complemento,
        }));
      } finally {
        setIsCepLoading(false);
      }
    },
    [isCepLoading]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    if (formState.cep && !isValidCep(formState.cep)) {
      toastCustom.error({
        title: "CEP inválido",
        description: "Informe um CEP válido no formato 00000-000 para continuar.",
      });
      return;
    }

    const sanitize = (value: string): string | null => {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const sanitizedCep = formState.cep
      ? formState.cep.replace(/\D/g, "") || null
      : null;

    const payload: UpdateAdminCompanyPayload = {
      telefone: sanitize(formState.telefone),
      email: sanitize(formState.email),
      instagram: sanitize(formState.instagram),
      linkedin: sanitize(formState.linkedin),
      cep: sanitizedCep,
      cidade: sanitize(formState.cidade),
      estado: sanitize(formState.estado),
      bairro: sanitize(formState.bairro),
      logradouro: sanitize(formState.logradouro),
      complemento: sanitize(formState.complemento),
      numero: sanitize(formState.numero),
    };

    setIsSaving(true);

    try {
      await updateAdminCompany(company.id, payload);

      const formattedCep = payload.cep ? normalizeCep(payload.cep) : null;

      onCompanyUpdated({
        telefone: payload.telefone ?? null,
        email: payload.email ?? null,
        instagram: payload.instagram ?? null,
        linkedin: payload.linkedin ?? null,
        cep: formattedCep,
        cidade: payload.cidade ?? null,
        estado: payload.estado ?? null,
        bairro: payload.bairro ?? null,
        logradouro: payload.logradouro ?? null,
        complemento: payload.complemento ?? null,
        numero: payload.numero ?? null,
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
  }, [company.id, formState, handleClose, isSaving, onCompanyUpdated]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      size="2xl"
      backdrop="blur"
      classNames={{ base: "max-h-[85vh]" }}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Editar empresa</ModalTitle>
          <ModalDescription>
            Atualize as informações de contato e endereço da empresa. Após salvar, os campos ficarão bloqueados até a conclusão da operação.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="Telefone"
                value={formState.telefone}
                onChange={handleInputChange("telefone")}
                disabled={isSaving}
                mask="phone"
              />
              <InputCustom
                label="E-mail"
                type="email"
                value={formState.email}
                onChange={handleInputChange("email")}
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="Instagram"
                value={formState.instagram}
                onChange={handleInputChange("instagram")}
                disabled={isSaving}
                placeholder="@empresa"
              />
              <InputCustom
                label="LinkedIn"
                value={formState.linkedin}
                onChange={handleInputChange("linkedin")}
                disabled={isSaving}
                placeholder="linkedin.com/in/empresa"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="CEP"
                value={formState.cep}
                onChange={handleCepChange}
                disabled={isSaving || isCepLoading}
                maxLength={9}
                helperText={
                  isCepLoading
                    ? "Consultando CEP..."
                    : "Buscaremos automaticamente o endereço ao informar o CEP completo"
                }
                rightIcon={isCepLoading ? "Loader2" : undefined}
              />
              <InputCustom
                label="Número"
                value={formState.numero}
                onChange={handleInputChange("numero")}
                disabled={isSaving || isCepLoading}
              />
            </div>

            <InputCustom
              label="Logradouro"
              value={formState.logradouro}
              onChange={handleInputChange("logradouro")}
              disabled={isSaving || isCepLoading}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="Bairro"
                value={formState.bairro}
                onChange={handleInputChange("bairro")}
                disabled={isSaving || isCepLoading}
              />
              <InputCustom
                label="Complemento"
                value={formState.complemento}
                onChange={handleInputChange("complemento")}
                disabled={isSaving || isCepLoading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="Cidade"
                value={formState.cidade}
                onChange={handleInputChange("cidade")}
                disabled={isSaving || isCepLoading}
              />
              <InputCustom
                label="Estado"
                value={formState.estado}
                onChange={handleInputChange("estado")}
                disabled={isSaving || isCepLoading}
                maxLength={2}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSave}
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
