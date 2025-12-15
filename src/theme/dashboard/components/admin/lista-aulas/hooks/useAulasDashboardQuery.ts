import { useQuery } from "@tanstack/react-query";
import { listAulas, type AulasListParams, type AulasListResponse } from "@/api/aulas";

interface UseAulasDashboardQueryParams {
  turmaId?: string | null;
  moduloId?: string | null;
  status?: string[];
  modalidade?: string[];
  obrigatoria?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useAulasDashboardQuery(params: UseAulasDashboardQueryParams) {
  return useQuery<AulasListResponse>({
    queryKey: ["aulas", params],
    queryFn: async () => {
      const apiParams: AulasListParams = {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      };

      if (params.turmaId) {
        apiParams.turmaId = params.turmaId;
      }
      if (params.moduloId) {
        apiParams.moduloId = params.moduloId;
      }
      if (params.status && params.status.length > 0) {
        apiParams.status = params.status as AulasListParams["status"];
      }
      if (params.modalidade && params.modalidade.length > 0) {
        apiParams.modalidade = params.modalidade as AulasListParams["modalidade"];
      }
      if (params.obrigatoria !== undefined) {
        apiParams.obrigatoria = params.obrigatoria;
      }
      if (params.search) {
        apiParams.search = params.search;
      }

      return await listAulas(apiParams);
    },
    staleTime: 30000, // 30 seconds
  });
}



