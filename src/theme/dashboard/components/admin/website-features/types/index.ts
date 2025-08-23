export interface WebsiteFeature {
  id: number;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  imageUrlHover?: string;
}

export interface WebsiteFeaturesProps {
  className?: string;
  onFeatureClick?: (feature: WebsiteFeature) => void;
  customFeatures?: WebsiteFeature[];
  showTitle?: boolean;
}

export interface WebsiteFeaturesApiResponse {
  success: boolean;
  data: WebsiteFeature[];
  message?: string;
}

export interface UseWebsiteFeaturesDataReturn {
  features: WebsiteFeature[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
