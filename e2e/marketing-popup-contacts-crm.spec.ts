import { expect, test } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

import { ensureAdminProfileComplete, getAdminApiAuth, loginAsAdmin } from "./helpers/auth";

async function createPublishedPopup(request: APIRequestContext, nome: string) {
  const auth = await getAdminApiAuth();
  const builderTree = {
    id: "root_builder",
    kind: "ROOT",
    structure: "SINGLE",
    reverse: false,
    areas: [
      {
        id: "area_main",
        kind: "AREA",
        children: [
          {
            id: "title_primary",
            kind: "ATOMIC",
            type: "TITLE",
            content: "Lead CRM E2E",
          },
          {
            id: "paragraph_primary",
            kind: "ATOMIC",
            type: "PARAGRAPH",
            content: "Origem automatizada",
          },
          {
            id: "email_primary",
            kind: "ATOMIC",
            type: "INPUT",
            inputKind: "EMAIL",
            label: "Email",
            placeholder: "seuemail@exemplo.com",
            required: true,
          },
          {
            id: "button_primary",
            kind: "ATOMIC",
            type: "BUTTON",
            content: "Cadastrar",
          },
        ],
      },
    ],
  };

  const response = await request.post("/api/v1/website/popups", {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
    data: {
      nome,
      status: "PUBLICADO",
      dispositivo: "AMBOS",
      escopo: "WEBSITE",
      gatilho: "IMEDIATAMENTE",
      atrasoSegundos: 0,
      posicaoDesktop: "CENTRO",
      posicaoMobile: "CENTRO",
      cronograma: "EXIBIR_AGORA",
      frequencia: "SEM_LIMITE",
      redirectNovaAba: false,
      contentConfig: {
        titulo: "Lead CRM E2E",
        subtitulo: "Origem automatizada",
        botaoTexto: "Cadastrar",
        textoLegal: "Concordo em receber comunicações da Advance+.",
        builderTree,
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
      subscriptionConfig: {
        email: "QUALQUER_UM",
        whatsapp: "QUALQUER_UM",
      },
      pageRules: {
        mode: "ALL_PAGES",
        urlContains: "",
        htmlSelector: "",
        pageKey: null,
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

async function createPopupContact(
  request: APIRequestContext,
  popupId: string,
  email: string,
) {
  const response = await request.post(`/api/v1/website/popups/${popupId}/contacts`, {
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      nome: "Lead CRM Automatizado",
      email,
      telefone: "82999990001",
      tag: "crm-e2e",
      origemPath: "/newsletter/e2e",
      payload: {
        nome: "Lead CRM Automatizado",
        email,
        telefone: "82999990001",
      },
    },
  });

  expect(response.ok()).toBeTruthy();
}

async function findLeadIdByEmail(request: APIRequestContext, email: string) {
  const auth = await getAdminApiAuth();
  const response = await request.get(
    `/api/v1/website/popups/contacts?search=${encodeURIComponent(email)}&page=1&pageSize=10`,
    {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    },
  );

  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as {
    contatos?: Array<{ id: string; email?: string | null }>;
  };

  const lead = body.contatos?.find((item) => item.email === email);
  expect(lead?.id).toBeTruthy();
  return lead!.id;
}

test.describe("CRM de contatos de popup", () => {
  test("abre o detalhe consolidado do lead a partir da listagem", async ({
    page,
    request,
  }) => {
    test.slow();

    const stamp = Date.now();
    const popupId = await createPublishedPopup(request, `CRM Lead ${stamp}`);
    const email = `lead-crm-${stamp}@example.com`;

    await createPopupContact(request, popupId, email);
    const leadId = await findLeadIdByEmail(request, email);

    await ensureAdminProfileComplete();
    await loginAsAdmin(page);

    await page.goto("/dashboard/marketing/contatos");
    await page.getByPlaceholder("Buscar por nome, email, telefone ou WhatsApp...").fill(email);
    await page.getByRole("button", { name: "Pesquisar" }).click();

    const row = page.locator("tbody tr").filter({ hasText: email }).first();
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Visualizar contato" }).click();

    await expect(page).toHaveURL(new RegExp(`/dashboard/marketing/contatos/${leadId}$`));
    await expect(page.getByRole("heading", { name: "Lead CRM Automatizado" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Ações", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Salvar detalhes/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Sobre/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Histórico/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Notas/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Interesses/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Oportunidades/i })).toBeVisible();
    await expect(page.getByText(email).first()).toBeVisible();
  });
});
