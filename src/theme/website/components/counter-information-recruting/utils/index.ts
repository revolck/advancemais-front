/**
 * Formata um número para exibição
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    useGroupingSeparator?: boolean;
    locale?: string;
    compact?: boolean;
  } = {}
): string {
  const {
    decimals = 0,
    useGroupingSeparator = true,
    locale = "pt-BR",
    compact = false,
  } = options;

  if (compact && value >= 1000) {
    return formatCompactNumber(value, locale);
  }

  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useGroupingSeparator,
  });
}

/**
 * Formata números grandes de forma compacta (150mil, 20mil, etc.)
 * CORRIGIDO para mostrar "mil" ao invés de "K"
 */
export function formatCompactNumber(value: number, locale = "pt-BR"): string {
  if (value >= 1000000) {
    const millions = value / 1000000;
    if (millions >= 10) {
      return `${Math.floor(millions)}mi`;
    } else {
      return `${millions.toFixed(1).replace(".", ",")}mi`;
    }
  }

  if (value >= 1000) {
    const thousands = value / 1000;
    if (thousands >= 10) {
      return `${Math.floor(thousands)}mil`;
    } else {
      return `${thousands.toFixed(1).replace(".", ",")}mil`;
    }
  }

  return value.toString();
}

/**
 * Função de easing para animações suaves
 */
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Anima um valor numérico
 */
export function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
  easingFunction: (t: number) => number = easeOutQuart
): () => void {
  const startTime = performance.now();
  let animationFrame: number;

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easedProgress = easingFunction(progress);
    const currentValue = from + (to - from) * easedProgress;

    onUpdate(currentValue);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }

  animationFrame = requestAnimationFrame(animate);

  // Retorna função de cancelamento
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}

/**
 * Detecta se um elemento está visível na viewport
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top < windowHeight &&
    rect.bottom > 0 &&
    rect.left < windowWidth &&
    rect.right > 0
  );
}

/**
 * Debounce para otimizar eventos de scroll
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
