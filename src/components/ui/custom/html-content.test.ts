import { describe, expect, it } from "vitest";

import { sanitizeRichTextHtml } from "./html-content";

describe("sanitizeRichTextHtml", () => {
  it("preserva tags de formatacao e remove scripts de conteudo persistido", () => {
    const html =
      '<h1>Titulo</h1><p><strong>Texto</strong></p><script>alert("x")</script>';

    expect(sanitizeRichTextHtml(html)).toBe(
      "<h1>Titulo</h1><p><strong>Texto</strong></p>",
    );
  });

  it("remove handlers, estilos inline e links javascript", () => {
    const html =
      '<p style="color:red" onclick="alert(1)">Texto</p><a href="javascript:alert(1)">Link</a>';

    expect(sanitizeRichTextHtml(html)).toBe("<p>Texto</p><a >Link</a>");
  });
});
