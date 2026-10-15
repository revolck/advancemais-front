import { expect, type Page, type Route } from "@playwright/test";

/**
 * Painel do aluno simulado para e2e visuais: perfil completo, cookies de teste em
 * localhost e relógio congelado. Nenhuma chamada sai para a API real.
 */

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;
export const CAPTURAS = process.env.E2E_CAPTURAS_DIR;
export const AGORA = new Date("2026-10-15T17:55:00.000Z");

export const json = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

type RotaExtra = (url: URL, route: Route) => Promise<unknown> | undefined;

export async function prepararPainelDoAluno(page: Page, extra?: RotaExtra) {
  await page.clock.setFixedTime(AGORA);
  await page.context().addCookies([
    { name: "token", value: "e2e-token", url: BASE_URL },
    { name: "user_role", value: "ALUNO_CANDIDATO", url: BASE_URL },
  ]);
  await page.addInitScript(() => window.localStorage.setItem("userName", "Luana"));

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const tratado = extra?.(url, route);
    if (tratado) return tratado;
    if (url.pathname === "/api/v1/usuarios/perfil") {
      return json(route, {
        success: true,
        message: "Perfil carregado",
        usuario: {
          id: "aluno-1",
          email: "luana@teste.com",
          nomeCompleto: "Luana Liz Galvão",
          role: "ALUNO_CANDIDATO",
          tipoUsuario: "PESSOA_FISICA",
          authId: "auth-1",
          emailVerificado: true,
          telefone: "82999990000",
          genero: "FEMININO",
          dataNasc: "1995-06-25T03:00:00.000Z",
          enderecos: [
            { id: "e1", cep: "57084028", logradouro: "Rua Teste", numero: "245", bairro: "Benedito Bentes", cidade: "Maceió", estado: "AL" },
          ],
        },
        stats: {
          accountAge: 1,
          hasCompletedProfile: true,
          hasAddress: true,
          totalOrders: 0,
          totalSubscriptions: 0,
          emailVerificationStatus: { verified: true, verifiedAt: null, tokenExpiration: null },
        },
      });
    }
    if (url.pathname === "/api/v1/candidatos/dashboard") {
      return json(route, {
        metricas: { cursosEmProgresso: 2, cursosConcluidos: 5, totalCursos: 7, totalCandidaturas: 12 },
        cursos: [],
        candidaturas: [],
      });
    }
    if (url.pathname === "/api/v1/auth/google/status") return json(route, { conectado: false });
    if (url.pathname === "/api/v1/notificacoes/contador") return json(route, { success: true, naoLidas: 3 });
    if (url.pathname === "/api/v1/website/popups/active") return json(route, []);
    return json(route, { success: true, data: [] });
  });
}

export async function capturar(page: Page, nome: string) {
  if (!CAPTURAS) return;
  await page.screenshot({ path: `${CAPTURAS}/${nome}.png`, animations: "disabled" });
}

export async function semVazamentoLateral(page: Page, largura: number) {
  const larguraDaPagina = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(larguraDaPagina).toBeLessThanOrEqual(largura);
}

export const TELAS = [
  { nome: "desktop-1440", viewport: { width: 1440, height: 900 }, celular: false },
  { nome: "desktop-1024", viewport: { width: 1024, height: 768 }, celular: false },
  { nome: "tablet-800", viewport: { width: 800, height: 1000 }, celular: false },
  { nome: "celular-390", viewport: { width: 390, height: 844 }, celular: true },
];
