"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MaterialUploader } from "../components/MaterialUploader";
import { MaterialList } from "../components/MaterialList";
import { MATERIAIS_CONFIG } from "@/api/aulas/types";

interface MateriaisTabProps {
  aulaId: string;
}

export function MateriaisTab({ aulaId }: MateriaisTabProps) {
  const [materiaisCount, setMateriaisCount] = useState(0);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 space-y-1">
            <h3 className="text-sm! font-semibold text-gray-900 mb-0!">
              Materiais complementares
            </h3>
            <p className="text-xs! text-gray-500 mb-0!">
              Arquivos e links disponíveis para os alunos. Arraste para reordenar.
            </p>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 bg-gray-50 text-gray-700 border-gray-200 px-2.5 py-1 text-xs! font-medium rounded-md"
          >
            {materiaisCount}/{MATERIAIS_CONFIG.MAX_POR_AULA}
          </Badge>
        </div>

        <MaterialList
          aulaId={aulaId}
          showHeader={false}
          onMaterialCountChange={setMateriaisCount}
        />
      </section>

      <aside className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <MaterialUploader
          aulaId={aulaId}
          materiaisCount={materiaisCount}
          showHeader={false}
          onSuccess={() => {
            // Lista será atualizada automaticamente via React Query
          }}
        />
      </aside>
    </div>
  );
}
