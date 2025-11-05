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

      // Se o item tem um route, verificamos se corresponde à rota atual
      if (item.route) {
        const route = item.route.replace(/\/$/, "");
        const path = pathname.replace(/\/$/, "");

        // 1) Sempre marcar ativo se for correspondência exata
        if (path === route) return true;

        // 2) Para itens com submenu, considerar ativo quando a rota atual for uma subrota
        //    Ex.: parent '/dashboard/cursos' fica ativo em '/dashboard/cursos/turmas'
        if (item.submenu && route !== "/" && path.startsWith(route + "/")) {
          return true;
        }
        // 3) Itens folha (sem submenu) NÃO devem usar startsWith para evitar marcar
        //    '/dashboard/cursos' quando estamos em '/dashboard/cursos/turmas'
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
    (items: readonly MenuItem[]): MenuItem[] => {
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
