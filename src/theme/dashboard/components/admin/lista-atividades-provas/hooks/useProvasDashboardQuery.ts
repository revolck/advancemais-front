import { useQuery } from "@tanstack/react-query";
import { listProvas, listCursos, listTurmas, type TurmaProva } from "@/api/cursos";

interface UseProvasDashboardQueryParams {
  turmaId?: string | null;
  cursoId?: number | string | null;
  search?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

interface ProvasListResponse {
  data: TurmaProva[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Hook para buscar provas do dashboard
 * Se turmaId for fornecido, busca apenas provas dessa turma
 * Caso contrário, busca provas de todas as turmas
 */
export function useProvasDashboardQuery(params: UseProvasDashboardQueryParams) {
  return useQuery<ProvasListResponse>({
    queryKey: ["provas-dashboard", params],
    queryFn: async () => {
      const allProvas: TurmaProva[] = [];

      // Se turmaId e cursoId foram fornecidos, busca apenas dessa turma
      if (params.turmaId && params.cursoId) {
        try {
          const provas = await listProvas(params.cursoId, params.turmaId);
          allProvas.push(...provas);
        } catch (error) {
          console.error("Erro ao buscar provas da turma:", error);
        }
      } else {
        // Busca provas de todas as turmas
        try {
          // Buscar todos os cursos
          let page = 1;
          const pageSize = 50;
          let hasMore = true;

          while (hasMore) {
            const cursosResponse = await listCursos({ page, pageSize });
            const cursos = cursosResponse.data || [];

            for (const curso of cursos) {
              try {
                const turmas = await listTurmas(curso.id);

                for (const turma of turmas) {
                  // Filtrar por turmaId se fornecido
                  if (params.turmaId && turma.id !== params.turmaId) {
                    continue;
                  }

                  try {
                    const provas = await listProvas(curso.id, turma.id);
                    
                    // Adicionar informações de contexto (curso e turma) a cada prova
                    const provasComContexto = provas.map((prova) => ({
                      ...prova,
                      cursoId: curso.id,
                      cursoNome: curso.nome,
                      turmaId: turma.id,
                      turmaNome: turma.nome,
                    }));

                    allProvas.push(...provasComContexto);
                  } catch (error) {
                    // Ignora erros ao buscar provas de uma turma específica
                    console.warn(`Erro ao buscar provas da turma ${turma.id}:`, error);
                  }
                }
              } catch (error) {
                // Ignora erros ao buscar turmas de um curso específico
                console.warn(`Erro ao buscar turmas do curso ${curso.id}:`, error);
              }
            }

            const totalPages = cursosResponse.pagination?.totalPages || 1;
            hasMore = page < totalPages;
            page++;

            if (page > 100) break; // Limite de segurança
          }
        } catch (error) {
          console.error("Erro ao buscar provas:", error);
          throw error;
        }
      }

      // Aplicar filtro de busca se fornecido
      let filteredProvas = allProvas;
      if (params.search && params.search.trim().length > 0) {
        const searchLower = params.search.toLowerCase().trim();
        filteredProvas = allProvas.filter(
          (prova) =>
            prova.titulo?.toLowerCase().includes(searchLower) ||
            prova.nome?.toLowerCase().includes(searchLower) ||
            prova.descricao?.toLowerCase().includes(searchLower) ||
            (prova as any).cursoNome?.toLowerCase().includes(searchLower) ||
            (prova as any).turmaNome?.toLowerCase().includes(searchLower)
        );
      }

      // Aplicar ordenação
      if (params.orderBy) {
        filteredProvas.sort((a, b) => {
          const aValue = (a as any)[params.orderBy!];
          const bValue = (b as any)[params.orderBy!];

          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;

          const comparison =
            typeof aValue === "string"
              ? aValue.localeCompare(bValue)
              : aValue > bValue
                ? 1
                : aValue < bValue
                  ? -1
                  : 0;

          return params.order === "desc" ? -comparison : comparison;
        });
      }

      // Aplicar paginação
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProvas = filteredProvas.slice(startIndex, endIndex);

      return {
        data: paginatedProvas,
        pagination: {
          total: filteredProvas.length,
          page,
          pageSize,
          totalPages: Math.ceil(filteredProvas.length / pageSize),
        },
      };
    },
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minuto
  });
}

