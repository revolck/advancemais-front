import { test, expect } from "@playwright/test";

/**
 * E2E - Cadastro de Turma (fluxo mínimo)
 *
 * Observação:
 * - Este teste depende do app rodando em http://localhost:3001.
 * - Ele usa o backend real (igual aos outros specs do projeto).
 */
import { getAdminApiAuth, loginAsAdmin } from "./helpers/auth";

type ApiItemBase = {
  id: string;
  nome?: string;
  titulo?: string;
  tipo?: string;
  cursoId?: string | null;
};

type CursosListResponse = {
  data?: ApiItemBase[];
};

type AulasListResponse = {
  data?: ApiItemBase[];
};

type AvaliacoesListResponse = {
  data?: ApiItemBase[];
};

type MutationResponse<T> = {
  success?: boolean;
  data?: T;
  aula?: T;
  avaliacao?: T;
  message?: string;
  code?: string;
};

type CreatedTemplate = {
  id: string;
  titulo: string;
};

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;
const E2E_PREFIX = "E2E Turma Builder";

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

function toApiDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10);
}

async function clickVisibleCalendarDay(page: any, day: number) {
  const dayMatcher = new RegExp(`^${day}$`);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const cell = page
      .locator("[role='grid']:visible [role='gridcell']:not([disabled])")
      .filter({ hasText: dayMatcher })
      .first();

    try {
      await cell.waitFor({ state: "visible", timeout: 5000 });
      await cell.scrollIntoViewIfNeeded();
      await cell.click({ timeout: 5000 });
      return;
    } catch (error) {
      if (attempt === 4) {
        throw error;
      }
      await page.waitForTimeout(150);
    }
  }
}

async function pickRangeByLabel(
  page: any,
  label: string,
  from: Date,
  to: Date,
  root?: any
) {
  // DatePickerRangeCustom renderiza a label em um wrapper interno e o trigger
  // como sibling dentro do container principal.
  const scope = root ?? page;
  const container = scope
    .getByText(label, { exact: true })
    .locator("xpath=ancestor::div[contains(@class,'space-y-2')][1]")
    .first();
  const trigger = container
    .locator("button, [role='button']")
    .filter({ hasNotText: "Recarregar" })
    .first();
  await trigger.waitFor({ state: "visible", timeout: 20000 });
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).toBeEnabled({ timeout: 20000 });
  await trigger.click();

  const visibleCalendars = page.locator("[role='grid']:visible");
  await visibleCalendars.first().waitFor({ state: "visible" });

  await clickVisibleCalendarDay(page, from.getDate());
  await page.waitForTimeout(150);
  await clickVisibleCalendarDay(page, to.getDate());
}

async function loginAsAdminOrSkip(page: any) {
  await loginAsAdmin(page);
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

async function criarAulaTemplate(
  token: string,
  cursoId: string | undefined,
  periodo: { inicio: Date; fim: Date }
): Promise<CreatedTemplate> {
  const timestamp = Date.now();
  const titulo = `${E2E_PREFIX} Aula ${timestamp}`;
  const response = await apiFetch<MutationResponse<ApiItemBase>>(token, "/api/v1/cursos/aulas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo,
      descricao: "Template de aula criado automaticamente para o E2E de turma.",
      modalidade: "ONLINE",
      tipoLink: "YOUTUBE",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duracaoMinutos: 60,
      obrigatoria: true,
      status: "RASCUNHO",
      dataInicio: toApiDate(periodo.inicio),
      dataFim: toApiDate(periodo.fim),
      horaInicio: "10:00",
      horaFim: "11:00",
      ...(cursoId ? { cursoId } : {}),
    }),
  });

  const aulaCriada = response.body?.data || response.body?.aula;

  if (response.status >= 400 || !aulaCriada?.id) {
    throw new Error(`Falha ao criar template de aula para o E2E: ${JSON.stringify(response.body)}`);
  }

  return { id: aulaCriada.id, titulo };
}

