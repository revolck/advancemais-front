"use client";

import { useEffect, useMemo, useState } from "react";

import type { UpdatePopupContactPayload } from "@/api/websites/components/popups";
import {
  BRASIL_ESTADO_OPTIONS,
  fetchCidadesByUf,
  normalizeEstadoUf,
} from "@/lib/brasil-localidades";
import { isValidCep, lookupCep, normalizeCep } from "@/lib/cep";
import {
  ButtonCustom,
  InputCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SelectCustom,
  toastCustom,
} from "@/components/ui/custom";

interface EditPopupLeadAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: UpdatePopupContactPayload;
  isSubmitting: boolean;
  onSubmit: (values: UpdatePopupContactPayload) => void;
}

type AddressFormState = Pick<
  UpdatePopupContactPayload,
  "endereco" | "estado" | "cidade"
> & {
  cep: string;
  numero: string;
  bairro: string;
  complemento: string;
};

const EMPTY_FORM: AddressFormState = {
  cep: "",
  endereco: "",
  numero: "",
  bairro: "",
  complemento: "",
  estado: "",
  cidade: "",
};

function hasAddress(initialValues: UpdatePopupContactPayload) {
  return Boolean(
    initialValues.endereco ||
    initialValues.estado ||
    initialValues.cidade,
  );
}

export function EditPopupLeadAddressModal({
  isOpen,
  onClose,
  initialValues,
  isSubmitting,
  onSubmit,
}: EditPopupLeadAddressModalProps) {
  const [formState, setFormState] = useState<AddressFormState>(EMPTY_FORM);
  const [cityOptions, setCityOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const hasExistingAddress = useMemo(
    () => hasAddress(initialValues),
    [initialValues],
  );

  useEffect(() => {
    if (!isOpen) return;

    const normalizedEstado = normalizeEstadoUf(initialValues.estado);
    setFormState({
      cep: "",
      endereco: initialValues.endereco ?? "",
      numero: "",
      bairro: "",
      complemento: "",
      estado: normalizedEstado,
      cidade: initialValues.cidade ?? "",
    });
  }, [initialValues, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const uf = normalizeEstadoUf(formState.estado);
    if (!uf) {
      setCityOptions([]);
      return;
    }

    let isMounted = true;
    setIsLoadingCities(true);

    fetchCidadesByUf(uf)
      .then((options) => {
        if (!isMounted) return;
        setCityOptions(options);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Erro ao carregar cidades:", error);
        toastCustom.error("Não foi possível carregar as cidades do estado.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingCities(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formState.estado, isOpen]);

  const isSubmitDisabled = !formState.estado || !formState.cidade;

  const handleCepChange = async (value: string) => {
    const normalized = normalizeCep(value);
    setFormState((previous) => ({ ...previous, cep: normalized }));

    const digits = normalized.replace(/\D/g, "");
    if (digits.length !== 8 || isLoadingCep) return;

    setIsLoadingCep(true);
    try {
      const result = await lookupCep(normalized);
      if ("error" in result) {
        toastCustom.error(result.error);
        return;
      }

      const normalizedEstado = normalizeEstadoUf(result.state);
      setFormState((previous) => ({
        ...previous,
        cep: result.cep,
        endereco: result.street || previous.endereco,
        bairro: result.neighborhood || previous.bairro,
        complemento: result.complement || previous.complemento,
        estado: normalizedEstado || previous.estado,
        cidade: result.city || previous.cidade,
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toastCustom.error("Não foi possível consultar o CEP informado.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="xl" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>
            {hasExistingAddress ? "Editar endereço" : "Adicionar endereço"}
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-5 p-1">
          <div className="grid gap-4 md:grid-cols-2">
            <InputCustom
              label="CEP"
              value={formState.cep ?? ""}
              mask="cep"
              maxLength={9}
              onChange={(event) => void handleCepChange(event.target.value)}
            />
            <InputCustom
              label="Número"
              value={formState.numero ?? ""}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  numero: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectCustom
              label="Estado"
              placeholder="Selecionar estado"
              options={BRASIL_ESTADO_OPTIONS}
              value={formState.estado ?? null}
              onChange={(estado) =>
                setFormState((previous) => ({
                  ...previous,
                  estado: normalizeEstadoUf(estado),
                  cidade:
                    normalizeEstadoUf(estado) ===
                    normalizeEstadoUf(previous.estado)
                      ? previous.cidade
                      : "",
                }))
              }
            />

            <SelectCustom
              label="Cidade"
              placeholder={
                !formState.estado
                  ? "Selecione um estado primeiro"
                  : isLoadingCities
                    ? "Carregando cidades..."
                    : "Selecionar cidade"
              }
              options={cityOptions}
              value={formState.cidade ?? null}
              disabled={!formState.estado || isLoadingCities}
              onChange={(cidade) =>
                setFormState((previous) => ({
                  ...previous,
                  cidade: cidade ?? "",
                }))
              }
            />
          </div>

          <InputCustom
            label="Endereço"
            value={formState.endereco ?? ""}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                endereco: event.target.value,
              }))
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <InputCustom
              label="Bairro"
              value={formState.bairro ?? ""}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  bairro: event.target.value,
                }))
              }
            />
            <InputCustom
              label="Complemento"
              value={formState.complemento ?? ""}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  complemento: event.target.value,
                }))
              }
            />
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
          <ButtonCustom
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isLoadingCep}
            withAnimation={false}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={() => {
              if (formState.cep && !isValidCep(formState.cep)) {
                toastCustom.error("Informe um CEP valido para continuar.");
                return;
              }

              const enderecoCompleto = [
                formState.endereco?.trim(),
                formState.numero?.trim()
                  ? `Nº ${formState.numero.trim()}`
                  : null,
                formState.bairro?.trim(),
                formState.complemento?.trim(),
              ]
                .filter(Boolean)
                .join(" • ");

              onSubmit({
                endereco: enderecoCompleto || null,
                estado: formState.estado?.trim() || null,
                cidade: formState.cidade?.trim() || null,
              });
            }}
            disabled={isSubmitDisabled}
            isLoading={isSubmitting}
            withAnimation={false}
          >
            Confirmar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
