// src/hooks/useActiveRoute.ts
"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { MenuItem } from "@/theme/dashboard/sidebar/types/sidebar.types";

/**
 * Hook personalizado para determinar se um item de menu está ativo
 * com base na rota atual
 */
export function useActiveRoute() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  /**
   * Verifica se um item de menu está ativo
   *
   * @param item Item do menu a ser verificado
   * @returns Booleano indicando se o item está ativo
   */
  const isItemActive = useCallback(
    (item: MenuItem): boolean => {
      if (!ready || !pathname) return false;

      // Se o item tem um href, verificamos se corresponde à rota atual
      if (item.href) {
        // Correspondência exata
        if (pathname === item.href) return true;

        // Correspondência parcial para subrotas (ex: /dashboard/analytics é uma subrota de /dashboard)
        // Exceto para a rota raiz, evitando que "/" corresponda a tudo
        if (item.href !== "/" && pathname.startsWith(item.href)) return true;
      }

      // Verifica recursivamente se algum submenu está ativo
      if (item.submenu) {
        return item.submenu.some((subItem) => isItemActive(subItem));
      }

      return false;
    },
    [pathname, ready]
  );

  /**
   * Marca itens como ativos com base na rota atual
   *
   * @param items Array de itens do menu
   * @returns Array de itens com propriedade 'active' definida
   */
  const markActiveItems = useCallback(
    (items: MenuItem[]): MenuItem[] => {
      return items.map((item) => ({
        ...item,
        active: isItemActive(item),
        // Se o item tiver submenu, processa recursivamente
        submenu: item.submenu ? markActiveItems(item.submenu) : undefined,
      }));
    },
    [isItemActive]
  );

  return { isItemActive, markActiveItems, pathname, ready };
}
