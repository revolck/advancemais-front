"use client";

import { useEffect, useState, useCallback } from "react";
import { SliderManager, type Slider } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listBanners,
  createBanner as apiCreateBanner,
  updateBanner as apiUpdateBanner,
  deleteBanner as apiDeleteBanner,
  updateBannerOrder as apiUpdateBannerOrder,
  updateBannerStatus as apiUpdateBannerStatus,
} from "@/api/websites/components/banner";
import type { BannerBackendResponse } from "@/api/websites/components/banner/types";

function mapFromBackend(item: BannerBackendResponse): Slider {
  return {
    id: item.bannerId,
    orderId: item.id,
    title: item.imagemTitulo || "",
    image: item.imagemUrl,
    url: item.link || "",
    content: "",
    status: (typeof item.status === "string" ? item.status : item.status ? "PUBLICADO" : "RASCUNHO") === "PUBLICADO",
    position: item.ordem,
    createdAt: item.criadoEm ?? item.ordemCriadoEm ?? new Date().toISOString(),
    updatedAt: item.atualizadoEm,
  };
}

const statusToBackend = (status: boolean): "PUBLICADO" | "RASCUNHO" =>
  status ? "PUBLICADO" : "RASCUNHO";

export default function BannersForm() {
  const [loading, setLoading] = useState(true);
  const [initialBanners, setInitialBanners] = useState<Slider[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listBanners({ headers: { Accept: "application/json" } });
        const mapped = (data || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
        if (mounted) setInitialBanners(mapped);
      } catch (error) {
        toastCustom.error("Não foi possível carregar os banners");
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
      const created = await apiCreateBanner({
        imagemTitulo: data.title,
        imagemUrl: data.image,
        link: data.url,
        status: statusToBackend(data.status),
        ordem: typeof data.position === "number" ? data.position : undefined,
      });
      return mapFromBackend(created);
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Slider>): Promise<Slider> => {
      // Otimização: toggle de status isolado
      if (
        updates.status !== undefined &&
        updates.title === undefined &&
        updates.image === undefined &&
        updates.url === undefined &&
        updates.position === undefined
      ) {
        const updated = await apiUpdateBannerStatus(id, updates.status);
        return mapFromBackend(updated);
      }

      const updated = await apiUpdateBanner(id, {
        imagemTitulo: updates.title,
        imagemUrl: updates.image,
        link: updates.url,
        status:
          updates.status === undefined
            ? undefined
            : statusToBackend(!!updates.status),
        ordem: updates.position,
      });
      return mapFromBackend(updated);
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    await apiDeleteBanner(id);
  }, []);

  const handleReorder = useCallback(async (idOrOrderId: string, newPos: number) => {
    // Endpoint de reorder usa ID da ordem
    await apiUpdateBannerOrder(idOrOrderId, newPos);
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
      initialSliders={initialBanners}
      uploadPath="website/banner"
      entityName="Banner"
      entityNamePlural="Banners"
      maxItems={5}
      onCreateSlider={handleCreate}
      onUpdateSlider={handleUpdate}
      onDeleteSlider={handleDelete}
      onReorderSliders={handleReorder}
      onRefreshSliders={async () => {
        const data = await listBanners({ headers: { Accept: "application/json" } });
        return (data || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
      }}
    />
  );
}
