"use client";

import React, { useEffect, useState } from "react";
import { VerticalTabs, type VerticalTabItem } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import SobreForm from "./sobre/SobreForm";
import { listAbout, type AboutBackendResponse } from "@/api/websites/components";

/**
 * Página principal de configuração da página inicial
 * Usa VerticalTabs para organizar as diferentes seções
 */
export default function PaginaInicialPage() {
  const [aboutData, setAboutData] = useState<AboutBackendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listAbout();
        setAboutData(data[0] ?? null);
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
      value: "slider",
      label: "Slider",
      icon: "Images",
      submenu: [
        {
          value: "slider-desktop",
          label: "Desktop",
          icon: "Monitor",
          content: (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-0">Sliders Desktop</h3>
              </div>
            </div>
          ),
        },
        {
          value: "slider-mobile",
          label: "Tablet/Mobile",
          icon: "Smartphone",
          content: (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Sliders Mobile/Tablet
                </h3>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      value: "sobre",
      label: "Sobre",
      icon: "Info",
      content: (
        <div className="space-y-6">
          <SobreForm initialData={aboutData ?? undefined} />
        </div>
      ),
    },
    {
      value: "banners",
      label: "Banners",
      icon: "Image",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Banners Promocionais</h3>
            <p className="text-muted-foreground mb-4">
              Gerencie os banners promocionais que aparecem na página inicial.
            </p>
          </div>
        </div>
      ),
    },
    {
      value: "consultoria",
      label: "Consultoria",
      icon: "Briefcase",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Seção de Consultoria</h3>
            <p className="text-muted-foreground mb-4">
              Configure conteúdos, serviços e destaques da sua área de
              consultoria.
            </p>
          </div>
        </div>
      ),
    },
    {
      value: "recrutamento-selecao",
      label: "Recrutamento & Seleção",
      icon: "Users",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Recrutamento & Seleção
            </h3>
            <p className="text-muted-foreground mb-4">
              Defina textos, vitrines de vagas, depoimentos e CTAs desta seção.
            </p>
            {/* TODO: Substitua por <RecrutamentoSelecaoForm /> quando existir */}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Conteúdo principal com VerticalTabs */}
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="slider-desktop"
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
