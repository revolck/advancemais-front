import { expect, test, type Page } from "@playwright/test";
import { ensureAdminProfileComplete, getAdminApiAuth, loginAsAdmin } from "./helpers/auth";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type EnderecoPadraoEntrevista = {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
};

type EntrevistaEmpresaOpcao = {
  id: string;
  nomeExibicao: string;
  codigo?: string | null;
  cnpj?: string | null;
  email?: string | null;
  totalVagasElegiveis?: number | null;
  enderecoPadraoEntrevista?: EnderecoPadraoEntrevista | null;
};

type EntrevistaVagaOpcao = {
  id: string;
  titulo: string;
  codigo?: string | null;
};

type EntrevistaCandidatoOpcao = {
  candidaturaId: string;
  entrevistaAtiva?: boolean | null;
  candidato: {
    id: string;
    nome: string;
    codigo?: string | null;
    email?: string | null;
    cpf?: string | null;
  };
};

type CreatedInterviewResponse = {
  id: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  modalidade?: string | null;
  agenda?: {
    criadoNoSistema?: boolean | null;
  } | null;
};

type InterviewFixture = {
  empresa: {
    label: string;
    search: string;
  };
  vaga: {
    label: string;
    search: string;
  };
  candidato: {
    label: string;
    search: string;
  };
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasRequiredPresencialAddress(
  endereco?: EnderecoPadraoEntrevista | null,
) {
  return Boolean(
    endereco?.cep?.trim() &&
      endereco?.logradouro?.trim() &&
      endereco?.numero?.trim() &&
      endereco?.bairro?.trim() &&
      endereco?.cidade?.trim() &&
      endereco?.estado?.trim(),
  );
}

function buildFutureTimesForSelectedDate(useToday: boolean) {
  if (!useToday) {
    return { start: "10:00", end: "11:00" };
  }

  const now = new Date();
  const start = new Date(now);
  start.setHours(now.getHours() + 1, 0, 0, 0);

  const end = new Date(start);
  end.setHours(start.getHours() + 1, 0, 0, 0);

  if (end.getDate() !== start.getDate()) {
    return null;
  }

  return {
    start: `${String(start.getHours()).padStart(2, "0")}:${String(
      start.getMinutes(),
    ).padStart(2, "0")}`,
    end: `${String(end.getHours()).padStart(2, "0")}:${String(
      end.getMinutes(),
    ).padStart(2, "0")}`,
  };
}

async function loginAsAdminOrSkip(page: Page) {
  try {
    await ensureAdminProfileComplete();
    await loginAsAdmin(page);
  } catch (error) {
    test.skip(
      true,
      `Login admin indisponível para o E2E: ${(error as Error).message}`,
    );
  }
}

async function apiGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new Error(
      `GET ${path} falhou com status ${response.status}: ${body?.message || "sem mensagem"}`,
    );
  }

  if (!body?.data) {
    throw new Error(`GET ${path} não retornou o payload esperado.`);
  }

  return body.data;
}

async function loadPresencialInterviewFixtureOrSkip() {
  try {
    const auth = await getAdminApiAuth();

    const empresasPayload = await apiGet<{
      items?: EntrevistaEmpresaOpcao[];
    }>("/api/v1/entrevistas/opcoes/empresas", auth.token);

    for (const empresa of empresasPayload.items ?? []) {
      if (!empresa.id || !hasRequiredPresencialAddress(empresa.enderecoPadraoEntrevista)) {
        continue;
      }

      const vagasPayload = await apiGet<{
        items?: EntrevistaVagaOpcao[];
      }>(
        `/api/v1/entrevistas/opcoes/vagas?empresaUsuarioId=${encodeURIComponent(empresa.id)}`,
        auth.token,
      );

      const vaga = (vagasPayload.items ?? []).find((item) => item.id);
      if (!vaga) continue;

      const candidatosPayload = await apiGet<{
        items?: EntrevistaCandidatoOpcao[];
      }>(
        `/api/v1/entrevistas/opcoes/candidatos?vagaId=${encodeURIComponent(vaga.id)}`,
        auth.token,
      );

      const candidato = (candidatosPayload.items ?? []).find(
        (item) => item.candidaturaId && !item.entrevistaAtiva,
      );

      if (!candidato) continue;

      return {
        empresa: {
          label: empresa.nomeExibicao,
          search:
            empresa.cnpj?.trim() ||
            empresa.email?.trim() ||
            empresa.codigo?.trim() ||
            empresa.nomeExibicao,
        },
        vaga: {
          label: vaga.titulo,
          search: vaga.codigo?.trim() || vaga.titulo,
        },
        candidato: {
          label: candidato.candidato.nome,
          search:
            candidato.candidato.cpf?.trim() ||
            candidato.candidato.email?.trim() ||
            candidato.candidato.codigo?.trim() ||
            candidato.candidato.nome,
        },
      } satisfies InterviewFixture;
    }

    test.skip(
      true,
      "Nenhuma combinação elegível com endereço presencial preenchido foi encontrada para o E2E.",
    );
    return null;
  } catch (error) {
    test.skip(
      true,
      `Pré-condições da API indisponíveis para o E2E presencial: ${(error as Error).message}`,
    );
    return null;
  }
}

