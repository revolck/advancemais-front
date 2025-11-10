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
   * @param parentItem Item pai (se houver)
   * @param siblings Array de irmãos (outros submenus no mesmo nível)
   * @returns Booleano indicando se o item está ativo
   */
  const isItemActive = useCallback(
    (
      item: MenuItem,
      parentItem?: MenuItem,
      siblings?: readonly MenuItem[]
    ): boolean => {
      if (!ready || !pathname) return false;

      const path = pathname.replace(/\/$/, "");

      // Se o item tem um route, verificamos se corresponde à rota atual
      if (item.route) {
        const route = item.route.replace(/\/$/, "");

        // 1) Sempre marcar ativo se for correspondência exata
        // IMPORTANTE: Correspondência exata tem prioridade máxima - não verificar irmãos
        if (path === route) {
          return true;
        }

        // 2) Para itens com submenu, considerar ativo quando a rota atual for uma subrota
        //    Ex.: parent '/dashboard/cursos' fica ativo em '/dashboard/cursos/turmas'
        if (item.submenu && route !== "/" && path.startsWith(route + "/")) {
          return true;
        }

        // 3) Para itens sem submenu (folha), considerar ativo se a rota começar com a rota do item
        //    MAS apenas se não houver outro irmão mais específico que corresponda melhor
        //    Isso captura rotas dinâmicas como '/dashboard/cursos/turmas/[turmaId]'
        //    IMPORTANTE: Para rotas genéricas como "/dashboard", só marcar como ativo se for correspondência exata
        //    ou se não houver nenhum irmão com submenu que corresponda melhor
        if (!item.submenu && route !== "/" && path.startsWith(route + "/")) {
          // Verifica se há algum irmão (submenu no mesmo nível) que corresponde melhor
          // Ex.: se estamos em '/dashboard/cursos/turmas', não devemos marcar '/dashboard/cursos'
          // como ativo porque '/dashboard/cursos/turmas' corresponde melhor
          if (siblings) {
            const hasBetterMatch = siblings.some((sibling) => {
              // Verifica irmãos com route direto
              if (sibling.route && sibling !== item) {
                const siblingRoute = sibling.route.replace(/\/$/, "");
                // Se algum irmão corresponde exatamente, não marcar este item
                if (path === siblingRoute) return true;
                // Se algum irmão é mais específico (rota mais longa) e também corresponde, não marcar este item
                // Ex.: se estamos em '/dashboard/cursos/turmas/[id]', não devemos considerar '/dashboard/cursos'
                // como melhor match porque '/dashboard/cursos/turmas' é mais específico
                if (path.startsWith(siblingRoute + "/")) {
                  // Verifica se o sibling é mais específico que o item atual (rota mais longa)
                  return siblingRoute.length > route.length;
                }
              }
              
              // Verifica irmãos com submenu que podem ter rotas mais específicas
              // CRÍTICO: Para evitar que "/dashboard" fique ativo quando estamos em "/dashboard/cursos"
              if (sibling.submenu && sibling !== item) {
                const hasActiveSubmenu = sibling.submenu.some((subItem) => {
                  if (subItem.route) {
                    const subRoute = subItem.route.replace(/\/$/, "");
                    // Se algum submenu do irmão corresponde exatamente, não marcar este item
                    if (path === subRoute) return true;
                    // Se algum submenu do irmão corresponde e é mais específico que a rota atual do item, não marcar este item
                    // Ex.: se estamos em '/dashboard/cursos' e o item atual é '/dashboard', 
                    // o submenu '/dashboard/cursos' é mais específico, então não marcar '/dashboard' como ativo
                    if (path.startsWith(subRoute + "/") || path === subRoute) {
                      return subRoute.length > route.length || path === subRoute;
                    }
                  }
                  return false;
                });
                if (hasActiveSubmenu) return true;
              }
              
              return false;
            });
            // Se há um match melhor, não marcar este item como ativo
            if (hasBetterMatch) return false;
          }
          return true;
        }
      }

      // Verifica recursivamente se algum submenu está ativo
      if (item.submenu) {
        // Primeiro verifica recursivamente nos submenus
        const hasActiveSubmenu = item.submenu.some((subItem) =>
          isItemActive(subItem, item, item.submenu)
        );
        if (hasActiveSubmenu) return true;

        // Se o item pai não tem route, verifica se a rota atual começa com alguma rota dos submenus
        // Ex.: quando em '/dashboard/cursos/5', o item "Cursos" (sem route) deve ficar ativo
        // porque '/dashboard/cursos/5' começa com '/dashboard/cursos' (rota do submenu "Cursos")
        // MAS apenas se não houver outro submenu mais específico que corresponda
        if (!item.route) {
          return item.submenu.some((subItem) => {
            if (subItem.route) {
              const subRoute = subItem.route.replace(/\/$/, "");
              // Verifica se a rota atual começa com a rota do submenu (mas não é exatamente igual)
              // Isso captura rotas dinâmicas como '/dashboard/cursos/5' que começam com '/dashboard/cursos'
              if (
                subRoute !== "/" &&
                path !== subRoute &&
                path.startsWith(subRoute + "/")
              ) {
                // Verifica se não há outro submenu mais específico que corresponda melhor
                const hasBetterMatch = item.submenu?.some((otherSub) => {
                  if (otherSub.route && otherSub !== subItem) {
                    const otherRoute = otherSub.route.replace(/\/$/, "");
                    return (
                      path === otherRoute || path.startsWith(otherRoute + "/")
                    );
                  }
                  return false;
                });
                // Se não há match melhor, marcar como ativo
                return !hasBetterMatch;
              }
            }
            return false;
          });
        }
      }

      return false;
    },
    [pathname, ready]
  );

  /**
   * Marca itens como ativos com base na rota atual
   *
   * @param items Array de itens do menu
   * @param parentItem Item pai (se houver)
   * @returns Array de itens com propriedade 'active' definida
   */
  const markActiveItems = useCallback(
    (items: readonly MenuItem[], parentItem?: MenuItem): MenuItem[] => {
      return items.map((item) => ({
        ...item,
        active: isItemActive(item, parentItem, items),
        // Se o item tiver submenu, processa recursivamente passando o item atual como pai
        submenu: item.submenu ? markActiveItems(item.submenu, item) : undefined,
      }));
    },
    [isItemActive]
  );

  return { isItemActive, markActiveItems, pathname, ready };
}
