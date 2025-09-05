"use client";

import { useEffect, useState, useCallback } from "react";
import { SliderManager, type Slider } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listLogoEnterprises,
  createLogoEnterprise as apiCreateLogo,
  updateLogoEnterprise as apiUpdateLogo,
  deleteLogoEnterprise as apiDeleteLogo,
  updateLogoEnterpriseOrder as apiUpdateLogoOrder,
} from "@/api/websites/components/logo-enterprises";
import type { LogoEnterpriseBackendResponse } from "@/api/websites/components/logo-enterprises/types";

function mapFromBackend(item: LogoEnterpriseBackendResponse): Slider {
  return {
    id: item.logoId,
    orderId: item.id,
    title: item.nome,
    image: item.imagemUrl,
    url: item.website || "",
    content: "",
    status:
      (typeof item.status === "string" ? item.status : item.status
        ? "PUBLICADO"
        : "RASCUNHO") === "PUBLICADO",
    position: item.ordem,
    createdAt: item.criadoEm ?? item.ordemCriadoEm ?? new Date().toISOString(),
    updatedAt: item.atualizadoEm,
  };
}

const statusToBackend = (status: boolean): "PUBLICADO" | "RASCUNHO" =>
  status ? "PUBLICADO" : "RASCUNHO";

export default function LogosForm() {
  const [loading, setLoading] = useState(true);
  const [initialLogos, setInitialLogos] = useState<Slider[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listLogoEnterprises({ headers: { Accept: "application/json" } });
        const mapped = (data || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
        if (mounted) setInitialLogos(mapped);
      } catch {
        toastCustom.error("Não foi possível carregar as logos");
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
      const created = await apiCreateLogo({
        nome: data.title,
        imagemUrl: data.image,
        website: data.url,
        status: statusToBackend(data.status),
        ordem: typeof data.position === "number" ? data.position : undefined,
      });
      return mapFromBackend(created);
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Slider>): Promise<Slider> => {
      const updated = await apiUpdateLogo(id, {
        nome: updates.title,
        imagemUrl: updates.image,
        website: updates.url,
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
    await apiDeleteLogo(id);
  }, []);

  const handleReorder = useCallback(async (orderId: string, newPos: number) => {
    await apiUpdateLogoOrder(orderId, newPos);
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
      initialSliders={initialLogos}
      uploadPath="website/logo-enterprises"
      entityName="Logo"
      entityNamePlural="Logos"
      firstFieldLabel="Nome da empresa"
      secondFieldLabel="URL"
      validateSecondFieldAsUrl
      secondFieldRequired={false}
      onCreateSlider={handleCreate}
      onUpdateSlider={handleUpdate}
      onDeleteSlider={handleDelete}
      onReorderSliders={handleReorder}
      onRefreshSliders={async () => {
        const data = await listLogoEnterprises({ headers: { Accept: "application/json" } });
        return (data || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map(mapFromBackend);
      }}
    />
  );
}
