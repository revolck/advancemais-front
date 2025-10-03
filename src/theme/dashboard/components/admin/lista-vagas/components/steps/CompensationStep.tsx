"use client";

import React from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type FormErrors = Record<string, string>;

interface CompensationStepProps {
  formData: Record<string, any>;
  errors: FormErrors;
  isSubmitting: boolean;
  onFieldChange: (field: string, value: any) => void;
}

export function CompensationStep({
  formData,
  errors,
  isSubmitting,
  onFieldChange,
}: CompensationStepProps) {
  return (
    <fieldset disabled={isSubmitting} className="space-y-8">
      <section className="space-y-5">
        <header className="mb-10">
          <h3 className="!mb-0">Remuneração e destaque</h3>
          <p className="!text-sm">
            Configure a faixa salarial visível na vaga e controle os destaques.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <InputCustom
            label="Salário mínimo"
            name="salarioMin"
            value={formData.salarioMin}
            onChange={(event) =>
              onFieldChange("salarioMin", event.target.value)
            }
            placeholder="Ex: 4500.00"
            error={errors.salarioMin}
          />

          <InputCustom
            label="Salário máximo"
            name="salarioMax"
            value={formData.salarioMax}
            onChange={(event) =>
              onFieldChange("salarioMax", event.target.value)
            }
            placeholder="Ex: 6500.00"
            error={errors.salarioMax}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-6 rounded-xl border border-border/60 bg-muted/5 p-4">
            <div className="flex flex-1 flex-col gap-1">
              <Label
                htmlFor="salarioConfidencial"
                className="text-sm font-medium"
              >
                Salário confidencial
              </Label>
              <span className="text-xs text-muted-foreground">
                Mantém a faixa salarial oculta para os candidatos.
              </span>
            </div>
            <Switch
              id="salarioConfidencial"
              checked={formData.salarioConfidencial}
              onCheckedChange={(checked) =>
                onFieldChange("salarioConfidencial", checked)
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-6 rounded-xl border border-border/60 bg-muted/5 p-4">
            <div className="flex flex-1 flex-col gap-1">
              <Label htmlFor="vagaEmDestaque" className="text-sm font-medium">
                Vaga em destaque
              </Label>
              <span className="text-xs text-muted-foreground">
                Destaca a vaga nas listagens públicas, utilizando o saldo de
                destaques do plano.
              </span>
            </div>
            <Switch
              id="vagaEmDestaque"
              checked={formData.vagaEmDestaque}
              onCheckedChange={(checked) =>
                onFieldChange("vagaEmDestaque", checked)
              }
              disabled={isSubmitting}
            />
          </div>
        </div>
      </section>
    </fieldset>
  );
}
