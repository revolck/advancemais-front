// src/theme/website/components/course-catalog/components/CourseCard.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { Monitor, Zap, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { COURSE_CATALOG_CONFIG } from "../constants";
import type { CourseCardProps } from "../types";

const getModalidadeConfig = (modalidade: string) => {
  const configs = {
    Online: {
      icon: Monitor,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    Live: { icon: Zap, color: "bg-red-50 text-red-700 border-red-200" },
    Presencial: {
      icon: MapPin,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };
  return configs[modalidade as keyof typeof configs] || configs.Online;
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, index }) => {
  const [isLoading, setIsLoading] = useState(!!course.imagem);
  const [hasError, setHasError] = useState(false);

  const modalidadeConfig = getModalidadeConfig(course.modalidade);
  const IconComponent = modalidadeConfig.icon;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      <Card className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl overflow-hidden transition-all duration-500 h-full flex flex-col hover:shadow-xl">
        <div className="relative overflow-hidden">
          {/* Loading State */}
          {isLoading && course.imagem && (
            <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error State ou sem imagem */}
          {(hasError || !course.imagem) && (
            <ImageNotFound
              size="full"
              variant="muted"
              aspectRatio="landscape"
              message="Imagem do curso"
              icon="BookOpen"
              className="w-full h-48 rounded-none border-0"
              showMessage={false}
            />
          )}

          {/* Main Image */}
          {course.imagem && !hasError && (
            <motion.div className="relative">
              <Image
                src={course.imagem}
                alt={course.titulo}
                width={400}
                height={240}
                className={`
                  w-full h-48 object-cover
                  transition-all duration-500
                  ${isLoading ? "opacity-0 absolute inset-0" : "opacity-100"}
                `}
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority={index < 4}
                quality={COURSE_CATALOG_CONFIG.image.quality}
                sizes={COURSE_CATALOG_CONFIG.image.sizes}
              />
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Modalidade badge */}
          <div className="absolute top-4 right-4">
            <Badge
              variant="secondary"
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${modalidadeConfig.color} flex items-center gap-1.5`}
            >
              <IconComponent className="w-3 h-3" />
              {course.modalidade}
            </Badge>
          </div>

          {/* Preço badge */}
          {course.preco && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                R$ {course.preco}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            {/* Título */}
            <motion.h3
              className="font-bold text-lg text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2"
              whileHover={{ x: 4 }}
            >
              {course.titulo}
            </motion.h3>

            {/* Descrição */}
            <p className="text-slate-600 leading-relaxed text-sm mb-6 line-clamp-4">
              {course.descricao}
            </p>
          </div>

          {/* Botão de ação */}
          <motion.div
            className="mt-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl transition-all duration-300 font-semibold text-sm">
              Inscreva-se Agora
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
