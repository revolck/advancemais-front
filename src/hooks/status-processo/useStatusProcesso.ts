import { useState, useCallback } from "react";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  listStatusProcesso,
  getStatusProcesso,
  createStatusProcesso,
  updateStatusProcesso,
  deleteStatusProcesso,
  checkStatusProcessoUsage,
  validateStatusProcessoNome,
  validateDefaultStatus,
} from "@/api/status-processo";
import type {
  StatusProcesso,
  CreateStatusProcessoInput,
  UpdateStatusProcessoInput,
  StatusProcessoFilters,
  StatusProcessoListResponse,
  PaginationInfo,
} from "@/api/status-processo/types";

interface UseStatusProcessoState {
  statusProcessos: StatusProcesso[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
}

interface UseStatusProcessoActions {
  list: (filters?: StatusProcessoFilters) => Promise<void>;
  get: (id: string) => Promise<StatusProcesso | null>;
  create: (data: CreateStatusProcessoInput) => Promise<StatusProcesso | null>;
  update: (
    id: string,
    data: UpdateStatusProcessoInput
  ) => Promise<StatusProcesso | null>;
  remove: (id: string) => Promise<boolean>;
  reorder: (id: string, novaOrdem: number) => Promise<boolean>;
  checkUsage: (id: string) => Promise<boolean>;
  validateNome: (nome: string, excludeId?: string) => Promise<boolean>;
  validateDefault: (isDefault: boolean, excludeId?: string) => Promise<boolean>;
  clearError: () => void;
}

export const useStatusProcesso = (): UseStatusProcessoState &
  UseStatusProcessoActions => {
  const [state, setState] = useState<UseStatusProcessoState>({
    statusProcessos: [],
    pagination: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const list = useCallback(
    async (filters: StatusProcessoFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response: StatusProcessoListResponse = await listStatusProcesso(
          filters
        );

        if (response.success) {
          setState((prev) => ({
            ...prev,
            statusProcessos: response.data.statusProcessos,
            pagination: response.data.pagination,
          }));
        } else {
          throw new Error("Erro ao carregar status de processos");
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erro ao carregar status de processos";
        setError(errorMessage);
        toastCustom.error(errorMessage);
        console.error("Erro ao listar status de processos:", error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const get = useCallback(
    async (id: string): Promise<StatusProcesso | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await getStatusProcesso(id);

        if (response.success) {
          return response.data;
        } else {
          throw new Error("Erro ao carregar status de processo");
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erro ao carregar status de processo";
        setError(errorMessage);
        toastCustom.error(errorMessage);
        console.error("Erro ao obter status de processo:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const create = useCallback(
    async (data: CreateStatusProcessoInput): Promise<StatusProcesso | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await createStatusProcesso(data);

        if (response.success) {
          const newStatus = response.data;
          setState((prev) => ({
            ...prev,
            statusProcessos: [...prev.statusProcessos, newStatus],
          }));
          toastCustom.success(`Status "${newStatus.nome}" criado com sucesso`);
          return newStatus;
        } else {
          throw new Error("Erro ao criar status de processo");
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erro ao criar status de processo";
        setError(errorMessage);
        toastCustom.error(errorMessage);
        console.error("Erro ao criar status de processo:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const update = useCallback(
    async (
      id: string,
      data: UpdateStatusProcessoInput
    ): Promise<StatusProcesso | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await updateStatusProcesso(id, data);

        if (response.success) {
          const updatedStatus = response.data;
          setState((prev) => ({
            ...prev,
            statusProcessos: prev.statusProcessos.map((status) =>
              status.id === id ? updatedStatus : status
            ),
          }));
          toastCustom.success(
            `Status "${updatedStatus.nome}" atualizado com sucesso`
          );
          return updatedStatus;
        } else {
          throw new Error("Erro ao atualizar status de processo");
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erro ao atualizar status de processo";
        setError(errorMessage);
        toastCustom.error(errorMessage);
        console.error("Erro ao atualizar status de processo:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response = await deleteStatusProcesso(id);

        if (response.success) {
          setState((prev) => ({
            ...prev,
            statusProcessos: prev.statusProcessos.filter(
              (status) => status.id !== id
            ),
          }));
          toastCustom.success("Status excluído com sucesso");
          return true;
        } else {
          throw new Error("Erro ao excluir status de processo");
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erro ao excluir status de processo";
        setError(errorMessage);
        toastCustom.error(errorMessage);
        console.error("Erro ao excluir status de processo:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const reorder = useCallback(async () => {
    // Reordenação desativada; manter assinatura para compatibilidade
    toastCustom.info("Reordenação não é mais necessária");
    return true;
  }, []);

  const checkUsage = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await checkStatusProcessoUsage(id);
      return response.success ? response.data.isUsed : false;
    } catch (error) {
      console.error("Erro ao verificar uso do status:", error);
      return false;
    }
  }, []);

  const validateNome = useCallback(
    async (nome: string, excludeId?: string): Promise<boolean> => {
      try {
        const result = await validateStatusProcessoNome(nome, excludeId);
        return result.isValid;
      } catch (error) {
        console.error("Erro ao validar nome:", error);
        return false;
      }
    },
    []
  );

  const validateDefault = useCallback(
    async (isDefault: boolean, excludeId?: string): Promise<boolean> => {
      try {
        const result = await validateDefaultStatus(isDefault, excludeId);
        return result.isValid;
      } catch (error) {
        console.error("Erro ao validar status padrão:", error);
        return false;
      }
    },
    []
  );

  return {
    ...state,
    list,
    get,
    create,
    update,
    remove,
    reorder,
    checkUsage,
    validateNome,
    validateDefault,
    clearError,
  };
};
