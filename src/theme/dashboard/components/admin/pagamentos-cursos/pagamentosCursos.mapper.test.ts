import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { buildListMeusPagamentosSearchParams } from "@/api/cursos/core";
import {
  mapMeuPagamentoToCurso,
  shouldShowPagamentosAsEmptyState,
} from "./hooks/usePagamentosCursosData";

describe("pagamentosCursos mapper", () => {
  it("normaliza status real da API para o componente de tabela existente", () => {
    const item = mapMeuPagamentoToCurso({
      id: "pagamento-1",
      origem: "RECUPERACAO_FINAL",
      tipo: "RECUPERACAO_FINAL",
      tipoDescricao: "Recuperacao final",
      status: "PROCESSANDO",
      statusDescricao: "Processando",
      valor: 50,
      valorFormatado: "R$ 50,00",
      metodo: "pix",
      metodoDescricao: "PIX",
      curso: { id: "curso-1", nome: "Curso Real" },
      turma: { id: "turma-1", nome: "Turma Real" },
      prova: { id: "prova-1", titulo: "Recuperacao Final" },
      tipoPagamento: "recuperacao-final",
      referencia: "pagamento-1",
      transacaoId: "mp-1",
      criadoEm: "2026-05-25T12:00:00.000Z",
      validadeAte: null,
      detalhes: null,
      podePagar: false,
    });

    expect(item.status).toBe("EM_PROCESSAMENTO");
    expect(item.origem).toBe("RECUPERACAO_FINAL");
  });

  it("trata endpoints pessoais indisponiveis como empty state", () => {
    expect(shouldShowPagamentosAsEmptyState({ status: 403 })).toBe(true);
    expect(shouldShowPagamentosAsEmptyState({ status: 404 })).toBe(true);
    expect(shouldShowPagamentosAsEmptyState({ status: 500 })).toBe(false);
  });

  it("nao importa fixtures de pagamentos ou recuperacao no fluxo real", () => {
    const dashboard = readFileSync(
      resolve(__dirname, "PagamentosCursosDashboard.tsx"),
      "utf8"
    );
    const responder = readFileSync(
      resolve(
        __dirname,
        "../../../../../app/dashboard/cursos/atividades-provas/[id]/responder/page.tsx"
      ),
      "utf8"
    );

    expect(dashboard).not.toContain("mockData");
    expect(dashboard).not.toContain("getMockPagamentosCursos");
    expect(responder).not.toContain("recuperacaoPagamento");
  });
});

describe("buildListMeusPagamentosSearchParams", () => {
  it("envia filtros e paginação de pagamentos pessoais para a API", () => {
    const params = buildListMeusPagamentosSearchParams({
      tab: "historico",
      status: "APROVADO",
      metodo: "pix",
      cursoId: "curso-1",
      turmaId: "turma-1",
      dataInicio: "2026-05-01",
      dataFim: "2026-05-25",
      valorMin: 10,
      valorMax: 100,
      page: 2,
      pageSize: 10,
    });

    expect(params.toString()).toBe(
      "tab=historico&status=APROVADO&metodo=pix&cursoId=curso-1&turmaId=turma-1&dataInicio=2026-05-01&dataFim=2026-05-25&valorMin=10&valorMax=100&page=2&pageSize=10"
    );
  });
});
