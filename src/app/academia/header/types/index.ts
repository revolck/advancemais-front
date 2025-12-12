export interface DropdownItemType {
  label: string;
  href: string;
  iconName?: string;
}

export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  type: "link" | "dropdown";
  items?: DropdownItemType[];
}

