import { useCallback, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listUsuarios, type ListUsuariosParams } from "@/api/usuarios";
import type {
  UsuarioDashboardFilters,
  UsuariosDashboardData,
  UsuarioOverview,
} from "../types";
import { UserRole } from "@/config/roles";
import { queryKeys } from "@/lib/react-query/queryKeys";

interface UseUsuarioDashboardDataReturn {
  data: UsuariosDashboardData | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filters: UsuarioDashboardFilters;
  updateFilters: (newFilters: Partial<UsuarioDashboardFilters>) => void;
  loadPage: (page: number) => void;
}

export function useUsuarioDashboardData(
  initialFilters?: Partial<UsuarioDashboardFilters>
): UseUsuarioDashboardDataReturn {
  const [filters, setFilters] = useState<UsuarioDashboardFilters>({
    page: 1,
    pageSize: 10,
    ...initialFilters,
  });

  const normalizedFilters = useMemo(() => {
    return {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10,
      status: filters.status ?? null,
      role: filters.role ?? null,
      search: filters.search ?? "",
      cidade: filters.cidade ?? null,
      estado: filters.estado ?? null,
    };
  }, [filters]);

  const queryFilters = useMemo(
    () => ({
      page: normalizedFilters.page,
      pageSize: normalizedFilters.pageSize,
      status: normalizedFilters.status,
      role: normalizedFilters.role,
      search: normalizedFilters.search,
      cidade: normalizedFilters.cidade,
      estado: normalizedFilters.estado,
    }),
    [
      normalizedFilters.page,
      normalizedFilters.pageSize,
      normalizedFilters.cidade,
      normalizedFilters.estado,
      normalizedFilters.role,
      normalizedFilters.search,
      normalizedFilters.status,
    ]
  );

  const buildParams = useCallback(
    (currentFilters: typeof queryFilters): ListUsuariosParams => {
      const params: ListUsuariosParams = {
        page: currentFilters.page,
        limit: currentFilters.pageSize,
      };

      // Apenas adiciona filtros se tiverem valores válidos
      if (currentFilters.status && currentFilters.status !== null) {
        params.status = currentFilters.status as any;
      }
      if (currentFilters.role && currentFilters.role !== null) {
        params.role = currentFilters.role as UserRole;
      }
      if (currentFilters.cidade && currentFilters.cidade !== null) {
        params.cidade = currentFilters.cidade;
      }
      if (currentFilters.estado && currentFilters.estado !== null) {
        params.estado = currentFilters.estado;
      }
      if (currentFilters.search && currentFilters.search.length >= 3) {
        params.search = currentFilters.search;
      }

      return params;
    },
    []
  );

  const usuariosQuery = useQuery({
    queryKey: queryKeys.usuarios.list(queryFilters),
    queryFn: async () => {
      const params = buildParams(queryFilters);
      
      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === "development") {
        console.log("📋 Buscando usuários com parâmetros:", {
          params,
          queryFilters,
        });
      }
      
      const response = await listUsuarios(params);
      
      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Usuários retornados:", {
          total: response.pagination?.total,
          usuarios: response.usuarios?.length,
          pagination: response.pagination,
        });
        
        // Log detalhado para verificar vínculos de ALUNO_CANDIDATO
        const alunosCandidatos = (response.usuarios || []).filter(
          (u) => u.role === "ALUNO_CANDIDATO"
        );
        
        if (alunosCandidatos.length > 0) {
          console.log("🎓 Alunos/Candidatos encontrados:", alunosCandidatos.map((u) => ({
            id: u.id,
            nome: u.nomeCompleto,
            role: u.role,
            curriculos: u.curriculos?.length ?? 0,
            cursosInscricoes: u.cursosInscricoes?.length ?? 0,
            temVinculos: (u.curriculos?.length ?? 0) > 0 || (u.cursosInscricoes?.length ?? 0) > 0,
          })));
        }
      }
      const usuarios: UsuarioOverview[] = (response.usuarios || []).map(
        (u) => ({
          id: u.id,
          nomeCompleto: u.nomeCompleto,
          email: u.email,
          telefone: u.telefone,
          avatarUrl: u.avatarUrl ?? undefined,
          codUsuario: u.codUsuario,
          cpf: u.cpf,
          cnpj: u.cnpj,
          tipoUsuario: u.tipoUsuario,
          cidade: u.cidade,
          estado: u.estado,
          role: u.role as UserRole,
          status: u.status,
          criadoEm: u.criadoEm,
          atualizadoEm: u.atualizadoEm,
          ultimoAcesso: u.ultimoLogin ?? undefined,
          // Mapear informações de vínculos (apenas IDs, conforme nova API)
          // A API retorna Array<{ id: string }> apenas para ALUNO_CANDIDATO
          curriculos: u.curriculos,
          cursosInscricoes: u.cursosInscricoes,
        })
      );

      const rawPagination = (response as any)?.pagination ?? {};
      const page = Number(
        rawPagination?.page ?? queryFilters.page ?? normalizedFilters.page
      );
      const pageSize = Number(
        rawPagination?.limit ??
          rawPagination?.pageSize ??
          queryFilters.pageSize ??
          normalizedFilters.pageSize
      );
      const total = Number(rawPagination?.total ?? usuarios.length);
      const totalPages = Number(
        rawPagination?.pages ??
          rawPagination?.totalPages ??
          Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
      );

      return {
        usuarios,
        pagination: {
          page: Number.isFinite(page) && page > 0 ? page : 1,
          pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
          total: Number.isFinite(total) && total >= 0 ? total : 0,
          totalPages:
            Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
        },
      } as UsuariosDashboardData;
    },
    placeholderData: keepPreviousData,
    staleTime: 0, // Sempre considerar os dados como stale para forçar refetch
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: 'always', // Sempre refetch quando o componente é montado
    refetchOnWindowFocus: false, // Não refetch ao focar na janela (evita refetch desnecessário)
  });

  const data = useMemo<UsuariosDashboardData | null>(() => {
    return usuariosQuery.data ?? null;
  }, [usuariosQuery.data]);

  const updateFilters = useCallback(
    (newFilters: Partial<UsuarioDashboardFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    },
    []
  );

  const loadPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return {
    data,
    isLoading: usuariosQuery.status === "pending",
    isFetching: usuariosQuery.isFetching,
    error:
      usuariosQuery.error?.message ??
      (usuariosQuery.error ? "Erro ao carregar usuários" : null),
    filters,
    updateFilters,
    loadPage,
  };
}
