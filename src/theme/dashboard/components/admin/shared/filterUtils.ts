"use client";

/**
 * Shared helpers for dashboard list filters.
 * Keeps React Query keys stable and makes the search UX consistent.
 */

export const DEFAULT_SEARCH_MIN_LENGTH = 3;

export function normalizeSearchTerm(
  value: string,
  minLength = DEFAULT_SEARCH_MIN_LENGTH
): string {
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return "";
  }
  return trimmed;
}

export function getSearchValidationMessage(
  value: string,
  minLength = DEFAULT_SEARCH_MIN_LENGTH
): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length < minLength) {
    return `Informe pelo menos ${minLength} caracteres para pesquisar.`;
  }
  return null;
}

export function getNormalizedSearchOrUndefined(
  value: string,
  minLength = DEFAULT_SEARCH_MIN_LENGTH
): string | undefined {
  const normalized = normalizeSearchTerm(value, minLength);
  return normalized.length > 0 ? normalized : undefined;
}

