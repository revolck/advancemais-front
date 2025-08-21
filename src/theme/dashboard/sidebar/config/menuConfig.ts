// src/theme/sidebar/config/menuConfig.ts
import { MenuSection } from "../types/sidebar.types";
import { UserRole } from "@/config/roles";

/**
 * Permissões compartilhadas por múltiplos itens.
 * Definidas como somente leitura para evitar mutações acidentais.
 */
const COMMON_PERMISSIONS: readonly UserRole[] = Object.freeze([
  UserRole.ADMIN,
  UserRole.MODERADOR,
]);

/**
 * Congela recursivamente um objeto, garantindo sua imutabilidade.
 * Isso evita alterações em tempo de execução que possam comprometer
 * regras de navegação ou permissões.
 */
function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as Record<string, unknown>)[prop];
    if (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });

  return obj;
}

/**
 * Configuração centralizada do menu do sidebar
 * Facilita a manutenção e extensão futura
 *
 * Removida a propriedade 'active' estática para que possa ser definida dinamicamente
 */
const rawMenuSections: MenuSection[] = [
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "Home",
        label: "Dashboard",
        route: "/dashboard/home",
        permissions: COMMON_PERMISSIONS,
        // active removido daqui
      },
      {
        icon: "BarChart2",
        label: "Analytics",
        route: "/dashboard/analytics",
        permissions: COMMON_PERMISSIONS,
      },
    ],
  },
  {
    title: "APLICAÇÕES",
    items: [
      {
        icon: "MessagesSquare",
        label: "Chat",
        route: "/chat",
        permissions: COMMON_PERMISSIONS,
      },
      {
        icon: "Mail",
        label: "Email",
        route: "/email",
        permissions: COMMON_PERMISSIONS,
      },
      {
        icon: "Calendar",
        label: "Calendário",
        route: "/calendar",
        permissions: COMMON_PERMISSIONS,
      },
      {
        icon: "FileText",
        label: "Tarefas",
        route: "/tasks",
        permissions: COMMON_PERMISSIONS,
      },
      {
        icon: "ShoppingBag",
        label: "E-commerce",
        permissions: COMMON_PERMISSIONS,
        submenu: [
          {
            icon: "Users2",
            label: "Usuários",
            permissions: COMMON_PERMISSIONS,
            submenu: [
              {
                icon: null,
                label: "Perfis",
                route: "/ecommerce/users/profiles",
                permissions: COMMON_PERMISSIONS,
              },
              {
                icon: null,
                label: "Configurações",
                route: "/ecommerce/users/settings",
                permissions: COMMON_PERMISSIONS,
              },
            ],
          },
          {
            icon: "Building2",
            label: "Produtos",
            permissions: COMMON_PERMISSIONS,
            submenu: [
              {
                icon: null,
                label: "Listagem",
                route: "/ecommerce/products/list",
                permissions: COMMON_PERMISSIONS,
              },
              {
                icon: null,
                label: "Detalhes",
                route: "/ecommerce/products/details",
                permissions: COMMON_PERMISSIONS,
              },
              {
                icon: null,
                label: "Categorias",
                route: "/ecommerce/products/categories",
                permissions: COMMON_PERMISSIONS,
              },
            ],
          },
          {
            icon: "CreditCard",
            label: "Pagamentos",
            route: "/ecommerce/payments",
            permissions: COMMON_PERMISSIONS,
          },
          {
            icon: "Receipt",
            label: "Pedidos",
            route: "/ecommerce/orders",
            permissions: COMMON_PERMISSIONS,
          },
        ],
      },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      {
        icon: "Wallet",
        label: "Transações",
        route: "/financial/transactions",
        permissions: COMMON_PERMISSIONS,
      },
      {
        icon: "Receipt",
        label: "Faturas",
        route: "/financial/invoices",
        permissions: COMMON_PERMISSIONS,
      },
      {
        icon: "CreditCard",
        label: "Pagamentos",
        route: "/financial/payments",
        permissions: COMMON_PERMISSIONS,
      },
    ],
  },
  {
    title: "EQUIPE",
    items: [
      {
        icon: "Users2",
        label: "Membros",
        route: "/team/members",
        permissions: COMMON_PERMISSIONS,
      },
      {
        icon: "Shield",
        label: "Permissões",
        route: "/team/permissions",
        permissions: COMMON_PERMISSIONS,
      },
      {
        icon: "Video",
        label: "Reuniões",
        route: "/team/meetings",
        permissions: COMMON_PERMISSIONS,
      },
    ],
  },
];

export const menuSections: ReadonlyArray<MenuSection> = deepFreeze(rawMenuSections);
