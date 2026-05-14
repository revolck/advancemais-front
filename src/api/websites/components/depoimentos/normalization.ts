import type { TestimonialData } from "@/theme/website/components/testimonials-carousel/types";
import type { DepoimentoBackendResponse } from "./types";

type AnyRecord = Record<string, unknown>;

type DepoimentosListEnvelope = {
  data?: unknown;
  items?: unknown;
  results?: unknown;
  depoimentos?: unknown;
};

const RESOURCE_KEYS = [
  "depoimento",
  "testimonial",
  "websiteDepoimento",
  "websiteDepoimentoItem",
  "item",
  "conteudo",
];

const IMAGE_OBJECT_KEYS = [
  "foto",
  "photo",
  "imagem",
  "image",
  "avatar",
  "arquivo",
  "file",
  "midia",
];

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeDepoimentosListResponse(
  response: unknown,
): DepoimentoBackendResponse[] {
  if (Array.isArray(response)) {
    return response as DepoimentoBackendResponse[];
  }

  if (!isRecord(response)) {
    return [];
  }

  const envelope = response as DepoimentosListEnvelope;
  const candidates = [
    envelope.data,
    envelope.items,
    envelope.results,
    envelope.depoimentos,
  ];

  const list = candidates.find(Array.isArray);
  return Array.isArray(list) ? (list as DepoimentoBackendResponse[]) : [];
}

function readString(record: AnyRecord | undefined, keys: string[]): string {
  if (!record) return "";

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function readNumber(record: AnyRecord | undefined, keys: string[]): number {
  if (!record) return 0;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return 0;
}

function readValue(record: AnyRecord | undefined, keys: string[]): unknown {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return undefined;
}

function getNestedRecords(record: AnyRecord): AnyRecord[] {
  return RESOURCE_KEYS.map((key) => record[key]).filter(isRecord);
}

function readNestedString(record: AnyRecord, keys: string[]): string {
  const direct = readString(record, keys);
  if (direct) return direct;

  for (const nested of getNestedRecords(record)) {
    const value = readString(nested, keys);
    if (value) return value;
  }

  return "";
}

function readNestedNumber(record: AnyRecord, keys: string[]): number {
  const direct = readNumber(record, keys);
  if (direct) return direct;

  for (const nested of getNestedRecords(record)) {
    const value = readNumber(nested, keys);
    if (value) return value;
  }

  return 0;
}

function readNestedValue(record: AnyRecord, keys: string[]): unknown {
  const direct = readValue(record, keys);
  if (direct !== undefined) return direct;

  for (const nested of getNestedRecords(record)) {
    const value = readValue(nested, keys);
    if (value !== undefined) return value;
  }

  return undefined;
}

function normalizeImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+/, "")}`;
}

function readImageUrl(record: AnyRecord): string {
  const direct = readNestedString(record, [
    "fotoUrl",
    "photoUrl",
    "avatarUrl",
    "imagemUrl",
    "imageUrl",
    "urlImagem",
    "src",
    "image",
  ]);
  if (direct) return normalizeImageUrl(direct);

  const candidates: AnyRecord[] = [record, ...getNestedRecords(record)];

  for (const candidate of candidates) {
    for (const key of IMAGE_OBJECT_KEYS) {
      const value = candidate[key];
      if (typeof value === "string" && value.trim()) {
        return normalizeImageUrl(value);
      }
      if (isRecord(value)) {
        const nestedUrl = readString(value, [
          "fotoUrl",
          "photoUrl",
          "imagemUrl",
          "imageUrl",
          "url",
          "src",
          "path",
        ]);
        if (nestedUrl) return normalizeImageUrl(nestedUrl);
      }
    }
  }

  return "";
}

function readDate(record: AnyRecord, keys: string[]): string {
  const value = readNestedString(record, keys);
  if (!value) return "";

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

export function isDepoimentoPublished(status: unknown): boolean {
  if (typeof status === "boolean") return status;
  if (status === undefined || status === null || status === "") return false;

  const normalized = String(status).toUpperCase();
  return [
    "PUBLICADO",
    "PUBLISHED",
    "PUBLIC",
    "ATIVO",
    "ACTIVE",
    "TRUE",
  ].includes(normalized);
}

export interface NormalizedDepoimentoResponse {
  id: string;
  orderId?: string;
  name: string;
  position: string;
  testimonial: string;
  imageUrl: string;
  status: string | boolean | undefined;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export function normalizeDepoimentoResponse(
  item: DepoimentoBackendResponse | AnyRecord,
): NormalizedDepoimentoResponse {
  const record = item as AnyRecord;
  const nestedRecords = getNestedRecords(record);
  const firstNested = nestedRecords[0];
  const orderId = readString(record, ["ordemId", "orderId", "id"]);
  const resourceId =
    readString(record, [
      "depoimentoId",
      "testimonialId",
      "recursoId",
      "resourceId",
    ]) ||
    readString(firstNested, ["id", "depoimentoId", "testimonialId"]) ||
    orderId;
  const status = readNestedValue(record, ["status", "ativo", "published"]);
  const createdAt =
    readDate(record, [
      "criadoEm",
      "createdAt",
      "created_at",
      "ordemCriadoEm",
      "dataUpload",
      "uploadDate",
      "uploadedAt",
    ]) || new Date().toISOString();
  const updatedAt = readDate(record, [
    "atualizadoEm",
    "updatedAt",
    "updated_at",
    "dataAtualizacao",
  ]);

  return {
    id: resourceId || orderId || "",
    orderId: orderId || undefined,
    name: readNestedString(record, [
      "nome",
      "name",
      "autor",
      "author",
      "cliente",
      "client",
      "url",
    ]),
    position: readNestedString(record, [
      "cargo",
      "position",
      "funcao",
      "role",
      "content",
    ]),
    testimonial: readNestedString(record, [
      "depoimento",
      "testimonial",
      "texto",
      "text",
      "descricao",
      "description",
      "titulo",
      "title",
    ]),
    imageUrl: readImageUrl(record),
    status: status as string | boolean | undefined,
    published: isDepoimentoPublished(status),
    order: readNestedNumber(record, ["ordem", "position", "order", "posicao"]),
    createdAt,
    updatedAt: updatedAt || undefined,
  };
}

export function mapDepoimentoResponsesToTestimonialData(
  data: Array<DepoimentoBackendResponse | AnyRecord>,
  options?: { assumePublishedWhenStatusMissing?: boolean },
): TestimonialData[] {
  return data
    .map(normalizeDepoimentoResponse)
    .filter(
      (item) =>
        (item.published ||
          (options?.assumePublishedWhenStatusMissing &&
            item.status === undefined)) &&
        Boolean(item.testimonial || item.name || item.imageUrl),
    )
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      id: item.id || `depoimento-${index + 1}`,
      name: item.name,
      position: item.position,
      company: undefined,
      testimonial: item.testimonial,
      imageUrl: item.imageUrl,
      rating: 5,
      order: item.order || index + 1,
      isActive: true,
    }));
}
