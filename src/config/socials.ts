export interface SocialNetwork {
  name: string;
  url: string;
  active: boolean;
  icon: string;
}

const socials: SocialNetwork[] = [
  {
    name: "Facebook",
    url: "https://facebook.com",
    active: true,
    icon: "facebook",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com",
    active: true,
    icon: "linkedin",
  },
  {
    name: "YouTube",
    url: "https://youtube.com",
    active: true,
    icon: "youtube",
  },
  {
    name: "Instagram",
    url: "https://instagram.com",
    active: true,
    icon: "instagram",
  },
];

export default socials;
