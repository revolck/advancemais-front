import { describe, it, expect } from "vitest";
import { extractListFromApiResponse, pickTitulo } from "./templatesForTurma.utils";

describe("templatesForTurma.utils", () => {
  describe("extractListFromApiResponse", () => {
    it("returns raw.data when it's an array", () => {
      expect(extractListFromApiResponse({ data: [1, 2] })).toEqual([1, 2]);
    });

    it("returns raw.data.data when nested", () => {
      expect(extractListFromApiResponse({ data: { data: ["a"] } })).toEqual(["a"]);
    });

    it("returns raw.items when present", () => {
      expect(extractListFromApiResponse({ items: [{ id: 1 }] })).toEqual([{ id: 1 }]);
    });

    it("returns empty array for unknown shapes", () => {
      expect(extractListFromApiResponse({})).toEqual([]);
      expect(extractListFromApiResponse(null)).toEqual([]);
    });
  });

  describe("pickTitulo", () => {
    it("prefers titulo", () => {
      expect(pickTitulo({ titulo: "  Aula 1  ", nome: "X" })).toBe("Aula 1");
    });

    it("falls back to nome/title/descricao", () => {
      expect(pickTitulo({ nome: "Nome" })).toBe("Nome");
      expect(pickTitulo({ title: "Title" })).toBe("Title");
      expect(pickTitulo({ descricao: "Desc" })).toBe("Desc");
    });

    it("returns empty string when none exists", () => {
      expect(pickTitulo({})).toBe("");
    });
  });
});

