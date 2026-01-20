"use client";

import React, { useCallback, useMemo } from "react";
import {
  ButtonCustom,
  DatePickerCustom,
  InputCustom,
} from "@/components/ui/custom";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Award, Trash2 } from "lucide-react";

export type CursoFormItem = {
  nome: string;
  instituicao: string;
  cargaHoraria: string;
  dataConclusao: Date | null;
  certificado: boolean;
  certificadoUrl: string;
};

export type CertificacaoFormItem = {
  nome: string;
  organizacao: string;
  numeroCertificado: string;
  dataEmissao: Date | null;
  dataExpiracao: Date | null;
  certificadoUrl: string;
};

function makeEmptyCurso(): CursoFormItem {
  return {
    nome: "",
    instituicao: "",
    cargaHoraria: "",
    dataConclusao: null,
    certificado: false,
    certificadoUrl: "",
  };
}

function makeEmptyCertificacao(): CertificacaoFormItem {
  return {
    nome: "",
    organizacao: "",
    numeroCertificado: "",
    dataEmissao: null,
    dataExpiracao: null,
    certificadoUrl: "",
  };
}

export function isEmptyCursoRow(item: CursoFormItem): boolean {
  return (
    !item.nome.trim() &&
    !item.instituicao.trim() &&
    !item.cargaHoraria.trim() &&
    !item.dataConclusao &&
    !item.certificado &&
    !item.certificadoUrl.trim()
  );
}

export function isEmptyCertificacaoRow(item: CertificacaoFormItem): boolean {
  return (
    !item.nome.trim() &&
    !item.organizacao.trim() &&
    !item.numeroCertificado.trim() &&
    !item.dataEmissao &&
    !item.dataExpiracao &&
    !item.certificadoUrl.trim()
  );
}

export type CursosCertificacoesEditorProps = {
  cursos: CursoFormItem[];
  certificacoes: CertificacaoFormItem[];
  onChangeCursos: (next: CursoFormItem[]) => void;
  onChangeCertificacoes: (next: CertificacaoFormItem[]) => void;
  disabled?: boolean;
  errorCursos?: string;
  errorCertificacoes?: string;
  maxItems?: number;
};

