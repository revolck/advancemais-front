"use client";

import React, { useCallback, useMemo, useState } from "react";
import { toastCustom } from "@/components/ui/custom";
import { ListManager } from "@/components/ui/custom/list-manager";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListItem } from "@/components/ui/custom/list-manager/types";
import {
  createSubareaInteresse,
  deleteSubareaInteresse,
  listAreasInteresse,
  updateSubareaInteresse,
} from "@/api/candidatos";
import type {
  CandidatoAreaInteresse,
  CandidatoSubareaInteresse,
} from "@/api/candidatos/types";
import { SubareaInteresseForm } from "./components/SubareaInteresseForm";
import { SubareaInteresseRow } from "./components/SubareaInteresseRow";

type SubareaWithParent = CandidatoSubareaInteresse & {
  areaPai?: CandidatoAreaInteresse;
};

function mapFromBackend(
  subarea: CandidatoSubareaInteresse,
  areaPai?: CandidatoAreaInteresse
): ListItem {
  return {
    id: String(subarea.id),
    title: subarea.nome,
    createdAt: subarea.criadoEm || new Date().toISOString(),
    updatedAt: subarea.atualizadoEm,
    areaPai,
    areaId: subarea.areaId,
  };
}

function mapToBackend(item: ListItem): SubareaWithParent {
  return {
    id: Number(item.id),
    areaId: Number(item.areaId ?? item.areaPai?.id),
    nome: item.title,
    vagasRelacionadas: item.vagasRelacionadas,
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt,
    areaPai: item.areaPai,
  };
}

