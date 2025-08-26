"use client";
import React, { useReducer, useCallback, useEffect, useState } from "react";
import { toastCustom } from "../../toast";
import { validateSliderForm } from "../services";
import { createFilePreview, revokeFilePreview } from "../utils";
import type {
  SliderItem,
  SliderFormData,
  SliderFormState,
  SliderFormAction,
  UploadStatus,
} from "../types";

// Reducer para gerenciar estado do formulário
function sliderFormReducer(
  state: SliderFormState,
  action: SliderFormAction
): SliderFormState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: undefined },
      };

    case "SET_FILE":
      // Limpa preview anterior se existir
      if (state.selectedFile) {
        revokeFilePreview(createFilePreview(state.selectedFile));
      }

      return {
        ...state,
        selectedFile: action.file,
        // Limpa URL quando arquivo é selecionado
        imagemUrl: action.file ? "" : state.imagemUrl,
        errors: { ...state.errors, file: undefined, imagemUrl: undefined },
      };

    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: undefined },
      };

    case "CLEAR_ALL_ERRORS":
      return {
        ...state,
        errors: {},
      };

    case "RESET_FORM":
      // Limpa preview anterior se existir
      if (state.selectedFile) {
        revokeFilePreview(createFilePreview(state.selectedFile));
      }

      return {
        imagemUrl: action.initialData?.imagemUrl || "",
        link: action.initialData?.link || "",
        ordem: action.initialData?.ordem || 1,
        selectedFile: null,
        errors: {},
      };

    default:
      return state;
  }
}

interface UseSliderFormOptions {
  onSubmit: (data: SliderFormData) => Promise<void>;
  onClose: () => void;
}

interface UseSliderFormReturn {
  // Estado do formulário
  formState: SliderFormState;

  // Status
  uploadStatus: UploadStatus;
  setUploadStatus: (status: UploadStatus) => void;

  // Validações
  isFormValid: boolean;
  validateForm: () => boolean;

  // Handlers
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFieldChange: (
    field: keyof Omit<SliderFormState, "errors" | "selectedFile">,
    value: string | number
  ) => void;
  handleFileChange: (file: File | null) => void;
  resetForm: (slider?: SliderItem | null, nextOrder?: number) => void;

  // Utilitários
  getPreviewUrl: () => string | null;
  hasImageSource: boolean;
  dispatch: React.Dispatch<SliderFormAction>;
}

export function useSliderForm({
  onSubmit,
  onClose,
}: UseSliderFormOptions): UseSliderFormReturn {
  const [formState, dispatch] = useReducer(sliderFormReducer, {
    imagemUrl: "",
    link: "",
    ordem: 1,
    selectedFile: null,
    errors: {},
  });

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  // Valida formulário completo
  const validateForm = useCallback((): boolean => {
    dispatch({ type: "CLEAR_ALL_ERRORS" });

    const formData: SliderFormData = {
      imagemUrl: formState.imagemUrl,
      link: formState.link,
      ordem: formState.ordem,
      imagem: formState.selectedFile || undefined,
    };

    const validation = validateSliderForm(formData);

    if (!validation.isValid) {
      Object.entries(validation.errors).forEach(([field, error]) => {
        dispatch({
          type: "SET_ERROR",
          field: field as keyof SliderFormState["errors"],
          error,
        });
      });
      return false;
    }

    return true;
  }, [formState]);

  // Verifica se formulário é válido em tempo real
  const isFormValid = useCallback((): boolean => {
    const hasImageSource = Boolean(
      formState.imagemUrl || formState.selectedFile
    );
    const hasValidOrder = formState.ordem >= 1 && formState.ordem <= 4;
    const hasNoErrors = Object.keys(formState.errors).length === 0;

    return hasImageSource && hasValidOrder && hasNoErrors;
  }, [formState]);

  // Submete formulário
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const formData: SliderFormData = {
        imagemUrl: formState.imagemUrl,
        link: formState.link,
        ordem: formState.ordem,
        imagem: formState.selectedFile || undefined,
      };

      try {
        setUploadStatus("uploading");
        await onSubmit(formData);
        setUploadStatus("success");

        // Reset form após sucesso
        dispatch({ type: "RESET_FORM" });
        onClose();
      } catch (error) {
        setUploadStatus("error");
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao salvar slider";

        dispatch({
          type: "SET_ERROR",
          field: "general",
          error: errorMessage,
        });

        toastCustom.error({ description: errorMessage });
      }
    },
    [formState, validateForm, onSubmit, onClose]
  );

  // Atualiza campo do formulário
  const handleFieldChange = useCallback(
    (
      field: keyof Omit<SliderFormState, "errors" | "selectedFile">,
      value: string | number
    ) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    []
  );

  // Atualiza arquivo selecionado
  const handleFileChange = useCallback((file: File | null) => {
    dispatch({ type: "SET_FILE", file });
  }, []);

  // Reseta formulário com dados iniciais
  const resetForm = useCallback((slider?: SliderItem | null, nextOrder = 1) => {
    dispatch({
      type: "RESET_FORM",
      initialData: {
        imagemUrl: slider?.imagemUrl || "",
        link: slider?.link || "",
        ordem: slider?.ordem || nextOrder,
      },
    });
    setUploadStatus("idle");
  }, []);

  // Obtém URL de preview da imagem
  const getPreviewUrl = useCallback((): string | null => {
    if (formState.selectedFile) {
      return createFilePreview(formState.selectedFile);
    }
    if (formState.imagemUrl) {
      return formState.imagemUrl;
    }
    return null;
  }, [formState.selectedFile, formState.imagemUrl]);

  // Limpa recursos quando componente é desmontado
  useEffect(() => {
    return () => {
      if (formState.selectedFile) {
        revokeFilePreview(createFilePreview(formState.selectedFile));
      }
    };
  }, [formState.selectedFile]);

  // Derivações de estado
  const hasImageSource = Boolean(formState.imagemUrl || formState.selectedFile);

  return {
    // Estado do formulário
    formState,

    // Status
    uploadStatus,
    setUploadStatus,

    // Validações
    isFormValid: isFormValid(),
    validateForm,

    // Handlers
    handleSubmit,
    handleFieldChange,
    handleFileChange,
    resetForm,

    // Utilitários
    getPreviewUrl,
    hasImageSource,
    dispatch,
  };
}
