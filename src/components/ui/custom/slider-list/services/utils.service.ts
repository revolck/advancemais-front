import type { SliderItem } from "../types";

/**
 * Simula delay para operações async (desenvolvimento/testes)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry para operações que podem falhar
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        await delay(delayMs * attempt); // Exponential backoff
      }
    }
  }

  throw lastError!;
}

/**
 * Detecta conflitos de ordem entre sliders
 */
export function detectOrderConflicts(sliders: SliderItem[]): string[] {
  const conflicts: string[] = [];
  const orderMap = new Map<number, string[]>();

  // Agrupa sliders por ordem
  sliders.forEach((slider) => {
    const ordem = slider.ordem;
    if (!orderMap.has(ordem)) {
      orderMap.set(ordem, []);
    }
    orderMap.get(ordem)!.push(slider.id);
  });

  // Identifica conflitos
  orderMap.forEach((sliderIds, ordem) => {
    if (sliderIds.length > 1) {
      conflicts.push(`Ordem ${ordem}: ${sliderIds.length} sliders`);
    }
  });

  return conflicts;
}

/**
 * Normaliza ordens de sliders (remove gaps e duplicatas)
 */
export function normalizeSliderOrders(sliders: SliderItem[]): SliderItem[] {
  const sortedSliders = [...sliders].sort((a, b) => a.ordem - b.ordem);

  return sortedSliders.map((slider, index) => ({
    ...slider,
    ordem: index + 1,
  }));
}

/**
 * Calcula estatísticas da lista de sliders
 */
export function calculateSliderStats(sliders: SliderItem[]) {
  const total = sliders.length;
  const published = sliders.filter((s) => s.isPublished).length;
  const unpublished = total - published;
  const withLinks = sliders.filter((s) => s.link).length;
  const withoutLinks = total - withLinks;

  return {
    total,
    published,
    unpublished,
    withLinks,
    withoutLinks,
    publishedPercentage: total > 0 ? Math.round((published / total) * 100) : 0,
  };
}
