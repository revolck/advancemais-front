// src/theme/website/components/contact-form-section/types/index.ts

/**
 * Interface para dados do formulário de contato
 */
export interface ContactFormData {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
  additionalInfo: string;
}

/**
 * Interface para configuração da seção vindos da API
 */
export interface ContactSectionData {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  successMessage: string;
  isActive: boolean;
}

/**
 * Interface para resposta da API de configuração
 */
export interface ContactConfigApiResponse {
  data: ContactSectionData;
  success: boolean;
  message?: string;
}

/**
 * Interface para resposta da API de envio
 */
export interface ContactSubmitApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Props do componente principal
 */
export interface ContactFormSectionProps {
  className?: string;
  /**
   * Se deve carregar configuração da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos de configuração
   */
  staticData?: ContactSectionData;
  /**
   * Callback quando o formulário é enviado com sucesso
   */
  onSubmitSuccess?: (data: ContactSubmitApiResponse) => void;
  /**
   * Callback quando ocorre erro no envio
   */
  onSubmitError?: (error: string) => void;
  /**
   * Callback quando a configuração é carregada
   */
  onConfigLoaded?: (data: ContactSectionData) => void;
}

/**
 * Estados do formulário
 */
export interface ContactFormState {
  formData: ContactFormData;
  isSubmitting: boolean;
  isSuccess: boolean;
  errors: Partial<ContactFormData>;
  fieldsDisabled: boolean;
}

/**
 * Interface para dados do CEP
 */
export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
