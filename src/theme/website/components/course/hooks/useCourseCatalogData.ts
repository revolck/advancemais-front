// src/theme/website/components/course-catalog/hooks/useCourseCatalogData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  CourseData,
  CategoryData,
  CourseCatalogApiResponse,
} from "../types";
import {
  DEFAULT_COURSES_DATA,
  DEFAULT_CATEGORIES_DATA,
  COURSE_CATALOG_CONFIG,
} from "../constants";

interface UseCourseCatalogDataReturn {
  courses: CourseData[];
  categories: CategoryData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados do catálogo de cursos da API
 */
export function useCourseCatalogData(
  fetchFromApi: boolean = true,
  staticData?: { courses: CourseData[]; categories: CategoryData[] }
): UseCourseCatalogDataReturn {
  const [courses, setCourses] = useState<CourseData[]>(
    staticData?.courses || DEFAULT_COURSES_DATA
  );
  const [categories, setCategories] = useState<CategoryData[]>(
    staticData?.categories || DEFAULT_CATEGORIES_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setCourses(staticData?.courses || DEFAULT_COURSES_DATA);
      setCategories(staticData?.categories || DEFAULT_CATEGORIES_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        COURSE_CATALOG_CONFIG.api.timeout
      );

      const response = await fetch(COURSE_CATALOG_CONFIG.api.endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: CourseCatalogApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Dados inválidos recebidos da API");
      }

      // Filtra apenas cursos ativos e ordena
      const activeCourses = result.data.courses
        .filter((course) => course.isActive)
        .sort((a, b) => a.order - b.order);

      setCourses(activeCourses);
      setCategories(result.data.categories);
    } catch (err) {
      console.error("Erro ao buscar dados do catálogo de cursos:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Tempo limite excedido. Usando dados padrão.");
        } else {
          setError(`Erro na API: ${err.message}. Usando dados padrão.`);
        }
      } else {
        setError("Erro desconhecido. Usando dados padrão.");
      }

      // Fallback para dados padrão
      setCourses(DEFAULT_COURSES_DATA);
      setCategories(DEFAULT_CATEGORIES_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromApi, staticData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    courses,
    categories,
    isLoading,
    error,
    refetch: fetchData,
  };
}
