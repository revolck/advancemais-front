import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  getAdminApiAuth,
  getInstrutorApiAuth,
  loginAsInstrutor,
} from "./helpers/auth";
import {
  preencherCamposBasicos,
  preencherPeriodo,
  preencherSala,
  preencherYouTubeUrl,
  selecionarAulaObrigatoria,
  selecionarTipoLink,
} from "./helpers/aula-form";

const DASHBOARD_ROUTES = [
  {
    path: "/dashboard/cursos/alunos",
    cue: /Aluno|Alunos/i,
  },
  {
    path: "/dashboard/cursos/turmas",
    cue: /Turma|Turmas/i,
  },
  {
    path: "/dashboard/cursos/atividades-provas",
    cue: /Atividade|Atividades|Prova|Provas/i,
  },
  {
    path: "/dashboard/cursos/notas",
    cue: /Nota|Notas/i,
  },
  {
    path: "/dashboard/cursos/frequencia",
    cue: /Frequ[eê]ncia/i,
  },
  {
    path: "/dashboard/cursos/aulas",
    cue: /Aula|Aulas/i,
  },
  {
    path: "/dashboard/agenda",
    cue: /Agenda|M[eê]s|Semana|Dia/i,
  },
] as const;

const TURMA_DETAIL_ROUTE =
  "/dashboard/cursos/turmas/2aa198a1-9a66-40b0-8a43-2d58b173dca1?cursoId=2fc82d7a-8dc7-41ce-9aed-0c33223e6ff2";
const SETUP_CURSO_ID = "2fc82d7a-8dc7-41ce-9aed-0c33223e6ff2";
const SETUP_CURSO_NOME = "Gestão de Projetos Ágeis";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;

const OPENED_SELECT_OPTIONS = "[role='option']:visible, [cmdk-item]:visible";

type CreatedTurmaSetup = {
  id: string;
  nome: string;
  cursoId: string;
  cursoNome: string;
  aulaTemplateId: string;
  atividadeTemplateId: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function toApiDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10);
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

async function deleteIfExists(token: string, path: string, id?: string) {
  if (!id) return;
  await apiFetch(token, `${path}/${id}`, { method: "DELETE" });
}

async function deleteTurmaIfExists(
  token: string,
  cursoId: string,
  turmaId?: string
) {
  if (!turmaId) return;
  await apiFetch(token, `/api/v1/cursos/${cursoId}/turmas/${turmaId}`, {
    method: "DELETE",
  });
}

