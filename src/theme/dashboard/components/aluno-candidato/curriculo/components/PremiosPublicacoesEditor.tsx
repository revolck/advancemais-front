"use client";

import React, { useCallback, useMemo } from "react";
import {
  ButtonCustom,
  DatePickerCustom,
  InputCustom,
  RichTextarea,
  SelectCustom,
  type SelectOption,
} from "@/components/ui/custom";
import { Trash2 } from "lucide-react";

export type PremioFormItem = {
  titulo: string;
  organizacao: string;
  data: Date | null;
  descricao: string;
};

export type PublicacaoFormItem = {
  titulo: string;
  tipo: string | null;
  veiculo: string;
  data: Date | null;
  url: string;
};

const PUBLICACAO_TIPO_OPTIONS: SelectOption[] = [
  { value: "ARTIGO", label: "Artigo" },
  { value: "LIVRO", label: "Livro" },
  { value: "PAPER", label: "Paper" },
  { value: "POST_BLOG", label: "Post de blog" },
  { value: "VIDEO", label: "Vídeo" },
  { value: "PODCAST", label: "Podcast" },
];

function makeEmptyPremio(): PremioFormItem {
  return { titulo: "", organizacao: "", data: null, descricao: "" };
}

function makeEmptyPublicacao(): PublicacaoFormItem {
  return { titulo: "", tipo: null, veiculo: "", data: null, url: "" };
}

export function isEmptyPremioRow(item: PremioFormItem): boolean {
  return (
    !item.titulo.trim() &&
    !item.organizacao.trim() &&
    !item.data &&
    !item.descricao.trim()
  );
}

export function isEmptyPublicacaoRow(item: PublicacaoFormItem): boolean {
  return (
    !item.titulo.trim() &&
    !item.tipo &&
    !item.veiculo.trim() &&
    !item.data &&
    !item.url.trim()
  );
}

export type PremiosPublicacoesEditorProps = {
  premios: PremioFormItem[];
  publicacoes: PublicacaoFormItem[];
  onChangePremios: (next: PremioFormItem[]) => void;
  onChangePublicacoes: (next: PublicacaoFormItem[]) => void;
  disabled?: boolean;
  errorPremios?: string;
  errorPublicacoes?: string;
  maxItems?: number;
};

