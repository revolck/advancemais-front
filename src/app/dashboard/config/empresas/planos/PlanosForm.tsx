"use client";

import { useEffect, useState, useCallback } from "react";
import { ListManager } from "@/components/ui/custom/list-manager/ListManager";
import type { ListItem } from "@/components/ui/custom/list-manager/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listPlanosEmpresariais,
  createPlanoEmpresarial,
  updatePlanoEmpresarial,
  deletePlanoEmpresarial,
} from "@/api/empresas/planos-empresariais";
import type { PlanoEmpresarialBackendResponse } from "@/api/empresas/planos-empresariais/types";
import { PlanoRow } from "./components/PlanoRow";
import { PlanoForm } from "./components/PlanoForm";
import type { PlanoFormData } from "./components/PlanoForm";

function mapFromBackend(item: PlanoEmpresarialBackendResponse): ListItem {
  return {
    id: item.id,
    title: item.nome,
    description: item.descricao ?? "",
    status: true, // Planos sempre ativos
    createdAt: item.criadoEm,
    updatedAt: item.atualizadoEm,
    // Dados específicos do plano
    icon: item.icon,
    valor: item.valor,
    desconto: item.desconto,
    quantidadeVagas: item.quantidadeVagas,
    vagaEmDestaque: item.vagaEmDestaque ? "sim" : "nao",
    quantidadeVagasDestaque: item.quantidadeVagasDestaque,
  };
}

function mapToBackend(item: ListItem): PlanoEmpresarialBackendResponse {
  return {
    id: item.id,
    icon: item.icon,
    nome: item.title,
    descricao: item.description || "",
    valor: item.valor,
    desconto: item.desconto,
    quantidadeVagas: item.quantidadeVagas,
    vagaEmDestaque: item.vagaEmDestaque === "sim",
    quantidadeVagasDestaque: item.quantidadeVagasDestaque,
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt || item.createdAt,
  };
}

