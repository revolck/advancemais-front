"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  InputCustom,
  SimpleTextarea,
  ButtonCustom,
  IconSelector,
  toastCustom,
} from "@/components/ui/custom";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/radix-checkbox";
import {
  listPlanosEmpresariais,
  createPlanoEmpresarial,
  updatePlanoEmpresarial,
  deletePlanoEmpresarial,
  type PlanoEmpresarialBackendResponse,
} from "@/api/empresas";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PlanoEmpresarialFormState {
  id?: string;
  icon: string;
  nome: string;
  descricao: string;
  valor: string;
  desconto: string;
  quantidadeVagas: string;
  vagaEmDestaque: boolean;
  quantidadeVagasDestaque: string;
}

const createEmptyFormState = (): PlanoEmpresarialFormState => ({
  icon: "",
  nome: "",
  descricao: "",
  valor: "",
  desconto: "",
  quantidadeVagas: "",
  vagaEmDestaque: false,
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

export default function PlanosEmpresarialForm() {
  const [plans, setPlans] = useState<PlanoEmpresarialBackendResponse[]>([]);
  const [formState, setFormState] = useState<PlanoEmpresarialFormState>(
    createEmptyFormState,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const applyPlanToForm = (plan: PlanoEmpresarialBackendResponse) => {
    setFormState({
      id: plan.id,
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
      vagaEmDestaque: Boolean(plan.vagaEmDestaque),
      quantidadeVagasDestaque:
        plan.quantidadeVagasDestaque === null ||
        plan.quantidadeVagasDestaque === undefined
          ? ""
          : String(plan.quantidadeVagasDestaque),
    });
  };

  const resetForm = () => {
    setFormState(createEmptyFormState());
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setIsFetching(true);
      try {
        const data = await listPlanosEmpresariais();
        setPlans(data);
        if (data.length > 0) {
          applyPlanToForm(data[0]);
        } else {
          resetForm();
        }
      } catch (err) {
        const status = (err as any)?.status;
        switch (status) {
          case 401:
            toastCustom.error("Sessão expirada. Faça login novamente");
            break;
          case 403:
            toastCustom.error("Você não tem permissão para acessar este conteúdo");
            break;
          case 500:
            toastCustom.error("Erro do servidor ao carregar os planos cadastrados");
            break;
          default:
            toastCustom.error("Erro ao carregar os planos empresariais");
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchPlans();
  }, []);

  const renderIconPreview = (iconName: string) => {
    if (!iconName) return null;
    const IconComponent = (
      LucideIcons as Record<string, unknown>
    )[iconName] as LucideIcon | undefined;
    if (!IconComponent) return null;
    return <IconComponent className="h-5 w-5 text-gray-600" />;
  };

  const handleSelectPlan = (plan: PlanoEmpresarialBackendResponse) => {
    applyPlanToForm(plan);
  };

  const handleCreateNew = () => {
    resetForm();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

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
    if (formState.vagaEmDestaque) {
      const parsed = parseNumber(formState.quantidadeVagasDestaque);
      if (!parsed || parsed <= 0) {
        toastCustom.error(
          "Informe a quantidade de vagas em destaque quando essa opção estiver ativa",
        );
        return;
      }
      quantidadeVagasDestaque = parsed;
    }

    if (!formState.id && plans.length >= 4) {
      toastCustom.error("Limite máximo de 4 planos atingido");
      return;
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
        vagaEmDestaque: formState.vagaEmDestaque,
        quantidadeVagasDestaque,
      };

      const saved = formState.id
        ? await updatePlanoEmpresarial(formState.id, payload)
        : await createPlanoEmpresarial(payload);

      toastCustom.success(
        formState.id
          ? "Plano atualizado com sucesso"
          : "Plano criado com sucesso",
      );

      setPlans((prev) => {
        if (formState.id) {
          return prev.map((plan) =>
            plan.id === saved.id ? saved : plan,
          );
        }
        return [...prev, saved];
      });

      applyPlanToForm(saved);
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
    if (!formState.id || isDeleting) return;
    const confirmed = window.confirm(
      "Tem certeza que deseja remover este plano empresarial?",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deletePlanoEmpresarial(formState.id);
      toastCustom.success("Plano removido com sucesso");

      const updatedPlans = plans.filter((plan) => plan.id !== formState.id);
      setPlans(updatedPlans);

      if (updatedPlans.length > 0) {
        applyPlanToForm(updatedPlans[0]);
      } else {
        resetForm();
      }
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

  if (isFetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Planos cadastrados
            </h2>
            <p className="text-sm text-gray-500">
              Gerencie até quatro planos empresariais com regras de vagas
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {plans.map((plan) => (
              <ButtonCustom
                key={plan.id}
                type="button"
                variant={formState.id === plan.id ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.nome || "Plano sem título"}
              </ButtonCustom>
            ))}
            <ButtonCustom
              type="button"
              variant="ghost"
              size="sm"
              icon="Plus"
              onClick={handleCreateNew}
            >
              Novo plano
            </ButtonCustom>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Você pode cadastrar no máximo quatro planos empresariais.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Ícone do plano
              </Label>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Ícone selecionado:</span>
                {renderIconPreview(formState.icon)}
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

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Vaga em destaque
            </Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="vagaDestaque"
                checked={formState.vagaEmDestaque}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({
                    ...prev,
                    vagaEmDestaque: checked === true,
                    quantidadeVagasDestaque:
                      checked === true ? prev.quantidadeVagasDestaque : "",
                  }))
                }
              />
              <Label htmlFor="vagaDestaque" className="text-sm text-gray-600">
                Incluir vagas com destaque
              </Label>
            </div>
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
              disabled={!formState.vagaEmDestaque}
              required={formState.vagaEmDestaque}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 pt-4">
          <div className="flex gap-2">
            <ButtonCustom
              type="button"
              variant="outline"
              icon="RotateCcw"
              onClick={handleCreateNew}
              disabled={isLoading}
            >
              Limpar formulário
            </ButtonCustom>
            {formState.id && (
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
            Salvar plano
          </ButtonCustom>
        </div>
      </form>
    </div>
  );
}
