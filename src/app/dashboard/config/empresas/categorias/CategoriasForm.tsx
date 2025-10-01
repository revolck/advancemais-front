"use client";

import { useEffect, useState, useCallback } from "react";
import { ListManager } from "@/components/ui/custom/list-manager/ListManager";
import type { ListItem } from "@/components/ui/custom/list-manager/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listEmpresaVagaCategorias,
  createEmpresaVagaCategoria,
  updateEmpresaVagaCategoria,
  deleteEmpresaVagaCategoria,
} from "@/api/empresas";
import type { EmpresaVagaCategoria } from "@/api/empresas";
import { CategoriaRow } from "./components/CategoriaRow";
import { CategoriaForm } from "./components/CategoriaForm";

function mapFromBackend(item: EmpresaVagaCategoria): ListItem {
  return {
    id: item.id,
    title: item.nome,
    description: item.descricao,
    status: true,
    createdAt: item.criadoEm,
    updatedAt: item.atualizadoEm,
    codCategoria: item.codCategoria,
    subcategorias: item.subcategorias || [],
  };
}

function mapToBackend(item: ListItem): EmpresaVagaCategoria {
  return {
    id: item.id,
    codCategoria: item.codCategoria || "",
    nome: item.title,
    descricao: item.description || "",
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt || item.createdAt,
    subcategorias: item.subcategorias || [],
  };
}

export function CategoriasForm() {
  const [initialCategorias, setInitialCategorias] = useState<ListItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        const data = await listEmpresaVagaCategorias();
        const mapped = Array.isArray(data) ? data.map(mapFromBackend) : [];

        if (mounted) {
          setInitialCategorias(mapped);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toastCustom.error(
          "Não foi possível carregar as categorias de vagas corporativas"
        );
      } finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreate = useCallback(
    async (data: Omit<ListItem, "id" | "createdAt">): Promise<ListItem> => {
      try {
        if (!data.title?.trim()) {
          throw new Error("Nome da categoria é obrigatório");
        }
        if (!data.description?.trim()) {
          throw new Error("Descrição é obrigatória");
        }

        const response = await createEmpresaVagaCategoria({
          nome: data.title,
          descricao: data.description,
        });

        if (
          typeof response === "object" &&
          response !== null &&
          "success" in response &&
          response.success === false
        ) {
          throw new Error(response.message || "Erro ao criar categoria");
        }

        const newItem = mapFromBackend(response as EmpresaVagaCategoria);
        toastCustom.success(
          `Categoria "${data.title}" criada com sucesso para vagas`
        );
        return newItem;
      } catch (error) {
        console.error("Erro ao criar categoria:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao criar categoria";
        toastCustom.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<ListItem>): Promise<ListItem> => {
      try {
        if (!updates.title?.trim()) {
          throw new Error("Nome da categoria é obrigatório");
        }
        if (!updates.description?.trim()) {
          throw new Error("Descrição é obrigatória");
        }

        const response = await updateEmpresaVagaCategoria(id, {
          nome: updates.title,
          descricao: updates.description,
        });

        if (
          typeof response === "object" &&
          response !== null &&
          "success" in response &&
          response.success === false
        ) {
          throw new Error(response.message || "Erro ao atualizar categoria");
        }

        const updatedItem = mapFromBackend(response as EmpresaVagaCategoria);
        toastCustom.success(
          `Categoria "${updates.title}" atualizada com sucesso`
        );

        return updatedItem;
      } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao atualizar categoria";
        toastCustom.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await deleteEmpresaVagaCategoria(id);

      if (
        typeof response === "object" &&
        response !== null &&
        "success" in response &&
        response.success === false
      ) {
        throw new Error(response.message || "Erro ao excluir categoria");
      }

      toastCustom.success("Categoria excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao excluir categoria";
      toastCustom.error(errorMessage);
      throw error;
    }
  }, []);

  const renderItem = useCallback(
    (
      item: ListItem,
      onEdit: (item: ListItem) => void,
      onDelete: (id: string) => void,
      isDeleting?: boolean
    ) => {
      const categoria = mapToBackend(item);
      return (
        <CategoriaRow
          key={item.id}
          categoria={categoria}
          onEdit={() => onEdit(item)}
          onDelete={(categoriaId) => onDelete(categoriaId)}
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
      <CategoriaForm
        onSubmit={async (formData) => {
          const listItemData: Omit<ListItem, "id" | "createdAt"> = {
            title: formData.nome,
            description: formData.descricao,
            status: true,
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
      <CategoriaForm
        categoria={mapToBackend(item)}
        onSubmit={async (formData) => {
          const listItemData: Partial<ListItem> = {
            title: formData.nome,
            description: formData.descricao,
          };
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
                <Skeleton className="h-6 w-32 bg-gray-200" />
                <Skeleton className="h-6 w-20 bg-gray-200" />
              </div>
              <Skeleton className="h-4 w-full bg-gray-200" />
              <div className="flex space-x-2">
                <Skeleton className="h-4 w-16 bg-gray-200" />
                <Skeleton className="h-4 w-20 bg-gray-200" />
                <Skeleton className="h-4 w-24 bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ListManager
      initialItems={initialCategorias}
      entityName="categoria de vaga"
      entityNamePlural="Categorias de Vagas"
      maxItems={100}
      onCreateItem={handleCreate}
      onUpdateItem={handleUpdate}
      onDeleteItem={handleDelete}
      renderItem={renderItem}
      renderCreateForm={renderCreateForm}
      renderEditForm={renderEditForm}
      modalCreateTitle="Criar nova categoria de vaga"
      modalEditTitle="Editar categoria de vaga"
      emptyStateTitle="Nenhuma categoria de vaga encontrada"
      emptyStateFirstItemText="Comece criando a primeira categoria corporativa."
      createButtonText="Nova categoria"
      tableColumns={[
        {
          key: "nome",
          label: "Nome da Categoria",
          className: "min-w-[200px] max-w-[300px]",
        },
        {
          key: "descricao",
          label: "Descrição",
          className: "min-w-[250px] max-w-[400px]",
        },
        {
          key: "subcategorias",
          label: "Subcategorias",
          className: "min-w-[120px] max-w-[150px]",
          tooltip: "Quantidade de subcategorias",
        },
        {
          key: "criadoEm",
          label: "Criado em",
          className: "min-w-[140px] max-w-[180px]",
        },
      ]}
      enablePagination
      itemsPerPage={6}
    />
  );
}
