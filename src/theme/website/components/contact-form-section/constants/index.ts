// src/theme/website/components/contact-form-section/constants/index.ts

import type { ContactSectionData, ContactFormData } from "../types";

/**
 * Configuração padrão da seção
 */
export const DEFAULT_CONTACT_DATA: ContactSectionData = {
  id: "contact-form",
  title: "FAÇA SEU ORÇAMENTO",
  subtitle: "Entre em contato conosco",
  imageUrl: "/images/sobre/banner_about.webp",
  imageAlt: "Contato - Solicite seu orçamento",
  buttonText: "ENVIAR",
  successMessage:
    "Mensagem enviada com sucesso! Entraremos em contato em breve.",
  isActive: true,
};

/**
 * Dados iniciais do formulário
 */
export const INITIAL_FORM_DATA: ContactFormData = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  cep: "",
  address: "",
  city: "",
  state: "",
  additionalInfo: "",
};

/**
 * Configurações do componente
 */
export const CONTACT_CONFIG = {
  api: {
    configEndpoint: "/api/contact/config",
    submitEndpoint: "/api/contact/submit",
    timeout: 10000,
  },
  cep: {
    endpoint: "https://viacep.com.br/ws",
    timeout: 5000,
    format: /^(\d{5})(\d{1,3})$/,
    maxLength: 9,
  },
  validation: {
    name: {
      minLength: 2,
      maxLength: 100,
      required: true,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      required: true,
    },
    phone: {
      minLength: 10,
      maxLength: 15,
      required: true,
    },
    cep: {
      pattern: /^\d{5}-?\d{3}$/,
      required: true,
    },
  },
  form: {
    debounceDelay: 300,
    autoFocusFirstError: true,
  },
} as const;

/**
 * Mensagens de validação
 */
export const VALIDATION_MESSAGES = {
  name: {
    required: "Nome é obrigatório",
    minLength: "Nome deve ter pelo menos 2 caracteres",
    maxLength: "Nome deve ter no máximo 100 caracteres",
  },
  companyName: {
    maxLength: "Nome da empresa deve ter no máximo 100 caracteres",
  },
  email: {
    required: "Email é obrigatório",
    invalid: "Email deve ter um formato válido",
  },
  phone: {
    required: "Telefone é obrigatório",
    invalid: "Telefone deve ter um formato válido",
  },
  cep: {
    required: "CEP é obrigatório",
    invalid: "CEP deve ter um formato válido (00000-000)",
    notFound: "CEP não encontrado",
  },
  address: {
    required: "Endereço é obrigatório",
  },
  city: {
    required: "Cidade é obrigatória",
  },
  state: {
    required: "Estado é obrigatório",
  },
} as const;
