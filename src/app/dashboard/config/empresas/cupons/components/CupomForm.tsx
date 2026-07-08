"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { listPlanosEmpresariais } from "@/api/empresas/planos-empresariais";
import { listCursos } from "@/api/cursos";
import type { CupomDesconto, CupomFormData } from "@/api/cupons/types";
import {
  COURSE_COUPON_APPLICATION_OPTIONS,
  CUPOM_ORIENTATION_OPTIONS,
  LIMITE_POR_USUARIO_OPCOES,
  LIMITE_USO_TOTAL_OPCOES,
  PERIODO_TIPO_OPCOES,
  SUBSCRIPTION_COUPON_APPLICATION_OPTIONS,
  TIPOS_DESCONTO,
} from "@/api/cupons/types";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import { MultiSelectFilter } from "@/components/ui/custom/filters";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import { Label } from "@/components/ui/label";

const cupomSchema = z
  .object({
    codigo: z
      .string()
      .min(1, "Código é obrigatório")
      .max(50, "Código deve ter no máximo 50 caracteres"),
    orientacao: z.enum(["COURSES", "SUBSCRIPTIONS"]),
    tipoDesconto: z.enum(["PORCENTAGEM", "VALOR_FIXO"]),
    valorPercentual: z.number().min(0).max(100).optional(),
    valorFixo: z.number().min(0).optional(),
    aplicacaoCupom: z.enum([
      "TODOS_CURSOS",
      "CURSO_ESPECIFICO",
      "TODAS_ASSINATURAS",
      "ASSINATURA_ESPECIFICA",
    ]),
    assinaturasSelecionadas: z.array(z.string()).default([]),
    cursosIds: z.array(z.number()).default([]),
    planosIds: z.array(z.string()).default([]),
    limiteUsoTotalTipo: z.enum(["ILIMITADO", "LIMITADO"]),
    limiteUsoTotalQuantidade: z.number().min(1).optional(),
    limitePorUsuarioTipo: z.enum(["ILIMITADO", "PRIMEIRA_COMPRA", "LIMITADO"]),
    limitePorUsuarioQuantidade: z.number().min(1).optional(),
    periodoTipo: z.enum(["ILIMITADO", "PERIODO"]),
    periodoInicio: z.string().optional(),
    periodoFim: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.tipoDesconto === "PORCENTAGEM" &&
      (!data.valorPercentual || data.valorPercentual <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valorPercentual"],
        message: "Valor percentual é obrigatório",
      });
    }

    if (
      data.tipoDesconto === "VALOR_FIXO" &&
      (!data.valorFixo || data.valorFixo <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valorFixo"],
        message: "Valor fixo é obrigatório",
      });
    }

    if (
      data.aplicacaoCupom === "CURSO_ESPECIFICO" &&
      data.cursosIds.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cursosIds"],
        message: "Selecione ao menos um curso",
      });
    }

    if (
      data.aplicacaoCupom === "ASSINATURA_ESPECIFICA" &&
      data.planosIds.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["planosIds"],
        message: "Selecione ao menos uma assinatura",
      });
    }

    if (
      data.limiteUsoTotalTipo === "LIMITADO" &&
      (!data.limiteUsoTotalQuantidade || data.limiteUsoTotalQuantidade <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["limiteUsoTotalQuantidade"],
        message: "Quantidade de usos totais é obrigatória quando limitado",
      });
    }

    if (
      data.limitePorUsuarioTipo === "LIMITADO" &&
      (!data.limitePorUsuarioQuantidade ||
        data.limitePorUsuarioQuantidade <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["limitePorUsuarioQuantidade"],
        message: "Quantidade por usuário é obrigatória quando limitado",
      });
    }

    if (data.periodoTipo === "PERIODO") {
      if (!data.periodoInicio || !data.periodoFim) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["periodoInicio"],
          message: "Período de validade é obrigatório",
        });
      } else if (new Date(data.periodoInicio) >= new Date(data.periodoFim)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["periodoFim"],
          message: "A data final deve ser posterior à data inicial",
        });
      }
    }
  });

