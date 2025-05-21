import { useCallback } from "react";

/**
 * Hook personalizado para gerenciar a navegação no sidebar
 *
 * Implementa a lógica de navegação e fechamento do menu móvel
 * Separa esta responsabilidade do componente principal
 *
 * @param setMobileMenuOpen - Função para controlar a abertura/fechamento do menu mobile
 * @returns Objeto com funções para gerenciar a navegação
 */
export function useSidebarNavigation(
  setMobileMenuOpen: (isOpen: boolean) => void
) {
  /**
   * Fecha o menu mobile ao navegar
   */
  const handleNavigation = useCallback(() => {
    setMobileMenuOpen(false);
  }, [setMobileMenuOpen]);

  return {
    handleNavigation,
  };
}
