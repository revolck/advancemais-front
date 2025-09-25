"use client";

import { useEffect, useState, useCallback } from "react";
import { ListManager } from "@/components/ui/custom/list-manager/ListManager";
import type { ListItem } from "@/components/ui/custom/list-manager/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "@/api/cursos/categorias";
import type { CategoriaCurso } from "@/api/cursos/categorias/types";
import { CategoriaRow } from "./components/CategoriaRow";
import { CategoriaForm } from "./components/CategoriaForm";

function mapFromBackend(item: CategoriaCurso): ListItem {
  return {
    id: item.id.toString(),
    title: item.nome,
    description: item.descricao,
    status: true, // Categorias sempre ativas
    createdAt: item.criadoEm,
    updatedAt: item.atualizadoEm,
    // Dados específicos da categoria
    codCategoria: item.codCategoria,
    subcategorias: item.subcategorias || [],
  };
}

function mapToBackend(item: ListItem): CategoriaCurso {
  return {
    id: parseInt(item.id),
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

  // Carregar dados iniciais
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        const data = await listCategorias();
        const mapped = Array.isArray(data) ? data.map(mapFromBackend) : [];

        if (mounted) {
          setInitialCategorias(mapped);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toastCustom.error("Não foi possível carregar as categorias de cursos");
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
        // Validação de campos obrigatórios
        if (!data.title?.trim()) {
          throw new Error("Nome da categoria é obrigatório");
        }
        if (!data.description?.trim()) {
          throw new Error("Descrição é obrigatória");
        }

        const response = await createCategoria({
          nome: data.title,
          descricao: data.description,
        });

        // Verificar se a resposta é um erro
        if ("success" in response && !response.success) {
          throw new Error(response.message || "Erro ao criar categoria");
        }

        const newItem = mapFromBackend(response as CategoriaCurso);
        toastCustom.success(`Categoria "${data.title}" criada com sucesso`);

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
        // Validação de campos obrigatórios
        if (!updates.title?.trim()) {
          throw new Error("Nome da categoria é obrigatório");
        }
        if (!updates.description?.trim()) {
          throw new Error("Descrição é obrigatória");
        }

        const response = await updateCategoria(parseInt(id), {
          nome: updates.title,
          descricao: updates.description,
        });

        // Verificar se a resposta é um erro
        if ("success" in response && !response.success) {
          throw new Error(response.message || "Erro ao atualizar categoria");
        }

        const updatedItem = mapFromBackend(response as CategoriaCurso);
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
      await deleteCategoria(parseInt(id));
      toastCustom.success("Categoria excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao excluir categoria";
      toastCustom.error(errorMessage);
      throw error;
    }
  }, []);

  // Renderizar item da categoria
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
          onDelete={(id) => onDelete(id.toString())}
          isDeleting={isDeleting}
        />
      );
    },
    []
  );

  // Renderizar formulário de criação
  const renderCreateForm = useCallback(
    (
      onSubmit: (data: Omit<ListItem, "id" | "createdAt">) => Promise<void>,
      onCancel: () => void,
      isLoading?: boolean
    ) => (
      <CategoriaForm
        onSubmit={async (formData) => {
          // Mapear CategoriaFormData para ListItem
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

  // Renderizar formulário de edição
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
          // Mapear CategoriaFormData para Partial<ListItem>
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
      entityName="categoria de curso"
      entityNamePlural="Categorias de Cursos"
      maxItems={50}
      onCreateItem={handleCreate}
      onUpdateItem={handleUpdate}
      onDeleteItem={handleDelete}
      renderItem={renderItem}
      renderCreateForm={renderCreateForm}
      renderEditForm={renderEditForm}
      modalCreateTitle="Criar nova categoria de curso"
      modalEditTitle="Editar categoria de curso"
      emptyStateTitle="Nenhuma categoria de curso encontrada"
      emptyStateFirstItemText="Comece criando sua primeira categoria de curso."
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
      enablePagination={true}
      itemsPerPage={6}
    />
  );
}
