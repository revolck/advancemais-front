/**
 * API Client para Aulas
 */

import { apiFetch } from "../client";
import { apiConfig } from "@/lib/env";
import type {
  Aula,
  AulasListParams,
  AulasListResponse,
  CreateAulaPayload,
  UpdateAulaPayload,
  AulaProgresso,
  UpdateProgressoPayload,
  AulaPresenca,
  RegistrarPresencaPayload,
  AulaHistorico,
  AgendaListParams,
  AgendaListResponse,
  GoogleOAuthStatus,
  GoogleConnectResponse,
  CreateMaterialArquivoUrlPayload,
} from "./types";

const BASE_URL = "/api/v1/cursos/aulas";

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers as Record<string, string>;
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildHeaders(
  additional?: HeadersInit,
  auth = false
): Record<string, string> {
  return {
    Accept: apiConfig.headers.Accept,
    "Content-Type": "application/json",
    ...(auth ? getAuthHeader() : {}),
    ...normalizeHeaders(additional),
  };
}

/**
 * Listar aulas com filtros e paginação
 */
export async function listAulas(
  params?: AulasListParams,
  init?: RequestInit
): Promise<AulasListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params?.cursoId) searchParams.set("cursoId", params.cursoId);
  if (params?.turmaId) searchParams.set("turmaId", params.turmaId);
  if (params?.moduloId) searchParams.set("moduloId", params.moduloId);
  if (params?.instrutorId) searchParams.set("instrutorId", params.instrutorId);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.orderBy) searchParams.set("orderBy", params.orderBy);
  if (params?.order) searchParams.set("order", params.order);
  if (params?.obrigatoria !== undefined) {
    searchParams.set("obrigatoria", String(params.obrigatoria));
  }
  if (params?.dataInicio) searchParams.set("dataInicio", params.dataInicio);
  if (params?.dataFim) searchParams.set("dataFim", params.dataFim);

  // Modalidade pode ser array
  if (params?.modalidade) {
    const modalidades = Array.isArray(params.modalidade)
      ? params.modalidade
      : [params.modalidade];
    searchParams.set("modalidade", modalidades.join(","));
  }

  // Status pode ser array
  if (params?.status) {
    const statuses = Array.isArray(params.status)
      ? params.status
      : [params.status];
    searchParams.set("status", statuses.join(","));
  }

  const url = `${BASE_URL}?${searchParams.toString()}`;

  const response = await apiFetch<AulasListResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    // Não cachear aqui: a listagem já é cacheada pelo React Query.
    // O cache interno do apiFetch pode deixar a tela desatualizada após criar/editar (até dar F5).
    cache: "no-cache",
    retries: 1,
  });
  
  // Debug: Log da resposta (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    console.log("[API_AULAS] URL chamada:", url);
    console.log("[API_AULAS] Resposta completa:", {
      total: response.pagination?.total,
      totalPages: response.pagination?.totalPages,
      page: response.pagination?.page,
      pageSize: response.pagination?.pageSize,
      dataLength: response.data?.length,
    });
  }

  return response;
}

/**
 * Buscar aula por ID
 * @param aulaId - ID da aula
 * @param init - Opções de RequestInit
 * @param options - Opções adicionais como { noCache: true } para desabilitar cache
 */
export async function getAulaById(
  aulaId: string,
  init?: RequestInit,
  options?: { noCache?: boolean }
): Promise<Aula> {
  const response = await apiFetch<{ success: boolean; aula: Aula } | Aula>(
    `${BASE_URL}/${aulaId}`,
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      // Usar no-cache se solicitado, caso contrário usar short para performance
      cache: options?.noCache ? "no-cache" : "short",
      retries: 1,
    }
  );

  // A API retorna { success: true, aula: {...} }
  // Extrai o objeto aula do wrapper
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "aula" in response &&
    (response as { success: boolean; aula: Aula }).success
  ) {
    return (response as { success: boolean; aula: Aula }).aula;
  }

  // Fallback: se vier diretamente como Aula (compatibilidade)
  return response as Aula;
}

/**
 * Criar nova aula
 */
