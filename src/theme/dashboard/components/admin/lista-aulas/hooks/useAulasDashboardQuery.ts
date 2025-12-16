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
  orderBy?: string; // Campo para ordenação (ex: "criadoEm", "titulo")
  order?: "asc" | "desc"; // Direção da ordenação
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
      if (params.orderBy) {
        apiParams.orderBy = params.orderBy;
      }
      if (params.order) {
        apiParams.order = params.order;
      }

      const response = await listAulas(apiParams);
      
      // Debug: Log para verificar o que a API está retornando (apenas em desenvolvimento)
      if (process.env.NODE_ENV === "development") {
        console.log("[AULAS_QUERY] Parâmetros enviados:", apiParams);
        console.log("[AULAS_QUERY] Resposta da API:", {
          total: response.pagination?.total,
          totalPages: response.pagination?.totalPages,
          page: response.pagination?.page,
          pageSize: response.pagination?.pageSize,
          dataLength: response.data?.length,
        });
      }

      return response;
    },
    staleTime: 30000, // 30 seconds - cache restaurado
    gcTime: 60000, // 1 minuto
  });
}



