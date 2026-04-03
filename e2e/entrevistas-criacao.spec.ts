import { expect, test, type Locator, type Page } from "@playwright/test";
import { ensureAdminProfileComplete, getAdminApiAuth, loginAsAdmin } from "./helpers/auth";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type EntrevistaEmpresaOpcao = {
  id: string;
  nomeExibicao: string;
  codigo?: string | null;
  cnpj?: string | null;
  email?: string | null;
  totalVagasElegiveis?: number | null;
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

type EntrevistasOverviewPayload = {
  capabilities?: {
    canCreateOnline?: boolean | null;
    google?: {
      connected?: boolean | null;
    } | null;
  } | null;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

async function loadInterviewFixtureOrSkip() {
  try {
    const auth = await getAdminApiAuth();
    const overviewPayload = await apiGet<EntrevistasOverviewPayload>(
      "/api/v1/entrevistas/overview",
      auth.token,
    );

    const canCreateOnline = overviewPayload.capabilities?.canCreateOnline ?? true;
    const googleConnected = overviewPayload.capabilities?.google?.connected ?? true;

    if (!canCreateOnline || !googleConnected) {
      test.skip(
        true,
        "Usuário admin do E2E não está apto a criar entrevista online porque o Google não está conectado.",
      );
      return null;
    }

    const empresasPayload = await apiGet<{
      items?: EntrevistaEmpresaOpcao[];
    }>("/api/v1/entrevistas/opcoes/empresas", auth.token);

    const empresa = (empresasPayload.items ?? []).find((item) => item.id);

    if (!empresa) {
      test.skip(true, "Nenhuma empresa elegível encontrada para o E2E de entrevistas.");
      return null;
    }

    const vagasPayload = await apiGet<{
      items?: EntrevistaVagaOpcao[];
    }>(
      `/api/v1/entrevistas/opcoes/vagas?empresaUsuarioId=${encodeURIComponent(empresa.id)}`,
      auth.token,
    );

    const vaga = (vagasPayload.items ?? []).find((item) => item.id);

    if (!vaga) {
      test.skip(
        true,
        `Nenhuma vaga elegível encontrada para a empresa ${empresa.nomeExibicao}.`,
      );
      return null;
    }

    const candidatosPayload = await apiGet<{
      items?: EntrevistaCandidatoOpcao[];
    }>(
      `/api/v1/entrevistas/opcoes/candidatos?vagaId=${encodeURIComponent(vaga.id)}`,
      auth.token,
    );

    const candidato = (candidatosPayload.items ?? []).find(
      (item) => item.candidaturaId && !item.entrevistaAtiva,
    );

    if (!candidato) {
      test.skip(
        true,
        `Nenhum candidato elegível sem entrevista ativa foi encontrado para a vaga ${vaga.titulo}.`,
      );
      return null;
    }

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
  } catch (error) {
    test.skip(
      true,
      `Pré-condições da API indisponíveis para o E2E de entrevistas: ${(error as Error).message}`,
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

async function selectNextAvailableDate(page: Page) {
  const container = await getFieldContainer(page, "Data");
  const trigger = container.locator('button[type="button"]').first();

  await expect(trigger).toBeEnabled({ timeout: 15000 });
  await trigger.click();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = String(tomorrow.getDate());

  const nextDayButton = page
    .locator(".rdp button:not([disabled])")
    .filter({ hasText: new RegExp(`^${escapeRegExp(tomorrowDay)}$`) })
    .first();

  if (await nextDayButton.count()) {
    await nextDayButton.click();
  } else {
    const todayButton = page.getByRole("button", { name: "Hoje" });
    await expect(todayButton).toBeVisible({ timeout: 10000 });
    await todayButton.click();
  }

  await expect(trigger).not.toContainText("Selecionar data", {
    timeout: 10000,
  });
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

async function ensureModalidade(page: Page, optionLabel: string) {
  const trigger = page
    .getByRole("combobox", {
      name: /^\s*Modalidade\s*\*?\s*$/i,
    })
    .first();

  await expect(trigger).toBeEnabled({ timeout: 15000 });

  const currentValue = (await trigger.textContent())?.trim() ?? "";
  if (currentValue.includes(optionLabel)) {
    return;
  }

  await trigger.click();

  const option = page
    .locator("[cmdk-item]:visible")
    .filter({
      hasText: new RegExp(`^\\s*${escapeRegExp(optionLabel)}\\s*$`, "i"),
    })
    .first();

  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
  await expect(trigger).toContainText(optionLabel, { timeout: 10000 });
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

test("admin consegue criar uma entrevista online pela modal do dashboard", async ({
  page,
}) => {
  await loginAsAdminOrSkip(page);

  const fixture = await loadInterviewFixtureOrSkip();
  test.skip(!fixture, "Sem dados elegíveis para criar entrevista no E2E.");
  if (!fixture) return;

  await page.goto("/dashboard/empresas/entrevistas", {
    waitUntil: "networkidle",
  });

  await expect(page.locator("h1, h2").filter({ hasText: "Entrevistas" }).first()).toBeVisible({
    timeout: 30000,
  });

  await openCreateInterviewModal(page);

  const modalTitle = page.locator('[data-slot="modal-title"]', {
    hasText: "Marcar entrevista",
  });
  await expect(modalTitle).toBeVisible({ timeout: 10000 });

  const submitButton = page.getByRole("button", { name: "Confirmar entrevista" });
  await expect(submitButton).toBeDisabled();

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

  await ensureModalidade(page, "Online");
  await selectNextAvailableDate(page);
  await fillTimeField(page, "Hora de início", "10:00");
  await fillTimeField(page, "Hora de término", "11:00");
  await fillDescricao(
    page,
    "Entrevista criada automaticamente pelo teste E2E do dashboard.",
  );

  await expect(submitButton).toBeEnabled({ timeout: 10000 });
  await submitButton.click();

  await expect(page.getByText("Entrevista marcada com sucesso.")).toBeVisible({
    timeout: 30000,
  });

  await expect(modalTitle).not.toBeVisible({ timeout: 30000 });
});