export async function createAula(
  payload: CreateAulaPayload,
  init?: RequestInit
): Promise<{ aula: Aula; meetUrl?: string }> {
  const response = await apiFetch<{ aula: Aula; meetUrl?: string }>(BASE_URL, {
    init: {
      method: "POST",
      body: JSON.stringify(payload),
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
  });

  return response;
}

/**
 * Atualizar aula
 */
export async function updateAula(
  aulaId: string,
  payload: UpdateAulaPayload,
  init?: RequestInit
): Promise<Aula> {
  // ✅ DEBUG: Log do payload que será enviado para a API
  if (process.env.NODE_ENV === "development") {
    console.log("[API_UPDATE_AULA] Payload que será enviado:", {
      aulaId,
      payload,
      payloadString: JSON.stringify(payload),
      hasTurmaId: "turmaId" in payload,
      turmaId: payload.turmaId,
      turmaIdType: typeof payload.turmaId,
      payloadKeys: Object.keys(payload),
    });
  }

  // ✅ GARANTIR que turmaId seja incluído se existe no payload
  // Criar uma cópia do payload para garantir que não seja modificado
  const finalPayload = { ...payload };
  
  // ✅ Se turmaId existe no payload original, garantir que está na cópia
  if ("turmaId" in payload && payload.turmaId) {
    (finalPayload as any).turmaId = payload.turmaId;
  }

  // ✅ DEBUG: Verificar payload final antes de enviar
  if (process.env.NODE_ENV === "development") {
    console.log("[API_UPDATE_AULA] Payload final antes de enviar:", {
      finalPayload,
      finalPayloadString: JSON.stringify(finalPayload),
      hasTurmaId: "turmaId" in finalPayload,
      turmaId: (finalPayload as any).turmaId,
      bodyString: JSON.stringify(finalPayload),
    });
  }

  const response = await apiFetch<{ success: boolean; aula: Aula } | Aula>(
    `${BASE_URL}/${aulaId}`,
    {
      init: {
        method: "PUT",
        body: JSON.stringify(finalPayload), // ✅ Usar finalPayload
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache", // Não cachear atualizações
    }
  );

  // A API pode retornar { success: true, aula: {...} }
  // Extrai o objeto aula do wrapper
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "aula" in response &&
    (response as { success: boolean; aula: Aula }).success
  ) {
    return (response as { success: boolean; aula: Aula }).aula;
  }

  // Fallback: se vier diretamente como Aula (compatibilidade)
  return response as Aula;
}

/**
 * Excluir aula (soft delete)
 */
export async function deleteAula(
  aulaId: string,
  init?: RequestInit
): Promise<void> {
  await apiFetch<void>(`${BASE_URL}/${aulaId}`, {
    init: {
      method: "DELETE",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
  });
}

/**
 * Publicar ou despublicar uma aula
 */
export async function publicarAula(
  aulaId: string,
  publicar: boolean,
  init?: RequestInit
): Promise<Aula> {
  const response = await apiFetch<{ success: boolean; aula: Aula } | Aula>(
    `${BASE_URL}/${aulaId}/publicar`,
    {
      init: {
        method: "PATCH",
        ...init,
        headers: buildHeaders(
          {
            "Content-Type": "application/json",
            ...init?.headers,
          },
          true
        ),
        body: JSON.stringify({ publicar }),
      },
      cache: "no-cache",
    }
  );

  // A API retorna { success: true, aula: {...} }
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "aula" in response &&
    (response as { success: boolean; aula: Aula }).success
  ) {
    return (response as { success: boolean; aula: Aula }).aula;
  }

  // Fallback: se vier diretamente como Aula
  return response as Aula;
}

/**
 * Buscar histórico de alterações da aula
 */
export async function getAulaHistorico(
  aulaId: string,
  init?: RequestInit
): Promise<AulaHistorico[]> {
  const response = await apiFetch<
    | { success: boolean; historico: AulaHistorico[] }
    | { historico: AulaHistorico[] }
  >(`${BASE_URL}/${aulaId}/historico`, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    // Não cachear aqui: a tela já é cacheada pelo React Query.
    // O cache interno do apiFetch pode deixar a aba de histórico desatualizada (até dar F5).
    cache: "no-cache",
  });

  // A API retorna { success: true, historico: [...] } ou diretamente { historico: [...] }
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "historico" in response
  ) {
    return (response as { success: boolean; historico: AulaHistorico[] })
      .historico;
  }

  // Fallback: se vier diretamente como { historico: [...] }
  if (response && typeof response === "object" && "historico" in response) {
    return (response as { historico: AulaHistorico[] }).historico;
  }

  // Fallback: se vier diretamente como array (compatibilidade)
  return Array.isArray(response) ? response : [];
}

/**
 * Buscar progresso dos alunos na aula
 */
export async function getAulaProgresso(
  aulaId: string,
  inscricaoId?: string,
  init?: RequestInit
): Promise<AulaProgresso[]> {
  const url = inscricaoId
    ? `${BASE_URL}/${aulaId}/progresso?inscricaoId=${inscricaoId}`
    : `${BASE_URL}/${aulaId}/progresso`;

  const response = await apiFetch<{ progressos: AulaProgresso[] }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "short",
  });

  return response.progressos;
}

