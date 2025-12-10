"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import { lookupCep, normalizeCep } from "@/lib/cep";
import { Loader2 } from "lucide-react";

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
  maxCandidaturasPorUsuario: string;
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

interface SelectOption {
  value: string;
  label: string;
}

interface LocationStepProps {
  formData: FormState;
  errors: FormErrors;
  isSubmitting: boolean;
  onLocalizacaoChange: (
    field: keyof FormState["localizacao"],
    value: string
  ) => void;
  onLocalizacaoBatchChange?: (
    updates: Partial<FormState["localizacao"]>
  ) => void;
}

export function LocationStep({
  formData,
  errors,
  isSubmitting,
  onLocalizacaoChange,
  onLocalizacaoBatchChange,
}: LocationStepProps) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [estadoOptions, setEstadoOptions] = useState<SelectOption[]>([]);
  const [cidadeOptions, setCidadeOptions] = useState<SelectOption[]>([]);
  const [isLoadingEstados, setIsLoadingEstados] = useState(false);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [citiesCache, setCitiesCache] = useState<
    Record<string, SelectOption[]>
  >({});

  // Carrega estados do IBGE na montagem
  useEffect(() => {
    const fetchEstados = async () => {
      setIsLoadingEstados(true);
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        if (!response.ok) throw new Error("Erro ao carregar estados");
        const data: Array<{ sigla: string; nome: string }> =
          await response.json();
        const options = data.map((estado) => ({
          value: estado.sigla,
          label: estado.nome,
        }));
        setEstadoOptions(options);
      } catch (error) {
        console.error("Erro ao carregar estados do IBGE:", error);
      } finally {
        setIsLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

  // Busca cidades quando o estado muda
  const fetchCidadesByUf = useCallback(
    async (uf: string, cityToSelect?: string | null) => {
      if (!uf) {
        setCidadeOptions([]);
        return;
      }

      // Verifica cache
      const cached = citiesCache[uf];
      if (cached) {
        setCidadeOptions(cached);
        if (cityToSelect) {
          const found = cached.find(
            (c) => c.label.toLowerCase() === cityToSelect.toLowerCase()
          );
          if (found) {
            onLocalizacaoChange("cidade", found.value);
          }
        }
        return;
      }

      setIsLoadingCidades(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
        );
        if (!response.ok) throw new Error("Erro ao carregar cidades");
        const data: Array<{ nome: string }> = await response.json();
        const options = data.map((city) => ({
          value: city.nome,
          label: city.nome,
        }));
        setCidadeOptions(options);
        setCitiesCache((prev) => ({ ...prev, [uf]: options }));

        // Se tem cidade para selecionar (vindo do CEP), seleciona
        if (cityToSelect) {
          const found = options.find(
            (c) => c.label.toLowerCase() === cityToSelect.toLowerCase()
          );
          if (found) {
            onLocalizacaoChange("cidade", found.value);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar cidades do estado:", uf, error);
        setCidadeOptions([]);
      } finally {
        setIsLoadingCidades(false);
      }
    },
    [citiesCache, onLocalizacaoChange]
  );

  // Carrega cidades quando estado muda (pelo usuário ou CEP)
  useEffect(() => {
    if (formData.localizacao.estado) {
      fetchCidadesByUf(formData.localizacao.estado);
    } else {
      setCidadeOptions([]);
    }
  }, [formData.localizacao.estado, fetchCidadesByUf]);

  // Handler de mudança do CEP com busca automática
  const handleCepChange = useCallback(
    async (value: string) => {
      const formatted = normalizeCep(value);
      onLocalizacaoChange("cep", formatted);
      setCepError(null);

      const cleanCep = value.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
        return;
      }

      setIsLoadingCep(true);
      try {
        const result = await lookupCep(cleanCep);
        if ("error" in result) {
          setCepError(result.error);
          return;
        }

        // Preenche todos os campos de uma vez
        if (onLocalizacaoBatchChange) {
          onLocalizacaoBatchChange({
            cep: result.cep,
            logradouro: result.street || "",
            bairro: result.neighborhood || "",
            estado: result.state || "",
          });

          // Busca cidades do estado e seleciona a cidade correta
          if (result.state) {
            await fetchCidadesByUf(result.state, result.city);
          }
        } else {
          // Fallback para mudanças individuais
          onLocalizacaoChange("cep", result.cep);
          onLocalizacaoChange("logradouro", result.street || "");
          onLocalizacaoChange("bairro", result.neighborhood || "");
          onLocalizacaoChange("estado", result.state || "");

          if (result.state) {
            await fetchCidadesByUf(result.state, result.city);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        setCepError("Erro ao buscar CEP. Tente novamente.");
      } finally {
        setIsLoadingCep(false);
      }
    },
    [onLocalizacaoChange, onLocalizacaoBatchChange, fetchCidadesByUf]
  );

  // Handler de mudança do estado (limpa cidade)
  const handleEstadoChange = useCallback(
    (value: string | null) => {
      const uf = value ?? "";
      onLocalizacaoChange("estado", uf);
      onLocalizacaoChange("cidade", "");
      setCidadeOptions([]);

      if (uf) {
        fetchCidadesByUf(uf);
      }
    },
    [onLocalizacaoChange, fetchCidadesByUf]
  );

  // Verifica se cidade está na lista de opções
  const cidadeValue = useMemo(() => {
    if (!formData.localizacao.cidade) return null;
    const found = cidadeOptions.find(
      (c) => c.value.toLowerCase() === formData.localizacao.cidade.toLowerCase()
    );
    return found?.value || null;
  }, [formData.localizacao.cidade, cidadeOptions]);

  // Verifica se estado está na lista de opções
  const estadoValue = useMemo(() => {
    if (!formData.localizacao.estado) return null;
    const found = estadoOptions.find(
      (e) => e.value.toLowerCase() === formData.localizacao.estado.toLowerCase()
    );
    return found?.value || null;
  }, [formData.localizacao.estado, estadoOptions]);

  return (
    <fieldset disabled={isSubmitting} className="space-y-6">
      <section className="space-y-5">
        <header className="mb-10">
          <h4 className="mb-0!">Localização da vaga</h4>
          <p className="text-sm!">
            Informe o endereço da oportunidade. Digite o CEP para preencher
            automaticamente.
          </p>
        </header>

        {/* Linha 1: CEP, Estado, Cidade */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative">
            <InputCustom
              label="CEP"
              name="cep"
              mask="cep"
              value={formData.localizacao.cep}
              onChange={(event) => handleCepChange(event.target.value)}
              maxLength={10}
              placeholder="00000-000"
              error={cepError || errors["localizacao.cep"]}
              required
            />
            {isLoadingCep && (
              <div className="absolute right-3 top-9">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>

          <SelectCustom
            label="Estado"
            placeholder={
              isLoadingEstados ? "Carregando estados..." : "Selecione o estado"
            }
            options={estadoOptions}
            value={estadoValue}
            onChange={handleEstadoChange}
            disabled={isSubmitting || isLoadingEstados}
            error={errors["localizacao.estado"]}
            required
          />

          <SelectCustom
            label="Cidade"
            placeholder={
              !formData.localizacao.estado
                ? "Selecione o estado primeiro"
                : isLoadingCidades
                ? "Carregando cidades..."
                : "Selecione a cidade"
            }
            options={cidadeOptions}
            value={cidadeValue}
            onChange={(value) => onLocalizacaoChange("cidade", value || "")}
            disabled={
              isSubmitting || !formData.localizacao.estado || isLoadingCidades
            }
            error={errors["localizacao.cidade"]}
            required
          />
        </div>

        {/* Linha 2: Logradouro, Número */}
        <div className="grid gap-4 lg:grid-cols-[3fr_1fr]">
          <InputCustom
            label="Logradouro"
            name="logradouro"
            value={formData.localizacao.logradouro}
            onChange={(event) =>
              onLocalizacaoChange("logradouro", event.target.value)
            }
            placeholder="Rua, Avenida, etc."
            error={errors["localizacao.logradouro"]}
            required
          />

          <InputCustom
            label="Número"
            name="numero"
            value={formData.localizacao.numero}
            onChange={(event) =>
              onLocalizacaoChange("numero", event.target.value)
            }
            placeholder="123"
            error={errors["localizacao.numero"]}
            required
          />
        </div>

        {/* Linha 3: Bairro, Complemento */}
        <div className="grid gap-4 lg:grid-cols-2">
          <InputCustom
            label="Bairro"
            name="bairro"
            value={formData.localizacao.bairro}
            onChange={(event) =>
              onLocalizacaoChange("bairro", event.target.value)
            }
            placeholder="Nome do bairro"
            error={errors["localizacao.bairro"]}
            required
          />

          <InputCustom
            label="Complemento"
            name="complemento"
            value={formData.localizacao.complemento}
            onChange={(event) =>
              onLocalizacaoChange("complemento", event.target.value)
            }
            placeholder="Apto, Sala, Bloco (opcional)"
          />
        </div>

        {/* Linha 4: Referência */}
        <InputCustom
          label="Referência"
          name="referencia"
          value={formData.localizacao.referencia}
          onChange={(event) =>
            onLocalizacaoChange("referencia", event.target.value)
          }
          placeholder="Próximo a, em frente de (opcional)"
        />
      </section>
    </fieldset>
  );
}
