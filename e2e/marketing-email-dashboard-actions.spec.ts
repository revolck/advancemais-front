import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

const failedEmailId = "email-failed";
const sentEmailId = "email-sent";

function buildListResponse(step: "initial" | "processing" | "sent") {
  const failedWorkflowStatus =
    step === "sent"
      ? "ENVIADO"
      : step === "processing"
        ? "PROCESSANDO"
        : "FALHOU";

  const failedDeliveryStatus =
    step === "sent" ? "SENT" : step === "processing" ? "PROCESSING" : "FAILED";

  const failedDeliveryReferenceAt =
    step === "sent" ? "2026-07-04T17:10:00.000Z" : null;

  return {
    success: true,
    emails: [
      {
        id: failedEmailId,
        nome: "Campanha com falha",
        status: "PUBLICADO",
        workflowStatus: failedWorkflowStatus,
        deliveryReferenceAt: failedDeliveryReferenceAt,
        tipo: "CAMPANHA",
        assunto: "Assunto com falha",
        previewText: null,
        templateSlug: "blank",
        settingsConfig: {
          deliveryMode: "NOW",
          deliveryStatus: failedDeliveryStatus,
          processingStartedAt:
            step === "processing" ? "2026-07-04T17:00:00.000Z" : null,
          lastSentAt: failedDeliveryReferenceAt,
          lastError:
            step === "initial" ? "Falha simulada para reenvio." : null,
          trackOpens: true,
          trackClicks: true,
        },
        destinatariosEstimados: 1,
        criadoPorId: "user-admin",
        atualizadoPorId: "user-admin",
        criadoPor: null,
        atualizadoPor: {
          id: "user-admin",
          nomeCompleto: "Filipe Admin",
          avatarUrl: null,
        },
        criadoEm: "2026-07-04T16:00:00.000Z",
        atualizadoEm: "2026-07-04T16:05:00.000Z",
      },
      {
        id: sentEmailId,
        nome: "Campanha enviada",
        status: "PUBLICADO",
        workflowStatus: "ENVIADO",
        deliveryReferenceAt: "2026-07-04T16:30:00.000Z",
        tipo: "CAMPANHA",
        assunto: "Assunto enviado",
        previewText: null,
        templateSlug: "blank",
        settingsConfig: {
          deliveryMode: "NOW",
          deliveryStatus: "SENT",
          processingStartedAt: null,
          lastSentAt: "2026-07-04T16:30:00.000Z",
          lastError: null,
          trackOpens: true,
          trackClicks: true,
        },
        destinatariosEstimados: 8,
        criadoPorId: "user-admin",
        atualizadoPorId: "user-admin",
        criadoPor: null,
        atualizadoPor: {
          id: "user-admin",
          nomeCompleto: "Filipe Admin",
          avatarUrl: null,
        },
        criadoEm: "2026-07-04T15:30:00.000Z",
        atualizadoEm: "2026-07-04T16:30:00.000Z",
      },
    ],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    },
  };
}

