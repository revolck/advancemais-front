// src/theme/website/components/team-showcase/components/TeamMember.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { TEAM_CONFIG } from "../constants";
import type { TeamMemberProps } from "../types";

export const TeamMember: React.FC<TeamMemberProps> = ({ data, index }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.4,
        delay: (index % 4) * 0.1,
        ease: "easeOut",
      }}
    >
      <Card className="group overflow-hidden !p-0 border border-blue-200 !shadow-none transition-all duration-300 bg-[var(--primary-color)]">
        {/* Container da imagem - SEM ESPAÇOS */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <ImageNotFound
              size="full"
              variant="muted"
              aspectRatio="portrait"
              message="Foto indisponível"
              icon="User"
              className="absolute inset-0 border-0"
              showMessage={false}
            />
          )}

          {/* Main Image */}
          {!hasError && (
            <Image
              src={data.imageUrl}
              alt={data.imageAlt}
              fill
              className={`
                object-cover object-center
                group-hover:scale-105
                transition-transform duration-500
                ${isLoading ? "opacity-0" : "opacity-100"}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={index < 4}
              quality={90}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )}
        </div>

        {/* Informações do membro - ESPAÇAMENTO REDUZIDO */}
        <div className="p-1 text-center bg-[var(--primary-color)]">
          <h3 className="font-semibold text-white !text-xl !mb-0 leading-tight">
            {data.name}
          </h3>
          <p className="!text-[var(--secondary-color)] !text-sm">
            {data.position}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
