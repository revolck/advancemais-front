// src/theme/website/components/course-catalog/components/CourseFilters.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Monitor, Zap, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { CourseFiltersProps } from "../types";

const getModalidadeIcon = (nome: string) => {
  const icons = {
    Online: Monitor,
    Live: Zap,
    Presencial: MapPin,
  };
  return icons[nome as keyof typeof icons] || Monitor;
};

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  categories,
  modalidades,
  categoriasSelecionadas,
  modalidadesSelecionadas,
  onToggleCategoria,
  onToggleModalidade,
  onLimparFiltros,
  temFiltrosAtivos,
}) => {
  return (
    <Card className="bg-white border-0 rounded-3xl overflow-hidden shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
          Filtros
          {/* Contador de filtros ativos */}
          {temFiltrosAtivos && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 text-xs"
            >
              {categoriasSelecionadas.length + modalidadesSelecionadas.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Categorias */}
        <div>
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4">
            Categorias
          </h3>

          <div className="space-y-3">
            {categories.map((categoria) => (
              <motion.div
                key={categoria.nome}
                className="flex items-center justify-between group"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  {/* CHECKBOX QUADRADO MELHORADO */}
                  <Checkbox
                    id={`categoria-${categoria.nome}`}
                    checked={categoriasSelecionadas.includes(categoria.nome)}
                    onCheckedChange={() => onToggleCategoria(categoria.nome)}
                    className="w-4 h-4 rounded-sm border-2 border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                  />
                  <label
                    htmlFor={`categoria-${categoria.nome}`}
                    className="text-slate-700 cursor-pointer group-hover:text-slate-900 transition-colors font-medium text-sm select-none"
                  >
                    {categoria.nome}
                  </label>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs font-medium bg-slate-50 text-slate-600"
                >
                  {categoria.count}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Modalidades */}
        <div>
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4">
            Modalidade
          </h3>

          <div className="space-y-3">
            {modalidades.map((modalidade) => {
              const IconComponent = getModalidadeIcon(modalidade.nome);
              return (
                <motion.div
                  key={modalidade.nome}
                  className="flex items-center space-x-3 group"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* CHECKBOX QUADRADO MELHORADO */}
                  <Checkbox
                    id={`modalidade-${modalidade.nome}`}
                    checked={modalidadesSelecionadas.includes(modalidade.nome)}
                    onCheckedChange={() => onToggleModalidade(modalidade.nome)}
                    className="w-4 h-4 rounded-sm border-2 border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                  />
                  <label
                    htmlFor={`modalidade-${modalidade.nome}`}
                    className="text-slate-700 cursor-pointer group-hover:text-slate-900 transition-colors font-medium flex items-center gap-2 text-sm select-none"
                  >
                    <IconComponent className="w-4 h-4" />
                    {modalidade.nome}
                  </label>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* APENAS UM BOTÃO LIMPAR FILTROS - VERMELHO */}
        {temFiltrosAtivos && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-slate-200"
          >
            <Button
              onClick={onLimparFiltros}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar todos os filtros
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
