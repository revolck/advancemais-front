/**
 * Utilitários para Suporte ao Cliente
 * Funcionalidades para contato via WhatsApp e outros canais
 */

import { env } from "./env";

export interface SupportOptions {
  message?: string;
  includeErrorDetails?: boolean;
  includePageUrl?: boolean;
}

/**
 * Gera link do WhatsApp para suporte
 */
export function generateSupportWhatsAppLink(
  options: SupportOptions = {}
): string {
  const {
    message,
    includeErrorDetails = true,
    includePageUrl = true,
  } = options;

  const phone = env.supportPhone;
  const baseUrl = `https://wa.me/${phone}`;

  // Mensagem personalizada ou padrão
  let fullMessage =
    message || `Olá! Gostaria de obter ajuda com o site ${env.appName}.`;

  // Adiciona detalhes se solicitado
  if (includeErrorDetails && typeof window !== "undefined") {
    if (includePageUrl) {
      fullMessage += `\n\n📍 Página: ${window.location.href}`;
    }
    fullMessage += `\n🕐 Horário: ${new Date().toLocaleString("pt-BR")}`;
    fullMessage += `\n\nPor favor, me ajudem a resolver.`;
  }

  return `${baseUrl}?text=${encodeURIComponent(fullMessage)}`;
}

/**
 * Gera link para erro específico
 */
export function generateErrorSupportLink(
  error: string | Error,
  context?: string
): string {
  const errorMessage = error instanceof Error ? error.message : error;

  let message = `🚨 Erro encontrado no ${env.appName}`;

  if (context) {
    message += `\n\n📍 Contexto: ${context}`;
  }

  message += `\n\n❌ Erro: ${errorMessage}`;

  return generateSupportWhatsAppLink({
    message,
    includeErrorDetails: true,
    includePageUrl: true,
  });
}

/**
 * Formata número de telefone para links
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, "");

  // Adiciona código do país se não tiver
  if (cleaned.length === 11 && !cleaned.startsWith("55")) {
    return `55${cleaned}`;
  }

  return cleaned;
}

/**
 * Configurações de suporte
 */
export const supportConfig = {
  phone: env.supportPhone,
  formattedPhone: formatPhoneForWhatsApp(env.supportPhone),
  businessHours: {
    start: "08:00",
    end: "18:00",
    timezone: "America/Maceio",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
} as const;

/**
 * Verifica se está dentro do horário comercial
 */
export function isBusinessHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = domingo, 1 = segunda, etc.

  // Segunda a sexta (1-5)
  const isWeekday = day >= 1 && day <= 5;

  // Entre 8h e 18h
  const isBusinessHour = hour >= 8 && hour < 18;

  return isWeekday && isBusinessHour;
}
