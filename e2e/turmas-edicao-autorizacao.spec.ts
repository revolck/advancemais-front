import { expect, test, type Page } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

type TurmaEncontrada = {
  cursoId: string;
  turmaId: string;
  turmaNome: string;
  detalheHref: string;
};

type ApiResponse<T> = {
  status: number;
  body: T;
};

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;

async function fetchJsonInBrowser<T>(page: Page, path: string): Promise<ApiResponse<T>> {
  return page.evaluate(async (requestPath) => {
    const response = await fetch(requestPath, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();
    let body: unknown = {};

    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = text;
    }

    return {
      status: response.status,
      body,
    };
  }, path) as Promise<ApiResponse<T>>;
}

async function findAnyTurmaFromList(page: Page): Promise<TurmaEncontrada> {
  await page.goto("/dashboard/cursos/turmas", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  const links = page.locator('a[href*="/dashboard/cursos/turmas/"]');
  const count = await links.count();

  for (let index = 0; index < count; index += 1) {
    const link = links.nth(index);
    const href = await link.getAttribute("href");

    if (!href || href.includes("/editar")) continue;

    const url = new URL(href, BASE_URL);
    const segments = url.pathname.split("/").filter(Boolean);
    const turmaId = segments.at(-1);
    const cursoId = url.searchParams.get("cursoId");
    const turmaNome = (await link.textContent())?.trim() || "Turma disponível";

    if (!turmaId || !cursoId) continue;

    return {
      cursoId,
      turmaId,
      turmaNome,
      detalheHref: `${url.pathname}${url.search}`,
    };
  }

  throw new Error("Pré-condição ausente: nenhuma turma encontrada para validar a edição.");
}

async function loginAsAdminOrFail(page: Page) {
  await loginAsAdmin(page);
}

test.describe("Turmas - regras de edição após início", () => {
  test("admin não vê ações de gestão e encontra bloqueio ao acessar a edição de turma iniciada", async ({
    page,
  }) => {
    test.setTimeout(120000);

    await loginAsAdminOrFail(page);
    const turma = await findAnyTurmaFromList(page);
    const turmaDetailResponse = await fetchJsonInBrowser<any>(
      page,
      `/api/v1/cursos/${turma.cursoId}/turmas/${turma.turmaId}?includeAlunos=false&includeEstrutura=false`
    );

    if (turmaDetailResponse.status >= 400) {
      throw new Error(
        `Falha ao carregar detalhe da turma para o E2E: ${JSON.stringify(turmaDetailResponse.body)}`
      );
    }

    const turmaDetalhe = turmaDetailResponse.body?.data ?? turmaDetailResponse.body;
    const turmaIniciadaMock = {
      ...turmaDetalhe,
      status: "EM_ANDAMENTO",
      dataInicio: "2026-01-10T08:00:00.000Z",
      dataFim: turmaDetalhe?.dataFim ?? "2026-12-30T18:00:00.000Z",
      dataInscricaoInicio:
        turmaDetalhe?.dataInscricaoInicio ?? "2025-12-20T00:00:00.000Z",
      dataInscricaoFim:
        turmaDetalhe?.dataInscricaoFim ?? "2026-01-05T23:59:59.999Z",
    };

    await page.route(`**/api/v1/cursos/*/turmas/${turma.turmaId}*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(turmaIniciadaMock),
      });
    });

    await page.goto(turma.detalheHref, { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Detalhes da Turma/i })).toBeVisible();
    const headerSection = page
      .getByRole("heading", { level: 3 })
      .first()
      .locator("xpath=ancestor::section[1]");
    await expect(headerSection.locator('button:visible').filter({ hasText: "Ações" })).toHaveCount(0);

    const editHref = `/dashboard/cursos/turmas/${turma.turmaId}/editar?cursoId=${encodeURIComponent(
      turma.cursoId
    )}`;

    await page.goto(editHref, { waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("Somente o setor pedagógico pode editar uma turma após o início.")
    ).toBeVisible();
  });
});
