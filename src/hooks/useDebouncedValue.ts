import { useEffect, useState } from "react";

/**
 * Hook para debounce de valores
 * Útil para buscas e filtros que não devem disparar requisições a cada keystroke
 *
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 300ms)
 * @returns Valor debounced
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebouncedValue(search, 300);
 *
 * // Usar debouncedSearch na query
 * const { data } = useQuery({
 *   queryKey: ['usuarios', { search: debouncedSearch }],
 *   queryFn: () => api.get('/usuarios', { params: { search: debouncedSearch } }),
 * });
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