test.describe("Dashboard de e-mails marketing", () => {
  test("bloqueia ações para enviado e mostra feedback consistente no reenviar", async ({
    page,
  }) => {
    test.slow();

    let listRequestCount = 0;

    await page.route("**/api/v1/website/emails-marketing/options/filters", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            users: [
              {
                id: "user-admin",
                nomeCompleto: "Filipe Admin",
                avatarUrl: null,
              },
            ],
          },
        }),
      });
    });

    await page.route("**/api/v1/website/emails-marketing?*", async (route) => {
      listRequestCount += 1;

      const body =
        listRequestCount === 1
          ? buildListResponse("initial")
          : listRequestCount === 2
            ? buildListResponse("processing")
            : buildListResponse("sent");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });

    await page.route(`**/api/v1/website/emails-marketing/${failedEmailId}`, async (route) => {
      if (route.request().method() !== "PUT") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            ...buildListResponse("processing").emails[0],
          },
        }),
      });
    });

    await loginAsAdmin(page);
    await page.goto("/dashboard/marketing/emails");

    const failedRow = page.locator("tbody tr").filter({ hasText: "Campanha com falha" }).first();
    const sentRow = page.locator("tbody tr").filter({ hasText: "Campanha enviada" }).first();

    await expect(failedRow).toBeVisible();
    await expect(sentRow).toBeVisible();

    await expect(sentRow.getByLabel("Visualizar e-mail")).toBeVisible();
    await expect(sentRow.getByLabel("Duplicar e-mail")).toBeVisible();
    await expect(sentRow.getByLabel("Enviar e-mail")).toHaveCount(0);
    await expect(sentRow.getByLabel("Reenviar e-mail")).toHaveCount(0);
    await expect(sentRow.getByLabel("Editar e-mail")).toHaveCount(0);
    await expect(sentRow.getByLabel("Excluir e-mail")).toHaveCount(0);

    await failedRow.getByLabel("Reenviar e-mail").click();

    await expect(page.getByText("Reenvio iniciado.")).toBeVisible();
    await expect(failedRow.getByText("Processando")).toBeVisible();
    await expect(failedRow.getByLabel("Editar e-mail")).toBeDisabled();
    await expect(failedRow.getByLabel("Duplicar e-mail")).toBeDisabled();
    await expect(failedRow.getByLabel("Excluir e-mail")).toBeDisabled();

    await expect
      .poll(async () => listRequestCount, {
        timeout: 10_000,
      })
      .toBeGreaterThanOrEqual(3);

    await expect(failedRow.getByText("Enviado")).toBeVisible();
    await expect(failedRow).toContainText("04/07/2026");
    await expect(failedRow).not.toContainText("\n-\n");
    await expect(failedRow.getByLabel("Visualizar e-mail")).toBeVisible();
    await expect(failedRow.getByLabel("Duplicar e-mail")).toBeVisible();
    await expect(failedRow.getByLabel("Reenviar e-mail")).toHaveCount(0);
    await expect(failedRow.getByLabel("Editar e-mail")).toHaveCount(0);
    await expect(failedRow.getByLabel("Excluir e-mail")).toHaveCount(0);
  });

  test("mantém campanha reprocessável quando o reenvio falha novamente", async ({
    page,
  }) => {
    test.slow();

    let listRequestCount = 0;

    await page.route("**/api/v1/website/emails-marketing/options/filters", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            users: [
              {
                id: "user-admin",
                nomeCompleto: "Filipe Admin",
                avatarUrl: null,
              },
            ],
          },
        }),
      });
    });

    await page.route("**/api/v1/website/emails-marketing?*", async (route) => {
      listRequestCount += 1;

      const body =
        listRequestCount === 1
          ? buildListResponse("initial")
          : listRequestCount === 2
            ? buildListResponse("processing")
            : {
                ...buildListResponse("initial"),
                emails: [
                  {
                    ...buildListResponse("initial").emails[0],
                    workflowStatus: "FALHOU",
                    deliveryReferenceAt: null,
                    settingsConfig: {
                      ...buildListResponse("initial").emails[0].settingsConfig,
                      deliveryStatus: "FAILED",
                      processingStartedAt: null,
                      lastSentAt: null,
                      lastError: "Falha simulada persistida pelo worker.",
                    },
                  },
                  buildListResponse("initial").emails[1],
                ],
              };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });

    await page.route(`**/api/v1/website/emails-marketing/${failedEmailId}`, async (route) => {
      if (route.request().method() !== "PUT") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            ...buildListResponse("processing").emails[0],
          },
        }),
      });
    });

    await loginAsAdmin(page);
    await page.goto("/dashboard/marketing/emails");

    const failedRow = page.locator("tbody tr").filter({ hasText: "Campanha com falha" }).first();

    await expect(failedRow).toBeVisible();
    await failedRow.getByLabel("Reenviar e-mail").click();

    await expect(page.getByText("Reenvio iniciado.")).toBeVisible();
    await expect(failedRow.getByText("Processando")).toBeVisible();
    await expect(failedRow.getByLabel("Editar e-mail")).toBeDisabled();
    await expect(failedRow.getByLabel("Duplicar e-mail")).toBeDisabled();
    await expect(failedRow.getByLabel("Excluir e-mail")).toBeDisabled();

    await expect
      .poll(async () => listRequestCount, {
        timeout: 10_000,
      })
      .toBeGreaterThanOrEqual(3);

    await expect(page.getByText("Falha simulada persistida pelo worker.")).toBeVisible();
    await expect(failedRow.getByText("Falhou")).toBeVisible();
    await expect(failedRow.getByLabel("Reenviar e-mail")).toBeVisible();
    await expect(failedRow.getByLabel("Editar e-mail")).toBeVisible();
    await expect(failedRow.getByLabel("Excluir e-mail")).toBeVisible();
    await expect(failedRow).toContainText("-");
  });
});
