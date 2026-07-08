"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type {
  RecipientKind,
  RecipientList,
  RecipientListCondition,
  RecipientListConditionField,
  RecipientListConditionOperator,
  RecipientListMembershipMode,
  RecipientListRecipientsOptions,
  RecipientListRuleFieldMeta,
  RecipientListRulesGroup,
  RecipientListsRuleOptions,
  RecipientReference,
} from "@/api/websites/components/recipientlists";
import {
  ButtonCustom,
  InputCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  MultiSelectCustom,
  SelectCustom,
  SimpleTextarea,
} from "@/components/ui/custom";
import { cn } from "@/lib/utils";

interface RecipientListEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    nome: string;
    descricao: string | null;
    status: "ATIVA" | "ARQUIVADA";
    membershipMode: RecipientListMembershipMode;
    rulesConfig: RecipientListRulesGroup | null;
    manualIncludes: RecipientReference[];
    manualExcludes: RecipientReference[];
  }) => Promise<void>;
  list?: RecipientList | null;
  ruleOptions?: RecipientListsRuleOptions;
  recipientOptions?: RecipientListRecipientsOptions;
  isSubmitting?: boolean;
}

const membershipOptions = [
  {
    value: "MANUAL",
    label: "Manual",
  },
  {
    value: "DINAMICA",
    label: "Dinâmica",
  },
  {
    value: "HIBRIDA",
    label: "Híbrida",
  },
] as const;

const statusOptions = [
  { value: "ATIVA", label: "Ativa" },
  { value: "ARQUIVADA", label: "Arquivada" },
] as const;

const operatorLabels: Record<RecipientListConditionOperator, string> = {
  IS: "É",
  IS_NOT: "Não é",
  IN: "Está em",
  NOT_IN: "Não está em",
  EXISTS: "Existe",
  NOT_EXISTS: "Não existe",
  GT: "Maior que",
  GTE: "Maior ou igual",
  LT: "Menor que",
  LTE: "Menor ou igual",
  BETWEEN: "Entre",
  HAS_ANY: "Contém algum",
  HAS_ALL: "Contém todos",
};

function createEmptyRulesGroup(): RecipientListRulesGroup {
  return {
    operator: "AND",
    conditions: [],
    groups: [],
  };
}

function createCondition(field?: RecipientListConditionField): RecipientListCondition {
  return {
    id: crypto.randomUUID(),
    field: field ?? "recipient.base.kind",
    operator: "IS",
    value: "",
  };
}

function isMultiValueOperator(operator: RecipientListConditionOperator) {
  return ["IN", "NOT_IN", "HAS_ANY", "HAS_ALL"].includes(operator);
}

function isBooleanField(field: RecipientListConditionField) {
  return [
    "student.hasResume",
    "student.hasEnrollment",
    "student.hasCertificate",
    "company.hasPlan",
    "company.hasVacancies",
  ].includes(field);
}

function isNumericField(field: RecipientListConditionField) {
  return [
    "student.resumeCount",
    "company.vacancyCount",
    "instructor.assignmentCount",
  ].includes(field);
}

function isDateField(field: RecipientListConditionField) {
  return ["lead.captureDate", "student.enrollmentDate"].includes(field);
}

function getFieldMeta(
  ruleOptions: RecipientListsRuleOptions | undefined,
  field: RecipientListConditionField,
): RecipientListRuleFieldMeta | undefined {
  return ruleOptions?.categories
    .flatMap((category) => category.fields)
    .find((item) => item.field === field);
}

function getFieldSelectOptions(
  ruleOptions: RecipientListsRuleOptions | undefined,
  field: RecipientListConditionField,
) {
  if (!ruleOptions) return [];

  switch (field) {
    case "recipient.base.kind":
      return ruleOptions.recipientKinds.map((item) => ({
        value: item.value,
        label: item.label,
      }));
    case "recipient.user.role":
      return ruleOptions.roles;
    case "recipient.user.status":
      return ruleOptions.userStatuses;
    case "lead.popupId":
      return ruleOptions.values.popups.map((item) => ({
        value: item.id,
        label: item.nome,
      }));
    case "lead.status":
      return ruleOptions.leadStatuses;
    case "lead.tag":
      return ruleOptions.values.tags;
    case "lead.ownerUsuarioId":
      return ruleOptions.values.owners;
    case "student.courseId":
    case "instructor.courseId":
      return ruleOptions.values.courses;
    case "student.enrollmentStatus":
      return ruleOptions.enrollmentStatuses;
    case "student.turmaId":
    case "instructor.turmaId":
      return ruleOptions.values.turmas;
    case "company.planId":
      return ruleOptions.values.plans;
    case "company.vacancyStatus":
      return ruleOptions.vacancyStatuses;
    default:
      return [];
  }
}

