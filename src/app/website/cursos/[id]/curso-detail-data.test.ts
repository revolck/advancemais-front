import { describe, expect, it } from "vitest";

import {
  buildCursoApiUrl,
  normalizeCourse,
  normalizeTurmasPublicadas,
} from "./curso-detail-data";

const publishedCourse = {
  id: "4767cfe1-32e7-46cf-8fc3-9b984d09374b",
  nome: "Gestao Financeira",
  descricao: "Curso publicado",
  cargaHoraria: 88,
  statusPadrao: "PUBLICADO",
  categoria: { nome: "Gestao e Negocios" },
  criadoEm: "2026-07-01T00:00:00.000Z",
};

describe("buildCursoApiUrl", () => {
  it("monta URL quando a base nao tem /api", () => {
    expect(
      buildCursoApiUrl(
        "/api/v1/cursos/123",
        "https://front.exemplo.com",
        "https://api.exemplo.com",
      ),
    ).toBe("https://api.exemplo.com/api/v1/cursos/123");
  });

  it("evita duplicar /api quando a base ja tem /api", () => {
    expect(
      buildCursoApiUrl(
        "/api/v1/cursos/123",
        "https://front.exemplo.com",
        "https://api.exemplo.com/api",
      ),
    ).toBe("https://api.exemplo.com/api/v1/cursos/123");
  });

  it("usa origin quando a base da API esta vazia", () => {
    expect(
      buildCursoApiUrl("/api/v1/cursos/123", "https://front.exemplo.com", ""),
    ).toBe("https://front.exemplo.com/api/v1/cursos/123");
  });

  it("ignora base invalida e usa origin", () => {
    expect(
      buildCursoApiUrl(
        "/api/v1/cursos/123",
        "http://localhost:3001",
        "https:///localhost:3001",
      ),
    ).toBe("http://localhost:3001/api/v1/cursos/123");
  });
});

describe("normalizeTurmasPublicadas", () => {
  it("aceita turmasPublicadas, turmas e CursosTurmas", () => {
    expect(
      normalizeTurmasPublicadas({
        turmasPublicadas: [{ id: "turma-publica", status: "PUBLICADO" }],
      }).map((turma) => turma.id),
    ).toEqual(["turma-publica"]);

    expect(
      normalizeTurmasPublicadas({
        turmas: [{ id: "turma-normal", status: "PUBLICADO" }],
      }).map((turma) => turma.id),
    ).toEqual(["turma-normal"]);

    expect(
      normalizeTurmasPublicadas({
        CursosTurmas: [{ id: "turma-prisma", status: "PUBLICADO" }],
      }).map((turma) => turma.id),
    ).toEqual(["turma-prisma"]);
  });
});

describe("normalizeCourse", () => {
  it("preserva curso publicado", () => {
    const course = normalizeCourse({
      ...publishedCourse,
      turmasPublicadas: [{ id: "turma-1", status: "PUBLICADO" }],
    });

    expect(course?.id).toBe(publishedCourse.id);
    expect(course?.statusPadrao).toBe("PUBLICADO");
    expect(course?.turmasPublicadas?.map((turma) => turma.id)).toEqual([
      "turma-1",
    ]);
  });

  it("rejeita curso nao publicado", () => {
    expect(
      normalizeCourse({
        ...publishedCourse,
        statusPadrao: "RASCUNHO",
      }),
    ).toBeNull();
  });

  it("filtra turmas nao publicas no fallback administrativo", () => {
    const course = normalizeCourse(
      {
        ...publishedCourse,
        CursosTurmas: [
          {
            id: "turma-publica",
            status: "PUBLICADO",
            dataInscricaoFim: "2026-08-01T00:00:00.000Z",
          },
          {
            id: "turma-rascunho",
            status: "RASCUNHO",
            dataInscricaoFim: "2026-08-01T00:00:00.000Z",
          },
          {
            id: "turma-expirada",
            status: "PUBLICADO",
            dataInscricaoFim: "2026-07-01T00:00:00.000Z",
          },
        ],
      },
      {
        filterPublicTurmas: true,
        referenceDate: new Date("2026-07-13T12:00:00.000Z"),
      },
    );

    expect(course?.turmasPublicadas?.map((turma) => turma.id)).toEqual([
      "turma-publica",
    ]);
    expect(course?.totalTurmas).toBe(1);
  });
});
