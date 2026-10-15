import { expect, test, type Page, type Route } from "@playwright/test";

import { subirApiSimulada } from "./helpers/api-simulada";

/**
 * Matrículas pela equipe: adicionar e remover alunos na turma, ações por aluno,
 * filtro "Removidos" e "Associar a uma turma" no cadastro do aluno.
 * Tudo simulado (navegador interceptado + API falsa para o servidor do Next).
 */

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001}`;
const CAPTURAS = process.env.E2E_CAPTURAS_DIR;

const CURSO = "c-fiscal";
const TURMA = "t-migrada";
const TURMA_CONCLUIDA = "t-concluida";
const ALUNO_PAGINA = "a-luana";

const turmaBase = {
  cursoId: CURSO,
  turno: "NOITE",
  metodo: "ONLINE",
  vagasTotais: 40,
  vagasIlimitadas: false,
  inscricoesCount: 2,
  dataInicio: "2026-09-01T12:00:00.000Z",
  dataFim: "2026-12-10T12:00:00.000Z",
  criadoEm: "2026-08-01T12:00:00.000Z",
};
const TURMAS: Record<string, Record<string, unknown>> = {
  [TURMA]: { ...turmaBase, id: TURMA, codigo: "MIGTa1b2c3d4", nome: "Turma Fiscal Noite", status: "EM_ANDAMENTO" },
  [TURMA_CONCLUIDA]: {
    ...turmaBase,
    id: TURMA_CONCLUIDA,
    codigo: "T-2026-03",
    nome: "Turma Fiscal Março",
    status: "CONCLUIDO",
  },
};
const CURSO_DADOS = { id: CURSO, nome: "Analista Fiscal", codigo: "AF01", cargaHoraria: 40 };

const inscricao = (id: string, alunoId: string, nome: string, extra: Record<string, unknown> = {}) => ({
  id,
  alunoId,
  statusInscricao: "INSCRITO",
  statusPagamento: "APROVADO",
  criadoEm: "2026-08-20T12:00:00.000Z",
  origem: null,
  removidaEm: null,
  motivoRemocao: null,
  aluno: { id: alunoId, nomeCompleto: nome, email: `${alunoId}@teste.com`, cpf: "11122233344" },
  ...extra,
});
const ATIVAS = [inscricao("i-ana", "a-ana", "Ana Souza"), inscricao("i-bia", "a-bia", "Bia Lima")];
const REMOVIDAS = [
  inscricao("i-caio", "a-caio", "Caio Reis", {
    statusInscricao: "CANCELADO",
    removidaEm: "2026-10-10T15:00:00.000Z",
    motivoRemocao: "Matriculado na turma errada",
  }),
];

const ALUNO_DETALHE = {
  success: true,
  data: {
    id: ALUNO_PAGINA,
    nome: "Luana Liz Galvão",
    nomeCompleto: "Luana Liz Galvão",
    email: "luana@teste.com",
    cpf: "77488390423",
    status: "ATIVO",
    criadoEm: "2026-10-01T12:00:00.000Z",
    enderecos: [],
    inscricoes: [
      {
        id: "i-luana",
        statusInscricao: "INSCRITO",
        criadoEm: "2026-10-02T12:00:00.000Z",
        progresso: 20,
        turma: { id: TURMA, nome: "Turma Fiscal Noite", codigo: "MIGTa1b2c3d4", status: "EM_ANDAMENTO" },
        curso: { id: CURSO, nome: "Analista Fiscal", codigo: "AF01" },
      },
    ],
    totalInscricoes: 1,
    curriculosResumo: { total: 0, principalId: null },
    estatisticas: { totalInscricoes: 1, cursosConcluidos: 0, cursosEmAndamento: 1 },
  },
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

/** Prévia da API para quem entra */
const previaAdicao = (alunoIds: string[], turmaId: string) => ({
  aplicado: false,
  adicionar: alunoIds.filter((id) => id !== "a-caio").map((id) => ({ alunoId: id, nome: "Luana Liz Galvão" })),
  reativar: alunoIds.includes("a-caio") ? [{ alunoId: "a-caio", nome: "Caio Reis" }] : [],
  jaNaTurma: [],
  recusados: [],
  avisos: {
    turmaConcluida: turmaId === TURMA_CONCLUIDA,
    turmaIniciada: true,
    prazoDeInscricaoEncerrado: true,
    excedeVagas: false,
    outrasTurmasDoCurso: [],
  },
  vagas: { ocupadas: 2, limite: 40, depois: 2 + alunoIds.length },
});

interface Chamadas {
  adicoes: any[];
  remocoes: any[];
  listas: URLSearchParams[];
  buscas: string[];
}

async function prepararEquipe(page: Page) {
  const chamadas: Chamadas = { adicoes: [], remocoes: [], listas: [], buscas: [] };
  await page.context().addCookies([
    { name: "token", value: "e2e-token", url: BASE_URL },
    { name: "user_role", value: "ADMIN", url: BASE_URL },
  ]);
  await page.addInitScript(() => window.localStorage.setItem("userName", "Equipe"));
  // Convite flutuante do canto da tela (fica por cima da última coluna da tabela)
  await page.addLocatorHandler(page.getByRole("button", { name: "Agora não" }), (botao) => botao.click());

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const metodo = route.request().method();
    const caminho = url.pathname;

    if (caminho === "/api/v1/usuarios/perfil") {
      return json(route, {
        success: true,
        usuario: {
          id: "admin-1",
          nomeCompleto: "Equipe Pedagógica",
          email: "equipe@teste.com",
          role: "ADMIN",
          tipoUsuario: "PESSOA_FISICA",
          emailVerificado: true,
          telefone: "82999990000",
          genero: "FEMININO",
          dataNasc: "1990-01-01T03:00:00.000Z",
          enderecos: [{ id: "e1", cep: "57035000", logradouro: "Rua", numero: "1", bairro: "B", cidade: "Maceió", estado: "AL" }],
        },
        stats: { hasCompletedProfile: true, hasAddress: true },
      });
    }
    if (caminho === `/api/v1/cursos/${CURSO}/inscricoes`) {
      chamadas.listas.push(url.searchParams);
      const itens = url.searchParams.get("removidas") === "somente" ? REMOVIDAS : ATIVAS;
      return json(route, {
        data: itens,
        pagination: { total: itens.length, page: 1, pageSize: 50, totalPages: 1 },
      });
    }
    const turmaDaRota = caminho.match(new RegExp(`^/api/v1/cursos/${CURSO}/turmas/([^/]+)(/.*)?$`));
    if (turmaDaRota) {
      const [, turmaId, resto = ""] = turmaDaRota;
      const corpo = metodo === "POST" ? route.request().postDataJSON() : null;
      if (resto === "/inscricoes/equipe") {
        if (!corpo.simular) chamadas.adicoes.push({ turmaId, ...corpo });
        return json(route, {
          success: true,
          data: { ...previaAdicao(corpo.alunoIds, turmaId), aplicado: !corpo.simular },
        });
      }
      if (resto === "/inscricoes/remover") {
        if (!corpo.simular) chamadas.remocoes.push(corpo);
        const nomes: Record<string, string> = { "i-ana": "Ana Souza", "i-bia": "Bia Lima", "i-luana": "Luana" };
        return json(route, {
          success: true,
          data: {
            aplicado: !corpo.simular,
            remover: corpo.inscricaoIds.map((id: string) => ({ inscricaoId: id, alunoId: id, nome: nomes[id] ?? id })),
            jaRemovidas: 0,
            naoEncontradas: 0,
            certificadosARevogar: corpo.inscricaoIds.includes("i-bia") ? 1 : 0,
            cobrancasACancelar: 0,
          },
        });
      }
      if (resto === "/inscricoes/historico") return json(route, { success: true, data: [] });
      if (resto === "" && TURMAS[turmaId]) return json(route, TURMAS[turmaId]);
    }
    if (caminho === `/api/v1/cursos/${CURSO}/turmas`) {
      return json(route, { data: Object.values(TURMAS) });
    }
    if (caminho === "/api/v1/cursos") {
      return json(route, { data: [CURSO_DADOS], pagination: { total: 1, page: 1, pageSize: 500, totalPages: 1 } });
    }
    if (caminho === `/api/v1/cursos/alunos/${ALUNO_PAGINA}`) return json(route, ALUNO_DETALHE);
    if (caminho === "/api/v1/usuarios/usuarios") {
      chamadas.buscas.push(url.searchParams.get("search") ?? "");
      return json(route, {
        success: true,
        usuarios: [
          {
            id: "a-luana",
            nomeCompleto: "Luana Liz Galvão",
            email: "luana@teste.com",
            cpf: "77488390423",
            status: "ATIVO",
            role: "ALUNO_CANDIDATO",
            tipoUsuario: "PESSOA_FISICA",
            criadoEm: "2026-10-01T12:00:00.000Z",
          },
          {
            id: "a-bloq",
            nomeCompleto: "Luana Bloqueada",
            email: "bloq@teste.com",
            cpf: "77488390000",
            status: "BLOQUEADO",
            role: "ALUNO_CANDIDATO",
            tipoUsuario: "PESSOA_FISICA",
            criadoEm: "2026-10-01T12:00:00.000Z",
          },
        ],
        pagination: { page: 1, limit: 8, total: 2, totalPages: 1 },
      });
    }
    if (caminho === "/api/v1/notificacoes/contador") return json(route, { success: true, naoLidas: 0 });
    if (caminho === "/api/v1/website/popups/active") return json(route, []);
    return json(route, { success: true, data: [] });
  });

  return chamadas;
}

let pararApi: (() => Promise<void>) | undefined;

test.beforeAll(async () => {
  pararApi = await subirApiSimulada((url) => {
    const caminho = url.pathname;
    const turma = caminho.match(new RegExp(`^/api/v1/cursos/${CURSO}/turmas/([^/]+)$`));
    if (turma && TURMAS[turma[1]]) return { body: TURMAS[turma[1]] };
    if (caminho === `/api/v1/cursos/${CURSO}`) return { body: CURSO_DADOS };
    if (caminho === `/api/v1/cursos/alunos/${ALUNO_PAGINA}`) return { body: ALUNO_DETALHE };
    return undefined;
  });
});

test.afterAll(async () => {
  await pararApi?.();
});

test.describe.configure({ mode: "serial" });

async function abrirInscricoes(page: Page, turmaId = TURMA) {
  await page.goto(`/dashboard/cursos/turmas/${turmaId}?cursoId=${CURSO}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: /Inscrições/ }).click({ timeout: 60000 });
  await expect(page.getByText("Ana Souza")).toBeVisible({ timeout: 30000 });
}

