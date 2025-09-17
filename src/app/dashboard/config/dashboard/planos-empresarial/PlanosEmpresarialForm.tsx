"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  InputCustom,
  SimpleTextarea,
  ButtonCustom,
  IconSelector,
  toastCustom,
} from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { SelectCustom } from "@/components/ui/custom/select";
import type { SelectOption } from "@/components/ui/custom/select/types";
import {
  createPlanoEmpresarial,
  updatePlanoEmpresarial,
  deletePlanoEmpresarial,
  type PlanoEmpresarialBackendResponse,
} from "@/api/empresas";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PlanosEmpresarialFormProps {
  plan?: PlanoEmpresarialBackendResponse | null;
  onSuccess: (plan: PlanoEmpresarialBackendResponse) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  maxPlansReached?: boolean;
}

type HighlightChoice = "yes" | "no";

interface PlanoEmpresarialFormState {
  icon: string;
  nome: string;
  descricao: string;
  valor: string;
  desconto: string;
  quantidadeVagas: string;
  vagaEmDestaque: HighlightChoice;
  quantidadeVagasDestaque: string;
}

const HIGHLIGHT_OPTIONS: SelectOption[] = [
  {
    value: "yes",
    label: "Sim, eu quero ativar as vagas em destaque",
  },
  {
    value: "no",
    label: "Não, eu não desejo ativar",
  },
];

const createEmptyFormState = (): PlanoEmpresarialFormState => ({
  icon: "",
  nome: "",
  descricao: "",
  valor: "",
  desconto: "",
  quantidadeVagas: "",
  vagaEmDestaque: "no",
  quantidadeVagasDestaque: "",
});

const formatCurrencyValue = (value: string) => {
  const normalized = value.replace(/,/g, ".").trim();
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed.toFixed(2);
};

