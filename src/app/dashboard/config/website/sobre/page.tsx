"use client";

import React, { useEffect, useState } from "react";
import { VerticalTabs, type VerticalTabItem } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import SobreEmpresaForm from "./SobreEmpresaForm";
import { listSobreEmpresa, type SobreEmpresaBackendResponse } from "@/api/websites/components";

export default function SobrePage() {
  const [sobreData, setSobreData] =
    useState<SobreEmpresaBackendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sobre = await listSobreEmpresa();
        setSobreData(sobre[0] ?? null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex-1 min-h-0 flex">
          <div className="w-48 space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const items: VerticalTabItem[] = [
    {
      value: "banner",
      label: "Banner",
      icon: "Image",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Banner</h3>
        </div>
      ),
    },
    {
      value: "sobre",
      label: "Sobre",
      icon: "Info",
      content: (
        <div className="space-y-6">
          <SobreEmpresaForm initialData={sobreData ?? undefined} />
        </div>
      ),
    },
    {
      value: "equipe",
      label: "Equipe",
      icon: "Users",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Equipe</h3>
        </div>
      ),
    },
    {
      value: "escolha",
      label: "Escolha",
      icon: "CheckCircle",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Escolha</h3>
        </div>
      ),
    },
    {
      value: "transformacao",
      label: "Transformação",
      icon: "Sparkles",
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-2">Transformação</h3>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="banner"
          variant="spacious"
          size="sm"
          withAnimation={true}
          showIndicator={true}
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
