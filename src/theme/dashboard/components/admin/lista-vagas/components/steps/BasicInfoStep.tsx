"use client";

import React from "react";
import { InputCustom } from "@/components/ui/custom/input";
import {
  InputSearch,
  type InputSearchApiProps,
  type InputSearchOption,
  type InputSearchSelection,
} from "@/components/ui/custom/inputSearch";
import { DatePickerCustom } from "@/components/ui/custom/date-picker";
import { format as formatDate } from "date-fns";
import { SelectCustom } from "@/components/ui/custom/select";
import MultiSelect, {
  type MultiSelectOption,
} from "@/components/ui/custom/multiselect";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { listAdminCompanies, type AdminCompanyListItem } from "@/api/empresas";
import { isEmpresaElegivelParaCadastroVaga } from "../../hooks/useEmpresasForSelect";

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
  isLoadingEmpresas?: boolean;
  isLoadingCategorias: boolean;
  empresasError?: string;
  categoriasError?: string;
  empresas?: Array<{ value: string; label: string }>;
  categoriaOptions: Array<{ value: string; label: string }>;
  subcategoriaOptions: Array<{ value: string; label: string }>;
  onFieldChange: (field: keyof FormState, value: any) => void;
  isEmpresaRole?: boolean;
}

function formatCnpj(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length !== 14) return value ?? "";

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8,
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function BasicInfoStep({
  formData,
  errors,
  isSubmitting,
  isLoadingCategorias,
  categoriasError,
  empresas = [],
  categoriaOptions,
  subcategoriaOptions,
  onFieldChange,
  isEmpresaRole = false,
}: BasicInfoStepProps) {
  const [selectedEmpresa, setSelectedEmpresa] =
    React.useState<InputSearchOption<AdminCompanyListItem> | null>(null);

  const empresaSearchApiProps = React.useMemo<
    InputSearchApiProps<AdminCompanyListItem>
  >(
    () => ({
      fields: ["cnpj", "name", "email", "cod"],
      minLength: 3,
      limit: 10,
      fetcher: async ({ query, limit, signal }) => {
        const pageSize = Math.max(limit * 5, 50);
        const response = await listAdminCompanies(
          {
            page: 1,
            pageSize,
            search: query,
            elegivelCadastroVaga: true,
          },
          { signal },
        );

        if (!response || !("data" in response)) {
          throw new Error("Não foi possível buscar empresas. Tente novamente.");
        }

        return {
          ...response,
          data: (response.data ?? [])
            .filter(isEmpresaElegivelParaCadastroVaga)
            .slice(0, limit),
        };
      },
      mapItem: (empresa) => ({
        id: empresa.id,
        label: empresa.nome,
        description: [empresa.codUsuario, formatCnpj(empresa.cnpj)]
          .filter(Boolean)
          .join(" - "),
        metadata: {
          cod: empresa.codUsuario,
          cnpj: empresa.cnpj,
          email: empresa.email,
          name: empresa.nome,
        },
        raw: empresa,
      }),
    }),
    [],
  );

  React.useEffect(() => {
    if (!formData.usuarioId) {
      setSelectedEmpresa(null);
      return;
    }

    if (selectedEmpresa?.id === formData.usuarioId) {
      return;
    }

    const empresaOption = empresas.find(
      (empresa) => empresa.value === formData.usuarioId,
    );

    if (empresaOption) {
      setSelectedEmpresa({
        id: empresaOption.value,
        label: empresaOption.label,
      });
    }
  }, [empresas, formData.usuarioId, selectedEmpresa?.id]);

  const handleEmpresaChange = (
    value: InputSearchSelection<AdminCompanyListItem>,
  ) => {
    const option = Array.isArray(value) ? (value[0] ?? null) : value;
    setSelectedEmpresa(option);
    onFieldChange("usuarioId", option?.id ?? "");
  };

  const regimeOptions = [
    { value: "CLT", label: "CLT" },
    { value: "PJ", label: "PJ / Freelance" },
    { value: "ESTAGIO", label: "Estágio" },
    { value: "TEMPORARIO", label: "Temporário" },
    { value: "HOME_OFFICE", label: "Home Office" },
    { value: "JOVEM_APRENDIZ", label: "Jovem Aprendiz" },
  ];

  const modalidadeOptions = [
    { value: "PRESENCIAL", label: "Presencial" },
    { value: "REMOTO", label: "Remoto" },
    { value: "HIBRIDO", label: "Híbrido" },
  ];

  const jornadaOptions = [
    { value: "INTEGRAL", label: "Integral (8h/dia)" },
    { value: "MEIO_PERIODO", label: "Meio período (4h/dia)" },
    { value: "FLEXIVEL", label: "Flexível" },
  ];

  const senioridadeOptions = [
    { value: "ABERTO", label: "Aberto (qualquer nível)" },
    { value: "ESTAGIARIO", label: "Estagiário" },
    { value: "JUNIOR", label: "Júnior" },
    { value: "PLENO", label: "Pleno" },
    { value: "SENIOR", label: "Sênior" },
    { value: "ESPECIALISTA", label: "Especialista" },
    { value: "LIDER", label: "Líder / Gestor" },
  ];

  return (
    <fieldset disabled={isSubmitting} className="space-y-6">
      <section className="space-y-5">
        <header className="mb-10">
          <h4 className="!mb-0">Informações básicas da vaga</h4>
          <p className="!text-sm">
            Defina os detalhes principais da oportunidade.
          </p>
        </header>

        {/* Linha 1: Título, Empresa (se não for role EMPRESA), Inscrições até */}
        <div
          className={`grid gap-4 ${
            isEmpresaRole
              ? "lg:grid-cols-[3fr_1fr]"
              : "lg:grid-cols-[2.5fr_1.5fr_1fr]"
          }`}
        >
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

          {/* Campo de Empresa - só aparece para roles que não são EMPRESA */}
          {!isEmpresaRole && (
            <InputSearch<AdminCompanyListItem>
              label="Empresa"
              placeholder="Buscar por nome, CNPJ, e-mail ou código"
              value={selectedEmpresa}
              onChange={handleEmpresaChange}
              apiProps={empresaSearchApiProps}
              searchHintText="Digite pelo menos 3 caracteres para buscar empresas com plano vinculado."
              disabled={isSubmitting}
              error={errors.usuarioId}
              required
            />
          )}

          <DatePickerCustom
            label="Inscrições até"
            value={
              formData.inscricoesAte
                ? (() => {
                    // Parse da data sem problemas de timezone
                    const [year, month, day] = formData.inscricoesAte
                      .split("-")
                      .map(Number);
                    return new Date(year, month - 1, day);
                  })()
                : null
            }
            onChange={(date) =>
              onFieldChange(
                "inscricoesAte",
                date ? formatDate(date, "yyyy-MM-dd") : "",
              )
            }
            placeholder="Selecione a data"
            error={errors.inscricoesAte}
            minDate={new Date()} // Não permitir datas passadas
            required
          />
        </div>

        {/* Linha 2: Visibilidade, Categoria, Subcategoria, Número de vagas */}
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium required">
                Visibilidade
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={2} className="w-[250px]">
                  <p className="text-sm! text-gray-200! leading-relaxed">
                    Ao escolher "Empresa visível", o nome e logo da empresa
                    aparecerão no site principal.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <SelectCustom
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
              required
            />
          </div>

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
              formData.subareaInteresseId.includes(o.value),
            )}
            onChange={(opts) =>
              onFieldChange(
                "subareaInteresseId",
                (opts || []).map((o) => o.value),
              )
            }
            maxSelected={2}
            onMaxSelected={() =>
              toastCustom.info(
                "Você pode selecionar no máximo 2 subcategorias.",
              )
            }
            disabled={
              isSubmitting ||
              !formData.areaInteresseId ||
              subcategoriaOptions.length === 0
            }
          />

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
                })(),
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
            label="Jornada de trabalho"
            options={jornadaOptions}
            value={formData.jornada || null}
            onChange={(value) => onFieldChange("jornada", value || "")}
            placeholder="Selecione a jornada"
            disabled={isSubmitting}
            error={errors.jornada}
            required
          />

          <SelectCustom
            label="Regime de contratação"
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
          />
        </div>
      </section>
    </fieldset>
  );
}
