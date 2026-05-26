export interface PastedRichTextContent {
  html: string;
  text: string;
}

export function resolvePastedRichTextContent(
  sanitizedHtml: string,
  plainText: string,
  availableChars: number,
): PastedRichTextContent {
  const allowedText = plainText.slice(0, Math.max(availableChars, 0));
  const preservesFullContent = allowedText.length === plainText.length;

  return {
    html: sanitizedHtml && preservesFullContent ? sanitizedHtml : "",
    text: allowedText,
  };
}