async function criarAvaliacaoTemplate(
  token: string,
  cursoId: string | undefined,
  tipo: "PROVA" | "ATIVIDADE",
  periodo: { inicio: Date; fim: Date }
): Promise<CreatedTemplate> {
  const timestamp = Date.now();
  const titulo =
    tipo === "PROVA"
      ? `${E2E_PREFIX} Prova ${timestamp}`
      : `${E2E_PREFIX} Atividade ${timestamp}`;
  const payload =
    tipo === "PROVA"
      ? {
          tipo,
          titulo,
          modalidade: "ONLINE",
          obrigatoria: true,
          valePonto: true,
          peso: 5,
          ...(cursoId ? { cursoId } : {}),
          dataInicio: toApiDate(periodo.inicio),
          dataFim: toApiDate(periodo.fim),
          horaInicio: "12:00",
          horaTermino: "13:00",
          duracaoMinutos: 60,
          recuperacaoFinal: false,
          questoes: [
            {
              enunciado: "Questão E2E de múltipla escolha",
              tipo: "MULTIPLA_ESCOLHA",
              alternativas: [
                { texto: "Alternativa correta", correta: true },
                { texto: "Alternativa incorreta", correta: false },
              ],
            },
          ],
        }
      : {
          tipo,
          titulo,
          modalidade: "ONLINE",
          obrigatoria: true,
          valePonto: true,
          peso: 5,
          ...(cursoId ? { cursoId } : {}),
          dataInicio: toApiDate(periodo.inicio),
          dataFim: toApiDate(periodo.fim),
          horaInicio: "14:00",
          horaTermino: "15:00",
          duracaoMinutos: 60,
          tipoAtividade: "PERGUNTA_RESPOSTA",
          descricao: "Atividade criada automaticamente para o E2E de turma.",
        };

  const response = await apiFetch<MutationResponse<ApiItemBase>>(token, "/api/v1/cursos/avaliacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const avaliacaoCriada = response.body?.data || response.body?.avaliacao;

  if (response.status >= 400 || !avaliacaoCriada?.id) {
    throw new Error(`Falha ao criar template de ${tipo.toLowerCase()} para o E2E: ${JSON.stringify(response.body)}`);
  }

  return { id: avaliacaoCriada.id, titulo };
}

async function excluirAulaTemplate(token: string, aulaId?: string) {
  if (!aulaId) return;
  await apiFetch(token, `/api/v1/cursos/aulas/${aulaId}`, { method: "DELETE" });
}

async function excluirAvaliacaoTemplate(token: string, avaliacaoId?: string) {
  if (!avaliacaoId) return;
  await apiFetch(token, `/api/v1/cursos/avaliacoes/${avaliacaoId}`, { method: "DELETE" });
}

async function selecionarCursoParaOCenario(token: string) {
  const cursosResponse = await apiFetch<CursosListResponse>(token, "/api/v1/cursos?page=1&pageSize=200");
  const cursos = Array.isArray(cursosResponse.body?.data) ? cursosResponse.body.data : [];

  if (cursosResponse.status >= 400 || cursos.length === 0) {
    throw new Error("Pré-condição ausente: nenhum curso disponível para o cadastro de turma.");
  }

  return [...cursos]
    .filter((curso) => curso.id && curso.nome)
    .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"))[0];
}

async function criarTemplatesParaCurso(token: string, cursoId: string) {
  const hoje = new Date();
  const aula = await criarAulaTemplate(token, undefined, {
    inicio: addDays(hoje, 4),
    fim: addDays(hoje, 4),
  });
  const prova = await criarAvaliacaoTemplate(token, undefined, "PROVA", {
    inicio: addDays(hoje, 5),
    fim: addDays(hoje, 5),
  });
  const atividade = await criarAvaliacaoTemplate(token, undefined, "ATIVIDADE", {
    inicio: addDays(hoje, 6),
    fim: addDays(hoje, 6),
  });

  return { aula, prova, atividade };
}

async function pickFirstOptionFromSelect(page: any, label: string) {
  const container = page.getByText(label, { exact: true }).locator("..");
  const trigger = container.locator("button, [role=\"combobox\"]").first();
  await expect(trigger).toBeVisible({ timeout: 15000 });

  const reloadButton = container.getByRole("button", { name: /Recarregar/i });
  if (await trigger.isDisabled()) {
    if (await reloadButton.count()) {
      await reloadButton.first().click();
    }
    await expect(trigger).toBeEnabled({ timeout: 40000 });
  }

  await expect(trigger).toBeEnabled({ timeout: 20000 });
  await trigger.click();

  const options = page.locator("[role='option']:visible, [cmdk-item]:visible");
  await options.first().waitFor({ state: "visible", timeout: 10000 });

  const count = await options.count();
  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index);
    const text = ((await option.textContent()) ?? "").trim().toLowerCase();
    if (!text || text.includes("selecione")) continue;
    await option.click();
    return;
  }

  throw new Error(`Nenhuma opção válida encontrada para o select "${label}"`);
}

async function pickOptionFromSelectByLabel(page: any, label: string, optionLabel: string) {
  const container = page.getByText(label, { exact: true }).locator("..");
  const trigger = container.locator("button, [role=\"combobox\"]").first();
  await expect(trigger).toBeVisible({ timeout: 15000 });
  await expect(trigger).toBeEnabled({ timeout: 20000 });
  await trigger.click();

  const option = page
    .locator("[role='option']:visible, [cmdk-item]:visible")
    .filter({ hasText: optionLabel })
    .first();
  await option.waitFor({ state: "visible", timeout: 10000 });
  await option.click();
}

async function pickFirstDialogComboboxOption(page: any, optionLabel: string) {
  const dialog = page.getByRole("dialog").last();
  const trigger = dialog.getByRole("combobox").first();
  await expect(trigger).toBeVisible({ timeout: 15000 });
  await expect(trigger).toBeEnabled({ timeout: 20000 });
  await trigger.click();

  const option = page
    .locator("[role='option']:visible, [cmdk-item]:visible")
    .filter({ hasText: optionLabel })
    .first();
  await option.waitFor({ state: "visible", timeout: 10000 });
  await option.click();
}

