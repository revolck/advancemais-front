/**
 * Configuração do dashboard
 */

// Tipos de item da navegação
type NavItemWithChildren = {
  title: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  children: NavItem[];
};

type NavItemWithoutChildren = {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
};

export type NavItem = NavItemWithChildren | NavItemWithoutChildren;

// Menu da navegação principal do dashboard
export const dashboardNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart",
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: "Users",
  },
  {
    title: "Vendas",
    icon: "ShoppingCart",
    children: [
      {
        title: "Pedidos",
        href: "/dashboard/vendas/pedidos",
      },
      {
        title: "Produtos",
        href: "/dashboard/vendas/produtos",
      },
      {
        title: "Cupons",
        href: "/dashboard/vendas/cupons",
      },
    ],
  },
  {
    title: "Financeiro",
    icon: "DollarSign",
    children: [
      {
        title: "Faturamento",
        href: "/dashboard/financeiro/faturamento",
      },
      {
        title: "Despesas",
        href: "/dashboard/financeiro/despesas",
      },
      {
        title: "Relatórios",
        href: "/dashboard/financeiro/relatorios",
      },
    ],
  },
  {
    title: "Marketing",
    icon: "Megaphone",
    children: [
      {
        title: "Campanhas",
        href: "/dashboard/marketing/campanhas",
      },
      {
        title: "Email Marketing",
        href: "/dashboard/marketing/email",
      },
      {
        title: "Redes Sociais",
        href: "/dashboard/marketing/social",
      },
    ],
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: "Settings",
  },
];

// Menu do usuário (dropdown)
export const userNav = [
  {
    title: "Perfil",
    href: "/dashboard/perfil",
    icon: "User",
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: "Settings",
  },
  {
    title: "Ajuda",
    href: "/dashboard/ajuda",
    icon: "HelpCircle",
  },
  {
    title: "Sair",
    href: "/api/auth/logout",
    icon: "LogOut",
  },
];

// Ações rápidas
export const quickActions = [
  {
    title: "Novo Cliente",
    href: "/dashboard/clientes/novo",
    icon: "UserPlus",
  },
  {
    title: "Nova Venda",
    href: "/dashboard/vendas/pedidos/novo",
    icon: "Plus",
  },
  {
    title: "Novo Produto",
    href: "/dashboard/vendas/produtos/novo",
    icon: "Package",
  },
  {
    title: "Nova Campanha",
    href: "/dashboard/marketing/campanhas/nova",
    icon: "Megaphone",
  },
];

// Cards de resumo para o dashboard
export const dashboardSummaryCards = [
  {
    title: "Total de Vendas",
    metric: "R$ 24.592,00",
    icon: "DollarSign",
    description: "12% a mais que o mês anterior",
    trend: "up",
  },
  {
    title: "Novos Clientes",
    metric: "54",
    icon: "Users",
    description: "8% a mais que o mês anterior",
    trend: "up",
  },
  {
    title: "Taxa de Conversão",
    metric: "12,8%",
    icon: "BarChart",
    description: "2% a menos que o mês anterior",
    trend: "down",
  },
  {
    title: "Ticket Médio",
    metric: "R$ 486,50",
    icon: "ShoppingCart",
    description: "3% a mais que o mês anterior",
    trend: "up",
  },
];

// Status de pedidos
export const orderStatuses = [
  {
    value: "pending",
    label: "Pendente",
    color: "yellow",
  },
  {
    value: "processing",
    label: "Em processamento",
    color: "blue",
  },
  {
    value: "shipped",
    label: "Enviado",
    color: "green",
  },
  {
    value: "delivered",
    label: "Entregue",
    color: "green",
  },
  {
    value: "cancelled",
    label: "Cancelado",
    color: "red",
  },
  {
    value: "refunded",
    label: "Reembolsado",
    color: "gray",
  },
];

// Status de pagamentos
export const paymentStatuses = [
  {
    value: "pending",
    label: "Pendente",
    color: "yellow",
  },
  {
    value: "processing",
    label: "Em processamento",
    color: "blue",
  },
  {
    value: "success",
    label: "Aprovado",
    color: "green",
  },
  {
    value: "failed",
    label: "Falhou",
    color: "red",
  },
  {
    value: "refunded",
    label: "Reembolsado",
    color: "gray",
  },
];
