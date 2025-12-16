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
  
  // Se estiver no browser, usa DOM para extrair texto (mais preciso)
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  
  // No servidor, usa regex para remover tags HTML
  return html
    .replace(/<[^>]*>/g, "") // Remove todas as tags HTML
    .replace(/&nbsp;/g, " ") // Substitui &nbsp; por espaço
    .replace(/&amp;/g, "&") // Substitui &amp; por &
    .replace(/&lt;/g, "<") // Substitui &lt; por <
    .replace(/&gt;/g, ">") // Substitui &gt; por >
    .replace(/&quot;/g, '"') // Substitui &quot; por "
    .replace(/&#39;/g, "'") // Substitui &#39; por '
    .trim();
}
