import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Remove tags HTML de uma string e retorna apenas o texto plano
 * Funciona tanto no cliente quanto no servidor (SSR)
 * @param html - String contendo HTML
 * @returns String com apenas texto, sem tags HTML
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return "";

  const normalizePlainText = (value: string) =>
    value
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/StartFragment|EndFragment/gi, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  
  // Se estiver no browser, usa DOM para extrair texto (mais preciso)
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = normalizePlainText(html);
    return normalizePlainText(tmp.textContent || tmp.innerText || "");
  }
  
  // No servidor, usa regex para remover tags HTML
  return normalizePlainText(html.replace(/<[^>]*>/g, ""));
}
