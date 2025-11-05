"use client";

import React from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { DatePickerCustom } from "@/components/ui/custom/date-picker";
import { format as formatDate } from "date-fns";
import { SelectCustom } from "@/components/ui/custom/select";
import MultiSelect, {
  type MultiSelectOption,
} from "@/components/ui/custom/multiselect";
import { toastCustom } from "@/components/ui/custom/toast";

interface FormState {
  usuarioId: string;
  areaInteresseId: string;
  subareaInteresseId: string[];
  titulo: string;
  descricao: string;
  requisitosObrigatorios: string;
  requisitosDesejaveis: string;
  atividadesPrincipais: string;
  atividadesExtras: string;
  beneficiosLista: string;
  beneficiosObservacoes: string;
  observacoes: string;
  modoAnonimo: boolean;
  paraPcd: boolean;
  vagaEmDestaque: boolean;
  regimeDeTrabalho: string;
  modalidade: string;
  jornada: string;
  senioridade: string;
  numeroVagas: string;
  salarioMin: string;
  salarioMax: string;
  salarioConfidencial: boolean;
  inscricoesAte: string;
  localizacao: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento: string;
    referencia: string;
  };
}

type FormErrors = Record<string, string>;

interface BasicInfoStepProps {
  formData: FormState;
  errors: FormErrors;
  isSubmitting: boolean;
  isLoadingEmpresas: boolean;
  isLoadingCategorias: boolean;
  empresasError?: string;
  categoriasError?: string;
  empresas: Array<{ value: string; label: string }>;
  categoriaOptions: Array<{ value: string; label: string }>;
  subcategoriaOptions: Array<{ value: string; label: string }>;
  onFieldChange: (field: keyof FormState, value: any) => void;
}

