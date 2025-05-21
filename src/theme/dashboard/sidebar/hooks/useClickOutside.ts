import { useEffect, useRef } from "react";

/**
 * Hook para detectar cliques fora de um elemento
 *
 * @param handler Função a ser chamada quando houver clique fora do elemento
 * @param excludeRefs Refs opcionais de elementos que não devem disparar o evento
 * @returns Ref a ser atribuído ao elemento que deseja monitorar
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  excludeRefs: React.RefObject<HTMLElement>[] = []
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verifica se o clique foi fora do elemento monitorado
      const clickedOutside =
        ref.current && !ref.current.contains(event.target as Node);

      // Se clicou fora, verifica se não foi dentro de nenhum elemento excluído
      if (clickedOutside) {
        const clickedInExcluded = excludeRefs.some(
          (excludeRef) =>
            excludeRef.current &&
            excludeRef.current.contains(event.target as Node)
        );

        // Se não clicou dentro de nenhum elemento excluído, dispara o handler
        if (!clickedInExcluded) {
          handler();
        }
      }
    };

    // Adiciona event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handler, excludeRefs]);

  return ref;
}

export default useClickOutside;