/**
 * Atualizar progresso do aluno na aula
 */
export async function updateAulaProgresso(
  aulaId: string,
  payload: UpdateProgressoPayload,
  init?: RequestInit
): Promise<AulaProgresso> {
  const response = await apiFetch<AulaProgresso>(
    `${BASE_URL}/${aulaId}/progresso`,
    {
      init: {
        method: "POST",
        body: JSON.stringify(payload),
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
    }
  );

  return response;
}

/**
 * Listar presenças da aula
 */
export async function getAulaPresencas(
  aulaId: string,
  init?: RequestInit
): Promise<AulaPresenca[]> {
  const response = await apiFetch<{ presencas: AulaPresenca[] }>(
    `${BASE_URL}/${aulaId}/presenca`,
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "short",
    }
  );

  return response.presencas;
}

/**
 * Registrar entrada/saída na aula
 */
export async function registrarPresenca(
  aulaId: string,
  payload: RegistrarPresencaPayload,
  init?: RequestInit
): Promise<AulaPresenca> {
  const response = await apiFetch<AulaPresenca>(
    `${BASE_URL}/${aulaId}/presenca`,
    {
      init: {
        method: "POST",
        body: JSON.stringify(payload),
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
    }
  );

  return response;
}

/**
 * Buscar eventos da agenda
 */
export async function getAgenda(
  params: AgendaListParams,
  init?: RequestInit
): Promise<AgendaListResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("dataInicio", params.dataInicio);
  searchParams.set("dataFim", params.dataFim);
  if (params.tipos?.length) {
    searchParams.set("tipos", params.tipos.join(","));
  }

  const response = await apiFetch<AgendaListResponse>(
    `/api/v1/cursos/agenda?${searchParams.toString()}`,
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "short",
    }
  );

  return response;
}

/**
 * Verificar status da conexão Google
 */
export async function getGoogleOAuthStatus(
  init?: RequestInit
): Promise<GoogleOAuthStatus> {
  const response = await apiFetch<GoogleOAuthStatus>(
    "/api/v1/auth/google/status",
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "short",
    }
  );

  return response;
}

/**
 * Iniciar fluxo de conexão Google OAuth
 */
export async function connectGoogle(
  init?: RequestInit
): Promise<GoogleConnectResponse> {
  const response = await apiFetch<GoogleConnectResponse>(
    "/api/v1/auth/google/connect",
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
    }
  );

  return response;
}

/**
 * Desconectar conta Google
 */
export async function disconnectGoogle(init?: RequestInit): Promise<void> {
  await apiFetch<void>("/api/v1/auth/google/disconnect", {
    init: {
      method: "POST",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
  });
}

// =============================================================================
// MATERIAIS COMPLEMENTARES
// =============================================================================

import type {
  AulaMaterial,
  MateriaisListResponse,
  UpdateMaterialPayload,
  ReordenarMateriaisPayload,
  MaterialDownloadToken,
  MATERIAIS_CONFIG,
} from "./types";

/**
 * Listar materiais de uma aula
 */
export async function listMateriais(
  aulaId: string,
  init?: RequestInit
): Promise<MateriaisListResponse> {
  const response = await apiFetch<MateriaisListResponse>(
    `${BASE_URL}/${aulaId}/materiais`,
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      // Não cachear aqui: a tela já é cacheada pelo React Query.
      // O cache interno do apiFetch pode deixar a lista desatualizada após adicionar/remover (até dar F5).
      cache: "no-cache",
    }
  );

  return response;
}

/**
 * Criar material do tipo ARQUIVO (upload)
 */
export async function createMaterialArquivo(
  aulaId: string,
  file: File,
  titulo: string,
  descricao?: string,
  obrigatorio?: boolean,
  init?: RequestInit
): Promise<AulaMaterial> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("titulo", titulo);
  if (descricao) formData.append("descricao", descricao);
  if (obrigatorio !== undefined)
    formData.append("obrigatorio", String(obrigatorio));

  // Para upload, não usamos Content-Type (o browser define automaticamente)
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...getAuthHeader(),
  };

  const response = await apiFetch<AulaMaterial>(
    `${BASE_URL}/${aulaId}/materiais`,
    {
      init: {
        method: "POST",
        body: formData,
        ...init,
        headers,
      },
    }
  );

  return response;
}

/**
 * Criar material do tipo ARQUIVO via URL do blob storage.
 * Novo fluxo: primeiro upload para blob, depois enviar URL para API.
 */
