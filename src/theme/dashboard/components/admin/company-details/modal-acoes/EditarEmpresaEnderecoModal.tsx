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
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import { lookupCep, normalizeCep, isValidCep } from "@/lib/cep";
import { updateAdminCompany } from "@/api/empresas";
import type {
  AdminCompanyDetail,
  UpdateAdminCompanyPayload,
} from "@/api/empresas/admin/types";

interface EditarEmpresaEnderecoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: AdminCompanyDetail;
  onCompanyUpdated: (updates: Partial<AdminCompanyDetail>) => void;
}

type AddressFormState = {
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  logradouro: string;
  numero: string;
};

export function EditarEmpresaEnderecoModal({
  isOpen,
  onOpenChange,
  company,
  onCompanyUpdated,
}: EditarEmpresaEnderecoModalProps) {
  const initialValues = useMemo<AddressFormState>(
    () => ({
      cep: company.enderecos?.[0]?.cep
        ? normalizeCep(company.enderecos[0].cep)
        : "",
      cidade: company.cidade ?? "",
      estado: company.estado ?? "",
      bairro: company.enderecos?.[0]?.bairro ?? "",
      logradouro: company.enderecos?.[0]?.logradouro ?? "",
      numero: company.enderecos?.[0]?.numero ?? "",
    }),
    [company]
  );

  const [formState, setFormState] = useState<AddressFormState>(initialValues);
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
    (field: keyof AddressFormState) =>
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
        description:
          "Informe um CEP válido no formato 00000-000 para continuar.",
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
      enderecos: [
        {
          id: company.enderecos?.[0]?.id || "",
          cep: sanitizedCep || "",
          logradouro: formState.logradouro || "",
          bairro: formState.bairro || "",
          numero: formState.numero || "",
          cidade: formState.cidade || "",
          estado: formState.estado || "",
        },
      ],
      cidade: formState.cidade || undefined,
      estado: formState.estado || undefined,
    };

    setIsSaving(true);

    try {
      await updateAdminCompany(company.id, payload);

      const formattedCep = sanitizedCep ? normalizeCep(sanitizedCep) : null;

      onCompanyUpdated({
        cidade: formState.cidade || undefined,
        estado: formState.estado || undefined,
        enderecos: [
          {
            id: company.enderecos?.[0]?.id || "",
            cep: formattedCep || "",
            logradouro: formState.logradouro || "",
            bairro: formState.bairro || "",
            numero: formState.numero || "",
            cidade: formState.cidade || "",
            estado: formState.estado || "",
          },
        ],
      });

      toastCustom.success({
        title: "Endereço atualizado",
        description: "As informações de endereço foram salvas com sucesso.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao atualizar endereço", error);
      toastCustom.error({
        title: "Erro ao salvar",
        description:
          "Não foi possível atualizar o endereço da empresa. Tente novamente em instantes.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    company.id,
    company.enderecos,
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
      classNames={{ base: "max-h-[85vh]" }}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Editar endereço</ModalTitle>
        </ModalHeader>

        <ModalBody className="max-h-[70vh] overflow-y-auto pr-1 p-1">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="CEP"
                value={formState.cep}
                onChange={handleCepChange}
                disabled={isSaving || isCepLoading}
                maxLength={9}
                rightIcon={isCepLoading ? "Loader2" : undefined}
                size="sm"
              />
              <InputCustom
                label="Número"
                value={formState.numero}
                onChange={handleInputChange("numero")}
                disabled={isSaving || isCepLoading}
                size="sm"
              />
            </div>

            <InputCustom
              label="Logradouro"
              value={formState.logradouro}
              onChange={handleInputChange("logradouro")}
              disabled={isSaving || isCepLoading}
              size="sm"
            />

            <InputCustom
              label="Bairro"
              value={formState.bairro}
              onChange={handleInputChange("bairro")}
              disabled={isSaving || isCepLoading}
              size="sm"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputCustom
                label="Cidade"
                value={formState.cidade}
                onChange={handleInputChange("cidade")}
                disabled={isSaving || isCepLoading}
                size="sm"
              />
              <InputCustom
                label="Estado"
                value={formState.estado}
                onChange={handleInputChange("estado")}
                disabled={isSaving || isCepLoading}
                maxLength={2}
                size="sm"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            size="md"
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            size="md"
            loadingText="Salvando..."
          >
            Salvar endereço
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
