"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { SliderManager, type Slider } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listDepoimentos,
  createDepoimento as apiCreateDepoimento,
  updateDepoimento as apiUpdateDepoimento,
  deleteDepoimento as apiDeleteDepoimento,
  updateDepoimentoOrder as apiUpdateDepoimentoOrder,
  updateDepoimentoStatus as apiUpdateDepoimentoStatus,
} from "@/api/websites/components/depoimentos";
import type { DepoimentoBackendResponse } from "@/api/websites/components/depoimentos/types";
import { normalizeDepoimentoResponse } from "@/api/websites/components/depoimentos/normalization";

function getDepoimentoCacheKeys(
  item: DepoimentoBackendResponse,
  slider?: Pick<Slider, "id" | "orderId">,
): string[] {
  return Array.from(
    new Set(
      [item.id, item.depoimentoId, slider?.id, slider?.orderId].filter(
        (value): value is string => typeof value === "string" && !!value,
      ),
    ),
  );
}

function mapFromBackend(
  item: DepoimentoBackendResponse,
  fallbackTitle = "",
): Slider {
  const normalized = normalizeDepoimentoResponse(item);

  return {
    id: normalized.id,
    orderId: normalized.orderId,
    title: normalized.testimonial || fallbackTitle,
    image: normalized.imageUrl,
    url: normalized.name,
    content: normalized.position,
    status: normalized.published,
    position: normalized.order,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  };
}

const statusToBackend = (status: boolean): "PUBLICADO" | "RASCUNHO" =>
  status ? "PUBLICADO" : "RASCUNHO";

export default function DepoimentosForm() {
  const [loading, setLoading] = useState(true);
  const [initialItems, setInitialItems] = useState<Slider[]>([]);
  const depoimentoTextCacheRef = useRef(new Map<string, string>());

  const rememberDepoimentoText = useCallback(
    (item: DepoimentoBackendResponse, title?: string) => {
      const normalizedTitle = title?.trim();
      if (!normalizedTitle) return;

      const slider = mapFromBackend(item, normalizedTitle);
      getDepoimentoCacheKeys(item, slider).forEach((key) => {
        depoimentoTextCacheRef.current.set(key, normalizedTitle);
      });
    },
    [],
  );

  const mapFromBackendWithCache = useCallback(
    (item: DepoimentoBackendResponse): Slider => {
      const cachedTitle = getDepoimentoCacheKeys(item)
        .map((key) => depoimentoTextCacheRef.current.get(key))
        .find((value): value is string => typeof value === "string" && !!value);

      const slider = mapFromBackend(item, cachedTitle ?? "");
      if (slider.title.trim()) {
        getDepoimentoCacheKeys(item, slider).forEach((key) => {
          depoimentoTextCacheRef.current.set(key, slider.title.trim());
        });
      }

      return slider;
    },
    [],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listDepoimentos({
          headers: { Accept: "application/json" },
        });
        const mapped = (data || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackendWithCache);
        if (mounted) setInitialItems(mapped);
      } catch (error) {
        toastCustom.error("Não foi possível carregar os depoimentos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [mapFromBackendWithCache]);

  const handleCreate = useCallback(
    async (data: Omit<Slider, "id" | "createdAt">): Promise<Slider> => {
      const created = await apiCreateDepoimento({
        depoimento: data.title,
        nome: data.url,
        cargo: data.content,
        fotoUrl: data.image,
        status: statusToBackend(data.status),
        ordem: typeof data.position === "number" ? data.position : undefined,
      });
      rememberDepoimentoText(created, data.title);
      return mapFromBackend(created, data.title);
    },
    [rememberDepoimentoText],
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Slider>): Promise<Slider> => {
      if (
        updates.status !== undefined &&
        updates.title === undefined &&
        updates.image === undefined &&
        updates.url === undefined &&
        updates.content === undefined &&
        updates.position === undefined
      ) {
        const updated = await apiUpdateDepoimentoStatus(id, updates.status);
        return mapFromBackend(updated);
      }

      const updated = await apiUpdateDepoimento(id, {
        depoimento: updates.title,
        nome: updates.url,
        cargo: updates.content,
        fotoUrl: updates.image,
        status:
          updates.status === undefined
            ? undefined
            : statusToBackend(!!updates.status),
        ordem: updates.position,
      });
      rememberDepoimentoText(updated, updates.title);
      return mapFromBackend(updated, updates.title ?? "");
    },
    [rememberDepoimentoText],
  );

  const handleDelete = useCallback(async (id: string) => {
    await apiDeleteDepoimento(id);
  }, []);

  const handleReorder = useCallback(async (orderId: string, newPos: number) => {
    await apiUpdateDepoimentoOrder(orderId, newPos);
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
      initialSliders={initialItems}
      uploadPath="website/depoimentos"
      entityName="Depoimento"
      entityNamePlural="Depoimentos"
      firstFieldLabel="Depoimento"
      secondFieldLabel="Nome"
      showContentField
      contentFieldLabel="Cargo"
      contentFieldRequired
      titleAsTextarea
      fieldsOrder={["url", "content", "title"]}
      maxItems={8}
      imageFieldLabel="Foto do perfil"
      validateSecondFieldAsUrl={false}
      secondFieldRequired
      onCreateSlider={handleCreate}
      onUpdateSlider={handleUpdate}
      onDeleteSlider={handleDelete}
      onReorderSliders={handleReorder}
      onRefreshSliders={async () => {
        const data = await listDepoimentos({
          headers: { Accept: "application/json" },
        });
        return (data || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackendWithCache);
      }}
    />
  );
}
