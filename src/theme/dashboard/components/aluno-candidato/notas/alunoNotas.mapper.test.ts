import { describe, expect, it } from "vitest";

import { buildListMinhasNotasSearchParams } from "../../../../../api/cursos/core";
import {
  mapMinhaNotaToListItem,
  mapMinhasNotasCursosToOptions,
  toApiDate,
} from "./alunoNotas.mapper";

describe("alunoNotas mapper", () => {
  it("normaliza nota real da API para item da tela", () => {
    const item = mapMinhaNotaToListItem({
      id: "nota-1",
      notaId: "nota-atual-1",
      historicoNotaId: "nota-historico-1",
      historicoDisponivel: true,
      cursoId: "curso-1",
      cursoNome: "Curso Real",
      turmaId: "turma-1",
      turmaNome: "Turma Real",
      inscricaoId: "inscricao-1",
      alunoId: "aluno-1",
      alunoNome: "Aluno Real",
      nota: 8.5,
      atualizadoEm: "2026-05-20T12:00:00.000Z",
      motivo: "Nota consolidada",
      origem: { tipo: "SISTEMA", id: null, titulo: "Cálculo automático" },
      isManual: false,
      history: [],
    });

    expect(item).toMatchObject({
      key: "curso-1::turma-1::inscricao-1",
      notaId: "nota-atual-1",
      historicoNotaId: "nota-historico-1",
      historicoDisponivel: true,
      cursoNome: "Curso Real",
      turmaNome: "Turma Real",
      nota: 8.5,
    });
  });

  it("normaliza cursos do filtro e datas da API", () => {
    expect(
      mapMinhasNotasCursosToOptions([
        {
          id: "curso-1",
          nome: "Curso Real",
          codigo: "CUR001",
          turmas: [],
        },
      ])
    ).toEqual([{ value: "curso-1", label: "Curso Real • CUR001" }]);

    expect(toApiDate(new Date("2026-05-20T12:00:00.000Z"))).toBe(
      "2026-05-20"
    );
  });
});

describe("buildListMinhasNotasSearchParams", () => {
  it("gera query params dos filtros reais de notas do aluno", () => {
    const params = buildListMinhasNotasSearchParams({
      cursoId: "curso-1",
      situacao: "APROVADO",
      dataInicio: "2026-05-01",
      dataFim: "2026-05-31",
      page: 2,
      pageSize: 6,
      orderBy: "atualizadoEm",
      order: "desc",
    });

    expect(params.toString()).toBe(
      "cursoId=curso-1&situacao=APROVADO&dataInicio=2026-05-01&dataFim=2026-05-31&page=2&pageSize=6&orderBy=atualizadoEm&order=desc"
    );
  });
});
