import { describe, expect, it } from "vitest";

import { buildListMeusEstagiosSearchParams } from "../../../../../api/cursos/core";
import {
  mapMeuEstagioToListItem,
  shouldShowAlunoDataAsEmptyState,
  toApiDate,
} from "./alunoEstagio.mapper";

describe("alunoEstagio mapper", () => {
  it("normaliza alocacao real da API para item da tela", () => {
    const item = mapMeuEstagioToListItem({
      id: "estagio-1",
      cursoId: "curso-1",
      cursoNome: "Curso Real",
      turmaId: "turma-1",
      turmaNome: "Turma Real",
      inscricaoId: "inscricao-1",
      alunoId: "aluno-1",
      empresaNome: "Empresa Real",
      empresaTelefone: "82999999999",
      rua: "Rua A",
      numero: "10",
      cidade: "Maceio",
      estado: "AL",
      dataInicioPrevista: "2026-05-10",
      dataFimPrevista: "2026-06-10",
      horarioInicio: "09:00",
      horarioFim: "13:00",
      status: "EM_ANDAMENTO",
    });

    expect(item).toMatchObject({
      key: "estagio-1",
      cursoNome: "Curso Real",
      turmaNome: "Turma Real",
      empresaNome: "Empresa Real",
      horarioInicio: "09:00",
      status: "EM_ANDAMENTO",
    });
  });

  it("converte datas e trata indisponibilidade da rota pessoal como lista vazia", () => {
    expect(toApiDate(new Date("2026-05-20T12:00:00.000Z"))).toBe(
      "2026-05-20"
    );
    expect(shouldShowAlunoDataAsEmptyState({ status: 403 })).toBe(true);
    expect(shouldShowAlunoDataAsEmptyState({ status: 404 })).toBe(true);
    expect(shouldShowAlunoDataAsEmptyState({ status: 500 })).toBe(false);
  });
});

describe("buildListMeusEstagiosSearchParams", () => {
  it("envia filtros e paginacao para a API pessoal", () => {
    const params = buildListMeusEstagiosSearchParams({
      cursoId: "curso-1",
      dataInicio: "2026-05-01",
      dataFim: "2026-05-31",
      page: 2,
      pageSize: 6,
    });

    expect(params.toString()).toBe(
      "cursoId=curso-1&dataInicio=2026-05-01&dataFim=2026-05-31&page=2&pageSize=6"
    );
  });
});
