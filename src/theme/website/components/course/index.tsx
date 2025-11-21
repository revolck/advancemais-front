// Componente principal
export { default } from "./CourseCatalog";
export { CourseCatalog } from "./CourseCatalog";

// Componentes individuais
export { CourseCard } from "./components/CourseCard";
export { CourseHeader } from "./components/CourseHeader";
export { CourseListHeader } from "./components/CourseListHeader";
export { FilterSidebar } from "./components/FilterSidebar";

// Hook
export { usePublicCursos } from "./hooks/usePublicCursos";

// Tipos e constantes
export type { CourseData, CourseCatalogProps, CourseCardProps } from "./types";
export { COURSE_CONFIG } from "./constants";
