import type { LogoData } from "@/theme/website/components/logo-enterprises/types";
import type { LogoEnterpriseBackendResponse } from "./types";

type AnyRecord = Record<string, unknown>;

const RESOURCE_KEYS = [
  "logoEnterprise",
  "logoEnterprises",
  "websiteLogoEnterprise",
  "websiteLogoEnterpriseItem",
  "logo",
  "item",
  "conteudo",
];

const IMAGE_OBJECT_KEYS = ["imagem", "image", "arquivo", "file", "midia"];

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function readNestedValue(record: AnyRecord, keys: string[]): unknown {
  const direct = readValue(record, keys);
  if (direct !== undefined) return direct;

  for (const nested of getNestedRecords(record)) {
    const value = readValue(nested, keys);
    if (value !== undefined) return value;
  }

  return undefined;
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
    "imagemUrl",
    "imageUrl",
    "urlImagem",
    "src",
    "imagem",
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

function getFileNameFromUrl(url: string): string {
  if (!url) return "";
  const clean = url.split("?")[0]?.split("#")[0] ?? "";
  const last = clean.split("/").pop() ?? "";
  try {
    return decodeURIComponent(last).replace(/\.[^/.]+$/, "");
  } catch {
    return last.replace(/\.[^/.]+$/, "");
  }
}

function readDate(record: AnyRecord, keys: string[]): string {
  const value = readNestedString(record, keys);
  if (!value) return "";

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

export function isLogoEnterprisePublished(status: unknown): boolean {
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

export interface NormalizedLogoEnterpriseResponse {
  id: string;
  orderId?: string;
  name: string;
  image: string;
  alt: string;
  website?: string;
  status: string | boolean | undefined;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export function normalizeLogoEnterpriseResponse(
  item: LogoEnterpriseBackendResponse | AnyRecord,
): NormalizedLogoEnterpriseResponse {
  const record = item as AnyRecord;
  const nestedRecords = getNestedRecords(record);
  const firstNested = nestedRecords[0];
  const image = readImageUrl(record);
  const name =
    readNestedString(record, ["nome", "name", "titulo", "title"]) ||
    getFileNameFromUrl(image) ||
    "Logo";
  const orderId = readString(record, ["ordemId", "orderId", "id"]);
  const resourceId =
    readString(record, ["logoId", "recursoId", "resourceId"]) ||
    readString(firstNested, ["id", "logoId"]) ||
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
    id: resourceId || orderId || `logo-${Date.now()}`,
    orderId: orderId || undefined,
    name,
    image,
    alt:
      readNestedString(record, [
        "imagemAlt",
        "imagemTitulo",
        "imageAlt",
        "imageTitle",
        "alt",
      ]) ||
      name ||
      "Logo",
    website:
      readNestedString(record, [
        "website",
        "site",
        "link",
        "linkUrl",
        "url",
        "urlDestino",
      ]) || undefined,
    status: status as string | boolean | undefined,
    published: isLogoEnterprisePublished(status),
    order: readNestedNumber(record, ["ordem", "position", "order", "posicao"]),
    createdAt,
    updatedAt: updatedAt || undefined,
  };
}

export function mapLogoEnterpriseResponsesToLogoData(
  data: Array<LogoEnterpriseBackendResponse | AnyRecord>,
  options?: { assumePublishedWhenStatusMissing?: boolean },
): LogoData[] {
  return data
    .map(normalizeLogoEnterpriseResponse)
    .filter(
      (item) =>
        (item.published ||
          (options?.assumePublishedWhenStatusMissing &&
            item.status === undefined)) &&
        item.image,
    )
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      id: item.id || `logo-${index + 1}`,
      name: item.name,
      src: item.image,
      alt: item.alt,
      website: item.website,
      order: item.order || index + 1,
    }));
}
