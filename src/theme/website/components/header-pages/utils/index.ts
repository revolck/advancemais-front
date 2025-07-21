// src/theme/website/components/header-pages/utils/index.ts

import type { BreadcrumbItem } from "../types";
import { ROUTE_LABELS } from "../constants";

/**
 * Gera breadcrumbs baseado no pathname atual
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split("/").filter(Boolean);

  return pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = ROUTE_LABELS[segment] || capitalizeFirst(segment);

    return {
      label,
      href,
      isActive: index === pathSegments.length - 1,
    };
  });
}

/**
 * Capitaliza a primeira letra de uma string
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Verifica se uma URL é externa
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}
