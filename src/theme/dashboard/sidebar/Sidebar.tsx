"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./components/header/SidebarHeader";
import { MenuList } from "./components/menu/MenuList";
import { useSidebarNavigation } from "./hooks/useSidebarNavigation";
import { menuSections } from "./config/menuConfig";
import type {
  SidebarProps,
  MenuSection,
  MenuItem,
} from "./types/sidebar.types";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";

const filterItemsByRole = (
  items: readonly MenuItem[],
  role: UserRole
): MenuItem[] => {
  return items
    .filter((item) => {
      // Se não tem permissões definidas, não mostra (segurança)
      if (!item.permissions || item.permissions.length === 0) {
        return false;
      }
      // Só mostra se o role está explicitamente nas permissões
      return item.permissions.includes(role);
    })
    .map((item) => ({
      ...item,
      submenu: item.submenu ? filterItemsByRole(item.submenu, role) : undefined,
    }))
    .filter((item) => !item.submenu || item.submenu.length > 0);
};

const mergeMenuItems = (
  existingItems: MenuItem[],
  newItems: MenuItem[],
  role: UserRole
): MenuItem[] => {
  // Primeiro, filtra os itens existentes para garantir que todos têm permissão
  const filteredExisting = existingItems.filter((item) => {
    if (!item.permissions || item.permissions.length === 0) return false;
    return item.permissions.includes(role);
  });

  // Cria um mapa de itens por rota para facilitar a mesclagem
  const itemsByRoute = new Map<string, MenuItem>();
  const itemsByLabel = new Map<string, MenuItem>();

  // Adiciona itens existentes filtrados ao mapa
  for (const item of filteredExisting) {
    if (item.route) {
      itemsByRoute.set(item.route, item);
    }
    const labelKey = `${item.label}-${item.route || ""}`;
    itemsByLabel.set(labelKey, item);
  }

  // Processa novos itens
  for (const newItem of newItems) {
    // Verifica se o item tem permissão para o role atual - OBRIGATÓRIO
    if (!newItem.permissions || newItem.permissions.length === 0) {
      continue; // Pula itens sem permissões definidas
    }
    if (!newItem.permissions.includes(role)) {
      continue; // Pula itens sem permissão para este role
    }

    const itemKey = `${newItem.label}-${newItem.route || ""}`;
    
    // Se já existe um item com a mesma rota, mescla os submenus se houver
    if (newItem.route && itemsByRoute.has(newItem.route)) {
      const existingItem = itemsByRoute.get(newItem.route)!;
      
      // Se o existente não tem permissão, substitui pelo novo (que tem permissão)
      if (!existingItem.permissions || !existingItem.permissions.includes(role)) {
        const filteredSubmenu = newItem.submenu
          ? filterItemsByRole(newItem.submenu, role)
          : undefined;
        const itemToReplace = {
          ...newItem,
          submenu: filteredSubmenu,
        };
        itemsByRoute.set(newItem.route, itemToReplace);
        itemsByLabel.set(itemKey, itemToReplace);
        continue;
      }
      
      // Ambos têm permissão, mescla submenus
      if (newItem.submenu && existingItem.submenu) {
        // Mescla submenus (já filtrados por permissão)
        const mergedSubmenu = mergeMenuItems(
          existingItem.submenu,
          newItem.submenu,
          role
        );
        // Cria novo objeto em vez de modificar o existente
        const updatedItem = {
          ...existingItem,
          submenu: mergedSubmenu,
        };
        itemsByRoute.set(newItem.route, updatedItem);
        itemsByLabel.set(itemKey, updatedItem);
      } else if (newItem.submenu && !existingItem.submenu) {
        // Adiciona submenu ao item existente (já filtrado)
        const filteredSubmenu = filterItemsByRole(newItem.submenu, role);
        if (filteredSubmenu.length > 0) {
          // Cria novo objeto em vez de modificar o existente
          const updatedItem = {
            ...existingItem,
            submenu: filteredSubmenu,
          };
          itemsByRoute.set(newItem.route, updatedItem);
          itemsByLabel.set(itemKey, updatedItem);
        }
      }
    } else if (!itemsByLabel.has(itemKey)) {
      // Item novo, adiciona apenas se tiver permissão
      // Filtra submenu antes de adicionar
      const filteredSubmenu = newItem.submenu
        ? filterItemsByRole(newItem.submenu, role)
        : undefined;
      
      // Só adiciona se não tiver submenu ou se o submenu filtrado tiver itens
      if (!filteredSubmenu || filteredSubmenu.length > 0) {
        const itemToAdd = {
          ...newItem,
          submenu: filteredSubmenu,
        };
        if (newItem.route) {
          itemsByRoute.set(newItem.route, itemToAdd);
        }
        itemsByLabel.set(itemKey, itemToAdd);
      }
    }
  }

  // Converte o mapa de volta para array e filtra novamente para garantir segurança
  const merged = Array.from(itemsByLabel.values());
  return filterItemsByRole(merged, role);
};

