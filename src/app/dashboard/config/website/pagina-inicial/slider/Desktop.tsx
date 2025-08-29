"use client";

import { useEffect, useState, useCallback } from "react";
import { SliderManager, type Slider } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listSliders,
  createSlider as apiCreateSlider,
  updateSlider as apiUpdateSlider,
  deleteSlider as apiDeleteSlider,
  updateSliderOrder as apiUpdateSliderOrder,
} from "@/api/websites/components";
import type { SlideBackendResponse } from "@/api/websites/components";

function mapFromBackend(item: SlideBackendResponse): Slider {
  return {
    id: item.id,
    title: item.sliderName,
    image: item.imagemUrl,
    url: item.link || "",
    content: "",
    status: item.status === "PUBLICADO",
    position: item.ordem,
    createdAt: item.criadoEm,
    updatedAt: item.atualizadoEm,
  };
}

const statusToBackend = (status: boolean): "PUBLICADO" | "RASCUNHO" =>
  status ? "PUBLICADO" : "RASCUNHO";

export default function DesktopSliderManager() {
  const [loading, setLoading] = useState(true);
  const [initialSliders, setInitialSliders] = useState<Slider[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listSliders({ headers: { Accept: "application/json" } });
        const desktop = (data || []).filter((d) => d.orientacao === "DESKTOP");
        const mapped = desktop
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
        if (mounted) setInitialSliders(mapped);
      } catch (error) {
        toastCustom.error("Não foi possível carregar os sliders (DESKTOP)");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreate = useCallback(
    async (data: Omit<Slider, "id" | "createdAt">): Promise<Slider> => {
      const created = await apiCreateSlider({
        sliderName: data.title,
        imagemUrl: data.image,
        link: data.url,
        orientacao: "DESKTOP",
        status: statusToBackend(data.status),
        ordem: typeof data.position === "number" ? data.position : undefined,
      });
      return mapFromBackend(created);
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Slider>): Promise<Slider> => {
      const updated = await apiUpdateSlider(id, {
        sliderName: updates.title,
        imagemUrl: updates.image,
        link: updates.url,
        status:
          updates.status === undefined ? undefined : statusToBackend(!!updates.status),
        ordem: updates.position,
        orientacao: "DESKTOP",
      });
      return mapFromBackend(updated);
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    await apiDeleteSlider(id);
  }, []);

  const handleReorder = useCallback(async (id: string, newPos: number) => {
    await apiUpdateSliderOrder(id, newPos, "DESKTOP");
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <SliderManager
      initialSliders={initialSliders}
      onCreateSlider={handleCreate}
      onUpdateSlider={handleUpdate}
      onDeleteSlider={handleDelete}
      onReorderSliders={handleReorder}
      onRefreshSliders={async () => {
        const data = await listSliders({ headers: { Accept: "application/json" } });
        return (data || [])
          .filter((d) => d.orientacao === "DESKTOP")
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
      }}
    />
  );
}
