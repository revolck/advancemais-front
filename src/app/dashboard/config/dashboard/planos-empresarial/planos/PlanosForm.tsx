"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  listPlanosEmpresariais,
  createPlanoEmpresarial,
  updatePlanoEmpresarial,
  deletePlanoEmpresarial,
} from "@/api/empresas/planos-empresariais";
import type { PlanoEmpresarialBackendResponse } from "@/api/empresas/planos-empresariais/types";
import { toastCustom } from "@/components/ui/custom/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanoEmpresarial {
  id: string;
  icon: string;
  nome: string;
  descricao: string;
  valor: number;
  desconto: number;
  quantidadeVagas: number;
  vagaEmDestaque: boolean;
  quantidadeVagasDestaque: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const planoSchema = z
  .object({
    icon: z.string().trim().min(1, "Informe o ícone"),
    nome: z.string().trim().min(3, "Informe o nome do plano"),
    descricao: z
      .string()
      .trim()
      .min(10, "A descrição deve ter pelo menos 10 caracteres"),
    valor: z.coerce
      .number({ invalid_type_error: "Informe um valor válido" })
      .min(0.01, "O valor deve ser maior que zero"),
    desconto: z.coerce
      .number({ invalid_type_error: "Informe um desconto válido" })
      .min(0, "O desconto mínimo é 0%")
      .max(100, "O desconto máximo é 100%"),
    quantidadeVagas: z.coerce
      .number({ invalid_type_error: "Informe a quantidade de vagas" })
      .int("A quantidade de vagas deve ser inteira")
      .min(0, "Quantidade mínima é 0"),
    vagaEmDestaque: z.boolean(),
    quantidadeVagasDestaque: z.coerce
      .number({ invalid_type_error: "Informe a quantidade de vagas em destaque" })
      .int("A quantidade de vagas em destaque deve ser inteira")
      .min(0, "Quantidade mínima é 0"),
  })
  .superRefine((data, ctx) => {
    if (!data.vagaEmDestaque && data.quantidadeVagasDestaque > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantidadeVagasDestaque"],
        message: "Defina 0 quando não houver vagas em destaque",
      });
    }

    if (data.quantidadeVagasDestaque > data.quantidadeVagas) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantidadeVagasDestaque"],
        message: "Vagas em destaque não podem exceder o total de vagas",
      });
    }
  });

export type PlanoFormValues = z.infer<typeof planoSchema>;

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: PlanoEmpresarial | null;
  onSubmit: (values: PlanoFormValues) => Promise<void>;
  isSubmitting: boolean;
}

function mapFromBackend(data: PlanoEmpresarialBackendResponse): PlanoEmpresarial {
  const parsedValor = Number.parseFloat(String(data.valor).replace(",", "."));
  return {
    id: data.id,
    icon: data.icon,
    nome: data.nome,
    descricao: data.descricao,
    valor: Number.isNaN(parsedValor) ? 0 : parsedValor,
    desconto: data.desconto,
    quantidadeVagas: data.quantidadeVagas,
    vagaEmDestaque: data.vagaEmDestaque,
    quantidadeVagasDestaque: data.quantidadeVagasDestaque,
    criadoEm: data.criadoEm,
    atualizadoEm: data.atualizadoEm,
  };
}

function mapToCreatePayload(values: PlanoFormValues) {
  return {
    icon: values.icon.trim(),
    nome: values.nome.trim(),
    descricao: values.descricao.trim(),
    valor: values.valor.toFixed(2),
    desconto: values.desconto,
    quantidadeVagas: values.quantidadeVagas,
    vagaEmDestaque: values.vagaEmDestaque,
    quantidadeVagasDestaque: values.vagaEmDestaque
      ? values.quantidadeVagasDestaque
      : 0,
  };
}

function mapToUpdatePayload(values: PlanoFormValues) {
  return mapToCreatePayload(values);
}

function PlanFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}: PlanFormDialogProps) {
  const form = useForm<PlanoFormValues>({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      icon: "",
      nome: "",
      descricao: "",
      valor: 0,
      desconto: 0,
      quantidadeVagas: 0,
      vagaEmDestaque: false,
      quantidadeVagasDestaque: 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        initialData
          ? {
              icon: initialData.icon,
              nome: initialData.nome,
              descricao: initialData.descricao,
              valor: initialData.valor,
              desconto: initialData.desconto,
              quantidadeVagas: initialData.quantidadeVagas,
              vagaEmDestaque: initialData.vagaEmDestaque,
              quantidadeVagasDestaque: initialData.quantidadeVagasDestaque,
            }
          : {
              icon: "",
              nome: "",
              descricao: "",
              valor: 0,
              desconto: 0,
              quantidadeVagas: 0,
              vagaEmDestaque: false,
              quantidadeVagasDestaque: 0,
            },
      );
    }
  }, [form, initialData, open]);

  const highlightEnabled = form.watch("vagaEmDestaque");

  useEffect(() => {
    if (!highlightEnabled) {
      form.setValue("quantidadeVagasDestaque", 0);
    }
  }, [form, highlightEnabled]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && isSubmitting) return;
      onOpenChange(next);
    },
    [isSubmitting, onOpenChange],
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl gap-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {initialData ? "Editar plano empresarial" : "Novo plano empresarial"}
          </DialogTitle>
          <DialogDescription>
            Defina os detalhes do plano, incluindo limites de vagas e regras de destaque.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do plano</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Plano Corporativo" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ph-buildings"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor mensal (R$)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        placeholder="199.90"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desconto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="1" min="0" max="100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantidadeVagas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de vagas</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="1" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantidadeVagasDestaque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vagas em destaque</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="1"
                        min="0"
                        disabled={!highlightEnabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      minLength={10}
                      rows={4}
                      placeholder="Detalhe benefícios, suporte e diferenciais do plano."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vagaEmDestaque"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/60 bg-muted/40 p-4">
                  <div className="space-y-1 pr-4">
                    <FormLabel>Permitir vagas em destaque</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Habilite para liberar vagas patrocinadas com maior visibilidade.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar plano"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function PlanosForm() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanoEmpresarial[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanoEmpresarial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PlanoEmpresarial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const maxPlansReached = plans.length >= 4;

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const aDate = a.atualizadoEm ?? a.criadoEm ?? "";
      const bDate = b.atualizadoEm ?? b.criadoEm ?? "";
      return bDate.localeCompare(aDate);
    });
  }, [plans]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const response = await listPlanosEmpresariais({
          headers: { Accept: "application/json" },
        });
        if (!mounted) return;
        const mapped = (response || []).map(mapFromBackend);
        setPlans(mapped.slice(0, 4));
      } catch (error) {
        toastCustom.error("Não foi possível carregar os planos empresariais");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateClick = () => {
    if (maxPlansReached) {
      toastCustom.warning("Limite de 4 planos empresariais atingido");
      return;
    }
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const handleEditClick = (plan: PlanoEmpresarial) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleSubmitPlan = async (values: PlanoFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingPlan) {
        const updated = await updatePlanoEmpresarial(
          editingPlan.id,
          mapToUpdatePayload(values),
        );
        setPlans((prev) =>
          prev.map((plan) =>
            plan.id === editingPlan.id ? mapFromBackend(updated) : plan,
          ),
        );
        toastCustom.success("Plano atualizado com sucesso");
      } else {
        if (plans.length >= 4) {
          toastCustom.warning("Limite de 4 planos empresariais atingido");
          return;
        }
        const created = await createPlanoEmpresarial(mapToCreatePayload(values));
        setPlans((prev) => [...prev, mapFromBackend(created)].slice(0, 4));
        toastCustom.success("Plano criado com sucesso");
      }
      setDialogOpen(false);
    } catch (error) {
      toastCustom.error("Não foi possível salvar o plano empresarial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (plan: PlanoEmpresarial) => {
    setPlanToDelete(plan);
    setConfirmOpen(true);
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    try {
      await deletePlanoEmpresarial(planToDelete.id);
      setPlans((prev) => prev.filter((plan) => plan.id !== planToDelete.id));
      toastCustom.success("Plano removido com sucesso");
    } catch (error) {
      toastCustom.error("Não foi possível remover o plano");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setPlanToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Planos empresariais
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure até quatro planos com regras de publicação de vagas e benefícios.
            </p>
          </div>
          <Button onClick={handleCreateClick} disabled={maxPlansReached}>
            Criar novo plano
          </Button>
        </div>
        {maxPlansReached && (
          <p className="text-xs text-muted-foreground">
            O limite de quatro planos está ativo. Exclua um plano existente para criar outro.
          </p>
        )}
      </div>

      {sortedPlans.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Nenhum plano cadastrado ainda
          </h3>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Comece configurando um plano para disponibilizar ofertas corporativas com limites de vagas, descontos e destaques personalizados.
          </p>
          <Button className="mt-6" onClick={handleCreateClick} disabled={maxPlansReached}>
            Cadastrar primeiro plano
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {sortedPlans.map((plan) => (
            <Card key={plan.id} className="border-border/70 bg-card/95 shadow-sm">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold">
                      {plan.nome}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                      {plan.descricao}
                    </CardDescription>
                  </div>
                  <CardAction className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(plan)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRequest(plan)}
                    >
                      Excluir
                    </Button>
                  </CardAction>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Valor mensal
                    </span>
                    <p className="text-lg font-semibold text-foreground">
                      {currencyFormatter.format(plan.valor)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Desconto de {plan.desconto}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Publicação de vagas
                    </span>
                    <p className="text-lg font-semibold text-foreground">
                      {plan.quantidadeVagas} vagas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.vagaEmDestaque ? (
                        <>
                          Até {plan.quantidadeVagasDestaque} em destaque
                        </>
                      ) : (
                        <>Sem vagas em destaque</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Ícone: {plan.icon}</Badge>
                  {plan.vagaEmDestaque ? (
                    <Badge className="bg-emerald-100 text-emerald-700">
                      Destaque habilitado
                    </Badge>
                  ) : (
                    <Badge variant="outline">Destaque desabilitado</Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex-col items-start gap-2 border-t border-border/60 pt-4">
                <p className="text-xs text-muted-foreground">
                  Criado em {plan.criadoEm ? dateFormatter.format(new Date(plan.criadoEm)) : "-"}
                </p>
                {plan.atualizadoEm && (
                  <p className="text-xs text-muted-foreground">
                    Atualizado em {dateFormatter.format(new Date(plan.atualizadoEm))}
                  </p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <PlanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingPlan}
        onSubmit={handleSubmitPlan}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover plano empresarial</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O plano "{planToDelete?.nome}" será excluído e não poderá mais ser contratado pelas empresas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} disabled={isDeleting}>
              {isDeleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
