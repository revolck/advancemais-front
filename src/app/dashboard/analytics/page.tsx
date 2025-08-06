"use client";

import React from "react";
import { Calendar } from "lucide-react";

/** Retorna a data no formato "DD de mês de AAAA" em pt-BR */
function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function AnalyticsPage() {
  const name = "Usuário";
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Olá, {name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Acompanhe o progresso da equipe. Você está quase alcançando a meta!
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="mt-1 flex items-center gap-2">
          <span className="text-gray text-base font-medium">
            {formatDate()}
          </span>
          <div className="bg__gray-dark rounded-full p-3 flex items-center justify-center">
            <Calendar className="h-4 w-4 tx__black" />
          </div>
        </div>
      </div>
    </div>
  );
}
