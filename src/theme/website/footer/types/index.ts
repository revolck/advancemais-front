export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
}

export interface FooterSection {
  title: string;
  icon?: string;
  links: FooterLink[];
}

export interface ContactInfo {
  address: string;
  phones: string[];
  hours: string;
}

export interface FooterConfig {
  sections: FooterSection[];
  contact: ContactInfo;
  legal: FooterLink[];
  copyright: string;
}
