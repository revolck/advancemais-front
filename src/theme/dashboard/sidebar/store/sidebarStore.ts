import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  // Estados
  isCollapsed: boolean;
  isMobileOpen: boolean;
  openMenus: string[]; // IDs dos menus abertos
  activeMenuItem: string | null; // ID do item ativo (selecionado)

  // Ações
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleMenu: (menuId: string) => void;
  openMenu: (menuId: string) => void;
  closeMenu: (menuId: string) => void;
  closeAllMenus: () => void;
  setActiveMenuItem: (itemId: string | null) => void;
  isMenuOpen: (menuId: string) => boolean;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      // Estados iniciais
      isCollapsed: false,
      isMobileOpen: false,
      openMenus: [],
      activeMenuItem: null,

      // Ações
      toggleCollapsed: () =>
        set((state) => ({
          isCollapsed: !state.isCollapsed,
        })),

      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

      toggleMobileMenu: () =>
        set((state) => ({
          isMobileOpen: !state.isMobileOpen,
        })),

      setMobileOpen: (open) => set({ isMobileOpen: open }),

      toggleMenu: (menuId) => {
        const { openMenus } = get();
        const isOpen = openMenus.includes(menuId);

        if (isOpen) {
          // Fecha este menu e todos os seus submenus (que podem começar com o mesmo prefixo)
          set((state) => ({
            openMenus: state.openMenus.filter(
              (id) => id !== menuId && !id.startsWith(`${menuId}-`)
            ),
          }));
        } else {
          // Abre este menu mantendo os outros abertos
          set((state) => ({
            openMenus: [...state.openMenus, menuId],
          }));
        }
      },

      openMenu: (menuId) => {
        const { openMenus } = get();
        if (!openMenus.includes(menuId)) {
          set((state) => ({
            openMenus: [...state.openMenus, menuId],
          }));
        }
      },

      closeMenu: (menuId) => {
        set((state) => ({
          openMenus: state.openMenus.filter(
            (id) => id !== menuId && !id.startsWith(`${menuId}-`)
          ),
        }));
      },

      closeAllMenus: () => set({ openMenus: [] }),

      setActiveMenuItem: (itemId) => set({ activeMenuItem: itemId }),

      isMenuOpen: (menuId) => {
        const { openMenus } = get();
        return openMenus.includes(menuId);
      },
    }),
    {
      name: "sidebar-state-storage",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);

export default useSidebarStore;
