"use client";

import { useEffect, useState, useCallback } from "react";
import { ListManager } from "@/components/ui/custom/list-manager/ListManager";
import type { ListItem } from "@/components/ui/custom/list-manager/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import { StatusProcessoRow } from "./components/StatusProcessoRow";
import { StatusProcessoForm } from "./components/StatusProcessoForm";
import { useStatusProcesso } from "@/hooks/status-processo";
import type {
  StatusProcesso,
  StatusProcessoFormData,
  StatusProcessoFilters,
} from "./types";

// Funções de mapeamento
function mapFromBackend(item: StatusProcesso): ListItem {
  return {
    id: item.id,
    title: item.nome,
    description: item.descricao,
    status: item.ativo,
    // Datas vêm como string ISO do backend; garantir Date para toISOString
    createdAt: new Date(item.criadoEm as unknown as string).toISOString(),
    updatedAt: new Date(item.atualizadoEm as unknown as string).toISOString(),
    // Dados específicos do status
    isDefault: item.isDefault,
    criadoPor: item.criadoPor,
  };
}

function mapToBackend(item: ListItem): StatusProcesso {
  return {
    id: item.id,
    nome: item.title,
    descricao: item.description || "",
    ativo: item.status || false,
    isDefault: item.isDefault || false,
    criadoPor: item.criadoPor || "",
    criadoEm: new Date(item.createdAt),
    atualizadoEm: new Date(item.updatedAt || item.createdAt),
  };
}

