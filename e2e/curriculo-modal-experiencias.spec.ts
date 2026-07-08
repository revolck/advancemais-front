import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

import { loginAsAdmin, loginWithCredentials } from "./helpers/auth";

const ALUNO_ID = "a24aa23f-74cd-4996-b581-373435018ed0";
const VAGA_ID = "2dcffe89-18e6-4061-86e7-d73a7ef2871b";
const EXPERIENCIA_EXEMPLO = "Desenvolvedor Full Stack";

const CURRICULO_CREDENTIALS = {
  documento: process.env.E2E_CURRICULO_DOCUMENTO,
  senha: process.env.E2E_CURRICULO_SENHA,
};

async function loginCurriculoUser(page: Page) {
  if (CURRICULO_CREDENTIALS.documento && CURRICULO_CREDENTIALS.senha) {
    try {
      await loginWithCredentials(page, {
        documento: CURRICULO_CREDENTIALS.documento,
        senha: CURRICULO_CREDENTIALS.senha,
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/Muitas tentativas/i.test(message)) {
        throw error;
      }
    }
  }

  await loginAsAdmin(page);
}

async function openExperienciaTab(page: Page) {
  await expect(page.getByTestId("curriculo-tab-experiencia")).toBeVisible({
    timeout: 15000,
  });
  await page.getByTestId("curriculo-tab-experiencia").click();
}

async function getCandidateRow(page: Page) {
  const row = page.locator("tr", {
    has: page.getByText("lucas.ferreira@example.com"),
  });
  await expect(row.first()).toBeVisible({ timeout: 20000 });
  return row.first();
}

test("curriculos do aluno exibem experiencias na modal", async ({ page }) => {
  await loginCurriculoUser(page);

  await page.goto(`/dashboard/cursos/alunos/${ALUNO_ID}?tab=curriculos`, {
    waitUntil: "networkidle",
  });

  const viewButton = page.locator('[data-testid^="view-curriculo-"]').first();
  await expect(viewButton).toBeVisible({ timeout: 20000 });
  await viewButton.click();

  await openExperienciaTab(page);

  await expect(
    page.getByText("Nenhuma experiência profissional"),
  ).toHaveCount(0);
  await expect(page.getByText(EXPERIENCIA_EXEMPLO)).toBeVisible({
    timeout: 15000,
  });
});

test("download do curriculo do aluno gera PDF", async ({ page }, testInfo) => {
  await loginCurriculoUser(page);

  await page.goto(`/dashboard/cursos/alunos/${ALUNO_ID}?tab=curriculos`, {
    waitUntil: "networkidle",
  });

  const downloadButton = page
    .locator('[data-testid^="download-curriculo-"]')
    .first();
  await expect(downloadButton).toBeVisible({ timeout: 20000 });

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    downloadButton.click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.pdf$/);

  const filePath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(filePath);

  const fileBuffer = await readFile(filePath);
  expect(fileBuffer.subarray(0, 4).toString()).toBe("%PDF");
  expect(fileBuffer.byteLength).toBeGreaterThan(8_000);
});

test("vaga do recrutador/admin exibe experiencias ao visualizar candidatura", async ({
  page,
}) => {
  await loginCurriculoUser(page);

  await page.goto(`/dashboard/empresas/vagas/${VAGA_ID}`, {
    waitUntil: "networkidle",
  });

  await page.getByRole("tab", { name: "Candidatos" }).click();

  const emptyCandidatesState = page.getByText("Nenhum candidato encontrado");
  const hasNoCandidates = await emptyCandidatesState
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (hasNoCandidates) {
    test.skip(
      true,
      `A vaga ${VAGA_ID} não possui candidatos visíveis no ambiente atual.`,
    );
  }

  const detailsButton = page.getByRole("button", { name: "Ver detalhes" }).first();
  await expect(detailsButton).toBeVisible({ timeout: 20000 });
  await detailsButton.click();

  await openExperienciaTab(page);

  await expect(
    page.getByText("Nenhuma experiência profissional"),
  ).toHaveCount(0);
  await expect(page.getByText(EXPERIENCIA_EXEMPLO)).toBeVisible({
    timeout: 15000,
  });
});

test("vaga atualiza status do candidato na lista", async ({
  page,
}) => {
  await loginCurriculoUser(page);

  await page.goto(`/dashboard/empresas/vagas/${VAGA_ID}`, {
    waitUntil: "networkidle",
  });

  await page.getByRole("tab", { name: "Candidatos" }).click();

  const candidateRow = await getCandidateRow(page);
  const previousStatusText = (
    await candidateRow.locator("td").nth(4).innerText()
  ).trim();

  const editStatusButton = page.getByRole("button", { name: "Editar status" }).first();
  await expect(editStatusButton).toBeVisible({ timeout: 20000 });
  await editStatusButton.click();

  await expect(
    page.getByRole("heading", { name: "Editar Status do Candidato" }),
  ).toBeVisible({ timeout: 15000 });

  await expect(
    page.getByText("Erro ao carregar status disponíveis. Tente novamente."),
  ).toHaveCount(0);

  await expect(page.getByText("Novo Status")).toBeVisible({ timeout: 15000 });

  const statusTrigger = page
    .getByText("Novo Status")
    .locator("..")
    .getByRole("button")
    .first();
  await expect(statusTrigger).toBeVisible({ timeout: 15000 });

  await statusTrigger.click();
  const options = page.getByRole("option");
  const optionsCount = await options.count();

  let selectedStatusText: string | null = null;

  for (let index = 0; index < optionsCount; index += 1) {
    const option = options.nth(index);
    const optionText = (await option.innerText()).trim();

    if (optionText && optionText !== previousStatusText) {
      selectedStatusText = optionText;
      await option.click();
      break;
    }
  }

  expect(selectedStatusText).not.toBeNull();
  await page.getByRole("button", { name: "Salvar Alterações" }).click();

  await expect(
    page.getByRole("heading", { name: "Editar Status do Candidato" }),
  ).toHaveCount(0);

  await expect(candidateRow.getByText(String(selectedStatusText))).toBeVisible({
    timeout: 15000,
  });
  await expect(candidateRow.getByText(previousStatusText)).toHaveCount(0);
});
