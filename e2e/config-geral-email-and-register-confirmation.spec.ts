import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test.describe("Config Geral e cadastro", () => {
  test("abre modal de teste de e-mail e envia destinatário informado", async ({
    page,
  }) => {
    let capturedBody: Record<string, unknown> | null = null;

    await page.route("**/api/v1/email/test/email", async (route) => {
      capturedBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            simulated: true,
          },
          message: "Teste simulado com sucesso.",
        }),
      });
    });

    await loginAsAdmin(page);
    await page.goto("/dashboard/config/geral", { waitUntil: "networkidle" });

    await page.getByRole("tab", { name: /e-mails/i }).click();
    await page.getByRole("button", { name: /^testar$/i }).click();

    await expect(
      page.getByRole("heading", { name: "Testar envio de e-mail" }),
    ).toBeVisible();

    await page.getByLabel("E-mail de destino").fill("qa@advancemais.com");
    await page.getByRole("button", { name: /enviar teste/i }).click();

    await expect.poll(() => capturedBody).not.toBeNull();
    expect(capturedBody).toMatchObject({
      email: "qa@advancemais.com",
      type: "config-geral",
    });

    await expect(page.getByText(/o teste foi simulado para/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Testar envio de e-mail" }),
    ).not.toBeVisible();
  });

  test("exibe modal de confirmação antes de redirecionar no cadastro", async ({
    page,
  }) => {
    await page.route("**/api/v1/usuarios/registrar", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Cadastro realizado com sucesso.",
        }),
      });
    });

    await page.route("https://auth.advancemais.com/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>login</body></html>",
      });
    });

    await page.goto("/auth/register", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /escolher candidato/i }).click();
    await page.getByLabel("Nome completo").fill("Candidato Teste");
    await page.getByLabel("CPF").fill("123.456.789-09");
    await page.getByLabel("Telefone/Whatsapp").fill("(82) 99999-0001");
    await page.getByLabel("Email").fill("candidato.teste@advancemais.com");
    await page.getByLabel("Senha").fill("Senha@123");
    await page.getByLabel("Confirmar senha").fill("Senha@123");
    await page.getByLabel(/concordo com os/i).click();
    await page.getByRole("button", { name: /criar conta/i }).click();

    await expect(
      page.getByRole("heading", { name: "Confirme seu e-mail" }),
    ).toBeVisible();
    await expect(
      page.getByText(/enviamos um link de confirmação para ativar a sua conta/i),
    ).toBeVisible();
    await expect(page.getByText(/c\*+@advancemais\.com/i)).toBeVisible();

    await page.getByRole("button", { name: "Eu entendi" }).click();
    await page.waitForURL("https://auth.advancemais.com/login");
  });
});
