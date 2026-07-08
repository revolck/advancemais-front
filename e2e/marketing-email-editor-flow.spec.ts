import { expect, test } from "@playwright/test";

import { getAdminApiAuth, loginAsAdmin } from "./helpers/auth";

test.describe("Editor de e-mail marketing", () => {
  test("separa validação e envio sem duplicidade e publica agendamento", async ({
    page,
  }) => {
    test.slow();

    const runtimeErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        runtimeErrors.push(message.text());
      }
    });

    const campaignName = `E2E Email ${Date.now()}`;
    await loginAsAdmin(page);

    await page.goto("/dashboard/marketing/emails/editor?template=blank&step=configuracao");

    await page.getByLabel("Nome da campanha").fill(campaignName);

    await page.getByRole("button", { name: "Adicionar destinatários" }).click();
    await expect(page.getByRole("dialog", { name: "Destinatários" })).toBeVisible();

    await page.getByLabel("Enviar para").click();
    await page.getByRole("option", { name: "Contatos individuais" }).click();

    const contactsDialog = page.getByRole("dialog", { name: "Destinatários" });
    await contactsDialog
      .locator('button[aria-pressed="false"]')
      .first()
      .click();
    await contactsDialog.getByRole("button", { name: "Salvar" }).click();

    await page.getByRole("button", { name: "Adicionar assunto" }).click();
    const subjectDialog = page.getByRole("dialog", { name: "Assunto" });
    await expect(subjectDialog).toBeVisible();
    await subjectDialog.locator("input").first().fill("Assunto E2E");
    await subjectDialog.locator("textarea").first().fill("Prévia E2E da campanha");
    await subjectDialog.getByRole("button", { name: "Salvar" }).click();

    await page.getByRole("button", { name: "Continuar para criação" }).click();
    await expect(page).toHaveURL(/step=criacao/);

    await page.getByRole("button", { name: "Continuar para validação" }).click();
    await expect(page).toHaveURL(/step=validacao/);
    await expect(page.getByText("Configuração preenchida")).toHaveCount(0);
    await expect(page.getByText("Conteúdo do e-mail montado")).toHaveCount(0);

    await page.getByRole("button", { name: "Continuar para envio" }).click();
    await expect(page).toHaveURL(/step=envio/);

    await page.getByText("Agendado para", { exact: false }).waitFor({
      state: "detached",
    }).catch(() => undefined);
    await expect(page.getByText(/^Agendado para /)).toHaveCount(0);

    await page.getByLabel("Agendar para mais tarde").check();
    await expect(page.getByText(/^Agendado para /)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Agendar envio" }),
    ).toBeEnabled();

    await page.getByRole("button", { name: "Agendar envio" }).click();
    await expect(page.getByText("Campanha preparada e publicada.")).toBeVisible();

    const urlMatch = page.url().match(/emails\/([^/]+)\/editar/);
    expect(urlMatch?.[1]).toBeTruthy();

    const auth = await getAdminApiAuth();
    const response = await page.request.get(
      `http://localhost:3000/api/v1/website/emails-marketing/${urlMatch?.[1]}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      },
    );
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body?.data?.status).toBe("PUBLICADO");
    expect(body?.data?.settingsConfig?.deliveryMode).toBe("SCHEDULED");
    expect(body?.data?.settingsConfig?.scheduledAt).toBeTruthy();

    expect(
      runtimeErrors.filter((message) =>
        message.includes("DialogContent requires a DialogTitle"),
      ),
    ).toEqual([]);
  });
});
