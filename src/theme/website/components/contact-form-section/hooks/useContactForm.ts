// src/theme/website/components/contact-form-section/hooks/useContactForm.ts

"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  ContactFormData,
  ContactFormState,
  ContactSubmitApiResponse,
} from "../types";
import { INITIAL_FORM_DATA, CONTACT_CONFIG } from "../constants";
import {
  validateForm,
  sanitizeFormData,
  debounce,
  fetchCepData,
} from "../utils";

interface UseContactFormReturn {
  formState: ContactFormState;
  updateField: (field: keyof ContactFormData, value: string) => void;
  handleCepChange: (value: string) => Promise<void>;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  clearError: (field: keyof ContactFormData) => void;
}

export function useContactForm(
  onSuccess?: (data: ContactSubmitApiResponse) => void,
  onError?: (error: string) => void
): UseContactFormReturn {
  const [formState, setFormState] = useState<ContactFormState>({
    formData: INITIAL_FORM_DATA,
    isSubmitting: false,
    isSuccess: false,
    errors: {},
    fieldsDisabled: true,
  });

  // Atualiza um campo específico
  const updateField = useCallback(
    (field: keyof ContactFormData, value: string) => {
      setFormState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [field]: value,
        },
        errors: {
          ...prev.errors,
          [field]: undefined, // Limpa erro ao editar
        },
        isSuccess: false, // Reseta sucesso ao editar
      }));
    },
    []
  );

  // Limpa erro específico
  const clearError = useCallback((field: keyof ContactFormData) => {
    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }));
  }, []);

  // Busca dados do CEP com debounce
  const debouncedCepLookup = useMemo(
    () =>
      debounce(async (cep: string) => {
      if (cep.replace(/\D/g, "").length === 8) {
        try {
          const result = await fetchCepData(cep);

          if (result.error) {
            setFormState((prev) => ({
              ...prev,
              errors: {
                ...prev.errors,
                cep: result.error,
              },
            }));
            return;
          }

          setFormState((prev) => ({
            ...prev,
            formData: {
              ...prev.formData,
              address: result.address,
              city: result.city,
              state: result.state,
            },
            fieldsDisabled: false,
            errors: {
              ...prev.errors,
              cep: undefined,
            },
          }));
        } catch (error) {
          console.error("Erro na busca do CEP:", error);
          setFormState((prev) => ({
            ...prev,
            errors: {
              ...prev.errors,
              cep: "Erro ao buscar CEP",
            },
          }));
        }
      }
      }, CONTACT_CONFIG.form.debounceDelay),
    []
  );

  // Handler para mudança do CEP
  const handleCepChange = useCallback(
    async (value: string) => {
      const cleanValue = value.replace(/\D/g, "");

      // Habilita campos apenas se CEP ainda não foi preenchido
      if (cleanValue.length < 8) {
        setFormState((prev) => ({
          ...prev,
          fieldsDisabled: true,
          formData: {
            ...prev.formData,
            address: "",
            city: "",
            state: "",
          },
        }));
      }

      updateField("cep", value);

      // Busca dados se CEP estiver completo
      if (cleanValue.length === 8) {
        await debouncedCepLookup(value);
      }
    },
    [updateField, debouncedCepLookup]
  );

  // Envia o formulário
  const submitForm = useCallback(async () => {
    setFormState((prev) => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      // Valida formulário
      const errors = validateForm(formState.formData);

      if (Object.keys(errors).length > 0) {
        setFormState((prev) => ({
          ...prev,
          errors,
          isSubmitting: false,
        }));
        return;
      }

      // Sanitiza dados
      const sanitizedData = sanitizeFormData(formState.formData);

      // Envia para API
      const response = await fetch(CONTACT_CONFIG.api.submitEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
      });

      const result: ContactSubmitApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Erro ao enviar formulário");
      }

      setFormState((prev) => ({
        ...prev,
        isSuccess: true,
        isSubmitting: false,
      }));

      onSuccess?.(result);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao enviar formulário";

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));

      onError?.(errorMessage);
    }
  }, [formState.formData, onSuccess, onError]);

  // Reseta o formulário
  const resetForm = useCallback(() => {
    setFormState({
      formData: INITIAL_FORM_DATA,
      isSubmitting: false,
      isSuccess: false,
      errors: {},
      fieldsDisabled: true,
    });
  }, []);

  return {
    formState,
    updateField,
    handleCepChange,
    submitForm,
    resetForm,
    clearError,
  };
}
