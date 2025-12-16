"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import type { Aula } from "@/api/aulas";
import { validarExclusao } from "../utils/validations";
import { useAuth } from "@/hooks/useAuth";

interface ExclusaoAlertaProps {
  aula: Aula;
}

export function ExclusaoAlerta({ aula }: ExclusaoAlertaProps) {
  const { user } = useAuth();
  const validacao = validarExclusao(aula, user?.role);

  // Se pode excluir, não mostrar alerta
  if (validacao.podeExcluir) {
    return null;
  }

  if (!validacao.motivo) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm! font-bold! mb-0! text-red-800 leading-normal!">
            Não é possível excluir esta aula
          </p>
          <p className="text-sm! text-gray-700 leading-normal! mb-0!">
            {validacao.motivo}
            {validacao.diasRestantes !== undefined && (
              <span className="block mt-1">
                A aula acontece em {validacao.diasRestantes} dia(s). É necessário
                aguardar pelo menos 5 dias antes da data da aula.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

