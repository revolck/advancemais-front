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

const LIST_FETCH_LIMIT = 500;

function normalizeSearchValue(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function digitsOnly(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function matchesUsuarioSearch(usuario: UsuarioOverview, rawSearch: string) {
  const normalizedSearch = normalizeSearchValue(rawSearch);
  if (!normalizedSearch) return true;

  const searchableValues = [
    usuario.nomeCompleto,
    usuario.email,
    usuario.codUsuario,
    usuario.cidade,
    usuario.estado,
  ]
    .map((value) => normalizeSearchValue(value))
    .filter(Boolean);

  if (searchableValues.some((value) => value.includes(normalizedSearch))) {
    return true;
  }

  const numericSearch = digitsOnly(rawSearch);
  if (numericSearch.length === 0) return false;

  const numericValues = [
    usuario.cpf,
    usuario.cnpj,
    usuario.telefone,
  ]
    .map((value) => digitsOnly(value))
    .filter(Boolean);

  return numericValues.some((value) => value.includes(numericSearch));
}

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
      status: normalizedFilters.status,
      role: normalizedFilters.role,
      search: normalizedFilters.search,
      cidade: normalizedFilters.cidade,
      estado: normalizedFilters.estado,
    }),
    [
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
        page: 1,
        limit: LIST_FETCH_LIMIT,
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

      return usuarios.filter((usuario) => {
        if (
          queryFilters.status &&
          usuario.status.toUpperCase() !== queryFilters.status.toUpperCase()
        ) {
          return false;
        }

        if (
          queryFilters.role &&
          usuario.role.toUpperCase() !== queryFilters.role.toUpperCase()
        ) {
          return false;
        }

        if (
          queryFilters.cidade &&
          normalizeSearchValue(usuario.cidade) !==
            normalizeSearchValue(queryFilters.cidade)
        ) {
          return false;
        }

        if (
          queryFilters.estado &&
          normalizeSearchValue(usuario.estado) !==
            normalizeSearchValue(queryFilters.estado)
        ) {
          return false;
        }

        if (
          queryFilters.search.length >= 3 &&
          !matchesUsuarioSearch(usuario, queryFilters.search)
        ) {
          return false;
        }

        return true;
      });
    },
    placeholderData: keepPreviousData,
    staleTime: 0, // Sempre considerar os dados como stale para forçar refetch
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: 'always', // Sempre refetch quando o componente é montado
    refetchOnWindowFocus: false, // Não refetch ao focar na janela (evita refetch desnecessário)
  });

  const data = useMemo<UsuariosDashboardData | null>(() => {
    const filteredUsuarios = usuariosQuery.data ?? null;

    if (!filteredUsuarios) {
      return null;
    }

    const total = filteredUsuarios.length;
    const totalPages = Math.max(1, Math.ceil(total / normalizedFilters.pageSize));
    const currentPage = Math.min(normalizedFilters.page, totalPages);
    const startIndex = (currentPage - 1) * normalizedFilters.pageSize;
    const paginatedUsuarios = filteredUsuarios.slice(
      startIndex,
      startIndex + normalizedFilters.pageSize
    );

    return {
      usuarios: paginatedUsuarios,
      pagination: {
        page: currentPage,
        pageSize: normalizedFilters.pageSize,
        total,
        totalPages,
      },
    };
  }, [normalizedFilters.page, normalizedFilters.pageSize, usuariosQuery.data]);

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
