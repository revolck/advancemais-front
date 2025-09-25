import type { LucideIcon } from "lucide-react";

export interface IconItem {
  name: string;
  component: LucideIcon;
}

export interface IconSelectorProps {
  value?: string; // Agora é opcional
  onValueChange: (iconName: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

export interface IconGridProps {
  icons: IconItem[];
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}
