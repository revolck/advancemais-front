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
  TurmaInscricao,
  CreateInscricaoPayload,
  TurmaProva,
  TurmaCertificado,
  AlunoComInscricao,
  ListAlunosComInscricaoParams,
  ListAlunosComInscricaoResponse,
  CursoAlunoDetalhes,
  CursoAlunoDetalhesResponse,
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
  return apiFetch<CursosListResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "short", // Usa cache de 5 minutos para lista de cursos
    retries: 1, // Reduz retries para listagens
  });
}

export async function createCurso(
  payload: CreateCursoPayload,
  init?: RequestInit
): Promise<Curso> {
  return apiFetch<Curso>(cursosRoutes.cursos.create(), {
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
      id: Number(response.id),
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
  return apiFetch<Curso>(cursosRoutes.cursos.update(cursoId), {
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

// Admin - Alunos com inscrições
export async function listAlunosComInscricao(
  params?: ListAlunosComInscricaoParams,
  init?: RequestInit
): Promise<ListAlunosComInscricaoResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.status) queryParams.set("status", params.status);
  if (params?.search) queryParams.set("search", params.search);
  if (params?.cursoId) queryParams.set("cursoId", String(params.cursoId));
  if (params?.turmaId) queryParams.set("turmaId", params.turmaId);
  if (params?.cidade) queryParams.set("cidade", params.cidade);

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

    // Mapeamento da resposta
    return {
      data: response.data || [],
      pagination: {
        page: response.pagination?.page || 1,
        pageSize: response.pagination?.pageSize || 50,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
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
  return apiFetch<CursoAlunoDetalhesResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
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
