export type SelectOption = { value: string; label: string; disabled?: boolean };

export type AulaTemplateForSelect = {
  id: string;
  codigo?: string;
  titulo?: string | null;
};

export type AvaliacaoTemplateForSelect = {
  id: string;
  codigo?: string;
  titulo?: string | null;
  tipo: "ATIVIDADE" | "PROVA";
};

export function buildTemplateLabel(t: { id: string; codigo?: string; titulo?: string | null }) {
  const titulo = (t.titulo ?? "").trim();
  if (titulo) return titulo;
  return "(sem título)";
}

export function buildAulaTemplateOptions(
  templates: AulaTemplateForSelect[],
  usedTemplateIdsExcludingCurrent: Set<string>,
  currentTemplateId: string | null
): SelectOption[] {
  return templates.map((t) => {
    const isUsed = usedTemplateIdsExcludingCurrent.has(t.id) && t.id !== currentTemplateId;
    const baseLabel = buildTemplateLabel(t);
    return {
      value: t.id,
      label: isUsed ? `${baseLabel} (já selecionada)` : baseLabel,
      disabled: isUsed,
    };
  });
}

export function buildAvaliacaoTemplateOptions(
  templates: AvaliacaoTemplateForSelect[],
  tipo: "ATIVIDADE" | "PROVA",
  usedTemplateIdsExcludingCurrent: Set<string>,
  currentTemplateId: string | null
): SelectOption[] {
  return templates
    .filter((t) => t.tipo === tipo)
    .map((t) => {
      const isUsed = usedTemplateIdsExcludingCurrent.has(t.id) && t.id !== currentTemplateId;
      return {
        value: t.id,
        label: buildTemplateLabel(t),
        disabled: isUsed,
      };
    });
}
