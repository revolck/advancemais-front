"use client";

import React from "react";
import { VerticalTabs, type VerticalTabItem } from "@/components/ui/custom";
import { CategoriasForm } from "./categorias/CategoriasForm";
import { SubcategoriasForm } from "./subcategorias/SubcategoriasForm";

export default function CursosDashboardPage() {
  const items: VerticalTabItem[] = [
    {
      value: "categorias",
      label: "Categorias",
      icon: "BookOpen",
      content: <CategoriasForm />,
    },
    {
      value: "subcategorias",
      label: "Subcategorias",
      icon: "Tags",
      content: <SubcategoriasForm />,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="categorias"
          variant="spacious"
          size="sm"
          withAnimation
          showIndicator
          tabsWidth="md"
          classNames={{
            root: "h-full",
            contentWrapper: "h-full overflow-hidden",
            tabsContent: "h-full overflow-auto p-6",
            tabsList: "p-2",
            tabsTrigger: "mb-1",
          }}
        />
      </div>
    </div>
  );
}
