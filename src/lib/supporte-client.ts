import { publicEnv } from "./public-env";

export function generateSupportWhatsAppLink(errorMessage?: string): string {
  const phone = publicEnv.SUPPORT_PHONE;
  const baseUrl = `https://wa.me/${phone}`;
  const message = `Olá, gostaria de obter ajuda pois estou tendo problemas no site da Advanced.\n\nDetalhes do erro: ${
    errorMessage || "Erro desconhecido"
  }\n\nPor favor, verificar.`;
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
