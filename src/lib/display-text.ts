const LETTER_REGEX = /\p{L}/gu;
const FIRST_LETTER_REGEX = /\p{L}/u;

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

function looksLikeIdentifierCode(value: string): boolean {
  return (
    !/\s/.test(value) &&
    /\d/.test(value) &&
    /^[\p{L}\p{N}._/-]+$/u.test(value)
  );
}

function isShoutingText(value: string): boolean {
  if (looksLikeIdentifierCode(value)) return false;

  const letters = value.match(LETTER_REGEX) ?? [];
  if (letters.length < 2) return false;

  return letters.some(isLetterUppercase) && !letters.some(isLetterLowercase);
}

function uppercaseFirstLetter(value: string): string {
  const match = FIRST_LETTER_REGEX.exec(value);
  if (!match || match.index === undefined) return value;

  const index = match.index;
  const firstLetter = match[0];

  return (
    value.slice(0, index) +
    firstLetter.toLocaleUpperCase("pt-BR") +
    value.slice(index + firstLetter.length)
  );
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
  if (!isShoutingText(normalized)) return normalized;

  const sentenceCase = uppercaseFirstLetter(normalized.toLocaleLowerCase("pt-BR"));

  return restorePreservedTerms(sentenceCase);
}
