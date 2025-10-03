"use client";

import React from "react";
import { InputCustom } from "@/components/ui/custom/input";

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

interface LocationStepProps {
  formData: FormState;
  errors: FormErrors;
  isSubmitting: boolean;
  onLocalizacaoChange: (
    field: keyof FormState["localizacao"],
    value: string
  ) => void;
}

export function LocationStep({
  formData,
  errors,
  isSubmitting,
  onLocalizacaoChange,
}: LocationStepProps) {
  return (
    <fieldset disabled={isSubmitting} className="space-y-6">
      <section className="space-y-5">
        <header className="mb-10">
          <h3 className="!mb-0">Localização da vaga</h3>
          <p className="!text-sm">Informe o endereço da oportunidade.</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <InputCustom
            label="Logradouro"
            name="logradouro"
            value={formData.localizacao.logradouro}
            onChange={(event) =>
              onLocalizacaoChange("logradouro", event.target.value)
            }
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
            error={errors["localizacao.numero"]}
            required
          />

          <InputCustom
            label="Bairro"
            name="bairro"
            value={formData.localizacao.bairro}
            onChange={(event) =>
              onLocalizacaoChange("bairro", event.target.value)
            }
            error={errors["localizacao.bairro"]}
            required
          />

          <InputCustom
            label="Cidade"
            name="cidade"
            value={formData.localizacao.cidade}
            onChange={(event) =>
              onLocalizacaoChange("cidade", event.target.value)
            }
            error={errors["localizacao.cidade"]}
            required
          />

          <InputCustom
            label="Estado"
            name="estado"
            value={formData.localizacao.estado}
            onChange={(event) =>
              onLocalizacaoChange("estado", event.target.value)
            }
            error={errors["localizacao.estado"]}
            required
          />

          <InputCustom
            label="CEP"
            name="cep"
            value={formData.localizacao.cep}
            onChange={(event) => onLocalizacaoChange("cep", event.target.value)}
            maxLength={10}
            error={errors["localizacao.cep"]}
            required
          />

          <InputCustom
            label="Complemento"
            name="complemento"
            value={formData.localizacao.complemento}
            onChange={(event) =>
              onLocalizacaoChange("complemento", event.target.value)
            }
          />

          <InputCustom
            label="Referência"
            name="referencia"
            value={formData.localizacao.referencia}
            onChange={(event) =>
              onLocalizacaoChange("referencia", event.target.value)
            }
          />
        </div>
      </section>
    </fieldset>
  );
}
