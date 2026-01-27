import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { cursosRoutes } from "./routes";
import type {
  CursosModuleMeta,
  CursosListParams,
  CursosListResponse,
  CreateCursoPayload,
  UpdateCursoPayload,
  Curso,
  CreateTurmaPayload,
  CursoTurma,
  CursoModulo,
  TurmaInscricao,
  CreateInscricaoPayload,
  TurmaProva,
  CreateProvaPayload,
  UpdateProvaPayload,
  TurmaCertificado,
  TurmaEstagio,
  CreateCertificadoPayload,
  AlunoComInscricao,
  ListAlunosComInscricaoParams,
  ListAlunosComInscricaoResponse,
  CursoAlunoDetalhes,
  CursoAlunoDetalhesResponse,
  VisaoGeralResponse,
  ListInscricoesCursoParams,
  ListInscricoesCursoResponse,
  ListCursoAuditoriaParams,
  ListCursoAuditoriaResponse,
  ProvaToken,
  CreateProvaTokenPayload,
  ListProvaTokensParams,
  ListProvaTokensResponse,
  ProvaTokenResponse,
  CreateEstagioPayload,
} from "./types";

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
    ...(auth ? getAuthHeader() : {}),
    ...normalizeHeaders(additional),
  };
}

function normalizeMoneyValue(value: unknown): number {
  if (value == null) return 0;

  if (typeof value === "object") {
    const maybeDecimal = (value as any)?.$numberDecimal;
    if (typeof maybeDecimal === "string") {
      value = maybeDecimal;
    }
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") return 0;

  const raw = value.trim();
  if (!raw) return 0;

  const filtered = raw.replace(/[^\d.,-]/g, "");
  const lastComma = filtered.lastIndexOf(",");
  const lastDot = filtered.lastIndexOf(".");

  let normalized = filtered;

  if (lastComma !== -1 && lastDot !== -1) {
    // Usa o separador mais à direita como decimal e remove o outro como milhar
    if (lastComma > lastDot) {
      normalized = filtered.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = filtered.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    // Apenas vírgula presente: padrão pt-BR
    normalized = filtered.replace(/\./g, "").replace(",", ".");
  } else {
    // Apenas ponto ou nenhum separador: padrão en-US ou inteiro
    normalized = filtered.replace(/,/g, "");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getCursosMeta(
  init?: RequestInit
): Promise<CursosModuleMeta> {
  return apiFetch<CursosModuleMeta>(cursosRoutes.meta(), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function listCursos(
  params?: CursosListParams,
  init?: RequestInit
): Promise<CursosListResponse> {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;

      // Trata statusPadrao como array ou string
      if (k === "statusPadrao" && Array.isArray(v)) {
        sp.set(k, v.join(","));
      } else {
        sp.set(k, String(v));
      }
    });
  }
  const url = sp.toString()
    ? `${cursosRoutes.cursos.list()}?${sp.toString()}`
    : cursosRoutes.cursos.list();

  const response = await apiFetch<CursosListResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "short", // Usa cache de 5 minutos para lista de cursos
    retries: 1, // Reduz retries para listagens
  });

  // Mapeia os campos de precificação para garantir valores padrão
  const cursosNormalizados: Curso[] = (response.data ?? []).map((curso) => ({
    ...curso,
    valor: normalizeMoneyValue((curso as any).valor ?? (curso as any).preco),
    valorPromocional:
      (curso as any).valorPromocional != null || (curso as any).precoPromocional != null
        ? normalizeMoneyValue(
            (curso as any).valorPromocional ?? (curso as any).precoPromocional
          ) || undefined
        : undefined,
    gratuito: Boolean(curso.gratuito ?? false),
  }));

  return {
    ...response,
    data: cursosNormalizados,
  };
}

function buildCursoRequest(payload: CreateCursoPayload | UpdateCursoPayload): {
  body: BodyInit;
  headers: Record<string, string>;
} {
  const baseHeaders = {
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
  };

  // Como não há arquivo (apenas imagemUrl como string), envia como JSON
  const jsonPayload: Record<string, unknown> = {};

  // Campos obrigatórios - sempre envia (API valida)
  if ("nome" in payload) {
    jsonPayload.nome =
      payload.nome !== undefined && payload.nome !== null
        ? String(payload.nome).trim()
        : "";
  }
  if ("descricao" in payload) {
    jsonPayload.descricao =
      payload.descricao !== undefined && payload.descricao !== null
        ? String(payload.descricao).trim()
        : "";
  }
  if ("cargaHoraria" in payload) {
    // Garante que cargaHoraria seja um número válido
    if (payload.cargaHoraria !== undefined && payload.cargaHoraria !== null) {
      const cargaHoraria =
        typeof payload.cargaHoraria === "number"
          ? payload.cargaHoraria
          : Number(payload.cargaHoraria);
      // Sempre envia, mesmo que inválido (API valida)
      jsonPayload.cargaHoraria = Number.isFinite(cargaHoraria)
        ? cargaHoraria
        : 0;
    } else {
      jsonPayload.cargaHoraria = 0;
    }
  }
  if ("categoriaId" in payload) {
    if (payload.categoriaId !== undefined && payload.categoriaId !== null) {
      const categoriaId =
        typeof payload.categoriaId === "number"
          ? payload.categoriaId
          : Number(payload.categoriaId);
      jsonPayload.categoriaId = categoriaId;
    }
  }
  if ("statusPadrao" in payload) {
    jsonPayload.statusPadrao =
      payload.statusPadrao !== undefined && payload.statusPadrao !== null
        ? payload.statusPadrao
        : "PUBLICADO";
  }

  // Campos opcionais - só adiciona se tiver valor válido
  if (
    "subcategoriaId" in payload &&
    payload.subcategoriaId !== undefined &&
    payload.subcategoriaId !== null
  ) {
    const subcategoriaId =
      typeof payload.subcategoriaId === "number"
        ? payload.subcategoriaId
        : Number(payload.subcategoriaId);
    jsonPayload.subcategoriaId = subcategoriaId;
  }
  if (
    "estagioObrigatorio" in payload &&
    payload.estagioObrigatorio !== undefined
  ) {
    jsonPayload.estagioObrigatorio = payload.estagioObrigatorio;
  }
  // imagemUrl: sempre envia se estiver presente no payload e tiver valor válido
  if (
    "imagemUrl" in payload &&
    payload.imagemUrl !== undefined &&
    payload.imagemUrl !== null
  ) {
    const trimmedUrl = String(payload.imagemUrl).trim();
    if (trimmedUrl !== "") {
      jsonPayload.imagemUrl = trimmedUrl;
    }
    // Se for string vazia após trim, não inclui no JSON (API não atualiza o campo)
  }

  // ========== CAMPOS DE PRECIFICAÇÃO (adicionados em 10/12/2025) ==========

  // valor: obrigatório (exceto se gratuito)
  if ("valor" in payload && payload.valor !== undefined) {
    const valor =
      typeof payload.valor === "number" ? payload.valor : Number(payload.valor);
    jsonPayload.valor = Number.isFinite(valor) ? valor : 0;
  }

  // valorPromocional: opcional
  if (
    "valorPromocional" in payload &&
    payload.valorPromocional !== undefined &&
    payload.valorPromocional !== null
  ) {
    const valorPromocional =
      typeof payload.valorPromocional === "number"
        ? payload.valorPromocional
        : Number(payload.valorPromocional);
    if (Number.isFinite(valorPromocional) && valorPromocional > 0) {
      jsonPayload.valorPromocional = valorPromocional;
    }
  }

  // Nota: Campos removidos por serem redundantes ou gerenciados pelo Mercado Pago:
  // - descontoPercentual (redundante com valorPromocional)
  // - aceitaPagamentoUnico, aceitaParcelamento, maxParcelas (Mercado Pago)
  // - disponivel (redundante com statusPadrao: "PUBLICADO" = disponível)

  // gratuito: opcional (padrão: false)
  if ("gratuito" in payload && payload.gratuito !== undefined) {
    jsonPayload.gratuito = Boolean(payload.gratuito);
  }

  // ========== FIM CAMPOS DE PRECIFICAÇÃO ==========

  // Debug em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.log("[buildCursoRequest] JSON sendo enviado:", jsonPayload);
    console.log("[buildCursoRequest] Payload original:", payload);
    console.log(
      "[buildCursoRequest] imagemUrl no payload original:",
      payload.imagemUrl
    );
    console.log(
      "[buildCursoRequest] imagemUrl no JSON final:",
      jsonPayload.imagemUrl
    );
    console.log(
      "[buildCursoRequest] JSON stringificado:",
      JSON.stringify(jsonPayload)
    );
  }

  return {
    body: JSON.stringify(jsonPayload),
    headers: { "Content-Type": "application/json", ...baseHeaders },
  };
}

