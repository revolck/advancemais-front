"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardDateTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Atualiza a cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formata a data em português (dia, mês e ano)
  const formattedDate = currentTime.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Formata a hora (sem segundos para ser mais limpa)
  const formattedTime = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Capitaliza a primeira letra
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="flex items-center gap-3">
      {/* Data */}
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {capitalizedDate}
        </span>
      </div>

      {/* Separador */}
      <div className="h-5 w-px bg-gray-300" />

      {/* Hora */}
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 tabular-nums">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
