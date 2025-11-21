"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Award, ArrowRight } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { CourseCardProps } from "../types";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Mapeamento de cores para categorias (tons pastéis refinados)
const getCategoryColor = (categoria: string) => {
  const categoryMap: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    "Máquinas Pesadas": {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200",
    },
    Modulares: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    "Gestão e Negócios": {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
    },
    "Banco de Dados": {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
    },
    "Desenvolvimento Web": {
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-200",
    },
    Programação: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200",
    },
    Design: {
      bg: "bg-pink-50",
      text: "text-pink-600",
      border: "border-pink-200",
    },
    Marketing: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
    },
    "TI e Infraestrutura": {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
    },
    Segurança: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-200",
    },
  };

  // Retorna a cor da categoria ou uma cor padrão baseada no hash do nome
  const defaultColor = getDefaultColor(categoria);
  return categoryMap[categoria] || defaultColor;
};

// Função para gerar cor padrão baseada no nome da categoria (tons pastéis refinados)
const getDefaultColor = (
  categoria: string
): { bg: string; text: string; border: string } => {
  const colors = [
    { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
    {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
    },
    { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
    {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200",
    },
    { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
    {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200",
    },
    {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
    },
  ];

  // Gera um índice baseado no hash do nome
  let hash = 0;
  for (let i = 0; i < categoria.length; i++) {
    hash = categoria.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export function CourseCard({ course, index, onViewDetails }: CourseCardProps) {
  const categoryColor = getCategoryColor(course.categoria);
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "group border border-gray-200 bg-white rounded-2xl transition-all duration-200 overflow-hidden",
        "hover:border-[var(--primary-color)]/30"
      )}
    >
      {/* Imagem do curso */}
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {course.imagemUrl ? (
          <Image
            src={course.imagemUrl}
            alt={course.nome}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-[var(--primary-color)]/40" />
            </div>
          </div>
        )}

        {/* Badge de categoria no topo */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
              "border transition-all duration-200",
              categoryColor.bg,
              categoryColor.text,
              categoryColor.border
            )}
          >
            {course.categoria}
          </span>
        </div>

        {/* Badge de estágio obrigatório */}
        {course.estagioObrigatorio && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-600 transition-all duration-200">
              <Award className="size-3" />
              Estágio
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Título e Descrição */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900 line-clamp-2 leading-tight transition-colors duration-200">
            {course.nome}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {course.descricao ||
              "Explore este curso e desenvolva novas habilidades profissionais."}
          </p>
        </div>

        {/* Informações - Minimalista */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--primary-color)]/10">
              <Clock className="size-4 text-[var(--primary-color)]" />
            </div>
            <span className="font-semibold">{course.cargaHoraria}h</span>
            <span className="text-gray-400">de conteúdo</span>
          </div>
        </div>

        {/* Ações - Minimalista */}
        <div className="flex gap-3 pt-2">
          <ButtonCustom
            variant="outline"
            className="flex-1 group/btn-details border-gray-200 hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-white transition-all"
            onClick={() => onViewDetails?.(course)}
          >
            Detalhes
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            className="flex-1 group/btn"
            onClick={() => console.log("Inscrever-se:", course.id)}
          >
            Inscrever-se
            <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5" />
          </ButtonCustom>
        </div>
      </div>
    </motion.article>
  );
}
