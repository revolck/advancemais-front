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

  const buildParams = useCallback(
    (currentFilters: typeof normalizedFilters): ListUsuariosParams => {
      const params: ListUsuariosParams = {
        page: currentFilters.page,
        limit: currentFilters.pageSize,
      };

      if (currentFilters.status) {
        params.status = currentFilters.status as any;
      }
      if (currentFilters.role) {
        params.role = currentFilters.role as UserRole;
      }
      if (currentFilters.search && currentFilters.search.length >= 3) {
        params.search = currentFilters.search;
      }
      if (currentFilters.cidade) {
        params.cidade = currentFilters.cidade;
      }
      if (currentFilters.estado) {
        params.estado = currentFilters.estado;
      }

      return params;
    },
    []
  );

  const usuariosQuery = useQuery({
    queryKey: queryKeys.usuarios.list(normalizedFilters),
    queryFn: async () => {
      const response = await listUsuarios(buildParams(normalizedFilters));
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
          status: u.status as "ATIVO" | "INATIVO" | "SUSPENSO" | "BLOQUEADO",
          criadoEm: u.criadoEm,
          atualizadoEm: u.atualizadoEm,
          ultimoAcesso: u.ultimoLogin ?? undefined,
        })
      );

      return {
        usuarios,
        pagination: {
          page: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.pages,
        },
      } satisfies UsuariosDashboardData;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

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
    data: usuariosQuery.data ?? null,
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