async function pickRangeInOpenDialog(page: any, from: Date, to: Date) {
  const dialog = page.getByRole("dialog").last();
  await pickRangeByLabel(page, "Período", from, to, dialog);
}

function getBuilderPalette(page: any) {
  return page
    .getByText("Componentes", { exact: true })
    .locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]");
}

async function clickBuilderItemTitle(page: any, title: string | RegExp) {
  const itemTitle = page
    .locator("span.flex-1.min-w-0.text-sm.text-gray-900.truncate")
    .filter({ hasText: title })
    .first();
  await itemTitle.waitFor({ state: "visible", timeout: 15000 });
  await itemTitle.click();
}

async function selectFirstTemplateOption(page: any) {
  const options = page.locator("[role='option']:visible, [cmdk-item]:visible");
  await options.first().waitFor({ state: "visible", timeout: 10000 });
  const count = await options.count();

  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index);
    const text = ((await option.textContent()) ?? "").trim().toLowerCase();
    if (!text || text.includes("selecione") || text.includes("sem opção")) {
      continue;
    }
    await option.click();
    return;
  }

  throw new Error("Nenhuma opção de template disponível para seleção.");
}

test.describe("Cadastro de Turmas", () => {
  test("cria turma padrão com aula/prova/atividade", async ({ page }) => {
    await loginAsAdminOrSkip(page);
    const auth = await getAdminApiAuth();
    const curso = await selecionarCursoParaOCenario(auth.token);
    const templatesCriados = await criarTemplatesParaCurso(auth.token, curso.id);

    try {
      await page.goto("/dashboard/cursos/turmas/cadastrar");
      await page.waitForLoadState("networkidle");

      // Step 1 - selecionar estrutura "Padrão"
      await page.getByRole("radio", { name: /Padrão/i }).click();
      await page.getByRole("button", { name: /Avançar/i }).click();

      // Step 2 - preencher dados iniciais
      await pickOptionFromSelectByLabel(page, "Curso", String(curso.nome || ""));
      const turmaNome = `Turma E2E ${Date.now()}`;
      await page.getByLabel("Nome da Turma").fill(turmaNome);

      const today = new Date();
      const inscrFrom = addDays(today, 1);
      const inscrTo = addDays(today, 2);
      const turmaFrom = addDays(today, 3);
      const turmaTo = addDays(today, 15);

      await pickRangeByLabel(page, "Inscrições", inscrFrom, inscrTo);
      await pickRangeByLabel(page, "Período da Turma", turmaFrom, turmaTo);

      await pickFirstOptionFromSelect(page, "Turno");
      await pickOptionFromSelectByLabel(page, "Modalidade", "Online");

      await page.getByRole("button", { name: /Avançar/i }).click();

      // Step 3 - Estrutura (já vem com Aula + Prova). Adicionar 1 Atividade.
      const palette = getBuilderPalette(page);
      await palette.getByText("Atividade", { exact: true }).click();

      // Abrir o editor do primeiro item (aula) e selecionar uma aula
      await clickBuilderItemTitle(page, /Aula/i);
      await pickFirstDialogComboboxOption(page, templatesCriados.aula.titulo);
      await pickRangeInOpenDialog(page, turmaFrom, addDays(turmaFrom, 1));
      await page.getByRole("button", { name: "Salvar" }).click();

      // Abrir o editor da prova e selecionar uma prova
      await clickBuilderItemTitle(page, /^Prova$/);
      await pickFirstDialogComboboxOption(page, templatesCriados.prova.titulo);
      await page.getByRole("button", { name: "Salvar" }).click();

      // Abrir o editor da atividade e selecionar uma atividade
      await clickBuilderItemTitle(page, /^Atividade$/);
      await pickFirstDialogComboboxOption(page, templatesCriados.atividade.titulo);
      await page.getByRole("button", { name: "Salvar" }).click();

      // Step 4
      await page.getByRole("button", { name: /Avançar/i }).click();
      await page
        .getByRole("button", { name: /Cadastrar turma|Criar turma|Finalizar|Confirmar/i })
        .click();
      await page.waitForURL("**/dashboard/cursos/turmas", { timeout: 15000 });
      await page.getByRole("textbox", { name: /Pesquisar turma/i }).fill(turmaNome);
      await page.getByRole("button", { name: /^Pesquisar$/i }).click();
      await expect(page.getByText(turmaNome, { exact: false })).toBeVisible({ timeout: 15000 });
    } finally {
      await excluirAulaTemplate(auth.token, templatesCriados.aula.id);
      await excluirAvaliacaoTemplate(auth.token, templatesCriados.prova.id);
      await excluirAvaliacaoTemplate(auth.token, templatesCriados.atividade.id);
    }
  });
});
