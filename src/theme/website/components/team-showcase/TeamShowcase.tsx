// src/theme/website/components/team-showcase/TeamShowcase.tsx

"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TeamMember } from "./components/TeamMember";
import { useTeamData } from "./hooks/useTeamData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { TeamShowcaseProps } from "./types";

const TeamShowcase: React.FC<TeamShowcaseProps> = ({
  className,
  title = "Conheça Nossa Equipe",
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const { data, isLoading, error, refetch } = useTeamData(
    fetchFromApi,
    staticData
  );

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      onDataLoaded?.(data);
    }
  }, [data, isLoading, onDataLoaded]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Estado de carregamento
  if (isLoading) {
    return (
      <section className={cn("py-12 bg-white", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <section className={cn("py-12 bg-white", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar equipe"
            icon="Users"
            className="mx-auto mb-6"
          />
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Não foi possível carregar as informações da equipe.
          </p>
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
        </div>
      </section>
    );
  }

  // Estado normal com dados
  // Se não houver membros, não renderiza a seção
  if (!isLoading && (!data || data.length === 0)) {
    return null;
  }

  return (
    <section className={cn("py-1", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header da seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">
            {title}
          </h2>
        </motion.div>

        {/* Grid de membros - ESPAÇAMENTO COMPACTO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((member, index) => (
            <TeamMember key={member.id} data={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamShowcase;
