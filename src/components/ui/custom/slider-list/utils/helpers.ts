/**
 * Gera preview URL para arquivo
 */
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Limpa preview URL
 */
export function revokeFilePreview(previewUrl: string): void {
  URL.revokeObjectURL(previewUrl);
}

/**
 * Extrai nome do arquivo da URL
 */
export function extractFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split("/").pop() || "imagem";
  } catch {
    return "imagem";
  }
}

/**
 * Gera título alternativo baseado na ordem
 */
export function generateSliderTitle(ordem: number): string {
  return `Slider ${ordem}`;
}

/**
 * Verifica se URL é de imagem
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return imageExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * Ordena sliders por posição
 */
export function sortSlidersByOrder<T extends { ordem: number }>(
  sliders: T[]
): T[] {
  return [...sliders].sort((a, b) => a.ordem - b.ordem);
}

/**
 * Encontra próxima ordem disponível
 */
export function getNextAvailableOrder<T extends { ordem: number }>(
  sliders: T[],
  maxSliders: number
): number {
  if (sliders.length === 0) return 1;

  const orders = sliders.map((s) => s.ordem).sort((a, b) => a - b);

  // Procura por gaps na sequência
  for (let i = 1; i <= maxSliders; i++) {
    if (!orders.includes(i)) {
      return i;
    }
  }

  // Se não há gaps, retorna próximo disponível
  const maxOrder = Math.max(...orders);
  return Math.min(maxOrder + 1, maxSliders);
}

/**
 * Reordena array movendo item para nova posição
 */
export function reorderArray<T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
}
