import type { Curso } from "@/api/cursos";

export interface CursosDashboardProps {
  className?: string;
  cursos?: Curso[];
  fetchFromApi?: boolean;
  itemsPerPage?: number;
  pageSize?: number;
  onDataLoaded?: (data: Curso[], response: any) => void;
  onError?: (error: string) => void;
}

