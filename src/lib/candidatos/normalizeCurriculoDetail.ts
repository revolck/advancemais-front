import type { Curriculo } from "@/api/candidatos/types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function unwrapCurriculoPayload(raw: unknown): UnknownRecord {
  const root = asRecord(raw);
  if (!root) return {};

  const data = asRecord(root.data);
  if (data) return data;

  const curriculo = asRecord(root.curriculo);
  if (curriculo) return curriculo;

  return root;
}

function pickFirstArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;

  const record = asRecord(value);
  if (!record) return null;

  for (const nestedValue of Object.values(record)) {
    if (Array.isArray(nestedValue)) {
      return nestedValue;
    }
  }

  return null;
}

function pickGroupedArray(
  value: unknown,
  primaryKey: string,
): unknown[] | UnknownRecord {
  if (Array.isArray(value)) return value;

  const record = asRecord(value);
  if (!record) return [];

  const primary = record[primaryKey];
  if (Array.isArray(primary)) return record;

  return pickFirstArray(record) ?? [];
}

export function normalizeCurriculoDetail(
  raw: unknown,
  fallbackUsuarioId = "",
): Curriculo {
  const safe = unwrapCurriculoPayload(raw);

  return {
    id: String(safe.id ?? ""),
    usuarioId: String(safe.usuarioId ?? fallbackUsuarioId),
    titulo: String(safe.titulo ?? "Currículo"),
    resumo: typeof safe.resumo === "string" ? safe.resumo : null,
    objetivo: typeof safe.objetivo === "string" ? safe.objetivo : null,
    principal: Boolean(safe.principal ?? false),
    areasInteresse:
      (asRecord(safe.areasInteresse) as Curriculo["areasInteresse"]) ?? {
        primaria: "",
      },
    preferencias: safe.preferencias ?? null,
    habilidades:
      (asRecord(safe.habilidades) as Curriculo["habilidades"]) ?? {
        tecnicas: [],
      },
    idiomas: (pickFirstArray(safe.idiomas) ?? []) as Curriculo["idiomas"],
    experiencias: pickFirstArray(safe.experiencias) ?? [],
    formacao: pickFirstArray(safe.formacao) ?? [],
    cursosCertificacoes: pickGroupedArray(
      safe.cursosCertificacoes,
      "cursos",
    ) as Curriculo["cursosCertificacoes"],
    premiosPublicacoes: pickGroupedArray(
      safe.premiosPublicacoes,
      "premios",
    ) as Curriculo["premiosPublicacoes"],
    acessibilidade: safe.acessibilidade ?? null,
    consentimentos: safe.consentimentos ?? null,
    ultimaAtualizacao: String(
      safe.ultimaAtualizacao ?? safe.atualizadoEm ?? "",
    ),
    criadoEm: String(safe.criadoEm ?? ""),
    atualizadoEm: String(safe.atualizadoEm ?? ""),
  };
}