const parseNumber = (value: string) => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const parsePercentage = (value: string) => {
  if (!value) return 0;
  const normalized = value.replace(/,/g, ".").trim();
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const mapPlanToFormState = (
  plan?: PlanoEmpresarialBackendResponse | null,
): PlanoEmpresarialFormState => {
  if (!plan) return createEmptyFormState();

  return {
    icon: plan.icon ?? "",
    nome: plan.nome ?? "",
    descricao: plan.descricao ?? "",
    valor: plan.valor ?? "",
    desconto:
      plan.desconto === null || plan.desconto === undefined
        ? ""
        : String(plan.desconto),
    quantidadeVagas:
      plan.quantidadeVagas === null || plan.quantidadeVagas === undefined
        ? ""
        : String(plan.quantidadeVagas),
    vagaEmDestaque: plan.vagaEmDestaque ? "yes" : "no",
    quantidadeVagasDestaque:
      plan.vagaEmDestaque &&
      plan.quantidadeVagasDestaque !== null &&
      plan.quantidadeVagasDestaque !== undefined
        ? String(plan.quantidadeVagasDestaque)
        : "",
  };
};

export default function PlanosEmpresarialForm({
  plan,
  onSuccess,
  onDelete,
  onClose,
  maxPlansReached = false,
}: PlanosEmpresarialFormProps) {
  const [formState, setFormState] = useState<PlanoEmpresarialFormState>(
    () => mapPlanToFormState(plan),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setFormState(mapPlanToFormState(plan));
  }, [plan]);

  const isEditing = Boolean(plan?.id);
  const isHighlightEnabled = formState.vagaEmDestaque === "yes";

  const renderIconPreview = useMemo(() => {
    if (!formState.icon) return null;
    const IconComponent = (
      LucideIcons as Record<string, unknown>
    )[formState.icon] as LucideIcon | undefined;
    if (!IconComponent) return null;
    return <IconComponent className="h-5 w-5 text-gray-600" />;
  }, [formState.icon]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

    if (!isEditing && maxPlansReached) {
      toastCustom.error("Limite máximo de 4 planos atingido");
      return;
    }

    const icon = formState.icon.trim();
    const nome = formState.nome.trim();
    const descricao = formState.descricao.trim();

    if (!icon) {
      toastCustom.error("Selecione um ícone para o plano");
      return;
    }

    if (!nome) {
      toastCustom.error("O nome do plano é obrigatório");
      return;
    }

    if (!descricao) {
      toastCustom.error("A descrição do plano é obrigatória");
      return;
    }

    const valor = formatCurrencyValue(formState.valor);
    if (!valor) {
      toastCustom.error("Informe um valor válido para o plano");
      return;
    }

    const desconto = parsePercentage(formState.desconto);
    if (desconto === null) {
      toastCustom.error("Informe um percentual de desconto válido");
      return;
    }
    if (desconto < 0 || desconto > 100) {
      toastCustom.error("O desconto deve estar entre 0% e 100%");
      return;
    }

    const quantidadeVagas = parseNumber(formState.quantidadeVagas);
    if (!quantidadeVagas || quantidadeVagas <= 0) {
      toastCustom.error("Informe uma quantidade de vagas válida");
      return;
    }

    let quantidadeVagasDestaque = 0;
    if (isHighlightEnabled) {
      const parsed = parseNumber(formState.quantidadeVagasDestaque);
      if (!parsed || parsed <= 0) {
        toastCustom.error(
          "Informe a quantidade de vagas em destaque quando essa opção estiver ativa",
        );
        return;
      }
      quantidadeVagasDestaque = parsed;
    }

    setIsLoading(true);
    try {
      const payload = {
        icon,
        nome,
        descricao,
        valor,
        desconto,
        quantidadeVagas,
        vagaEmDestaque: isHighlightEnabled,
        quantidadeVagasDestaque,
      };

      const saved = isEditing && plan?.id
        ? await updatePlanoEmpresarial(plan.id, payload)
        : await createPlanoEmpresarial(payload);

      toastCustom.success(
        isEditing ? "Plano atualizado com sucesso" : "Plano criado com sucesso",
      );

      setFormState(mapPlanToFormState(saved));
      onSuccess(saved);
      onClose();
    } catch (err) {
      const status = (err as any)?.status;
      switch (status) {
        case 400:
        case 422:
          toastCustom.error("Dados inválidos. Verifique os campos preenchidos");
          break;
        case 401:
          toastCustom.error("Sessão expirada. Faça login novamente");
          break;
        case 403:
          toastCustom.error("Você não tem permissão para realizar esta ação");
          break;
        case 409:
          toastCustom.error("Limite máximo de 4 planos empresariais atingido");
          break;
        case 500:
          toastCustom.error("Erro interno do servidor ao salvar o plano");
          break;
        default:
          toastCustom.error("Não foi possível salvar o plano empresarial");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!plan?.id || isDeleting) return;
    const confirmed = window.confirm(
      "Tem certeza que deseja remover este plano empresarial?",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deletePlanoEmpresarial(plan.id);
      toastCustom.success("Plano removido com sucesso");
      onDelete?.(plan.id);
      onClose();
    } catch (err) {
      const status = (err as any)?.status;
      switch (status) {
        case 401:
          toastCustom.error("Sessão expirada. Faça login novamente");
          break;
        case 403:
          toastCustom.error("Você não tem permissão para realizar esta ação");
          break;
        case 404:
          toastCustom.error("Plano empresarial não encontrado");
          break;
        case 500:
          toastCustom.error("Erro interno do servidor ao remover o plano");
          break;
        default:
          toastCustom.error("Não foi possível remover o plano empresarial");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Ícone do plano
            </Label>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Ícone selecionado:</span>
              {renderIconPreview}
            </div>
          </div>
          <IconSelector
            value={formState.icon}
            onValueChange={(iconName) =>
              setFormState((prev) => ({ ...prev, icon: iconName }))
            }
            placeholder="Selecionar ícone"
          />
        </div>

        <InputCustom
          label="Nome do plano"
          id="nome"
          value={formState.nome}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, nome: e.target.value }))
          }
          placeholder="Digite o nome do plano"
          maxLength={80}
          required
        />
      </div>

      <SimpleTextarea
        id="descricao"
        value={formState.descricao}
        onChange={(e) =>
          setFormState((prev) => ({ ...prev, descricao: e.target.value }))
        }
        placeholder="Descreva os benefícios do plano empresarial"
        maxLength={400}
        showCharCount
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputCustom
          label="Valor mensal"
          id="valor"
          type="number"
          step="0.01"
          min="0"
          value={formState.valor}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, valor: e.target.value }))
          }
          placeholder="Ex: 199.90"
          required
        />

        <InputCustom
          label="Desconto (%)"
          id="desconto"
          type="number"
          min="0"
          max="100"
          step="1"
          value={formState.desconto}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, desconto: e.target.value }))
          }
          placeholder="Ex: 10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputCustom
          label="Quantidade de vagas"
          id="quantidadeVagas"
          type="number"
          min="1"
          value={formState.quantidadeVagas}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              quantidadeVagas: e.target.value,
            }))
          }
          placeholder="Ex: 10"
          required
        />

        <div className="space-y-3">
          <SelectCustom
            label="Vagas em destaque"
            options={HIGHLIGHT_OPTIONS}
            value={formState.vagaEmDestaque}
            onChange={(value) =>
              setFormState((prev) => ({
                ...prev,
                vagaEmDestaque: (value as HighlightChoice | null) ?? "no",
                quantidadeVagasDestaque:
                  value === "yes" ? prev.quantidadeVagasDestaque : "",
              }))
            }
            placeholder="Selecione uma opção"
            required
          />
          <InputCustom
            label="Quantidade de vagas em destaque"
            id="quantidadeVagasDestaque"
            type="number"
            min="1"
            value={formState.quantidadeVagasDestaque}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                quantidadeVagasDestaque: e.target.value,
              }))
            }
            placeholder="Ex: 2"
            disabled={!isHighlightEnabled}
            required={isHighlightEnabled}
          />
        </div>
      </div>

      {!isEditing && maxPlansReached && (
        <p className="text-sm text-destructive">
          Você já atingiu o limite de quatro planos empresariais.
        </p>
      )}

      <div className="flex flex-wrap justify-between gap-3 pt-4">
        <div className="flex gap-2">
          {isEditing && (
            <ButtonCustom
              type="button"
              variant="danger"
              icon="Trash2"
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={isDeleting || isLoading}
            >
              Excluir plano
            </ButtonCustom>
          )}
        </div>

        <ButtonCustom
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          size="lg"
          className="w-full md:w-40"
        >
          {isEditing ? "Salvar alterações" : "Cadastrar plano"}
        </ButtonCustom>
      </div>
    </form>
  );
}
