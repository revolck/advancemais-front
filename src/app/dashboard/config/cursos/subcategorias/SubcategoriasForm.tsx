"use client";

import React, { useState, useCallback, useMemo } from "react";
import { toastCustom } from "@/components/ui/custom";
import { ListManager } from "@/components/ui/custom/list-manager";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ListItem,
  ListManagerProps,
} from "@/components/ui/custom/list-manager/types";
import {
  listCategorias,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
} from "@/api/cursos/categorias";
import type {
  CategoriaCurso,
  SubcategoriaCurso,
  CreateSubcategoriaPayload,
  UpdateSubcategoriaPayload,
} from "@/api/cursos/categorias/types";
import { SubcategoriaRow } from "./components/SubcategoriaRow";
import {
  SubcategoriaForm,
  type SubcategoriaFormData,
} from "./components/SubcategoriaForm";

export function SubcategoriasForm() {
  const [initialSubcategorias, setInitialSubcategorias] = useState<ListItem[]>(
    []
  );
  const [categorias, setCategorias] = useState<CategoriaCurso[]>([]);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Carregar categorias de forma assíncrona
  const loadCategorias = useCallback(async () => {
    try {
      setIsLoadingCategorias(true);
      console.log("Carregando categorias...");

      const categoriasResponse = await listCategorias();

      console.log("Resposta bruta da API de categorias:", categoriasResponse);

      if (Array.isArray(categoriasResponse)) {
        setCategorias(categoriasResponse);
        console.log(
          `✅ ${categoriasResponse.length} categorias carregadas:`,
          categoriasResponse.map((c) => ({ id: c.id, nome: c.nome }))
        );
      } else {
        console.error("Resposta inválida da API:", categoriasResponse);
        setCategorias([]);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setCategorias([]);
      toastCustom.error({
        title: "Erro ao carregar categorias",
        description:
          "Não foi possível carregar as categorias. Tente novamente.",
      });
    } finally {
      setIsLoadingCategorias(false);
      setIsInitialLoading(false);
    }
  }, []);

  // Carregar subcategorias após categorias carregadas
  const loadSubcategorias = useCallback(async () => {
    if (categorias.length === 0) return;

    try {
      console.log("Carregando subcategorias...");

      // Coletar todas as subcategorias de todas as categorias com referência à categoria pai
      const todasSubcategoriasComPai: {
        subcategoria: SubcategoriaCurso;
        categoriaPai: CategoriaCurso;
      }[] = [];

      categorias.forEach((categoria) => {
        if (categoria.subcategorias && categoria.subcategorias.length > 0) {
          categoria.subcategorias.forEach((subcategoria) => {
            todasSubcategoriasComPai.push({
              subcategoria,
              categoriaPai: categoria,
            });
          });
        }
      });

      // Mapear todas as subcategorias para o formato do ListManager
      const mappedSubcategorias = todasSubcategoriasComPai.map(
        ({ subcategoria, categoriaPai }) =>
          mapFromBackend(subcategoria, categoriaPai)
      );

      setInitialSubcategorias(mappedSubcategorias);
      console.log(`✅ ${mappedSubcategorias.length} subcategorias carregadas`);
    } catch (error) {
      console.error("Erro ao processar subcategorias:", error);
      setInitialSubcategorias([]);
    }
  }, [categorias]);

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    await loadCategorias();
  }, [loadCategorias]);

  // Mapear dados do backend para o formato do ListManager
  const mapFromBackend = (
    item: SubcategoriaCurso,
    categoriaPai?: CategoriaCurso
  ): ListItem => {
    return {
      id: item.id.toString(),
      title: item.nome,
      description: item.descricao,
      status: true, // Subcategorias sempre ativas
      createdAt: item.criadoEm,
      updatedAt: item.atualizadoEm,
      // Dados específicos da subcategoria
      codSubcategoria: item.codSubcategoria,
      categoriaPai: categoriaPai,
    };
  };

  // Mapear dados do ListManager para o formato do backend
  const mapToBackend = (
    item: ListItem
  ): SubcategoriaCurso & { categoriaPai?: CategoriaCurso } => {
    return {
      id: parseInt(item.id),
      codSubcategoria: item.codSubcategoria || "",
      nome: item.title,
      descricao: item.description || "",
      criadoEm: item.createdAt,
      atualizadoEm: item.updatedAt || item.createdAt,
      categoriaPai: item.categoriaPai,
    };
  };

  // Criar nova subcategoria
  const handleCreate = useCallback(
    async (data: Omit<ListItem, "id" | "createdAt">): Promise<ListItem> => {
      // Para criar uma subcategoria, precisamos de uma categoria pai
      // Isso será selecionado no formulário de criação
      if (!data.categoriaPai) {
        throw new Error("Categoria pai é obrigatória");
      }

      try {
        console.log("Criando subcategoria:", {
          categoriaId: data.categoriaPai.id,
          categoriaNome: data.categoriaPai.nome,
          subcategoriaNome: data.title,
        });

        console.log(
          "Categorias disponíveis:",
          categorias.map((c) => ({ id: c.id, nome: c.nome }))
        );
        console.log("Categoria pai encontrada:", data.categoriaPai);

        const payload: CreateSubcategoriaPayload = {
          nome: data.title,
          descricao: data.description || "",
        };

        console.log("Payload sendo enviado:", payload);
        console.log(
          "URL da requisição:",
          `/api/v1/cursos/categorias/${data.categoriaPai.id}/subcategorias`
        );

        const response = await createSubcategoria(
          data.categoriaPai.id,
          payload
        );

        if (response) {
          toastCustom.success({
            title: "Subcategoria criada!",
            description: "A subcategoria foi criada com sucesso.",
          });

          // Recarregar dados
          await loadInitialData();

          // Retornar o item criado
          return mapFromBackend(
            response as SubcategoriaCurso,
            data.categoriaPai
          );
        }

        throw new Error("Resposta inválida da API");
      } catch (error) {
        console.error("Erro ao criar subcategoria:", error);
        toastCustom.error({
          title: "Erro ao criar subcategoria",
          description:
            "Não foi possível criar a subcategoria. Tente novamente.",
        });
        throw error;
      }
    },
    [loadInitialData, categorias]
  );

  // Atualizar subcategoria
  const handleUpdate = useCallback(
    async (id: string, data: Partial<ListItem>): Promise<ListItem> => {
      try {
        const payload: UpdateSubcategoriaPayload = {
          nome: data.title,
          descricao: data.description || "",
        };

        const response = await updateSubcategoria(parseInt(id), payload);

        if (response) {
          toastCustom.success({
            title: "Subcategoria atualizada!",
            description: "A subcategoria foi atualizada com sucesso.",
          });

          // Recarregar dados
          await loadInitialData();

          // Retornar o item atualizado mantendo a categoria pai original
          const itemOriginal = initialSubcategorias.find(
            (item) => item.id === id
          );
          return mapFromBackend(
            response as SubcategoriaCurso,
            itemOriginal?.categoriaPai
          );
        }

        throw new Error("Resposta inválida da API");
      } catch (error) {
        console.error("Erro ao atualizar subcategoria:", error);
        toastCustom.error({
          title: "Erro ao atualizar subcategoria",
          description:
            "Não foi possível atualizar a subcategoria. Tente novamente.",
        });
        throw error;
      }
    },
    [loadInitialData, initialSubcategorias]
  );

  // Deletar subcategoria
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        console.log("Iniciando exclusão da subcategoria ID:", id);
        await deleteSubcategoria(parseInt(id));

        toastCustom.success({
          title: "Subcategoria excluída!",
          description: "A subcategoria foi excluída com sucesso.",
        });

        // Recarregar dados
        console.log("Recarregando dados após exclusão...");
        await loadInitialData();
      } catch (error) {
        console.error("Erro ao excluir subcategoria:", error);
        toastCustom.error({
          title: "Erro ao excluir subcategoria",
          description:
            "Não foi possível excluir a subcategoria. Tente novamente.",
        });
        throw error;
      }
    },
    [loadInitialData]
  );

  // Renderizar item da lista
  const renderItem = useCallback(
    (
      item: ListItem,
      onEdit: (item: ListItem) => void,
      onDelete: (id: string) => void,
      isDeleting?: boolean
    ) => {
      const subcategoria = mapToBackend(item);
      return (
        <SubcategoriaRow
          key={item.id}
          subcategoria={subcategoria}
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
    ) => {
      return (
        <SubcategoriaForm
          categorias={categorias}
          isLoadingCategorias={isLoadingCategorias}
          onSubmit={async (formData: SubcategoriaFormData) => {
            console.log("Dados do formulário recebidos:", formData);
            console.log(
              "Categorias disponíveis no momento do submit:",
              categorias.map((c) => ({ id: c.id, nome: c.nome }))
            );

            const categoriaPai = categorias.find(
              (c) => c.id === parseInt(formData.categoriaPaiId)
            );

            console.log("Categoria pai encontrada:", categoriaPai);

            if (!categoriaPai) {
              console.error(
                "Categoria não encontrada para ID:",
                formData.categoriaPaiId
              );
              throw new Error("Categoria selecionada não encontrada");
            }

            const listItemData = {
              title: formData.nome,
              description: formData.descricao,
              status: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              categoriaPai: categoriaPai,
            };

            console.log(
              "Dados finais sendo enviados para handleCreate:",
              listItemData
            );
            await onSubmit(listItemData);
          }}
          onCancel={onCancel}
          isSubmitting={isLoading || false}
        />
      );
    },
    [categorias, isLoadingCategorias]
  );

  // Renderizar formulário de edição
  const renderEditForm = useCallback(
    (
      item: ListItem,
      onUpdate: (id: string, data: Partial<ListItem>) => Promise<void>,
      onCancel: () => void,
      isLoading?: boolean
    ) => {
      const subcategoria = mapToBackend(item);
      return (
        <SubcategoriaForm
          subcategoria={subcategoria}
          categorias={categorias}
          isLoadingCategorias={isLoadingCategorias}
          onSubmit={async (formData: SubcategoriaFormData) => {
            const listItemData = {
              title: formData.nome,
              description: formData.descricao,
              status: item.status,
              createdAt: item.createdAt,
              updatedAt: new Date().toISOString(),
            };
            await onUpdate(item.id, listItemData);
          }}
          onCancel={onCancel}
          isSubmitting={isLoading || false}
        />
      );
    },
    [categorias, isLoadingCategorias]
  );

  // Carregar dados na inicialização
  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Carregar subcategorias quando categorias mudarem
  React.useEffect(() => {
    if (!isLoadingCategorias && categorias.length > 0) {
      loadSubcategorias();
    }
  }, [categorias, isLoadingCategorias, loadSubcategorias]);

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
    <div className="space-y-6">
      {/* Lista de Todas as Subcategorias */}
      <ListManager
        initialItems={initialSubcategorias}
        entityName="subcategoria de curso"
        entityNamePlural="Subcategorias de Cursos"
        maxItems={50}
        onCreateItem={handleCreate}
        onUpdateItem={handleUpdate}
        onDeleteItem={handleDelete}
        renderItem={renderItem}
        renderCreateForm={renderCreateForm}
        renderEditForm={renderEditForm}
        modalCreateTitle="Criar nova subcategoria de curso"
        modalEditTitle="Editar subcategoria de curso"
        emptyStateTitle="Nenhuma subcategoria de curso encontrada"
        emptyStateFirstItemText="Comece criando sua primeira subcategoria de curso."
        createButtonText="Nova subcategoria"
        tableColumns={[
          {
            key: "nome",
            label: "Nome da Subcategoria",
            className: "min-w-[200px] max-w-[300px]",
          },
          {
            key: "categoriaPai",
            label: "Categoria Pai",
            className: "min-w-[180px] max-w-[220px]",
          },
          {
            key: "descricao",
            label: "Descrição",
            className: "min-w-[250px] max-w-[400px]",
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
