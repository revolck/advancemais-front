"use client";

import React, { useCallback, useMemo } from "react";
import { ButtonCustom, InputCustom, SelectCustom } from "@/components/ui/custom";
import type { SelectOption } from "@/components/ui/custom";
import { Trash2 } from "lucide-react";

export type TechnicalSkillLevel =
  | "INICIANTE"
  | "BASICO"
  | "INTERMEDIARIO"
  | "AVANCADO"
  | "EXPERT";

export type TechnicalSkillFormItem = {
  id: string;
  nome: string;
  nivel: TechnicalSkillLevel | "";
  anosExperiencia: string;
};

const NIVEL_OPTIONS: SelectOption[] = [
  { value: "INICIANTE", label: "Iniciante" },
  { value: "BASICO", label: "Básico" },
  { value: "INTERMEDIARIO", label: "Intermediário" },
  { value: "AVANCADO", label: "Avançado" },
  { value: "EXPERT", label: "Expert" },
];

const ANOS_OPTIONS: SelectOption[] = [
  ...Array.from({ length: 19 }, (_, i) => {
    const val = String(i + 1);
    return { value: val, label: val } satisfies SelectOption;
  }),
  { value: "20+", label: "20+" },
];

function isRowEmpty(item: TechnicalSkillFormItem): boolean {
  return (
    !item.nome.trim() && !item.nivel && !(item.anosExperiencia || "").trim()
  );
}

function createLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyRow(): TechnicalSkillFormItem {
  return { id: createLocalId(), nome: "", nivel: "", anosExperiencia: "" };
}

export type TechnicalSkillsEditorProps = {
  value: TechnicalSkillFormItem[];
  onChange: (next: TechnicalSkillFormItem[]) => void;
  disabled?: boolean;
  error?: string;
  maxItems?: number;
};

export function TechnicalSkillsEditor({
  value,
  onChange,
  disabled,
  error,
  maxItems = 10,
}: TechnicalSkillsEditorProps) {
  const rows = useMemo(() => value ?? [], [value]);

  React.useEffect(() => {
    if (rows.length === 0) return;
    if (rows.every((r) => typeof r?.id === "string" && r.id.trim())) return;
    onChange(
      rows.map((row) => ({
        id: typeof row?.id === "string" && row.id.trim() ? row.id : createLocalId(),
        nome: row?.nome ?? "",
        nivel: row?.nivel ?? "",
        anosExperiencia: row?.anosExperiencia ?? "",
      })),
    );
  }, [onChange, rows]);

  const effectiveRows = useMemo<TechnicalSkillFormItem[]>(
    () => (rows.length === 0 ? [createEmptyRow()] : rows),
    [rows]
  );
  const hasReachedLimit = effectiveRows.length >= maxItems;

  const handleAdd = useCallback(() => {
    if (hasReachedLimit) return;
    onChange([...effectiveRows, createEmptyRow()]);
  }, [effectiveRows, hasReachedLimit, onChange]);

  const handleRemove = useCallback(
    (idx: number) => {
      if (effectiveRows.length <= 1) {
        onChange([createEmptyRow()]);
        return;
      }
      onChange(effectiveRows.filter((_, i) => i !== idx));
    },
    [effectiveRows, onChange]
  );

  const handleUpdate = useCallback(
    (idx: number, patch: Partial<TechnicalSkillFormItem>) => {
      onChange(
        effectiveRows.map((r, i) => {
          if (i !== idx) return r;
          return { ...r, ...patch };
        })
      );
    },
    [effectiveRows, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-3">
        {hasReachedLimit && (
          <span className="text-xs text-gray-500">
            Limite de {maxItems} habilidades atingido
          </span>
        )}
        <ButtonCustom
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAdd}
          disabled={disabled || hasReachedLimit}
        >
          Adicionar
        </ButtonCustom>
      </div>

      <div className="space-y-3">
        {effectiveRows.map((row, idx) => (
          <div
            key={row.id}
            className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_auto]"
          >
            <InputCustom
              label={idx === 0 ? "Tecnologia" : undefined}
              value={row.nome}
              onChange={(e) => handleUpdate(idx, { nome: e.target.value })}
              placeholder="Ex.: JavaScript"
              disabled={disabled}
            />

            <SelectCustom
              label={idx === 0 ? "Nível" : undefined}
              placeholder="Selecionar"
              options={NIVEL_OPTIONS}
              value={row.nivel || null}
              onChange={(v) => handleUpdate(idx, { nivel: (v ?? "") as any })}
              disabled={disabled}
            />

            <SelectCustom
              label={idx === 0 ? "Anos" : undefined}
              placeholder="Selecionar"
              options={ANOS_OPTIONS}
              value={row.anosExperiencia || null}
              onChange={(v) =>
                handleUpdate(idx, { anosExperiencia: String(v ?? "") })
              }
              disabled={disabled}
            />

            <div className="space-y-2">
              {idx === 0 && (
                <span className="block text-sm font-medium opacity-0 select-none">
                  Excluir
                </span>
              )}
              <ButtonCustom
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemove(idx)}
                disabled={
                  disabled || (effectiveRows.length === 1 && isRowEmpty(row))
                }
                className="h-12 w-12"
              >
                <Trash2 className="h-4 w-4" />
              </ButtonCustom>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
