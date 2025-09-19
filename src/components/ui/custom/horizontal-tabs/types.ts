import type { ReactNode } from "react";
import type { IconName } from "../Icons";

export interface HorizontalTabItem {
  value: string;
  label: string;
  description?: string;
  badge?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  icon?: IconName;
}

export interface HorizontalTabsProps {
  items: HorizontalTabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
  headline?: {
    title?: string;
    description?: string;
  };
  adornment?: ReactNode;
}
