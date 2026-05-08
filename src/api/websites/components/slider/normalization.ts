import type { SlideData } from "@/theme/website/components/slider/types";
import type { SlideBackendResponse, SliderOrientation } from "./types";

type AnyRecord = Record<string, unknown>;

const RESOURCE_KEYS = [
  "slider",
  "websiteSlider",
  "websiteSliderItem",
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

function readDate(record: AnyRecord, keys: string[]): string {
  const value = readNestedString(record, keys);
  if (!value) return "";

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
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

export function normalizeImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+/, "")}`;
}

export function normalizeSliderOrientation(
  value: unknown,
): SliderOrientation | undefined {
  if (!value) return undefined;
  const normalized = String(value)
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (normalized.includes("DESKTOP")) return "DESKTOP";
  if (normalized.includes("MOBILE") || normalized.includes("TABLET")) {
    return "TABLET_MOBILE";
  }
  return undefined;
}

export function isSliderPublished(status: unknown): boolean {
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

export interface NormalizedSliderResponse {
  id: string;
  orderId?: string;
  title: string;
  image: string;
  imageTitle: string;
  link?: string;
  orientation?: SliderOrientation;
  status: string | boolean | undefined;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export function normalizeSliderResponse(
  item: SlideBackendResponse | AnyRecord,
): NormalizedSliderResponse {
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
    ]) || getFileNameFromUrl(image);
  const title =
    readNestedString(record, [
      "sliderName",
      "titulo",
      "title",
      "nome",
      "name",
    ]) ||
    imageTitle ||
    "Slider";
  const orderId = readString(record, ["ordemId", "orderId", "id"]);
  const resourceId =
    readString(record, ["sliderId", "recursoId", "resourceId"]) ||
    readString(firstNested, ["id", "sliderId"]) ||
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
    id: resourceId || orderId || `slider-${Date.now()}`,
    orderId: orderId || undefined,
    title,
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
    orientation: normalizeSliderOrientation(
      readNestedValue(record, [
        "orientacao",
        "orientation",
        "tipo",
        "dispositivo",
      ]),
    ),
    status: status as string | boolean | undefined,
    published: isSliderPublished(status),
    order: readNestedNumber(record, ["ordem", "position", "order", "posicao"]),
    createdAt,
    updatedAt: updatedAt || undefined,
  };
}

export function mapSliderResponsesToSlideData(
  data: Array<SlideBackendResponse | AnyRecord>,
  orientation: SliderOrientation = "DESKTOP",
  options?: { assumePublishedWhenStatusMissing?: boolean },
): SlideData[] {
  return data
    .map(normalizeSliderResponse)
    .filter(
      (item) =>
        (item.published ||
          (options?.assumePublishedWhenStatusMissing &&
            item.status === undefined)) &&
        item.orientation === orientation &&
        item.image,
    )
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      id: item.order || index + 1,
      image: item.image,
      alt: item.imageTitle || item.title,
      link: item.link,
      overlay: false,
    }));
}
