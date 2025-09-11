// src/theme/website/components/team-showcase/components/TeamMember.tsx

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import type { TeamMemberProps } from "../types";

export const TeamMember: React.FC<TeamMemberProps> = ({ data, index }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Preload imagem para poder usar como background cover
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    img.src = data.imageUrl;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [data.imageUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.08, ease: "easeOut" }}
    >
      <Card
        className="group relative overflow-hidden !p-0 rounded-2xl transition-transform duration-500 !border-none"
        style={{ borderRadius: "var(--team-radius, 1rem)" } as React.CSSProperties}
        aria-label={`${data.name} - ${data.position}`}
      >
        {/* Área visual com ratio fixo e background cover */}
        <div className="relative aspect-[3/4]">
          {/* Background image (cover) */}
          {!hasError && (
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03] ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              style={{ backgroundImage: `url(${data.imageUrl})` }}
            />
          )}

          {/* Fallback em caso de erro */}
          {hasError && (
            <ImageNotFound
              size="full"
              variant="muted"
              aspectRatio="portrait"
              message=""
              icon="User"
              className="absolute inset-0 border-0"
              showMessage={false}
            />
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Overlay gradiente sutil de base para dar contraste ao footer */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* Footer com nome e cargo centralizados (no rodapé) */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            <div className="mx-auto w-[95%] text-center rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-1 bg-white/95">
              <h3 className="text-[var(--primary-color)] font-semibold leading-snug truncate !mb-0 uppercase mt-3">
                {data.name}
              </h3>
              <p className="text-gray-600 !text-xs !sm:text-sm leading-tight truncate uppercase">
                {data.position}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