export function RecipientListEditorModal({
  isOpen,
  onClose,
  onSubmit,
  list,
  ruleOptions,
  recipientOptions,
  isSubmitting = false,
}: RecipientListEditorModalProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<"ATIVA" | "ARQUIVADA">("ATIVA");
  const [membershipMode, setMembershipMode] =
    useState<RecipientListMembershipMode>("DINAMICA");
  const [rulesConfig, setRulesConfig] =
    useState<RecipientListRulesGroup | null>(createEmptyRulesGroup());
  const [manualIncludes, setManualIncludes] = useState<RecipientReference[]>([]);
  const [manualExcludes, setManualExcludes] = useState<RecipientReference[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setNome(list?.nome ?? "");
    setDescricao(list?.descricao ?? "");
    setStatus(list?.status ?? "ATIVA");
    setMembershipMode(list?.membershipMode ?? "DINAMICA");
    setRulesConfig(list?.rulesConfig ?? createEmptyRulesGroup());
    setManualIncludes(list?.manualIncludes ?? []);
    setManualExcludes(list?.manualExcludes ?? []);
  }, [isOpen, list]);

  const recipientSelectOptions = useMemo(() => {
    const users = recipientOptions?.users ?? [];
    const leads = recipientOptions?.leads ?? [];

    return [...users, ...leads].map((item) => ({
      value: `${item.recipientKind}:${item.recipientId}`,
      label: item.email ? `${item.nome} · ${item.email}` : item.nome,
      searchKeywords: [item.nome, item.email ?? "", item.subtitle],
    }));
  }, [recipientOptions]);

  const selectedIncludes = useMemo(
    () =>
      manualIncludes.map((item) => {
        const option = recipientSelectOptions.find(
          (candidate) =>
            candidate.value === `${item.recipientKind}:${item.recipientId}`,
        );
        return (
          option ?? {
            value: `${item.recipientKind}:${item.recipientId}`,
            label: `${item.recipientKind} · ${item.recipientId}`,
          }
        );
      }),
    [manualIncludes, recipientSelectOptions],
  );

  const selectedExcludes = useMemo(
    () =>
      manualExcludes.map((item) => {
        const option = recipientSelectOptions.find(
          (candidate) =>
            candidate.value === `${item.recipientKind}:${item.recipientId}`,
        );
        return (
          option ?? {
            value: `${item.recipientKind}:${item.recipientId}`,
            label: `${item.recipientKind} · ${item.recipientId}`,
          }
        );
      }),
    [manualExcludes, recipientSelectOptions],
  );

  const availableFields = useMemo(
    () =>
      ruleOptions?.categories.flatMap((category) =>
        category.fields.map((field) => ({
          value: field.field,
          label: `${category.label} · ${field.label}`,
        })),
      ) ?? [],
    [ruleOptions],
  );

  const rootConditions = rulesConfig?.conditions ?? [];

  const updateCondition = (
    conditionId: string,
    updater: (condition: RecipientListCondition) => RecipientListCondition,
  ) => {
    setRulesConfig((current) => {
      const next = current ?? createEmptyRulesGroup();
      return {
        ...next,
        conditions: next.conditions.map((condition) =>
          condition.id === conditionId ? updater(condition) : condition,
        ),
      };
    });
  };

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="5xl" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{list ? "Editar lista" : "Criar lista"}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <InputCustom
                  label="Nome da lista"
                  required
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Alunos com currículo atualizado"
                />
                <SelectCustom
                  label="Modo da lista"
                  options={membershipOptions.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  value={membershipMode}
                  onChange={(value) =>
                    setMembershipMode(
                      (value as RecipientListMembershipMode) ?? "DINAMICA",
                    )
                  }
                  searchable={false}
                  clearable={false}
                />
              </div>

              <SimpleTextarea
                label="Descrição"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Resumo curto sobre o objetivo desta audiência."
              />

              <div className="grid gap-4 md:grid-cols-1">
                <SelectCustom
                  label="Status"
                  options={statusOptions.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  value={status}
                  onChange={(value) =>
                    setStatus((value as "ATIVA" | "ARQUIVADA") ?? "ATIVA")
                  }
                  searchable={false}
                  clearable={false}
                />
              </div>

              {membershipMode !== "MANUAL" ? (
                <div className="space-y-4 rounded-[24px] border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="mb-1! text-sm! font-semibold text-slate-950">
                        Regras da lista
                      </h3>
                      <p className="mb-0! text-sm! text-slate-500">
                        Defina condições com operador lógico no grupo principal.
                      </p>
                    </div>
                    <ButtonCustom
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRulesConfig((current) => ({
                          ...(current ?? createEmptyRulesGroup()),
                          conditions: [
                            ...(current?.conditions ?? []),
                            createCondition(),
                          ],
                        }))
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar condição
                    </ButtonCustom>
                  </div>

                  <SelectCustom
                    label="Operador do grupo"
                    options={[
                      { value: "AND", label: "E" },
                      { value: "OR", label: "OU" },
                    ]}
                    value={rulesConfig?.operator ?? "AND"}
                    onChange={(value) =>
                      setRulesConfig((current) => ({
                        ...(current ?? createEmptyRulesGroup()),
                        operator: value === "OR" ? "OR" : "AND",
                      }))
                    }
                    searchable={false}
                    clearable={false}
                    fullWidth={false}
                    className="w-[180px]"
                  />

                  <div className="space-y-3">
                    {rootConditions.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                        Nenhuma condição adicionada. A lista dinâmica buscará toda a base compatível com o modo atual.
                      </div>
                    ) : null}

                    {rootConditions.map((condition) => {
                      const fieldMeta = getFieldMeta(
                        ruleOptions,
                        condition.field,
                      );
                      const fieldOptions = getFieldSelectOptions(
                        ruleOptions,
                        condition.field,
                      );
                      const supportsSelect = fieldOptions.length > 0;
                      const multiOperator = isMultiValueOperator(
                        condition.operator,
                      );

                      return (
                        <div
                          key={condition.id}
                          className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-[minmax(0,1.4fr)_220px_minmax(0,1fr)_auto]"
                        >
                          <SelectCustom
                            label="Campo"
                            options={availableFields}
                            value={condition.field}
                            onChange={(value) =>
                              updateCondition(condition.id!, () => {
                                const nextField =
                                  (value as RecipientListConditionField) ??
                                  "recipient.base.kind";
                                const nextMeta = getFieldMeta(
                                  ruleOptions,
                                  nextField,
                                );
                                return {
                                  ...createCondition(nextField),
                                  id: condition.id,
                                  operator:
                                    nextMeta?.operators[0] ?? "IS",
                                };
                              })
                            }
                            searchable
                            clearable={false}
                          />

                          <SelectCustom
                            label="Operador"
                            options={(
                              fieldMeta?.operators ?? (["IS"] as RecipientListConditionOperator[])
                            ).map((operator: RecipientListConditionOperator) => ({
                                value: operator,
                                label: operatorLabels[operator],
                              }))}
                            value={condition.operator}
                            onChange={(value) =>
                              updateCondition(condition.id!, (current) => ({
                                ...current,
                                operator:
                                  (value as RecipientListConditionOperator) ??
                                  "IS",
                                value: isMultiValueOperator(
                                  (value as RecipientListConditionOperator) ??
                                    "IS",
                                )
                                  ? []
                                  : "",
                                valueTo:
                                  value === "BETWEEN" ? current.valueTo ?? "" : undefined,
                              }))
                            }
                            searchable={false}
                            clearable={false}
                          />

                          <div className="space-y-3">
                            {condition.operator === "BETWEEN" && isDateField(condition.field) ? (
                              <div className="grid gap-3 md:grid-cols-2">
                                <InputCustom
                                  label="De"
                                  type="date"
                                  value={String(condition.value ?? "")}
                                  onChange={(event) =>
                                    updateCondition(condition.id!, (current) => ({
                                      ...current,
                                      value: event.target.value,
                                    }))
                                  }
                                />
                                <InputCustom
                                  label="Até"
                                  type="date"
                                  value={String(condition.valueTo ?? "")}
                                  onChange={(event) =>
                                    updateCondition(condition.id!, (current) => ({
                                      ...current,
                                      valueTo: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                            ) : supportsSelect ? (
                              multiOperator ? (
                                <MultiSelectCustom
                                  label="Valor"
                                  options={fieldOptions}
                                  value={Array.isArray(condition.value)
                                    ? fieldOptions.filter((option) =>
                                        (condition.value as unknown[]).includes(
                                          option.value,
                                        ),
                                      )
                                    : []}
                                  onChange={(options) =>
                                    updateCondition(condition.id!, (current) => ({
                                      ...current,
                                      value: options.map((option) => option.value),
                                    }))
                                  }
                                  placeholder="Selecione"
                                />
                              ) : (
                                <SelectCustom
                                  label="Valor"
                                  options={fieldOptions}
                                  value={String(condition.value ?? "")}
                                  onChange={(value) =>
                                    updateCondition(condition.id!, (current) => ({
                                      ...current,
                                      value,
                                    }))
                                  }
                                  searchable
                                  clearable={false}
                                />
                              )
                            ) : isBooleanField(condition.field) ? (
                              <SelectCustom
                                label="Valor"
                                options={[
                                  { value: "true", label: "Sim" },
                                  { value: "false", label: "Não" },
                                ]}
                                value={String(condition.value ?? "true")}
                                onChange={(value) =>
                                  updateCondition(condition.id!, (current) => ({
                                    ...current,
                                    value: value === "true",
                                  }))
                                }
                                searchable={false}
                                clearable={false}
                              />
                            ) : isNumericField(condition.field) ? (
                              <InputCustom
                                label="Valor"
                                type="number"
                                value={String(condition.value ?? "")}
                                onChange={(event) =>
                                  updateCondition(condition.id!, (current) => ({
                                    ...current,
                                    value: event.target.value,
                                  }))
                                }
                                placeholder="0"
                              />
                            ) : isDateField(condition.field) ? (
                              <InputCustom
                                label="Data"
                                type="date"
                                value={String(condition.value ?? "")}
                                onChange={(event) =>
                                  updateCondition(condition.id!, (current) => ({
                                    ...current,
                                    value: event.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <InputCustom
                                label="Valor"
                                value={String(condition.value ?? "")}
                                onChange={(event) =>
                                  updateCondition(condition.id!, (current) => ({
                                    ...current,
                                    value: event.target.value,
                                  }))
                                }
                                placeholder="Informe o valor"
                              />
                            )}
                          </div>

                          <div className="flex items-end justify-end">
                            <button
                              type="button"
                              aria-label="Remover condição"
                              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
                              onClick={() =>
                                setRulesConfig((current) => ({
                                  ...(current ?? createEmptyRulesGroup()),
                                  conditions: (current?.conditions ?? []).filter(
                                    (item) => item.id !== condition.id,
                                  ),
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              {membershipMode !== "DINAMICA" ? (
                <div className="rounded-[24px] border border-slate-200 p-4">
                  <h3 className="mb-2! text-sm! font-semibold text-slate-950">
                    Inclusões manuais
                  </h3>
                  <p className="mb-4! text-sm! text-slate-500">
                    Adicione leads ou usuários específicos nesta audiência.
                  </p>
                  <MultiSelectCustom
                    options={recipientSelectOptions}
                    value={selectedIncludes}
                    onChange={(options) =>
                      setManualIncludes(
                        options.map((option) => {
                          const [recipientKind, recipientId] = option.value.split(":");
                          return {
                            recipientKind: recipientKind as RecipientKind,
                            recipientId,
                          };
                        }),
                      )
                    }
                    placeholder="Selecione destinatários"
                    triggerSearchOnFocus
                  />
                </div>
              ) : null}

              {membershipMode === "HIBRIDA" ? (
                <div className="rounded-[24px] border border-slate-200 p-4">
                  <h3 className="mb-2! text-sm! font-semibold text-slate-950">
                    Exclusões manuais
                  </h3>
                  <p className="mb-4! text-sm! text-slate-500">
                    Remova exceções mesmo quando a regra encontrar o destinatário.
                  </p>
                  <MultiSelectCustom
                    options={recipientSelectOptions}
                    value={selectedExcludes}
                    onChange={(options) =>
                      setManualExcludes(
                        options.map((option) => {
                          const [recipientKind, recipientId] = option.value.split(":");
                          return {
                            recipientKind: recipientKind as RecipientKind,
                            recipientId,
                          };
                        }),
                      )
                    }
                    placeholder="Selecione exclusões"
                    triggerSearchOnFocus
                  />
                </div>
              ) : null}

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
                <h3 className="mb-2! text-sm! font-semibold text-slate-950">
                  Resumo do modo
                </h3>
                <div className="space-y-2 text-sm! text-slate-600">
                  <p className={cn(membershipMode === "MANUAL" && "font-medium text-slate-900")}>
                    Manual: apenas itens incluídos manualmente.
                  </p>
                  <p className={cn(membershipMode === "DINAMICA" && "font-medium text-slate-900")}>
                    Dinâmica: somente destinatários encontrados pelas regras.
                  </p>
                  <p className={cn(membershipMode === "HIBRIDA" && "font-medium text-slate-900")}>
                    Híbrida: combina regra com inclusões e exclusões manuais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="justify-end gap-3">
          <ButtonCustom variant="outline" onClick={onClose}>
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            onClick={() =>
              onSubmit({
                nome,
                descricao: descricao.trim() || null,
                status,
                membershipMode,
                rulesConfig:
                  membershipMode === "MANUAL"
                    ? null
                    : rulesConfig ?? createEmptyRulesGroup(),
                manualIncludes,
                manualExcludes,
              })
            }
            disabled={isSubmitting || !nome.trim()}
            isLoading={isSubmitting}
          >
            {list ? "Salvar lista" : "Criar lista"}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
