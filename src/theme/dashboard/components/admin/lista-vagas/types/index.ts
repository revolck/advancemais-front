import type { VagaListItem } from "@/api/vagas";

export interface VagaDashboardProps {
  className?: string;
  vagas?: VagaListItem[];
  fetchFromApi?: boolean;
  itemsPerPage?: number;
  pageSize?: number;
  onDataLoaded?: (data: VagaListItem[], response: any) => void;
  onError?: (error: string) => void;
}
