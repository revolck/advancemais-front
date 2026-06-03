import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { getAdminApiAuth, loginAsAdmin } from "./helpers/auth";

type ConfigCategory =
  | "mercadopago"
  | "emails"
  | "agenda"
  | "logs"
  | "uploads"
  | "integracoes";

type ConfigItem = {
  key: string;
  label: string;
  type: string;
  value?: string | number | boolean | null;
};

type ConfigGroup = {
  category: ConfigCategory;
  label: string;
  items: ConfigItem[];
};

type ConfigListResponse = {
  success: boolean;
  data: ConfigGroup[];
};

const BOOLEAN_LABELS = {
  true: "Sim, deixar ativo",
  false: "Não, deixar desligado",
} as const;

const MP_MODE_LABELS = {
  production: "Produção",
  test: "Teste",
} as const;

const LOG_LEVEL_LABELS: Record<string, string> = {
  fatal: "Fatal",
  error: "Erro",
  warn: "Aviso",
  info: "Informações padrão",
  debug: "Diagnóstico",
  trace: "Detalhado",
  silent: "Sem logs",
};

const SELECT_CASES: Array<{
  category: ConfigCategory;
  tabLabel: string;
  key: string;
}> = [
  { category: "mercadopago", tabLabel: "Mercado Pago", key: "mp_active_mode" },
  {
    category: "mercadopago",
    tabLabel: "Mercado Pago",
    key: "assinaturas_emails_enabled",
  },
  {
    category: "mercadopago",
    tabLabel: "Mercado Pago",
    key: "assinaturas_assistida_pix_boleto",
  },
  {
    category: "mercadopago",
    tabLabel: "Mercado Pago",
    key: "cron_boleto_enabled",
  },
  {
    category: "mercadopago",
    tabLabel: "Mercado Pago",
    key: "cron_reconciliation_enabled",
  },
  {
    category: "mercadopago",
    tabLabel: "Mercado Pago",
    key: "cron_cobranca_enabled",
  },
  { category: "emails", tabLabel: "E-mails", key: "brevo_sms_unicode" },
  { category: "emails", tabLabel: "E-mails", key: "brevo_template_cache" },
  { category: "emails", tabLabel: "E-mails", key: "brevo_preload_templates" },
  {
    category: "emails",
    tabLabel: "E-mails",
    key: "email_verification_required",
  },
  { category: "agenda", tabLabel: "Agenda", key: "agenda_cron_aulas_enabled" },
  { category: "agenda", tabLabel: "Agenda", key: "agenda_cron_provas_enabled" },
  {
    category: "agenda",
    tabLabel: "Agenda",
    key: "agenda_cron_entrevistas_enabled",
  },
  { category: "logs", tabLabel: "Logs", key: "log_level" },
  { category: "logs", tabLabel: "Logs", key: "enable_console_log" },
  { category: "logs", tabLabel: "Logs", key: "enable_file_log" },
];

async function loginAsAdminOrSkip(page: Page) {
  try {
    await loginAsAdmin(page);
  } catch (error) {
    test.skip(
      true,
      `Login admin indisponível para o E2E: ${(error as Error).message}`,
    );
  }
}

async function fetchConfigGroups(request: APIRequestContext) {
  const auth = await getAdminApiAuth();
  const response = await request.get("/api/v1/configuracoes/geral", {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      Accept: "application/json",
    },
  });

  expect(response.ok()).toBe(true);
  const body = (await response.json()) as ConfigListResponse;
  expect(body.success).toBe(true);
  return body.data;
}

function getItem(groups: ConfigGroup[], category: ConfigCategory, key: string) {
  return groups
    .find((group) => group.category === category)
    ?.items.find((item) => item.key === key);
}

function expectedSelectLabel(item: ConfigItem) {
  if (item.key === "mp_active_mode") {
    return (
      MP_MODE_LABELS[String(item.value) as keyof typeof MP_MODE_LABELS] ??
      String(item.value ?? "")
    );
  }

  if (item.key === "log_level") {
    return LOG_LEVEL_LABELS[String(item.value)] ?? String(item.value ?? "");
  }

  if (item.type === "boolean") {
    return item.value === true ? BOOLEAN_LABELS.true : BOOLEAN_LABELS.false;
  }

  if (item.key === "cursos_installments_max") {
    const installments = Number(item.value);
    return installments === 1 ? "1x no cartão" : `${installments}x no cartão`;
  }

  return String(item.value ?? "");
}

async function openConfigPage(page: Page) {
  await page.goto("/dashboard/config/geral", { waitUntil: "networkidle" });
  await expect(page.getByRole("tab", { name: "Mercado Pago" })).toBeVisible();
}

async function openTab(page: Page, tabLabel: string) {
  await page.getByRole("tab", { name: new RegExp(`^${tabLabel}`) }).click();
}

function field(page: Page, key: string) {
  return page.getByTestId(`config-field-${key}`);
}

async function selectFieldOption(page: Page, key: string, optionLabel: string) {
  const row = field(page, key);
  await expect(row).toBeVisible();
  await row.getByRole("combobox").click();
  await page.getByRole("option", { name: optionLabel }).click();
}

