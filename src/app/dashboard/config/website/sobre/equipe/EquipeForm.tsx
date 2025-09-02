"use client";

import { useEffect, useState, useCallback } from "react";
import { SliderManager, type Slider } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listTeam,
  createTeam as apiCreateTeam,
  updateTeam as apiUpdateTeam,
  deleteTeam as apiDeleteTeam,
  updateTeamOrder as apiUpdateTeamOrder,
  type TeamBackendResponse,
} from "@/api/websites/components";

function mapFromBackend(item: TeamBackendResponse): Slider {
  return {
    id: item.id,
    orderId: item.id,
    title: item.nome,
    image: item.photoUrl,
    url: item.cargo,
    content: "",
    status: true,
    position: typeof item.ordem === "number" ? item.ordem : 0,
    createdAt: item.criadoEm || new Date().toISOString(),
    updatedAt: item.atualizadoEm,
  };
}

export default function EquipeForm() {
  const [loading, setLoading] = useState(true);
  const [initialItems, setInitialItems] = useState<Slider[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listTeam({ headers: { Accept: "application/json" } });
        const mapped = (data || [])
          .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
          .map(mapFromBackend);
        if (mounted) setInitialItems(mapped);
      } catch (error) {
        toastCustom.error("Não foi possível carregar a equipe");
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
      const created = await apiCreateTeam({
        nome: data.title,
        cargo: data.url,
        photoUrl: data.image,
        ordem: typeof data.position === "number" ? data.position : undefined,
      });
      return mapFromBackend(created);
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Slider>): Promise<Slider> => {
      const updated = await apiUpdateTeam(id, {
        nome: updates.title,
        cargo: updates.url,
        photoUrl: updates.image,
        ordem: updates.position,
      });
      return mapFromBackend(updated);
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    await apiDeleteTeam(id);
  }, []);

  const handleReorder = useCallback(async (id: string, newPos: number) => {
    await apiUpdateTeamOrder(id, newPos);
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
      uploadPath="website/team"
      entityName="Membro"
      entityNamePlural="Equipe"
      firstFieldLabel="Nome"
      secondFieldRequired={true}
      maxItems={12}
      onCreateSlider={handleCreate}
      onUpdateSlider={handleUpdate}
      onDeleteSlider={handleDelete}
      onReorderSliders={handleReorder}
      secondFieldLabel="Cargo"
      validateSecondFieldAsUrl={false}
    />
  );
}

