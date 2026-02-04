import { test, expect } from "@playwright/test";

/**
 * E2E - Cadastro de Turma (fluxo mínimo)
 *
 * Observação:
 * - Este teste depende do app rodando em http://localhost:3001.
 * - Ele usa o backend real (igual aos outros specs do projeto).
 */
import { loginAsAdmin } from "./helpers/auth";

function formatPtBr(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function pickRangeByLabel(page: any, label: string, from: Date, to: Date) {
  // DatePickerRangeCustom usa um botão como trigger; a label fica acima.
  const container = page.getByText(label, { exact: true }).locator("..");
  const trigger = container.locator("button").first();
  await trigger.click();

  await page.getByRole("grid").waitFor({ state: "visible" });
  await page.getByRole("gridcell", { name: formatPtBr(from) }).click();
  await page.getByRole("gridcell", { name: formatPtBr(to) }).click();
}

async function pickFirstOptionFromSelect(page: any, label: string) {
  const container = page.getByText(label, { exact: true }).locator("..");
  await container.locator("button, [role=\"combobox\"]").first().click();
  const option = page.locator("[role='option']").first();
  await option.waitFor({ state: "visible" });
  await option.click();
}

test.describe("Cadastro de Turmas", () => {
  test("cria turma padrão com aula/prova/atividade", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard/cursos/turmas/cadastrar");
    await page.waitForLoadState("networkidle");

    // Step 1 - selecionar estrutura "Padrão"
    await page.getByRole("radio", { name: /Padrão/i }).click();
    await page.getByRole("button", { name: /Avançar/i }).click();

    // Step 2 - preencher dados iniciais
    await pickFirstOptionFromSelect(page, "Curso");
    await page.getByLabel("Nome da Turma").fill(`Turma E2E ${Date.now()}`);

    const today = new Date();
    const inscrFrom = addDays(today, 1);
    const inscrTo = addDays(today, 2);
    const turmaFrom = addDays(today, 3);
    const turmaTo = addDays(today, 15);

    await pickRangeByLabel(page, "Inscrições", inscrFrom, inscrTo);
    await pickRangeByLabel(page, "Período da Turma", turmaFrom, turmaTo);

    await pickFirstOptionFromSelect(page, "Turno");
    await pickFirstOptionFromSelect(page, "Modalidade");

    await page.getByRole("button", { name: /Avançar/i }).click();

    // Step 3 - Estrutura (já vem com Aula + Prova). Adicionar 1 Atividade e 1 Aula.
    await page.getByText("Atividade", { exact: true }).click();
    await page.getByText("Aula", { exact: true }).click();

    // Abrir o editor do primeiro item (aula) e selecionar uma aula
    await page.getByText(/^Aula/i).first().click();
    await page.getByText("Selecionar aula").click();
    await page.locator("[role='option']").first().click();
    // Período obrigatório: definir um range dentro do período da turma
    await pickRangeByLabel(page, "Período", turmaFrom, addDays(turmaFrom, 1));
    await page.getByRole("button", { name: "Salvar" }).click();

    // Abrir o editor da prova e selecionar uma prova
    await page.getByText(/^Prova/i).first().click();
    await page.getByText("Selecionar prova").click();
    await page.locator("[role='option']").first().click();
    await pickRangeByLabel(page, "Período", addDays(turmaFrom, 2), addDays(turmaFrom, 3));
    await page.getByRole("button", { name: "Salvar" }).click();

    // Abrir o editor da atividade e selecionar uma atividade
    await page.getByText(/^Atividade/i).first().click();
    await page.getByText("Selecionar atividade").click();
    await page.locator("[role='option']").first().click();
    await pickRangeByLabel(page, "Período", addDays(turmaFrom, 4), addDays(turmaFrom, 5));
    await page.getByRole("button", { name: "Salvar" }).click();

    // Step 4
    await page.getByRole("button", { name: /Avançar/i }).click();
    await page.getByRole("button", { name: /Criar turma|Finalizar|Confirmar/i }).click();

    // Espera um toast de sucesso (texto pode variar; valida pelo título mais estável)
    await expect(page.getByText(/Turma criada com sucesso/i)).toBeVisible();
  });
});

