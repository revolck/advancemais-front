import { Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;
const AUTH_CACHE_FILE = path.join(process.cwd(), ".tmp", "e2e-admin-auth.json");

export const ADMIN_CREDENTIALS = {
  documento: process.env.E2E_ADMIN_DOCUMENTO ?? "11111111111",
  senha: process.env.E2E_ADMIN_SENHA ?? "AdminTeste@123",
  email: process.env.E2E_ADMIN_EMAIL ?? "admin.teste@advancemais.com.br",
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

function ensureAuthCacheDir() {
  fs.mkdirSync(path.dirname(AUTH_CACHE_FILE), { recursive: true });
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

function readCachedAuth(): LoginResponse | null {
  const envToken = process.env.E2E_ADMIN_TOKEN;
  const envRefreshToken = process.env.E2E_ADMIN_REFRESH_TOKEN;
  if (envToken && envRefreshToken) {
    return {
      success: true,
      token: envToken,
      refreshToken: envRefreshToken,
      usuario: {
        role: process.env.E2E_ADMIN_ROLE,
        nomeCompleto: process.env.E2E_ADMIN_NOME,
      },
    };
  }

  if (!fs.existsSync(AUTH_CACHE_FILE)) return null;

  try {
    const cached = JSON.parse(fs.readFileSync(AUTH_CACHE_FILE, "utf8")) as LoginResponse;
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

function writeCachedAuth(auth: LoginResponse) {
  ensureAuthCacheDir();
  fs.writeFileSync(AUTH_CACHE_FILE, JSON.stringify(auth, null, 2));
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

async function autenticarAdminViaApi(): Promise<LoginResponse> {
  const cachedAuth = readCachedAuth();
  if (cachedAuth) {
    return cachedAuth;
  }

  const response = await fetch(`${BASE_URL}/api/v1/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documento: ADMIN_CREDENTIALS.documento,
      senha: ADMIN_CREDENTIALS.senha,
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

  writeCachedAuth(body);
  return body;
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
export async function loginAsAdmin(page: Page) {
  const body = await getAdminApiAuth();
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