const modal = (page: Page) => page.locator('[data-slot="modal-content"]');

test.describe("turma: matrículas pela equipe (desktop)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("adicionar aluno: busca por CPF, prévia, pagamento e motivo; aviso desligado na turma migrada", async ({
    page,
  }) => {
    const chamadas = await prepararEquipe(page);
    await abrirInscricoes(page);

    // A lista de CPFs saiu
    await expect(page.getByText("Atualizar por lista de CPFs")).toHaveCount(0);

    await page.getByRole("button", { name: "Adicionar alunos" }).click();
    await expect(modal(page).getByText("Adicionar alunos à turma")).toBeVisible();

    // Turma migrada (MIGT…): aviso vem desligado
    await expect(modal(page).getByRole("switch", { name: "Avisar o aluno" })).not.toBeChecked();

    // CPF com pontuação vira só números na busca
    await modal(page).getByLabel("Buscar aluno").fill("774.883.904-23");
    await expect(modal(page).getByRole("button", { name: /Luana Liz Galvão/ })).toBeVisible();
    expect(chamadas.buscas.at(-1)).toBe("77488390423");
    await expect(modal(page).getByText("Conta bloqueada")).toBeVisible();

    await modal(page).getByRole("button", { name: /Luana Liz Galvão/ }).click();
    await expect(modal(page).getByTestId("previa-adicao")).toContainText("1 aluno entra na turma.");
    await expect(modal(page).getByTestId("previa-adicao")).toContainText("A turma já começou");

    const confirmar = modal(page).getByRole("button", { name: "Adicionar 1 aluno" });
    await expect(confirmar).toBeDisabled(); // falta pagamento e motivo
    await modal(page).getByRole("radio", { name: /Concedido pela equipe/ }).click();
    await modal(page).getByLabel("Motivo").fill("Pagou presencialmente");
    if (CAPTURAS) await page.screenshot({ path: `${CAPTURAS}/turma-adicionar-desktop.png` });
    await expect(confirmar).toBeEnabled();
    await confirmar.click();

    await expect(modal(page)).toHaveCount(0);
    expect(chamadas.adicoes).toEqual([
      {
        turmaId: TURMA,
        alunoIds: ["a-luana"],
        motivo: "Pagou presencialmente",
        pagamento: "CONCEDIDO",
        avisar: false,
        origem: "TURMA",
      },
    ]);
  });

  test("remover pelo menu do aluno e em lote, com prévia e motivo", async ({ page }) => {
    const chamadas = await prepararEquipe(page);
    await abrirInscricoes(page);

    // Um aluno, pelo menu da linha
    await page.getByRole("button", { name: "Ações para Ana Souza" }).click();
    await page.getByRole("menuitem", { name: "Remover da turma" }).click();
    await expect(modal(page).getByTestId("previa-remocao")).toContainText("1 aluno sai da turma");
    await modal(page).getByLabel("Motivo").fill("Desistiu antes de começar");
    await modal(page).getByRole("button", { name: "Remover 1 aluno" }).click();
    await expect(modal(page)).toHaveCount(0);
    expect(chamadas.remocoes.at(-1)).toMatchObject({
      inscricaoIds: ["i-ana"],
      motivo: "Desistiu antes de começar",
      avisar: false,
      totalEsperado: 1,
    });

    // Em lote, pela seleção
    await page.getByRole("checkbox", { name: "Selecionar todos desta página" }).check();
    await page.getByRole("button", { name: "Remover da turma" }).click();
    await expect(modal(page).getByTestId("previa-remocao")).toContainText("2 alunos saem da turma");
    await expect(modal(page).getByTestId("previa-remocao")).toContainText("1 certificado será revogado");
    await modal(page).getByLabel("Motivo").fill("Turma errada");
    await modal(page).getByRole("button", { name: "Remover 2 alunos" }).click();
    await expect(modal(page)).toHaveCount(0);
    expect(chamadas.remocoes.at(-1)).toMatchObject({ inscricaoIds: ["i-ana", "i-bia"], totalEsperado: 2 });
  });

  test("filtro Removidos: mostra o motivo e permite adicionar de volta", async ({ page }) => {
    const chamadas = await prepararEquipe(page);
    await abrirInscricoes(page);

    await page.getByRole("combobox", { name: /Situação/ }).selectOption("REMOVIDOS");
    await expect(page.getByText("Caio Reis")).toBeVisible();
    expect(chamadas.listas.at(-1)?.get("removidas")).toBe("somente");
    expect(chamadas.listas.at(-1)?.get("status")).toBeNull();
    await expect(page.getByText("Removido da turma")).toBeVisible();
    // Sem seleção em lote nos removidos
    await expect(page.getByRole("checkbox", { name: "Selecionar todos desta página" })).toHaveCount(0);

    await page.getByRole("button", { name: "Ações para Caio Reis" }).click();
    await expect(page.getByRole("menuitem", { name: "Remover da turma" })).toHaveCount(0);
    await page.getByRole("menuitem", { name: "Adicionar de volta à turma" }).click();
    await expect(modal(page).getByText("Caio Reis").first()).toBeVisible();
    await expect(modal(page).getByTestId("previa-adicao")).toContainText("1 aluno volta para a turma");
  });

  test("turma concluída: cobrança pelo site indisponível e avisos pedem confirmação", async ({ page }) => {
    await prepararEquipe(page);
    await abrirInscricoes(page, TURMA_CONCLUIDA);

    await page.getByRole("button", { name: "Adicionar alunos" }).click();
    // Turma comum: aviso ligado
    await expect(modal(page).getByRole("switch", { name: "Avisar o aluno" })).toBeChecked();
    await expect(modal(page).getByRole("radio", { name: /Cobrança pendente/ })).toBeDisabled();

    await modal(page).getByLabel("Buscar aluno").fill("Luana");
    await modal(page).getByRole("button", { name: /Luana Liz Galvão/ }).click();
    await expect(modal(page).getByTestId("previa-adicao")).toContainText("já foi concluída");
    await modal(page).getByRole("radio", { name: /Concedido pela equipe/ }).click();
    await modal(page).getByLabel("Motivo").fill("Regularização da turma");

    const confirmar = modal(page).getByRole("button", { name: "Adicionar 1 aluno" });
    await expect(confirmar).toBeDisabled();
    await modal(page).getByText("Estou ciente dos avisos acima").click();
    await expect(confirmar).toBeEnabled();
  });
});

