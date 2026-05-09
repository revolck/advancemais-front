import type { BannerItem } from "@/theme/website/components/banners/types";
import type { BannerBackendResponse } from "./types";

type AnyRecord = Record<string, unknown>;

const RESOURCE_KEYS = [
  "banner",
  "websiteBanner",
  "websiteBannerItem",
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

export function isBannerPublished(status: unknown): boolean {
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

export interface NormalizedBannerResponse {
  id: string;
  image: string;
  imageTitle: string;
  link?: string;
  status: string | boolean | undefined;
  published: boolean;
  order: number;
}

export function normalizeBannerResponse(
  item: BannerBackendResponse | AnyRecord,
): NormalizedBannerResponse {
  const record = item as AnyRecord;
  const nestedRecords = getNestedRecords(record);
  const firstNested = nestedRecords[0];
  const image = readImageUrl(record);
  const imageTitle =
    readNestedString(record, [
      "imagemTitulo",
      "imageTitle",
      "imagemAlt",
      "alt",
      "titulo",
      "title",
      "nome",
      "name",
    ]) ||
    getFileNameFromUrl(image) ||
    "Banner";
  const orderId = readString(record, ["ordemId", "orderId", "id"]);
  const resourceId =
    readString(record, ["bannerId", "recursoId", "resourceId"]) ||
    readString(firstNested, ["id", "bannerId"]) ||
    orderId;
  const status = readNestedValue(record, ["status", "ativo", "published"]);

  return {
    id: resourceId || orderId || `banner-${Date.now()}`,
    image,
    imageTitle,
    link:
      readNestedString(record, [
        "link",
        "linkUrl",
        "urlDestino",
        "destinoUrl",
        "buttonUrl",
      ]) || undefined,
    status: status as string | boolean | undefined,
    published: isBannerPublished(status),
    order: readNestedNumber(record, ["ordem", "position", "order", "posicao"]),
  };
}

export function mapBannerResponsesToBannerItems(
  data: Array<BannerBackendResponse | AnyRecord>,
  options?: { assumePublishedWhenStatusMissing?: boolean },
): BannerItem[] {
  return data
    .map(normalizeBannerResponse)
    .filter(
      (item) =>
        (item.published ||
          (options?.assumePublishedWhenStatusMissing &&
            item.status === undefined)) &&
        item.image,
    )
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      id: item.id || `banner-${index + 1}`,
      imagemUrl: item.image,
      linkUrl: item.link ?? "#",
      position: item.order || index + 1,
      alt: item.imageTitle,
    }));
}