export function BasicInfoStep({
  formData,
  errors,
  isSubmitting,
  isLoadingEmpresas,
  isLoadingCategorias,
  empresasError,
  categoriasError,
  empresas,
  categoriaOptions,
  subcategoriaOptions,
  onFieldChange,
}: BasicInfoStepProps) {
  const regimeOptions = [
    { value: "CLT", label: "CLT" },
    { value: "PJ", label: "Pessoa Jurídica" },
    { value: "ESTAGIO", label: "Estágio" },
    { value: "TRAINEE", label: "Trainee" },
    { value: "FREELANCE", label: "Freelance" },
  ];

  const modalidadeOptions = [
    { value: "PRESENCIAL", label: "Presencial" },
    { value: "REMOTO", label: "Remoto" },
    { value: "HIBRIDO", label: "Híbrido" },
  ];

  const jornadaOptions = [
    { value: "INTEGRAL", label: "Integral" },
    { value: "MEIO_PERIODO", label: "Meio período" },
    { value: "FLEXIVEL", label: "Flexível" },
  ];

  const senioridadeOptions = [
    { value: "JUNIOR", label: "Júnior" },
    { value: "PLENO", label: "Pleno" },
    { value: "SENIOR", label: "Sênior" },
    { value: "ESPECIALISTA", label: "Especialista" },
    { value: "GERENTE", label: "Gerente" },
    { value: "DIRETOR", label: "Diretor" },
  ];

  return (
    <fieldset disabled={isSubmitting} className="space-y-6">
      <section className="space-y-5">
        <header className="mb-10">
          <h3 className="!mb-0">Informações básicas da vaga</h3>
          <p className="!text-sm">
            Defina os detalhes principais da oportunidade.
          </p>
        </header>

        {/* Linha 1: Título (50%), Empresa (30%), Inscrições até (20%) */}
        <div className="grid gap-4 lg:grid-cols-[2.5fr_1.5fr_1fr]">
          <InputCustom
            label="Título da vaga"
            name="titulo"
            value={formData.titulo}
            onChange={(event) => onFieldChange("titulo", event.target.value)}
            maxLength={50}
            placeholder="Ex: Analista de Marketing Digital"
            error={errors.titulo}
            required
          />

          <SelectCustom
            label="Empresa"
            placeholder={
              isLoadingEmpresas
                ? "Carregando empresas..."
                : "Selecione a empresa"
            }
            options={empresas}
            value={formData.usuarioId || null}
            onChange={(value) => onFieldChange("usuarioId", value || "")}
            disabled={isSubmitting || isLoadingEmpresas}
            error={errors.usuarioId || empresasError || undefined}
            required
          />

          <DatePickerCustom
            label="Inscrições até"
            value={
              formData.inscricoesAte ? new Date(formData.inscricoesAte) : null
            }
            onChange={(date) =>
              onFieldChange(
                "inscricoesAte",
                date ? formatDate(date, "yyyy-MM-dd") : ""
              )
            }
            placeholder="Selecione a data"
            error={errors.inscricoesAte}
            required
          />
        </div>

        {/* Linha 2: Visibilidade, Categoria, Subcategoria, Número de vagas */}
        <div className="grid gap-4 lg:grid-cols-4">
          <SelectCustom
            label="Visibilidade"
            value={formData.modoAnonimo ? "anonimo" : "publico"}
            onChange={(value) =>
              onFieldChange("modoAnonimo", value === "anonimo")
            }
            options={[
              {
                value: "publico",
                label: "Empresa visível",
              },
              {
                value: "anonimo",
                label: "Anônima",
              },
            ]}
            error={errors.modoAnonimo}
            disabled={isSubmitting}
            placeholder="Selecione a visibilidade"
          />

          <SelectCustom
            label="Categoria"
            placeholder={
              isLoadingCategorias
                ? "Carregando categorias..."
                : "Selecione a categoria"
            }
            options={categoriaOptions}
            value={formData.areaInteresseId || null}
            onChange={(value) => onFieldChange("areaInteresseId", value || "")}
            disabled={isSubmitting || isLoadingCategorias}
            error={errors.areaInteresseId || categoriasError || undefined}
            required
          />

          <MultiSelect
            label="Subcategoria"
            required
            size="md"
            placeholder={
              formData.areaInteresseId
                ? subcategoriaOptions.length > 0
                  ? "Selecione as subcategorias"
                  : "Nenhuma subcategoria cadastrada"
                : "Escolha uma categoria primeiro"
            }
            defaultOptions={subcategoriaOptions as MultiSelectOption[]}
            options={subcategoriaOptions as MultiSelectOption[]}
            value={subcategoriaOptions.filter((o) =>
              formData.subareaInteresseId.includes(o.value)
            )}
            onChange={(opts) =>
              onFieldChange(
                "subareaInteresseId",
                (opts || []).map((o) => o.value)
              )
            }
            maxSelected={2}
            onMaxSelected={() =>
              toastCustom.info(
                "Você pode selecionar no máximo 2 subcategorias."
              )
            }
            disabled={
              isSubmitting ||
              !formData.areaInteresseId ||
              subcategoriaOptions.length === 0
            }
          />
          {errors.subareaInteresseId && (
            <p className="text-sm text-red-500">{errors.subareaInteresseId}</p>
          )}

          <InputCustom
            label="Número de vagas"
            name="numeroVagas"
            type="number"
            min={1}
            max={9999}
            maxLength={4}
            value={formData.numeroVagas}
            onChange={(event) =>
              onFieldChange(
                "numeroVagas",
                (() => {
                  const raw = event.target.value.replace(/\D/g, "");
                  const trimmed = raw.slice(0, 4);
                  const n = Number(trimmed || "");
                  if (Number.isNaN(n)) return "";
                  if (n < 1) return ""; // não permitir 0
                  if (n > 9999) return "9999";
                  return String(n);
                })()
              )
            }
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                e.preventDefault();
              }
              const target = e.currentTarget as HTMLInputElement;
              const current = (target.value || "").replace(/\D/g, "");
              const selLength =
                (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
              if (
                e.key === "0" &&
                (current.length === 0 || current === "0") &&
                selLength === 0
              ) {
                e.preventDefault();
              }
              const isDigit = /^[0-9]$/.test(e.key);
              if (isDigit && current.length >= 4 && selLength === 0) {
                e.preventDefault();
              }
            }}
            error={errors.numeroVagas}
            required
          />
        </div>

        {/* Linha 3: Modalidade, Jornada, Regime, Senioridade */}
        <div className="grid gap-4 lg:grid-cols-4">
          <SelectCustom
            label="Modalidade de trabalho"
            options={modalidadeOptions}
            value={formData.modalidade || null}
            onChange={(value) => onFieldChange("modalidade", value || "")}
            placeholder="Selecione a modalidade"
            disabled={isSubmitting}
            error={errors.modalidade}
            required
          />

          <SelectCustom
            label="Jornada"
            options={jornadaOptions}
            value={formData.jornada || null}
            onChange={(value) => onFieldChange("jornada", value || "")}
            placeholder="Selecione a jornada"
            disabled={isSubmitting}
            error={errors.jornada}
            required
          />

          <SelectCustom
            label="Regime"
            options={regimeOptions}
            value={formData.regimeDeTrabalho || null}
            onChange={(value) => onFieldChange("regimeDeTrabalho", value || "")}
            placeholder="Selecione o regime"
            disabled={isSubmitting}
            error={errors.regimeDeTrabalho}
            required
          />

          <SelectCustom
            label="Senioridade"
            options={senioridadeOptions}
            value={formData.senioridade || null}
            onChange={(value) => onFieldChange("senioridade", value || "")}
            placeholder="Selecione a senioridade"
            disabled={isSubmitting}
            error={errors.senioridade}
            required
          />
        </div>
      </section>
    </fieldset>
  );
}
