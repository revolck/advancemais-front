// src/theme/website/components/contact-form-section/utils/index.ts

import { ContactFormData } from "../types";
import { CONTACT_CONFIG } from "../constants";

/**
 * Formata CEP com máscara
 */
export function formatCep(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue
    .replace(CONTACT_CONFIG.cep.format, "$1-$2")
    .slice(0, CONTACT_CONFIG.cep.maxLength);
}

/**
 * Formata telefone com máscara
 */
export function formatPhone(value: string): string {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length <= 10) {
    // (00) 0000-0000
    return cleanValue
      .replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3")
      .replace(/(-$)/, "");
  } else {
    // (00) 00000-0000
    return cleanValue
      .replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3")
      .replace(/(-$)/, "");
  }
}

/**
 * Valida um campo específico - SIMPLIFICADO
 */
export function validateField(
  fieldName: keyof ContactFormData,
  value: string
): string | null {
  const trimmedValue = value.trim();

  // Validações específicas por campo
  switch (fieldName) {
    case "name":
      if (!trimmedValue) return "Nome é obrigatório";
      if (trimmedValue.length < 2)
        return "Nome deve ter pelo menos 2 caracteres";
      if (trimmedValue.length > 100)
        return "Nome deve ter no máximo 100 caracteres";
      break;

    case "companyName":
      if (trimmedValue && trimmedValue.length > 100) {
        return "Nome da empresa deve ter no máximo 100 caracteres";
      }
      break;

    case "email":
      if (!trimmedValue) return "Email é obrigatório";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue))
        return "Email deve ter um formato válido";
      break;

    case "phone":
      if (!trimmedValue) return "Telefone é obrigatório";
      const cleanPhone = trimmedValue.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        return "Telefone deve ter um formato válido";
      }
      break;

    case "cep":
      if (!trimmedValue) return "CEP é obrigatório";
      const cepRegex = /^\d{5}-?\d{3}$/;
      if (!cepRegex.test(trimmedValue))
        return "CEP deve ter um formato válido (00000-000)";
      break;

    case "address":
      if (!trimmedValue) return "Endereço é obrigatório";
      break;

    case "city":
      if (!trimmedValue) return "Cidade é obrigatória";
      break;

    case "state":
      if (!trimmedValue) return "Estado é obrigatório";
      break;

    case "additionalInfo":
      // Opcional, sem validação
      break;

    default:
      break;
  }

  return null;
}

/**
 * Valida o formulário completo
 */
export function validateForm(
  formData: ContactFormData
): Partial<ContactFormData> {
  const errors: Partial<ContactFormData> = {};

  // Campos obrigatórios
  const requiredFields: (keyof ContactFormData)[] = [
    "name",
    "email",
    "phone",
    "cep",
    "address",
    "city",
    "state",
  ];

  requiredFields.forEach((field) => {
    const error = validateField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  // Validação do campo opcional companyName
  if (formData.companyName) {
    const companyError = validateField("companyName", formData.companyName);
    if (companyError) {
      errors.companyName = companyError;
    }
  }

  return errors;
}

/**
 * Debounce para otimizar chamadas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Busca dados do CEP na API ViaCEP
 */
export async function fetchCepData(cep: string): Promise<{
  address: string;
  city: string;
  state: string;
  error?: string;
}> {
  try {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      throw new Error("CEP deve ter 8 dígitos");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONTACT_CONFIG.cep.timeout
    );

    const response = await fetch(
      `${CONTACT_CONFIG.cep.endpoint}/${cleanCep}/json/`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Erro ao consultar CEP");
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error("CEP não encontrado");
    }

    return {
      address: data.logradouro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          address: "",
          city: "",
          state: "",
          error: "Timeout na consulta do CEP",
        };
      }
      return { address: "", city: "", state: "", error: error.message };
    }

    return { address: "", city: "", state: "", error: "Erro desconhecido" };
  }
}

/**
 * Sanitiza dados do formulário antes do envio
 */
export function sanitizeFormData(formData: ContactFormData): ContactFormData {
  return {
    name: formData.name.trim(),
    companyName: formData.companyName.trim(),
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.replace(/\D/g, ""),
    cep: formData.cep.replace(/\D/g, ""),
    address: formData.address.trim(),
    city: formData.city.trim(),
    state: formData.state.trim(),
    additionalInfo: formData.additionalInfo.trim(),
  };
}
