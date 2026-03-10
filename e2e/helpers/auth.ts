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

function ensureAuthCacheDir() {
  fs.mkdirSync(path.dirname(AUTH_CACHE_FILE), { recursive: true });
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
    const expiresAt = cached.session?.expiresAt
      ? new Date(cached.session.expiresAt).getTime()
      : Number.POSITIVE_INFINITY;

    if (!cached.token || !cached.refreshToken || Date.now() >= expiresAt) {
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

/**
 * Realiza autenticação E2E de forma determinística via API e injeta os cookies
 * que o frontend/middleware esperam.
 */
export async function loginAsAdmin(page: Page) {
  const body = await autenticarAdminViaApi();
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
