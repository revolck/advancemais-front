// src/theme/website/components/contact-form-section/index.ts

// Componente principal
export { default } from "./ContactFormSection";
export { default as ContactFormSection } from "./ContactFormSection";

// Componentes individuais
export { ContactForm } from "./components/ContactForm";

// Hooks
export { useContactForm } from "./hooks/useContactForm";
export { useContactConfig } from "./hooks/useContactConfig";

// Utilitários
export { formatCep, formatPhone, validateForm, fetchCepData } from "./utils";

// Tipos e constantes
export type {
  ContactFormData,
  ContactFormSectionProps,
  ContactSectionData,
  ContactSubmitApiResponse,
} from "./types";
export {
  DEFAULT_CONTACT_DATA,
  CONTACT_CONFIG,
  VALIDATION_MESSAGES,
} from "./constants";
