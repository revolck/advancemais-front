import { expect, test, type Route } from "@playwright/test";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;

const apiJson = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

test("empresas pagamentos lista e exclui cartão mantendo o estado após recarregar", async ({
  context,
  page,
}) => {
  let cards = [
    {
      id: "cartao-1",
      empresaId: "empresa-1",
      ultimos4Digitos: "9501",
      bandeira: "Mastercard",
      tipo: "credito",
      nomeNoCartao: "FILIPE REIS MARQUES",
      mesExpiracao: 8,
      anoExpiracao: 2034,
      isPadrao: true,
      isAtivo: true,
      validadoEm: "2026-08-03T12:00:00.000Z",
      falhasConsecutivas: 0,
      criadoEm: "2026-08-03T12:00:00.000Z",
      atualizadoEm: "2026-08-03T12:00:00.000Z",
    },
    {
      id: "cartao-2",
      empresaId: "empresa-1",
      ultimos4Digitos: "6176",
      bandeira: "Visa",
      tipo: "credito",
      nomeNoCartao: "EMPRESA TESTE",
      mesExpiracao: 9,
      anoExpiracao: 2030,
      isPadrao: false,
      isAtivo: true,
      validadoEm: "2026-08-03T12:00:00.000Z",
      falhasConsecutivas: 0,
      criadoEm: "2026-08-03T11:00:00.000Z",
      atualizadoEm: "2026-08-03T11:00:00.000Z",
    },
  ];

  await context.addCookies([
    {
      name: "token",
      value: "e2e-token",
      url: BASE_URL,
    },
    {
      name: "user_role",
      value: "EMPRESA",
      url: BASE_URL,
    },
  ]);

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/api/v1/auth/google/status") {
      return apiJson(route, { conectado: true });
    }

    if (url.pathname === "/api/v1/usuarios/perfil") {
      return apiJson(route, {
        success: true,
        message: "Perfil carregado",
        usuario: {
          id: "usuario-1",
          email: "empresa@teste.com",
          nomeCompleto: "Empresa Teste",
          role: "EMPRESA",
          tipoUsuario: "PESSOA_JURIDICA",
          authId: "auth-1",
          emailVerificado: true,
          emailVerificadoEm: "2026-08-03T12:00:00.000Z",
          ultimoLogin: "2026-08-03T12:00:00.000Z",
          telefone: "82999999999",
          genero: "PREFIRO_NAO_INFORMAR",
          dataNasc: "1990-01-01T00:00:00.000Z",
          enderecos: [
            {
              id: "endereco-1",
              cep: "57000000",
              logradouro: "Rua Teste",
              numero: "100",
              bairro: "Centro",
              cidade: "Maceio",
              estado: "AL",
            },
          ],
        },
        stats: {
          accountAge: 1,
          hasCompletedProfile: true,
          hasAddress: true,
          totalOrders: 0,
          totalSubscriptions: 0,
          emailVerificationStatus: {
            verified: true,
            verifiedAt: "2026-08-03T12:00:00.000Z",
            tokenExpiration: null,
          },
        },
      });
    }

    if (url.pathname === "/api/v1/website/popups/active") {
      return apiJson(route, []);
    }

    if (url.pathname === "/api/v1/notificacoes/contador") {
      return apiJson(route, { success: true, naoLidas: 0 });
    }

    if (url.pathname === "/api/v1/notificacoes") {
      return apiJson(route, {
        success: true,
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
        contadores: {
          naoLidas: 0,
          total: 0,
        },
      });
    }

    if (url.pathname === "/api/v1/empresas/minha") {
      return apiJson(route, {
        success: true,
        empresa: {
          id: "empresa-1",
          nome: "Empresa Teste",
          email: "empresa@teste.com",
          cnpj: "11222333000181",
          telefone: "82999999999",
          cidade: "Maceio",
          estado: "AL",
          plano: {
            id: "plano-1",
            nome: "Plano Empresa",
            status: "ATIVO",
            quantidadeVagas: 10,
            proximaCobranca: "2026-09-03T00:00:00.000Z",
          },
          vagas: {
            publicadas: 0,
            limitePlano: 10,
            disponiveis: 10,
          },
        },
      });
    }

    if (url.pathname === "/api/v1/empresas/pagamentos/planos") {
      return apiJson(route, {
        success: true,
        data: [
          {
            id: "plano-1",
            nome: "Plano Empresa",
            valor: "199.90",
            status: "ATIVO",
            statusPagamento: "APROVADO",
            inicio: "2026-08-03T00:00:00.000Z",
            fim: null,
            proximaCobranca: "2026-09-03T00:00:00.000Z",
          },
        ],
      });
    }

    if (url.pathname === "/api/v1/empresas/pagamentos") {
      return apiJson(route, {
        success: true,
        data: {
          pagamentos: [],
          resumo: {
            totalPago: 0,
            totalPendente: 0,
            totalTransacoes: 0,
            ultimoPagamento: null,
          },
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
          },
        },
      });
    }

    if (
      url.pathname === "/api/v1/empresas/cartoes" &&
      route.request().method() === "GET"
    ) {
      return apiJson(route, {
        success: true,
        data: cards,
      });
    }

    if (
      url.pathname.startsWith("/api/v1/empresas/cartoes/") &&
      route.request().method() === "DELETE"
    ) {
      const cardId = url.pathname.split("/").at(-1);
      cards = cards.filter((card) => card.id !== cardId);
      return apiJson(route, {
        success: true,
        message: "Cartão removido com sucesso",
      });
    }

    return apiJson(route, { success: true, data: [] });
  });

  await page.goto("/dashboard/empresas/pagamentos");

  await expect(page.getByText("Cartões Cadastrados")).toBeVisible();
  await expect(page.getByText("Nome no cartão").first()).toBeVisible();
  await expect(page.getByText("Vencimento").first()).toBeVisible();
  await expect(page.getByText(/Mastercard final 9501/i)).toBeVisible();
  await expect(page.getByText("FILIPE REIS MARQUES")).toBeVisible();
  await expect(page.getByText("Padrão")).toBeVisible();
  await expect(page.getByText(/Visa final 6176/i)).toBeVisible();
  await expect(page.getByText("Nenhum cartão cadastrado")).toHaveCount(0);

  await page.getByRole("button", { name: "Excluir Visa final 6176" }).click();
  const deleteDialog = page.getByRole("alertdialog");
  await expect(deleteDialog.getByText("Excluir cartão?")).toBeVisible();
  await expect(deleteDialog.getByText(/Visa final 6176 será removido/)).toBeVisible();
  await deleteDialog.getByRole("button", { name: "Excluir cartão" }).click();

  await expect(page.getByTestId("registered-card-cartao-2")).toHaveCount(0);
  await expect(page.getByText(/Mastercard final 9501/i)).toBeVisible();

  await page.reload();

  await expect(page.getByText(/Mastercard final 9501/i)).toBeVisible();
  await expect(page.getByText(/Visa final 6176/i)).toHaveCount(0);
  await expect(page.getByText("Nenhum cartão cadastrado")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("registered-card-cartao-1")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Excluir Mastercard final 9501" })
  ).toBeVisible();
});
