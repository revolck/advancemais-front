"use client";

import React from "react";
import { SimpleTextarea } from "@/components/ui/custom/text-area";

type FormErrors = Record<string, string>;

interface ContentStepProps {
  formData: Record<string, any>;
  errors: FormErrors;
  isSubmitting: boolean;
  onFieldChange: (field: string, value: any) => void;
}

export function ContentStep({
  formData,
  errors,
  isSubmitting,
  onFieldChange,
}: ContentStepProps) {
  return (
    <fieldset disabled={isSubmitting} className="space-y-10">
      <section className="space-y-5">
        <header className="mb-10">
          <h3 className="!mb-0">Conteúdo da vaga</h3>
          <p className="!text-sm">
            Estruture a descrição, as atividades e os benefícios.
          </p>
        </header>

        <SimpleTextarea
          label="Descrição completa"
          value={formData.descricao}
          onChange={(event) => onFieldChange("descricao", event.target.value)}
          placeholder="Detalhe responsabilidades, desafios e diferenciais da vaga."
          className="min-h-[180px]"
          maxLength={4000}
          showCharCount
          error={errors.descricao}
          required
        />

        <SimpleTextarea
          label="Observações gerais"
          value={formData.observacoes}
          onChange={(event) => onFieldChange("observacoes", event.target.value)}
          placeholder="Detalhes adicionais relevantes ou instruções para o candidato."
          className="min-h-[120px]"
          maxLength={1000}
          showCharCount
          error={errors.observacoes}
        />

        <div className="space-y-5">
          <div className="rounded-2xl border border-border/60 bg-background p-5 space-y-4">
            <header className="space-y-1">
              <h4 className="!mb-0">Atividades</h4>
              <p className="!text-xs">
                Liste uma atividade por linha para facilitar a leitura.
              </p>
            </header>
            <SimpleTextarea
              label="Principais"
              value={formData.atividadesPrincipais}
              onChange={(event) =>
                onFieldChange("atividadesPrincipais", event.target.value)
              }
              placeholder="Ex: Conduzir análises de performance de campanhas."
              className="min-h-[140px]"
              maxLength={2000}
              showCharCount
              error={errors.atividadesPrincipais}
            />
            <SimpleTextarea
              label="Extras"
              value={formData.atividadesExtras}
              onChange={(event) =>
                onFieldChange("atividadesExtras", event.target.value)
              }
              placeholder="Ex: Apoiar projetos especiais ou iniciativas pontuais."
              className="min-h-[120px]"
              maxLength={2000}
              showCharCount
              error={errors.atividadesExtras}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-background p-5 space-y-4">
            <header className="space-y-1">
              <h4 className="!mb-0">Requisitos</h4>
              <p className="!text-xs">
                Informe o que é indispensável e o que conta como diferencial.
              </p>
            </header>
            <SimpleTextarea
              label="Obrigatórios"
              value={formData.requisitosObrigatorios}
              onChange={(event) =>
                onFieldChange("requisitosObrigatorios", event.target.value)
              }
              placeholder="Liste competências ou experiências necessárias."
              className="min-h-[140px]"
              maxLength={2000}
              showCharCount
              error={errors.requisitosObrigatorios}
            />
            <SimpleTextarea
              label="Desejáveis"
              value={formData.requisitosDesejaveis}
              onChange={(event) =>
                onFieldChange("requisitosDesejaveis", event.target.value)
              }
              placeholder="Liste conhecimentos ou experiências que agregam."
              className="min-h-[120px]"
              maxLength={2000}
              showCharCount
              error={errors.requisitosDesejaveis}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background p-5 space-y-4">
          <header className="space-y-1">
            <h4 className="!mb-0">Benefícios</h4>
            <p className="!text-xs">
              Faça uma lista clara dos benefícios e destaque observações úteis.
            </p>
          </header>
          <div className="space-y-4">
            <SimpleTextarea
              label="Benefícios oferecidos"
              value={formData.beneficiosLista}
              onChange={(event) =>
                onFieldChange("beneficiosLista", event.target.value)
              }
              placeholder="Vale-refeição, plano de saúde, day off..."
              className="min-h-[140px]"
              maxLength={2000}
              showCharCount
              error={errors.beneficiosLista}
            />
            <SimpleTextarea
              label="Observações"
              value={formData.beneficiosObservacoes}
              onChange={(event) =>
                onFieldChange("beneficiosObservacoes", event.target.value)
              }
              placeholder="Ex: Plano de saúde 100% custeado, política de home office."
              className="min-h-[140px]"
              maxLength={1000}
              showCharCount
              error={errors.beneficiosObservacoes}
            />
          </div>
        </div>
      </section>
    </fieldset>
  );
}
