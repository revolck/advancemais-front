import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test("formata somente o conteúdo do RichTextarea e usa cursor de ação", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto("/dashboard/cursos/cadastrar", {
    waitUntil: "domcontentloaded",
  });

  const editor = page.locator("[contenteditable='true']").first();
  await expect(editor).toBeVisible();

  await editor.evaluate((element) => {
    element.innerHTML = "Texto da resposta";
    element.dispatchEvent(new InputEvent("input", { bubbles: true }));

    const textNode = element.firstChild;
    if (!textNode) throw new Error("Editor sem conteúdo para selecionar.");

    const range = document.createRange();
    range.selectNodeContents(textNode);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });

  const editorContainer = editor.locator("xpath=../..");
  const headingSelect = editorContainer.getByRole("combobox");
  await expect(headingSelect).toHaveCSS("cursor", "pointer");
  await headingSelect.click();

  await page.evaluate(() => {
    const sentinel = document.createElement("p");
    sentinel.id = "rich-textarea-selection-sentinel";
    sentinel.textContent = "Pergunta externa";
    document.body.prepend(sentinel);

    const range = document.createRange();
    range.selectNodeContents(sentinel);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });

  await page.getByRole("option", { name: "Título 2" }).click();

  await expect(editor.locator("h2")).toHaveText("Texto da resposta");
  await expect(
    page.locator("#rich-textarea-selection-sentinel"),
  ).toHaveJSProperty("tagName", "P");
});
