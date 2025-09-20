const VIACEP_ENDPOINT = "https://viacep.com.br/ws";
const CEP_TIMEOUT = 8000;

export interface CepLookupSuccess {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
}

export interface CepLookupError {
  error: string;
}

export type CepLookupResult = CepLookupSuccess | CepLookupError;

export function normalizeCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isValidCep(value: string): boolean {
  return /^\d{5}-?\d{3}$/.test(value.replace(/\s+/g, ""));
}

export async function lookupCep(rawCep: string): Promise<CepLookupResult> {
  const cleaned = rawCep.replace(/\D/g, "");

  if (cleaned.length !== 8) {
    return { error: "CEP deve conter 8 dígitos" };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CEP_TIMEOUT);

  try {
    const response = await fetch(`${VIACEP_ENDPOINT}/${cleaned}/json/`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return { error: "Não foi possível consultar o CEP" };
    }

    const data = await response.json();

    if (data.erro) {
      return { error: "CEP não encontrado" };
    }

    return {
      cep: normalizeCep(cleaned),
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
      complement: data.complemento ?? "",
    };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return { error: "Tempo excedido ao buscar CEP" };
    }
    return { error: "Erro ao buscar CEP" };
  } finally {
    window.clearTimeout(timeout);
  }
}
