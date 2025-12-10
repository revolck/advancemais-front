"use client";

import React from "react";
import { InputCustom } from "@/components/ui/custom/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Star, AlertCircle } from "lucide-react";

type FormErrors = Record<string, string>;

interface PlanoDestaque {
  permiteDestaque: boolean;
  destaquesDisponiveis: number;
}

interface CompensationStepProps {
  formData: Record<string, any>;
  errors: FormErrors;
  isSubmitting: boolean;
  onFieldChange: (field: string, value: any) => void;
  isEmpresaRole?: boolean;
  planoDestaque?: PlanoDestaque | null;
}

export function CompensationStep({
  formData,
  errors,
  isSubmitting,
  onFieldChange,
  isEmpresaRole = false,
  planoDestaque = null,
}: CompensationStepProps) {
  // Para EMPRESA: só mostra destaque se plano permite e tem disponível
  // Para ADMIN/MODERADOR: sempre mostra
  const podeDestacar = isEmpresaRole
    ? planoDestaque?.permiteDestaque &&
      (planoDestaque?.destaquesDisponiveis ?? 0) > 0
    : true;

  const mensagemDestaque =
    isEmpresaRole && planoDestaque
      ? planoDestaque.permiteDestaque
        ? planoDestaque.destaquesDisponiveis > 0
          ? `Você tem ${planoDestaque.destaquesDisponiveis} destaque(s) disponível(is)`
          : "Você já utilizou todos os destaques do seu plano"
        : "Seu plano não inclui vagas em destaque"
      : "Destaca a vaga nas listagens públicas";

  return (
    <fieldset disabled={isSubmitting} className="space-y-8">
      <section className="space-y-5">
        <header className="mb-10">
          <h4 className="mb-0!">Remuneração e destaque</h4>
          <p className="text-sm!">
            Configure a faixa salarial visível na vaga e controle os destaques.
          </p>
        </header>

        {/* Switches primeiro */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Salário confidencial */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <Label
                htmlFor="salarioConfidencial"
                className="text-sm! font-medium! cursor-pointer"
              >
                Salário confidencial
              </Label>
              <span className="text-xs! text-muted-foreground!">
                Mantém a faixa salarial oculta para os candidatos
              </span>
            </div>
            <Switch
              id="salarioConfidencial"
              checked={formData.salarioConfidencial}
              onCheckedChange={(checked) => {
                onFieldChange("salarioConfidencial", checked);
                // Se marcar como confidencial, limpa os campos de salário
                if (checked) {
                  onFieldChange("salarioMin", "");
                  onFieldChange("salarioMax", "");
                }
              }}
              disabled={isSubmitting}
            />
          </div>

          {/* Vaga em destaque - só mostra se pode */}
          {podeDestacar ? (
            <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <Label
                  htmlFor="vagaEmDestaque"
                  className="text-sm! font-medium! cursor-pointer"
                >
                  Vaga em destaque
                </Label>
                <span className="text-xs! text-muted-foreground!">
                  {mensagemDestaque}
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
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
                <Star className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <Label className="text-sm! font-medium! text-gray-500!">
                  Vaga em destaque
                </Label>
                <span className="text-xs! text-gray-400!">
                  {mensagemDestaque}
                </span>
              </div>
              <Switch id="vagaEmDestaque" checked={false} disabled={true} />
            </div>
          )}
        </div>

        {/* Campos de salário - só mostra se NÃO for confidencial */}
        {!formData.salarioConfidencial && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InputCustom
                label="Salário mínimo"
                name="salarioMin"
                type="number"
                value={formData.salarioMin}
                onChange={(event) =>
                  onFieldChange("salarioMin", event.target.value)
                }
                placeholder="Ex: 4500.00"
                error={errors.salarioMin}
                required
              />

              <InputCustom
                label="Salário máximo"
                name="salarioMax"
                type="number"
                value={formData.salarioMax}
                onChange={(event) =>
                  onFieldChange("salarioMax", event.target.value)
                }
                placeholder="Ex: 6500.00"
                error={errors.salarioMax}
              />
            </div>
          </div>
        )}
      </section>
    </fieldset>
  );
}
