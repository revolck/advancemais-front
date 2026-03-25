import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

const AVATAR_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="#0f2f7a"/><text x="32" y="38" text-anchor="middle" font-size="24" font-family="Arial" fill="white">MS</text></svg>`
  );

async function loginAsAdminOrSkip(page: Page) {
  try {
    await loginAsAdmin(page);
  } catch (error) {
    test.skip(true, `Login admin indisponível para o E2E: ${(error as Error).message}`);
  }
}

test("historico global renderiza avatar do ator quando avatarUrl vier da API", async ({
  page,
}) => {
  await page.route("**/api/v1/auditoria/logs**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          items: [
            {
              id: "log-1",
              categoria: "USUARIO",
              tipo: "USUARIO_ROLE_ALTERADA",
              acao: "Função alterada",
              descricao: "Função do usuário alterada de Aluno/Candidato para Instrutor.",
              dataHora: "2026-03-24T18:10:00.000Z",
              ator: {
                id: "ator-1",
                nome: "Maria Souza",
                role: "ADMIN",
                roleLabel: "Administrador",
                avatarUrl: AVATAR_DATA_URL,
              },
              entidade: {
                id: "user-1",
                tipo: "USUARIO",
                codigo: "MAT0001",
                nomeExibicao: "João da Silva",
              },
              contexto: {
                ip: "10.0.0.5",
                userAgent: "Mozilla/5.0",
                origem: "PAINEL_ADMIN",
              },
              dadosAnteriores: {
                role: "ALUNO_CANDIDATO",
              },
              dadosNovos: {
                role: "INSTRUTOR",
              },
              meta: {
                motivo: "Ajuste administrativo pelo painel",
              },
            },
          ],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 1,
            totalPages: 1,
          },
          resumo: {
            total: 1,
            ultimoEventoEm: "2026-03-24T18:10:00.000Z",
          },
          filtrosDisponiveis: {
            categorias: [{ value: "USUARIO", label: "Usuário", count: 1 }],
            tipos: [
              {
                value: "USUARIO_ROLE_ALTERADA",
                label: "Função alterada",
                count: 1,
              },
            ],
          },
        },
      }),
    });
  });

  await loginAsAdminOrSkip(page);
  await page.goto("/dashboard/auditoria/historico", { waitUntil: "networkidle" });

  const row = page.locator("tbody tr").first();

  await expect(row).toContainText(
    "Função do usuário alterada de Aluno/Candidato para Instrutor."
  );
  await expect(row).toContainText("Maria Souza");
  await expect(row).toContainText("Administrador");

  const avatarImage = row.locator('img[alt="Avatar de Maria Souza"]').first();
  await expect(avatarImage).toBeVisible();
  await expect(avatarImage).toHaveAttribute("src", /data:image\/svg\+xml/);
});