test.describe("turma: matrículas pela equipe (celular)", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("modal de adicionar cabe na tela e nada vaza para os lados", async ({ page }) => {
    await prepararEquipe(page);
    await abrirInscricoes(page);

    await page.getByRole("button", { name: "Adicionar alunos" }).click();
    await modal(page).getByLabel("Buscar aluno").fill("Luana");
    await modal(page).getByRole("button", { name: /Luana Liz Galvão/ }).click();
    await expect(modal(page).getByTestId("previa-adicao")).toBeVisible();

    const caixa = (await modal(page).boundingBox())!;
    expect(caixa.x).toBeGreaterThanOrEqual(0);
    expect(caixa.x + caixa.width).toBeLessThanOrEqual(390);
    const largura = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(largura).toBeLessThanOrEqual(390);
    await expect(modal(page).getByRole("button", { name: "Adicionar 1 aluno" })).toBeInViewport();
    if (CAPTURAS) await page.screenshot({ path: `${CAPTURAS}/turma-adicionar-celular.png` });
  });
});

test.describe("aluno: associar a uma turma", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("escolhe curso e turma, pagamento e motivo; origem ALUNO", async ({ page }) => {
    const chamadas = await prepararEquipe(page);
    await page.goto(`/dashboard/cursos/alunos/${ALUNO_PAGINA}?tab=cursos-turmas`, {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", { name: "Associar a uma turma" }).click({ timeout: 60000 });
    await modal(page).getByText("Escolha o curso").click();
    await page.getByRole("option", { name: /Analista Fiscal/ }).click();
    await modal(page).getByText("Escolha a turma").click();
    await page.getByRole("option", { name: /Turma Fiscal Noite/ }).click();

    // Turma migrada: aviso desligado
    await expect(modal(page).getByRole("switch", { name: "Avisar o aluno" })).not.toBeChecked();
    await expect(modal(page).getByTestId("previa-adicao")).toContainText("1 aluno entra na turma.");
    await modal(page).getByRole("radio", { name: /Cobrança pendente/ }).click();
    await modal(page).getByLabel("Motivo").fill("Vai pagar pelo site");
    await modal(page).getByRole("button", { name: "Associar à turma" }).click();

    await expect(modal(page)).toHaveCount(0);
    expect(chamadas.adicoes).toEqual([
      {
        turmaId: TURMA,
        alunoIds: [ALUNO_PAGINA],
        motivo: "Vai pagar pelo site",
        pagamento: "COBRANCA_PENDENTE",
        avisar: false,
        origem: "ALUNO",
      },
    ]);

    // Cada turma listada tem o menu da equipe
    await expect(page.getByRole("button", { name: "Ações para Luana Liz Galvão" })).toBeVisible();
  });
});
