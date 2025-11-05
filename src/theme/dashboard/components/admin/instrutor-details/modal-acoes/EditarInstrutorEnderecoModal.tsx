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
import type { InstrutorDetailsData } from "../types";

interface EditarInstrutorEnderecoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  instrutor: InstrutorDetailsData;
  onConfirm: (payload: {
    endereco: {
      cep?: string | null;
      cidade?: string | null;
      estado?: string | null;
      bairro?: string | null;
      logradouro?: string | null;
      numero?: string | null;
    };
  }) => Promise<void>;
}

type AddressFormState = {
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  logradouro: string;
  numero: string;
};

export function EditarInstrutorEnderecoModal({
  isOpen,
  onOpenChange,
  instrutor,
  onConfirm,
}: EditarInstrutorEnderecoModalProps) {
  const first = instrutor.enderecos?.[0];
  const initialValues = useMemo<AddressFormState>(
    () => ({
      cep: first?.cep ? normalizeCep(first.cep) : "",
      cidade: first?.cidade ?? "",
      estado: first?.estado ?? "",
      bairro: first?.bairro ?? "",
      logradouro: first?.logradouro ?? "",
      numero: first?.numero ?? "",
    }),
    [first]
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
        setFormState((prev) => ({ ...prev, [field]: event.target.value }));
      },
    []
  );

  const handleCepChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const normalized = normalizeCep(event.target.value);
      setFormState((prev) => ({ ...prev, cep: normalized }));

      const digits = normalized.replace(/\D/g, "");
      if (digits.length !== 8 || isCepLoading) return;
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
      } catch (error) {
        console.error("Erro no lookupCep", error);
        toastCustom.error({
          title: "Erro de consulta",
          description: "Falha ao consultar o CEP informado.",
        });
      } finally {
        setIsCepLoading(false);
      }
    },
    [isCepLoading]
  );

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

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

    setIsSaving(true);
    try {
      const sanitizedCep = formState.cep
        ? formState.cep.replace(/\D/g, "")
        : "";
      const enderecoPayload = {
        cep: sanitizedCep || null,
        logradouro: formState.logradouro.trim() || null,
        bairro: formState.bairro.trim() || null,
        numero: formState.numero.trim() || null,
        cidade: formState.cidade.trim() || null,
        estado: formState.estado.trim() || null,
      };

      await onConfirm({ endereco: enderecoPayload });
      toastCustom.success({
        title: "Endereço atualizado",
        description: "As informações de endereço foram salvas com sucesso.",
      });
      handleClose();
    } catch (error) {
      console.error("Erro ao atualizar endereço do instrutor", error);
      toastCustom.error({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o endereço agora.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [instrutor.enderecos, formState, handleClose, isSaving, onConfirm]);

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
                mask="cep"
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
            Salvar endereço
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
