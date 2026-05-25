import { describe, expect, it } from "vitest";

import { buildListMeCertificadosSearchParams } from "../../../../../api/cursos/core";
import {
  mapMeuCertificadoToListItem,
  shouldShowAlunoDataAsEmptyState,
  toApiDate,
} from "./alunoCertificado.mapper";

describe("alunoCertificado mapper", () => {
  it("normaliza certificado real da API para item da tela", () => {
    const item = mapMeuCertificadoToListItem({
      id: "certificado-1",
      codigo: "CERT-001",
      emitidoEm: "2026-05-20T12:00:00.000Z",
      inscricaoId: "inscricao-1",
      curso: { id: "curso-1", nome: "Curso Real" },
      turma: { id: "turma-1", nome: "Turma Real" },
      aluno: { id: "aluno-1" },
      pdfUrl: "/certificado.pdf",
    });

    expect(item).toMatchObject({
      key: "certificado-1",
      codigo: "CERT-001",
      cursoNome: "Curso Real",
      turmaNome: "Turma Real",
      pdfUrl: "/certificado.pdf",
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

describe("buildListMeCertificadosSearchParams", () => {
  it("envia filtros e paginacao para a API pessoal", () => {
    const params = buildListMeCertificadosSearchParams({
      cursoId: "curso-1",
      turmaId: "turma-1",
      emitidoDe: "2026-05-01",
      emitidoA: "2026-05-31",
      page: 2,
      pageSize: 6,
    });

    expect(params.toString()).toBe(
      "cursoId=curso-1&turmaId=turma-1&emitidoDe=2026-05-01&emitidoA=2026-05-31&page=2&pageSize=6"
    );
  });
});