export function StatusProcessosForm() {
  const {
    statusProcessos,
    pagination,
    loading,
    error,
    list,
    create,
    update,
    remove,
    clearError,
  } = useStatusProcesso();

  const [initialStatus, setInitialStatus] = useState<ListItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasDefaultStatus, setHasDefaultStatus] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        await list({
          page: 1,
          pageSize: 50,
          sortBy: "criadoEm",
          sortOrder: "desc",
        });

        if (mounted) {
          const mapped = statusProcessos.map(mapFromBackend);
          // Verificar se existe status padrão
          const hasDefault = mapped.some((item) => item.isDefault);
          setHasDefaultStatus(hasDefault);

          // Ordenar: padrão primeiro, depois por data de criação
          const sorted = mapped.sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
          setInitialStatus(sorted);
        }
      } catch (error) {
        console.error("Erro ao carregar status de processos:", error);
        toastCustom.error("Não foi possível carregar os status de processos");
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
  }, [list, statusProcessos]);

  // Atualizar lista quando statusProcessos mudar
  useEffect(() => {
    if (statusProcessos.length > 0) {
      const mapped = statusProcessos.map(mapFromBackend);
      // Verificar se existe status padrão
      const hasDefault = mapped.some((item) => item.isDefault);
      setHasDefaultStatus(hasDefault);

      // Ordenar: padrão primeiro, depois por data de criação
      const sorted = mapped.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setInitialStatus(sorted);
    }
  }, [statusProcessos]);

  const handleCreate = useCallback(
    async (data: Omit<ListItem, "id" | "createdAt">): Promise<ListItem> => {
      try {
        // Validação de campos obrigatórios
        if (!data.title?.trim()) {
          throw new Error("Nome do status é obrigatório");
        }
        const createData = {
          nome: data.title,
          descricao: data.description || "",
          ativo: data.status || false,
          isDefault: data.isDefault || false,
        };

        const newStatus = await create(createData);

        if (newStatus) {
          const newItem = mapFromBackend(newStatus);
          return newItem;
        } else {
          throw new Error("Erro ao criar status");
        }
      } catch (error) {
        console.error("Erro ao criar status:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao criar status";
        toastCustom.error(errorMessage);
        throw error;
      }
    },
    [create]
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<ListItem>): Promise<ListItem> => {
      try {
        // Validação de campos obrigatórios
        if (!updates.title?.trim()) {
          throw new Error("Nome do status é obrigatório");
        }

        // Se está removendo o status padrão, escolher outro automaticamente
        if (updates.isDefault === false && hasDefaultStatus) {
          const currentStatus = initialStatus.find((item) => item.id === id);
          if (currentStatus?.isDefault) {
            // Encontrar outro status ativo para ser o novo padrão
            const otherStatus = initialStatus.find(
              (item) => item.id !== id && item.status && !item.isDefault
            );

            if (otherStatus) {
              // Atualizar o outro status para ser padrão
              await update(otherStatus.id, { isDefault: true });
              toastCustom.success(
                `Status "${otherStatus.title}" foi definido como padrão automaticamente`
              );
            } else {
              toastCustom.error(
                "Não é possível remover o status padrão. Não há outros status ativos disponíveis."
              );
              throw new Error(
                "Não é possível remover o status padrão. Não há outros status ativos disponíveis."
              );
            }
          }
        }

        const updateData = {
          nome: updates.title,
          descricao: updates.description,
          ativo: updates.status,
          isDefault: updates.isDefault,
        };

        const updatedStatus = await update(id, updateData);

        if (updatedStatus) {
          const updatedItem = mapFromBackend(updatedStatus);
          return updatedItem;
        } else {
          throw new Error("Erro ao atualizar status");
        }
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao atualizar status";
        toastCustom.error(errorMessage);
        throw error;
      }
    },
    [update, hasDefaultStatus, initialStatus]
  );

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      try {
        const success = await remove(id);
        if (!success) {
          throw new Error("Erro ao excluir status");
        }
      } catch (error) {
        console.error("Erro ao excluir status:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao excluir status";
        toastCustom.error(errorMessage);
        throw error;
      }
    },
    [remove]
  );

  // Renderizar item do status
  const renderItem = useCallback(
    (
      item: ListItem,
      onEdit: (item: ListItem) => void,
      onDelete: (id: string) => void,
      isDeleting?: boolean
    ) => {
      const status = mapToBackend(item);
      return (
        <StatusProcessoRow
          key={item.id}
          status={status}
          onEdit={() => onEdit(item)}
          onDelete={(id) => onDelete(id)}
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
      <StatusProcessoForm
        onSubmit={async (formData) => {
          // Mapear StatusProcessoFormData para ListItem
          const listItemData: Omit<ListItem, "id" | "createdAt"> = {
            title: formData.nome,
            description: formData.descricao,
            status: formData.ativo,
            createdAt: new Date().toISOString(),
            isDefault: formData.isDefault,
            criadoPor: "current-user", // TODO: Obter do contexto de usuário
          };
          await onSubmit(listItemData);
        }}
        onCancel={onCancel}
        isSubmitting={isLoading}
        hasExistingDefault={hasDefaultStatus}
        isEditingDefault={false}
      />
    ),
    [hasDefaultStatus]
  );

  // Renderizar formulário de edição
  const renderEditForm = useCallback(
    (
      item: ListItem,
      onUpdate: (id: string, data: Partial<ListItem>) => Promise<void>,
      onCancel: () => void,
      isLoading?: boolean
    ) => (
      <StatusProcessoForm
        status={mapToBackend(item)}
        onSubmit={async (formData) => {
          // Mapear StatusProcessoFormData para Partial<ListItem>
          const listItemData: Partial<ListItem> = {
            title: formData.nome,
            description: formData.descricao,
            status: formData.ativo,
            isDefault: formData.isDefault,
          };
          await onUpdate(item.id, listItemData);
        }}
        onCancel={onCancel}
        isSubmitting={isLoading}
        hasExistingDefault={hasDefaultStatus}
        isEditingDefault={item.isDefault}
      />
    ),
    [hasDefaultStatus]
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
      initialItems={initialStatus}
      entityName="status de processo"
      entityNamePlural="Status de Processos"
      maxItems={50}
      onCreateItem={handleCreate}
      onUpdateItem={handleUpdate}
      onDeleteItem={handleDelete}
      renderItem={renderItem}
      renderCreateForm={renderCreateForm}
      renderEditForm={renderEditForm}
      modalCreateTitle="Criar novo status de processo"
      modalEditTitle="Editar status de processo"
      emptyStateTitle="Nenhum status de processo encontrado"
      emptyStateFirstItemText="Comece criando seu primeiro status de processo."
      createButtonText="Novo status"
      tableColumns={[
        {
          key: "nome",
          label: "Nome",
          className: "min-w-[200px] max-w-[240px]",
        },
        {
          key: "isDefault",
          label: "Padrão",
          className: "min-w-[80px] max-w-[100px]",
        },
        {
          key: "status",
          label: "Status",
          className: "min-w-[80px] max-w-[100px]",
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