async function createFutureTurmaForInstrutor(): Promise<CreatedTurmaSetup> {
  const adminAuth = await getAdminApiAuth();
  const instrutorAuth = await getInstrutorApiAuth();
  const instrutorId = instrutorAuth.usuario?.id;

  if (!instrutorId) {
    throw new Error("Não foi possível identificar o id do instrutor no login E2E.");
  }

  const agora = new Date();
  const nome = `E2E Turma Instrutor ${Date.now()}`;
  const periodoAula = {
    inicio: addDays(agora, 12),
    fim: addDays(agora, 13),
  };
  const periodoAtividade = {
    inicio: addDays(agora, 14),
    fim: addDays(agora, 15),
  };

  const aulaTemplateResponse = await apiFetch<{
    data?: { id?: string; titulo?: string };
    aula?: { id?: string; titulo?: string };
    message?: string;
  }>(adminAuth.token, "/api/v1/cursos/aulas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: `E2E Template Aula Instrutor ${Date.now()}`,
      descricao: "Template temporário para setup do E2E do instrutor.",
      modalidade: "ONLINE",
      tipoLink: "YOUTUBE",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duracaoMinutos: 60,
      obrigatoria: true,
      status: "RASCUNHO",
      dataInicio: toApiDate(periodoAula.inicio),
      dataFim: toApiDate(periodoAula.fim),
      horaInicio: "10:00",
      horaFim: "11:00",
    }),
  });

  const aulaTemplate = aulaTemplateResponse.body?.data ?? aulaTemplateResponse.body?.aula;

  if (aulaTemplateResponse.status >= 400 || !aulaTemplate?.id) {
    throw new Error(
      aulaTemplateResponse.body?.message ||
        "Falha ao criar template de aula para o setup do instrutor."
    );
  }

  const atividadeTemplateResponse = await apiFetch<{
    data?: { id?: string; titulo?: string };
    avaliacao?: { id?: string; titulo?: string };
    message?: string;
  }>(adminAuth.token, "/api/v1/cursos/avaliacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: "ATIVIDADE",
      titulo: `E2E Template Atividade Instrutor ${Date.now()}`,
      modalidade: "ONLINE",
      obrigatoria: true,
      valePonto: true,
      peso: 5,
      dataInicio: toApiDate(periodoAtividade.inicio),
      dataFim: toApiDate(periodoAtividade.fim),
      horaInicio: "14:00",
      horaTermino: "15:00",
      duracaoMinutos: 60,
      tipoAtividade: "PERGUNTA_RESPOSTA",
      descricao: "Template temporário de atividade para setup do E2E.",
    }),
  });

  const atividadeTemplate =
    atividadeTemplateResponse.body?.data ??
    atividadeTemplateResponse.body?.avaliacao;

  if (atividadeTemplateResponse.status >= 400 || !atividadeTemplate?.id) {
    await deleteIfExists(adminAuth.token, "/api/v1/cursos/aulas", aulaTemplate.id);
    throw new Error(
      atividadeTemplateResponse.body?.message ||
        "Falha ao criar template de atividade para o setup do instrutor."
    );
  }

  const vinculoResponse = await apiFetch<{
    success?: boolean;
    message?: string;
  }>(adminAuth.token, "/api/v1/cursos/templates/vincular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cursoId: SETUP_CURSO_ID,
      aulaTemplateIds: [aulaTemplate.id],
      avaliacaoTemplateIds: [atividadeTemplate.id],
    }),
  });

  if (vinculoResponse.status >= 400) {
    await deleteIfExists(adminAuth.token, "/api/v1/cursos/aulas", aulaTemplate.id);
    await deleteIfExists(
      adminAuth.token,
      "/api/v1/cursos/avaliacoes",
      atividadeTemplate.id
    );
    throw new Error(
      vinculoResponse.body?.message ||
        "Falha ao vincular templates temporários ao curso."
    );
  }

  const payload = {
    estruturaTipo: "PADRAO",
    nome,
    turno: "NOITE",
    metodo: "ONLINE",
    status: "PUBLICADO",
    dataInscricaoInicio: addDays(agora, 1).toISOString(),
    dataInscricaoFim: addDays(agora, 5).toISOString(),
    dataInicio: addDays(agora, 10).toISOString(),
    dataFim: addDays(agora, 40).toISOString(),
    vagasIlimitadas: false,
    vagasTotais: 30,
    instrutorId,
    instrutorIds: [instrutorId],
    estrutura: {
      modules: [],
      standaloneItems: [
        {
          type: "AULA",
          title: "Aula setup instrutor",
          templateId: aulaTemplate.id,
          obrigatoria: true,
          instructorIds: [instrutorId],
        },
        {
          type: "ATIVIDADE",
          title: "Atividade setup instrutor",
          templateId: atividadeTemplate.id,
          obrigatoria: true,
          instructorIds: [instrutorId],
        },
      ],
    },
  };

  const response = await apiFetch<{
    data?: { id?: string; nome?: string };
    turma?: { id?: string; nome?: string };
    result?: { id?: string; nome?: string };
    id?: string;
    nome?: string;
    message?: string;
  }>(adminAuth.token, `/api/v1/cursos/${SETUP_CURSO_ID}/turmas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const turma =
    response.body?.data ??
    response.body?.turma ??
    response.body?.result ??
    response.body;

  if (response.status >= 400 || !turma?.id) {
    await deleteIfExists(
      adminAuth.token,
      "/api/v1/cursos/aulas",
      aulaTemplate.id
    );
    await deleteIfExists(
      adminAuth.token,
      "/api/v1/cursos/avaliacoes",
      atividadeTemplate.id
    );
    throw new Error(
      response.body?.message ||
        `Falha ao criar turma futura para o instrutor. Status ${response.status}.`
    );
  }

  return {
    id: turma.id,
    nome: turma.nome || nome,
    cursoId: SETUP_CURSO_ID,
    cursoNome: SETUP_CURSO_NOME,
    aulaTemplateId: aulaTemplate.id,
    atividadeTemplateId: atividadeTemplate.id,
  };
}

async function assertDashboardRouteAccessible(
  page: Page,
  path: string,
  cue?: RegExp
) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });

  if (response) {
    expect(response.status(), `status inesperado para ${path}`).toBeLessThan(
      400
    );
  }

  await page.locator("body").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1200);

  expect(page.url(), `redirecionamento inesperado em ${path}`).not.toContain(
    "/auth/login"
  );
  expect(page.url(), `acesso negado em ${path}`).not.toContain(
    "/dashboard/unauthorized"
  );

  await expect(page.locator("body")).not.toContainText(
    /P[aá]gina n[aã]o encontrada|Acesso negado|Turma n[aã]o encontrada/i,
    { timeout: 10000 }
  );

  if (cue) {
    await expect(page.locator("body")).toContainText(cue, { timeout: 15000 });
  }
}

async function hasVisibleLabel(page: Page, labelText: string) {
  const combobox = page
    .getByRole("combobox", {
      name: new RegExp(escapeRegExp(labelText), "i"),
    })
    .first();

  if (await combobox.isVisible().catch(() => false)) {
    return true;
  }

  const label = page
    .locator("label")
    .filter({
      hasText: new RegExp(`^\\s*${escapeRegExp(labelText)}(?:\\s*[*?])?\\s*$`, "i"),
    })
    .first();

  return label.isVisible().catch(() => false);
}

async function getComboboxTrigger(page: Page, labelText: string) {
  const combobox = page
    .getByRole("combobox", {
      name: new RegExp(escapeRegExp(labelText), "i"),
    })
    .first();

  if (await combobox.isVisible().catch(() => false)) {
    return combobox;
  }

  return null;
}

async function getSelectTriggerByLabel(page: Page, labelText: string) {
  const comboboxTrigger = await getComboboxTrigger(page, labelText);
  if (comboboxTrigger) return comboboxTrigger;

  try {
    const container = await getFieldContainer(page, labelText);
    const trigger = container
      .locator(
        "button[role='combobox'], button[type='button'], button:not([aria-label='Limpar seleção'])"
      )
      .first();

    if (await trigger.isVisible().catch(() => false)) {
      return trigger;
    }
  } catch {
    return null;
  }

  return null;
}

async function getFieldContainer(page: Page, labelText: string) {
  const label = page
    .locator("label")
    .filter({
      hasText: new RegExp(`^\\s*${escapeRegExp(labelText)}(?:\\s*[*?])?\\s*$`, "i"),
    })
    .first();

  await expect(label).toBeVisible({ timeout: 20000 });
  return label.locator(
    "xpath=ancestor::div[contains(@class, 'space-y-2')][1]"
  );
}

async function openSelect(page: Page, labelText: string) {
  const trigger =
    (await getSelectTriggerByLabel(page, labelText)) ??
    (await getFieldContainer(page, labelText))
      .locator(
        "button[role='combobox'], button[type='button']:not([aria-label='Limpar seleção'])"
      )
      .first();

  await expect(trigger).toBeVisible({ timeout: 15000 });
  await expect(trigger).toBeEnabled({ timeout: 20000 });
  await trigger.click();

  const options = page.locator(OPENED_SELECT_OPTIONS);
  await expect(options.first()).toBeVisible({ timeout: 10000 });
  return options;
}

async function selectFirstVisibleOption(
  options: Locator,
  skipTexts: string[] = []
) {
  const skip = skipTexts.map((text) => text.toLowerCase());
  const count = await options.count();

  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index);
    const text = ((await option.textContent()) ?? "").trim().toLowerCase();
    const disabled =
      (await option.getAttribute("aria-disabled")) === "true" ||
      (await option.getAttribute("data-disabled")) !== null;

    if (disabled || !text || text.includes("selecione")) continue;
    if (skip.some((item) => text.includes(item))) continue;

    await option.click();
    return true;
  }

  return false;
}

async function selectFirstOptionByLabel(
  page: Page,
  labelText: string,
  skipTexts: string[] = []
) {
  const options = await openSelect(page, labelText);
  const picked = await selectFirstVisibleOption(options, skipTexts);

  if (!picked) {
    throw new Error(
      `Nenhuma opção válida encontrada no select "${labelText}".`
    );
  }
}

async function maybeSelectFirstOptionByLabel(
  page: Page,
  labelText: string,
  skipTexts: string[] = []
) {
  try {
    await selectFirstOptionByLabel(page, labelText, skipTexts);
    return true;
  } catch {
    return false;
  }
}

async function selectOptionByText(
  page: Page,
  labelText: string,
  matcher: string | RegExp
) {
  const options = await openSelect(page, labelText);
  const option =
    typeof matcher === "string"
      ? options.filter({ hasText: matcher }).first()
      : options.filter({ hasText: matcher }).first();

  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
}

async function clickVisibleCalendarDay(page: Page, day: number) {
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

async function clickFirstAvailableCalendarDays(page: Page, count: number) {
  const cells = page.locator("[role='grid']:visible [role='gridcell']:not([disabled])");
  const total = await cells.count();

  if (total < count) {
    throw new Error("Calendário sem dias suficientes para selecionar o período.");
  }

  for (let index = 0; index < count; index += 1) {
    const cell = cells.nth(index);
    await cell.scrollIntoViewIfNeeded();
    await cell.click();
    await page.waitForTimeout(150);
  }
}

async function pickRangeByLabel(page: Page, label: string, from: Date, to: Date) {
  const container = await getFieldContainer(page, label);
  const trigger = container.locator("button, [role='button']").first();

  await expect(trigger).toBeVisible({ timeout: 20000 });
  await expect(trigger).toBeEnabled({ timeout: 20000 });
  await trigger.click();

  const visibleCalendars = page.locator("[role='grid']:visible");
  await visibleCalendars.first().waitFor({ state: "visible", timeout: 10000 });

  try {
    await clickVisibleCalendarDay(page, from.getDate());
    await page.waitForTimeout(150);
    await clickVisibleCalendarDay(page, to.getDate());
  } catch {
    await clickFirstAvailableCalendarDays(page, 2);
  }
}

async function fillTimeField(page: Page, labelText: string, value: string) {
  const container = await getFieldContainer(page, labelText);
  const input = container.locator("input").first();

  await expect(input).toBeVisible({ timeout: 10000 });
  await input.fill(value);
}

async function maybeSelectTurma(page: Page) {
  const selected = await maybeSelectFirstOptionByLabel(page, "Turma", [
    "sem turma",
  ]);

  if (selected) {
    await expect(
      page.getByRole("combobox", { name: /Turma/i }).first()
    ).not.toContainText(/Selecione a turma/i, {
      timeout: 10000,
    });
  }
}

async function maybeSelectModalidade(page: Page) {
  const trigger = await getComboboxTrigger(page, "Modalidade");
  if (!trigger) return;

  const isEnabled = await trigger.isEnabled().catch(() => false);
  const currentText = ((await trigger.textContent()) ?? "").trim();
  const isUnset = /selecione a modalidade/i.test(currentText);

  if (isEnabled && isUnset) {
    await selectFirstOptionByLabel(page, "Modalidade");
  }
}

async function maybeConfigureAulaForm(page: Page) {
  await page.waitForTimeout(1000);
  await maybeSelectModalidade(page);
  await page.waitForTimeout(400);

  if (await hasVisibleLabel(page, "Tipo de Link")) {
    await selecionarTipoLink(page, "YOUTUBE");
  }

  if (await hasVisibleLabel(page, "Link do YouTube")) {
    const youtubeInput = page
      .getByRole("textbox", { name: /Link do YouTube/i })
      .first();
    await expect(youtubeInput).toBeVisible({ timeout: 10000 });
    await youtubeInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }

  if (await hasVisibleLabel(page, "Data da Aula")) {
    await preencherPeriodo(page, 2, "10:00", "11:00");
  }

  if (await hasVisibleLabel(page, "Sala")) {
    await preencherSala(page, "Lab E2E Instrutor");
  }

  await selecionarAulaObrigatoria(page, true);
}

async function createAulaViaUi(page: Page, turmaNome: string) {
  const titulo = `E2E Aula Instrutor ${Date.now()}`;
  const descricao = "Aula criada automaticamente pelo E2E do instrutor.";

  await preencherCamposBasicos(page, titulo, descricao, "60");
  await selectOptionByText(page, "Turma", turmaNome);
  await page.waitForTimeout(600);

  const turmaTrigger = await getSelectTriggerByLabel(page, "Turma");
  if (turmaTrigger) {
    await expect(turmaTrigger).not.toContainText(/Selecione a turma/i, {
      timeout: 10000,
    });
  }

  await maybeSelectModalidade(page);
  const modalidadeTrigger = await getSelectTriggerByLabel(page, "Modalidade");
  if (modalidadeTrigger) {
    await expect(modalidadeTrigger).not.toContainText(
      /Selecione a modalidade/i,
      {
        timeout: 10000,
      }
    );
  }
  await maybeConfigureAulaForm(page);

  const createResponsePromise = page.waitForResponse((response) => {
    return (
      response.request().method() === "POST" &&
      response.url().includes("/api/v1/cursos/aulas")
    );
  });

  await page.getByRole("button", { name: /Criar Aula/i }).click();

  const createResponse = await createResponsePromise;
  const payload = (await createResponse.json().catch(() => ({}))) as {
    data?: { id?: string };
    aula?: { id?: string };
    success?: boolean;
    message?: string;
  };

  expect(
    createResponse.status(),
    payload?.message || "Falha ao criar aula pelo fluxo do instrutor."
  ).toBeLessThan(400);

  await expect(page).toHaveURL(/\/dashboard\/cursos\/aulas/, {
    timeout: 20000,
  });

  return payload?.data?.id ?? payload?.aula?.id;
}

async function createAtividadeViaUi(
  page: Page,
  setup: CreatedTurmaSetup
) {
  const titulo = `E2E Atividade Instrutor ${Date.now()}`;
  const hoje = new Date();
  const from = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 2);
  const to = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 3);

  await selectOptionByText(page, "Tipo", /Atividade/i);

  const tituloInput = page.locator("input[name='titulo']").first();
  await expect(tituloInput).toBeVisible({ timeout: 10000 });
  await tituloInput.fill(titulo);

  await selectOptionByText(page, "Curso", setup.cursoNome);
  await selectOptionByText(page, "Turma", setup.nome);
  await selectOptionByText(page, "Vale nota?", /Não/i);
  await selectOptionByText(page, "Tipo de Atividade", /Pergunta e Resposta/i);

  await pickRangeByLabel(page, "Período", from, to);
  await fillTimeField(page, "Hora de Início", "09:00");
  await fillTimeField(page, "Hora de Término", "10:00");
  await selectOptionByText(page, "Atividade é obrigatória?", /Sim/i);

  const perguntaTextarea = page.getByPlaceholder(
    "Digite a pergunta que os alunos deverão responder..."
  );
  await expect(perguntaTextarea).toBeVisible({ timeout: 10000 });
  await perguntaTextarea.fill(
    "Descreva em poucas linhas o objetivo principal desta atividade de teste."
  );

  const createRequestPromise = page.waitForRequest((request) => {
    return (
      request.method() === "POST" && request.url().includes("/api/v1/cursos")
    );
  });

  await page.getByRole("button", { name: /Criar Atividade/i }).click();

  const createRequest = await createRequestPromise;
  const createResponse = await page.waitForResponse(
    (response) => response.request() === createRequest
  );
  const payload = (await createResponse.json().catch(() => ({}))) as {
    data?: { id?: string };
    avaliacao?: { id?: string };
    prova?: { id?: string };
    result?: { id?: string };
    id?: string;
    success?: boolean;
    message?: string;
  };

  expect(
    createResponse.status(),
    payload?.message ||
      "Falha ao criar atividade/prova pelo fluxo do instrutor."
  ).toBeLessThan(400);

  await expect(page).toHaveURL(/\/dashboard\/cursos\/atividades-provas/, {
    timeout: 20000,
  });

  return (
    payload?.data?.id ??
    payload?.avaliacao?.id ??
    payload?.prova?.id ??
    payload?.result?.id ??
    payload?.id
  );
}

test.describe("Dashboard do instrutor", () => {
  test.describe.configure({ mode: "serial" });

  test("acessa as rotas principais do instrutor", async ({ page }) => {
    test.slow();
    await loginAsInstrutor(page);

    for (const route of DASHBOARD_ROUTES) {
      await test.step(`acessar ${route.path}`, async () => {
        await assertDashboardRouteAccessible(page, route.path, route.cue);
      });
    }
  });

  test("visualiza a turma escopada informada", async ({ page }) => {
    await loginAsInstrutor(page);
    await assertDashboardRouteAccessible(page, TURMA_DETAIL_ROUTE, /Sobre|Inscrições/i);

    await expect(page.getByRole("link", { name: /Voltar/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Sobre", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Inscrições", { exact: true })).toBeVisible({
      timeout: 15000,
    });
  });

  test.describe("cadastros do instrutor", () => {
    let setupTurma: CreatedTurmaSetup | null = null;
    let adminToken = "";

    test.beforeAll(async () => {
      const adminAuth = await getAdminApiAuth();
      adminToken = adminAuth.token;
      setupTurma = await createFutureTurmaForInstrutor();
    });

    test.afterAll(async () => {
      await deleteTurmaIfExists(
        adminToken,
        setupTurma?.cursoId ?? SETUP_CURSO_ID,
        setupTurma?.id
      );
      await deleteIfExists(
        adminToken,
        "/api/v1/cursos/aulas",
        setupTurma?.aulaTemplateId
      );
      await deleteIfExists(
        adminToken,
        "/api/v1/cursos/avaliacoes",
        setupTurma?.atividadeTemplateId
      );
    });

    test("cadastra uma aula como instrutor", async ({ page }) => {
      test.slow();
      const auth = await getInstrutorApiAuth();
      let aulaId: string | undefined;

      if (!setupTurma) {
        throw new Error("Turma de setup não disponível para o teste de aula.");
      }

      try {
        await loginAsInstrutor(page);
        await assertDashboardRouteAccessible(
          page,
          "/dashboard/cursos/aulas/cadastrar",
          /Criar Aula|Configurações da Aula|Título da Aula/i
        );

        aulaId = await createAulaViaUi(page, setupTurma.nome);
        expect(
          aulaId,
          "A resposta de criação da aula não retornou id."
        ).toBeTruthy();
      } finally {
        await deleteIfExists(auth.token, "/api/v1/cursos/aulas", aulaId);
      }
    });

    test("cadastra uma atividade como instrutor", async ({ page }) => {
      test.slow();
      const auth = await getInstrutorApiAuth();
      let avaliacaoId: string | undefined;

      if (!setupTurma) {
        throw new Error(
          "Turma de setup não disponível para o teste de atividade."
        );
      }

      try {
        await loginAsInstrutor(page);
        await assertDashboardRouteAccessible(
          page,
          "/dashboard/cursos/atividades-provas/cadastrar",
          /Criar Atividade|Criar Prova|Título da Atividade|Título da Prova/i
        );

        avaliacaoId = await createAtividadeViaUi(page, setupTurma);
        expect(
          avaliacaoId,
          "A resposta de criação da atividade não retornou id."
        ).toBeTruthy();
      } finally {
        await deleteIfExists(
          auth.token,
          "/api/v1/cursos/avaliacoes",
          avaliacaoId
        );
      }
    });
  });
});
