import { describe, expect, it } from "vitest";

import { resolvePastedRichTextContent } from "./richTextareaPaste.utils";

describe("resolvePastedRichTextContent", () => {
  it("mantem o HTML formatado quando o texto cabe no limite", () => {
    const content = resolvePastedRichTextContent(
      "<h1>Titulo</h1><p><strong>Texto</strong></p>",
      "Titulo\nTexto",
      20,
    );

    expect(content).toEqual({
      html: "<h1>Titulo</h1><p><strong>Texto</strong></p>",
      text: "Titulo\nTexto",
    });
  });

  it("insere apenas o texto permitido quando seria necessario cortar HTML", () => {
    const content = resolvePastedRichTextContent(
      "<h1>Titulo</h1><p><strong>Texto</strong></p>",
      "Titulo\nTexto",
      6,
    );

    expect(content).toEqual({ html: "", text: "Titulo" });
  });
});
