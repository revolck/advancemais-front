import type {
  VagaCreateApiResponse,
  VagaErrorResponse,
  VagaValidationError,
  VagaLimitReachedError,
} from "@/api/vagas";

/**
 * Verifica se a resposta da API é um erro
 */
export function isErrorResponse(
  response: VagaCreateApiResponse,
): response is VagaErrorResponse | VagaValidationError | VagaLimitReachedError {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    response.success === false
  );
}

/**
 * Converte string para slug (URL-friendly)
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Converte texto multilinha em array de strings
 */
export function parseMultiline(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Converte string para número ou mantém como string
 */
export function toNumericOrString(value: string): number | string {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

/**
 * Verifica se o texto contém informações proibidas (email, URL, telefone)
 */
export function containsProhibitedInfo(value: string): boolean {
  if (!value) return false;

  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const urlRegex = /(https?:\/\/|www\.)\S+/i;
  const phoneRegex =
    /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}\b/;

  return (
    emailRegex.test(value) || urlRegex.test(value) || phoneRegex.test(value)
  );
}

/** Mesmos limites da API (empresas/vagas/validators/vagas.schema.ts) */
export const LIMITES_VAGA = {
  itemLista: 1000,
  itensPorLista: 50,
  titulo: 255,
  descricao: 8000,
  observacoes: 5000,
  observacoesBeneficios: 2000,
};

/** Problema de tamanho numa lista (um item por linha), ou null se está ok */
export function problemaNaLista(texto: string): string | null {
  const itens = parseMultiline(texto);
  if (itens.length > LIMITES_VAGA.itensPorLista) {
    return `Use no máximo ${LIMITES_VAGA.itensPorLista} itens (um por linha).`;
  }
  const indice = itens.findIndex((item) => item.length > LIMITES_VAGA.itemLista);
  if (indice >= 0) {
    return `O item ${indice + 1} tem ${itens[indice].length} caracteres (máximo ${LIMITES_VAGA.itemLista}). Divida em itens menores, um por linha.`;
  }
  return null;
}

/** Texto acima do limite, ou null */
export function problemaNoTamanho(texto: string, maximo: number): string | null {
  const tamanho = texto.trim().length;
  return tamanho > maximo
    ? `Use no máximo ${maximo} caracteres (agora tem ${tamanho}).`
    : null;
}

const CAMPOS_DA_API: [string, string][] = [
  ["requisitos.obrigatorios", "requisitosObrigatorios"],
  ["requisitos.desejaveis", "requisitosDesejaveis"],
  ["requisitos", "requisitosObrigatorios"],
  ["atividades.principais", "atividadesPrincipais"],
  ["atividades.extras", "atividadesExtras"],
  ["atividades", "atividadesPrincipais"],
  ["beneficios.lista", "beneficiosLista"],
  ["beneficios.observacoes", "beneficiosObservacoes"],
  ["beneficios", "beneficiosLista"],
  ["categoriaVagaId", "areaInteresseId"],
  ["subcategoriaVagaId", "subareaInteresseId"],
];

/** Caminho do erro da API (ex.: requisitos.obrigatorios.1) → campo do formulário */
export function campoDoFormulario(caminho: string): string {
  for (const [prefixo, campo] of CAMPOS_DA_API) {
    if (caminho === prefixo || caminho.startsWith(`${prefixo}.`)) return campo;
  }
  if (caminho.startsWith("localizacao.")) return caminho.split(".").slice(0, 2).join(".");
  return caminho.split(".")[0];
}

/**
 * "Inscrições até": o calendário trabalha com "yyyy-MM-dd" e o prazo vale até o fim
 * desse dia em Brasília. (new Date("yyyy-MM-dd") seria meia-noite UTC = 21h do dia anterior.)
 */
export function fimDoDiaEmBrasilia(dia: string): string | undefined {
  if (!dia) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return dia; // já é data completa
  return new Date(`${dia}T23:59:59-03:00`).toISOString();
}

/** Data salva na API (ISO) → "yyyy-MM-dd" do dia em Brasília, para o calendário */
export function diaEmBrasilia(iso?: string | null): string {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(data);
}
