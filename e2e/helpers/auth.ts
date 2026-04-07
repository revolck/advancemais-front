import { Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;
const ADMIN_AUTH_CACHE_FILE = path.join(
  process.cwd(),
  ".tmp",
  "e2e-admin-auth.json"
);
const INSTRUTOR_AUTH_CACHE_FILE = path.join(
  process.cwd(),
  ".tmp",
  "e2e-instrutor-auth.json"
);

export const ADMIN_CREDENTIALS = {
  documento: process.env.E2E_ADMIN_DOCUMENTO ?? "11111111111",
  senha: process.env.E2E_ADMIN_SENHA ?? "AdminTeste@123",
  email: process.env.E2E_ADMIN_EMAIL ?? "admin.teste@advancemais.com.br",
};

export const INSTRUTOR_CREDENTIALS = {
  documento: process.env.E2E_INSTRUTOR_DOCUMENTO ?? "55555555555",
  senha: process.env.E2E_INSTRUTOR_SENHA ?? "Instrutor@123",
  email:
    process.env.E2E_INSTRUTOR_EMAIL ?? "instrutor@advancemais.com.br",
};

type CachedAuthEnvOptions = {
  token?: string;
  refreshToken?: string;
  role?: string;
  nome?: string;
};

type E2ECredentials = {
  documento: string;
  senha: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  session?: {
    expiresAt?: string;
  };
  usuario?: {
    id?: string;
    nomeCompleto?: string;
    role?: string;
  };
};

type UserProfileResponse = {
  success?: boolean;
  message?: string;
  usuario?: {
    telefone?: string | null;
    genero?: string | null;
    dataNasc?: string | null;
    descricao?: string | null;
    enderecos?: Array<{
      cep?: string | null;
      logradouro?: string | null;
      numero?: string | null;
      bairro?: string | null;
      cidade?: string | null;
      estado?: string | null;
    }> | null;
  };
  stats?: {
    hasAddress?: boolean;
  };
};

function ensureAuthCacheDir(authCacheFile: string) {
  fs.mkdirSync(path.dirname(authCacheFile), { recursive: true });
}

function getJwtExpiration(token?: string | null): number | null {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };

    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

function readCachedAuth(
  authCacheFile: string,
  envOptions?: CachedAuthEnvOptions
): LoginResponse | null {
  const envToken = envOptions?.token;
  const envRefreshToken = envOptions?.refreshToken;
  if (envToken && envRefreshToken) {
    return {
      success: true,
      token: envToken,
      refreshToken: envRefreshToken,
      usuario: {
        role: envOptions?.role,
        nomeCompleto: envOptions?.nome,
      },
    };
  }

  if (!fs.existsSync(authCacheFile)) return null;

  try {
    const cached = JSON.parse(fs.readFileSync(authCacheFile, "utf8")) as LoginResponse;
    const now = Date.now();
    const tokenExpiresAt = getJwtExpiration(cached.token);
    const refreshTokenExpiresAt = getJwtExpiration(cached.refreshToken);
    const sessionExpiresAt = cached.session?.expiresAt
      ? new Date(cached.session.expiresAt).getTime()
      : null;

    const accessStillValid = tokenExpiresAt ? now < tokenExpiresAt - 60_000 : true;
    const refreshStillValid = refreshTokenExpiresAt ? now < refreshTokenExpiresAt - 60_000 : true;
    const sessionStillValid = sessionExpiresAt ? now < sessionExpiresAt : true;

    if (
      !cached.token ||
      !cached.refreshToken ||
      !accessStillValid ||
      !refreshStillValid ||
      !sessionStillValid
    ) {
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function writeCachedAuth(authCacheFile: string, auth: LoginResponse) {
  ensureAuthCacheDir(authCacheFile);
  fs.writeFileSync(authCacheFile, JSON.stringify(auth, null, 2));
}

function getPrimaryEndereco(profile?: UserProfileResponse["usuario"]) {
  const enderecos = profile?.enderecos ?? [];
  return enderecos[0] ?? null;
}

function isAdminProfileComplete(profile?: UserProfileResponse | null) {
  const usuario = profile?.usuario;
  const stats = profile?.stats;

  if (!usuario || !stats) return false;

  const telefoneDigits = (usuario.telefone ?? "").replace(/\D/g, "");
  const endereco = getPrimaryEndereco(usuario);

  return Boolean(
    telefoneDigits &&
      usuario.dataNasc &&
      usuario.genero &&
      stats.hasAddress &&
      endereco?.cep &&
      endereco?.logradouro &&
      endereco?.numero &&
      endereco?.bairro &&
      endereco?.cidade &&
      endereco?.estado,
  );
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init);
  const body = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(
      `${init?.method ?? "GET"} ${path} falhou com status ${response.status}: ${body?.message || "sem mensagem"}`,
    );
  }

  return body;
}

async function autenticarViaApi(options: {
  credentials: E2ECredentials;
  authCacheFile: string;
  env: CachedAuthEnvOptions;
}): Promise<LoginResponse> {
  const cachedAuth = readCachedAuth(options.authCacheFile, options.env);
  if (cachedAuth) {
    return cachedAuth;
  }

  const response = await fetch(`${BASE_URL}/api/v1/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documento: options.credentials.documento,
      senha: options.credentials.senha,
      rememberMe: false,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as LoginResponse;

  if (!response.ok) {
    throw new Error(
      `Login API falhou com status ${response.status}: ${body?.message || "sem mensagem"}`
    );
  }

  if (!body?.success || !body?.token || !body?.refreshToken) {
    throw new Error(body?.message || "Login API não retornou os tokens esperados");
  }

  writeCachedAuth(options.authCacheFile, body);
  return body;
}

async function autenticarAdminViaApi(): Promise<LoginResponse> {
  return autenticarViaApi({
    credentials: ADMIN_CREDENTIALS,
    authCacheFile: ADMIN_AUTH_CACHE_FILE,
    env: {
      token: process.env.E2E_ADMIN_TOKEN,
      refreshToken: process.env.E2E_ADMIN_REFRESH_TOKEN,
      role: process.env.E2E_ADMIN_ROLE,
      nome: process.env.E2E_ADMIN_NOME,
    },
  });
}

async function autenticarInstrutorViaApi(): Promise<LoginResponse> {
  return autenticarViaApi({
    credentials: INSTRUTOR_CREDENTIALS,
    authCacheFile: INSTRUTOR_AUTH_CACHE_FILE,
    env: {
      token: process.env.E2E_INSTRUTOR_TOKEN,
      refreshToken: process.env.E2E_INSTRUTOR_REFRESH_TOKEN,
      role: process.env.E2E_INSTRUTOR_ROLE,
      nome: process.env.E2E_INSTRUTOR_NOME,
    },
  });
}

export async function getAdminApiAuth(): Promise<
  Required<Pick<LoginResponse, "token" | "refreshToken">> & LoginResponse
> {
  const auth = await autenticarAdminViaApi();

  if (!auth.token || !auth.refreshToken) {
    throw new Error("Autenticação E2E não retornou token e refreshToken válidos.");
  }

  return auth as Required<Pick<LoginResponse, "token" | "refreshToken">> & LoginResponse;
}

export async function getInstrutorApiAuth(): Promise<
  Required<Pick<LoginResponse, "token" | "refreshToken">> & LoginResponse
> {
  const auth = await autenticarInstrutorViaApi();

  if (!auth.token || !auth.refreshToken) {
    throw new Error("Autenticação E2E do instrutor não retornou tokens válidos.");
  }

  return auth as Required<Pick<LoginResponse, "token" | "refreshToken">> &
    LoginResponse;
}

export async function ensureAdminProfileComplete() {
  const auth = await getAdminApiAuth();
  const headers = {
    Authorization: `Bearer ${auth.token}`,
    "Content-Type": "application/json",
  };

  const profile = await fetchJson<UserProfileResponse>("/api/v1/usuarios/perfil", {
    method: "GET",
    headers,
  });

  if (isAdminProfileComplete(profile)) {
    return;
  }

  const currentEndereco = getPrimaryEndereco(profile.usuario);
  const payload = {
    telefone: (profile.usuario?.telefone ?? "").replace(/\D/g, "") || "82999990000",
    genero: profile.usuario?.genero?.trim() || "MASCULINO",
    dataNasc: profile.usuario?.dataNasc || "1990-01-15T00:00:00.000Z",
    descricao: profile.usuario?.descricao ?? "Perfil preenchido automaticamente pelo E2E.",
    endereco: {
      cep: (currentEndereco?.cep ?? "").replace(/\D/g, "") || "57084028",
      logradouro: currentEndereco?.logradouro?.trim() || "Rua Manoel Pedro de Oliveira",
      numero: currentEndereco?.numero?.trim() || "245",
      bairro: currentEndereco?.bairro?.trim() || "Benedito Bentes",
      cidade: currentEndereco?.cidade?.trim() || "Maceió",
      estado: currentEndereco?.estado?.trim().toUpperCase() || "AL",
    },
  };

  await fetchJson<UserProfileResponse>("/api/v1/usuarios/perfil", {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  const updatedProfile = await fetchJson<UserProfileResponse>("/api/v1/usuarios/perfil", {
    method: "GET",
    headers,
  });

  if (!isAdminProfileComplete(updatedProfile)) {
    throw new Error("O perfil admin continua incompleto após a atualização automática do E2E.");
  }
}

/**
 * Realiza autenticação E2E de forma determinística via API e injeta os cookies
 * que o frontend/middleware esperam.
 */
async function loginWithAuthBody(
  page: Page,
  body: Required<Pick<LoginResponse, "token" | "refreshToken">> & LoginResponse
) {
  const url = new URL(BASE_URL);
  const role = body.usuario?.role;
  const firstName = body.usuario?.nomeCompleto?.split(" ")?.[0];

  await page.context().clearCookies();
  await page.context().addCookies([
    {
      name: "token",
      value: body.token!,
      url: BASE_URL,
      sameSite: "Lax",
    },
    {
      name: "refresh_token",
      value: body.refreshToken!,
      url: BASE_URL,
      sameSite: "Lax",
    },
    ...(role
      ? [
          {
            name: "user_role",
            value: role,
            url: BASE_URL,
            sameSite: "Lax" as const,
          },
        ]
      : []),
  ]);

  await page.addInitScript(([storedFirstName]) => {
    if (storedFirstName) {
      window.localStorage.setItem("userName", storedFirstName);
    }
  }, [firstName]);

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  if (page.url().includes("/auth/login")) {
    throw new Error(
      `Autenticação E2E não foi aceita pelo frontend em ${url.origin}. Verifique middleware/cookies.`
    );
  }

  await page.waitForLoadState("networkidle");
}

export async function loginAsAdmin(page: Page) {
  const body = await getAdminApiAuth();
  await loginWithAuthBody(page, body);
}

export async function loginAsInstrutor(page: Page) {
  const body = await getInstrutorApiAuth();
  await loginWithAuthBody(page, body);
}