interface CupomFormProps {
  cupom?: CupomDesconto;
  onSubmit: (data: CupomFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type SelectOption = { value: string; label: string };

function inferOrientation(cupom?: CupomDesconto): CupomFormData["orientacao"] {
  if (!cupom) return "SUBSCRIPTIONS";
  return cupom.aplicarEm === "APENAS_CURSOS" ? "COURSES" : "SUBSCRIPTIONS";
}

function inferApplication(cupom?: CupomDesconto): CupomFormData["aplicacaoCupom"] {
  if (!cupom) return "TODAS_ASSINATURAS";

  if (cupom.aplicarEm === "APENAS_CURSOS") {
    return cupom.aplicarEmTodosItens ? "TODOS_CURSOS" : "CURSO_ESPECIFICO";
  }

  return cupom.aplicarEmTodosItens || cupom.aplicarEm === "TODA_PLATAFORMA"
    ? "TODAS_ASSINATURAS"
    : "ASSINATURA_ESPECIFICA";
}

function parseDateRange(cupom?: CupomDesconto): DateRange {
  if (!cupom?.periodoInicio || !cupom?.periodoFim) {
    return { from: null, to: null };
  }

  return {
    from: new Date(cupom.periodoInicio),
    to: new Date(cupom.periodoFim),
  };
}

export function CupomForm({
  cupom,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CupomFormProps) {
  const [periodoRange, setPeriodoRange] = useState<DateRange>(
    parseDateRange(cupom),
  );
  const [valorFixoFormatado, setValorFixoFormatado] = useState<string>("0,00");
  const [cursosOptions, setCursosOptions] = useState<SelectOption[]>([]);
  const [planosOptions, setPlanosOptions] = useState<SelectOption[]>([]);
  const [cursosSelecionados, setCursosSelecionados] = useState<string[]>(
    (cupom?.cursosAplicados ?? []).map((item) => String(item.cursoId)),
  );
  const [planosSelecionados, setPlanosSelecionados] = useState<string[]>(
    (cupom?.planosAplicados ?? []).map((item) => item.planoId),
  );

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CupomFormData>({
    resolver: zodResolver(cupomSchema) as any,
    defaultValues: {
      codigo: cupom?.codigo || "",
      orientacao: inferOrientation(cupom),
      tipoDesconto: cupom?.tipoDesconto || "PORCENTAGEM",
      valorPercentual: cupom?.valorPercentual || undefined,
      valorFixo: cupom?.valorFixo || 0,
      aplicacaoCupom: inferApplication(cupom),
      assinaturasSelecionadas: (cupom?.planosAplicados ?? []).map(
        (item) => item.planoId,
      ),
      cursosIds: (cupom?.cursosAplicados ?? []).map((item) =>
        Number(item.cursoId),
      ),
      planosIds: (cupom?.planosAplicados ?? []).map((item) => item.planoId),
      limiteUsoTotalTipo: cupom?.limiteUsoTotalTipo || "ILIMITADO",
      limiteUsoTotalQuantidade: cupom?.limiteUsoTotalQuantidade || undefined,
      limitePorUsuarioTipo: cupom?.limitePorUsuarioTipo || "ILIMITADO",
      limitePorUsuarioQuantidade:
        cupom?.limitePorUsuarioQuantidade || undefined,
      periodoTipo: cupom?.periodoTipo || "ILIMITADO",
      periodoInicio: cupom?.periodoInicio || undefined,
      periodoFim: cupom?.periodoFim || undefined,
    },
  });

  const watchedOrientacao = watch("orientacao");
  const watchedTipoDesconto = watch("tipoDesconto");
  const watchedAplicacaoCupom = watch("aplicacaoCupom");
  const watchedLimiteUsoTotalTipo = watch("limiteUsoTotalTipo");
  const watchedLimitePorUsuarioTipo = watch("limitePorUsuarioTipo");
  const watchedPeriodoTipo = watch("periodoTipo");
  const isDisabled = isSubmitting;

  const aplicacaoOptions = useMemo(
    () =>
      watchedOrientacao === "COURSES"
        ? [...COURSE_COUPON_APPLICATION_OPTIONS]
        : [...SUBSCRIPTION_COUPON_APPLICATION_OPTIONS],
    [watchedOrientacao],
  );

  useEffect(() => {
    if (cupom?.valorFixo) {
      setValorFixoFormatado(
        cupom.valorFixo.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
      return;
    }

    setValorFixoFormatado("0,00");
  }, [cupom]);

  useEffect(() => {
    const loadTargets = async () => {
      try {
        const [planosResponse, cursosResponse] = await Promise.all([
          listPlanosEmpresariais(),
          listCursos({ page: 1, pageSize: 200, statusPadrao: "PUBLICADO" }),
        ]);

        if (Array.isArray(planosResponse)) {
          setPlanosOptions(
            planosResponse.map((plano: any) => ({
              value: plano.id,
              label: plano.nome,
            })),
          );
        }

        setCursosOptions(
          (cursosResponse.data ?? []).map((curso) => ({
            value: String(curso.id),
            label: curso.nome,
          })),
        );
      } catch (error) {
        console.error("Erro ao carregar opções de cupons:", error);
      }
    };

    void loadTargets();
  }, []);

  useEffect(() => {
    setValue(
      "periodoInicio",
      periodoRange.from ? periodoRange.from.toISOString() : undefined,
    );
    setValue(
      "periodoFim",
      periodoRange.to ? periodoRange.to.toISOString() : undefined,
    );
  }, [periodoRange, setValue]);

  useEffect(() => {
    setValue("assinaturasSelecionadas", planosSelecionados);
    setValue("planosIds", planosSelecionados);
  }, [planosSelecionados, setValue]);

  useEffect(() => {
    setValue(
      "cursosIds",
      cursosSelecionados
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item)),
    );
  }, [cursosSelecionados, setValue]);

  useEffect(() => {
    if (
      watchedOrientacao === "COURSES" &&
      (watchedAplicacaoCupom === "TODAS_ASSINATURAS" ||
        watchedAplicacaoCupom === "ASSINATURA_ESPECIFICA")
    ) {
      setValue("aplicacaoCupom", "TODOS_CURSOS");
      return;
    }

    if (
      watchedOrientacao === "SUBSCRIPTIONS" &&
      (watchedAplicacaoCupom === "TODOS_CURSOS" ||
        watchedAplicacaoCupom === "CURSO_ESPECIFICO")
    ) {
      setValue("aplicacaoCupom", "TODAS_ASSINATURAS");
    }
  }, [watchedAplicacaoCupom, watchedOrientacao, setValue]);

  const onFormSubmit = async (data: CupomFormData) => {
    await onSubmit({
      ...data,
      cursosIds: cursosSelecionados
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item)),
      planosIds: planosSelecionados,
      assinaturasSelecionadas: planosSelecionados,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-1">
      <fieldset disabled={isDisabled} className="space-y-6">
        <InputCustom
          label="Código do Cupom"
          name="codigo"
          value={watch("codigo")}
          onChange={(e) => setValue("codigo", e.target.value.toUpperCase())}
          placeholder="Ex: ADVANCE50"
          error={errors.codigo?.message}
          required
          size="md"
          disabled={isDisabled}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectCustom
            label="Orientação"
            mode="single"
            options={[...CUPOM_ORIENTATION_OPTIONS]}
            value={watchedOrientacao}
            onChange={(value) =>
              setValue(
                "orientacao",
                (value ?? "SUBSCRIPTIONS") as CupomFormData["orientacao"],
              )
            }
            placeholder="Selecione a orientação"
            required
            size="md"
            disabled={isDisabled}
          />

          <SelectCustom
            label="Aplicação do Cupom"
            mode="single"
            options={aplicacaoOptions}
            value={watchedAplicacaoCupom}
            onChange={(value) =>
              setValue(
                "aplicacaoCupom",
                (value ?? aplicacaoOptions[0].value) as CupomFormData["aplicacaoCupom"],
              )
            }
            placeholder="Selecione a aplicação"
            required
            size="md"
            disabled={isDisabled}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectCustom
            label="Tipo de Desconto"
            mode="single"
            options={[...TIPOS_DESCONTO]}
            value={watchedTipoDesconto}
            onChange={(value) =>
              setValue(
                "tipoDesconto",
                (value ?? "PORCENTAGEM") as CupomFormData["tipoDesconto"],
              )
            }
            placeholder="Selecione o tipo"
            required
            size="md"
            disabled={isDisabled}
          />

          {watchedTipoDesconto === "PORCENTAGEM" ? (
            <InputCustom
              label="Valor Percentual (%)"
              name="valorPercentual"
              type="number"
              min="0"
              max="100"
              value={watch("valorPercentual")?.toString() || ""}
              onChange={(e) => {
                const nextValue = Math.min(
                  100,
                  Math.max(0, Number(e.target.value || 0)),
                );
                setValue("valorPercentual", nextValue);
              }}
              placeholder="Ex: 25"
              error={errors.valorPercentual?.message}
              required
              size="md"
              disabled={isDisabled}
            />
          ) : (
            <InputCustom
              label="Valor Fixo (R$)"
              name="valorFixo"
              value={valorFixoFormatado}
              onChange={(e) => {
                const numbers = e.target.value.replace(/\D/g, "");
                const numericValue = numbers === "" ? 0 : parseInt(numbers) / 100;
                const nextValue = Math.min(999.99, numericValue);
                setValorFixoFormatado(
                  nextValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                );
                setValue("valorFixo", nextValue);
              }}
              placeholder="0,00"
              error={errors.valorFixo?.message}
              required
              size="md"
              disabled={isDisabled}
            />
          )}
        </div>

        {watchedAplicacaoCupom === "CURSO_ESPECIFICO" ? (
          <div className="space-y-2">
            <Label>Cursos</Label>
            <MultiSelectFilter
              title="Cursos"
              placeholder="Selecione os cursos"
              options={cursosOptions}
              selectedValues={cursosSelecionados}
              onSelectionChange={setCursosSelecionados}
              className="w-full"
              disabled={isDisabled}
            />
            {errors.cursosIds?.message ? (
              <p className="!text-xs text-red-500">{errors.cursosIds.message}</p>
            ) : null}
          </div>
        ) : null}

        {watchedAplicacaoCupom === "ASSINATURA_ESPECIFICA" ? (
          <div className="space-y-2">
            <Label>Assinaturas</Label>
            <MultiSelectFilter
              title="Assinaturas"
              placeholder="Selecione as assinaturas"
              options={planosOptions}
              selectedValues={planosSelecionados}
              onSelectionChange={setPlanosSelecionados}
              className="w-full"
              disabled={isDisabled}
            />
            {errors.planosIds?.message ? (
              <p className="!text-xs text-red-500">{errors.planosIds.message}</p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectCustom
            label="Tipo de Período"
            mode="single"
            options={[...PERIODO_TIPO_OPCOES]}
            value={watchedPeriodoTipo}
            onChange={(value) =>
              setValue("periodoTipo", (value ?? "ILIMITADO") as any)
            }
            placeholder="Selecione o tipo"
            size="md"
            disabled={isDisabled}
          />

          <SelectCustom
            label="Limite por Usuário"
            mode="single"
            options={[...LIMITE_POR_USUARIO_OPCOES]}
            value={watchedLimitePorUsuarioTipo}
            onChange={(value) =>
              setValue("limitePorUsuarioTipo", (value ?? "ILIMITADO") as any)
            }
            placeholder="Selecione o limite"
            size="md"
            disabled={isDisabled}
          />
        </div>

        {watchedPeriodoTipo === "PERIODO" ? (
          <DatePickerRangeCustom
            label="Período de Validade"
            value={periodoRange}
            onChange={setPeriodoRange}
            required
            size="md"
            disabled={isDisabled}
            error={
              errors.periodoInicio?.message || errors.periodoFim?.message
            }
          />
        ) : null}

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.45fr)]">
            <SelectCustom
              label="Limite Total de Usos"
              mode="single"
              options={[...LIMITE_USO_TOTAL_OPCOES]}
              value={watchedLimiteUsoTotalTipo}
              onChange={(value) =>
                setValue("limiteUsoTotalTipo", (value ?? "ILIMITADO") as any)
              }
              placeholder="Selecione o limite"
              size="md"
              disabled={isDisabled}
            />

            {watchedLimiteUsoTotalTipo === "LIMITADO" ? (
              <InputCustom
                label="Quantidade Total de Usos"
                name="limiteUsoTotalQuantidade"
                type="number"
                min="1"
                max="9999"
                value={watch("limiteUsoTotalQuantidade")?.toString() || ""}
                onChange={(e) =>
                  setValue(
                    "limiteUsoTotalQuantidade",
                    Math.min(9999, Math.max(1, Number(e.target.value || 1))),
                  )
                }
                placeholder="Ex: 100"
                error={errors.limiteUsoTotalQuantidade?.message}
                required
                size="md"
                disabled={isDisabled}
              />
            ) : null}
          </div>

          <div className="space-y-2 md:max-w-[50%]">
            {watchedLimitePorUsuarioTipo === "LIMITADO" ? (
              <InputCustom
                label="Quantidade por Usuário"
                name="limitePorUsuarioQuantidade"
                type="number"
                min="1"
                max="9999"
                value={watch("limitePorUsuarioQuantidade")?.toString() || ""}
                onChange={(e) =>
                  setValue(
                    "limitePorUsuarioQuantidade",
                    Math.min(9999, Math.max(1, Number(e.target.value || 1))),
                  )
                }
                placeholder="Ex: 1"
                error={errors.limitePorUsuarioQuantidade?.message}
                required
                size="md"
                disabled={isDisabled}
              />
            ) : null}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <ButtonCustom
            type="button"
            variant="outline"
            onClick={onCancel}
            size="md"
            disabled={isDisabled}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="submit"
            variant="default"
            disabled={isDisabled}
            isLoading={isSubmitting}
            loadingText="Salvando..."
            size="md"
          >
            {cupom ? "Atualizar Cupom" : "Criar Cupom"}
          </ButtonCustom>
        </div>
      </fieldset>
    </form>
  );
}