export function SubareasInteresseForm() {
  const [initialItems, setInitialItems] = useState<ListItem[]>([]);
  const [areas, setAreas] = useState<CandidatoAreaInteresse[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);

  const loadInitialData = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      setIsLoadingAreas(true);

      const areasResponse = await listAreasInteresse();
      const areasList = Array.isArray(areasResponse) ? areasResponse : [];
      setAreas(areasList);

      const flattened: Array<{
        subarea: CandidatoSubareaInteresse;
        areaPai: CandidatoAreaInteresse;
      }> = [];

      areasList.forEach((area) => {
        (area.subareas || []).forEach((subarea) => {
          flattened.push({ subarea, areaPai: area });
        });
      });

      const mapped = flattened.map(({ subarea, areaPai }) =>
        mapFromBackend(subarea, areaPai)
      );
      setInitialItems(mapped);
    } catch (error) {
      console.error("Erro ao carregar subáreas:", error);
      toastCustom.error({
        title: "Erro ao carregar subáreas",
        description: "Não foi possível carregar as subáreas. Tente novamente.",
      });
      setAreas([]);
      setInitialItems([]);
    } finally {
      setIsLoadingAreas(false);
      setIsInitialLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const areasById = useMemo(() => {
    const map = new Map<number, CandidatoAreaInteresse>();
    areas.forEach((a) => map.set(Number(a.id), a));
    return map;
  }, [areas]);

  const handleCreate = useCallback(
    async (data: Omit<ListItem, "id" | "createdAt">): Promise<ListItem> => {
      const areaPai = data.areaPai as CandidatoAreaInteresse | undefined;
      if (!areaPai?.id) throw new Error("Área pai é obrigatória");
      if (!data.title?.trim()) throw new Error("Nome da subárea é obrigatório");

      const response = await createSubareaInteresse(areaPai.id, {
        nome: data.title,
      });

      toastCustom.success({
        title: "Subárea criada!",
        description: "A subárea foi criada com sucesso.",
      });

      await loadInitialData();

      return mapFromBackend(response as any, areaPai);
    },
    [loadInitialData]
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<ListItem>): Promise<ListItem> => {
      if (!updates.title?.trim()) throw new Error("Nome da subárea é obrigatório");

      const response = await updateSubareaInteresse(id, { nome: updates.title });

      toastCustom.success({
        title: "Subárea atualizada!",
        description: "A subárea foi atualizada com sucesso.",
      });

      await loadInitialData();

      const original = initialItems.find((i) => i.id === id);
      return mapFromBackend(
        response as any,
        (original?.areaPai as CandidatoAreaInteresse | undefined) ??
          areasById.get(Number((response as any)?.areaId))
      );
    },
    [areasById, initialItems, loadInitialData]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteSubareaInteresse(id);
      toastCustom.success({
        title: "Subárea excluída!",
        description: "A subárea foi excluída com sucesso.",
      });
      await loadInitialData();
    },
    [loadInitialData]
  );

  const renderItem = useCallback(
    (
      item: ListItem,
      onEdit: (item: ListItem) => void,
      onDelete: (id: string) => void,
      isDeleting?: boolean
    ) => {
      const subarea = mapToBackend(item);
      return (
        <SubareaInteresseRow
          key={item.id}
          subarea={subarea}
          onEdit={() => onEdit(item)}
          onDelete={(id) => onDelete(String(id))}
          isDeleting={isDeleting}
        />
      );
    },
    []
  );

  const renderCreateForm = useCallback(
    (
      onSubmit: (data: Omit<ListItem, "id" | "createdAt">) => Promise<void>,
      onCancel: () => void,
      isLoading?: boolean
    ) => (
      <SubareaInteresseForm
        areas={areas}
        isLoadingAreas={isLoadingAreas}
        onSubmit={async (formData) => {
          const areaPai = areas.find((a) => String(a.id) === formData.areaPaiId);
          if (!areaPai) throw new Error("Área selecionada não encontrada");

          await onSubmit({
            title: formData.nome,
            createdAt: new Date().toISOString(),
            areaPai,
            areaId: areaPai.id,
          });
        }}
        onCancel={onCancel}
        isSubmitting={isLoading}
      />
    ),
    [areas, isLoadingAreas]
  );

  const renderEditForm = useCallback(
    (
      item: ListItem,
      onUpdate: (id: string, data: Partial<ListItem>) => Promise<void>,
      onCancel: () => void,
      isLoading?: boolean
    ) => (
      <SubareaInteresseForm
        subarea={mapToBackend(item)}
        areas={areas}
        isLoadingAreas={isLoadingAreas}
        onSubmit={async (formData) => {
          await onUpdate(item.id, { title: formData.nome });
        }}
        onCancel={onCancel}
        isSubmitting={isLoading}
      />
    ),
    [areas, isLoadingAreas]
  );

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-11 w-48" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-56 bg-gray-200" />
                <Skeleton className="h-6 w-32 bg-gray-200" />
              </div>
              <Skeleton className="h-4 w-40 bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ListManager
        initialItems={initialItems}
        entityName="subárea de interesse"
        entityNamePlural="Subáreas de Interesse"
        maxItems={500}
        onCreateItem={handleCreate}
        onUpdateItem={handleUpdate}
        onDeleteItem={handleDelete}
        renderItem={renderItem}
        renderCreateForm={renderCreateForm}
        renderEditForm={renderEditForm}
        modalCreateTitle="Criar nova subárea de interesse"
        modalEditTitle="Editar subárea de interesse"
        emptyStateTitle="Nenhuma subárea encontrada"
        emptyStateFirstItemText="Comece criando sua primeira subárea de interesse."
        createButtonText="Nova subárea"
        tableColumns={[
          {
            key: "nome",
            label: "Subárea",
            className: "min-w-[240px] max-w-[420px]",
          },
          {
            key: "areaPai",
            label: "Área Pai",
            className: "min-w-[220px] max-w-[320px]",
          },
          {
            key: "criadoEm",
            label: "Criado em",
            className: "min-w-[140px] max-w-[180px]",
          },
        ]}
        disableAutoToasts={true}
        enablePagination={true}
        itemsPerPage={10}
      />
    </div>
  );
}