async function patchCategory(
  request: APIRequestContext,
  category: ConfigCategory,
  values: Record<string, string | number | boolean>,
) {
  const auth = await getAdminApiAuth();
  const response = await request.patch(
    `/api/v1/configuracoes/geral/${category}`,
    {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        values,
        motivo: "Restauração automática do E2E Configurações > Geral",
      },
    },
  );

  expect(response.ok()).toBe(true);
}

test("selects de Configurações > Geral exibem exatamente os valores da API após hidratação", async ({
  page,
  request,
}) => {
  let groups: ConfigGroup[];
  try {
    groups = await fetchConfigGroups(request);
  } catch (error) {
    test.skip(
      true,
      `API admin indisponível para o E2E: ${(error as Error).message}`,
    );
    return;
  }

  await loginAsAdminOrSkip(page);
  await openConfigPage(page);

  for (const scenario of SELECT_CASES) {
    const item = getItem(groups, scenario.category, scenario.key);
    if (!item) continue;

    await openTab(page, scenario.tabLabel);

    const expected = expectedSelectLabel(item);
    await expect(field(page, scenario.key).getByRole("combobox")).toContainText(
      expected,
    );
  }
});

test("selects do Mercado Pago persistem após salvar e recarregar", async ({
  page,
  request,
}) => {
  test.skip(
    process.env.CONFIG_GERAL_E2E_WRITE !== "1",
    "Round-trip de escrita fica protegido por CONFIG_GERAL_E2E_WRITE=1.",
  );

  let originalGroups: ConfigGroup[];
  try {
    originalGroups = await fetchConfigGroups(request);
  } catch (error) {
    test.skip(
      true,
      `API admin indisponível para o E2E: ${(error as Error).message}`,
    );
    return;
  }
  const keys = [
    "mp_active_mode",
    "assinaturas_emails_enabled",
    "assinaturas_assistida_pix_boleto",
    "cron_reconciliation_enabled",
    "cron_cobranca_enabled",
  ];
  const originalValues = Object.fromEntries(
    keys.map((key) => {
      const item = getItem(originalGroups, "mercadopago", key);
      if (!item) throw new Error(`Configuração ${key} não encontrada`);
      return [key, item.value as string | boolean];
    }),
  ) as Record<string, string | boolean>;
  const nextValues = {
    mp_active_mode:
      originalValues.mp_active_mode === "production" ? "test" : "production",
    assinaturas_emails_enabled: !originalValues.assinaturas_emails_enabled,
    assinaturas_assistida_pix_boleto:
      !originalValues.assinaturas_assistida_pix_boleto,
    cron_reconciliation_enabled: !originalValues.cron_reconciliation_enabled,
    cron_cobranca_enabled: !originalValues.cron_cobranca_enabled,
  };

  try {
    await loginAsAdminOrSkip(page);
    await openConfigPage(page);

    await selectFieldOption(
      page,
      "mp_active_mode",
      expectedSelectLabel({
        key: "mp_active_mode",
        label: "Modo",
        type: "string",
        value: nextValues.mp_active_mode,
      }),
    );
    await selectFieldOption(
      page,
      "assinaturas_emails_enabled",
      nextValues.assinaturas_emails_enabled
        ? BOOLEAN_LABELS.true
        : BOOLEAN_LABELS.false,
    );
    await selectFieldOption(
      page,
      "assinaturas_assistida_pix_boleto",
      nextValues.assinaturas_assistida_pix_boleto
        ? BOOLEAN_LABELS.true
        : BOOLEAN_LABELS.false,
    );
    await selectFieldOption(
      page,
      "cron_reconciliation_enabled",
      nextValues.cron_reconciliation_enabled
        ? BOOLEAN_LABELS.true
        : BOOLEAN_LABELS.false,
    );
    await selectFieldOption(
      page,
      "cron_cobranca_enabled",
      nextValues.cron_cobranca_enabled
        ? BOOLEAN_LABELS.true
        : BOOLEAN_LABELS.false,
    );

    const saveResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/configuracoes/geral/mercadopago") &&
        response.request().method() === "PATCH",
    );
    await page.getByRole("button", { name: "Salvar" }).click();
    expect((await saveResponse).ok()).toBe(true);

    await page.reload({ waitUntil: "networkidle" });

    await expect(
      field(page, "mp_active_mode").getByRole("combobox"),
    ).toContainText(
      expectedSelectLabel({
        key: "mp_active_mode",
        label: "Modo",
        type: "string",
        value: nextValues.mp_active_mode,
      }),
    );
    await expect(
      field(page, "assinaturas_emails_enabled").getByRole("combobox"),
    ).toContainText(
      nextValues.assinaturas_emails_enabled
        ? BOOLEAN_LABELS.true
        : BOOLEAN_LABELS.false,
    );
    await expect(
      field(page, "assinaturas_assistida_pix_boleto").getByRole("combobox"),
    ).toContainText(
      nextValues.assinaturas_assistida_pix_boleto
        ? BOOLEAN_LABELS.true
        : BOOLEAN_LABELS.false,
    );

    const updatedGroups = await fetchConfigGroups(request);
    for (const [key, expected] of Object.entries(nextValues)) {
      expect(getItem(updatedGroups, "mercadopago", key)?.value).toBe(expected);
    }
  } finally {
    await patchCategory(request, "mercadopago", originalValues);
  }
});