export default function PlanosForm() {
  const [initialPlanos, setInitialPlanos] = useState<ListItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        const data = await listPlanosEmpresariais();
        const mapped = Array.isArray(data) ? data.map(mapFromBackend) : [];

        if (mounted) {
          setInitialPlanos(mapped);
        }
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
        toastCustom.error("Não foi possível carregar os planos empresariais");
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
        if (!data.icon?.trim()) {
          throw new Error("Ícone é obrigatório");
        }
        if (!data.title?.trim()) {
          throw new Error("Nome do plano é obrigatório");
        }

        // Converter valor monetário de string para number
        const valorNumerico =
          typeof data.valor === "string"
            ? parseFloat(data.valor.replace(",", ".")) || 0
            : data.valor;

        if (valorNumerico <= 0) {
          throw new Error("Valor deve ser maior que zero");
        }

        // Preparar dados
        const vagaEmDestaque = data.vagaEmDestaque === "sim";
        const descricao = data.description?.trim();

        // Construir payload
        const payload: any = {
          icon: data.icon.trim(),
          nome: data.title.trim(),
          ...(descricao ? { descricao } : {}),
          valor: valorNumerico.toString(),
          desconto: Number(data.desconto) || 0,
          quantidadeVagas: Number(data.quantidadeVagas) || 1,
          vagaEmDestaque: vagaEmDestaque,
        };

        // Só adicionar quantidadeVagasDestaque se vagaEmDestaque for true
        if (vagaEmDestaque) {
          payload.quantidadeVagasDestaque = data.quantidadeVagasDestaque || 0;
        }

        console.log("🚀 Criando plano com payload:", payload);

        const created = await createPlanoEmpresarial(payload);

        if (Array.isArray(created) || !("id" in created)) {
          throw new Error("Resposta inválida da API");
        }

        const mappedItem = mapFromBackend(
          created as PlanoEmpresarialBackendResponse
        );
        console.log("✅ Plano criado e mapeado:", mappedItem);

        return mappedItem;
      } catch (error: any) {
        console.error("❌ Erro na criação do plano:", error);

        // Tratamento específico de erros da API
        if (error?.status === 400) {
          throw new Error("Dados inválidos. Verifique os campos obrigatórios.");
        } else if (error?.status === 409) {
          throw new Error("Limite máximo de 4 planos empresariais atingido.");
        } else if (error?.status === 403) {
          throw new Error(
            "Você não tem permissão para criar planos empresariais."
          );
        } else if (error?.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        } else {
          throw new Error(
            error?.message || "Erro interno do servidor. Tente novamente."
          );
        }
      }
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<ListItem>): Promise<ListItem> => {
      // Converter valor monetário de string para number
      const valorNumerico =
        updates.valor && typeof updates.valor === "string"
          ? parseFloat(updates.valor.replace(",", ".")) || 0
          : updates.valor;

      // Construir payload base para update
      const updatePayload: any = {
        icon: updates.icon,
        nome: updates.title,
        descricao: updates.description,
        valor: valorNumerico?.toString(),
        desconto: updates.desconto,
        quantidadeVagas: updates.quantidadeVagas,
        vagaEmDestaque: updates.vagaEmDestaque === "sim",
      };

      // Só adicionar quantidadeVagasDestaque se vagaEmDestaque for true
      if (updates.vagaEmDestaque === "sim") {
        updatePayload.quantidadeVagasDestaque = updates.quantidadeVagasDestaque;
      }

      const updated = await updatePlanoEmpresarial(id, updatePayload);
      if (Array.isArray(updated) || !("id" in updated)) {
        throw new Error("Erro ao atualizar plano empresarial");
      }
      return mapFromBackend(updated as PlanoEmpresarialBackendResponse);
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    await deletePlanoEmpresarial(id);
  }, []);

  const renderItem = useCallback(
    (
      item: ListItem,
      onEdit: (item: ListItem) => void,
      onDelete: (id: string) => void,
      isDeleting?: boolean
    ) => {
      const plano = mapToBackend(item);
      return (
        <PlanoRow
          plano={plano}
          onEdit={(plano) => onEdit(mapFromBackend(plano))}
          onDelete={onDelete}
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
      isLoading = false
    ) => {
      return (
        <PlanoForm
          onSubmit={async (data: PlanoFormData) => {
            // Mapear PlanoFormData para ListItem
            const listItem: Omit<ListItem, "id" | "createdAt"> = {
              title: data.nome,
              description: data.descricao,
              status: true,
              icon: data.icon,
              valor: data.valor,
              desconto: data.desconto,
              quantidadeVagas: data.quantidadeVagas,
              vagaEmDestaque: data.vagaEmDestaque,
              quantidadeVagasDestaque: data.quantidadeVagasDestaque || 0,
            };
            await onSubmit(listItem);
          }}
          onCancel={onCancel}
          loading={isLoading}
        />
      );
    },
    []
  );

  const renderEditForm = useCallback(
    (
      item: ListItem,
      onUpdate: (id: string, data: Partial<ListItem>) => Promise<void>,
      onCancel: () => void,
      isLoading = false
    ) => {
      const plano = mapToBackend(item);
      return (
        <PlanoForm
          plano={plano}
          onSubmit={async (data) => {
            await onUpdate(item.id, {
              icon: data.icon,
              title: data.nome,
              description: data.descricao,
              valor: data.valor,
              desconto: data.desconto,
              quantidadeVagas: data.quantidadeVagas,
              vagaEmDestaque: data.vagaEmDestaque,
              quantidadeVagasDestaque: data.quantidadeVagasDestaque,
            });
          }}
          onCancel={onCancel}
          loading={isLoading}
        />
      );
    },
    []
  );

  // Loading inicial
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
      initialItems={initialPlanos}
      entityName="Plano Empresarial"
      entityNamePlural="Planos Empresariais"
      maxItems={4}
      onCreateItem={handleCreate}
      onUpdateItem={handleUpdate}
      onDeleteItem={handleDelete}
      renderItem={renderItem}
      renderCreateForm={renderCreateForm}
      renderEditForm={renderEditForm}
      modalCreateTitle="Criar novo plano empresarial"
      modalEditTitle="Editar plano empresarial"
      emptyStateFirstItemText="Comece criando seu primeiro plano empresarial."
      createButtonText="Novo plano"
      tableColumns={[
        {
          key: "plano",
          label: "Plano",
          className: "min-w-[200px] max-w-[240px]",
        },
        {
          key: "valor",
          label: "Valor",
          className: "min-w-[140px] max-w-[180px]",
        },
        {
          key: "tipo",
          label: "Tipo",
          className: "min-w-[120px] max-w-[150px]",
        },
        {
          key: "desconto",
          label: "Desconto",
          className: "min-w-[120px] max-w-[150px]",
        },
        {
          key: "vagas",
          label: "Vagas",
          className: "min-w-[120px] max-w-[150px]",
        },
        {
          key: "destaque",
          label: "Destaque",
          className: "min-w-[120px] max-w-[150px]",
        },
        {
          key: "quantidadeDestaque",
          label: "Qtd. em destaque",
          tooltip: "Quantidade de Destaque",
          className: "min-w-[140px] max-w-[180px]",
        },
      ]}
    />
  );
}
