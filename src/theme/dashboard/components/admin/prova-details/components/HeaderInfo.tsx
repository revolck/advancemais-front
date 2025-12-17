"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/custom";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import type { TurmaProva } from "@/api/cursos";
import { cn } from "@/lib/utils";

interface HeaderInfoProps {
  prova: TurmaProva;
  cursoId: number | string;
  turmaId: string;
}

export function HeaderInfo({ prova, cursoId, turmaId }: HeaderInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/cursos/${cursoId}/turmas/${turmaId}`}>
              <ButtonCustom variant="ghost" size="sm" icon="ArrowLeft">
                Voltar
              </ButtonCustom>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">
              {prova.titulo || prova.nome || "Prova sem título"}
            </h1>
          </div>

          {prova.descricao && (
            <p className="text-sm text-gray-600">{prova.descricao}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {prova.tipo && (
              <Badge variant="outline">{prova.tipo}</Badge>
            )}
            {prova.valePonto !== undefined && (
              <Badge
                variant="outline"
                className={cn(
                  prova.valePonto
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-600"
                )}
              >
                {prova.valePonto ? "Conta para média" : "Não conta para média"}
              </Badge>
            )}
            {prova.ativo !== undefined && (
              <Badge
                variant="outline"
                className={cn(
                  prova.ativo
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-gray-50 text-gray-600"
                )}
              >
                {prova.ativo ? "Ativa" : "Inativa"}
              </Badge>
            )}
          </div>
        </div>

        <Link
          href={`/dashboard/cursos/${cursoId}/turmas/${turmaId}/provas/${prova.id}/editar`}
        >
          <ButtonCustom variant="outline" size="sm" icon="Edit">
            Editar Prova
          </ButtonCustom>
        </Link>
      </div>
    </div>
  );
}

