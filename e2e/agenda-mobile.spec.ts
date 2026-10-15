import { expect, test, type Page } from "@playwright/test";
import { capturar, json, prepararPainelDoAluno, semVazamentoLateral, TELAS } from "./helpers/painel";

/** Agenda no celular sem mudar o desktop. Eventos simulados de outubro/2026. */

const EVENTOS = [
  { id: "a1", tipo: "AULA", titulo: "Aula: Rotinas fiscais", dataInicio: "2026-10-15T16:00:00.000Z", dataFim: "2026-10-15T18:00:00.000Z", modalidadeLabel: "Online" },
  { id: "a2", tipo: "ATIVIDADE", titulo: "Atividade: Escrituração fiscal", dataInicio: "2026-10-15T20:00:00.000Z", dataFim: "2026-10-15T21:00:00.000Z" },
  { id: "a3", tipo: "PROVA", titulo: "Prova: Módulo 2", dataInicio: "2026-10-15T22:00:00.000Z", dataFim: "2026-10-15T23:00:00.000Z" },
  { id: "a4", tipo: "AULA", titulo: "Aula: Obrigações acessórias", dataInicio: "2026-10-20T16:00:00.000Z", dataFim: "2026-10-20T18:00:00.000Z", modalidadeLabel: "Presencial" },
  { id: "a5", tipo: "TURMA_FIM", titulo: "Fim da turma Analista Fiscal", dataInicio: "2026-10-30T12:00:00.000Z", dataFim: "2026-10-30T12:00:00.000Z" },
];

async function abrirAgenda(page: Page) {
  await prepararPainelDoAluno(page, (url, route) =>
    url.pathname === "/api/v1/agenda" ? json(route, { eventos: EVENTOS }) : undefined
  );
  await page.goto("/dashboard/agenda", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".fc").first()).toBeVisible({ timeout: 60000 });
  await page.waitForTimeout(1200);
}

for (const tela of TELAS) {
  test.describe(`agenda ${tela.nome}`, () => {
    test.use({ viewport: tela.viewport, isMobile: tela.celular, hasTouch: tela.celular });

    test("agenda do mês", async ({ page }) => {
      await abrirAgenda(page);
      await semVazamentoLateral(page, tela.viewport.width);
      await capturar(page, `${tela.nome}-agenda`);
    });
  });
}

test.describe("agenda no celular: comportamento", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("abre em lista legível; Semana não aparece; Mês continua disponível", async ({ page }) => {
    await abrirAgenda(page);
    // Lista: título inteiro do evento, não "1 Au"
    await expect(page.getByText("Aula: Rotinas fiscais")).toBeVisible();
    await expect(page.locator(".fc-list").first()).toBeVisible();

    await page.getByRole("combobox").filter({ hasText: "Lista" }).tap();
    await expect(page.getByRole("option", { name: "Mês" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Dia" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Semana" })).toHaveCount(0);

    await page.getByRole("option", { name: "Mês" }).tap();
    await expect(page.locator(".fc-daygrid").first()).toBeVisible();
    // 3 eventos no dia 15: 1 aparece e o resto vira "+2 mais"
    await expect(page.getByText("+2 mais")).toBeVisible();
    await semVazamentoLateral(page, 390);
  });
});

test.describe("agenda no desktop: continua igual", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("abre no Mês com Semana disponível", async ({ page }) => {
    await abrirAgenda(page);
    await expect(page.locator(".fc-daygrid").first()).toBeVisible();
    await page.getByRole("combobox").filter({ hasText: "Mês" }).last().click();
    await expect(page.getByRole("option", { name: "Semana" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Lista" })).toHaveCount(0);
  });
});
