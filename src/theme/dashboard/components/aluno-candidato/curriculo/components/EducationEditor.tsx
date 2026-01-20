"use client";

import React, { useCallback, useMemo } from "react";
import {
  ButtonCustom,
  DatePickerCustom,
  InputCustom,
  SelectCustom,
  type SelectOption,
} from "@/components/ui/custom";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { GraduationCap, Trash2 } from "lucide-react";

export type EducationFormItem = {
  tipo: string | null;
  curso: string;
  instituicao: string;
  status: string | null;
  dataInicio: Date | null;
  dataFim: Date | null;
  emAndamento: boolean;
};

const TIPO_OPTIONS: SelectOption[] = [
  { value: "GRADUACAO", label: "Graduação" },
  { value: "POS_GRADUACAO", label: "Pós-graduação" },
  { value: "MESTRADO", label: "Mestrado" },
  { value: "DOUTORADO", label: "Doutorado" },
  { value: "TECNICO", label: "Técnico" },
  { value: "CURSO_LIVRE", label: "Curso livre" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "TRANCADO", label: "Trancado" },
  { value: "ABANDONADO", label: "Abandonado" },
];

function makeEmptyRow(): EducationFormItem {
  return {
    tipo: null,
    curso: "",
    instituicao: "",
    status: null,
    dataInicio: null,
    dataFim: null,
    emAndamento: false,
  };
}

export function isEmptyEducationRow(item: EducationFormItem): boolean {
  return (
    !item.tipo &&
    !item.curso.trim() &&
    !item.instituicao.trim() &&
    !item.status &&
    !item.dataInicio &&
    !item.dataFim &&
    !item.emAndamento
  );
}

export type EducationEditorProps = {
  value: EducationFormItem[];
  onChange: (next: EducationFormItem[]) => void;
  disabled?: boolean;
  error?: string;
  maxItems?: number;
};

export function EducationEditor({
  value,
  onChange,
  disabled,
  error,
  maxItems = 5,
}: EducationEditorProps) {
  const rows = useMemo(() => value ?? [], [value]);
  const effectiveRows = useMemo<EducationFormItem[]>(
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
    (idx: number, patch: Partial<EducationFormItem>) => {
      onChange(
        effectiveRows.map((r, i) => {
          if (i !== idx) return r;
          const next: EducationFormItem = { ...r, ...patch };

          const status =
            (patch.status ?? next.status ?? null) === "EM_ANDAMENTO";
          if (patch.emAndamento !== undefined) {
            next.emAndamento = Boolean(patch.emAndamento);
          }

          const isOngoing = Boolean(next.emAndamento) || status;
          if (isOngoing) {
            next.dataFim = null;
            next.status = "EM_ANDAMENTO";
          } else if (status) {
            next.status = null;
          }

          return next;
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
            Limite de {maxItems} formações atingido
          </span>
        )}
        <ButtonCustom
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAdd}
          disabled={disabled || hasReachedLimit}
        >
          Adicionar formação
        </ButtonCustom>
      </div>

      <div className="space-y-4">
        {effectiveRows.map((row, idx) => {
          const isFilled = !isEmptyEducationRow(row);
          const isOngoing = Boolean(row.emAndamento) || row.status === "EM_ANDAMENTO";

          return (
            <div
              key={`edu-${idx}`}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-sm font-semibold text-gray-900">
                  Formação {idx + 1}
                </div>
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemove(idx)}
                  disabled={disabled || (effectiveRows.length === 1 && !isFilled)}
                  className="h-10 w-10"
                >
                  <Trash2 className="h-4 w-4" />
                </ButtonCustom>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="text-md font-medium text-foreground">
                    Em andamento
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                      row.emAndamento
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {row.emAndamento ? "Sim" : "Não"}
                  </span>
                  <Switch
                    checked={row.emAndamento}
                    onCheckedChange={(checked) =>
                      handleUpdate(idx, { emAndamento: checked })
                    }
                    disabled={disabled}
                    aria-label="Alternar formação em andamento"
                    className="shadow-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                <InputCustom
                  label="Curso"
                  value={row.curso}
                  onChange={(e) => handleUpdate(idx, { curso: e.target.value })}
                  placeholder="Ex.: Ciência da Computação"
                  disabled={disabled}
                  required={isFilled}
                />
                <InputCustom
                  label="Instituição"
                  value={row.instituicao}
                  onChange={(e) =>
                    handleUpdate(idx, { instituicao: e.target.value })
                  }
                  placeholder="Ex.: Universidade..."
                  disabled={disabled}
                  required={isFilled}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mt-4">
                <SelectCustom
                  label="Tipo"
                  placeholder="Selecionar"
                  options={TIPO_OPTIONS}
                  value={row.tipo}
                  onChange={(v) => handleUpdate(idx, { tipo: v ?? null })}
                  disabled={disabled}
                  required={isFilled}
                />

                <SelectCustom
                  label="Status"
                  placeholder={row.emAndamento ? "Em andamento" : "Selecionar"}
                  options={STATUS_OPTIONS}
                  value={row.emAndamento ? "EM_ANDAMENTO" : row.status}
                  onChange={(v) => handleUpdate(idx, { status: v ?? null })}
                  disabled={disabled || row.emAndamento}
                  required={isFilled && !isOngoing}
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
                  disabled={disabled || row.emAndamento}
                  placeholder={row.emAndamento ? "Em andamento" : "Selecionar"}
                  format="dd/MM/yyyy"
                  years="old"
                  clearable
                  required={isFilled && !isOngoing}
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
