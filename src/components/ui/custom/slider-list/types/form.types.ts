/**
 * Estado do formulário do modal
 */
export interface SliderFormState {
  imagemUrl: string;
  link: string;
  ordem: number;
  selectedFile: File | null;
  errors: SliderFormErrors;
}

/**
 * Erros do formulário
 */
export interface SliderFormErrors {
  imagemUrl?: string;
  link?: string;
  ordem?: string;
  file?: string;
  general?: string;
}

/**
 * Ações do reducer do formulário
 */
export type SliderFormAction =
  | {
      type: "SET_FIELD";
      field: keyof Omit<SliderFormState, "errors" | "selectedFile">;
      value: string | number;
    }
  | { type: "SET_FILE"; file: File | null }
  | { type: "SET_ERROR"; field: keyof SliderFormErrors; error: string }
  | { type: "CLEAR_ERROR"; field: keyof SliderFormErrors }
  | { type: "CLEAR_ALL_ERRORS" }
  | { type: "RESET_FORM"; initialData?: Partial<SliderFormState> };

/**
 * Configuração de validação de arquivo (compatível com FileUpload)
 */
export interface FileValidationConfig {
  maxSize: number; // mudou de maxFileSize para maxSize
  acceptedTypes: readonly string[];
  maxFiles: number;
}

/**
 * Resultado de validação
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