export function PremiosPublicacoesEditor({
  premios,
  publicacoes,
  onChangePremios,
  onChangePublicacoes,
  disabled,
  errorPremios,
  errorPublicacoes,
  maxItems = 5,
}: PremiosPublicacoesEditorProps) {
  const effectivePremios = useMemo<PremioFormItem[]>(
    () => (premios?.length ? premios : [makeEmptyPremio()]),
    [premios],
  );
  const effectivePublicacoes = useMemo<PublicacaoFormItem[]>(
    () => (publicacoes?.length ? publicacoes : [makeEmptyPublicacao()]),
    [publicacoes],
  );

  const premiosReachedLimit = effectivePremios.length >= maxItems;
  const publicacoesReachedLimit = effectivePublicacoes.length >= maxItems;

  const updatePremio = useCallback(
    (idx: number, patch: Partial<PremioFormItem>) => {
      onChangePremios(
        effectivePremios.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
      );
    },
    [effectivePremios, onChangePremios],
  );

  const removePremio = useCallback(
    (idx: number) => {
      if (effectivePremios.length <= 1) {
        onChangePremios([makeEmptyPremio()]);
        return;
      }
      onChangePremios(effectivePremios.filter((_, i) => i !== idx));
    },
    [effectivePremios, onChangePremios],
  );

  const addPremio = useCallback(() => {
    if (premiosReachedLimit) return;
    onChangePremios([...effectivePremios, makeEmptyPremio()]);
  }, [effectivePremios, onChangePremios, premiosReachedLimit]);

  const updatePublicacao = useCallback(
    (idx: number, patch: Partial<PublicacaoFormItem>) => {
      onChangePublicacoes(
        effectivePublicacoes.map((r, i) =>
          i === idx ? { ...r, ...patch } : r,
        ),
      );
    },
    [effectivePublicacoes, onChangePublicacoes],
  );

  const removePublicacao = useCallback(
    (idx: number) => {
      if (effectivePublicacoes.length <= 1) {
        onChangePublicacoes([makeEmptyPublicacao()]);
        return;
      }
      onChangePublicacoes(effectivePublicacoes.filter((_, i) => i !== idx));
    },
    [effectivePublicacoes, onChangePublicacoes],
  );

  const addPublicacao = useCallback(() => {
    if (publicacoesReachedLimit) return;
    onChangePublicacoes([...effectivePublicacoes, makeEmptyPublicacao()]);
  }, [effectivePublicacoes, onChangePublicacoes, publicacoesReachedLimit]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Prêmios</div>
            <div className="text-xs text-gray-500">Adicione premiações.</div>
          </div>
          <div className="flex items-center gap-3">
            {premiosReachedLimit && (
              <span className="text-xs text-gray-500">
                Limite de {maxItems} prêmios atingido
              </span>
            )}
            <ButtonCustom
              type="button"
              variant="primary"
              size="sm"
              onClick={addPremio}
              disabled={disabled || premiosReachedLimit}
            >
              Adicionar prêmio
            </ButtonCustom>
          </div>
        </div>

        <div className="space-y-4">
          {effectivePremios.map((row, idx) => {
            const isFilled = !isEmptyPremioRow(row);

            return (
              <div
                key={`premio-${idx}`}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-sm font-semibold text-gray-900">
                    Prêmio {idx + 1}
                  </div>
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removePremio(idx)}
                    disabled={
                      disabled || (effectivePremios.length === 1 && !isFilled)
                    }
                    className="h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ButtonCustom>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InputCustom
                    label="Título"
                    value={row.titulo}
                    onChange={(e) =>
                      updatePremio(idx, { titulo: e.target.value })
                    }
                    placeholder="Ex.: Melhor Projeto..."
                    disabled={disabled}
                    required={isFilled}
                  />
                  <InputCustom
                    label="Organização"
                    value={row.organizacao}
                    onChange={(e) =>
                      updatePremio(idx, { organizacao: e.target.value })
                    }
                    placeholder="Ex.: Tech Conference..."
                    disabled={disabled}
                    required={isFilled}
                  />
                  <DatePickerCustom
                    label="Data"
                    value={row.data}
                    onChange={(d) => updatePremio(idx, { data: d })}
                    disabled={disabled}
                    placeholder="Selecionar"
                    format="dd/MM/yyyy"
                    years="old"
                    clearable
                    required={isFilled}
                  />
                </div>

                <div className="mt-4">
                  <RichTextarea
                    label="Descrição"
                    placeholder="Descreva brevemente..."
                    value={row.descricao}
                    onChange={(e) =>
                      updatePremio(idx, {
                        descricao: (e.target as HTMLTextAreaElement).value,
                      })
                    }
                    maxLength={2000}
                    showCharCount
                    disabled={disabled}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {errorPremios && (
          <p className="text-sm text-destructive">{errorPremios}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              Publicações
            </div>
            <div className="text-xs text-gray-500">Adicione publicações.</div>
          </div>
          <div className="flex items-center gap-3">
            {publicacoesReachedLimit && (
              <span className="text-xs text-gray-500">
                Limite de {maxItems} publicações atingido
              </span>
            )}
            <ButtonCustom
              type="button"
              variant="primary"
              size="sm"
              onClick={addPublicacao}
              disabled={disabled || publicacoesReachedLimit}
            >
              Adicionar publicação
            </ButtonCustom>
          </div>
        </div>

        <div className="space-y-4">
          {effectivePublicacoes.map((row, idx) => {
            const isFilled = !isEmptyPublicacaoRow(row);

            return (
              <div
                key={`pub-${idx}`}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-sm font-semibold text-gray-900">
                    Publicação {idx + 1}
                  </div>
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removePublicacao(idx)}
                    disabled={
                      disabled ||
                      (effectivePublicacoes.length === 1 && !isFilled)
                    }
                    className="h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ButtonCustom>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <InputCustom
                    label="Título"
                    value={row.titulo}
                    onChange={(e) =>
                      updatePublicacao(idx, { titulo: e.target.value })
                    }
                    placeholder="Ex.: Otimização de..."
                    disabled={disabled}
                    required={isFilled}
                  />
                  <SelectCustom
                    label="Tipo"
                    placeholder="Selecionar"
                    options={PUBLICACAO_TIPO_OPTIONS}
                    value={row.tipo}
                    onChange={(v) =>
                      updatePublicacao(idx, { tipo: v ?? null })
                    }
                    disabled={disabled}
                    required={isFilled}
                  />
                  <InputCustom
                    label="Veículo"
                    value={row.veiculo}
                    onChange={(e) =>
                      updatePublicacao(idx, { veiculo: e.target.value })
                    }
                    placeholder="Ex.: Medium"
                    disabled={disabled}
                    required={isFilled}
                  />
                  <DatePickerCustom
                    label="Data"
                    value={row.data}
                    onChange={(d) => updatePublicacao(idx, { data: d })}
                    disabled={disabled}
                    placeholder="Selecionar"
                    format="dd/MM/yyyy"
                    years="old"
                    clearable
                    required={isFilled}
                  />
                </div>

                <div className="mt-4">
                <InputCustom
                  label="URL"
                  value={row.url}
                  onChange={(e) =>
                    updatePublicacao(idx, { url: e.target.value })
                  }
                    placeholder="https://..."
                    disabled={disabled}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {errorPublicacoes && (
          <p className="text-sm text-destructive">{errorPublicacoes}</p>
        )}
      </div>
    </div>
  );
}
