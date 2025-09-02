// src/theme/website/components/team-showcase/hooks/useTeamData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type { TeamMemberData } from "../types";
import { DEFAULT_TEAM_DATA } from "../constants";
import { listTeam } from "@/api/websites/components";

interface UseTeamDataReturn {
  data: TeamMemberData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados dos membros da equipe da API
 */
export function useTeamData(
  fetchFromApi: boolean = true,
  staticData?: TeamMemberData[]
): UseTeamDataReturn {
  const [data, setData] = useState<TeamMemberData[]>(
    staticData || DEFAULT_TEAM_DATA
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchFromApi) {
      setData(staticData || DEFAULT_TEAM_DATA);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const raw = await listTeam({ headers: { Accept: "application/json" } });
      const mapped: TeamMemberData[] = (raw || [])
        .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
        .map((m) => ({
          id: m.id,
          name: m.nome,
          position: m.cargo,
          imageUrl: m.photoUrl,
          imageAlt: m.nome,
          order: m.ordem || 0,
          isActive: true,
        }));
      setData(mapped);
    } catch (err) {
      console.error("Erro ao buscar dados da equipe:", err);

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
      setData(DEFAULT_TEAM_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromApi, staticData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
