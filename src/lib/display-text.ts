const LETTER_REGEX = /\p{L}/gu;
const WORD_REGEX = /\p{L}+(?:[-'][\p{L}]+)*/gu;

const LOWERCASE_WORDS = new Set([
  "a",
  "ao",
  "aos",
  "as",
  "com",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "para",
  "por",
]);

const PRESERVED_TERMS: Array<[string, string]> = [
  ["api", "API"],
  ["bi", "BI"],
  ["cipa", "CIPA"],
  ["clt", "CLT"],
  ["cnpj", "CNPJ"],
  ["cofins", "COFINS"],
  ["cpf", "CPF"],
  ["css", "CSS"],
  ["ctps", "CTPS"],
  ["dp", "DP"],
  ["ead", "EAD"],
  ["e-social", "eSocial"],
  ["esocial", "eSocial"],
  ["fgts", "FGTS"],
  ["html", "HTML"],
  ["icms", "ICMS"],
  ["inss", "INSS"],
  ["ipi", "IPI"],
  ["irpf", "IRPF"],
  ["irpj", "IRPJ"],
  ["iss", "ISS"],
  ["js", "JS"],
  ["lgpd", "LGPD"],
  ["mei", "MEI"],
  ["nr", "NR"],
  ["on-line", "on-line"],
  ["online", "online"],
  ["pcd", "PCD"],
  ["pis", "PIS"],
  ["power bi", "Power BI"],
  ["rh", "RH"],
  ["s/a", "S/A"],
  ["sped", "SPED"],
  ["sql", "SQL"],
  ["sst", "SST"],
  ["ti", "TI"],
  ["ui", "UI"],
  ["ux", "UX"],
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isLetterUppercase(letter: string): boolean {
  return (
    letter !== letter.toLocaleLowerCase("pt-BR") &&
    letter === letter.toLocaleUpperCase("pt-BR")
  );
}

function isLetterLowercase(letter: string): boolean {
  return (
    letter !== letter.toLocaleUpperCase("pt-BR") &&
    letter === letter.toLocaleLowerCase("pt-BR")
  );
}

function hasLetters(value: string): boolean {
  return /\p{L}/u.test(value);
}

function looksLikeIdentifierCode(value: string): boolean {
  return (
    !/\s/.test(value) &&
    /\d/.test(value) &&
    /^[\p{L}\p{N}._/-]+$/u.test(value)
  );
}

function isUppercaseWord(value: string): boolean {
  if (looksLikeIdentifierCode(value)) return false;

  const letters = value.match(LETTER_REGEX) ?? [];
  if (letters.length === 0) return false;

  return letters.some(isLetterUppercase) && !letters.some(isLetterLowercase);
}

function isPartOfIdentifier(value: string, index: number, word: string): boolean {
  const before = index > 0 ? value[index - 1] : "";
  const afterIndex = index + word.length;
  const after = afterIndex < value.length ? value[afterIndex] : "";

  return /[\p{N}_]/u.test(before) || /[\p{N}_]/u.test(after);
}

function capitalizeWord(value: string): string {
  const lower = value.toLocaleLowerCase("pt-BR");

  return lower
    .split("-")
    .map((part) =>
      part
        ? part.charAt(0).toLocaleUpperCase("pt-BR") + part.slice(1)
        : part,
    )
    .join("-");
}

function countLetters(value: string): number {
  return value.match(LETTER_REGEX)?.length ?? 0;
}

function restorePreservedTerms(value: string): string {
  return PRESERVED_TERMS.reduce((text, [term, replacement]) => {
    const pattern = new RegExp(
      `(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}(?=$|[^\\p{L}\\p{N}])`,
      "giu",
    );

    return text.replace(
      pattern,
      (_match, prefix: string) => `${prefix}${replacement}`,
    );
  }, value);
}

export function formatReadableText(value: string | null | undefined): string {
  if (!value) return "";

  const normalized = normalizeWhitespace(value);
  if (looksLikeIdentifierCode(normalized)) return normalized;

  let wordCount = 0;
  const readable = normalized.replace(WORD_REGEX, (word, index) => {
    if (!hasLetters(word) || isPartOfIdentifier(normalized, index, word)) {
      return word;
    }

    wordCount += 1;
    const lower = word.toLocaleLowerCase("pt-BR");

    if (LOWERCASE_WORDS.has(lower)) {
      return wordCount > 1 ? lower : capitalizeWord(word);
    }

    if (isUppercaseWord(word)) {
      if (countLetters(word) <= 2) return word;
      return capitalizeWord(word);
    }

    return word;
  });

  return restorePreservedTerms(readable);
}
