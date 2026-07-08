export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
  disabled?: boolean;
  popupTarget?: string;
}

export interface FooterSection {
  id?: string;
  title: string;
  icon?: string;
  links: FooterLink[];
}

export interface ContactInfo {
  address: string;
  phones: string[];
  hours: string;
  email?: string;
}

export interface FooterConfig {
  sections: FooterSection[];
  contact: ContactInfo;
  legal: FooterLink[];
  copyright: string;
}
