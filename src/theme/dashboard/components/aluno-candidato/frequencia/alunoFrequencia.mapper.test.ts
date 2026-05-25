import { describe, expect, it } from "vitest";

import { buildListMinhasFrequenciasSearchParams } from "../../../../../api/cursos/core";
import {
  mapMinhaFrequenciaToListItem,
  shouldShowAlunoDataAsEmptyState,
  toApiDate,
} from "./alunoFrequencia.mapper";

describe("alunoFrequencia mapper", () => {
  it("normaliza lancamento real da API para item da tela", () => {
    const item = mapMinhaFrequenciaToListItem({
      id: "frequencia-1",
      cursoId: "curso-1",
      turmaId: "turma-1",
      aulaId: "aula-1",
      alunoId: "aluno-1",
      inscricaoId: "inscricao-1",
      status: "PRESENTE",
      origemTitulo: "Aula Presencial",
      dataReferencia: "2026-05-20T12:00:00.000Z",
      criadoEm: "2026-05-20T12:00:00.000Z",
      evidencia: {
        ultimoAcessoEm: "2026-05-20T11:00:00.000Z",
        minutosEngajados: 48,
      },
      cursoNome: "Curso Real",
      turmaNome: "Turma Real",
    } as never);

    expect(item).toMatchObject({
      key: "frequencia-1",
      cursoNome: "Curso Real",
      turmaNome: "Turma Real",
      aulaNome: "Aula Presencial",
      statusAtual: "PRESENTE",
      evidence: {
        ultimoLogin: "2026-05-20T11:00:00.000Z",
        tempoAoVivoMin: 48,
      },
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

describe("buildListMinhasFrequenciasSearchParams", () => {
  it("envia filtros e paginacao para a API pessoal", () => {
    const params = buildListMinhasFrequenciasSearchParams({
      cursoId: "curso-1",
      aulaId: "aula-1",
      status: "PRESENTE",
      dataInicio: "2026-05-01",
      dataFim: "2026-05-31",
      orderBy: "atualizadoEm",
      order: "desc",
      page: 2,
      pageSize: 6,
    });

    expect(params.toString()).toBe(
      "cursoId=curso-1&aulaId=aula-1&status=PRESENTE&dataInicio=2026-05-01&dataFim=2026-05-31&orderBy=atualizadoEm&order=desc&page=2&pageSize=6"
    );
  });
});
