// src/theme/website/components/course-catalog/components/EmptyState.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  searchTerm?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasFilters,
  onClearFilters,
  searchTerm,
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Ícone */}
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        {hasFilters ? (
          <Filter className="w-10 h-10 text-gray-400" />
        ) : (
          <Search className="w-10 h-10 text-gray-400" />
        )}
      </motion.div>

      {/* Título */}
      <motion.h3
        className="text-2xl font-bold text-gray-900 mb-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {hasFilters
          ? "Nenhum curso encontrado"
          : "Nenhum resultado para sua busca"}
      </motion.h3>

      {/* Descrição */}
      <motion.div
        className="text-center max-w-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {hasFilters ? (
          <div className="space-y-2">
            <p className="text-gray-600">
              Não encontramos cursos que correspondam aos filtros selecionados.
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-500">
                Busca por: "<span className="font-medium">{searchTerm}</span>"
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">
            Tente ajustar sua pesquisa ou explorar nossas categorias
            disponíveis.
          </p>
        )}
      </motion.div>

      {/* Ações */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {hasFilters && (
          <Button
            onClick={onClearFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            Limpar filtros
          </Button>
        )}

        <Button
          variant="outline"
          className="px-6 py-3 rounded-xl font-medium border-gray-300 hover:bg-gray-50"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Ver todos os cursos
        </Button>
      </motion.div>

      {/* Sugestões */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm text-gray-500 mb-3">Sugestões para sua busca:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Marketing", "Gestão", "Tecnologia", "Finanças"].map((sugestao) => (
            <span
              key={sugestao}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 cursor-pointer transition-colors"
            >
              {sugestao}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
