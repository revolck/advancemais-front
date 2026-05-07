"use client";

import * as React from "react";
import type {
  InputSearchApiProps,
  InputSearchOption,
  InputSearchRecord,
} from "../types";
import {
  DEFAULT_INPUT_SEARCH_FIELDS,
  normalizeInputSearchResponse,
} from "../utils";

export function useInputSearch<TItem = InputSearchRecord>(
  apiProps: InputSearchApiProps<TItem>,
  query: string,
  disabled?: boolean
) {
  const {
    fetcher,
    fields = DEFAULT_INPUT_SEARCH_FIELDS,
    debounceMs = 350,
    minLength = 2,
    limit = 10,
    mapItem,
  } = apiProps;
  const [options, setOptions] = React.useState<InputSearchOption<TItem>[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const normalizedQuery = query.trim();

  React.useEffect(() => {
    if (disabled || normalizedQuery.length < minLength) {
      setOptions([]);
      setTotal(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetcher({
          query: normalizedQuery,
          page: 1,
          limit,
          fields,
          signal: controller.signal,
        });
        const normalized = normalizeInputSearchResponse(response, mapItem);
        setOptions(normalized.options);
        setTotal(normalized.total);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setOptions([]);
        setTotal(0);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Erro ao buscar resultados"
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    debounceMs,
    disabled,
    fields,
    fetcher,
    limit,
    mapItem,
    minLength,
    normalizedQuery,
  ]);

  return {
    options,
    total,
    isLoading,
    error,
    minLength,
  };
}
