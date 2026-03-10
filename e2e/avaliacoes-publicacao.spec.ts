import { expect, test, type Page } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

type AvaliacaoApiItem = {
  id: string;
  titulo?: string;
  nome?: string;
  status?: string;
  turmaId?: string | null;
  turma?: { id?: string | null } | null;
};

type AvaliacaoApiListResponse = {
  success?: boolean;
  data?: AvaliacaoApiItem[];
};

type AvaliacaoApiMutationResponse = {
  success?: boolean;
  data?: {
    id: string;
    status?: string;
    turmaId?: string | null;
  };
  code?: string;
  message?: string;
};

const E2E_PREFIX = "E2E Avaliacao Sem Turma";
const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;
const ADMIN_DOCUMENTO = process.env.E2E_ADMIN_DOCUMENTO ?? "08705420440";
const ADMIN_SENHA = process.env.E2E_ADMIN_SENHA ?? "Fili25061995*";

async function loginAsAdminOrSkip(page: Page) {
  await loginAsAdmin(page);
}

async function loginApiAsAdmin(): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/v1/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documento: ADMIN_DOCUMENTO,
      senha: ADMIN_SENHA,
    }),
  });

  const body = (await response.json()) as { token?: string; message?: string };

  if (!response.ok || !body?.token) {
    throw new Error(
      `Falha ao autenticar na API para o E2E: ${body?.message || response.status}`
    );
  }

  return body.token;
}

async function apiFetch<T>(
  token: string,
  path: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<{ status: number; body: T }> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    body: init?.body,
  });

  const text = await response.text();
  let body: unknown = {};

  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = text;
  }

  return { status: response.status, body: body as T };
}

function getAvaliacaoStatusEfetivo(avaliacao: AvaliacaoApiItem | null | undefined) {
  const status = String(avaliacao?.status || "RASCUNHO").toUpperCase();
  const hasTurma =
    (typeof avaliacao?.turmaId === "string" && avaliacao.turmaId.trim().length > 0) ||
    (avaliacao?.turma &&
      typeof avaliacao.turma === "object" &&
      typeof avaliacao.turma.id === "string" &&
      avaliacao.turma.id.trim().length > 0);

  if (status === "PUBLICADA" && !hasTurma) {
    return "RASCUNHO";
  }

  return status;
}

async function criarAvaliacaoSemTurma(token: string) {
  const timestamp = Date.now();
  const payload = {
    tipo: "ATIVIDADE",
    titulo: `${E2E_PREFIX} ${timestamp}`,
    modalidade: "ONLINE",
    obrigatoria: true,
    valePonto: true,
    valeNota: true,
    tipoAtividade: "PERGUNTA_RESPOSTA",
    descricao: "Avaliação E2E criada sem turma vinculada.",
    peso: 5,
    dataInicio: "2026-12-20",
    dataFim: "2026-12-21",
    horaInicio: "10:00",
    horaTermino: "12:00",
    duracaoMinutos: 120,
  };

  const response = await apiFetch<{
    success?: boolean;
    data?: AvaliacaoApiItem;
    avaliacao?: AvaliacaoApiItem;
  }>(token, "/api/v1/cursos/avaliacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const avaliacaoCriada = response.body?.data || response.body?.avaliacao;

  if (response.status >= 400 || !avaliacaoCriada?.id) {
    throw new Error(
      `Não foi possível criar avaliação sem turma para o E2E: ${JSON.stringify(
        response.body
      )}`
    );
  }

  return avaliacaoCriada!;
}

async function excluirAvaliacaoSePossivel(token: string, avaliacaoId?: string) {
  if (!avaliacaoId) return;
  await apiFetch(token, `/api/v1/cursos/avaliacoes/${avaliacaoId}`, {
    method: "DELETE",
  });
}

test.describe("Avaliações - publicação exige turma", () => {
  test("mantém avaliação sem turma em rascunho e bloqueia publicação", async ({
    page,
  }) => {
    await loginAsAdminOrSkip(page);
    const token = await loginApiAsAdmin();

    let avaliacaoId: string | undefined;
    let avaliacaoTitulo: string | undefined;

    try {
      const criada = await criarAvaliacaoSemTurma(token);
      avaliacaoId = criada.id;
      avaliacaoTitulo = criada.titulo || criada.nome;

      const publishResponse = await apiFetch<AvaliacaoApiMutationResponse>(
        token,
        `/api/v1/cursos/avaliacoes/${avaliacaoId}/publicar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicar: true }),
        }
      );

      expect(publishResponse.status).toBe(409);
      expect(publishResponse.body.code).toBe(
        "AVALIACAO_PUBLICACAO_EXIGE_TURMA_VINCULADA"
      );

      await page.goto("/dashboard/cursos/atividades-provas");
      await page.waitForLoadState("networkidle");

      const row = page
        .getByText(avaliacaoTitulo || "")
        .locator("xpath=ancestor::tr[1]");
      await expect(row).toBeVisible();
      await expect(row.getByText("Rascunho")).toBeVisible();

      await page.goto(`/dashboard/cursos/atividades-provas/${avaliacaoId}`);
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByRole("heading", { name: /Detalhe da Atividade|Detalhe da Prova/i })
      ).toBeVisible();
      await expect(page.getByText(avaliacaoTitulo || "", { exact: true })).toBeVisible();
      await expect(page.getByText("RASCUNHO")).toBeVisible();
      await expect(
        page.getByText("Vincule uma turma antes de publicar esta avaliação.")
      ).toBeVisible();

      await page.getByRole("button", { name: "Ações" }).click();
      await expect(page.getByText("Publicar", { exact: true })).toHaveCount(0);
    } finally {
      await excluirAvaliacaoSePossivel(token, avaliacaoId);
    }
  });

  test("mantém status efetivo rascunho para avaliação sem turma na listagem e no detalhe", async ({
    page,
  }) => {
    await loginAsAdminOrSkip(page);
    const token = await loginApiAsAdmin();

    let avaliacaoId: string | undefined;
    let avaliacaoTitulo: string | undefined;

    try {
      const criada = await criarAvaliacaoSemTurma(token);
      avaliacaoId = criada.id;
      avaliacaoTitulo = criada.titulo || criada.nome;

      const detalheResponse = await apiFetch<{
        success?: boolean;
        data?: AvaliacaoApiItem;
        avaliacao?: AvaliacaoApiItem;
      }>(token, `/api/v1/cursos/avaliacoes/${avaliacaoId}`);

      expect(detalheResponse.status).toBe(200);

      const avaliacaoRetornada =
        detalheResponse.body.data || detalheResponse.body.avaliacao;

      expect(getAvaliacaoStatusEfetivo(avaliacaoRetornada)).toBe("RASCUNHO");

      await page.goto(`/dashboard/cursos/atividades-provas/${avaliacaoId}`);
      await page.waitForLoadState("networkidle");
      await expect(page.getByText("RASCUNHO")).toBeVisible();

      await page.goto("/dashboard/cursos/atividades-provas");
      await page.waitForLoadState("networkidle");
      const row = page
        .getByText(avaliacaoTitulo || "")
        .locator("xpath=ancestor::tr[1]");
      await expect(row).toBeVisible();
      await expect(row.getByText("Rascunho")).toBeVisible();
    } finally {
      await excluirAvaliacaoSePossivel(token, avaliacaoId);
    }
  });
});
