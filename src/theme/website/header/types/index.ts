export interface DropdownItemType {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  type: "link" | "dropdown";
  items?: DropdownItemType[];
}

export interface HeaderConfig {
  navigation: NavigationItem[];
  brand: {
    name: string;
    logo?: React.ReactNode;
  };
  actions: {
    loginText: string;
    signupText: string;
    loginHref: string;
    signupHref: string;
  };
}
