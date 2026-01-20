"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import { ListManager } from "@/components/ui/custom/list-manager";
import type { ListItem } from "@/components/ui/custom/list-manager/types";
import {
  createAreaInteresse,
  deleteAreaInteresse,
  listAreasInteresse,
  updateAreaInteresse,
} from "@/api/candidatos";
import type { CandidatoAreaInteresse } from "@/api/candidatos/types";
import { AreaInteresseForm } from "./components/AreaInteresseForm";
import { AreaInteresseRow } from "./components/AreaInteresseRow";

function mapFromBackend(item: CandidatoAreaInteresse): ListItem {
  return {
    id: String(item.id),
    title: item.categoria,
    createdAt: item.criadoEm || new Date().toISOString(),
    updatedAt: item.atualizadoEm,
    subareas: item.subareas || [],
  };
}

function mapToBackend(item: ListItem): CandidatoAreaInteresse {
  return {
    id: Number(item.id),
    categoria: item.title,
    subareas: item.subareas || [],
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt,
  };
}

export function AreasInteresseForm() {
  const [initialItems, setInitialItems] = useState<ListItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        const data = await listAreasInteresse();
        const mapped = Array.isArray(data) ? data.map(mapFromBackend) : [];
        if (mounted) setInitialItems(mapped);
      } catch (error) {
        console.error("Erro ao carregar áreas de interesse:", error);
        toastCustom.error(
          "Não foi possível carregar as áreas de interesse dos candidatos"
        );
      } finally {
        if (mounted) setIsInitialLoading(false);
      }
    };

    loadInitialData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreate = useCallback(
    async (data: Omit<ListItem, "id" | "createdAt">): Promise<ListItem> => {
      if (!data.title?.trim()) {
        throw new Error("Nome da área é obrigatório");
      }

      const response = await createAreaInteresse({ categoria: data.title });
      const newItem = mapFromBackend(response as any);
      toastCustom.success(`Área "${data.title}" criada com sucesso`);
      return newItem;
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<ListItem>): Promise<ListItem> => {
      if (!updates.title?.trim()) {
        throw new Error("Nome da área é obrigatório");
      }

      const response = await updateAreaInteresse(id, { categoria: updates.title });
      const updatedItem = mapFromBackend(response as any);
      toastCustom.success(`Área "${updates.title}" atualizada com sucesso`);
      return updatedItem;
    },
    []
  );

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    await deleteAreaInteresse(id);
    toastCustom.success("Área excluída com sucesso");
  }, []);

  const renderItem = useCallback(
    (
      item: ListItem,
      onEdit: (item: ListItem) => void,
      onDelete: (id: string) => void,
      isDeleting?: boolean
    ) => {
      const area = mapToBackend(item);
      return (
        <AreaInteresseRow
          key={item.id}
          area={area}
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
      <AreaInteresseForm
        onSubmit={async (formData) => {
          const listItemData: Omit<ListItem, "id" | "createdAt"> = {
            title: formData.categoria,
            createdAt: new Date().toISOString(),
          };
          await onSubmit(listItemData);
        }}
        onCancel={onCancel}
        isSubmitting={isLoading}
      />
    ),
    []
  );

  const renderEditForm = useCallback(
    (
      item: ListItem,
      onUpdate: (id: string, data: Partial<ListItem>) => Promise<void>,
      onCancel: () => void,
      isLoading?: boolean
    ) => (
      <AreaInteresseForm
        area={mapToBackend(item)}
        onSubmit={async (formData) => {
          const listItemData: Partial<ListItem> = { title: formData.categoria };
          await onUpdate(item.id, listItemData);
        }}
        onCancel={onCancel}
        isSubmitting={isLoading}
      />
    ),
    []
  );

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded bg-gray-200" />
                <Skeleton className="h-6 w-48 bg-gray-200" />
                <Skeleton className="h-6 w-16 bg-gray-200" />
              </div>
              <Skeleton className="h-4 w-2/3 bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ListManager
      initialItems={initialItems}
      entityName="área de interesse"
      entityNamePlural="Áreas de Interesse"
      maxItems={100}
      onCreateItem={handleCreate}
      onUpdateItem={handleUpdate}
      onDeleteItem={handleDelete}
      renderItem={renderItem}
      renderCreateForm={renderCreateForm}
      renderEditForm={renderEditForm}
      modalCreateTitle="Criar nova área de interesse"
      modalEditTitle="Editar área de interesse"
      emptyStateTitle="Nenhuma área de interesse encontrada"
      emptyStateFirstItemText="Comece criando a primeira área de interesse."
      createButtonText="Nova área"
      tableColumns={[
        {
          key: "categoria",
          label: "Área",
          className: "min-w-[260px] max-w-[420px]",
        },
        {
          key: "subareas",
          label: "Subáreas",
          className: "min-w-[120px] max-w-[140px]",
          tooltip: "Quantidade de subáreas",
        },
        {
          key: "criadoEm",
          label: "Criado em",
          className: "min-w-[140px] max-w-[180px]",
        },
      ]}
      enablePagination
      itemsPerPage={8}
    />
  );
}

