"use client";

import { useEffect, useState, useCallback } from "react";
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

function mapFromBackend(item: DepoimentoBackendResponse): Slider {
  return {
    id: item.depoimentoId,
    orderId: item.id,
    title: item.depoimento,
    image: item.fotoUrl || "",
    url: item.nome || "",
    content: item.cargo || "",
    status:
      (typeof item.status === "string"
        ? item.status
        : item.status
        ? "PUBLICADO"
        : "RASCUNHO") === "PUBLICADO",
    position: item.ordem,
    createdAt: item.criadoEm ?? item.ordemCriadoEm ?? new Date().toISOString(),
    updatedAt: item.atualizadoEm,
  };
}

const statusToBackend = (status: boolean): "PUBLICADO" | "RASCUNHO" =>
  status ? "PUBLICADO" : "RASCUNHO";

export default function DepoimentosForm() {
  const [loading, setLoading] = useState(true);
  const [initialItems, setInitialItems] = useState<Slider[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listDepoimentos({ headers: { Accept: "application/json" } });
        const mapped = (data || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
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
  }, []);

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
      return mapFromBackend(created);
    },
    []
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
      return mapFromBackend(updated);
    },
    []
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
      validateSecondFieldAsUrl={false}
      secondFieldRequired
      onCreateSlider={handleCreate}
      onUpdateSlider={handleUpdate}
      onDeleteSlider={handleDelete}
      onReorderSliders={handleReorder}
      onRefreshSliders={async () => {
        const data = await listDepoimentos({ headers: { Accept: "application/json" } });
        return (data || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
      }}
    />
  );
}