export async function createMaterialArquivoFromUrl(
  aulaId: string,
  data: Omit<CreateMaterialArquivoUrlPayload, "tipo">,
  init?: RequestInit
): Promise<AulaMaterial> {
  const payload: CreateMaterialArquivoUrlPayload = {
    tipo: "ARQUIVO",
    ...data,
  };

  const response = await apiFetch<AulaMaterial>(
    `${BASE_URL}/${aulaId}/materiais`,
    {
      init: {
        method: "POST",
        body: JSON.stringify(payload),
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
    }
  );

  return response;
}

/**
 * Criar material do tipo LINK
 */
export async function createMaterialLink(
  aulaId: string,
  data: {
    titulo: string;
    linkUrl: string;
    descricao?: string;
    obrigatorio?: boolean;
  },
  init?: RequestInit
): Promise<AulaMaterial> {
  const response = await apiFetch<AulaMaterial>(
    `${BASE_URL}/${aulaId}/materiais`,
    {
      init: {
        method: "POST",
        body: JSON.stringify({ tipo: "LINK", ...data }),
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
    }
  );

  return response;
}

/**
 * Criar material do tipo TEXTO
 */
export async function createMaterialTexto(
  aulaId: string,
  data: {
    titulo: string;
    conteudoHtml: string;
    descricao?: string;
    obrigatorio?: boolean;
  },
  init?: RequestInit
): Promise<AulaMaterial> {
  const response = await apiFetch<AulaMaterial>(
    `${BASE_URL}/${aulaId}/materiais`,
    {
      init: {
        method: "POST",
        body: JSON.stringify({ tipo: "TEXTO", ...data }),
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
    }
  );

  return response;
}

/**
 * Atualizar material
 */
export async function updateMaterial(
  aulaId: string,
  materialId: string,
  payload: UpdateMaterialPayload,
  init?: RequestInit
): Promise<AulaMaterial> {
  const response = await apiFetch<AulaMaterial>(
    `${BASE_URL}/${aulaId}/materiais/${materialId}`,
    {
      init: {
        method: "PUT",
        body: JSON.stringify(payload),
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
    }
  );

  return response;
}

/**
 * Deletar material
 */
export async function deleteMaterial(
  aulaId: string,
  materialId: string,
  init?: RequestInit
): Promise<void> {
  await apiFetch<void>(`${BASE_URL}/${aulaId}/materiais/${materialId}`, {
    init: {
      method: "DELETE",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
  });
}

/**
 * Reordenar materiais
 */
export async function reordenarMateriais(
  aulaId: string,
  payload: ReordenarMateriaisPayload,
  init?: RequestInit
): Promise<void> {
  await apiFetch<void>(`${BASE_URL}/${aulaId}/materiais/reordenar`, {
    init: {
      method: "PATCH",
      body: JSON.stringify(payload),
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
  });
}

/**
 * Gerar token de download para material do tipo ARQUIVO
 */
export async function gerarTokenDownload(
  aulaId: string,
  materialId: string,
  init?: RequestInit
): Promise<MaterialDownloadToken> {
  const response = await apiFetch<MaterialDownloadToken>(
    `${BASE_URL}/${aulaId}/materiais/${materialId}/gerar-token`,
    {
      init: {
        method: "POST",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
    }
  );

  return response;
}

/**
 * Validar arquivo antes do upload
 */
export function validarArquivo(
  file: File,
  config: typeof MATERIAIS_CONFIG
): { valido: boolean; erro?: string } {
  // Validar tamanho
  if (file.size > config.MAX_TAMANHO_ARQUIVO) {
    return {
      valido: false,
      erro: `Arquivo excede o limite de ${
        config.MAX_TAMANHO_ARQUIVO / (1024 * 1024)
      }MB`,
    };
  }

  // Validar tipo MIME
  if (
    !config.TIPOS_PERMITIDOS.includes(
      file.type as (typeof config.TIPOS_PERMITIDOS)[number]
    )
  ) {
    return {
      valido: false,
      erro: "Tipo de arquivo não permitido",
    };
  }

  // Validar extensão
  const extensao = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (
    !config.EXTENSOES_PERMITIDAS.includes(
      extensao as (typeof config.EXTENSOES_PERMITIDAS)[number]
    )
  ) {
    return {
      valido: false,
      erro: "Extensão de arquivo não permitida",
    };
  }

  return { valido: true };
}

/**
 * Formatar tamanho de arquivo para exibição
 */
export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Obter ícone baseado no tipo MIME
 */
export function getIconePorMimeType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "📽️";
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return "📦";
  if (mimeType === "text/plain") return "📃";
  return "📎";
}
