// src/theme/sidebar/config/menuConfig.ts
import { MenuSection } from "../types/sidebar.types";

/**
 * Configuração centralizada do menu do sidebar
 * Facilita a manutenção e extensão futura
 *
 * Removida a propriedade 'active' estática para que possa ser definida dinamicamente
 */
export const menuSections: MenuSection[] = [
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "Home",
        label: "Dashboard",
        href: "/dashboard/home",
        // active removido daqui
      },
      {
        icon: "BarChart2",
        label: "Analytics",
        href: "/dashboard/analytics",
      },
    ],
  },
  {
    title: "APLICAÇÕES",
    items: [
      { icon: "MessagesSquare", label: "Chat", href: "/chat" },
      { icon: "Mail", label: "Email", href: "/email" },
      { icon: "Calendar", label: "Calendário", href: "/calendar" },
      { icon: "FileText", label: "Tarefas", href: "/tasks" },
      {
        icon: "ShoppingBag",
        label: "E-commerce",
        submenu: [
          {
            icon: "Users2",
            label: "Usuários",
            submenu: [
              {
                icon: null,
                label: "Perfis",
                href: "/ecommerce/users/profiles",
              },
              {
                icon: null,
                label: "Configurações",
                href: "/ecommerce/users/settings",
              },
            ],
          },
          {
            icon: "Building2",
            label: "Produtos",
            submenu: [
              {
                icon: null,
                label: "Listagem",
                href: "/ecommerce/products/list",
              },
              {
                icon: null,
                label: "Detalhes",
                href: "/ecommerce/products/details",
              },
              {
                icon: null,
                label: "Categorias",
                href: "/ecommerce/products/categories",
              },
            ],
          },
          {
            icon: "CreditCard",
            label: "Pagamentos",
            href: "/ecommerce/payments",
          },
          { icon: "Receipt", label: "Pedidos", href: "/ecommerce/orders" },
        ],
      },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      { icon: "Wallet", label: "Transações", href: "/financial/transactions" },
      { icon: "Receipt", label: "Faturas", href: "/financial/invoices" },
      { icon: "CreditCard", label: "Pagamentos", href: "/financial/payments" },
    ],
  },
  {
    title: "EQUIPE",
    items: [
      { icon: "Users2", label: "Membros", href: "/team/members" },
      { icon: "Shield", label: "Permissões", href: "/team/permissions" },
      { icon: "Video", label: "Reuniões", href: "/team/meetings" },
    ],
  },
];