export async function createCurso(
  payload: CreateCursoPayload,
  init?: RequestInit
): Promise<Curso> {
  const { body, headers } = buildCursoRequest(payload);

  try {
    return await apiFetch<Curso>(cursosRoutes.cursos.create(), {
      init: {
        method: "POST",
        body,
        headers: { ...headers, ...normalizeHeaders(init?.headers) },
        ...init,
      },
      cache: "no-cache",
    });
  } catch (error: any) {
    // Melhora a mensagem de erro para 400 (Bad Request)
    if (error?.status === 400) {
      const details = error?.details;
      let errorMessage = "Dados inválidos para criação do curso";

      // Se houver detalhes de validação, tenta extrair mensagens mais específicas
      if (details) {
        if (typeof details === "string") {
          errorMessage = details;
        } else if (details.message) {
          errorMessage = details.message;
        } else if (details.errors && Array.isArray(details.errors)) {
          const validationErrors = details.errors
            .map((err: any) => err.message || err.path)
            .filter(Boolean)
            .join(", ");
          if (validationErrors) {
            errorMessage = `Erros de validação: ${validationErrors}`;
          }
        } else if (details.issues && typeof details.issues === "object") {
          const issues = Object.entries(details.issues)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          if (issues) {
            errorMessage = `Erros de validação: ${issues}`;
          }
        }
      }

      const enhancedError = new Error(errorMessage) as Error & {
        status?: number;
        details?: any;
      };
      enhancedError.status = 400;
      enhancedError.details = details;
      throw enhancedError;
    }

    throw error;
  }
}

/**
 * Normaliza uma turma da API para garantir que todos os campos opcionais estejam corretos
 */
function normalizeTurma(turma: any): CursoTurma {
  return {
    id: String(turma.id ?? ""),
    codigo: String(turma.codigo ?? ""),
    nome: String(turma.nome ?? ""),
    turno: turma.turno ?? "MANHA",
    metodo: turma.metodo ?? "ONLINE",
    status: turma.status,
    vagasTotais:
      turma.vagasTotais != null ? Number(turma.vagasTotais) : undefined,
    vagasDisponiveis:
      turma.vagasDisponiveis != null
        ? Number(turma.vagasDisponiveis)
        : undefined,
    // Novos campos calculados (pode vir como string ou number)
    inscricoesCount:
      turma.inscricoesCount != null ? Number(turma.inscricoesCount) : undefined,
    vagasOcupadas:
      turma.vagasOcupadas != null ? Number(turma.vagasOcupadas) : undefined,
    vagasDisponiveisCalculadas:
      turma.vagasDisponiveisCalculadas != null
        ? Number(turma.vagasDisponiveisCalculadas)
        : undefined,
    dataInicio: turma.dataInicio,
    dataFim: turma.dataFim,
    dataInscricaoInicio: turma.dataInscricaoInicio,
    dataInscricaoFim: turma.dataInscricaoFim,
    instrutor: turma.instrutor
      ? {
          id: String(turma.instrutor.id ?? ""),
          nome: turma.instrutor.nome,
          email: turma.instrutor.email,
          codUsuario: turma.instrutor.codUsuario,
        }
      : undefined,
  };
}

