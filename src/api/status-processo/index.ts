import { apiFetch } from "../client";
import { STATUS_PROCESSO_ROUTES } from "./routes";
import type {
  CreateStatusProcessoInput,
  UpdateStatusProcessoInput,
  StatusProcessoFilters,
  StatusProcessoListResponse,
  StatusProcessoResponse,
  StatusProcessoUsageResponse,
} from "./types";

/**
 * Lista status de processo com filtros e paginação
 */
export const listStatusProcesso = async (
  filters: StatusProcessoFilters = {}
): Promise<StatusProcessoListResponse> => {
  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page.toString());
  if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.ativo !== undefined)
    params.append("ativo", filters.ativo.toString());
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

  const queryString = params.toString();
  const url = queryString
    ? `${STATUS_PROCESSO_ROUTES.LIST}?${queryString}`
    : STATUS_PROCESSO_ROUTES.LIST;

  return await apiFetch<StatusProcessoListResponse>(url);
};

/**
 * Obtém um status de processo por ID
 */
export const getStatusProcesso = async (
  id: string
): Promise<StatusProcessoResponse> => {
  return await apiFetch<StatusProcessoResponse>(
    STATUS_PROCESSO_ROUTES.GET_BY_ID(id)
  );
};

/**
 * Cria um novo status de processo
 */
export const createStatusProcesso = async (
  data: CreateStatusProcessoInput
): Promise<StatusProcessoResponse> => {
  return await apiFetch<StatusProcessoResponse>(STATUS_PROCESSO_ROUTES.CREATE, {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });
};

/**
 * Atualiza um status de processo existente
 */
export const updateStatusProcesso = async (
  id: string,
  data: UpdateStatusProcessoInput
): Promise<StatusProcessoResponse> => {
  return await apiFetch<StatusProcessoResponse>(
    STATUS_PROCESSO_ROUTES.UPDATE(id),
    {
      init: {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    }
  );
};

// Reordenação removida (ordem não é mais utilizada)

/**
 * Exclui um status de processo
 */
export const deleteStatusProcesso = async (
  id: string
): Promise<{ success: boolean }> => {
  return await apiFetch<{ success: boolean }>(
    STATUS_PROCESSO_ROUTES.DELETE(id),
    {
      init: {
        method: "DELETE",
      },
    }
  );
};

/**
 * Verifica se um status está sendo usado
 */
export const checkStatusProcessoUsage = async (
  id: string
): Promise<StatusProcessoUsageResponse> => {
  return await apiFetch<StatusProcessoUsageResponse>(
    STATUS_PROCESSO_ROUTES.CHECK_USAGE(id)
  );
};

/**
 * Valida se um nome de status é único
 */
export const validateStatusProcessoNome = async (
  nome: string,
  excludeId?: string
): Promise<{ isValid: boolean; message?: string }> => {
  try {
    const filters: StatusProcessoFilters = { search: nome };
    const response = await listStatusProcesso(filters);

    const existingStatus = response.data.statusProcessos.find(
      (status) => status.nome === nome && status.id !== excludeId
    );

    return {
      isValid: !existingStatus,
      message: existingStatus ? "Nome já existe" : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      message: "Erro ao validar nome",
    };
  }
};

/**
 * Valida se pode definir como status padrão
 */
export const validateDefaultStatus = async (
  isDefault: boolean,
  excludeId?: string
): Promise<{ isValid: boolean; message?: string }> => {
  if (!isDefault) {
    return { isValid: true };
  }

  try {
    const response = await listStatusProcesso({});
    const existingDefault = response.data.statusProcessos.find(
      (status) => status.isDefault && status.id !== excludeId
    );

    return {
      isValid: !existingDefault,
      message: existingDefault ? "Já existe um status padrão" : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      message: "Erro ao validar status padrão",
    };
  }
};
