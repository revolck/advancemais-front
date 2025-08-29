"use client";

import { useEffect, useState, useCallback } from "react";
import { SliderManager, type Slider } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/api/client";
import routes from "@/api/routes";
import { toastCustom } from "@/components/ui/custom/toast";

type BackendSlider = {
  id: string;
  sliderName: string;
  imagemUrl: string;
  link: string;
  orientacao: string;
  status: string;
  ordem: number;
  ordemId?: string;
  ordemCriadoEm?: string;
  criadoEm: string;
  atualizadoEm?: string;
};

function mapFromBackend(item: BackendSlider): Slider {
  return {
    id: item.id,
    title: item.sliderName,
    image: item.imagemUrl,
    url: item.link,
    content: "",
    status: item.status === "PUBLICADO",
    position: item.ordem,
    createdAt: item.criadoEm,
    updatedAt: item.atualizadoEm,
  };
}

function statusToBackend(status: boolean): string {
  return status ? "PUBLICADO" : "INATIVO";
}

export default function DesktopSliderManager() {
  const [loading, setLoading] = useState(true);
  const [initialSliders, setInitialSliders] = useState<Slider[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch<BackendSlider[]>(routes.website.slider.list(), {
          init: { headers: { Accept: "application/json" } },
        });
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
      const form = new FormData();
      form.append("sliderName", data.title);
      if (data.image) form.append("imagemUrl", data.image);
      if (data.url) form.append("link", data.url);
      form.append("orientacao", "DESKTOP");
      form.append("status", statusToBackend(data.status));
      if (typeof data.position === "number") {
        form.append("ordem", String(data.position));
      }

      const created = await apiFetch<BackendSlider>(routes.website.slider.create(), {
        init: { method: "POST", body: form },
      });
      return mapFromBackend(created);
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Slider>): Promise<Slider> => {
      const form = new FormData();
      if (updates.title !== undefined) form.append("sliderName", updates.title);
      if (updates.image !== undefined) form.append("imagemUrl", updates.image);
      if (updates.url !== undefined) form.append("link", updates.url);
      if (updates.status !== undefined)
        form.append("status", statusToBackend(!!updates.status));
      if (updates.position !== undefined)
        form.append("ordem", String(updates.position));
      form.append("orientacao", "DESKTOP");

      const updated = await apiFetch<BackendSlider>(routes.website.slider.update(id), {
        init: { method: "PUT", body: form },
      });
      return mapFromBackend(updated);
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    await apiFetch<void>(routes.website.slider.delete(id), {
      init: { method: "DELETE" },
    });
  }, []);

  const handleReorder = useCallback(async (id: string, newPos: number) => {
    const form = new FormData();
    form.append("ordem", String(newPos));
    form.append("orientacao", "DESKTOP");
    await apiFetch<BackendSlider>(routes.website.slider.update(id), {
      init: { method: "PUT", body: form },
    });
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
        const data = await apiFetch<BackendSlider[]>(routes.website.slider.list(), {
          init: { headers: { Accept: "application/json" } },
        });
        return (data || [])
          .filter((d) => d.orientacao === "DESKTOP")
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
      }}
    />
  );
}
