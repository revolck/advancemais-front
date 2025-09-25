"use client";

import { useEffect, useState, useCallback } from "react";
import { ListManager } from "@/components/ui/custom/list-manager/ListManager";
import type { ListItem } from "@/components/ui/custom/list-manager/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listCupons,
  createCupom,
  updateCupom,
  deleteCupom,
} from "@/api/cupons";
import type { CupomDesconto } from "@/api/cupons/types";
import { CupomRow } from "./components/CupomRow";
import { CupomForm } from "./components/CupomForm";

function mapFromBackend(item: CupomDesconto): ListItem {
  return {
    id: item.id,
    title: item.codigo,
    // description removido do formulário
    status: true, // Sempre ativo por padrão
    createdAt: item.criadoEm,
    updatedAt: item.atualizadoEm,
    // Dados específicos do cupom
    tipoDesconto: item.tipoDesconto,
    valorPercentual: item.valorPercentual,
    valorFixo: item.valorFixo,
    aplicarEm: item.aplicarEm,
    aplicarEmTodosItens: item.aplicarEmTodosItens,
    limiteUsoTotalTipo: item.limiteUsoTotalTipo,
    limiteUsoTotalQuantidade: item.limiteUsoTotalQuantidade,
    limitePorUsuarioTipo: item.limitePorUsuarioTipo,
    limitePorUsuarioQuantidade: item.limitePorUsuarioQuantidade,
    periodoTipo: item.periodoTipo,
    periodoInicio: item.periodoInicio,
    periodoFim: item.periodoFim,
    usosTotais: item.usosTotais,
    cursosAplicados: item.cursosAplicados || [],
    planosAplicados: item.planosAplicados || [],
  };
}

function mapToBackend(item: ListItem): CupomDesconto {
  return {
    id: item.id,
    codigo: item.title,
    // descricao removido do formulário
    tipoDesconto: item.tipoDesconto || "PORCENTAGEM",
    valorPercentual: item.valorPercentual,
    valorFixo: item.valorFixo,
    aplicarEm: item.aplicarEm || "TODA_PLATAFORMA",
    aplicarEmTodosItens: item.aplicarEmTodosItens || false,
    limiteUsoTotalTipo: item.limiteUsoTotalTipo || "ILIMITADO",
    limiteUsoTotalQuantidade: item.limiteUsoTotalQuantidade,
    limitePorUsuarioTipo: item.limitePorUsuarioTipo || "ILIMITADO",
    limitePorUsuarioQuantidade: item.limitePorUsuarioQuantidade,
    periodoTipo: item.periodoTipo || "ILIMITADO",
    periodoInicio: item.periodoInicio,
    periodoFim: item.periodoFim,
    usosTotais: item.usosTotais || 0,
    // ativo removido - sempre true por padrão
    criadoEm: item.createdAt,
    atualizadoEm: item.updatedAt || item.createdAt,
    criadoPor: {
      id: "",
      nomeCompleto: "",
      email: "",
      role: "",
    },
    cursosAplicados: item.cursosAplicados || [],
    planosAplicados: item.planosAplicados || [],
  };
}

