// src/theme/website/components/career-opportunities/hooks/usePublicVagas.ts

"use client";

import { useState, useEffect, useMemo } from "react";
import { listarVagasPublicas } from "@/api/candidatos";
import type { 
  VagaPublicaListFilters, 
  VagaPublicaItem 
} from "@/api/candidatos/types";
import type { JobData, JobFilters } from "../types";

/**
 * Converte VagaPublicaItem da API para JobData do frontend
 */
function mapVagaToJobData(
  vaga: VagaPublicaItem & { inseridaEm?: string }
): JobData {
  const empresaAnonima = Boolean(vaga.empresa?.modoAnonimo);
  return {
    id: (vaga.id || "").toString(),
    slug: vaga.slug || undefined,
    titulo: vaga.titulo,
    empresa: empresaAnonima ? "Empresa anônima" : vaga.empresa?.nome || "Empresa",
    empresaLogo: empresaAnonima
      ? undefined
      : vaga.empresa?.logoUrl || vaga.empresa?.avatarUrl || undefined,
    empresaAnonima,
    localizacao: vaga.cidade && vaga.estado 
      ? `${vaga.cidade}, ${vaga.estado}` 
      : vaga.cidade || vaga.estado || "Não informado",
    tipoContrato: (vaga.regimeDeTrabalho || "Não informado").toUpperCase(),
    modalidade: (vaga.modalidade || "Não informado").toUpperCase(),
    categoria: "Geral", // API não retorna categoria ainda
    nivel: (vaga.senioridade || "Não informado").toUpperCase(),
    descricao: vaga.descricao || "Clique em 'Ver detalhes' para mais informações sobre esta vaga.", 
    dataPublicacao: vaga.inseridaEm 
      ? new Date(vaga.inseridaEm).toLocaleDateString("pt-BR") 
      : "Não informado",
    pcd: false, // API não retorna PCD ainda
    destaque: false, // API não retorna destaque ainda
    salario: undefined, // Salário vem no detalhe da vaga
    beneficios: undefined,
    requisitos: undefined,
    vagasDisponiveis: undefined,
    urlCandidatura: undefined, // URL de candidatura não disponível na listagem
    isActive: vaga.status === "PUBLICADO",
    inscricoesAte: vaga.inscricoesAte || undefined,
  };
}

/**
 * Converte filtros do frontend para filtros da API
 */
function mapFiltersToApiParams(filters: JobFilters): VagaPublicaListFilters {
  // Só envia busca se tiver 3 ou mais caracteres
  const searchQuery = filters.busca?.trim();
  const validSearch = searchQuery && searchQuery.length >= 3 ? searchQuery : undefined;

  return {
    q: validSearch,
    modalidade: filters.modalidades.length > 0 
      ? filters.modalidades.join(",") 
      : undefined,
    regime: filters.tiposContrato.length > 0 
      ? filters.tiposContrato.join(",") 
      : undefined,
    senioridade: filters.niveis.length > 0 
      ? filters.niveis.join(",") 
      : undefined,
  };
}

interface UsePublicVagasReturn {
  data: JobData[];
  filteredData: JobData[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  refetch: () => void;
  setPage: (page: number) => void;
}

/**
 * Hook para buscar vagas públicas da API
 */
export function usePublicVagas(
  filters: JobFilters,
  pageSize: number = 10,
  enabled: boolean = true
): UsePublicVagasReturn {
  const [data, setData] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVagas = async () => {
    if (!enabled) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiFilters = mapFiltersToApiParams(filters);
      const response = await listarVagasPublicas(
        {
          ...apiFilters,
          page: currentPage,
          pageSize,
        },
        { cache: "no-store" }
      );

      const mappedData = response.data.map(mapVagaToJobData);
      setData(mappedData);
      setTotalCount(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error("Erro ao buscar vagas públicas:", err);
      setError("Erro ao carregar vagas.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVagas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, pageSize, enabled]);

  // Filtros aplicados no client-side (categorias, destaque, PCD)
  const filteredData = useMemo(() => {
    return data.filter((job) => {
      const matchCategoria =
        filters.categorias.length === 0 ||
        filters.categorias.includes(job.categoria);

      const matchDestaque = !filters.apenasDestaque || job.destaque;
      const matchPCD = !filters.apenasVagasPCD || job.pcd;

      return matchCategoria && matchDestaque && matchPCD;
    });
  }, [data, filters.categorias, filters.apenasDestaque, filters.apenasVagasPCD]);

  return {
    data,
    filteredData,
    isLoading,
    error,
    totalCount,
    currentPage,
    totalPages,
    refetch: fetchVagas,
    setPage: setCurrentPage,
  };
}
