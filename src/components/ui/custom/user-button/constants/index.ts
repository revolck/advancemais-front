import type { LucideIcon } from "lucide-react";
import {
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export const MENU_UPGRADE: MenuItem[] = [
  {
    label: "Fazer upgrade agora",
    href: "/dashboard/upgrade",
    icon: SparklesIcon,
  },
];

export const MENU_ACCOUNT: MenuItem[] = [
  { label: "Perfil", href: "/perfil", icon: BadgeCheckIcon },
  { label: "Pagamentos", href: "/pagamentos", icon: CreditCardIcon },
  { label: "Notificações", href: "/notificacoes", icon: BellIcon },
];

export const MENU_LOGOUT: MenuItem = {
  label: "Sair",
  href: "/logout",
  icon: LogOutIcon,
  className: "text-red-600",
  iconClassName: "text-red-600",
};