const filterSectionsByRole = (
  sections: readonly MenuSection[],
  role: UserRole
): MenuSection[] => {
  // Filtra seções por role - verifica cada item individualmente
  const filteredSections = sections
    .map((section) => {
      const filteredItems = filterItemsByRole(section.items, role);
      // Só retorna a seção se tiver itens após o filtro
      if (filteredItems.length === 0) {
        return null;
      }
      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section): section is MenuSection => section !== null);

  // Debug: Log das seções filtradas antes da mesclagem
  if (process.env.NODE_ENV === "development" && role === UserRole.PEDAGOGICO) {
    console.log("[Sidebar] Seções filtradas antes da mesclagem:", filteredSections.length);
    filteredSections.forEach((section) => {
      console.log(`[Sidebar] Seção "${section.title}" tem ${section.items.length} itens:`, 
        section.items.map(i => ({
          label: i.label,
          route: i.route,
          permissions: i.permissions,
        }))
      );
    });
  }

  // Mescla seções com o mesmo título
  const mergedSections = new Map<string, MenuSection>();
  
  for (const section of filteredSections) {
    const existing = mergedSections.get(section.title);
    if (existing) {
      // Mescla os itens, evitando duplicatas e verificando permissões
      const mergedItems = mergeMenuItems(existing.items, section.items, role);
      // Filtra novamente após mesclagem para garantir que não há itens sem permissão
      const finalItems = filterItemsByRole(mergedItems, role);
      
      // Debug: Log da mesclagem
      if (process.env.NODE_ENV === "development" && role === UserRole.PEDAGOGICO) {
        console.log(`[Sidebar] Mesclando seção "${section.title}"`);
        console.log(`[Sidebar] Itens existentes: ${existing.items.length}, novos: ${section.items.length}, mesclados: ${mergedItems.length}, finais: ${finalItems.length}`);
        finalItems.forEach(item => {
          if (!item.permissions || !item.permissions.includes(role)) {
            console.error(`[Sidebar] ERRO: Item "${item.label}" sem permissão para ${role}!`, item);
          }
        });
      }
      
      if (finalItems.length > 0) {
        mergedSections.set(section.title, {
          ...existing,
          items: finalItems,
        });
      }
    } else {
      mergedSections.set(section.title, section);
    }
  }

  const result = Array.from(mergedSections.values());
  
  // Debug: Log final
  if (process.env.NODE_ENV === "development" && role === UserRole.PEDAGOGICO) {
    console.log("[Sidebar] Seções finais após mesclagem:", result.length);
    result.forEach((section) => {
      console.log(`[Sidebar] Seção final "${section.title}" tem ${section.items.length} itens:`, 
        section.items.map(i => ({
          label: i.label,
          route: i.route,
          permissions: i.permissions,
          hasSubmenu: !!i.submenu,
          submenuCount: i.submenu?.length || 0,
        }))
      );
    });
  }

  return result;
};

/**
 * Componente principal do Sidebar
 */
export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isCollapsed,
}: SidebarProps) {
  // Hook para navegação
  const { handleNavigation } = useSidebarNavigation(setIsMobileMenuOpen);
  const role = useUserRole();

  const sections = useMemo(() => {
    if (!role) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Sidebar] Role é null, retornando menu vazio");
      }
      return [];
    }
    
    // Debug: Log detalhado para PEDAGOGICO
    if (process.env.NODE_ENV === "development") {
      console.log("[Sidebar] Role detectado:", role);
      if (role === UserRole.PEDAGOGICO) {
        console.log("[Sidebar] Filtrando menu para PEDAGOGICO");
        console.log("[Sidebar] Total de seções no menuConfig:", menuSections.length);
      }
    }
    
    const filtered = filterSectionsByRole(menuSections, role);
    
    // Debug: Log para verificar o que está sendo filtrado
    if (process.env.NODE_ENV === "development") {
      if (role === UserRole.PEDAGOGICO) {
        console.log("[Sidebar] Seções filtradas:", filtered.length);
        filtered.forEach((section) => {
          console.log(`[Sidebar] Section "${section.title}" items:`, section.items.map(i => ({
            label: i.label,
            route: i.route,
            permissions: i.permissions,
            hasSubmenu: !!i.submenu,
            submenuCount: i.submenu?.length || 0
          })));
        });
      }
    }
    return filtered;
  }, [role]);

  return (
    <>
      {/* Container principal do sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground",
          "lg:translate-x-0 lg:static border-r border-[var(--color-blue)]",
          "h-full flex flex-col overflow-hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Cabeçalho do Sidebar */}
        <SidebarHeader
          isCollapsed={isCollapsed}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Linha divisória abaixo da logo - agora pega toda a largura */}
        <div className="border-b border-[#314e93]" />

        {/* Conteúdo do Menu com espaçamento maior */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pt-6">
          <MenuList
            sections={sections}
            isCollapsed={isCollapsed}
            handleNavigation={handleNavigation}
          />
        </div>
      </div>

      {/* Overlay móvel semi-transparente */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
