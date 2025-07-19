// src/theme/website/components/blog-section/index.ts

// Componente principal
export { default } from "./BlogSection";
export { default as BlogSection } from "./BlogSection";

// Componentes individuais
export { BlogCard } from "./components/BlogCard";

// Hook
export { useBlogData } from "./hooks/useBlogData";

// Tipos e constantes
export type { BlogPostData, BlogSectionProps, BlogCardProps } from "./types";
export { DEFAULT_BLOG_DATA, BLOG_CONFIG, BLOG_CATEGORIES } from "./constants";
