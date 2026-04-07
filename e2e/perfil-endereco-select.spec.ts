import { expect, test, type Locator, type Page } from "@playwright/test";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;

const PERFIL_CREDENTIALS = {
  documento: process.env.E2E_PERFIL_DOCUMENTO ?? "08705420440",
  senha: process.env.E2E_PERFIL_SENHA ?? "Fili25061995*",
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  usuario?: {
    nomeCompleto?: string;
    role?: string;
  };
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loginPerfilUser(page: Page) {
  const response = await fetch(`${BASE_URL}/api/v1/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documento: PERFIL_CREDENTIALS.documento,
      senha: PERFIL_CREDENTIALS.senha,
      rememberMe: false,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as LoginResponse;

  if (!response.ok || !body.success || !body.token || !body.refreshToken) {
    test.skip(
      true,
      `Não foi possível autenticar no E2E de perfil: ${body?.message || `status ${response.status}`}`
    );
    return;
  }

  const role = body.usuario?.role;
  const firstName = body.usuario?.nomeCompleto?.split(" ")?.[0];

  await page.context().clearCookies();
  await page.context().addCookies([
    {
      name: "token",
      value: body.token,
      url: BASE_URL,
      sameSite: "Lax",
    },
    {
      name: "refresh_token",
      value: body.refreshToken,
      url: BASE_URL,
      sameSite: "Lax",
    },
    ...(role
      ? [
          {
            name: "user_role",
            value: role,
            url: BASE_URL,
            sameSite: "Lax" as const,
          },
        ]
      : []),
  ]);

  await page.addInitScript(([storedFirstName]) => {
    if (storedFirstName) {
      window.localStorage.setItem("userName", storedFirstName);
    }
  }, [firstName]);
}

async function getFieldContainer(page: Page, labelText: string): Promise<Locator> {
  const label = page
    .locator("label")
    .filter({
      hasText: new RegExp(`^\\s*${escapeRegExp(labelText)}\\s*\\*?\\s*$`, "i"),
    })
    .first();

  await expect(label).toBeVisible({ timeout: 15000 });
  return label.locator('xpath=ancestor::div[contains(@class, "space-y-2")][1]');
}

async function selectOption(page: Page, label: string, optionLabel: string) {
  const container = await getFieldContainer(page, label);
  const trigger = container.locator('button[type="button"]').first();

  await expect(trigger).toBeEnabled();
  await trigger.click();

  const searchInput = page.locator('input[placeholder="Buscar..."]:visible').last();
  await expect(searchInput).toBeVisible({ timeout: 10000 });
  await searchInput.fill(optionLabel);

  const option = page
    .locator("[cmdk-item]:visible")
    .filter({
      hasText: new RegExp(`^\\s*${escapeRegExp(optionLabel)}\\s*$`, "i"),
    })
    .first();

  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
}

test("perfil > endereco usa estado/cidade dependentes e valida obrigatórios", async ({
  page,
}) => {
  await loginPerfilUser(page);
  await page.goto("/perfil", { waitUntil: "domcontentloaded" });

  if (page.url().includes("/auth/login")) {
    test.skip(true, "Login não foi aceito pelo frontend para o usuário de perfil.");
  }

  const saveEnderecoButton = page.getByRole("button", {
    name: /Salvar endereço/i,
  });
  await expect(saveEnderecoButton).toBeVisible({ timeout: 20000 });

  const estadoContainer = await getFieldContainer(page, "Estado");
  const cidadeContainer = await getFieldContainer(page, "Cidade");
  const cidadeTrigger = cidadeContainer.locator('button[type="button"]').first();
  const estadoTrigger = estadoContainer.locator('button[type="button"]').first();

  await expect(estadoTrigger).toBeVisible();
  await expect(cidadeTrigger).toBeVisible();

  await selectOption(page, "Estado", "São Paulo");
  await expect(estadoTrigger).toContainText(/São Paulo/i, { timeout: 10000 });
  await expect(cidadeTrigger).toContainText(/Selecione a cidade/i, { timeout: 10000 });

  await selectOption(page, "Cidade", "São Paulo");
  await expect(cidadeTrigger).toContainText(/^São Paulo$/i, { timeout: 10000 });

  const cepInput = page.getByLabel("CEP");
  const numeroInput = page.getByLabel("Número");
  const logradouroInput = page.getByLabel("Logradouro");
  const bairroInput = page.getByLabel("Bairro");

  await cepInput.fill("");
  await numeroInput.fill("");
  await logradouroInput.fill("");
  await bairroInput.fill("");

  await selectOption(page, "Estado", "Alagoas");
  await expect(cidadeTrigger).toContainText(/Selecione a cidade/i, { timeout: 10000 });

  await saveEnderecoButton.click();

  await expect(page.getByText("CEP é obrigatório").first()).toBeVisible();
  await expect(page.getByText("Número é obrigatório").first()).toBeVisible();
  await expect(page.getByText("Logradouro é obrigatório").first()).toBeVisible();
  await expect(page.getByText("Bairro é obrigatório").first()).toBeVisible();
  await expect(page.getByText("Cidade é obrigatória").first()).toBeVisible();
});