export function CursosCertificacoesEditor({
  cursos,
  certificacoes,
  onChangeCursos,
  onChangeCertificacoes,
  disabled,
  errorCursos,
  errorCertificacoes,
  maxItems = 5,
}: CursosCertificacoesEditorProps) {
  const effectiveCursos = useMemo<CursoFormItem[]>(
    () => (cursos?.length ? cursos : [makeEmptyCurso()]),
    [cursos],
  );
  const effectiveCertificacoes = useMemo<CertificacaoFormItem[]>(
    () => (certificacoes?.length ? certificacoes : [makeEmptyCertificacao()]),
    [certificacoes],
  );

  const cursosReachedLimit = effectiveCursos.length >= maxItems;
  const certificacoesReachedLimit = effectiveCertificacoes.length >= maxItems;

  const updateCurso = useCallback(
    (idx: number, patch: Partial<CursoFormItem>) => {
      onChangeCursos(
        effectiveCursos.map((r, i) => {
          if (i !== idx) return r;
          return { ...r, ...patch };
        }),
      );
    },
    [effectiveCursos, onChangeCursos],
  );

  const removeCurso = useCallback(
    (idx: number) => {
      if (effectiveCursos.length <= 1) {
        onChangeCursos([makeEmptyCurso()]);
        return;
      }
      onChangeCursos(effectiveCursos.filter((_, i) => i !== idx));
    },
    [effectiveCursos, onChangeCursos],
  );

  const addCurso = useCallback(() => {
    if (cursosReachedLimit) return;
    onChangeCursos([...effectiveCursos, makeEmptyCurso()]);
  }, [cursosReachedLimit, effectiveCursos, onChangeCursos]);

  const updateCertificacao = useCallback(
    (idx: number, patch: Partial<CertificacaoFormItem>) => {
      onChangeCertificacoes(
        effectiveCertificacoes.map((r, i) => {
          if (i !== idx) return r;
          return { ...r, ...patch };
        }),
      );
    },
    [effectiveCertificacoes, onChangeCertificacoes],
  );

  const removeCertificacao = useCallback(
    (idx: number) => {
      if (effectiveCertificacoes.length <= 1) {
        onChangeCertificacoes([makeEmptyCertificacao()]);
        return;
      }
      onChangeCertificacoes(effectiveCertificacoes.filter((_, i) => i !== idx));
    },
    [effectiveCertificacoes, onChangeCertificacoes],
  );

  const addCertificacao = useCallback(() => {
    if (certificacoesReachedLimit) return;
    onChangeCertificacoes([...effectiveCertificacoes, makeEmptyCertificacao()]);
  }, [
    certificacoesReachedLimit,
    effectiveCertificacoes,
    onChangeCertificacoes,
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Cursos</div>
            <div className="text-xs text-gray-500">
              Adicione cursos complementares.
            </div>
          </div>
          <div className="flex items-center gap-3">
            {cursosReachedLimit && (
              <span className="text-xs text-gray-500">
                Limite de {maxItems} cursos atingido
              </span>
            )}
            <ButtonCustom
              type="button"
              variant="primary"
              size="sm"
              onClick={addCurso}
              disabled={disabled || cursosReachedLimit}
            >
              Adicionar curso
            </ButtonCustom>
          </div>
        </div>

        <div className="space-y-4">
          {effectiveCursos.map((row, idx) => {
            const isFilled = !isEmptyCursoRow(row);

            return (
              <div
                key={`curso-${idx}`}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-sm font-semibold text-gray-900">
                    Curso {idx + 1}
                  </div>
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeCurso(idx)}
                    disabled={disabled || (effectiveCursos.length === 1 && !isFilled)}
                    className="h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ButtonCustom>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                      <Award className="h-4 w-4" />
                    </div>
                    <span className="text-md font-medium text-foreground">
                      Certificado
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                        row.certificado
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700",
                      )}
                    >
                      {row.certificado ? "Sim" : "Não"}
                    </span>
                    <Switch
                      checked={row.certificado}
                      onCheckedChange={(checked) =>
                        updateCurso(idx, { certificado: checked })
                      }
                      disabled={disabled}
                      aria-label="Alternar certificado"
                      className="shadow-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mt-4">
                  <InputCustom
                    label="Nome do curso"
                    value={row.nome}
                    onChange={(e) => updateCurso(idx, { nome: e.target.value })}
                    placeholder="Ex.: React Avançado"
                    disabled={disabled}
                    required={isFilled}
                  />
                  <InputCustom
                    label="Instituição"
                    value={row.instituicao}
                    onChange={(e) =>
                      updateCurso(idx, { instituicao: e.target.value })
                    }
                    placeholder="Ex.: Plataforma Online"
                    disabled={disabled}
                    required={isFilled}
                  />
                  <InputCustom
                    label="Carga horária (h)"
                    value={row.cargaHoraria}
                    onChange={(e) =>
                      updateCurso(idx, { cargaHoraria: e.target.value })
                    }
                    placeholder="Ex.: 40"
                    disabled={disabled}
                    type="text"
                  />
                  <DatePickerCustom
                    label="Data de conclusão"
                    value={row.dataConclusao}
                    onChange={(d) => updateCurso(idx, { dataConclusao: d })}
                    disabled={disabled}
                    placeholder="Selecionar"
                    format="dd/MM/yyyy"
                    years="old"
                    clearable
                    required={isFilled}
                  />
                </div>

                {row.certificado && (
                  <div className="mt-4">
                  <InputCustom
                    label="URL do certificado"
                    value={row.certificadoUrl}
                    onChange={(e) =>
                      updateCurso(idx, { certificadoUrl: e.target.value })
                    }
                      placeholder="https://..."
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {errorCursos && (
          <p className="text-sm text-destructive">{errorCursos}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              Certificações
            </div>
            <div className="text-xs text-gray-500">
              Adicione certificações profissionais.
            </div>
          </div>
          <div className="flex items-center gap-3">
            {certificacoesReachedLimit && (
              <span className="text-xs text-gray-500">
                Limite de {maxItems} certificações atingido
              </span>
            )}
            <ButtonCustom
              type="button"
              variant="primary"
              size="sm"
              onClick={addCertificacao}
              disabled={disabled || certificacoesReachedLimit}
            >
              Adicionar certificação
            </ButtonCustom>
          </div>
        </div>

        <div className="space-y-4">
          {effectiveCertificacoes.map((row, idx) => {
            const isFilled = !isEmptyCertificacaoRow(row);

            return (
              <div
                key={`cert-${idx}`}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-sm font-semibold text-gray-900">
                    Certificação {idx + 1}
                  </div>
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeCertificacao(idx)}
                    disabled={
                      disabled || (effectiveCertificacoes.length === 1 && !isFilled)
                    }
                    className="h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ButtonCustom>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InputCustom
                    label="Nome"
                    value={row.nome}
                    onChange={(e) =>
                      updateCertificacao(idx, { nome: e.target.value })
                    }
                    placeholder="Ex.: AWS Certified..."
                    disabled={disabled}
                    required={isFilled}
                  />
                  <InputCustom
                    label="Organização"
                    value={row.organizacao}
                    onChange={(e) =>
                      updateCertificacao(idx, { organizacao: e.target.value })
                    }
                    placeholder="Ex.: Amazon Web Services"
                    disabled={disabled}
                    required={isFilled}
                  />
                  <InputCustom
                    label="Nº do certificado"
                    value={row.numeroCertificado}
                    onChange={(e) =>
                      updateCertificacao(idx, {
                        numeroCertificado: e.target.value,
                      })
                    }
                    placeholder="Ex.: AWS-123456"
                    disabled={disabled}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                  <DatePickerCustom
                    label="Data de emissão"
                    value={row.dataEmissao}
                    onChange={(d) =>
                      updateCertificacao(idx, { dataEmissao: d })
                    }
                    disabled={disabled}
                    placeholder="Selecionar"
                    format="dd/MM/yyyy"
                    years="old"
                    clearable
                    required={isFilled}
                  />
                  <DatePickerCustom
                    label="Data de expiração"
                    value={row.dataExpiracao}
                    onChange={(d) =>
                      updateCertificacao(idx, { dataExpiracao: d })
                    }
                    disabled={disabled}
                    placeholder="Selecionar"
                    format="dd/MM/yyyy"
                    years="old"
                    clearable
                  />
                  <InputCustom
                    label="URL"
                    value={row.certificadoUrl}
                    onChange={(e) =>
                      updateCertificacao(idx, { certificadoUrl: e.target.value })
                    }
                    placeholder="https://..."
                    disabled={disabled}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {errorCertificacoes && (
          <p className="text-sm text-destructive">{errorCertificacoes}</p>
        )}
      </div>
    </div>
  );
}