export async function getCursoById(
  cursoId: number | string,
  init?: RequestInit
): Promise<Curso & { turmas?: CursoTurma[]; turmasCount?: number }> {
  try {
    const response = await apiFetch<any>(cursosRoutes.cursos.get(cursoId), {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    });

    // Normaliza o curso e suas turmas se existirem
    const curso: Curso & { turmas?: CursoTurma[]; turmasCount?: number } = {
      id: String(response.id ?? ""),
      nome: String(response.nome ?? ""),
      codigo: String(response.codigo ?? ""),
      descricao: String(response.descricao ?? ""),
      cargaHoraria: Number(response.cargaHoraria ?? 0),
      categoriaId: Number(response.categoriaId ?? 0),
      statusPadrao: response.statusPadrao ?? "RASCUNHO",
      criadoEm: String(response.criadoEm ?? ""),
      atualizadoEm: String(response.atualizadoEm ?? ""),
      imagemUrl: response.imagemUrl,
      subcategoriaId:
        response.subcategoriaId != null
          ? Number(response.subcategoriaId)
          : undefined,
      // Campos de precificação
      valor: normalizeMoneyValue(response.valor ?? (response as any).preco),
      valorPromocional:
        response.valorPromocional != null || (response as any).precoPromocional != null
          ? normalizeMoneyValue(
              response.valorPromocional ?? (response as any).precoPromocional
            ) || undefined
          : undefined,
      gratuito: Boolean(response.gratuito ?? false),
      // Nota: Métodos de pagamento são gerenciados pelo Mercado Pago
      // Nota: Disponibilidade é definida por statusPadrao ("PUBLICADO" = disponível)
    };

    // Normaliza turmas se existirem
    if (response.turmas && Array.isArray(response.turmas)) {
      const normalizedTurmas = response.turmas.map(normalizeTurma);
      curso.turmas = normalizedTurmas;
      curso.turmasCount = response.turmasCount ?? normalizedTurmas.length;
    } else if (response.turmasCount != null) {
      curso.turmasCount = Number(response.turmasCount);
    }

    // Preserva campos adicionais que podem vir da API (categoria, subcategoria, etc)
    if (response.categoria) {
      (curso as any).categoria = response.categoria;
    }
    if (response.subcategoria) {
      (curso as any).subcategoria = response.subcategoria;
    }

    return curso;
  } catch (error) {
    // Se o erro for de parsing, fornece mais contexto
    if (
      error instanceof SyntaxError ||
      (error as any)?.message?.includes("JSON")
    ) {
      console.error("Erro ao parsear resposta do curso:", {
        cursoId,
        error,
        message: "A resposta da API pode estar em formato inválido",
      });
      throw new Error(
        "Erro ao processar resposta da API. Verifique se a API está retornando dados válidos."
      );
    }
    throw error;
  }
}

export async function updateCurso(
  cursoId: number | string,
  payload: UpdateCursoPayload,
  init?: RequestInit
): Promise<Curso> {
  const { body, headers } = buildCursoRequest(payload);
  return apiFetch<Curso>(cursosRoutes.cursos.update(cursoId), {
    init: {
      method: "PUT",
      body,
      headers: { ...headers, ...normalizeHeaders(init?.headers) },
      ...init,
    },
    cache: "no-cache",
  });
}

