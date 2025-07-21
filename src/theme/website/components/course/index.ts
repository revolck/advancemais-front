// src/theme/website/components/course-catalog/index.ts

// Componente principal
export { default } from "./CourseCatalog";
export { default as CourseCatalog } from "./CourseCatalog";

// Componentes individuais
export { CourseCard } from "./components/CourseCard";
export { CourseFilters } from "./components/CourseFilters";

// Hook
export { useCourseCatalogData } from "./hooks/useCourseCatalogData";

// Tipos e constantes
export type { CourseData, CourseCatalogProps, CourseCardProps } from "./types";
export {
  DEFAULT_COURSES_DATA,
  DEFAULT_CATEGORIES_DATA,
  COURSE_CATALOG_CONFIG,
} from "./constants";
