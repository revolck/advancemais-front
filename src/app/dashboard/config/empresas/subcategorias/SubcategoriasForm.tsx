"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toastCustom } from "@/components/ui/custom";
import { ListManager } from "@/components/ui/custom/list-manager";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ListItem,
  ListManagerProps,
} from "@/components/ui/custom/list-manager/types";
import {
  listEmpresaVagaCategorias,
  createEmpresaVagaSubcategoria,
  updateEmpresaVagaSubcategoria,
  deleteEmpresaVagaSubcategoria,
} from "@/api/empresas";
import type {
  EmpresaVagaCategoria,
  EmpresaVagaSubcategoria,
} from "@/api/empresas";
import { SubcategoriaRow } from "./components/SubcategoriaRow";
import {
  SubcategoriaForm,
  type SubcategoriaFormData,
} from "./components/SubcategoriaForm";

export function SubcategoriasForm() {
  const [initialSubcategorias, setInitialSubcategorias] = useState<ListItem[]>(
    []
  );
  const [categorias, setCategorias] = useState<EmpresaVagaCategoria[]>([]);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const mapFromBackend = useCallback(
    (
      item: EmpresaVagaSubcategoria,
      categoriaPai?: EmpresaVagaCategoria
    ): ListItem => ({
      id: item.id,
      title: item.nome,
      description: item.descricao,
      status: true,
      createdAt: item.criadoEm,
      updatedAt: item.atualizadoEm,
      codSubcategoria: item.codSubcategoria,
      categoriaPai,
    }),
    []
  );

  const mapToBackend = useCallback(
    (item: ListItem): EmpresaVagaSubcategoria & {
      categoriaPai?: EmpresaVagaCategoria;
    } => ({
      id: item.id,
      codSubcategoria: item.codSubcategoria || "",
      nome: item.title,
      descricao: item.description || "",
      criadoEm: item.createdAt,
      atualizadoEm: item.updatedAt || item.createdAt,
      categoriaPai: item.categoriaPai,
      categoriaId: item.categoriaPai?.id || "",
    }),
    []
  );

  const loadCategorias = useCallback(async () => {
    try {
      setIsLoadingCategorias(true);
      const response = await listEmpresaVagaCategorias();

      if (Array.isArray(response)) {
        setCategorias(response);
        const flattened = response.flatMap((categoria) =>
          (categoria.subcategorias || []).map((subcategoria) =>
            mapFromBackend(subcategoria, categoria)
          )
        );
        setInitialSubcategorias(flattened);
      } else {
        console.error("Resposta inválida ao listar categorias:", response);
        setCategorias([]);
        setInitialSubcategorias([]);
        toastCustom.error(
          "Não foi possível carregar as categorias corporativas"
        );
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setCategorias([]);
      setInitialSubcategorias([]);
      toastCustom.error(
        "Erro ao carregar categorias de vagas corporativas"
      );
    } finally {
      setIsLoadingCategorias(false);
      setIsInitialLoading(false);
    }
  }, [mapFromBackend]);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handleCreate = useCallback<
    ListManagerProps["onCreateItem"]
  >(
    async (data) => {
      if (!data.categoriaPai) {
        throw new Error("Categoria pai é obrigatória");
      }

      try {
        const payload = {
          nome: data.title,
          descricao: data.description || "",
        };

        const response = await createEmpresaVagaSubcategoria(
          data.categoriaPai.id,
          payload
        );

        if (
          typeof response === "object" &&
          response !== null &&
          "success" in response &&
          response.success === false
        ) {
          throw new Error(response.message || "Erro ao criar subcategoria");
        }

        const categoriaPai =
          categorias.find((categoria) => categoria.id === data.categoriaPai.id) ||
          data.categoriaPai;

        const newItem = mapFromBackend(
          response as EmpresaVagaSubcategoria,
          categoriaPai
        );

        await loadCategorias();

        toastCustom.success("Subcategoria criada com sucesso");
        return newItem;
      } catch (error) {
        console.error("Erro ao criar subcategoria:", error);
        const message =
          error instanceof Error ? error.message : "Erro ao criar subcategoria";
        toastCustom.error(message);
        throw error;
      }
    },
    [categorias, loadCategorias, mapFromBackend]
  );

  const handleUpdate = useCallback<
    ListManagerProps["onUpdateItem"]
  >(
    async (id, updates) => {
      try {
        if (!updates.title?.trim()) {
          throw new Error("Nome da subcategoria é obrigatório");
        }
        if (!updates.description?.trim()) {
          throw new Error("Descrição é obrigatória");
        }

        const categoriaPaiId =
          updates.categoriaPai?.id ||
          initialSubcategorias.find((item) => item.id === id)?.categoriaPai?.id;

        if (!categoriaPaiId) {
          throw new Error("Categoria pai é obrigatória");
        }

        const response = await updateEmpresaVagaSubcategoria(id, {
          nome: updates.title,
          descricao: updates.description,
        });

        if (
          typeof response === "object" &&
          response !== null &&
          "success" in response &&
          response.success === false
        ) {
          throw new Error(response.message || "Erro ao atualizar subcategoria");
        }

        const categoriaPai =
          categorias.find((categoria) => categoria.id === categoriaPaiId) ||
          updates.categoriaPai;

        const updatedItem = mapFromBackend(
          response as EmpresaVagaSubcategoria,
          categoriaPai
        );

        await loadCategorias();

        toastCustom.success("Subcategoria atualizada com sucesso");
        return updatedItem;
      } catch (error) {
        console.error("Erro ao atualizar subcategoria:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao atualizar subcategoria";
        toastCustom.error(message);
        throw error;
      }
    },
    [categorias, initialSubcategorias, loadCategorias, mapFromBackend]
  );

  const handleDelete = useCallback<
    ListManagerProps["onDeleteItem"]
  >(
    async (id) => {
      try {
        const response = await deleteEmpresaVagaSubcategoria(id);

        if (
          typeof response === "object" &&
          response !== null &&
          "success" in response &&
          response.success === false
        ) {
          throw new Error(response.message || "Erro ao excluir subcategoria");
        }

        await loadCategorias();
        toastCustom.success("Subcategoria excluída com sucesso");
      } catch (error) {
        console.error("Erro ao excluir subcategoria:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao excluir subcategoria";
        toastCustom.error(message);
        throw error;
      }
    },
    [loadCategorias]
  );

  const renderItem = useCallback<
    ListManagerProps["renderItem"]
  >(
    (item, onEdit, onDelete, isDeleting) => {
      const subcategoria = mapToBackend(item);
      return (
        <SubcategoriaRow
          key={item.id}
          subcategoria={subcategoria}
          onEdit={() => onEdit(item)}
          onDelete={(subcategoriaId) => onDelete(subcategoriaId)}
          isDeleting={isDeleting}
        />
      );
    },
    [mapToBackend]
  );

  const renderCreateForm = useCallback<
    ListManagerProps["renderCreateForm"]
  >(
    (onSubmit, onCancel, isLoading) => (
      <SubcategoriaForm
        categorias={categorias}
        isLoadingCategorias={isLoadingCategorias}
        onSubmit={async (formData: SubcategoriaFormData) => {
          const categoriaSelecionada = categorias.find(
            (categoria) => categoria.id === formData.categoriaPaiId
          );

          const listItemData: Omit<ListItem, "id" | "createdAt"> = {
            title: formData.nome,
            description: formData.descricao,
            status: true,
            createdAt: new Date().toISOString(),
            categoriaPai: categoriaSelecionada,
          };

          await onSubmit(listItemData);
        }}
        onCancel={onCancel}
        isSubmitting={isLoading}
      />
    ),
    [categorias, isLoadingCategorias]
  );

  const renderEditForm = useCallback<
    ListManagerProps["renderEditForm"]
  >(
    (item, onUpdate, onCancel, isLoading) => (
      <SubcategoriaForm
        subcategoria={mapToBackend(item)}
        categorias={categorias}
        isLoadingCategorias={isLoadingCategorias}
        onSubmit={async (formData: SubcategoriaFormData) => {
          const categoriaSelecionada = categorias.find(
            (categoria) => categoria.id === formData.categoriaPaiId
          );

          const listItemData: Partial<ListItem> = {
            title: formData.nome,
            description: formData.descricao,
            categoriaPai: categoriaSelecionada,
          };

          await onUpdate(item.id, listItemData);
        }}
        onCancel={onCancel}
        isSubmitting={isLoading}
      />
    ),
    [categorias, isLoadingCategorias, mapToBackend]
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
      initialItems={initialSubcategorias}
      entityName="subcategoria de vaga"
      entityNamePlural="Subcategorias de Vagas"
      maxItems={200}
      onCreateItem={handleCreate}
      onUpdateItem={handleUpdate}
      onDeleteItem={handleDelete}
      renderItem={renderItem}
      renderCreateForm={renderCreateForm}
      renderEditForm={renderEditForm}
      modalCreateTitle="Criar nova subcategoria"
      modalEditTitle="Editar subcategoria"
      emptyStateTitle="Nenhuma subcategoria encontrada"
      emptyStateFirstItemText="Crie subcategorias para organizar as vagas corporativas."
      createButtonText="Nova subcategoria"
      tableColumns={[
        {
          key: "nome",
          label: "Nome da Subcategoria",
          className: "min-w-[200px] max-w-[300px]",
        },
        {
          key: "categoria",
          label: "Categoria",
          className: "min-w-[180px] max-w-[220px]",
        },
        {
          key: "descricao",
          label: "Descrição",
          className: "min-w-[240px] max-w-[320px]",
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