export async function despublicarCurso(
  cursoId: number | string,
  init?: RequestInit
): Promise<void> {
  return apiFetch<void>(cursosRoutes.cursos.delete(cursoId), {
    init: {
      method: "DELETE",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

// Turmas
export async function listTurmas(
  cursoId: number | string,
  init?: RequestInit
): Promise<CursoTurma[]> {
  const url = cursosRoutes.cursos.turmas.list(cursoId);
  const res = await apiFetch<any>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  // Normaliza: pode vir array direto ou objeto { data: [...] }
  const turmas: CursoTurma[] = Array.isArray(res)
    ? (res as CursoTurma[])
    : Array.isArray(res?.data)
    ? (res.data as CursoTurma[])
    : [];

  return turmas;
}

export async function getTurmaById(
  cursoId: number | string,
  turmaId: string,
  init?: RequestInit
): Promise<CursoTurma> {
  try {
    const response = await apiFetch<any>(
      cursosRoutes.cursos.turmas.get(cursoId, turmaId),
      {
        init: {
          method: "GET",
          ...init,
          headers: buildHeaders(init?.headers, true),
        },
        cache: "no-cache",
      }
    );

    // Normaliza a turma usando a mesma função de normalização
    return normalizeTurma(response);
  } catch (error) {
    // Preserva o status HTTP do erro se existir
    const apiError = error as { status?: number; message?: string };
    const status = apiError?.status;

    // Se o erro for de parsing, fornece mais contexto
    if (
      error instanceof SyntaxError ||
      (error as any)?.message?.includes("JSON")
    ) {
      console.error("Erro ao parsear resposta da turma:", {
        cursoId,
        turmaId,
        error,
        status,
        message: "A resposta da API pode estar em formato inválido",
      });
      const parsingError = new Error(
        "Erro ao processar resposta da API. Verifique se a API está retornando dados válidos."
      ) as Error & { status?: number };
      if (status) parsingError.status = status;
      throw parsingError;
    }

    // Preserva o status HTTP no erro
    if (status && !apiError.status) {
      (error as any).status = status;
    }

    throw error;
  }
}

export async function createTurma(
  cursoId: number | string,
  payload: CreateTurmaPayload,
  init?: RequestInit
): Promise<CursoTurma> {
  return apiFetch<CursoTurma>(cursosRoutes.cursos.turmas.create(cursoId), {
    init: {
      method: "POST",
      headers: buildHeaders(
        { "Content-Type": "application/json", ...init?.headers },
        true
      ),
      body: JSON.stringify(payload),
      ...init,
    },
    cache: "no-cache",
  });
}

// Inscrições
export async function listInscricoes(
  cursoId: number | string,
  turmaId: string,
  init?: RequestInit
): Promise<TurmaInscricao[]> {
  try {
    // A API pode retornar {success: true, count: X, data: [...]} ou diretamente o array
    const result = await apiFetch<
      | TurmaInscricao[]
      | { success?: boolean; count?: number; data?: TurmaInscricao[] }
    >(cursosRoutes.cursos.turmas.inscricoes.list(cursoId, turmaId), {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
      silence404: true, // Silencia 404 pois pode não existir endpoint ou não haver inscrições
    });

    // Log detalhado para depuração
    if (process.env.NODE_ENV === "development") {
      console.log("📋 Resposta bruta da API de inscrições:", {
        cursoId,
        turmaId,
        result,
        isArray: Array.isArray(result),
        hasData: result && typeof result === "object" && "data" in result,
      });
    }

    // Extrai o array de dados da resposta
    let inscricoes: TurmaInscricao[] = [];

    if (Array.isArray(result)) {
      // Se a resposta já é um array, usa diretamente
      inscricoes = result;
    } else if (result && typeof result === "object" && "data" in result) {
      // Se a resposta é um objeto com campo `data`, extrai o array
      const responseData = result as {
        success?: boolean;
        count?: number;
        data?: TurmaInscricao[];
      };
      inscricoes = Array.isArray(responseData.data) ? responseData.data : [];
    } else {
      // Fallback: tenta usar o resultado como array ou retorna vazio
      inscricoes = [];
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Inscrições extraídas:", {
        cursoId,
        turmaId,
        count: inscricoes.length,
        inscricoes,
      });
    }

    return inscricoes;
  } catch (error) {
    const apiError = error as { status?: number; message?: string };
    // Se for 404, assume que não há inscrições (retorna array vazio)
    // Isso pode acontecer se o endpoint não existe ou se não há inscrições
    if (apiError?.status === 404) {
      console.warn(
        `Endpoint de inscrições não encontrado ou turma sem inscrições: ${cursoId}/${turmaId}`
      );
      return [];
    }

    // Log detalhado para outros erros (para depuração)
    if (process.env.NODE_ENV === "development") {
      console.error("Erro ao buscar inscrições:", {
        cursoId,
        turmaId,
        status: apiError?.status,
        message: apiError?.message,
        error,
      });
    }

    // Para outros erros, relança
    throw error;
  }
}

export async function createInscricao(
  cursoId: number | string,
  turmaId: string,
  payload: CreateInscricaoPayload,
  init?: RequestInit
): Promise<TurmaInscricao> {
  return apiFetch<TurmaInscricao>(
    cursosRoutes.cursos.turmas.inscricoes.create(cursoId, turmaId),
    {
      init: {
        method: "POST",
        headers: buildHeaders(
          { "Content-Type": "application/json", ...init?.headers },
          true
        ),
        body: JSON.stringify(payload),
        ...init,
      },
      cache: "no-cache",
    }
  );
}

export async function deleteInscricao(
  cursoId: number | string,
  turmaId: string,
  alunoId: string,
  init?: RequestInit
): Promise<void> {
  return apiFetch<void>(
    cursosRoutes.cursos.turmas.inscricoes.delete(cursoId, turmaId, alunoId),
    {
      init: {
        method: "DELETE",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

// Histórico de Inscrições por Curso
export async function listInscricoesCurso(
  cursoId: number | string,
  params?: ListInscricoesCursoParams,
  init?: RequestInit
): Promise<ListInscricoesCursoResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.append("pageSize", String(params.pageSize));
  }
  if (params?.status) {
    const statusArray = Array.isArray(params.status)
      ? params.status
      : [params.status];
    searchParams.append("status", statusArray.join(","));
  }
  if (params?.turmaId) {
    const turmaIdValue = Array.isArray(params.turmaId)
      ? params.turmaId.join(",")
      : params.turmaId;
    searchParams.append("turmaId", turmaIdValue);
  }
  if (params?.search) {
    searchParams.append("search", params.search);
  }
  if (params?.cidade) {
    if (Array.isArray(params.cidade)) {
      params.cidade.forEach((cidade) => searchParams.append("cidade", cidade));
    } else {
      searchParams.append("cidade", params.cidade);
    }
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `${cursosRoutes.cursos.inscricoes.list(cursoId)}?${queryString}`
    : cursosRoutes.cursos.inscricoes.list(cursoId);

  return apiFetch<ListInscricoesCursoResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

// Auditoria de Cursos
export async function listCursoAuditoria(
  cursoId: number | string,
  params?: ListCursoAuditoriaParams,
  init?: RequestInit
): Promise<ListCursoAuditoriaResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.append("pageSize", String(params.pageSize));
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `${cursosRoutes.cursos.auditoria.list(cursoId)}?${queryString}`
    : cursosRoutes.cursos.auditoria.list(cursoId);

  return apiFetch<ListCursoAuditoriaResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

// Provas
export async function listProvas(
  cursoId: number | string,
  turmaId: string,
  init?: RequestInit
): Promise<TurmaProva[]> {
  return apiFetch<TurmaProva[]>(
    cursosRoutes.cursos.turmas.provas.list(cursoId, turmaId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

export async function getProvaById(
  cursoId: number | string,
  turmaId: string,
  provaId: string,
  init?: RequestInit
): Promise<TurmaProva> {
  return apiFetch<TurmaProva>(
    cursosRoutes.cursos.turmas.provas.get(cursoId, turmaId, provaId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

export async function createProva(
  cursoId: number | string,
  turmaId: string,
  payload: CreateProvaPayload,
  init?: RequestInit
): Promise<TurmaProva> {
  const response = await apiFetch<any>(
    cursosRoutes.cursos.turmas.provas.create(cursoId, turmaId),
    {
      init: {
        method: "POST",
        headers: buildHeaders(
          { "Content-Type": "application/json", ...init?.headers },
          true
        ),
        body: JSON.stringify(payload),
        ...init,
      },
      cache: "no-cache",
    }
  );

  // Suporta diferentes formatos de resposta (compat/legado)
  if (response && typeof response === "object") {
    if ("data" in response) return (response as any).data as TurmaProva;
    if ("prova" in response) return (response as any).prova as TurmaProva;
    if ("success" in response && "data" in response) {
      return (response as any).data as TurmaProva;
    }
  }

  if (!response) {
    throw new Error("Resposta vazia ao criar prova/atividade.");
  }

  return response as TurmaProva;
}

export async function updateProva(
  cursoId: number | string,
  turmaId: string,
  provaId: string,
  payload: UpdateProvaPayload,
  init?: RequestInit
): Promise<TurmaProva> {
  return apiFetch<TurmaProva>(
    cursosRoutes.cursos.turmas.provas.update(cursoId, turmaId, provaId),
    {
      init: {
        method: "PUT",
        headers: buildHeaders(
          { "Content-Type": "application/json", ...init?.headers },
          true
        ),
        body: JSON.stringify(payload),
        ...init,
      },
      cache: "no-cache",
    }
  );
}

export async function deleteProva(
  cursoId: number | string,
  turmaId: string,
  provaId: string,
  init?: RequestInit
): Promise<void> {
  return apiFetch<void>(
    cursosRoutes.cursos.turmas.provas.delete(cursoId, turmaId, provaId),
    {
      init: {
        method: "DELETE",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

// Tokens Únicos de Provas/Atividades
export async function listProvaTokens(
  cursoId: number | string,
  turmaId: string,
  provaId: string,
  params?: ListProvaTokensParams,
  init?: RequestInit
): Promise<ListProvaTokensResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.pageSize) queryParams.set("pageSize", String(params.pageSize));
  if (params?.inscricaoId) queryParams.set("inscricaoId", params.inscricaoId);
  if (params?.respondido !== undefined)
    queryParams.set("respondido", String(params.respondido));

  const url = cursosRoutes.cursos.turmas.provas.tokens.list(
    cursoId,
    turmaId,
    provaId
  );
  const fullUrl = queryParams.toString()
    ? `${url}?${queryParams.toString()}`
    : url;

  return apiFetch<ListProvaTokensResponse>(fullUrl, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function createProvaToken(
  cursoId: number | string,
  turmaId: string,
  provaId: string,
  payload: CreateProvaTokenPayload,
  init?: RequestInit
): Promise<ProvaTokenResponse> {
  return apiFetch<ProvaTokenResponse>(
    cursosRoutes.cursos.turmas.provas.tokens.create(cursoId, turmaId, provaId),
    {
      init: {
        method: "POST",
        headers: buildHeaders(
          { "Content-Type": "application/json", ...init?.headers },
          true
        ),
        body: JSON.stringify(payload),
        ...init,
      },
      cache: "no-cache",
    }
  );
}

export async function getProvaTokenById(
  cursoId: number | string,
  turmaId: string,
  provaId: string,
  tokenId: string,
  init?: RequestInit
): Promise<ProvaTokenResponse> {
  return apiFetch<ProvaTokenResponse>(
    cursosRoutes.cursos.turmas.provas.tokens.get(
      cursoId,
      turmaId,
      provaId,
      tokenId
    ),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

export async function getProvaTokenByToken(
  token: string,
  init?: RequestInit
): Promise<ProvaTokenResponse> {
  return apiFetch<ProvaTokenResponse>(
    cursosRoutes.cursos.turmas.provas.tokens.getByToken(token),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

// Módulos
export async function listModulos(
  cursoId: number | string,
  turmaId: string,
  init?: RequestInit
): Promise<CursoModulo[]> {
  try {
    const res = await apiFetch<any>(
      cursosRoutes.cursos.turmas.modulos.list(cursoId, turmaId),
      {
        init: {
          method: "GET",
          ...init,
          headers: buildHeaders(init?.headers, true),
        },
        cache: "no-cache",
        silence404: true, // Pode não existir módulos
      }
    );

    // Normaliza: pode vir array direto ou objeto { data: [...] }
    const modulos: CursoModulo[] = Array.isArray(res)
      ? (res as CursoModulo[])
      : Array.isArray(res?.data)
      ? (res.data as CursoModulo[])
      : [];

    return modulos;
  } catch (error: any) {
    // Se for 404, retorna array vazio (turma pode não ter módulos)
    if (error?.status === 404) {
      return [];
    }
    throw error;
  }
}

// Certificados
export async function listCertificados(
  cursoId: number | string,
  turmaId: string,
  init?: RequestInit
): Promise<TurmaCertificado[]> {
  return apiFetch<TurmaCertificado[]>(
    cursosRoutes.cursos.turmas.certificados.list(cursoId, turmaId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );
}

export async function createCertificado(
  cursoId: number | string,
  turmaId: string,
  payload: CreateCertificadoPayload,
  init?: RequestInit
): Promise<TurmaCertificado> {
  return apiFetch<TurmaCertificado>(
    cursosRoutes.cursos.turmas.certificados.create(cursoId, turmaId),
    {
      init: {
        method: "POST",
        headers: buildHeaders(
          { "Content-Type": "application/json", ...init?.headers },
          true
        ),
        body: JSON.stringify(payload),
        ...init,
      },
      cache: "no-cache",
    }
  );
}

export async function createEstagio(
  cursoId: number | string,
  turmaId: string,
  inscricaoId: string,
  payload: CreateEstagioPayload,
  init?: RequestInit
): Promise<TurmaEstagio> {
  return apiFetch<TurmaEstagio>(
    cursosRoutes.cursos.turmas.admin.inscricoes.estagios.create(
      cursoId,
      turmaId,
      inscricaoId
    ),
    {
      init: {
        method: "POST",
        headers: buildHeaders(
          { "Content-Type": "application/json", ...init?.headers },
          true
        ),
        body: JSON.stringify(payload),
        ...init,
      },
      cache: "no-cache",
    }
  );
}

// Admin - Alunos com inscrições
export async function listAlunosComInscricao(
  params?: ListAlunosComInscricaoParams,
  init?: RequestInit
): Promise<ListAlunosComInscricaoResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));

  // Suporte para múltiplos status
  if (params?.status) {
    if (Array.isArray(params.status)) {
      params.status.forEach((status) => queryParams.append("status", status));
    } else {
      queryParams.set("status", params.status);
    }
  }

  if (params?.search) queryParams.set("search", params.search);

  // Suporte para múltiplos cursoIds
  if (params?.cursoId) {
    if (Array.isArray(params.cursoId)) {
      params.cursoId.forEach((id) => queryParams.append("cursoId", id));
    } else {
      queryParams.set("cursoId", params.cursoId);
    }
  }

  // Suporte para múltiplos turmaIds
  if (params?.turmaId) {
    if (Array.isArray(params.turmaId)) {
      params.turmaId.forEach((id) => queryParams.append("turmaId", id));
    } else {
      queryParams.set("turmaId", params.turmaId);
    }
  }

  // Suporte para múltiplas cidades
  if (params?.cidade) {
    if (Array.isArray(params.cidade)) {
      params.cidade.forEach((cidade) => queryParams.append("cidade", cidade));
    } else {
      queryParams.set("cidade", params.cidade);
    }
  }

  const url = cursosRoutes.admin.alunos.list();
  const fullUrl = queryParams.toString()
    ? `${url}?${queryParams.toString()}`
    : url;

  try {
    const response = await apiFetch<ListAlunosComInscricaoResponse>(fullUrl, {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
      retries: 1, // Reduz retries para listagens (são requisições rápidas)
    });

    const raw: any = response as any;
    const rawPagination: any = raw?.pagination ?? {};

    const page = Number(rawPagination?.page ?? params?.page ?? 1);
    const pageSize = Number(
      rawPagination?.pageSize ?? rawPagination?.limit ?? params?.limit ?? 50
    );
    const total = Number(rawPagination?.total ?? 0);
    const inferredTotalPages =
      total > 0 ? Math.ceil(total / Math.max(1, pageSize)) : 1;
    const totalPages = Math.max(
      1,
      Number(rawPagination?.totalPages ?? rawPagination?.pages ?? inferredTotalPages)
    );

    const data = Array.isArray(raw?.data)
      ? (raw.data as AlunoComInscricao[])
      : Array.isArray(raw?.alunos)
      ? (raw.alunos as AlunoComInscricao[])
      : [];

    // Mapeamento/normalização da resposta
    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  } catch (error: any) {
    // Não loga AbortError (requisição cancelada intencionalmente)
    if (error?.name !== "AbortError" && !error?.message?.includes("aborted")) {
      console.error("🚨 Erro na API listAlunosComInscricao:", {
        message: error.message,
        status: error.status,
        stack: error.stack,
        fullError: error,
      });
    }
    throw error;
  }
}

export async function getCursoAlunoDetalhes(
  alunoId: string,
  init?: RequestInit
): Promise<CursoAlunoDetalhesResponse> {
  // Preferir as rotas unificadas do módulo de Cursos
  const url = cursosRoutes.alunos.get(alunoId);
  const response = await apiFetch<any>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const raw: any = response;
  const rawData: any = raw?.data;
  if (!rawData || typeof rawData !== "object") {
    return {
      success: Boolean(raw?.success ?? true),
      data: rawData,
    } as CursoAlunoDetalhesResponse;
  }

  const nomeFromApi =
    typeof rawData.nome === "string"
      ? rawData.nome
      : typeof rawData.nomeCompleto === "string"
      ? rawData.nomeCompleto
      : "";

  const normalizedData: CursoAlunoDetalhes = {
    ...rawData,
    nome: nomeFromApi.trim() || rawData.id || "—",
    email: typeof rawData.email === "string" ? rawData.email : "",
    codigo:
      typeof rawData.codigo === "string"
        ? rawData.codigo
        : typeof rawData.codUsuario === "string"
        ? rawData.codUsuario
        : undefined,
    enderecos: Array.isArray(rawData.enderecos) ? rawData.enderecos : [],
    inscricoes: Array.isArray(rawData.inscricoes)
      ? rawData.inscricoes.map((inscricao: any) => {
          const statusInscricao =
            typeof inscricao?.statusInscricao === "string"
              ? inscricao.statusInscricao
              : typeof inscricao?.status === "string"
              ? inscricao.status
              : undefined;

          const criadoEm =
            typeof inscricao?.criadoEm === "string"
              ? inscricao.criadoEm
              : typeof inscricao?.dataInscricao === "string"
              ? inscricao.dataInscricao
              : undefined;

          const turma = inscricao?.turma;
          const curso = inscricao?.curso;
          const progressoRaw = inscricao?.progresso;
          const progresso =
            typeof progressoRaw === "number"
              ? progressoRaw
              : typeof progressoRaw === "string"
              ? Number(progressoRaw)
              : undefined;

          return {
            ...inscricao,
            statusInscricao,
            criadoEm,
            progresso:
              typeof progresso === "number" && Number.isFinite(progresso)
                ? progresso
                : inscricao?.progresso,
            turma:
              turma && typeof turma === "object"
                ? turma
                : undefined,
            curso:
              curso && typeof curso === "object"
                ? curso
                : undefined,
          };
        })
      : [],
    totalInscricoes:
      typeof rawData.totalInscricoes === "number"
        ? rawData.totalInscricoes
        : Array.isArray(rawData.inscricoes)
        ? rawData.inscricoes.length
        : 0,
    criadoEm: typeof rawData.criadoEm === "string" ? rawData.criadoEm : "",
  };

  return {
    success: Boolean(raw?.success ?? true),
    data: normalizedData,
  };
}

export async function getVisaoGeral(
  init?: RequestInit
): Promise<VisaoGeralResponse> {
  return apiFetch<VisaoGeralResponse>(cursosRoutes.visaoGeral(), {
    init: {
      headers: buildHeaders(init?.headers, true),
      ...init,
    },
    cache: "medium", // Cache de 30 minutos para melhorar performance
    timeout: 60000, // Timeout de 60 segundos (maior que o padrão de 15s)
    retries: 2, // Reduz retries para evitar espera desnecessária
  });
}

export interface GetVisaoGeralFaturamentoParams {
  period?: "day" | "week" | "month" | "year" | "custom";
  startDate?: string; // YYYY-MM-DD (obrigatório quando period=custom)
  endDate?: string; // YYYY-MM-DD (obrigatório quando period=custom)
  tz?: string; // default backend: America/Sao_Paulo
  top?: number; // 1..50 (default backend: 10)
}

export async function getVisaoGeralFaturamento(
  params?: GetVisaoGeralFaturamentoParams,
  init?: RequestInit
): Promise<import("./types").VisaoGeralFaturamentoTendenciasResponse> {
  const sp = new URLSearchParams();
  const period = params?.period ?? "month";
  if (period) sp.set("period", period);
  if (params?.startDate) sp.set("startDate", params.startDate);
  if (params?.endDate) sp.set("endDate", params.endDate);
  if (params?.tz) sp.set("tz", params.tz);
  if (typeof params?.top === "number") sp.set("top", String(params.top));

  const url = sp.toString()
    ? `${cursosRoutes.visaoGeralFaturamento()}?${sp.toString()}`
    : cursosRoutes.visaoGeralFaturamento();

  return apiFetch<import("./types").VisaoGeralFaturamentoTendenciasResponse>(
    url,
    {
      init: {
        headers: buildHeaders(init?.headers, true),
        ...init,
      },
      cache: "short",
      timeout: 60000,
      retries: 1,
    }
  );
}

export async function updateCursoAluno(
  alunoId: string,
  payload: Partial<CursoAlunoDetalhes>,
  init?: RequestInit
): Promise<CursoAlunoDetalhesResponse> {
  const url = cursosRoutes.alunos.update(alunoId);
  return apiFetch<CursoAlunoDetalhesResponse>(url, {
    init: {
      method: "PUT",
      ...init,
      headers: buildHeaders(
        { "Content-Type": "application/json", ...(init?.headers || {}) },
        true
      ),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

// ===================================
// META DO CURSO (API v3)
// ===================================

export async function getCursoMeta(
  cursoId: string | number,
  init?: RequestInit
): Promise<import("./types").CursoMeta> {
  const response = await apiFetch<{ success: boolean; data: import("./types").CursoMeta }>(
    cursosRoutes.cursos.meta(cursoId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "short",
    }
  );
  return response.data;
}

// ===================================
// FREQUÊNCIA (API v3)
// ===================================

export async function listFrequencias(
  cursoId: string | number,
  turmaId: string,
  params?: import("./types").ListFrequenciasParams,
  init?: RequestInit
): Promise<{ data: import("./types").Frequencia[]; pagination?: import("./types").Pagination }> {
  const sp = new URLSearchParams();
  if (params?.aulaId) sp.set("aulaId", params.aulaId);
  if (params?.inscricaoId) sp.set("inscricaoId", params.inscricaoId);
  if (params?.status) sp.set("status", params.status);
  if (params?.dataInicio) sp.set("dataInicio", params.dataInicio);
  if (params?.dataFim) sp.set("dataFim", params.dataFim);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.cursos.turmas.frequencias.list(cursoId, turmaId)}?${sp.toString()}`
    : cursosRoutes.cursos.turmas.frequencias.list(cursoId, turmaId);

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function getFrequenciaResumo(
  cursoId: string | number,
  turmaId: string,
  params?: import("./types").ListFrequenciaResumoParams,
  init?: RequestInit
): Promise<import("./types").FrequenciaResumoResponse> {
  const sp = new URLSearchParams();
  if (params?.periodo) sp.set("periodo", params.periodo);
  if (params?.anchorDate) sp.set("anchorDate", params.anchorDate);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.cursos.turmas.frequencias.resumo(cursoId, turmaId)}?${sp.toString()}`
    : cursosRoutes.cursos.turmas.frequencias.resumo(cursoId, turmaId);

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function createFrequencia(
  cursoId: string | number,
  turmaId: string,
  payload: import("./types").CreateFrequenciaPayload,
  init?: RequestInit
): Promise<import("./types").Frequencia> {
  const response = await apiFetch<{ success: boolean; data: import("./types").Frequencia }>(
    cursosRoutes.cursos.turmas.frequencias.create(cursoId, turmaId),
    {
      init: {
        method: "POST",
        ...init,
        headers: buildHeaders(
          { "Content-Type": "application/json", ...(init?.headers || {}) },
          true
        ),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

export async function updateFrequencia(
  cursoId: string | number,
  turmaId: string,
  frequenciaId: string,
  payload: import("./types").UpdateFrequenciaPayload,
  init?: RequestInit
): Promise<import("./types").Frequencia> {
  const response = await apiFetch<{ success: boolean; data: import("./types").Frequencia }>(
    cursosRoutes.cursos.turmas.frequencias.update(cursoId, turmaId, frequenciaId),
    {
      init: {
        method: "PUT",
        ...init,
        headers: buildHeaders(
          { "Content-Type": "application/json", ...(init?.headers || {}) },
          true
        ),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

// ===================================
// NOTAS (API v3)
// ===================================

export async function listNotas(
  cursoId: string | number,
  params: import("./types").ListNotasParams,
  init?: RequestInit
): Promise<import("./types").ListNotasResponse> {
  const sp = new URLSearchParams();
  sp.set("turmaIds", params.turmaIds);
  if (params.search) sp.set("search", params.search);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params.orderBy) sp.set("orderBy", params.orderBy);
  if (params.order) sp.set("order", params.order);

  const url = `${cursosRoutes.cursos.notas(cursoId)}?${sp.toString()}`;

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function createNota(
  cursoId: string | number,
  turmaId: string,
  payload: import("./types").CreateNotaPayload,
  init?: RequestInit
): Promise<import("./types").NotaLancamento> {
  const response = await apiFetch<{ success: boolean; data: import("./types").NotaLancamento }>(
    cursosRoutes.cursos.turmas.notas.create(cursoId, turmaId),
    {
      init: {
        method: "POST",
        ...init,
        headers: buildHeaders(
          { "Content-Type": "application/json", ...(init?.headers || {}) },
          true
        ),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

export async function deleteNotas(
  cursoId: string | number,
  turmaId: string,
  params: import("./types").DeleteNotasParams,
  init?: RequestInit
): Promise<void> {
  const sp = new URLSearchParams();
  sp.set("alunoId", params.alunoId);

  const url = `${cursosRoutes.cursos.turmas.notas.list(cursoId, turmaId)}?${sp.toString()}`;

  await apiFetch(url, {
    init: {
      method: "DELETE",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

// ===================================
// AVALIAÇÕES (API v3 - Biblioteca Global)
// ===================================

export async function listAvaliacoes(
  params?: import("./types").ListAvaliacoesParams,
  init?: RequestInit
): Promise<import("./types").ListAvaliacoesResponse> {
  const sp = new URLSearchParams();
  const setCsv = (key: string, value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      const items = value.map(String).filter(Boolean);
      if (items.length > 0) sp.set(key, items.join(","));
      return;
    }
    if (typeof value === "string" && value.trim()) {
      sp.set(key, value.trim());
      return;
    }
    sp.set(key, String(value));
  };

  // Busca
  if (params?.search) sp.set("search", params.search);
  if (params?.titulo) sp.set("titulo", params.titulo);

  // Curso/Turma/Instrutor
  if (params?.cursoId) sp.set("cursoId", params.cursoId);
  if (params?.curso) sp.set("curso", params.curso);
  if (params?.turmaId) sp.set("turmaId", params.turmaId);
  if (params?.turma) sp.set("turma", params.turma);
  if (params?.instrutorId) sp.set("instrutorId", params.instrutorId);
  if (params?.instrutor) sp.set("instrutor", params.instrutor);

  // Filtros
  if (params?.tipo) sp.set("tipo", params.tipo);
  if (params?.tipoAtividade) sp.set("tipoAtividade", params.tipoAtividade);
  if (params?.modalidade) setCsv("modalidade", params.modalidade);
  if (params?.status) setCsv("status", params.status);
  if (params?.obrigatoria !== undefined)
    sp.set("obrigatoria", String(params.obrigatoria));
  if (params?.semTurma !== undefined) sp.set("semTurma", String(params.semTurma));

  // Período
  if (params?.dataInicio) sp.set("dataInicio", params.dataInicio);
  if (params?.dataFim) sp.set("dataFim", params.dataFim);
  if (params?.periodoInicio) sp.set("periodoInicio", params.periodoInicio);
  if (params?.periodoFim) sp.set("periodoFim", params.periodoFim);
  if (params?.periodo) sp.set("periodo", params.periodo);

  // Paginação / ordenação
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.orderBy) sp.set("orderBy", params.orderBy);
  if (params?.order) sp.set("order", params.order);

  const url = sp.toString()
    ? `${cursosRoutes.avaliacoes.list()}?${sp.toString()}`
    : cursosRoutes.avaliacoes.list();

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    // Não cachear aqui: a listagem já é cacheada pelo React Query.
    // O cache interno do apiFetch pode deixar a lista desatualizada (até dar F5).
    cache: "no-cache",
  });
}

export async function getAvaliacao(
  avaliacaoId: string,
  init?: RequestInit
): Promise<import("./types").Avaliacao> {
  const response = await apiFetch<{ success: boolean; data: import("./types").Avaliacao }>(
    cursosRoutes.avaliacoes.get(avaliacaoId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "short",
    }
  );
  return response.data;
}

export async function createAvaliacao(
  payload: import("./types").CreateAvaliacaoPayload,
  init?: RequestInit
): Promise<import("./types").Avaliacao> {
  const response = await apiFetch<{ success: boolean; data: import("./types").Avaliacao }>(
    cursosRoutes.avaliacoes.create(),
    {
      init: {
        method: "POST",
        ...init,
        headers: buildHeaders(
          { "Content-Type": "application/json", ...(init?.headers || {}) },
          true
        ),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

export async function updateAvaliacao(
  avaliacaoId: string,
  payload: import("./types").UpdateAvaliacaoPayload,
  init?: RequestInit
): Promise<import("./types").Avaliacao> {
  const response = await apiFetch<{ success: boolean; data: import("./types").Avaliacao }>(
    cursosRoutes.avaliacoes.update(avaliacaoId),
    {
      init: {
        method: "PUT",
        ...init,
        headers: buildHeaders(
          { "Content-Type": "application/json", ...(init?.headers || {}) },
          true
        ),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

export async function deleteAvaliacao(
  avaliacaoId: string,
  init?: RequestInit
): Promise<void> {
  await apiFetch(cursosRoutes.avaliacoes.delete(avaliacaoId), {
    init: {
      method: "DELETE",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

// Helpers para formulário de avaliações
export interface AvaliacoesTurmaResponse {
  success: boolean;
  turmas: Array<{
    id: string;
    codigo: string;
    nome: string;
    cursoId: string;
    metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
    instrutorId: string | null;
    turno: string;
    status: string;
    dataInicio?: string;
    dataFim?: string;
    Cursos: {
      id: string;
      codigo: string;
      nome: string;
    };
    Usuarios: {
      id: string;
      nomeCompleto: string;
      email: string;
    } | null;
  }>;
  total: number;
}

export async function listAvaliacoesTurmas(
  cursoId?: string,
  init?: RequestInit
): Promise<AvaliacoesTurmaResponse> {
  const url = cursoId
    ? `${cursosRoutes.avaliacoes.turmas()}?cursoId=${cursoId}`
    : cursosRoutes.avaliacoes.turmas();
    
  return apiFetch<AvaliacoesTurmaResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "short",
  });
}

export interface AvaliacoesInstrutorResponse {
  success: boolean;
  instrutores: Array<{
    id: string;
    nomeCompleto: string;
    email: string;
    cpf: string;
    telefone: string | null;
    avatarUrl: string | null;
  }>;
  total: number;
}

export async function listAvaliacoesInstrutores(
  init?: RequestInit
): Promise<AvaliacoesInstrutorResponse> {
  return apiFetch<AvaliacoesInstrutorResponse>(
    cursosRoutes.avaliacoes.instrutores(),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "short",
    }
  );
}

export async function cloneAvaliacaoParaTurma(
  cursoId: string | number,
  turmaId: string,
  avaliacaoId: string,
  init?: RequestInit
): Promise<import("./types").Avaliacao> {
  const response = await apiFetch<{ success: boolean; data: import("./types").Avaliacao }>(
    cursosRoutes.cursos.turmas.avaliacoes.clone(cursoId, turmaId),
    {
      init: {
        method: "POST",
        ...init,
        headers: buildHeaders(
          { "Content-Type": "application/json", ...(init?.headers || {}) },
          true
        ),
        body: JSON.stringify({ avaliacaoId }),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

// ===================================
// ESTÁGIOS (API v3 - Listagem Global e Status)
// ===================================

export async function listEstagiosGlobal(
  params?: import("./types").ListEstagiosParams,
  init?: RequestInit
): Promise<import("./types").ListEstagiosResponse> {
  const sp = new URLSearchParams();
  if (params?.cursoId) sp.set("cursoId", params.cursoId);
  if (params?.turmaId) sp.set("turmaId", params.turmaId);
  if (params?.status) sp.set("status", params.status);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.estagiosGlobal.list()}?${sp.toString()}`
    : cursosRoutes.estagiosGlobal.list();

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "short",
  });
}

export async function updateEstagioStatus(
  estagioId: string,
  payload: import("./types").UpdateEstagioStatusPayload,
  init?: RequestInit
): Promise<import("./types").Estagio> {
  const response = await apiFetch<{ success: boolean; data: import("./types").Estagio }>(
    cursosRoutes.estagiosGlobal.updateStatus(estagioId),
    {
      init: {
        method: "PATCH",
        ...init,
        headers: buildHeaders(
          { "Content-Type": "application/json", ...(init?.headers || {}) },
          true
        ),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
  return response.data;
}

// ===================================
// CHECKOUT (API v3)
// ===================================

export async function iniciarCheckout(
  payload: import("./types").CheckoutPayload,
  init?: RequestInit
): Promise<import("./types").CheckoutResponse> {
  return apiFetch(cursosRoutes.checkout.iniciar(), {
    init: {
      method: "POST",
      ...init,
      headers: buildHeaders(
        { "Content-Type": "application/json", ...(init?.headers || {}) },
        true
      ),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function getCheckoutPagamento(
  paymentId: string,
  init?: RequestInit
): Promise<{ success: boolean; data: import("./types").CheckoutPagamentoStatus }> {
  return apiFetch(cursosRoutes.checkout.pagamento(paymentId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function getVagasDisponiveis(
  cursoId: string | number,
  turmaId: string,
  init?: RequestInit
): Promise<{ success: boolean; data: import("./types").VagasDisponiveis }> {
  return apiFetch(cursosRoutes.cursos.turmas.vagas(cursoId, turmaId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "short",
  });
}

// ===================================
// AGENDA (API v3)
// ===================================

export async function listAgenda(
  params?: import("./types").ListAgendaParams,
  init?: RequestInit
): Promise<{ success: boolean; data: import("./types").AgendaEvento[] }> {
  const sp = new URLSearchParams();
  if (params?.dataInicio) sp.set("dataInicio", params.dataInicio);
  if (params?.dataFim) sp.set("dataFim", params.dataFim);
  if (params?.turmaId) sp.set("turmaId", params.turmaId);
  if (params?.tipo) sp.set("tipo", params.tipo);

  const url = sp.toString()
    ? `${cursosRoutes.agenda()}?${sp.toString()}`
    : cursosRoutes.agenda();

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "short",
  });
}

// ===================================
// CATEGORIAS (API v3)
// ===================================

export async function listCategorias(
  init?: RequestInit
): Promise<{ success: boolean; data: import("./types").Categoria[] }> {
  return apiFetch(cursosRoutes.categorias.list(), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, false), // Público
    },
    cache: "long",
  });
}

export async function getCategoria(
  categoriaId: string,
  init?: RequestInit
): Promise<{ success: boolean; data: import("./types").Categoria }> {
  return apiFetch(cursosRoutes.categorias.get(categoriaId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, false), // Público
    },
    cache: "long",
  });
}
