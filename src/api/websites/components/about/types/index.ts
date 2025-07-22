export interface AboutApiResponse {
  src: string;
  title: string;
  description: string;
}

export interface AboutImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface AboutContentProps {
  title: string;
  description: string;
}
