import type { SelectOption } from "@/components/ui/custom/select";

export interface IBGEEstadoResponse {
  sigla: string;
  nome: string;
}

export interface IBGEMunicipioResponse {
  nome: string;
}

export type EstadoOption = SelectOption;
export type CidadeOption = SelectOption;

export const BRASIL_ESTADO_OPTIONS: EstadoOption[] = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function normalizeEstadoUf(value?: string | null): string {
  const normalized = (value ?? "").trim();
  if (!normalized) return "";

  const upper = normalized.toUpperCase();
  const byValue = BRASIL_ESTADO_OPTIONS.find((option) => option.value === upper);
  if (byValue) return byValue.value;

  const byLabel = BRASIL_ESTADO_OPTIONS.find(
    (option) => normalizeText(option.label) === normalizeText(normalized),
  );

  return byLabel?.value ?? upper;
}

export async function fetchCidadesByUf(
  uf: string,
): Promise<CidadeOption[]> {
  const normalizedUf = normalizeEstadoUf(uf);
  if (!normalizedUf) return [];

  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${normalizedUf}/municipios?orderBy=nome`,
  );

  if (!response.ok) {
    throw new Error("Erro ao carregar cidades");
  }

  const data: IBGEMunicipioResponse[] = await response.json();

  return data.map((city) => ({
    value: city.nome,
    label: city.nome,
    searchKeywords: [city.nome],
  }));
}
