import { expect, test, type Page, type Route } from "@playwright/test";

/**
 * Modal "Complete seu perfil" (primeiro acesso) no celular. Tudo simulado: nenhuma
 * chamada sai para a API real, CEP ou IBGE.
 */

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

const usuarioBase = {
  id: "aluno-1",
  email: "aluno@teste.com",
  nomeCompleto: "Aluna Teste",
  role: "ALUNO_CANDIDATO",
  tipoUsuario: "PESSOA_FISICA",
  authId: "auth-1",
  emailVerificado: true,
  ultimoLogin: "2026-10-15T12:00:00.000Z",
};

const perfil = (completo: boolean) => ({
  success: true,
  message: "Perfil carregado",
  usuario: completo
    ? {
        ...usuarioBase,
        telefone: "82999990000",
        genero: "FEMININO",
        dataNasc: "1995-06-25T03:00:00.000Z",
        enderecos: [
          {
            id: "e1",
            cep: "57035000",
            logradouro: "Rua Teste",
            numero: "100",
            bairro: "Ponta Verde",
            cidade: "Maceió",
            estado: "AL",
          },
        ],
      }
    : { ...usuarioBase, telefone: null, genero: null, dataNasc: null, enderecos: [] },
  stats: {
    accountAge: 0,
    hasCompletedProfile: completo,
    hasAddress: completo,
    totalOrders: 0,
    totalSubscriptions: 0,
    emailVerificationStatus: { verified: true, verifiedAt: null, tokenExpiration: null },
  },
});

async function prepararPrimeiroAcesso(page: Page) {
  const estado = { salvo: false, payload: null as any };

  await page.context().addCookies([
    { name: "token", value: "e2e-token", url: BASE_URL },
    { name: "user_role", value: "ALUNO_CANDIDATO", url: BASE_URL },
  ]);

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const metodo = route.request().method();

    if (url.pathname === "/api/v1/usuarios/perfil") {
      if (metodo === "PUT") {
        estado.payload = route.request().postDataJSON();
        estado.salvo = true;
        return json(route, { ...perfil(true), message: "Perfil atualizado" });
      }
      return json(route, perfil(estado.salvo));
    }
    if (url.pathname === "/api/v1/notificacoes/contador") {
      return json(route, { success: true, naoLidas: 0 });
    }
    if (url.pathname === "/api/v1/website/popups/active") return json(route, []);
    return json(route, { success: true, data: [] });
  });

  // Serviços externos usados pelo endereço
  await page.route(/viacep\.com\.br|brasilapi\.com\.br/, (route) =>
    json(route, {
      cep: "57035-000",
      logradouro: "Rua Teste",
      bairro: "Ponta Verde",
      localidade: "Maceió",
      uf: "AL",
      street: "Rua Teste",
      neighborhood: "Ponta Verde",
      city: "Maceió",
      state: "AL",
    })
  );
  await page.route(/servicodados\.ibge\.gov\.br/, (route) =>
    json(route, [{ nome: "Arapiraca" }, { nome: "Maceió" }])
  );

  return estado;
}

/** Elemento inteiro dentro da tela, sem precisar rolar a página */
async function expectNaTela(page: Page, seletor: ReturnType<Page["locator"]>) {
  const caixa = await seletor.boundingBox();
  const tela = page.viewportSize()!;
  expect(caixa, "elemento sem posição na tela").not.toBeNull();
  expect(caixa!.y).toBeGreaterThanOrEqual(0);
  expect(caixa!.y + caixa!.height).toBeLessThanOrEqual(tela.height + 1);
}

const APARELHOS = [
  {
    nome: "iPhone 14",
    use: {
      viewport: { width: 390, height: 664 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
  },
  {
    nome: "Pixel 7",
    use: {
      viewport: { width: 412, height: 839 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2.625,
      userAgent:
        "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    },
  },
];

for (const aparelho of APARELHOS) {
  test.describe(`completar perfil no celular (${aparelho.nome})`, () => {
    test.use(aparelho.use);

    test("modal cabe na tela, data é digitada e o perfil é salvo", async ({ page }) => {
      const estado = await prepararPrimeiroAcesso(page);
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

      const modal = page.locator('[data-slot="modal-content"]');
      await expect(page.getByText("Complete seu perfil")).toBeVisible({ timeout: 60000 });

      // O modal nunca passa da altura da tela; título e botão sempre alcançáveis
      const caixaModal = (await modal.boundingBox())!;
      expect(caixaModal.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      await expectNaTela(page, page.getByText("Complete seu perfil"));
      await expectNaTela(page, page.getByRole("button", { name: "Próximo" }));

      const capturas = process.env.E2E_CAPTURAS_DIR;
      const capturar = async (nome: string) => {
        if (capturas) {
          await page.screenshot({ path: `${capturas}/${aparelho.nome}-${nome}.png` });
        }
      };
      await capturar("1-informacoes");

      // Etapas compactas: sem a lista vertical que ocupava a tela
      await expect(page.getByTestId("onboarding-progresso")).toContainText("Etapa 1 de 2");
      await expect(page.getByText("Preencha seu endereço para continuar.")).toBeHidden();

      // Gênero
      await page.getByRole("combobox", { name: /Gênero/ }).click();
      await page.getByRole("option", { name: "Feminino" }).click();

      await page.getByLabel(/Telefone\/Whatsapp/).fill("82999990000");

      // Data de nascimento digitada (teclado numérico), sem calendário
      const dataNasc = page.locator('input[name="dataNasc"]');
      await expect(dataNasc).toHaveAttribute("inputmode", "numeric");
      await dataNasc.fill("31022000");
      await expect(page.getByText(/Data inválida/)).toBeVisible();
      await capturar("1b-data-invalida");
      await dataNasc.fill("25061995");
      await expect(dataNasc).toHaveValue("25/06/1995");
      await expect(page.getByText(/Data inválida/)).toBeHidden();

      await page.getByRole("button", { name: "Próximo" }).click();
      await expect(page.getByTestId("onboarding-progresso")).toContainText("Etapa 2 de 2");
      await expect(page.getByTestId("onboarding-progresso")).toContainText("Endereço");

      // CEP preenche o endereço
      await page.getByLabel("CEP").fill("57035000");
      await expect(page.getByLabel("Logradouro")).toHaveValue("Rua Teste", { timeout: 15000 });
      await page.getByLabel("Número").fill("100");

      await capturar("2-endereco");
      const salvar = page.getByRole("button", { name: "Salvar e continuar" });
      await expectNaTela(page, salvar);
      await salvar.click();

      await expect(page.getByText("Complete seu perfil")).toBeHidden({ timeout: 15000 });
      expect(estado.payload).toMatchObject({
        telefone: "82999990000",
        genero: "FEMININO",
        endereco: {
          cep: "57035000",
          logradouro: "Rua Teste",
          numero: "100",
          bairro: "Ponta Verde",
          cidade: "Maceió",
          estado: "AL",
        },
      });
      // 25/06/1995 no fuso do navegador (sem virar 24/06)
      const salva = new Date(estado.payload.dataNasc);
      expect([salva.getFullYear(), salva.getMonth(), salva.getDate()]).toEqual([1995, 5, 25]);
    });
  });
}
