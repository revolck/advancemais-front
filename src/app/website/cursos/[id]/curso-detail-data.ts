import type {
  CourseData,
  CourseTurmaPublica,
} from "@/theme/website/components/course/types";
import { formatReadableText } from "@/lib/display-text";
import { env } from "@/lib/env";

type CursoApiResponse =
  | (Record<string, any> & { id: string; statusPadrao?: string })
  | null;

const PUBLIC_COURSE_STATUS = "PUBLICADO";
const PUBLIC_TURMA_STATUSES = new Set([
  "PUBLICADO",
  "INSCRICOES_ABERTAS",
  "INSCRICOES_ENCERRADAS",
  "EM_ANDAMENTO",
]);

function toFiniteNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toValidBaseUrl(value: string | undefined): URL | null {
  const raw = value?.trim();
  if (!raw || /^https?:\/\/\//i.test(raw)) return null;

  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function buildCursoApiUrl(
  path: string,
  origin: string,
  apiBaseUrl: string = env.apiBaseUrl,
): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl = toValidBaseUrl(apiBaseUrl) ?? toValidBaseUrl(origin);
  if (!baseUrl) {
    throw new Error("Base URL da API invalida");
  }

  const basePath = baseUrl.pathname.replace(/\/+$/, "");
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (basePath === "/api" && normalizedPath.startsWith("/api/")) {
    normalizedPath = normalizedPath.slice(4);
  }

  return `${baseUrl.origin}${basePath}${normalizedPath}`;
}

function extractTurmas(curso: any): any[] {
  const candidates = [
    curso?.turmasPublicadas,
    curso?.turmas,
    curso?.Turmas,
    curso?.CursosTurmas,
    curso?.data?.turmas,
    curso?.data?.Turmas,
    curso?.data?.CursosTurmas,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function resolveTurmaDateRange(turma: any) {
  const dataInicio =
    turma.dataInicio ||
    turma.dataInicioPrevista ||
    turma.inicioEm ||
    turma.inicio ||
    turma.dataInicioAtividades;
  const dataFim =
    turma.dataFim ||
    turma.dataFimPrevista ||
    turma.fimEm ||
    turma.fim ||
    turma.dataFimAtividades;
  const dataInscricaoInicio =
    turma.dataInscricaoInicio ||
    turma.inscricoesInicio ||
    turma.inscricaoInicio ||
    turma.inscricaoInicioEm;
  const dataInscricaoFim =
    turma.dataInscricaoFim ||
    turma.inscricoesFim ||
    turma.inscricaoFim ||
    turma.inscricaoFimEm;

  return {
    dataInicio: dataInicio ? String(dataInicio) : undefined,
    dataFim: dataFim ? String(dataFim) : undefined,
    dataInscricaoInicio: dataInscricaoInicio
      ? String(dataInscricaoInicio)
      : undefined,
    dataInscricaoFim: dataInscricaoFim ? String(dataInscricaoFim) : undefined,
  };
}

function isExpiredEnrollmentWindow(
  turma: any,
  referenceDate: Date,
): boolean {
  const { dataInscricaoFim } = resolveTurmaDateRange(turma);
  if (!dataInscricaoFim) return false;

  const parsed = new Date(dataInscricaoFim);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() < referenceDate.getTime();
}

function isPublicTurmaCandidate(turma: any, referenceDate: Date): boolean {
  if (!turma || turma.deletedAt) return false;

  const status = String(
    turma.status || turma.statusPadrao || turma.publicacaoStatus || "",
  ).toUpperCase();

  if (!PUBLIC_TURMA_STATUSES.has(status)) return false;
  return !isExpiredEnrollmentWindow(turma, referenceDate);
}

export function normalizeTurmasPublicadas(
  curso: any,
  options: { filterPublicTurmas?: boolean; referenceDate?: Date } = {},
): CourseTurmaPublica[] {
  const referenceDate = options.referenceDate ?? new Date();
  const rawCandidates = extractTurmas(curso);
  const source = options.filterPublicTurmas
    ? rawCandidates.filter((turma) => isPublicTurmaCandidate(turma, referenceDate))
    : rawCandidates;
  const normalized: CourseTurmaPublica[] = [];

  source.forEach((turma) => {
    if (!turma) return;
    const id = turma.id?.toString?.() ?? "";
    if (!id) return;

    const dates = resolveTurmaDateRange(turma);
    const vagasCalculadas = toFiniteNumber(turma.vagasDisponiveisCalculadas);
    const vagasDisponiveis = toFiniteNumber(
      vagasCalculadas ??
        turma.disponiveis ??
        turma.vagasDisponiveis ??
        turma.vagas,
    );
    const vagas = toFiniteNumber(
      turma.vagas ?? turma.quantidadeVagas ?? turma.limiteVagas,
    );
    const vagasTotais = toFiniteNumber(
      turma.vagasTotais ??
        turma.totalVagas ??
        turma.quantidadeVagasTotais ??
        turma.limiteVagas,
    );

    const valor =
      turma.valor != null
        ? Number(turma.valor)
        : turma.preco != null
          ? Number(turma.preco)
          : undefined;
    const valorPromocional =
      turma.valorPromocional != null
        ? Number(turma.valorPromocional)
        : undefined;
    const gratuito =
      turma.gratuito != null ? Boolean(turma.gratuito) : undefined;

    normalized.push({
      id,
      nome: turma.nome || turma.titulo || turma.codigo || undefined,
      ...dates,
      metodo: turma.metodo || turma.modalidade || turma.tipo || undefined,
      turno: turma.turno || undefined,
      status: turma.status || turma.statusPadrao || undefined,
      vagasIlimitadas:
        turma.vagasIlimitadas != null
          ? Boolean(turma.vagasIlimitadas)
          : undefined,
      vagasTotais,
      vagasDisponiveis,
      vagasDisponiveisCalculadas:
        turma.vagasDisponiveisCalculadas === null ? null : vagasCalculadas,
      vagas,
      valor,
      valorPromocional,
      gratuito,
    });
  });

  return normalized;
}

export function normalizeCourse(
  curso: any,
  options: { filterPublicTurmas?: boolean; referenceDate?: Date } = {},
): CourseData | null {
  if (!curso?.id || curso.statusPadrao !== PUBLIC_COURSE_STATUS) {
    return null;
  }

  const subcategoria =
    curso.subcategoria?.nome ||
    curso.Subcategoria?.nome ||
    curso.CursosSubcategorias?.nome;
  const categoria =
    curso.categoria?.nome ||
    curso.Categoria?.nome ||
    curso.CursosCategorias?.nome ||
    "Geral";
  const turmasPublicadas = normalizeTurmasPublicadas(curso, options);

  return {
    id: curso.id.toString(),
    nome: formatReadableText(curso.nome || "Curso"),
    descricao: curso.descricao || "",
    conteudoProgramatico:
      typeof curso.conteudoProgramatico === "string"
        ? curso.conteudoProgramatico
        : null,
    cargaHoraria: curso.cargaHoraria || 0,
    categoria: formatReadableText(categoria),
    subcategoria: subcategoria ? formatReadableText(subcategoria) : undefined,
    imagemUrl: curso.imagemUrl,
    statusPadrao: PUBLIC_COURSE_STATUS,
    estagioObrigatorio: Boolean(curso.estagioObrigatorio),
    totalTurmas: turmasPublicadas.length,
    totalAlunos: curso.totalAlunos || 0,
    criadoEm: curso.criadoEm || new Date().toISOString(),
    valor: Number(curso.valor ?? 0),
    valorPromocional:
      curso.valorPromocional != null
        ? Number(curso.valorPromocional)
        : undefined,
    gratuito: Boolean(curso.gratuito ?? false),
    turmasPublicadas,
  };
}

function unwrapCursoApiResponse(data: any): CursoApiResponse {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  if (Array.isArray(data?.data)) return data.data[0] ?? null;
  if (data?.data?.data && typeof data.data.data === "object") {
    return data.data.data;
  }
  if (data?.data && typeof data.data === "object") return data.data;
  return data;
}

async function fetchCursoPayload(
  path: string,
  origin: string,
): Promise<CursoApiResponse> {
  const url = buildCursoApiUrl(path, origin);

  try {
    console.log("[curso-detalhe][fetch] GET", url);
    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.log("[curso-detalhe][fetch] FAIL", res.status, url);
      return null;
    }

    const data = await res.json();
    console.log("[curso-detalhe][fetch] OK", url);
    return unwrapCursoApiResponse(data);
  } catch {
    console.log("[curso-detalhe][fetch] ERROR", url);
    return null;
  }
}

export async function fetchCursoById(
  id: string,
  origin: string,
): Promise<CourseData | null> {
  const encodedId = encodeURIComponent(id);
  const publicCurso = await fetchCursoPayload(
    `/api/v1/cursos/publico/cursos/${encodedId}`,
    origin,
  );
  const normalizedPublicCurso = normalizeCourse(publicCurso);
  if (normalizedPublicCurso) return normalizedPublicCurso;

  const fallbackCurso = await fetchCursoPayload(
    `/api/v1/cursos/${encodedId}`,
    origin,
  );

  return normalizeCourse(fallbackCurso, { filterPublicTurmas: true });
}
