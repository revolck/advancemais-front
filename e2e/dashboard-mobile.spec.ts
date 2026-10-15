import { expect, test, type Page } from "@playwright/test";
import { capturar, prepararPainelDoAluno, TELAS } from "./helpers/painel";

/**
 * Painel no celular (cabeçalho, menu lateral e conteúdo) sem mudar o desktop.
 * Tudo simulado: nenhuma chamada sai para a API real. Com E2E_CAPTURAS_DIR, salva
 * capturas (relógio congelado e animações desligadas, para comparar pixel a pixel).
 */

async function abrirPainel(page: Page) {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Cursos em Progresso").first()).toBeVisible({ timeout: 60000 });
  await page.waitForTimeout(800); // fontes e transições
}

for (const tela of TELAS) {
  test.describe(`painel ${tela.nome}`, () => {
    test.use({ viewport: tela.viewport, isMobile: tela.celular, hasTouch: tela.celular });

    test("visão geral", async ({ page }) => {
      await prepararPainelDoAluno(page);
      await abrirPainel(page);
      await capturar(page, `${tela.nome}-visao-geral`);
    });

    test("página interna (título e breadcrumb)", async ({ page }) => {
      await prepararPainelDoAluno(page);
      await page.goto("/dashboard/cursos/pagamentos", { waitUntil: "domcontentloaded" });
      await expect(page.locator("main h1").first()).toBeVisible({ timeout: 60000 });
      await page.waitForTimeout(1500);
      const larguraDaPagina = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(larguraDaPagina).toBeLessThanOrEqual(tela.viewport.width);
      await capturar(page, `${tela.nome}-pagina-interna`);
    });
  });
}

test.describe("painel no celular: comportamento", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("nada vaza para os lados e o cabeçalho cabe na tela", async ({ page }) => {
    await prepararPainelDoAluno(page);
    await abrirPainel(page);

    const larguraDaPagina = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(larguraDaPagina).toBeLessThanOrEqual(390);

    const cabecalho = page.locator("header").first();
    const botoes = cabecalho.locator("button, a");
    for (let i = 0; i < (await botoes.count()); i++) {
      const caixa = await botoes.nth(i).boundingBox();
      if (caixa) expect(caixa.x + caixa.width).toBeLessThanOrEqual(390);
    }
    // Nome do usuário só no desktop; dica do Google não fica por cima da página
    await expect(page.getByText("Conectar Google Agenda")).toBeHidden();
    await expect(cabecalho.getByLabel("Ajuda")).toBeHidden();

    // Cards de números: 2 por linha
    const primeiro = await page.getByText("Cursos em Progresso").first().boundingBox();
    const segundo = await page.getByText("Cursos Concluídos").first().boundingBox();
    expect(Math.abs(primeiro!.y - segundo!.y)).toBeLessThan(4);
  });

  test("menu lateral abre por cima do cabeçalho e fecha", async ({ page }) => {
    await prepararPainelDoAluno(page);
    await abrirPainel(page);

    await page.getByLabel("Abrir menu").tap();
    const fechar = page.getByLabel("Fechar menu");
    await expect(fechar).toBeInViewport();
    // "X" no topo da gaveta, ao lado do logo (antes flutuava no meio da tela)
    expect((await fechar.boundingBox())!.y).toBeLessThan(80);
    // O que está no canto do cabeçalho agora é o menu (ou o fundo escuro), não o cabeçalho
    const noTopo = await page.evaluate(() => {
      const el = document.elementFromPoint(370, 32);
      return el?.closest("header") ? "cabecalho" : "menu";
    });
    expect(noTopo).toBe("menu");
    await capturar(page, "celular-390-menu-lateral");

    await fechar.tap();
    // A gaveta desliza para fora da tela
    await expect(fechar).not.toBeInViewport();
  });

  test("Ajuda e Vídeos ficam no menu do usuário", async ({ page }) => {
    await prepararPainelDoAluno(page);
    await abrirPainel(page);

    await page.getByLabel("Menu do usuário").tap();
    await expect(page.getByRole("menuitem", { name: "Ajuda" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Vídeos" })).toBeVisible();
    await capturar(page, "celular-390-menu-usuario");
  });
});

test.describe("painel no desktop: continua igual", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Ajuda, Vídeos e nome no cabeçalho; sem os itens do celular no menu", async ({ page }) => {
    await prepararPainelDoAluno(page);
    await abrirPainel(page);

    const cabecalho = page.locator("header").first();
    await expect(cabecalho.getByLabel("Ajuda")).toBeVisible();
    await expect(cabecalho.getByLabel("Videos")).toBeVisible();
    await expect(cabecalho.getByText("Luana Liz Galvão")).toBeVisible();

    await page.getByLabel("Menu do usuário").click();
    await expect(page.getByRole("menuitem", { name: "Sair" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Vídeos" })).toBeHidden();
  });
});
