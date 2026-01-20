"use client";

import React, { useCallback, useMemo } from "react";
import {
  ButtonCustom,
  InputCustom,
  RichTextarea,
  DatePickerCustom,
} from "@/components/ui/custom";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Briefcase, Trash2 } from "lucide-react";

export type ExperienceFormItem = {
  empresa: string;
  cargo: string;
  dataInicio: Date | null;
  dataFim: Date | null;
  atual: boolean;
  descricao: string;
};

function makeEmptyRow(): ExperienceFormItem {
  return {
    empresa: "",
    cargo: "",
    dataInicio: null,
    dataFim: null,
    atual: false,
    descricao: "",
  };
}

export function isEmptyExperienceRow(item: ExperienceFormItem): boolean {
  return (
    !item.empresa.trim() &&
    !item.cargo.trim() &&
    !item.dataInicio &&
    !item.dataFim &&
    !item.descricao.trim()
  );
}

export type ExperiencesEditorProps = {
  value: ExperienceFormItem[];
  onChange: (next: ExperienceFormItem[]) => void;
  disabled?: boolean;
  error?: string;
  maxItems?: number;
};

export function ExperiencesEditor({
  value,
  onChange,
  disabled,
  error,
  maxItems = 5,
}: ExperiencesEditorProps) {
  const rows = useMemo(() => value ?? [], [value]);
  const effectiveRows = useMemo<ExperienceFormItem[]>(
    () => (rows.length === 0 ? [makeEmptyRow()] : rows),
    [rows]
  );
  const hasReachedLimit = effectiveRows.length >= maxItems;

  const handleAdd = useCallback(() => {
    if (hasReachedLimit) return;
    onChange([...effectiveRows, makeEmptyRow()]);
  }, [effectiveRows, hasReachedLimit, onChange]);

  const handleRemove = useCallback(
    (idx: number) => {
      if (effectiveRows.length <= 1) {
        onChange([makeEmptyRow()]);
        return;
      }
      onChange(effectiveRows.filter((_, i) => i !== idx));
    },
    [effectiveRows, onChange]
  );

  const handleUpdate = useCallback(
    (idx: number, patch: Partial<ExperienceFormItem>) => {
      onChange(
        effectiveRows.map((r, i) => {
          if (patch.atual === true) {
            if (i === idx) {
              return { ...r, ...patch, dataFim: null };
            }
            return r.atual ? { ...r, atual: false } : r;
          }

          if (i !== idx) return r;
          return { ...r, ...patch };
        }),
      );
    },
    [effectiveRows, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-3">
        {hasReachedLimit && (
          <span className="text-xs text-gray-500">
            Limite de {maxItems} experiências atingido
          </span>
        )}
        <ButtonCustom
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAdd}
          disabled={disabled || hasReachedLimit}
        >
          Adicionar experiência
        </ButtonCustom>
      </div>

      <div className="space-y-4">
        {effectiveRows.map((row, idx) => {
          const isFilled = !isEmptyExperienceRow(row);

          return (
            <div
              key={`exp-${idx}`}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-sm font-semibold text-gray-900">
                  Experiência {idx + 1}
                </div>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemove(idx)}
                  disabled={
                    disabled || (effectiveRows.length === 1 && !isFilled)
                  }
                  className="h-10 w-10"
                >
                  <Trash2 className="h-4 w-4" />
                </ButtonCustom>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span className="text-md font-medium text-foreground">
                    Emprego atual
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                      row.atual
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {row.atual ? "Atual" : "Encerrado"}
                  </span>
                  <Switch
                    checked={row.atual}
                    onCheckedChange={(checked) =>
                      handleUpdate(idx, { atual: checked })
                    }
                    disabled={disabled}
                    aria-label="Alternar emprego atual"
                    className="shadow-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mt-4">
                <InputCustom
                  label="Empresa"
                  value={row.empresa}
                  onChange={(e) =>
                    handleUpdate(idx, { empresa: e.target.value })
                  }
                  placeholder="Ex.: Tech Solutions LTDA"
                  disabled={disabled}
                  required={isFilled}
                />
                <InputCustom
                  label="Cargo"
                  value={row.cargo}
                  onChange={(e) =>
                    handleUpdate(idx, { cargo: e.target.value })
                  }
                  placeholder="Ex.: Desenvolvedor Full Stack"
                  disabled={disabled}
                  required={isFilled}
                />
                <DatePickerCustom
                  label="Data de início"
                  value={row.dataInicio}
                  onChange={(d) => handleUpdate(idx, { dataInicio: d })}
                  disabled={disabled}
                  placeholder="Selecionar"
                  format="dd/MM/yyyy"
                  years="old"
                  clearable
                  required={isFilled}
                />
                <DatePickerCustom
                  label="Data de fim"
                  value={row.dataFim}
                  onChange={(d) => handleUpdate(idx, { dataFim: d })}
                  disabled={disabled || row.atual}
                  placeholder={row.atual ? "Atual" : "Selecionar"}
                  format="dd/MM/yyyy"
                  years="old"
                  clearable
                  required={isFilled && !row.atual}
                />
              </div>

              <div className="mt-4">
                <RichTextarea
                  label="Descrição"
                  placeholder="Descreva suas principais atividades e responsabilidades..."
                  value={row.descricao}
                  onChange={(e) =>
                    handleUpdate(idx, {
                      descricao: (e.target as HTMLTextAreaElement).value,
                    })
                  }
                  maxLength={4000}
                  showCharCount
                  disabled={disabled}
                />
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
