"use client";

import { useState } from "react";
import { MaterialUploader } from "../components/MaterialUploader";
import { MaterialList } from "../components/MaterialList";

interface MateriaisTabProps {
  aulaId: string;
}

export function MateriaisTab({ aulaId }: MateriaisTabProps) {
  const [materiaisCount, setMateriaisCount] = useState(0);

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <MaterialUploader
        aulaId={aulaId}
        materiaisCount={materiaisCount}
        onSuccess={() => {
          // Lista será atualizada automaticamente via React Query
        }}
      />

      {/* Lista de materiais */}
      <MaterialList
        aulaId={aulaId}
        onMaterialCountChange={setMateriaisCount}
      />
    </div>
  );
}

