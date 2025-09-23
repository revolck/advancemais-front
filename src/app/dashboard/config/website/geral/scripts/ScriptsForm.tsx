"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

import { SliderManager, type Slider } from "@/components/ui/custom";
import type { SliderFieldOption } from "@/components/ui/custom/slider-manager/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import { Badge } from "@/components/ui/badge";

import {
  listWebsiteScripts,
  createWebsiteScript,
  updateWebsiteScript,
  deleteWebsiteScript,
} from "@/api/websites/components/scripts";
import type {
  ScriptResponse,
  UpdateScriptPayload,
} from "@/api/scripts/types";

const ORIENTATION_OPTIONS: SliderFieldOption[] = [
  { label: "Cabeçalho (HEAD)", value: "HEADER" },
  { label: "Corpo (BODY)", value: "BODY" },
  { label: "Rodapé (FOOTER)", value: "FOOTER" },
] as const;

const ORIENTATION_LABEL: Record<string, string> = ORIENTATION_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>,
);

function normalizeStatus(status: ScriptResponse["status"]): boolean {
  if (typeof status === "string") {
    return status.toUpperCase() === "PUBLICADO";
  }
  return Boolean(status);
}

const statusToBackend = (status: boolean): "PUBLICADO" | "RASCUNHO" =>
  status ? "PUBLICADO" : "RASCUNHO";

function mapFromBackend(item: ScriptResponse, index: number): Slider {
  return {
    id: item.id,
    title: item.nome,
    image: "",
    url: item.orientacao,
    content: item.codigo,
    status: normalizeStatus(item.status),
    position: index + 1,
    createdAt: item.criadoEm ?? new Date().toISOString(),
    updatedAt: item.atualizadoEm,
    meta: {
      descricao: item.descricao ?? "",
      orientacao: item.orientacao,
    },
  };
}

export default function ScriptsForm() {
  const [loading, setLoading] = useState(true);
  const [initialScripts, setInitialScripts] = useState<Slider[]>([]);

  const orientationOptions = useMemo(
    () => ORIENTATION_OPTIONS.map((option) => ({ ...option })),
    [],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listWebsiteScripts(
          { aplicacao: "WEBSITE" },
          { headers: { Accept: "application/json" } },
        );
        const mapped = (data || []).map(mapFromBackend);
        if (mounted) setInitialScripts(mapped);
      } catch (error) {
        console.error(error);
        toastCustom.error("Não foi possível carregar os scripts do website");
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
      const created = await createWebsiteScript({
        nome: data.title,
        descricao:
          typeof data.meta?.descricao === "string"
            ? data.meta.descricao
            : undefined,
        codigo: data.content,
        aplicacao: "WEBSITE",
        orientacao: (data.url || "HEADER") as ScriptResponse["orientacao"],
        status: statusToBackend(data.status),
      });
      const mapped = mapFromBackend(created, initialScripts.length);
      setInitialScripts((prev) => [...prev, mapped]);
      return mapped;
    },
    [initialScripts.length],
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Slider>): Promise<Slider> => {
      // Toggle de status rápido
      if (
        updates.status !== undefined &&
        updates.title === undefined &&
        updates.content === undefined &&
        updates.url === undefined
      ) {
        const updated = await updateWebsiteScript(id, {
          status: statusToBackend(!!updates.status),
        });
        const index = initialScripts.findIndex((s) => s.id === id);
        const mapped = mapFromBackend(updated, index === -1 ? 0 : index);
        setInitialScripts((prev) => {
          if (index === -1) return prev;
          const next = [...prev];
          next[index] = mapped;
          return next;
        });
        return mapped;
      }

      const payload: UpdateScriptPayload = {
        nome: updates.title,
        descricao:
          typeof updates.meta?.descricao === "string"
            ? updates.meta.descricao
            : undefined,
        codigo: updates.content,
        orientacao: updates.url as ScriptResponse["orientacao"] | undefined,
        aplicacao: "WEBSITE",
        status:
          updates.status === undefined
            ? undefined
            : statusToBackend(!!updates.status),
      };

      const updated = await updateWebsiteScript(id, payload);
      const index = initialScripts.findIndex((item) => item.id === id);
      const mapped = mapFromBackend(updated, index === -1 ? 0 : index);
      setInitialScripts((prev) => {
        if (index === -1) return prev;
        const next = [...prev];
        next[index] = mapped;
        return next;
      });
      return mapped;
    },
    [initialScripts],
  );

  const handleDelete = useCallback(async (id: string) => {
    await deleteWebsiteScript(id);
    setInitialScripts((prev) => prev.filter((item) => item.id !== id));
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
      initialSliders={initialScripts}
      entityName="Script"
      entityNamePlural="Scripts"
      firstFieldLabel="Nome do script"
      secondFieldLabel="Orientação"
      validateSecondFieldAsUrl={false}
      secondFieldRequired
      secondFieldType="select"
      secondFieldOptions={orientationOptions}
      showContentField
      contentFieldLabel="Código"
      contentFieldType="textarea"
      contentFieldRequired
      fieldsOrder={["title", "url", "content"]}
      showImageField={false}
      showImageColumn={false}
      enableReorder={false}
      showUrlPreview={false}
      renderListItemDetails={(slider) => {
        const orientation =
          ORIENTATION_LABEL[String(slider.url)] || String(slider.url || "");
        const codeSnippet = (slider.content || "").trim();
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
              <span>Orientação:</span>
              <Badge variant="outline" className="uppercase tracking-wide">
                {orientation}
              </Badge>
            </div>
            {codeSnippet && (
              <pre className="max-h-32 overflow-auto rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                {codeSnippet}
              </pre>
            )}
          </div>
        );
      }}
      onCreateSlider={handleCreate}
      onUpdateSlider={handleUpdate}
      onDeleteSlider={handleDelete}
      onRefreshSliders={async () => {
        const data = await listWebsiteScripts(
          { aplicacao: "WEBSITE" },
          { headers: { Accept: "application/json" } },
        );
        const mapped = (data || []).map(mapFromBackend);
        setInitialScripts(mapped);
        return mapped;
      }}
    />
  );
}