export function CuponsForm() {
  const [initialCupons, setInitialCupons] = useState<ListItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        const data = await listCupons();
        const mapped = Array.isArray(data) ? data.map(mapFromBackend) : [];

        if (mounted) {
          setInitialCupons(mapped);
        }
      } catch (error) {
        console.error("Erro ao carregar cupons:", error);
        toastCustom.error("Não foi possível carregar os cupons de desconto");
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
          throw new Error("Código do cupom é obrigatório");
        }
        if (!data.description?.trim()) {
          throw new Error("Descrição é obrigatória");
        }

        const response = await createCupom({
          codigo: data.title,
          // descricao removido do formulário
          tipoDesconto: data.tipoDesconto || "PORCENTAGEM",
          valorPercentual: data.valorPercentual,
          valorFixo: data.valorFixo,
          aplicarEm: data.aplicarEm || "TODA_PLATAFORMA",
          aplicarEmTodosItens: data.aplicarEmTodosItens || false,
          cursosIds: data.cursosAplicados?.map((c: any) => c.cursoId) || [],
          // planosIds removido - cupons aplicam apenas em cursos
          limiteUsoTotalTipo: data.limiteUsoTotalTipo || "ILIMITADO",
          limiteUsoTotalQuantidade: data.limiteUsoTotalQuantidade,
          limitePorUsuarioTipo: data.limitePorUsuarioTipo || "ILIMITADO",
          limitePorUsuarioQuantidade: data.limitePorUsuarioQuantidade,
          periodoTipo: data.periodoTipo || "ILIMITADO",
          periodoInicio: data.periodoInicio,
          periodoFim: data.periodoFim,
          // ativo removido - sempre true por padrão
        });

        // Verificar se a resposta é um erro
        if ("success" in response && !response.success) {
          throw new Error(response.message || "Erro ao criar cupom");
        }

        const newItem = mapFromBackend(response as CupomDesconto);
        toastCustom.success(`Cupom "${data.title}" criado com sucesso`);

        return newItem;
      } catch (error) {
        console.error("Erro ao criar cupom:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao criar cupom";
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
          throw new Error("Código do cupom é obrigatório");
        }
        if (!updates.description?.trim()) {
          throw new Error("Descrição é obrigatória");
        }

        const response = await updateCupom(id, {
          codigo: updates.title,
          descricao: updates.description,
          tipoDesconto: updates.tipoDesconto,
          valorPercentual: updates.valorPercentual,
          valorFixo: updates.valorFixo,
          aplicarEm: updates.aplicarEm,
          aplicarEmTodosItens: updates.aplicarEmTodosItens,
          cursosIds: updates.cursosAplicados?.map((c: any) => c.cursoId),
          // planosIds removido - cupons aplicam apenas em cursos
          limiteUsoTotalTipo: updates.limiteUsoTotalTipo,
          limiteUsoTotalQuantidade: updates.limiteUsoTotalQuantidade,
          limitePorUsuarioTipo: updates.limitePorUsuarioTipo,
          limitePorUsuarioQuantidade: updates.limitePorUsuarioQuantidade,
          periodoTipo: updates.periodoTipo,
          periodoInicio: updates.periodoInicio,
          periodoFim: updates.periodoFim,
          ativo: updates.status,
        });

        // Verificar se a resposta é um erro
        if ("success" in response && !response.success) {
          throw new Error(response.message || "Erro ao atualizar cupom");
        }

        const updatedItem = mapFromBackend(response as CupomDesconto);
        toastCustom.success(`Cupom "${updates.title}" atualizado com sucesso`);

        return updatedItem;
      } catch (error) {
        console.error("Erro ao atualizar cupom:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao atualizar cupom";
        toastCustom.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteCupom(id);
      toastCustom.success("Cupom excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir cupom:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao excluir cupom";
      toastCustom.error(errorMessage);
      throw error;
    }
  }, []);

  // Renderizar item do cupom
  const renderItem = useCallback(
    (
      item: ListItem,
      onEdit: (item: ListItem) => void,
      onDelete: (id: string) => void,
      isDeleting?: boolean
    ) => {
      const cupom = mapToBackend(item);
      return (
        <CupomRow
          key={item.id}
          cupom={cupom}
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
      <CupomForm
        onSubmit={async (formData) => {
          // Mapear CupomFormData para ListItem
          const listItemData: Omit<ListItem, "id" | "createdAt"> = {
            title: formData.codigo,
            // description removido do formulário
            status: true, // Sempre ativo por padrão
            createdAt: new Date().toISOString(),
            tipoDesconto: formData.tipoDesconto,
            valorPercentual: formData.valorPercentual,
            valorFixo: formData.valorFixo,
            aplicarEm: "APENAS_CURSOS", // Fixo para cursos
            aplicarEmTodosItens: formData.aplicarEmTodosItens,
            cursosAplicados: formData.cursosIds.map((id: number) => ({
              cursoId: id,
              codigo: "",
              nome: "",
            })),
            // planosAplicados removido - cupons aplicam apenas em cursos
            limiteUsoTotalTipo: formData.limiteUsoTotalTipo,
            limiteUsoTotalQuantidade: formData.limiteUsoTotalQuantidade,
            limitePorUsuarioTipo: formData.limitePorUsuarioTipo,
            limitePorUsuarioQuantidade: formData.limitePorUsuarioQuantidade,
            periodoTipo: formData.periodoTipo,
            periodoInicio: formData.periodoInicio,
            periodoFim: formData.periodoFim,
            usosTotais: 0,
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
      <CupomForm
        cupom={mapToBackend(item)}
        onSubmit={async (formData) => {
          // Mapear CupomFormData para Partial<ListItem>
          const listItemData: Partial<ListItem> = {
            title: formData.codigo,
            // description removido do formulário
            status: true, // Sempre ativo por padrão
            tipoDesconto: formData.tipoDesconto,
            valorPercentual: formData.valorPercentual,
            valorFixo: formData.valorFixo,
            aplicarEm: "APENAS_CURSOS", // Fixo para cursos
            aplicarEmTodosItens: formData.aplicarEmTodosItens,
            cursosAplicados: formData.cursosIds.map((id: number) => ({
              cursoId: id,
              codigo: "",
              nome: "",
            })),
            // planosAplicados removido - cupons aplicam apenas em cursos
            limiteUsoTotalTipo: formData.limiteUsoTotalTipo,
            limiteUsoTotalQuantidade: formData.limiteUsoTotalQuantidade,
            limitePorUsuarioTipo: formData.limitePorUsuarioTipo,
            limitePorUsuarioQuantidade: formData.limitePorUsuarioQuantidade,
            periodoTipo: formData.periodoTipo,
            periodoInicio: formData.periodoInicio,
            periodoFim: formData.periodoFim,
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
      initialItems={initialCupons}
      entityName="cupom de desconto"
      entityNamePlural="Cupons de Desconto"
      maxItems={50}
      onCreateItem={handleCreate}
      onUpdateItem={handleUpdate}
      onDeleteItem={handleDelete}
      renderItem={renderItem}
      renderCreateForm={renderCreateForm}
      renderEditForm={renderEditForm}
      modalCreateTitle="Criar novo cupom de desconto"
      modalEditTitle="Editar cupom de desconto"
      emptyStateTitle="Nenhum cupom de desconto encontrado"
      emptyStateFirstItemText="Comece criando seu primeiro cupom de desconto."
      createButtonText="Novo cupom"
      tableColumns={[
        {
          key: "codigo",
          label: "Código do Cupom",
          className: "min-w-[150px] max-w-[200px]",
        },
        // Coluna de descrição removida
        {
          key: "tipoDesconto",
          label: "Tipo de Desconto",
          className: "min-w-[120px] max-w-[150px]",
        },
        {
          key: "aplicarEm",
          label: "Aplicar em",
          className: "min-w-[120px] max-w-[150px]",
        },
        {
          key: "usosTotais",
          label: "Usos Totais",
          className: "min-w-[100px] max-w-[120px]",
        },
        {
          key: "ativo",
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
