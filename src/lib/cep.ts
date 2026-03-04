const VIACEP_ENDPOINT = "https://viacep.com.br/ws";
const BRASIL_API_ENDPOINT = "https://brasilapi.com.br/api/cep/v1";
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

async function fetchWithTimeout(
  url: string,
  timeoutMs: number = CEP_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function lookupViaCep(cleanedCep: string): Promise<CepLookupResult | null> {
  try {
    const response = await fetchWithTimeout(`${VIACEP_ENDPOINT}/${cleanedCep}/json/`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.erro) {
      return { error: "CEP não encontrado" };
    }

    return {
      cep: normalizeCep(cleanedCep),
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
      complement: data.complemento ?? "",
    };
  } catch {
    return null;
  }
}

async function lookupBrasilApi(cleanedCep: string): Promise<CepLookupResult | null> {
  try {
    const response = await fetchWithTimeout(`${BRASIL_API_ENDPOINT}/${cleanedCep}`);

    if (response.status === 404) {
      return { error: "CEP não encontrado" };
    }

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      cep: normalizeCep(cleanedCep),
      street: data.street ?? "",
      neighborhood: data.neighborhood ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      complement: "",
    };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return { error: "Tempo excedido ao buscar CEP" };
    }
    return null;
  }
}

export async function lookupCep(rawCep: string): Promise<CepLookupResult> {
  const cleaned = rawCep.replace(/\D/g, "");

  if (cleaned.length !== 8) {
    return { error: "CEP deve conter 8 dígitos" };
  }

  const viaCepResult = await lookupViaCep(cleaned);
  if (viaCepResult) {
    return viaCepResult;
  }

  const brasilApiResult = await lookupBrasilApi(cleaned);
  if (brasilApiResult) {
    return brasilApiResult;
  }

  return { error: "Erro ao buscar CEP" };
}
