// src/theme/website/components/courses-carousel/index.ts

// Componente principal
export { default } from "./CoursesCarousel";
export { default as CoursesCarousel } from "./CoursesCarousel";

// Componentes individuais
export { CourseCard } from "./components/CourseCard";

// Hook
export { useCoursesData } from "./hooks/useCoursesData";

// Tipos e constantes
export type {
  CourseData,
  CoursesCarouselProps,
  CourseCardProps,
} from "./types";
export { COURSES_CONFIG, COURSE_TAGS } from "./constants";
