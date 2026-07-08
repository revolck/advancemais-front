import { expect, test } from "@playwright/test";

import {
  ensureAdminProfileComplete,
  loginAsAdmin,
} from "./helpers/auth";

test.describe("Editor de popups", () => {
  test("salva rascunho, publica e alterna status na listagem", async ({
    page,
  }) => {
    test.slow();

    const runtimeErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        runtimeErrors.push(message.text());
      }
    });

    const popupName = `E2E Editor ${Date.now()}`;

    await ensureAdminProfileComplete();
    await loginAsAdmin(page);

    await page.goto("/dashboard/marketing/popup/editor?template=blank");

    await page.getByRole("button", { name: "Visualizar" }).click();
    await expect(
      page.getByRole("dialog", { name: "Visualização do popup" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Visualização do popup" }),
    ).toHaveCount(0);

    await page
      .getByLabel("Digite o nome do pop-up")
      .fill(popupName);

    await page
      .locator('[data-popup-target="dashboard-popup-save-draft-button"]')
      .click();

    await expect(page).toHaveURL(/\/dashboard\/marketing\/popup\/.+\/editar$/);
    await expect(page.getByText("Pop-up salvo com sucesso.")).toBeVisible();

    await page
      .locator('[data-popup-target="dashboard-popup-publish-button"]')
      .click();

    await expect(page.getByText("Pop-up salvo com sucesso.")).toBeVisible();

    await page.goto("/dashboard/marketing/popup");

    await page
      .getByPlaceholder("Buscar por nome, template ou tag...")
      .fill(popupName);
    await page.getByRole("button", { name: "Pesquisar" }).click();

    const row = page.locator("tbody tr").filter({ hasText: popupName }).first();

    await expect(row).toBeVisible();
    await expect(row.getByText("Publicado")).toBeVisible();

    await row.getByRole("button", { name: "Mover para rascunho" }).click();
    await expect(page.getByText("Pop-up movido para rascunho.")).toBeVisible();
    await expect(row.getByText("Rascunho")).toBeVisible();
    await expect(row.getByRole("button", { name: "Mover para rascunho" })).toHaveCount(0);

    await row.getByRole("link").first().click();

    await expect(page).toHaveURL(/\/dashboard\/marketing\/popup\/.+\/editar$/);
    await expect(page.getByLabel("Digite o nome do pop-up")).toHaveValue(
      popupName,
    );

    expect(
      runtimeErrors.filter((message) =>
        message.includes("DialogContent requires a DialogTitle"),
      ),
    ).toEqual([]);
  });
});
