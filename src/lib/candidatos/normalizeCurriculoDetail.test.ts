import { describe, expect, it } from "vitest";

import { normalizeCurriculoDetail } from "./normalizeCurriculoDetail";

describe("normalizeCurriculoDetail", () => {
  it("normaliza payload cru com experiencias em array direto", () => {
    const curriculo = normalizeCurriculoDetail({
      id: "1",
      usuarioId: "u1",
      titulo: "Currículo",
      experiencias: [{ cargo: "Dev" }],
    });

    expect(curriculo.id).toBe("1");
    expect(curriculo.usuarioId).toBe("u1");
    expect(curriculo.experiencias).toEqual([{ cargo: "Dev" }]);
  });

  it("desembrulha payload dentro de data", () => {
    const curriculo = normalizeCurriculoDetail({
      data: {
        id: "2",
        usuarioId: "u2",
        titulo: "Currículo 2",
        experiencias: [{ cargo: "QA" }],
      },
    });

    expect(curriculo.id).toBe("2");
    expect(curriculo.experiencias).toEqual([{ cargo: "QA" }]);
  });

  it("desembrulha payload dentro de curriculo", () => {
    const curriculo = normalizeCurriculoDetail({
      curriculo: {
        id: "3",
        usuarioId: "u3",
        titulo: "Currículo 3",
        experiencias: [{ cargo: "PO" }],
      },
    });

    expect(curriculo.id).toBe("3");
    expect(curriculo.experiencias).toEqual([{ cargo: "PO" }]);
  });

  it("normaliza experiencias agrupadas em objeto para array", () => {
    const curriculo = normalizeCurriculoDetail({
      id: "4",
      usuarioId: "u4",
      titulo: "Currículo 4",
      experiencias: {
        experiencias: [{ cargo: "Tech Lead" }],
      },
    });

    expect(curriculo.experiencias).toEqual([{ cargo: "Tech Lead" }]);
  });
});
