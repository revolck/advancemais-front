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
  VincularTemplatesAoCursoPayload,
  VincularTemplatesAoCursoResponse,
  CursoModulo,
  TurmaInscricao,
  CreateInscricaoPayload,
  TurmaProva,
  CreateProvaPayload,
  UpdateProvaPayload,
  TurmaCertificado,
  TurmaEstagio,
  CreateCertificadoPayload,
  ListCertificadosGlobalParams,
  ListCertificadosResponse,
  CertificadoModeloResumo,
  AlunoComInscricao,
  ListAlunosComInscricaoParams,
  ListAlunosComInscricaoResponse,
  CursoAlunoDetalhes,
  CursoAlunoDetalhesResponse,
  CursoAlunoEntrevistaOpcoesResponse,
  CursoAlunoCreateEntrevistaPayload,
  CursoAlunoCreateEntrevistaResponse,
  CursoAlunoEntrevistasParams,
  CursoAlunoEntrevistasResponse,
  VisaoGeralResponse,
  ListInscricoesCursoParams,
  ListInscricoesCursoResponse,
  ListTurmasParams,
  GetTurmaByIdParams,
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
  if ("conteudoProgramatico" in payload) {
    jsonPayload.conteudoProgramatico =
      payload.conteudoProgramatico !== undefined &&
      payload.conteudoProgramatico !== null
        ? String(payload.conteudoProgramatico)
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
    ...turma,
    id: String(turma.id ?? ""),
    codigo: String(turma.codigo ?? ""),
    nome: String(turma.nome ?? ""),
    turno: turma.turno ?? "MANHA",
    metodo: turma.metodo ?? "ONLINE",
    status: turma.status,
    publicacaoStatus: turma.publicacaoStatus ?? turma.statusPublicacao,
    publicado: typeof turma.publicado === "boolean" ? turma.publicado : undefined,
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
    criadoPorId: turma.criadoPorId,
    criadoEm: turma.criadoEm,
    editadoPorId: turma.editadoPorId,
    editadoEm: turma.editadoEm,
    estruturaTipo: turma.estruturaTipo,
    estrutura: turma.estrutura,
    aulas: Array.isArray(turma.aulas) ? turma.aulas : undefined,
    provas: Array.isArray(turma.provas) ? turma.provas : undefined,
    itens: Array.isArray(turma.itens) ? turma.itens : undefined,
    instrutores: Array.isArray(turma.instrutores) ? turma.instrutores : undefined,
    alunos: Array.isArray(turma.alunos) ? turma.alunos : undefined,
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
      conteudoProgramatico:
        response.conteudoProgramatico != null
          ? String(response.conteudoProgramatico)
          : null,
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

export async function excluirCursoDefinitivamente(
  cursoId: number | string,
  init?: RequestInit
): Promise<{ id: string; excluidoEm: string; excluidoPorId: string }> {
  return apiFetch<{ id: string; excluidoEm: string; excluidoPorId: string }>(
    cursosRoutes.cursos.deleteDefinitivo(cursoId),
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

// Turmas
export async function listTurmas(
  cursoId: number | string,
  options?: RequestInit & ListTurmasParams
): Promise<CursoTurma[]> {
  const { page, pageSize, ...init } = options ?? {};
  const hasExplicitPage = typeof page === "number" && Number.isFinite(page);
  const searchParams = new URLSearchParams();

  if (hasExplicitPage) {
    searchParams.append("page", String(page));
  }
  if (typeof pageSize === "number" && Number.isFinite(pageSize)) {
    searchParams.append("pageSize", String(pageSize));
  }

  const endpoint = cursosRoutes.cursos.turmas.list(cursoId);
  const queryString = searchParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

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

  // Mantém comportamento "lista completa" quando a API retorna paginação
  // e nenhum page explícito foi solicitado.
  if (
    !hasExplicitPage &&
    !Array.isArray(res) &&
    Number.isFinite(Number(res?.pagination?.totalPages)) &&
    Number(res.pagination.totalPages) > 1
  ) {
    const totalPages = Number(res.pagination.totalPages);
    const resolvedPageSize =
      Number.isFinite(Number(res?.pagination?.pageSize)) &&
      Number(res.pagination.pageSize) > 0
        ? Number(res.pagination.pageSize)
        : pageSize ?? 50;
    const FETCH_CONCURRENCY = 3;
    let allTurmas = [...turmas];

    for (
      let startPage = 2;
      startPage <= totalPages;
      startPage += FETCH_CONCURRENCY
    ) {
      const endPage = Math.min(startPage + FETCH_CONCURRENCY - 1, totalPages);
      const requests: Promise<any>[] = [];

      for (let nextPage = startPage; nextPage <= endPage; nextPage += 1) {
        const pageParams = new URLSearchParams();
        pageParams.append("page", String(nextPage));
        pageParams.append("pageSize", String(resolvedPageSize));
        const pageUrl = `${endpoint}?${pageParams.toString()}`;

        requests.push(
          apiFetch<any>(pageUrl, {
            init: {
              method: "GET",
              ...init,
              headers: buildHeaders(init?.headers, true),
            },
            cache: "no-cache",
          })
        );
      }

      const responses = await Promise.all(requests);
      responses.forEach((response) => {
        if (Array.isArray(response)) {
          allTurmas = allTurmas.concat(response as CursoTurma[]);
          return;
        }
        if (Array.isArray(response?.data)) {
          allTurmas = allTurmas.concat(response.data as CursoTurma[]);
        }
      });
    }

    return allTurmas;
  }

  return turmas;
}

export async function getTurmaById(
  cursoId: number | string,
  turmaId: string,
  options?: RequestInit & GetTurmaByIdParams
): Promise<CursoTurma> {
  const { includeAlunos, includeEstrutura, ...init } = options ?? {};
  const searchParams = new URLSearchParams();

  if (typeof includeAlunos === "boolean") {
    searchParams.append("includeAlunos", String(includeAlunos));
  }
  if (typeof includeEstrutura === "boolean") {
    searchParams.append("includeEstrutura", String(includeEstrutura));
  }

  const endpoint = cursosRoutes.cursos.turmas.get(cursoId, turmaId);
  const queryString = searchParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  try {
    const response = await apiFetch<any>(url, {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    });

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

/**
 * Publicar ou despublicar uma turma
 */
export async function publicarTurma(
  cursoId: number | string,
  turmaId: string,
  publicar: boolean,
  init?: RequestInit
): Promise<Partial<CursoTurma>> {
  const response = await apiFetch<any>(
    cursosRoutes.cursos.turmas.publicar(cursoId, turmaId),
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

  return response?.data ?? response?.turma ?? response?.result ?? response;
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

export async function deleteTurma(
  cursoId: number | string,
  turmaId: string,
  init?: RequestInit
): Promise<{ id: string; removidoEm?: string; removidoPorId?: string }> {
  const response = await apiFetch<any>(
    cursosRoutes.cursos.turmas.delete(cursoId, turmaId),
    {
      init: {
        method: "DELETE",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );

  return response?.data ?? response ?? { id: turmaId };
}

// Vínculo de templates ao curso (pré-requisito de turmas)
export async function vincularTemplatesAoCurso(
  payload: VincularTemplatesAoCursoPayload,
  init?: RequestInit
): Promise<VincularTemplatesAoCursoResponse> {
  return apiFetch<VincularTemplatesAoCursoResponse>(cursosRoutes.templates.vincular(), {
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...normalizeHeaders(init?.headers),
      },
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
  if (params?.statusPagamento) {
    const statusPagamentoArray = Array.isArray(params.statusPagamento)
      ? params.statusPagamento
      : [params.statusPagamento];
    searchParams.append("statusPagamento", statusPagamentoArray.join(","));
  }
  if (typeof params?.includeProgress === "boolean") {
    searchParams.append("includeProgress", String(params.includeProgress));
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

export async function listCertificadosGlobal(
  params?: ListCertificadosGlobalParams,
  init?: RequestInit
): Promise<ListCertificadosResponse> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.cursoId) sp.set("cursoId", params.cursoId);
  if (params?.turmaId) sp.set("turmaId", params.turmaId);
  if (params?.status) sp.set("status", params.status);
  if (params?.emitidoDe) sp.set("emitidoDe", params.emitidoDe);
  if (params?.emitidoA) sp.set("emitidoA", params.emitidoA);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortDir) sp.set("sortDir", params.sortDir);

  const url = sp.toString()
    ? `${cursosRoutes.certificados.list()}?${sp.toString()}`
    : cursosRoutes.certificados.list();

  const response = await apiFetch<{
    success?: boolean;
    data?:
      | TurmaCertificado[]
      | {
          items?: TurmaCertificado[];
          pagination?: import("./types").Pagination;
        };
    items?: TurmaCertificado[];
    pagination?: import("./types").Pagination;
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = ((response as any)?.data ?? response) as
    | TurmaCertificado[]
    | {
        items?: TurmaCertificado[];
        pagination?: import("./types").Pagination;
      }
    | undefined;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: response?.pagination,
    };
  }

  return {
    items: payload?.items ?? (response as any)?.items ?? [],
    pagination: payload?.pagination ?? response?.pagination,
  };
}

export async function createCertificadoGlobal(
  payload: CreateCertificadoPayload,
  init?: RequestInit
): Promise<TurmaCertificado> {
  const response = await apiFetch<{
    success?: boolean;
    data?: TurmaCertificado;
  }>(cursosRoutes.certificados.create(), {
    init: {
      method: "POST",
      headers: buildHeaders(
        { "Content-Type": "application/json", ...(init?.headers || {}) },
        true
      ),
      body: JSON.stringify(payload),
      ...init,
    },
    cache: "no-cache",
  });

  return (response?.data ?? response) as TurmaCertificado;
}

export async function getCertificadoById(
  certificadoId: string,
  init?: RequestInit
): Promise<TurmaCertificado> {
  const response = await apiFetch<{
    success?: boolean;
    data?: TurmaCertificado;
  }>(cursosRoutes.certificados.get(certificadoId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  return (response?.data ?? response) as TurmaCertificado;
}

export async function listMeCertificados(
  params?: Pick<
    ListCertificadosGlobalParams,
    "cursoId" | "turmaId" | "emitidoDe" | "emitidoA" | "page" | "pageSize"
  >,
  init?: RequestInit
): Promise<ListCertificadosResponse> {
  const sp = new URLSearchParams();
  if (params?.cursoId) sp.set("cursoId", params.cursoId);
  if (params?.turmaId) sp.set("turmaId", params.turmaId);
  if (params?.emitidoDe) sp.set("emitidoDe", params.emitidoDe);
  if (params?.emitidoA) sp.set("emitidoA", params.emitidoA);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.me.certificados()}?${sp.toString()}`
    : cursosRoutes.me.certificados();

  const response = await apiFetch<{
    success?: boolean;
    data?:
      | TurmaCertificado[]
      | {
          items?: TurmaCertificado[];
          pagination?: import("./types").Pagination;
        };
    items?: TurmaCertificado[];
    pagination?: import("./types").Pagination;
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = ((response as any)?.data ?? response) as
    | TurmaCertificado[]
    | {
        items?: TurmaCertificado[];
        pagination?: import("./types").Pagination;
      }
    | undefined;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: response?.pagination,
    };
  }

  return {
    items: payload?.items ?? (response as any)?.items ?? [],
    pagination: payload?.pagination ?? response?.pagination,
  };
}

export async function listCertificadoModelos(
  init?: RequestInit
): Promise<CertificadoModeloResumo[]> {
  const response = await apiFetch<{
    success?: boolean;
    data?:
      | CertificadoModeloResumo[]
      | {
          items?: CertificadoModeloResumo[];
        };
  }>(cursosRoutes.certificados.modelos(), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = response?.data as
    | CertificadoModeloResumo[]
    | { items?: CertificadoModeloResumo[] }
    | undefined;
  if (Array.isArray(payload)) return payload;
  return payload?.items ?? [];
}

export async function verificarCertificadoPorCodigo(
  codigo: string,
  init?: RequestInit
): Promise<import("./types").CertificadoVerificacao> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").CertificadoVerificacao;
  }>(cursosRoutes.certificados.verificarPorCodigo(codigo), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, false),
    },
    cache: "no-cache",
  });

  return (response?.data ?? response) as import("./types").CertificadoVerificacao;
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

export async function listEstagiosByInscricao(
  cursoId: number | string,
  turmaId: string,
  inscricaoId: string,
  init?: RequestInit
): Promise<TurmaEstagio[]> {
  const response = await apiFetch<{
    success?: boolean;
    data?: TurmaEstagio[] | { items?: TurmaEstagio[] };
    items?: TurmaEstagio[];
  }>(
    cursosRoutes.cursos.turmas.admin.inscricoes.estagios.list(
      cursoId,
      turmaId,
      inscricaoId
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

  const payload = response as any;
  if (Array.isArray(payload)) return payload as TurmaEstagio[];
  if (Array.isArray(payload?.data)) return payload.data as TurmaEstagio[];
  if (Array.isArray(payload?.data?.items))
    return payload.data.items as TurmaEstagio[];
  if (Array.isArray(payload?.items)) return payload.items as TurmaEstagio[];
  return [];
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
      cache: "short",
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
    cache: "short",
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
    curriculosResumo:
      rawData.curriculosResumo && typeof rawData.curriculosResumo === "object"
        ? {
            total:
              typeof rawData.curriculosResumo.total === "number"
                ? rawData.curriculosResumo.total
                : 0,
            principalId:
              typeof rawData.curriculosResumo.principalId === "string"
                ? rawData.curriculosResumo.principalId
                : rawData.curriculosResumo.principalId ?? null,
          }
        : {
            total: 0,
            principalId: null,
          },
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

export async function getCursoAlunoEntrevistas(
  alunoId: string,
  params?: CursoAlunoEntrevistasParams,
  init?: RequestInit
): Promise<CursoAlunoEntrevistasResponse> {
  const sp = new URLSearchParams();

  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.dataInicio) sp.set("dataInicio", params.dataInicio);
  if (params?.dataFim) sp.set("dataFim", params.dataFim);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortDir) sp.set("sortDir", params.sortDir);

  const statusEntrevista = Array.isArray(params?.statusEntrevista)
    ? params.statusEntrevista
    : params?.statusEntrevista
      ? [params.statusEntrevista]
      : [];
  if (statusEntrevista.length > 0) {
    sp.set("statusEntrevista", statusEntrevista.join(","));
  }

  const modalidades = Array.isArray(params?.modalidades)
    ? params.modalidades
    : params?.modalidades
      ? [params.modalidades]
      : [];
  if (modalidades.length > 0) {
    sp.set("modalidades", modalidades.join(","));
  }

  const url = sp.toString()
    ? `${cursosRoutes.alunos.entrevistas(alunoId)}?${sp.toString()}`
    : cursosRoutes.alunos.entrevistas(alunoId);

  const response = await apiFetch<any>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload =
    response?.data && typeof response.data === "object"
      ? response.data
      : response;
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const paginationRaw =
    payload?.pagination && typeof payload.pagination === "object"
      ? payload.pagination
      : {};

  return {
    items,
    pagination: {
      page:
        typeof paginationRaw.page === "number"
          ? paginationRaw.page
          : params?.page ?? 1,
      pageSize:
        typeof paginationRaw.pageSize === "number"
          ? paginationRaw.pageSize
          : params?.pageSize ?? items.length,
      total:
        typeof paginationRaw.total === "number"
          ? paginationRaw.total
          : items.length,
      totalPages:
        typeof paginationRaw.totalPages === "number"
          ? paginationRaw.totalPages
          : items.length > 0
            ? 1
            : 0,
    },
  };
}

function normalizeCursoAlunoEntrevistaEndereco(value: any) {
  if (!value || typeof value !== "object") return null;

  return {
    cep: value?.cep ?? null,
    logradouro: value?.logradouro ?? null,
    numero: value?.numero ?? null,
    complemento: value?.complemento ?? null,
    bairro: value?.bairro ?? null,
    cidade: value?.cidade ?? null,
    estado: value?.estado ?? null,
    pontoReferencia: value?.pontoReferencia ?? null,
  };
}

function normalizeCursoAlunoEntrevistaGoogle(value: any) {
  if (!value || typeof value !== "object") return null;

  return {
    connected:
      typeof value?.connected === "boolean" ? value.connected : undefined,
    expired: typeof value?.expired === "boolean" ? value.expired : undefined,
    calendarId: value?.calendarId ?? null,
    expiraEm: value?.expiraEm ?? null,
    connectEndpoint: value?.connectEndpoint ?? null,
    disconnectEndpoint: value?.disconnectEndpoint ?? null,
    statusEndpoint: value?.statusEndpoint ?? null,
  };
}

function normalizeCursoAlunoEntrevistaAgenda(value: any) {
  if (!value || typeof value !== "object") return null;

  return {
    eventoInternoId: value?.eventoInternoId ?? null,
    criadoNoSistema:
      typeof value?.criadoNoSistema === "boolean"
        ? value.criadoNoSistema
        : undefined,
    provider: value?.provider ?? null,
    organizerSource: value?.organizerSource ?? null,
    organizerUserId: value?.organizerUserId ?? null,
    organizerEmail: value?.organizerEmail ?? null,
  };
}

export async function getCursoAlunoEntrevistaOpcoes(
  alunoId: string,
  init?: RequestInit,
): Promise<CursoAlunoEntrevistaOpcoesResponse> {
  const response = await apiFetch<any>(cursosRoutes.alunos.entrevistasOpcoes(alunoId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload =
    response?.data && typeof response.data === "object"
      ? response.data
      : response;

  const items = Array.isArray(payload?.items)
    ? payload.items.map((item: any) => ({
        candidaturaId: String(item?.candidaturaId ?? ""),
        empresa: item?.empresa
          ? {
              id: String(item.empresa.id ?? ""),
              nomeExibicao: item.empresa.nomeExibicao ?? null,
              anonima:
                typeof item.empresa.anonima === "boolean"
                  ? item.empresa.anonima
                  : undefined,
              labelExibicao: item.empresa.labelExibicao ?? null,
            }
          : null,
        vaga: item?.vaga
          ? {
              id: String(item.vaga.id ?? ""),
              codigo: item.vaga.codigo ?? null,
              titulo: item.vaga.titulo ?? "Vaga",
              status: item.vaga.status ?? null,
            }
          : null,
        candidato: item?.candidato
          ? {
              id: String(item.candidato.id ?? ""),
              codigo: item.candidato.codigo ?? null,
              nome: item.candidato.nome ?? "Candidato",
            }
          : null,
        entrevistaAtiva: Boolean(item?.entrevistaAtiva),
        entrevistaAtivaId: item?.entrevistaAtivaId ?? null,
        empresaAnonima:
          typeof item?.empresaAnonima === "boolean"
            ? item.empresaAnonima
            : undefined,
        anonimatoBloqueado:
          typeof item?.anonimatoBloqueado === "boolean"
            ? item.anonimatoBloqueado
            : undefined,
        enderecoPadraoEntrevista: normalizeCursoAlunoEntrevistaEndereco(
          item?.enderecoPadraoEntrevista,
        ),
      }))
    : [];

  return {
    canCreate:
      typeof payload?.canCreate === "boolean" ? payload.canCreate : undefined,
    canCreateOnline:
      typeof payload?.canCreateOnline === "boolean"
        ? payload.canCreateOnline
        : undefined,
    canCreatePresencial:
      typeof payload?.canCreatePresencial === "boolean"
        ? payload.canCreatePresencial
        : undefined,
    requiresGoogleForOnline:
      typeof payload?.requiresGoogleForOnline === "boolean"
        ? payload.requiresGoogleForOnline
        : undefined,
    google: normalizeCursoAlunoEntrevistaGoogle(payload?.google),
    items,
  };
}

export async function createCursoAlunoEntrevista(
  alunoId: string,
  payload: CursoAlunoCreateEntrevistaPayload,
  init?: RequestInit,
): Promise<CursoAlunoCreateEntrevistaResponse> {
  const response = await apiFetch<any>(cursosRoutes.alunos.entrevistas(alunoId), {
    init: {
      method: "POST",
      ...init,
      headers: buildHeaders(
        {
          "Content-Type": apiConfig.headers["Content-Type"],
          ...normalizeHeaders(init?.headers),
        },
        true,
      ),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });

  const item = response?.data && typeof response.data === "object"
    ? response.data
    : response;

  return {
    id: String(item?.id ?? ""),
    candidaturaId: item?.candidaturaId ?? null,
    empresaAnonima:
      typeof item?.empresaAnonima === "boolean"
        ? item.empresaAnonima
        : undefined,
    statusEntrevista: item?.statusEntrevista ?? "AGENDADA",
    statusEntrevistaLabel:
      item?.statusEntrevistaLabel ?? item?.statusEntrevista ?? null,
    modalidade: item?.modalidade ?? null,
    modalidadeLabel: item?.modalidadeLabel ?? item?.modalidade ?? null,
    dataInicio: item?.dataInicio ?? item?.agendadaPara ?? null,
    dataFim: item?.dataFim ?? null,
    agendadaPara: item?.agendadaPara ?? item?.dataInicio ?? null,
    agendadaParaFormatada:
      item?.agendadaParaFormatada ?? item?.agendadaPara ?? null,
    descricao: item?.descricao ?? null,
    meetUrl: item?.meetUrl ?? null,
    local: item?.local ?? null,
    enderecoPresencial: normalizeCursoAlunoEntrevistaEndereco(
      item?.enderecoPresencial,
    ),
    agenda: normalizeCursoAlunoEntrevistaAgenda(item?.agenda),
    candidato: item?.candidato
      ? {
          id: String(item.candidato.id ?? ""),
          nome: item.candidato.nome ?? "Candidato",
          codigo: item.candidato.codigo ?? null,
        }
      : null,
    vaga: item?.vaga
      ? {
          id: String(item.vaga.id ?? ""),
          titulo: item.vaga.titulo ?? "Vaga",
          codigo: item.vaga.codigo ?? null,
        }
      : null,
    empresa: item?.empresa
      ? {
          id: String(item.empresa.id ?? ""),
          nomeExibicao: item.empresa.nomeExibicao ?? null,
          anonima:
            typeof item.empresa.anonima === "boolean"
              ? item.empresa.anonima
              : undefined,
          labelExibicao: item.empresa.labelExibicao ?? null,
        }
      : null,
    recrutador: item?.recrutador
      ? {
          id: String(item.recrutador.id ?? ""),
          nome: item.recrutador.nome ?? "Recrutador",
        }
      : null,
    criadoEm: item?.criadoEm ?? null,
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
    // Evita cache longo no cliente para aproveitar o cache curto e invalidável do backend.
    cache: "no-cache",
    timeout: 60000,
    retries: 1,
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
      // Usa sempre rede para respeitar filtros/período e delega cache ao backend.
      cache: "no-cache",
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
): Promise<import("./types").ListFrequenciasResponse> {
  const sp = buildListFrequenciasSearchParams(params);

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

export async function listFrequenciasGlobal(
  params?: import("./types").ListFrequenciasParams,
  init?: RequestInit
): Promise<import("./types").ListFrequenciasResponse> {
  const sp = buildListFrequenciasSearchParams(params);

  const url = sp.toString()
    ? `${cursosRoutes.cursos.frequenciasGlobal()}?${sp.toString()}`
    : cursosRoutes.cursos.frequenciasGlobal();

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function listFrequenciasByAluno(
  alunoId: string,
  params: import("./types").ListFrequenciasParams,
  init?: RequestInit
): Promise<import("./types").ListFrequenciasResponse> {
  const sp = buildListFrequenciasSearchParams(params);

  const url = sp.toString()
    ? `${cursosRoutes.alunos.frequencias.list(alunoId)}?${sp.toString()}`
    : cursosRoutes.alunos.frequencias.list(alunoId);

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

function buildListFrequenciasSearchParams(
  params?: import("./types").ListFrequenciasParams
) {
  const sp = new URLSearchParams();
  if (!params) return sp;

  if (params.cursoId) sp.set("cursoId", params.cursoId);
  if (params.turmaIds) sp.set("turmaIds", params.turmaIds);
  if (params.tipoOrigem) sp.set("tipoOrigem", params.tipoOrigem);
  if (params.origemId) sp.set("origemId", params.origemId);
  if (params.aulaId) sp.set("aulaId", params.aulaId);
  if (params.inscricaoId) sp.set("inscricaoId", params.inscricaoId);
  if (params.search) sp.set("search", params.search);
  if (params.status) sp.set("status", params.status);
  if (params.dataInicio) sp.set("dataInicio", params.dataInicio);
  if (params.dataFim) sp.set("dataFim", params.dataFim);
  if (params.orderBy) sp.set("orderBy", params.orderBy);
  if (params.order) sp.set("order", params.order);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));

  return sp;
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

export async function upsertFrequenciaLancamento(
  cursoId: string | number,
  turmaId: string,
  payload: import("./types").UpsertFrequenciaLancamentoPayload,
  init?: RequestInit
): Promise<import("./types").Frequencia> {
  const response = await apiFetch<{
    success: boolean;
    data: import("./types").Frequencia;
  }>(cursosRoutes.cursos.turmas.frequencias.lancamentos(cursoId, turmaId), {
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

  return response.data;
}

export async function upsertFrequenciaLancamentoByAluno(
  alunoId: string,
  payload: import("./types").UpsertFrequenciaLancamentoByAlunoPayload,
  init?: RequestInit
): Promise<import("./types").Frequencia> {
  const response = await apiFetch<{
    success: boolean;
    data: import("./types").Frequencia;
  }>(cursosRoutes.alunos.frequencias.lancamentos(alunoId), {
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

export async function listFrequenciaHistorico(
  cursoId: string | number,
  turmaId: string,
  frequenciaId: string,
  init?: RequestInit
): Promise<import("./types").FrequenciaHistoryEntry[]> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").FrequenciaHistoryEntry[];
    items?: import("./types").FrequenciaHistoryEntry[];
  }>(cursosRoutes.cursos.turmas.frequencias.historico(cursoId, turmaId, frequenciaId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  return (
    response.data ??
    response.items ??
    []
  );
}

export async function listFrequenciaHistoricoByNaturalKey(
  cursoId: string | number,
  turmaId: string,
  params: import("./types").ListFrequenciaHistoricoByNaturalKeyParams,
  init?: RequestInit
): Promise<import("./types").FrequenciaHistoryEntry[]> {
  const sp = new URLSearchParams();
  sp.set("inscricaoId", params.inscricaoId);
  sp.set("tipoOrigem", params.tipoOrigem);
  sp.set("origemId", params.origemId);
  const url = `${cursosRoutes.cursos.turmas.frequencias.historicoByNaturalKey(cursoId, turmaId)}?${sp.toString()}`;

  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").FrequenciaHistoryEntry[];
    items?: import("./types").FrequenciaHistoryEntry[];
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  return (
    response.data ??
    response.items ??
    []
  );
}

export async function listFrequenciaHistoricoByAluno(
  alunoId: string,
  frequenciaId: string,
  init?: RequestInit
): Promise<import("./types").FrequenciaHistoryEntry[]> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").FrequenciaHistoryEntry[];
    items?: import("./types").FrequenciaHistoryEntry[];
  }>(cursosRoutes.alunos.frequencias.historico(alunoId, frequenciaId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  return response.data ?? response.items ?? [];
}

export async function listFrequenciaHistoricoByAlunoNaturalKey(
  alunoId: string,
  params: import("./types").ListFrequenciaHistoricoByAlunoNaturalKeyParams,
  init?: RequestInit
): Promise<import("./types").FrequenciaHistoryEntry[]> {
  const sp = new URLSearchParams();
  sp.set("cursoId", params.cursoId);
  sp.set("turmaId", params.turmaId);
  sp.set("inscricaoId", params.inscricaoId);
  sp.set("tipoOrigem", params.tipoOrigem);
  sp.set("origemId", params.origemId);

  const url = `${cursosRoutes.alunos.frequencias.historicoByNaturalKey(alunoId)}?${sp.toString()}`;

  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").FrequenciaHistoryEntry[];
    items?: import("./types").FrequenciaHistoryEntry[];
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  return response.data ?? response.items ?? [];
}

// ===================================
// NOTAS (API v3)
// ===================================

export async function listNotas(
  cursoId: string | number,
  params: import("./types").ListNotasParams,
  init?: RequestInit
): Promise<import("./types").ListNotasResponse> {
  const sp = buildListNotasSearchParams(params);
  const url = sp.toString()
    ? `${cursosRoutes.cursos.notas(cursoId)}?${sp.toString()}`
    : cursosRoutes.cursos.notas(cursoId);

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function listNotasGlobal(
  params: import("./types").ListNotasParams,
  init?: RequestInit
): Promise<import("./types").ListNotasResponse> {
  const sp = buildListNotasSearchParams(params);
  const url = sp.toString()
    ? `${cursosRoutes.cursos.notasGlobal()}?${sp.toString()}`
    : cursosRoutes.cursos.notasGlobal();

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function listNotasByAluno(
  alunoId: string,
  params: import("./types").ListNotasParams,
  init?: RequestInit
): Promise<import("./types").ListNotasResponse> {
  const sp = buildListNotasSearchParams(params);
  const url = sp.toString()
    ? `${cursosRoutes.alunos.notas(alunoId)}?${sp.toString()}`
    : cursosRoutes.alunos.notas(alunoId);

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

function buildListNotasSearchParams(params: import("./types").ListNotasParams) {
  const sp = new URLSearchParams();
  if (params.cursoId) sp.set("cursoId", params.cursoId);
  if (params.turmaIds) sp.set("turmaIds", params.turmaIds);
  if (params.search) sp.set("search", params.search);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params.orderBy) sp.set("orderBy", params.orderBy);
  if (params.order) sp.set("order", params.order);
  return sp;
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

export async function getNotaHistorico(
  cursoId: string | number,
  turmaId: string,
  notaId: string,
  init?: RequestInit
): Promise<import("./types").NotaHistoricoItem[]> {
  const response = await apiFetch<import("./types").GetNotaHistoricoResponse>(
    cursosRoutes.cursos.turmas.notas.historico(cursoId, turmaId, notaId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers, true),
      },
      cache: "no-cache",
    }
  );

  if (Array.isArray(response.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  return [];
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
  if (params?.includeSemCurso !== undefined)
    sp.set("includeSemCurso", String(params.includeSemCurso));

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
  const response = await apiFetch<
    | {
        success?: boolean;
        data?: import("./types").Avaliacao;
        avaliacao?: import("./types").Avaliacao;
      }
    | import("./types").Avaliacao
  >(
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

  // Compatibilidade com contratos:
  // - { success, data }
  // - { success, avaliacao }
  // - objeto da avaliação direto
  if (response && typeof response === "object") {
    if (
      "avaliacao" in response &&
      response.avaliacao &&
      typeof response.avaliacao === "object" &&
      "id" in response.avaliacao
    ) {
      return response.avaliacao as import("./types").Avaliacao;
    }
    if (
      "success" in response &&
      "data" in response &&
      response.data &&
      typeof response.data === "object" &&
      "id" in response.data
    ) {
      return response.data as import("./types").Avaliacao;
    }
    if ("id" in response) {
      return response as import("./types").Avaliacao;
    }
  }

  throw new Error("Resposta inválida ao buscar avaliação.");
}

export async function listAvaliacaoQuestoes(
  avaliacaoId: string,
  init?: RequestInit
): Promise<import("./types").AvaliacaoQuestao[]> {
  const response = await apiFetch<
    | {
        success?: boolean;
        data?: import("./types").AvaliacaoQuestao[];
        questoes?: import("./types").AvaliacaoQuestao[];
      }
    | import("./types").AvaliacaoQuestao[]
  >(cursosRoutes.avaliacoes.questoes(avaliacaoId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "short",
  });

  if (Array.isArray(response)) {
    return response as import("./types").AvaliacaoQuestao[];
  }

  if (response && typeof response === "object") {
    if (Array.isArray(response.data)) {
      return response.data as import("./types").AvaliacaoQuestao[];
    }
    if (Array.isArray(response.questoes)) {
      return response.questoes as import("./types").AvaliacaoQuestao[];
    }
  }

  return [];
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

export async function publicarAvaliacao(
  avaliacaoId: string,
  publicar: boolean,
  init?: RequestInit
): Promise<import("./types").Avaliacao> {
  const response = await apiFetch<
    | {
        success?: boolean;
        data?: import("./types").Avaliacao;
        avaliacao?: import("./types").Avaliacao;
      }
    | import("./types").Avaliacao
  >(cursosRoutes.avaliacoes.publicar(avaliacaoId), {
    init: {
      method: "PATCH",
      ...init,
      headers: buildHeaders(
        { "Content-Type": "application/json", ...(init?.headers || {}) },
        true
      ),
      body: JSON.stringify({ publicar }),
    },
    cache: "no-cache",
  });

  if (response && typeof response === "object") {
    if ("data" in response && response.data && typeof response.data === "object") {
      return response.data as import("./types").Avaliacao;
    }
    if (
      "avaliacao" in response &&
      response.avaliacao &&
      typeof response.avaliacao === "object"
    ) {
      return response.avaliacao as import("./types").Avaliacao;
    }
    if ("id" in response) {
      return response as import("./types").Avaliacao;
    }
  }

  throw new Error("Resposta inválida ao publicar/despublicar avaliação.");
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
  if (params?.turmaIds) sp.set("turmaIds", params.turmaIds);
  if (params?.empresaId) sp.set("empresaId", params.empresaId);
  if (params?.status) sp.set("status", params.status);
  if (typeof params?.obrigatorio === "boolean") {
    sp.set("obrigatorio", String(params.obrigatorio));
  }
  if (params?.periodo) sp.set("periodo", params.periodo);
  if (params?.search) sp.set("search", params.search);
  if (params?.orderBy) sp.set("orderBy", params.orderBy);
  if (params?.order) sp.set("order", params.order);
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

export async function createEstagioGlobal(
  payload: import("./types").CreateEstagioGlobalPayload,
  init?: RequestInit
): Promise<import("./types").Estagio> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").Estagio;
  }>(cursosRoutes.estagiosGlobal.create(), {
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

  return (response?.data ?? response) as import("./types").Estagio;
}

export async function getEstagioById(
  estagioId: string,
  init?: RequestInit
): Promise<import("./types").Estagio> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").Estagio;
  }>(cursosRoutes.estagiosGlobal.get(estagioId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  return (response?.data ?? response) as import("./types").Estagio;
}

export async function listEstagiosByAluno(
  alunoId: string,
  params?: {
    search?: string;
    status?: import("./types").EstagioStatus;
    page?: number;
    pageSize?: number;
  },
  init?: RequestInit
): Promise<import("./types").ListEstagiosResponse> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.alunos.estagios.list(alunoId)}?${sp.toString()}`
    : cursosRoutes.alunos.estagios.list(alunoId);

  return apiFetch(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });
}

export async function getEstagioByAluno(
  alunoId: string,
  estagioId: string,
  init?: RequestInit
): Promise<import("./types").Estagio> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").Estagio;
  }>(cursosRoutes.alunos.estagios.get(alunoId, estagioId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  return (response?.data ?? response) as import("./types").Estagio;
}

export async function updateEstagioGlobal(
  estagioId: string,
  payload: import("./types").UpdateEstagioGlobalPayload,
  init?: RequestInit
): Promise<import("./types").Estagio> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").Estagio;
  }>(cursosRoutes.estagiosGlobal.update(estagioId), {
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

  return (response?.data ?? response) as import("./types").Estagio;
}

export async function vincularAlunosEstagio(
  estagioId: string,
  payload: import("./types").VincularAlunosEstagioPayload,
  init?: RequestInit
): Promise<{
  estagioId: string;
  totalVinculados?: number;
}> {
  const response = await apiFetch<{
    success?: boolean;
    data?: {
      estagioId: string;
      totalVinculados?: number;
    };
  }>(cursosRoutes.estagiosGlobal.vincularAlunos(estagioId), {
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

  return (
    response?.data ?? {
      estagioId,
    }
  );
}

export async function alocarAlunoEstagioGrupo(
  estagioId: string,
  estagioAlunoId: string,
  payload: import("./types").AlocarAlunoEstagioGrupoPayload,
  init?: RequestInit
): Promise<import("./types").EstagioAluno> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").EstagioAluno;
  }>(cursosRoutes.estagiosGlobal.alocarAlunoGrupo(estagioId, estagioAlunoId), {
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

  return (response?.data ?? response) as import("./types").EstagioAluno;
}

export async function listEstagioFrequencias(
  estagioId: string,
  params?: import("./types").ListEstagioFrequenciasParams,
  init?: RequestInit
): Promise<{
  items: import("./types").EstagioFrequencia[];
  pagination?: import("./types").Pagination;
}> {
  const sp = new URLSearchParams();
  if (params?.data) sp.set("data", params.data);
  if (params?.status) sp.set("status", params.status);
  if (params?.grupoId) sp.set("grupoId", params.grupoId);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.estagiosGlobal.frequencias(estagioId)}?${sp.toString()}`
    : cursosRoutes.estagiosGlobal.frequencias(estagioId);

  const response = await apiFetch<{
    success?: boolean;
    data?:
      | import("./types").EstagioFrequencia[]
      | {
          items: import("./types").EstagioFrequencia[];
          pagination?: import("./types").Pagination;
        };
    pagination?: import("./types").Pagination;
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = response?.data;
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: response?.pagination,
    };
  }
  return {
    items: payload?.items ?? [],
    pagination: payload?.pagination ?? response?.pagination,
  };
}

export async function listEstagioFrequenciasByAluno(
  alunoId: string,
  estagioId: string,
  params?: import("./types").ListEstagioFrequenciasParams,
  init?: RequestInit
): Promise<{
  items: import("./types").EstagioFrequencia[];
  pagination?: import("./types").Pagination;
}> {
  const sp = new URLSearchParams();
  if (params?.data) sp.set("data", params.data);
  if (params?.status) sp.set("status", params.status);
  if (params?.grupoId) sp.set("grupoId", params.grupoId);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.alunos.estagios.frequencias(alunoId, estagioId)}?${sp.toString()}`
    : cursosRoutes.alunos.estagios.frequencias(alunoId, estagioId);

  const response = await apiFetch<{
    success?: boolean;
    data?:
      | import("./types").EstagioFrequencia[]
      | {
          items: import("./types").EstagioFrequencia[];
          pagination?: import("./types").Pagination;
        };
    pagination?: import("./types").Pagination;
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = response?.data;
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: response?.pagination,
    };
  }
  return {
    items: payload?.items ?? [],
    pagination: payload?.pagination ?? response?.pagination,
  };
}

export async function listEstagioFrequenciasPeriodo(
  estagioId: string,
  params?: import("./types").ListEstagioFrequenciasPeriodoParams,
  init?: RequestInit
): Promise<import("./types").EstagioFrequenciasPeriodoResponse> {
  const sp = new URLSearchParams();
  if (params?.dataInicio) sp.set("dataInicio", params.dataInicio);
  if (params?.dataFim) sp.set("dataFim", params.dataFim);
  if (params?.status) sp.set("status", params.status);
  if (params?.grupoId) sp.set("grupoId", params.grupoId);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.estagiosGlobal.frequenciasPeriodo(estagioId)}?${sp.toString()}`
    : cursosRoutes.estagiosGlobal.frequenciasPeriodo(estagioId);

  const response = await apiFetch<{
    success?: boolean;
    data?:
      | import("./types").EstagioFrequenciasPeriodoResponse
      | import("./types").EstagioFrequenciasPeriodoGroup[];
    pagination?: import("./types").Pagination;
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = response?.data as any;
  if (Array.isArray(payload)) {
    return {
      gruposPorData: payload,
      pagination: response?.pagination,
    };
  }

  return {
    gruposPorData: payload?.gruposPorData ?? [],
    pagination: payload?.pagination ?? response?.pagination,
    periodo: payload?.periodo,
  };
}

export async function listEstagioFrequenciasPeriodoByAluno(
  alunoId: string,
  estagioId: string,
  params?: import("./types").ListEstagioFrequenciasPeriodoParams,
  init?: RequestInit
): Promise<import("./types").EstagioFrequenciasPeriodoResponse> {
  const sp = new URLSearchParams();
  if (params?.dataInicio) sp.set("dataInicio", params.dataInicio);
  if (params?.dataFim) sp.set("dataFim", params.dataFim);
  if (params?.status) sp.set("status", params.status);
  if (params?.grupoId) sp.set("grupoId", params.grupoId);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.alunos.estagios.frequenciasPeriodo(alunoId, estagioId)}?${sp.toString()}`
    : cursosRoutes.alunos.estagios.frequenciasPeriodo(alunoId, estagioId);

  const response = await apiFetch<{
    success?: boolean;
    data?:
      | import("./types").EstagioFrequenciasPeriodoResponse
      | import("./types").EstagioFrequenciasPeriodoGroup[];
    pagination?: import("./types").Pagination;
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = response?.data as any;
  if (Array.isArray(payload)) {
    return {
      gruposPorData: payload,
      pagination: response?.pagination,
    };
  }

  return {
    gruposPorData: payload?.gruposPorData ?? [],
    pagination: payload?.pagination ?? response?.pagination,
    periodo: payload?.periodo,
  };
}

export async function upsertEstagioFrequenciaLancamento(
  estagioId: string,
  payload: import("./types").UpsertEstagioFrequenciaPayload,
  init?: RequestInit
): Promise<import("./types").EstagioFrequencia> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").EstagioFrequencia;
  }>(cursosRoutes.estagiosGlobal.upsertFrequenciaLancamento(estagioId), {
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

  return (response?.data ?? response) as import("./types").EstagioFrequencia;
}

export async function upsertEstagioFrequenciaLancamentoByAluno(
  alunoId: string,
  estagioId: string,
  payload: import("./types").UpsertEstagioFrequenciaPayload,
  init?: RequestInit
): Promise<import("./types").EstagioFrequencia> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").EstagioFrequencia;
  }>(cursosRoutes.alunos.estagios.lancamentos(alunoId, estagioId), {
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

  return (response?.data ?? response) as import("./types").EstagioFrequencia;
}

export async function listEstagioFrequenciaHistorico(
  estagioId: string,
  frequenciaId: string,
  init?: RequestInit
): Promise<import("./types").FrequenciaHistoryEntry[]> {
  const response = await apiFetch<{
    success?: boolean;
    data?:
      | import("./types").FrequenciaHistoryEntry[]
      | import("./types").EstagioFrequenciaHistoricoResponse;
  }>(cursosRoutes.estagiosGlobal.frequenciaHistorico(estagioId, frequenciaId), {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = response?.data as any;
  if (Array.isArray(payload)) return payload;
  return payload?.items ?? [];
}

export async function listEstagioFrequenciaHistoricoPaginado(
  estagioId: string,
  frequenciaId: string,
  params?: import("./types").ListEstagioFrequenciaHistoricoParams,
  init?: RequestInit
): Promise<import("./types").EstagioFrequenciaHistoricoResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.estagiosGlobal.frequenciaHistorico(
        estagioId,
        frequenciaId
      )}?${sp.toString()}`
    : cursosRoutes.estagiosGlobal.frequenciaHistorico(estagioId, frequenciaId);

  const response = await apiFetch<{
    success?: boolean;
    data?:
      | import("./types").FrequenciaHistoryEntry[]
      | import("./types").EstagioFrequenciaHistoricoResponse;
    pagination?: import("./types").Pagination;
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = response?.data as any;
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: response?.pagination,
    };
  }

  return {
    items: payload?.items ?? [],
    pagination: payload?.pagination ?? response?.pagination,
  };
}

export async function listEstagioFrequenciaHistoricoByAlunoPaginado(
  alunoId: string,
  estagioId: string,
  frequenciaId: string,
  params?: import("./types").ListEstagioFrequenciaHistoricoParams,
  init?: RequestInit
): Promise<import("./types").EstagioFrequenciaHistoricoResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));

  const url = sp.toString()
    ? `${cursosRoutes.alunos.estagios.historico(
        alunoId,
        estagioId,
        frequenciaId
      )}?${sp.toString()}`
    : cursosRoutes.alunos.estagios.historico(alunoId, estagioId, frequenciaId);

  const response = await apiFetch<{
    success?: boolean;
    data?:
      | import("./types").FrequenciaHistoryEntry[]
      | import("./types").EstagioFrequenciaHistoricoResponse;
    pagination?: import("./types").Pagination;
  }>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  const payload = response?.data as any;
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: response?.pagination,
    };
  }

  return {
    items: payload?.items ?? [],
    pagination: payload?.pagination ?? response?.pagination,
  };
}

export async function concluirEstagioAluno(
  estagioId: string,
  estagioAlunoId: string,
  init?: RequestInit
): Promise<import("./types").ConcluirEstagioAlunoResponse> {
  const response = await apiFetch<{
    success?: boolean;
    data?: import("./types").ConcluirEstagioAlunoResponse;
  }>(cursosRoutes.estagiosGlobal.concluirAluno(estagioId, estagioAlunoId), {
    init: {
      method: "POST",
      ...init,
      headers: buildHeaders(init?.headers, true),
    },
    cache: "no-cache",
  });

  return (response?.data ?? response) as import("./types").ConcluirEstagioAlunoResponse;
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
