import type {
  InputSearchApiField,
  InputSearchOption,
  InputSearchRecord,
  InputSearchResponse,
} from "../types";

export const DEFAULT_INPUT_SEARCH_FIELDS: InputSearchApiField[] = [
  "name",
  "email",
  "cod",
];

const KNOWN_ARRAY_KEYS = [
  "options",
  "items",
  "data",
  "results",
  "usuarios",
  "empresas",
  "alunos",
  "instrutores",
  "candidatos",
] as const;

function asRecord(value: unknown): InputSearchRecord {
  return value && typeof value === "object" ? (value as InputSearchRecord) : {};
}

function stringFrom(record: InputSearchRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return null;
}

function isSearchOption<TItem>(
  value: unknown
): value is InputSearchOption<TItem> {
  const record = asRecord(value);
  return typeof record.id === "string" && typeof record.label === "string";
}

export function defaultMapInputSearchItem<TItem>(
  item: TItem
): InputSearchOption<TItem> {
  const record = asRecord(item);
  const cod = stringFrom(record, [
    "cod",
    "codigo",
    "codUsuario",
    "codigoAluno",
    "codigoInstrutor",
    "codigoEmpresa",
  ]);
  const name = stringFrom(record, [
    "name",
    "nome",
    "nomeCompleto",
    "nomeFantasia",
    "razaoSocial",
    "label",
  ]);
  const email = stringFrom(record, ["email"]);
  const cpf = stringFrom(record, ["cpf"]);
  const cnpj = stringFrom(record, ["cnpj"]);
  const id =
    stringFrom(record, ["id", "_id", "uuid", "value"]) ??
    cod ??
    email ??
    name ??
    "";
  const label = name ?? email ?? cod ?? id;
  const documentValue = cpf ?? cnpj;
  const description = [cod, documentValue, email].filter(Boolean).join(" - ");

  return {
    id,
    label,
    description: description || undefined,
    metadata: {
      cod: cod ?? undefined,
      name: name ?? undefined,
      email: email ?? undefined,
      cpf: cpf ?? undefined,
      cnpj: cnpj ?? undefined,
    },
    raw: item,
  };
}

export function normalizeInputSearchResponse<TItem>(
  response: InputSearchResponse<TItem> | TItem[] | InputSearchOption<TItem>[],
  mapItem: (item: TItem) => InputSearchOption<TItem> = defaultMapInputSearchItem
) {
  const source = Array.isArray(response)
    ? response
    : KNOWN_ARRAY_KEYS.reduce<unknown[]>((acc, key) => {
        if (acc.length > 0) return acc;
        const value = (response as Record<string, unknown>)?.[key];
        return Array.isArray(value) ? value : acc;
      }, []);

  const options = source
    .map((item) => (isSearchOption<TItem>(item) ? item : mapItem(item as TItem)))
    .filter((item) => item.id && item.label);

  const pagination =
    !Array.isArray(response) && typeof response === "object"
      ? response.pagination
      : undefined;
  const total =
    pagination?.total ??
    (!Array.isArray(response) && typeof response === "object"
      ? response.total
      : undefined) ??
    options.length;

  return {
    options,
    total,
    pagination,
  };
}

export function selectionToArray<TItem>(
  value: InputSearchOption<TItem> | InputSearchOption<TItem>[] | null | undefined
) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
