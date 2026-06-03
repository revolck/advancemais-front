import { describe, expect, it } from "vitest";

import { stripHtmlTags } from "./utils";

describe("stripHtmlTags", () => {
  it("remove comentários e marcadores de fragmento colados do editor", () => {
    expect(
      stripHtmlTags(
        "<!--StartFragment--><span>Introdução à Informática</span><!--EndFragment-->"
      )
    ).toBe("Introdução à Informática");
  });

  it("normaliza entidades HTML e espaços", () => {
    expect(stripHtmlTags("<p>Curso&nbsp;de&nbsp;TI &amp; suporte</p>")).toBe(
      "Curso de TI & suporte"
    );
  });
});
