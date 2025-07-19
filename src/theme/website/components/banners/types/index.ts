export interface BannerItem {
  id: number;
  imagemUrl: string;
  linkUrl: string;
  position: number;
  alt: string;
}

export interface BannerCardProps {
  banner: BannerItem;
  priority?: boolean;
  className?: string;
}

export interface BannersGroupProps {
  className?: string;
  title?: string;
}
