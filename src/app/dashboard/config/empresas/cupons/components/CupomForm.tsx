"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { SelectCustom } from "@/components/ui/custom/select";
import { Label } from "@/components/ui/label";
import { DateTimeCustom } from "@/components/ui/custom/date-time";
import type { DateRangeValue } from "@/components/ui/custom/date-time";
import type { CupomDesconto, CupomFormData } from "@/api/cupons/types";
import {
  TIPOS_DESCONTO,
  APLICACAO_CUPOM_OPCOES,
  LIMITE_USO_TOTAL_OPCOES,
  LIMITE_POR_USUARIO_OPCOES,
  PERIODO_TIPO_OPCOES,
} from "@/api/cupons/types";
import { listPlanosEmpresariais } from "@/api/empresas/planos-empresariais";
import { MultiSelectFilter } from "@/components/ui/custom/filters";

// Schema de validação
const cupomSchema = z
  .object({
    codigo: z
      .string()
      .min(1, "Código é obrigatório")
      .max(50, "Código deve ter no máximo 50 caracteres"),
    // descricao removido do formulário
    tipoDesconto: z.enum(["PORCENTAGEM", "VALOR_FIXO"]),
    valorPercentual: z.number().min(0).max(100).optional(),
    valorFixo: z.number().min(0).optional(),
    // aplicarEm é fixo como APENAS_CURSOS
    aplicacaoCupom: z.enum(["TODAS_ASSINATURAS", "ASSINATURA_ESPECIFICA"]),
    assinaturasSelecionadas: z.array(z.string()),
    aplicarEmTodosItens: z.boolean(),
    cursosIds: z.array(z.number()),
    planosIds: z.array(z.string()),
    limiteUsoTotalTipo: z.enum(["ILIMITADO", "LIMITADO"]),
    limiteUsoTotalQuantidade: z.number().min(1).optional(),
    limitePorUsuarioTipo: z.enum(["ILIMITADO", "PRIMEIRA_COMPRA", "LIMITADO"]),
    limitePorUsuarioQuantidade: z.number().min(1).optional(),
    periodoTipo: z.enum(["ILIMITADO", "PERIODO"]),
    periodoInicio: z.string().optional(),
    periodoFim: z.string().optional(),
    // ativo removido - sempre true por padrão
  })
  .refine(
    (data) => {
      if (
        data.tipoDesconto === "PORCENTAGEM" &&
        (!data.valorPercentual || data.valorPercentual <= 0)
      ) {
        return false;
      }
      if (
        data.tipoDesconto === "VALOR_FIXO" &&
        (!data.valorFixo || data.valorFixo <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Valor do desconto é obrigatório",
      path: ["valorPercentual", "valorFixo"],
    }
  )
  .refine(
    (data) => {
      if (
        data.tipoDesconto === "PORCENTAGEM" &&
        data.valorPercentual !== undefined
      ) {
        return data.valorPercentual >= 0 && data.valorPercentual <= 100;
      }
      return true;
    },
    {
      message: "Valor percentual deve estar entre 0 e 100",
      path: ["valorPercentual"],
    }
  )
  .refine(
    (data) => {
      if (data.tipoDesconto === "VALOR_FIXO" && data.valorFixo !== undefined) {
        return data.valorFixo >= 0 && data.valorFixo <= 999.99;
      }
      return true;
    },
    {
      message: "Valor fixo deve estar entre 0 e 999,99",
      path: ["valorFixo"],
    }
  )
  .refine(
    (data) => {
      if (
        data.limiteUsoTotalTipo === "LIMITADO" &&
        (!data.limiteUsoTotalQuantidade || data.limiteUsoTotalQuantidade <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Quantidade de usos totais é obrigatória quando limitado",
      path: ["limiteUsoTotalQuantidade"],
    }
  )
  .refine(
    (data) => {
      if (
        data.limitePorUsuarioTipo === "LIMITADO" &&
        (!data.limitePorUsuarioQuantidade ||
          data.limitePorUsuarioQuantidade <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Quantidade de usos por usuário é obrigatória quando limitado",
      path: ["limitePorUsuarioQuantidade"],
    }
  )
  .refine(
    (data) => {
      if (
        data.limiteUsoTotalTipo === "LIMITADO" &&
        data.limiteUsoTotalQuantidade &&
        (data.limiteUsoTotalQuantidade < 1 ||
          data.limiteUsoTotalQuantidade > 9999)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Quantidade de usos totais deve estar entre 1 e 9999",
      path: ["limiteUsoTotalQuantidade"],
    }
  )
  .refine(
    (data) => {
      if (
        data.limitePorUsuarioTipo === "LIMITADO" &&
        data.limitePorUsuarioQuantidade &&
        (data.limitePorUsuarioQuantidade < 1 ||
          data.limitePorUsuarioQuantidade > 9999)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Quantidade por usuário deve estar entre 1 e 9999",
      path: ["limitePorUsuarioQuantidade"],
    }
  )
  .refine(
    (data) => {
      if (data.periodoTipo === "PERIODO") {
        if (!data.periodoInicio || !data.periodoFim) {
          return false;
        }
        if (new Date(data.periodoInicio) >= new Date(data.periodoFim)) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Período de validade inválido",
      path: ["periodoInicio", "periodoFim"],
    }
  );

interface CupomFormProps {
  cupom?: CupomDesconto;
  onSubmit: (data: CupomFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CupomForm({
  cupom,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CupomFormProps) {
  const [periodoRange, setPeriodoRange] = useState<DateRangeValue>({
    from: "",
    to: "",
  });
  const [valorFixoFormatado, setValorFixoFormatado] = useState<string>("0,00");
  const [assinaturas, setAssinaturas] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [assinaturasSelecionadas, setAssinaturasSelecionadas] = useState<
    string[]
  >([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CupomFormData>({
    resolver: zodResolver(cupomSchema) as any,
    defaultValues: {
      codigo: cupom?.codigo || "",
      // descricao removido do formulário
      tipoDesconto: cupom?.tipoDesconto || "PORCENTAGEM",
      valorPercentual: cupom?.valorPercentual || undefined,
      valorFixo: cupom?.valorFixo || 0,
      // aplicarEm é fixo como "APENAS_CURSOS" - não incluído no form
      aplicacaoCupom: "TODAS_ASSINATURAS" as const,
      assinaturasSelecionadas: [],
      // planosIds removido - cupons aplicam apenas em cursos
      limiteUsoTotalTipo: cupom?.limiteUsoTotalTipo || "ILIMITADO",
      limiteUsoTotalQuantidade: cupom?.limiteUsoTotalQuantidade || undefined,
      limitePorUsuarioTipo: cupom?.limitePorUsuarioTipo || "ILIMITADO",
      limitePorUsuarioQuantidade:
        cupom?.limitePorUsuarioQuantidade || undefined,
      periodoTipo: cupom?.periodoTipo || "ILIMITADO",
      periodoInicio: cupom?.periodoInicio || undefined,
      periodoFim: cupom?.periodoFim || undefined,
      // ativo sempre true por padrão
    },
  });

  const watchedTipoDesconto = watch("tipoDesconto");
  const watchedAplicacaoCupom = watch("aplicacaoCupom");
  const watchedLimiteUsoTotalTipo = watch("limiteUsoTotalTipo");
  const watchedLimitePorUsuarioTipo = watch("limitePorUsuarioTipo");
  const watchedPeriodoTipo = watch("periodoTipo");

  // Inicializar datas quando em modo de edição
  useEffect(() => {
    if (cupom?.periodoInicio && cupom?.periodoFim) {
      setPeriodoRange({
        from: cupom.periodoInicio.split("T")[0], // Converte para yyyy-mm-dd
        to: cupom.periodoFim.split("T")[0], // Converte para yyyy-mm-dd
      });
    }
  }, [cupom]);

  // Inicializar valor formatado quando o cupom mudar
  useEffect(() => {
    if (cupom?.valorFixo) {
      const formatted = cupom.valorFixo.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setValorFixoFormatado(formatted);
    } else {
      setValorFixoFormatado("0,00");
    }
  }, [cupom]);

  // Carregar assinaturas disponíveis
  useEffect(() => {
    const loadAssinaturas = async () => {
      try {
        const response = await listPlanosEmpresariais();
        // A resposta é um array direto ou um erro
        if (Array.isArray(response)) {
          const assinaturasOptions = response.map((plano: any) => ({
            value: plano.id,
            label: plano.nome,
          }));
          setAssinaturas(assinaturasOptions);
        }
      } catch (error) {
        console.error("Erro ao carregar assinaturas:", error);
      }
    };

    loadAssinaturas();
  }, []);

  // Atualizar valores quando as datas mudarem
  useEffect(() => {
    if (periodoRange.from) {
      setValue("periodoInicio", new Date(periodoRange.from).toISOString());
    }
    if (periodoRange.to) {
      setValue("periodoFim", new Date(periodoRange.to).toISOString());
    }
  }, [periodoRange, setValue]);

  // Sincronizar assinaturas selecionadas
  useEffect(() => {
    setValue("assinaturasSelecionadas", assinaturasSelecionadas);
  }, [assinaturasSelecionadas, setValue]);

  const onFormSubmit = async (data: any) => {
    // Garantir que aplicarEm seja sempre APENAS_CURSOS, ativo sempre true e remover descrição
    const formData = {
      ...data,
      aplicarEm: "APENAS_CURSOS" as const,
      ativo: true, // Sempre ativo por padrão
      // descricao removido do formulário
    };
    await onSubmit(formData as CupomFormData);
  };

  // Funções de planos removidas - cupons aplicam apenas em cursos

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 p-1">
      {/* Linha 1: Código do Cupom (full width) */}
      <InputCustom
        label="Código do Cupom"
        name="codigo"
        value={watch("codigo")}
        onChange={(e) => setValue("codigo", e.target.value)}
        placeholder="Ex: ADVANCE50"
        error={errors.codigo?.message}
        required
        size="md"
      />

      {/* Linha 2: Tipo de Desconto + Valor (relacionados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectCustom
          label="Tipo de Desconto"
          mode="single"
          options={[...TIPOS_DESCONTO]}
          value={watchedTipoDesconto}
          onChange={(value) =>
            setValue("tipoDesconto", value as "PORCENTAGEM" | "VALOR_FIXO")
          }
          placeholder="Selecione o tipo"
          required
          size="md"
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
              const value = parseFloat(e.target.value) || 0;
              if (value >= 0 && value <= 100) {
                setValue("valorPercentual", value);
              } else if (value > 100) {
                // Se exceder 100, limita a 100
                setValue("valorPercentual", 100);
                e.target.value = "100";
              }
            }}
            onBlur={(e) => {
              const value = parseFloat(e.target.value) || 0;
              if (value > 100) {
                // Se exceder 100, limita a 100
                setValue("valorPercentual", 100);
                e.target.value = "100";
              } else if (value < 0) {
                // Se for negativo, limita a 0
                setValue("valorPercentual", 0);
                e.target.value = "0";
              }
            }}
            placeholder="Ex: 25"
            error={errors.valorPercentual?.message}
            required
            size="md"
          />
        ) : (
          <InputCustom
            label="Valor Fixo (R$)"
            name="valorFixo"
            value={valorFixoFormatado}
            onChange={(e) => {
              // Função para formatar valor monetário (mesma lógica dos planos)
              const formatCurrency = (value: string) => {
                // Remove tudo que não é dígito
                const numbers = value.replace(/\D/g, "");

                // Se vazio, retorna 0,00
                if (numbers === "") return "0,00";

                // Converte para número e divide por 100 para ter centavos
                const amount = parseInt(numbers) / 100;

                // Formata com 2 casas decimais e vírgula
                return amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              };

              // Extrai o valor numérico para validar
              const numbers = e.target.value.replace(/\D/g, "");
              const numericValue = numbers === "" ? 0 : parseInt(numbers) / 100;

              // Validação: valor fixo deve estar entre 0 e 999,99
              if (numericValue >= 0 && numericValue <= 999.99) {
                const formatted = formatCurrency(e.target.value);
                setValorFixoFormatado(formatted);
                setValue("valorFixo", numericValue);
              } else if (numericValue > 999.99) {
                // Se exceder 999,99, limita a 999,99
                setValue("valorFixo", 999.99);
                setValorFixoFormatado("999,99");
                e.target.value = "999,99";
              }
            }}
            onBlur={(e) => {
              // Garante que sempre tenha um valor válido ao sair do campo
              const formatCurrency = (value: string) => {
                const numbers = value.replace(/\D/g, "");
                if (numbers === "") return "0,00";
                const amount = parseInt(numbers) / 100;
                return amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              };

              const formatted = formatCurrency(e.target.value);
              setValorFixoFormatado(formatted);

              const numbers = e.target.value.replace(/\D/g, "");
              const numericValue = numbers === "" ? 0 : parseInt(numbers) / 100;

              // Validação: valor fixo deve estar entre 0 e 999,99
              if (numericValue >= 0 && numericValue <= 999.99) {
                setValue("valorFixo", numericValue);
              } else if (numericValue > 999.99) {
                // Se exceder 999,99, limita a 999,99
                setValue("valorFixo", 999.99);
                setValorFixoFormatado("999,99");
              }
            }}
            onKeyDown={(e) => {
              // Permite apenas números e teclas de controle
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight" &&
                e.key !== "Tab" &&
                e.key !== "Enter"
              ) {
                e.preventDefault();
              }

              // Se for um número, verifica se não excederá 999,99
              if (/[0-9]/.test(e.key)) {
                const currentValue = e.currentTarget.value.replace(/\D/g, "");
                const newValue = currentValue + e.key;
                const numericValue = parseInt(newValue) / 100;

                if (numericValue > 999.99) {
                  e.preventDefault();
                }
              }
            }}
            placeholder="0,00"
            error={errors.valorFixo?.message}
            required
            size="md"
          />
        )}
      </div>

      {/* Linha 3: Aplicação do Cupom + Tipo de Período (independentes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectCustom
          label="Aplicação do Cupom"
          mode="single"
          options={[...APLICACAO_CUPOM_OPCOES]}
          value={watchedAplicacaoCupom}
          onChange={(value) =>
            setValue(
              "aplicacaoCupom",
              value as "TODAS_ASSINATURAS" | "ASSINATURA_ESPECIFICA"
            )
          }
          placeholder="Selecione a aplicação"
          required
          size="md"
        />

        <SelectCustom
          label="Tipo de Período"
          mode="single"
          options={[...PERIODO_TIPO_OPCOES]}
          value={watchedPeriodoTipo}
          onChange={(value) => setValue("periodoTipo", value as any)}
          placeholder="Selecione o tipo"
          size="md"
        />
      </div>

      {/* Linha 4: Assinaturas (condicional - full width quando aparece) */}
      {watchedAplicacaoCupom === "ASSINATURA_ESPECIFICA" && (
        <div className="space-y-2">
          <Label>Assinaturas</Label>
          <MultiSelectFilter
            title="Assinaturas"
            placeholder="Selecione as assinaturas"
            options={assinaturas}
            selectedValues={assinaturasSelecionadas}
            onSelectionChange={setAssinaturasSelecionadas}
            className="w-full"
          />
        </div>
      )}

      {/* Linha 5: Período de Validade (condicional - full width quando aparece) */}
      {watchedPeriodoTipo === "PERIODO" && (
        <DateTimeCustom
          mode="date-range"
          label="Período de Validade"
          value={periodoRange}
          onChange={setPeriodoRange}
          required
          size="md"
        />
      )}

      {/* Linha 6: Limites de Uso (2 colunas com subcampos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coluna 1: Limite Total */}
        <div className="space-y-2">
          <SelectCustom
            label="Limite Total de Usos"
            mode="single"
            options={[...LIMITE_USO_TOTAL_OPCOES]}
            value={watchedLimiteUsoTotalTipo}
            onChange={(value) => setValue("limiteUsoTotalTipo", value as any)}
            placeholder="Selecione o limite"
            size="md"
          />

          {watchedLimiteUsoTotalTipo === "LIMITADO" && (
            <InputCustom
              label="Quantidade Total de Usos"
              name="limiteUsoTotalQuantidade"
              type="number"
              min="1"
              max="9999"
              value={watch("limiteUsoTotalQuantidade")?.toString() || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                if (value >= 1 && value <= 9999) {
                  setValue("limiteUsoTotalQuantidade", value);
                } else if (value > 9999) {
                  setValue("limiteUsoTotalQuantidade", 9999);
                  e.target.value = "9999";
                }
              }}
              onBlur={(e) => {
                const value = parseInt(e.target.value) || 0;
                if (value > 9999) {
                  setValue("limiteUsoTotalQuantidade", 9999);
                  e.target.value = "9999";
                } else if (value < 1) {
                  setValue("limiteUsoTotalQuantidade", 1);
                  e.target.value = "1";
                }
              }}
              onKeyDown={(e) => {
                // Se for um número, verifica se não excederá 9999
                if (/[0-9]/.test(e.key)) {
                  const currentValue = e.currentTarget.value;
                  const newValue = currentValue + e.key;
                  const numericValue = parseInt(newValue);

                  if (numericValue > 9999) {
                    e.preventDefault();
                  }
                }
              }}
              placeholder="Ex: 100"
              error={errors.limiteUsoTotalQuantidade?.message}
              required
              size="md"
            />
          )}
        </div>

        {/* Coluna 2: Limite por Usuário */}
        <div className="space-y-2">
          <SelectCustom
            label="Limite por Usuário"
            mode="single"
            options={[...LIMITE_POR_USUARIO_OPCOES]}
            value={watchedLimitePorUsuarioTipo}
            onChange={(value) => setValue("limitePorUsuarioTipo", value as any)}
            placeholder="Selecione o limite"
            size="md"
          />

          {watchedLimitePorUsuarioTipo === "LIMITADO" && (
            <InputCustom
              label="Quantidade por Usuário"
              name="limitePorUsuarioQuantidade"
              type="number"
              min="1"
              max="9999"
              value={watch("limitePorUsuarioQuantidade")?.toString() || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                if (value >= 1 && value <= 9999) {
                  setValue("limitePorUsuarioQuantidade", value);
                } else if (value > 9999) {
                  setValue("limitePorUsuarioQuantidade", 9999);
                  e.target.value = "9999";
                }
              }}
              onBlur={(e) => {
                const value = parseInt(e.target.value) || 0;
                if (value > 9999) {
                  setValue("limitePorUsuarioQuantidade", 9999);
                  e.target.value = "9999";
                } else if (value < 1) {
                  setValue("limitePorUsuarioQuantidade", 1);
                  e.target.value = "1";
                }
              }}
              onKeyDown={(e) => {
                // Se for um número, verifica se não excederá 9999
                if (/[0-9]/.test(e.key)) {
                  const currentValue = e.currentTarget.value;
                  const newValue = currentValue + e.key;
                  const numericValue = parseInt(newValue);

                  if (numericValue > 9999) {
                    e.preventDefault();
                  }
                }
              }}
              placeholder="Ex: 1"
              error={errors.limitePorUsuarioQuantidade?.message}
              required
              size="md"
            />
          )}
        </div>
      </div>

      {/* Linha 7: Botões de Ação (full width) */}
      <div className="flex justify-end space-x-3 pt-4">
        <ButtonCustom
          type="button"
          variant="outline"
          onClick={onCancel}
          size="md"
        >
          Cancelar
        </ButtonCustom>
        <ButtonCustom
          type="submit"
          variant="default"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText="Salvando..."
          size="md"
        >
          {cupom ? "Atualizar Cupom" : "Criar Cupom"}
        </ButtonCustom>
      </div>
    </form>
  );
}
