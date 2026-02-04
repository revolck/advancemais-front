export function extractListFromApiResponse(raw: any): any[] {
  if (!raw) return [];

  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw.items)) return raw.items;

  return [];
}

export function pickTitulo(raw: any): string {
  const candidates = [raw?.titulo, raw?.nome, raw?.title, raw?.descricao];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
}

