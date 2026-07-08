import { expect, test } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

import {
  ensureAdminProfileComplete,
  getAdminApiAuth,
  loginAsAdmin,
} from "./helpers/auth";

async function createDraftPopup(request: APIRequestContext, nome: string) {
  const auth = await getAdminApiAuth();
  const response = await request.post("/api/v1/website/popups", {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
    data: {
      nome,
      status: "RASCUNHO",
      dispositivo: "AMBOS",
      escopo: "WEBSITE",
      contentConfig: {
        titulo: "Popup E2E",
        subtitulo: "Fluxo automatizado",
        botaoTexto: "Salvar",
      },
      formFields: [
        {
          id: "email",
          type: "email",
          label: "Email",
          required: true,
          order: 0,
        },
      ],
      designConfig: {
        backgroundColor: "#ffffff",
        layout: "SEM_PLANO_DE_FUNDO",
        imageDisposition: "PREENCHER",
        imagePosition: "CENTRO",
        imageProportion: "50",
        showImageOnMobile: true,
      },
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as {
    data?: { id?: string };
  };

  expect(body.data?.id).toBeTruthy();
  return body.data!.id!;
}

test.describe("Dashboard de popups", () => {
  test("abre modal de confirmação e exclui popup com sucesso", async ({
    page,
    request,
  }) => {
    test.slow();

    const popupName = `E2E Popup ${Date.now()}`;
    await createDraftPopup(request, popupName);

    await ensureAdminProfileComplete();
    await loginAsAdmin(page);
    await page.goto("/dashboard/marketing/popup");

    await page.getByPlaceholder("Buscar por nome, template ou tag...").fill(popupName);
    await page.getByRole("button", { name: "Pesquisar" }).click();

    const row = page.locator("tbody tr").filter({ hasText: popupName }).first();
    await expect(row).toBeVisible();

    await row.locator("button").last().click();

    await expect(
      page.getByRole("heading", { name: "Excluir pop-up" }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog").getByText(popupName),
    ).toBeVisible();

    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(
      page.getByRole("heading", { name: "Excluir pop-up" }),
    ).toHaveCount(0);

    await row.locator("button").last().click();
    await page.getByRole("button", { name: "Excluir pop-up" }).click();

    await expect(page.locator("tbody tr").filter({ hasText: popupName })).toHaveCount(0);
  });
});