async function getFieldContainer(page: Page, labelText: string) {
  const label = page
    .locator("label")
    .filter({
      hasText: new RegExp(`^\\s*${escapeRegExp(labelText)}\\s*\\*?\\s*$`, "i"),
    })
    .first();

  await expect(label).toBeVisible({ timeout: 15000 });

  return label.locator(
    'xpath=ancestor::div[contains(@class, "space-y-2")][1]',
  );
}

async function getFieldInput(page: Page, labelText: string) {
  const container = await getFieldContainer(page, labelText);
  const input = container.locator("input, textarea").first();
  await expect(input).toBeVisible({ timeout: 15000 });
  return input;
}

async function selectSearchableOption(
  page: Page,
  params: {
    label: string;
    searchText: string;
    optionLabel: string;
  },
) {
  const container = await getFieldContainer(page, params.label);
  const trigger = container.locator('button[type="button"]').first();

  await expect(trigger).toBeEnabled({ timeout: 20000 });
  await trigger.click();

  const searchInput = page.locator('input[placeholder="Buscar..."]:visible').last();
  await expect(searchInput).toBeVisible({ timeout: 10000 });
  await searchInput.fill(params.searchText);

  const option = page
    .locator("[cmdk-item]:visible")
    .filter({
      hasText: new RegExp(`^\\s*${escapeRegExp(params.optionLabel)}\\s*$`, "i"),
    })
    .first();

  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();

  await expect(trigger).toContainText(params.optionLabel, { timeout: 10000 });
}

async function selectComboboxOption(
  page: Page,
  params: {
    label: string;
    optionLabel: string;
    searchText?: string;
  },
) {
  const trigger = page
    .getByRole("combobox", {
      name: new RegExp(`^\\s*${escapeRegExp(params.label)}\\s*\\*?\\s*$`, "i"),
    })
    .first();

  await expect(trigger).toBeEnabled({ timeout: 15000 });

  const currentValue = (await trigger.textContent())?.trim() ?? "";
  if (currentValue.includes(params.optionLabel)) {
    return;
  }

  await trigger.click();

  const searchInput = page.locator('input[placeholder="Buscar..."]:visible').last();
  if (await searchInput.count()) {
    await searchInput.fill(params.searchText ?? params.optionLabel);
  }

  const option = page
    .locator("[cmdk-item]:visible")
    .filter({
      hasText: new RegExp(`^\\s*${escapeRegExp(params.optionLabel)}\\s*$`, "i"),
    })
    .first();

  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();

  await expect(trigger).toContainText(params.optionLabel, { timeout: 10000 });
}

async function selectDateInsideVisibleMonth(page: Page) {
  const container = await getFieldContainer(page, "Data");
  const trigger = container.locator('button[type="button"]').first();

  await expect(trigger).toBeEnabled({ timeout: 15000 });
  await trigger.click();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (tomorrow.getMonth() !== today.getMonth()) {
    const todayButton = page.getByRole("button", { name: "Hoje" });
    await expect(todayButton).toBeVisible({ timeout: 10000 });
    await todayButton.click();
    return { useToday: true };
  }

  const tomorrowDay = String(tomorrow.getDate());
  const nextDayButton = page
    .locator(".rdp button:not([disabled])")
    .filter({ hasText: new RegExp(`^${escapeRegExp(tomorrowDay)}$`) })
    .first();

  await expect(nextDayButton).toBeVisible({ timeout: 10000 });
  await nextDayButton.click();
  return { useToday: false };
}

async function fillTimeField(page: Page, labelText: string, value: string) {
  const input = await getFieldInput(page, labelText);
  await input.fill(value);
  await input.blur();
}

async function fillDescricao(page: Page, value: string) {
  const container = await getFieldContainer(page, "Descrição");
  const textarea = container.locator("textarea").first();
  await expect(textarea).toBeVisible({ timeout: 15000 });
  await textarea.fill(value);
}

async function fillInputValue(page: Page, labelText: string, value: string) {
  const input = await getFieldInput(page, labelText);
  await input.fill(value);
  await input.blur();
}

