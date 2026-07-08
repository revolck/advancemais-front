import { expect, test } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

import {
  ensureAdminProfileComplete,
  getAdminApiAuth,
  loginAsAdmin,
} from "./helpers/auth";

async function createPublishedCourseCoupon(
  request: APIRequestContext,
  codigo: string,
) {
  const auth = await getAdminApiAuth();
  const response = await request.post("/api/v1/cupons", {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
    data: {
      codigo,
      tipoDesconto: "PORCENTAGEM",
      valorPercentual: 15,
      aplicarEm: "APENAS_CURSOS",
      aplicarEmTodosItens: true,
      limiteUsoTotalTipo: "ILIMITADO",
      limitePorUsuarioTipo: "ILIMITADO",
      periodoTipo: "ILIMITADO",
      status: "PUBLICADO",
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as {
    id?: string;
    codigo?: string;
  };

  expect(body.id).toBeTruthy();
  return body;
}

async function createPublishedBuilderPopup(
  request: APIRequestContext,
  popupName: string,
  couponId: string,
  couponCode: string,
) {
  const auth = await getAdminApiAuth();
  const response = await request.post("/api/v1/website/popups", {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
    data: {
      nome: popupName,
      status: "PUBLICADO",
      dispositivo: "AMBOS",
      escopo: "WEBSITE",
      posicaoDesktop: "CENTRO",
      posicaoMobile: "CENTRO",
      gatilho: "ATRASO",
      atrasoSegundos: 5,
      cronograma: "EXIBIR_AGORA",
      frequencia: "UMA_VEZ_A_CADA_6_HORAS",
      tag: "From PopUp",
      prioridade: 0,
      contentConfig: {
        titulo: "Popup com builder",
        subtitulo: "Fluxo salvo pela API",
        botaoTexto: "Cadastrar",
        textoLegal: "Concordo em receber comunicações da Advance+.",
        builderTree: {
          id: "root_builder_e2e",
          kind: "ROOT",
          structure: "SINGLE",
          reverse: false,
          areas: [
            {
              id: "area_builder_e2e",
              kind: "AREA",
              children: [
                {
                  id: "title_builder_e2e",
                  kind: "ATOMIC",
                  type: "TITLE",
                  content: "Popup com builder",
                },
                {
                  id: "paragraph_builder_e2e",
                  kind: "ATOMIC",
                  type: "PARAGRAPH",
                  content: "Fluxo salvo pela API",
                },
                {
                  id: "coupon_builder_e2e",
                  kind: "ATOMIC",
                  type: "COUPON",
                  couponScope: "COURSES",
                  couponId,
                  couponCaption: "Oferta exclusiva",
                  couponValue: "15% OFF",
                  couponCode,
                  couponValidity: "Cupom ativo",
                  couponVariant: "ALPHA",
                  couponTone: "PRIMARY",
                },
                {
                  id: "roulette_builder_e2e",
                  kind: "ATOMIC",
                  type: "ROULETTE",
                  rouletteScope: "COURSES",
                  rouletteNoPrizeTitle: "Quase lá!",
                  rouletteNoPrizeMessage:
                    "Ops... não foi dessa vez. Se quiser, deixe seu contato para receber a próxima oportunidade.",
                  rouletteNoPrizeButtonText: "Enviar contato",
                  rouletteNoPrizeContactFields: ["EMAIL"],
                  rouletteItems: [
                    {
                      id: "roulette_item_prize",
                      label: "Prêmio",
                      weight: 70,
                      couponId,
                      couponCode,
                      couponValue: "15% OFF",
                      couponValidity: "Cupom ativo",
                      caption: "Cupom premiado",
                      color: "#1D4ED8",
                    },
                    {
                      id: "roulette_item_retry",
                      label: "Tente novamente",
                      weight: 30,
                      isNoPrize: true,
                      color: "#0F766E",
                    },
                  ],
                },
                {
                  id: "input_email_builder_e2e",
                  kind: "ATOMIC",
                  type: "INPUT",
                  inputKind: "EMAIL",
                  label: "Email",
                  placeholder: "seuemail@exemplo.com",
                  required: true,
                },
                {
                  id: "button_builder_e2e",
                  kind: "ATOMIC",
                  type: "BUTTON",
                  content: "Cadastrar",
                },
                {
                  id: "consent_builder_e2e",
                  kind: "ATOMIC",
                  type: "CONSENT",
                  content: "Concordo em receber comunicações da Advance+.",
                },
              ],
            },
          ],
        },
      },
      formFields: [
        {
          id: "input_email_builder_e2e",
          type: "email",
          label: "Email",
          placeholder: "seuemail@exemplo.com",
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
        email: "DESCADASTRADOS_E_DESCONHECIDOS",
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

test.describe("Hidratação do builder de popups", () => {
  test("reabre popup com cupom e roleta sem perder o builderTree", async ({
    page,
    request,
  }) => {
    test.slow();

    const suffix = Date.now();
    const couponCode = `E2ECOURSE${suffix}`;
    const popupName = `E2E Builder ${suffix}`;

    const coupon = await createPublishedCourseCoupon(request, couponCode);
    const popupId = await createPublishedBuilderPopup(
      request,
      popupName,
      coupon.id!,
      couponCode,
    );

    await ensureAdminProfileComplete();
    await loginAsAdmin(page);

    await page.goto(`/dashboard/marketing/popup/${popupId}/editar`);

    await expect(page.getByLabel("Digite o nome do pop-up")).toHaveValue(
      popupName,
    );

    await page.getByRole("button", { name: "Blocos" }).click();

    await expect(page.getByText(couponCode).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Girar" }).first()).toBeVisible();

    await page.reload();

    await expect(page.getByLabel("Digite o nome do pop-up")).toHaveValue(
      popupName,
    );

    await page.getByRole("button", { name: "Blocos" }).click();

    await expect(page.getByText(couponCode).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Girar" }).first()).toBeVisible();

    await page
      .locator('[data-popup-target="dashboard-popup-save-draft-button"]')
      .click();

    await expect(page.getByText("Pop-up salvo com sucesso.")).toBeVisible();
  });
});
