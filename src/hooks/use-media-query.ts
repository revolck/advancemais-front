"use client";

import * as React from "react";

/**
 * Hook personalizado para detectar media queries
 * @param query - A media query CSS a ser testada
 * @returns Um booleano indicando se a media query corresponde
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Checar se estamos no cliente (prevenção para SSR)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);

      // Atualizar o estado com o valor inicial
      setMatches(media.matches);

      // Criar a função de callback
      const listener = () => setMatches(media.matches);

      // Adicionar listener para mudanças na media query
      media.addEventListener("change", listener);

      // Cleanup: remover o listener quando o componente for desmontado
      return () => media.removeEventListener("change", listener);
    }

    return undefined;
  }, [query]);

  return matches;
}

export default useMediaQuery;