async function ensurePresencialAddress(page: Page) {
  await fillInputValue(page, "CEP", "57084-028");
  await fillInputValue(page, "Logradouro", "Rua Manoel Pedro de Oliveira");
  await selectSearchableOption(page, {
    label: "Estado",
    optionLabel: "Alagoas",
    searchText: "Alag",
  });
  await selectSearchableOption(page, {
    label: "Cidade",
    optionLabel: "Maceió",
    searchText: "Mace",
  });
  await fillInputValue(page, "Bairro", "Benedito Bentes");
  await fillInputValue(page, "Número", "245");
}

async function openCreateInterviewModal(page: Page) {
  const trigger = page
    .locator('[data-slot="button-custom"]')
    .filter({ hasText: /^Marcar entrevista$/i })
    .first();

  await expect(trigger).toBeVisible({ timeout: 30000 });
  await expect(trigger).toBeEnabled({ timeout: 30000 });
  await trigger.click();
}

test("admin cria entrevista presencial e a agenda devolve o evento do intervalo visível", async ({
  page,
}) => {
  await loginAsAdminOrSkip(page);

  const fixture = await loadPresencialInterviewFixtureOrSkip();
  test.skip(!fixture, "Sem dados elegíveis para criar entrevista presencial no E2E.");
  if (!fixture) return;

  await page.goto("/dashboard/empresas/entrevistas", {
    waitUntil: "networkidle",
  });

  await expect(
    page.locator("h1, h2").filter({ hasText: "Entrevistas" }).first(),
  ).toBeVisible({
    timeout: 30000,
  });

  await openCreateInterviewModal(page);

  const modalTitle = page.locator('[data-slot="modal-title"]', {
    hasText: "Marcar entrevista",
  });
  await expect(modalTitle).toBeVisible({ timeout: 10000 });

  await selectSearchableOption(page, {
    label: "Empresa",
    searchText: fixture.empresa.search,
    optionLabel: fixture.empresa.label,
  });

  await selectSearchableOption(page, {
    label: "Vaga",
    searchText: fixture.vaga.search,
    optionLabel: fixture.vaga.label,
  });

  await selectSearchableOption(page, {
    label: "Candidato",
    searchText: fixture.candidato.search,
    optionLabel: fixture.candidato.label,
  });

  await selectComboboxOption(page, {
    label: "Modalidade",
    optionLabel: "Presencial",
  });

  const { useToday } = await selectDateInsideVisibleMonth(page);
  const futureTimes = buildFutureTimesForSelectedDate(useToday);
  test.skip(
    !futureTimes,
    "Sem janela de horário futura no mesmo dia para validar entrevista presencial.",
  );
  if (!futureTimes) return;

  await fillTimeField(page, "Hora de início", futureTimes.start);
  await fillTimeField(page, "Hora de término", futureTimes.end);
  await ensurePresencialAddress(page);
  await fillDescricao(
    page,
    "Entrevista presencial criada automaticamente pelo teste E2E da agenda.",
  );

  const submitButton = page.getByRole("button", {
    name: "Confirmar entrevista",
  });
  await expect(submitButton).toBeEnabled({ timeout: 10000 });

  const createResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/entrevistas") &&
      response.request().method() === "POST",
  );

  await submitButton.click();

  const createResponse = await createResponsePromise;
  expect(createResponse.ok()).toBeTruthy();

  const createBody = (await createResponse.json().catch(() => ({}))) as ApiEnvelope<CreatedInterviewResponse>;
  const created = createBody?.data;
  expect(created?.id).toBeTruthy();
  expect(created?.modalidade).toBe("PRESENCIAL");
  expect(created?.agenda?.criadoNoSistema).toBe(true);

  await expect(modalTitle).not.toBeVisible({ timeout: 30000 });

  const agendaResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/agenda?") &&
      !response.url().includes("/agenda/aniversariantes") &&
      response.request().method() === "GET",
  );

  await page.goto("/dashboard/agenda", {
    waitUntil: "networkidle",
  });

  const agendaResponse = await agendaResponsePromise;
  expect(agendaResponse.ok()).toBeTruthy();

  const agendaBody = (await agendaResponse.json().catch(() => ({}))) as {
    eventos?: Array<{ id?: string; tipo?: string; modalidade?: string }>;
    data?: {
      eventos?: Array<{ id?: string; tipo?: string; modalidade?: string }>;
    };
  };

  const eventos = agendaBody.eventos ?? agendaBody.data?.eventos ?? [];
  expect(
    eventos.some(
      (item) =>
        item.id === created?.id &&
        item.tipo === "ENTREVISTA" &&
        item.modalidade === "PRESENCIAL",
    ),
  ).toBeTruthy();
});
