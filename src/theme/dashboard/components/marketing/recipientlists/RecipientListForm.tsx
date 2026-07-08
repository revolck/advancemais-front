"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Plus, Trash2 } from "lucide-react";

import type {
  RecipientKind,
  RecipientList,
  RecipientListCondition,
  RecipientListConditionField,
  RecipientListConditionOperator,
  RecipientListMembershipMode,
  RecipientListRecipientsOptions,
  RecipientListRuleFieldMeta,
  RecipientListRuleRoutine,
  RecipientListRulesGroup,
  RecipientListsRuleOptions,
  RecipientReference,
} from "@/api/websites/components/recipientlists";
import {
  ButtonCustom,
  DatePickerCustom,
  FormLoadingModal,
  InputCustom,
  MultiSelectCustom,
  SelectCustom,
  SimpleTextarea,
  toastCustom,
} from "@/components/ui/custom";

interface RecipientListFormProps {
  list?: RecipientList | null;
  ruleOptions?: RecipientListsRuleOptions;
  recipientOptions?: RecipientListRecipientsOptions;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  onSubmit: (payload: {
    nome: string;
    descricao: string | null;
    status: "ATIVA" | "ARQUIVADA";
    membershipMode: RecipientListMembershipMode;
    rulesConfig: RecipientListRulesGroup | null;
    manualIncludes: RecipientReference[];
    manualExcludes: RecipientReference[];
  }) => Promise<void>;
  onCancel: () => void;
}

const membershipOptions = [
  { value: "MANUAL", label: "Manual" },
  { value: "DINAMICA", label: "Dinâmica" },
  { value: "HIBRIDA", label: "Híbrida" },
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

function createCondition(
  field?: RecipientListConditionField,
): RecipientListCondition {
  return {
    id: crypto.randomUUID(),
    field: field ?? "recipient.base.kind",
    operator: "IS",
    value: "",
  };
}

function createDefaultRulesGroup(
  field?: RecipientListConditionField,
): RecipientListRulesGroup {
  return {
    operator: "AND",
    conditions: [createCondition(field)],
    groups: [],
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

function parseStoredDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeRuleLabel(label?: string | null) {
  if (!label) return "";

  const trimmed = label.trim();
  if (!trimmed) return "";

  const specialLabels: Record<string, string> = {
    "Base do destinatário": "Destinatário",
    Base: "Destinatário",
    "Marketing / leads": "Contatos",
    Marketing: "Contatos",
    "Aluno / candidato": "Aluno/Candidato",
    ALUNO_CANDIDATO: "ALUNO/CANDIDATO",
  };

  let next = specialLabels[trimmed] ?? trimmed;

  next = next
    .replace(/Leads de marketing/gi, "Contatos")
    .replace(/Leads e usuários/gi, "Contatos e usuários")
    .replace(/Lead sem nome/gi, "Contato sem nome")
    .replace(/Status do lead/gi, "Status do contato")
    .replace(/Tag do lead/gi, "Tag do contato")
    .replace(/Responsável do lead/gi, "Responsável do contato")
    .replace(/leads/gi, "contatos")
    .replace(/lead/gi, "contato");

  if (next === next.toUpperCase()) {
    next = next.replaceAll("_", " ");
  }

  next = next.replace(/ALUNO\s*\/\s*CANDIDATO/gi, "ALUNO/CANDIDATO");
  next = next.replace(/Aluno\s*\/\s*candidato/gi, "Aluno/Candidato");
  next = next.replace(/Contatos\s*\/\s*contatos/gi, "Contatos");

  return next;
}

function getRuleRoutines(
  ruleOptions: RecipientListsRuleOptions | undefined,
): RecipientListRuleRoutine[] {
  if (!ruleOptions) return [];

  if (Array.isArray(ruleOptions.routines) && ruleOptions.routines.length > 0) {
    return ruleOptions.routines.map((routine) => ({
      ...routine,
      label: normalizeRuleLabel(routine.label),
      fields: routine.fields.map((field) => ({
        ...field,
        label: normalizeRuleLabel(field.label),
        routineLabel: normalizeRuleLabel(field.routineLabel),
      })),
    }));
  }

  return ruleOptions.categories.map((category) => ({
    key: category.key,
    label: normalizeRuleLabel(category.label),
    fields: category.fields.map((field) => ({
      ...field,
      label: normalizeRuleLabel(field.label),
      routineKey: field.routineKey ?? category.key,
      routineLabel: normalizeRuleLabel(field.routineLabel ?? category.label),
    })),
  }));
}

function getFieldMeta(
  ruleOptions: RecipientListsRuleOptions | undefined,
  field: RecipientListConditionField,
): RecipientListRuleFieldMeta | undefined {
  return getRuleRoutines(ruleOptions)
    .flatMap((routine) => routine.fields)
    .find((item) => item.field === field);
}

function getRoutineFields(
  ruleOptions: RecipientListsRuleOptions | undefined,
  routineKey: string,
) {
  return (
    getRuleRoutines(ruleOptions).find((routine) => routine.key === routineKey)
      ?.fields ?? []
  );
}

function getDefaultFieldForRoutine(
  ruleOptions: RecipientListsRuleOptions | undefined,
  routineKey?: string,
): RecipientListConditionField {
  const routines = getRuleRoutines(ruleOptions);
  const firstField =
    (routineKey
      ? routines.find((routine) => routine.key === routineKey)?.fields[0]
      : routines[0]?.fields[0]) ?? null;

  return firstField?.field ?? "recipient.base.kind";
}

function getFieldSelectOptions(
  ruleOptions: RecipientListsRuleOptions | undefined,
  field: RecipientListConditionField,
) {
  if (!ruleOptions) return [];

  const mapLabels = <T extends { value: string; label: string }>(
    options: T[],
  ) =>
    options.map((item) => ({
      ...item,
      label: normalizeRuleLabel(item.label),
    }));

  switch (field) {
    case "recipient.base.kind":
      return mapLabels(ruleOptions.recipientKinds);
    case "recipient.user.role":
      return mapLabels(ruleOptions.roles);
    case "recipient.user.status":
      return mapLabels(ruleOptions.userStatuses);
    case "lead.popupId":
      return ruleOptions.values.popups.map((item) => ({
        value: item.id,
        label: normalizeRuleLabel(item.nome),
      }));
    case "lead.status":
      return mapLabels(ruleOptions.leadStatuses);
    case "lead.tag":
      return mapLabels(ruleOptions.values.tags);
    case "lead.ownerUsuarioId":
      return mapLabels(ruleOptions.values.owners);
    case "student.courseId":
    case "instructor.courseId":
      return mapLabels(ruleOptions.values.courses);
    case "student.enrollmentStatus":
      return mapLabels(ruleOptions.enrollmentStatuses);
    case "student.turmaId":
    case "instructor.turmaId":
      return mapLabels(ruleOptions.values.turmas);
    case "company.planId":
      return mapLabels(ruleOptions.values.plans);
    case "company.vacancyStatus":
      return mapLabels(ruleOptions.vacancyStatuses);
    default:
      return [];
  }
}

function normalizeReferences(references: RecipientReference[]) {
  const seen = new Set<string>();

  return references.filter((entry) => {
    const key = `${entry.recipientKind}:${entry.recipientId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function requiresValue(operator: RecipientListConditionOperator) {
  return !["EXISTS", "NOT_EXISTS"].includes(operator);
}

function isConditionValid(condition: RecipientListCondition) {
  if (!condition.field || !condition.operator) return false;

  if (!requiresValue(condition.operator)) return true;

  if (condition.operator === "BETWEEN") {
    return (
      String(condition.value ?? "").trim().length > 0 &&
      String(condition.valueTo ?? "").trim().length > 0
    );
  }

  if (isMultiValueOperator(condition.operator)) {
    return Array.isArray(condition.value) && condition.value.length > 0;
  }

  if (typeof condition.value === "boolean") return true;

  return String(condition.value ?? "").trim().length > 0;
}

export function RecipientListForm({
  list,
  ruleOptions,
  recipientOptions,
  isSubmitting = false,
  mode,
  onSubmit,
  onCancel,
}: RecipientListFormProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<"ATIVA" | "ARQUIVADA">("ATIVA");
  const [membershipMode, setMembershipMode] =
    useState<RecipientListMembershipMode>("DINAMICA");
  const [rulesConfig, setRulesConfig] =
    useState<RecipientListRulesGroup | null>(
      createDefaultRulesGroup("recipient.base.kind"),
    );
  const [manualIncludes, setManualIncludes] = useState<RecipientReference[]>(
    [],
  );
  const [manualExcludes, setManualExcludes] = useState<RecipientReference[]>(
    [],
  );

  useEffect(() => {
    setNome(list?.nome ?? "");
    setDescricao(list?.descricao ?? "");
    setStatus(list?.status ?? "ATIVA");
    setMembershipMode(list?.membershipMode ?? "DINAMICA");
    setRulesConfig(
      list?.rulesConfig
        ? {
            operator: list.rulesConfig.operator === "OR" ? "OR" : "AND",
            conditions: list.rulesConfig.conditions ?? [],
            groups: [],
          }
        : (list?.membershipMode ?? "DINAMICA") === "MANUAL"
          ? createEmptyRulesGroup()
          : createDefaultRulesGroup("recipient.base.kind"),
    );
    setManualIncludes(list?.manualIncludes ?? []);
    setManualExcludes(list?.manualExcludes ?? []);
  }, [list]);

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

  const availableRoutines = useMemo(
    () => getRuleRoutines(ruleOptions),
    [ruleOptions],
  );

  const rootConditions = rulesConfig?.conditions ?? [];
  const isManualMode = membershipMode === "MANUAL";
  const isDynamicMode = membershipMode === "DINAMICA";
  const isHybridMode = membershipMode === "HIBRIDA";
  const loadingTitle =
    mode === "create" ? "Criando lista..." : "Salvando lista...";
  const loadingStep =
    mode === "create"
      ? "Criando lista de destinatários..."
      : "Salvando alterações da lista...";

  const updateCondition = (
    conditionId: string,
    updater: (condition: RecipientListCondition) => RecipientListCondition,
  ) => {
    setRulesConfig((current) => {
      const next = current ?? createEmptyRulesGroup();
      return {
        ...next,
        groups: [],
        conditions: next.conditions.map((condition) =>
          condition.id === conditionId ? updater(condition) : condition,
        ),
      };
    });
  };

  const handleSubmit = async () => {
    const nomeNormalizado = nome.trim();
    const normalizedIncludes = normalizeReferences(manualIncludes);
    const normalizedExcludes = normalizeReferences(manualExcludes);
    const hasConflict = normalizedIncludes.some((include) =>
      normalizedExcludes.some(
        (exclude) =>
          exclude.recipientKind === include.recipientKind &&
          exclude.recipientId === include.recipientId,
      ),
    );

    if (!nomeNormalizado) {
      toastCustom.error("Informe o nome da lista.");
      return;
    }

    if (rootConditions.length > 20) {
      toastCustom.error("A lista pode ter no máximo 20 condições.");
      return;
    }

    if (hasConflict) {
      toastCustom.error(
        "O mesmo destinatário não pode estar em inclusões e exclusões ao mesmo tempo.",
      );
      return;
    }

    if (membershipMode !== "MANUAL") {
      if (rootConditions.length === 0) {
        toastCustom.error(
          "Adicione pelo menos uma condição para listas dinâmicas ou híbridas.",
        );
        return;
      }

      if (rootConditions.some((condition) => !isConditionValid(condition))) {
        toastCustom.error(
          "Preencha corretamente todas as condições antes de salvar a lista.",
        );
        return;
      }
    }

    const payload = {
      nome: nomeNormalizado,
      descricao: descricao.trim() || null,
      status,
      membershipMode,
      rulesConfig:
        membershipMode === "MANUAL"
          ? null
          : {
              operator:
                rulesConfig?.operator === "OR"
                  ? ("OR" as const)
                  : ("AND" as const),
              conditions: rootConditions,
              groups: [],
            },
      manualIncludes: membershipMode === "DINAMICA" ? [] : normalizedIncludes,
      manualExcludes: membershipMode === "HIBRIDA" ? normalizedExcludes : [],
    };

    await onSubmit(payload);
  };

  return (
    <div className="w-full relative">
      <FormLoadingModal
        isLoading={isSubmitting}
        title={loadingTitle}
        loadingStep={loadingStep}
        icon={Mail}
      />
      <div className="rounded-3xl bg-white p-6 border border-gray-200 space-y-6">
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:[grid-template-columns:minmax(0,1.6fr)_220px_220px]">
            <InputCustom
              label="Nome da lista"
              name="recipient-list-name"
              required
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Alunos com currículo atualizado"
            />
            <SelectCustom
              label="Status"
              required
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
            <SelectCustom
              label="Modo da lista"
              required
              options={membershipOptions.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              value={membershipMode}
              onChange={(value) =>
                {
                  const nextMode =
                    (value as RecipientListMembershipMode) ?? "DINAMICA";
                  setMembershipMode(nextMode);
                  setRulesConfig((current) => {
                    if (nextMode === "MANUAL") {
                      return createEmptyRulesGroup();
                    }

                    if ((current?.conditions?.length ?? 0) > 0) {
                      return {
                        ...(current ?? createEmptyRulesGroup()),
                        groups: [],
                      };
                    }

                    return createDefaultRulesGroup(
                      getDefaultFieldForRoutine(ruleOptions),
                    );
                  });
                }
              }
              searchable={false}
              clearable={false}
            />
          </div>

          <SimpleTextarea
            label="Descrição"
            name="recipient-list-description"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Resumo curto sobre o objetivo desta audiência."
            size="sm"
            maxLength={180}
            showCharCount
          />
        </section>

        {!isManualMode ? (
          <section className="space-y-4 border-t border-gray-200 pt-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:items-end">
              <div>
                <h2 className="mb-0! text-base! font-semibold text-slate-950">
                  Regras da lista
                </h2>
                <p className="mb-0! text-sm! leading-6 text-slate-600">
                  Combine condições para encontrar os contatos automaticamente.
                </p>
              </div>
              <SelectCustom
                label="Operador"
                required
                options={[
                  { value: "AND", label: "E" },
                  { value: "OR", label: "OU" },
                ]}
                value={rulesConfig?.operator ?? "AND"}
                onChange={(value) =>
                  setRulesConfig((current) => ({
                    ...(current ?? createEmptyRulesGroup()),
                    operator: value === "OR" ? "OR" : "AND",
                    groups: [],
                  }))
                }
                searchable={false}
                clearable={false}
                fullWidth={false}
                className="w-full"
              />
              <ButtonCustom
                type="button"
                variant="primary"
                size="lg"
                onClick={() => {
                  if (rootConditions.length >= 20) {
                    toastCustom.error(
                      "A lista pode ter no máximo 20 condições.",
                    );
                    return;
                  }

                  setRulesConfig((current) => ({
                    ...(current ?? createEmptyRulesGroup()),
                    groups: [],
                    conditions: [
                      ...(current?.conditions ?? []),
                      createCondition(getDefaultFieldForRoutine(ruleOptions)),
                    ],
                  }));
                }}
                className="w-full lg:w-auto"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Adicionar condição
              </ButtonCustom>
            </div>

            <div className="space-y-3">
              {rootConditions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6">
                  <p className="mb-1! text-sm! font-semibold text-slate-950">
                    Nenhuma condição adicionada
                  </p>
                  <p className="mb-0! text-sm! leading-6 text-slate-600">
                    Adicione pelo menos uma condição para salvar listas
                    dinâmicas ou híbridas.
                  </p>
                </div>
              ) : null}

              {rootConditions.map((condition) => {
                const fieldMeta = getFieldMeta(ruleOptions, condition.field);
                const currentRoutineKey =
                  fieldMeta?.routineKey ?? availableRoutines[0]?.key ?? "base";
                const routineFields = getRoutineFields(
                  ruleOptions,
                  currentRoutineKey,
                );
                const fieldOptions = getFieldSelectOptions(
                  ruleOptions,
                  condition.field,
                );
                const supportsSelect = fieldOptions.length > 0;
                const multiOperator = isMultiValueOperator(condition.operator);
                const needsValue = requiresValue(condition.operator);
                const isBetweenDate =
                  condition.operator === "BETWEEN" &&
                  isDateField(condition.field);
                const startDate = parseStoredDate(condition.value);
                const endDate = parseStoredDate(condition.valueTo);

                return (
                  <div
                    key={condition.id}
                    className={[
                      "grid gap-4 rounded-xl border border-gray-200 bg-white p-4",
                      needsValue
                        ? "xl:grid-cols-[180px_minmax(0,1.15fr)_220px_minmax(0,1.35fr)_48px]"
                        : "xl:grid-cols-[180px_minmax(0,1.6fr)_220px_48px]",
                    ].join(" ")}
                  >
                    <SelectCustom
                      label="Rotina"
                      required
                      options={availableRoutines.map((routine) => ({
                        value: routine.key,
                        label: routine.label,
                      }))}
                      value={currentRoutineKey}
                      onChange={(value) =>
                        updateCondition(condition.id!, () => {
                          const nextField = getDefaultFieldForRoutine(
                            ruleOptions,
                            value ?? undefined,
                          );
                          const nextMeta = getFieldMeta(ruleOptions, nextField);
                          return {
                            ...createCondition(nextField),
                            id: condition.id,
                            operator: nextMeta?.operators[0] ?? "IS",
                          };
                        })
                      }
                      searchable={false}
                      clearable={false}
                    />

                    <SelectCustom
                      label="Campo"
                      required
                      options={routineFields.map((field) => ({
                        value: field.field,
                        label: field.label,
                      }))}
                      value={condition.field}
                      onChange={(value) =>
                        updateCondition(condition.id!, () => {
                          const nextField =
                            (value as RecipientListConditionField) ??
                            getDefaultFieldForRoutine(
                              ruleOptions,
                              currentRoutineKey,
                            );
                          const nextMeta = getFieldMeta(ruleOptions, nextField);
                          return {
                            ...createCondition(nextField),
                            id: condition.id,
                            operator: nextMeta?.operators[0] ?? "IS",
                          };
                        })
                      }
                      searchable={routineFields.length > 5}
                      clearable={false}
                    />

                    <SelectCustom
                      label="Operador"
                      required
                      options={(
                        fieldMeta?.operators ??
                        (["IS"] as RecipientListConditionOperator[])
                      ).map((operator: RecipientListConditionOperator) => ({
                        value: operator,
                        label: operatorLabels[operator],
                      }))}
                      value={condition.operator}
                      onChange={(value) =>
                        updateCondition(condition.id!, (current) => ({
                          ...current,
                          operator:
                            (value as RecipientListConditionOperator) ?? "IS",
                          value: isMultiValueOperator(
                            (value as RecipientListConditionOperator) ?? "IS",
                          )
                            ? []
                            : "",
                          valueTo:
                            value === "BETWEEN"
                              ? (current.valueTo ?? "")
                              : undefined,
                        }))
                      }
                      searchable={false}
                      clearable={false}
                    />

                    {needsValue ? (
                      <div className="space-y-3">
                        {isBetweenDate ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            <DatePickerCustom
                              label="De"
                              required
                              value={startDate}
                              onChange={(date) =>
                                updateCondition(condition.id!, (current) => ({
                                  ...current,
                                  value: date
                                    ? new Date(date).toISOString().slice(0, 10)
                                    : "",
                                  valueTo:
                                    date &&
                                    parseStoredDate(
                                      current.valueTo,
                                    )?.getTime() &&
                                    parseStoredDate(
                                      current.valueTo,
                                    )!.getTime() < date.getTime()
                                      ? new Date(date)
                                          .toISOString()
                                          .slice(0, 10)
                                      : current.valueTo,
                                }))
                              }
                              format="dd/MM/yyyy"
                              placeholder="dd/mm/aaaa"
                              maxDate={endDate ?? undefined}
                            />
                            <DatePickerCustom
                              label="Até"
                              required
                              value={endDate}
                              onChange={(date) =>
                                updateCondition(condition.id!, (current) => ({
                                  ...current,
                                  valueTo: date
                                    ? new Date(date).toISOString().slice(0, 10)
                                    : "",
                                }))
                              }
                              format="dd/MM/yyyy"
                              placeholder="dd/mm/aaaa"
                              minDate={startDate ?? undefined}
                            />
                          </div>
                        ) : supportsSelect ? (
                          multiOperator ? (
                            <MultiSelectCustom
                              label="Valor"
                              required
                              options={fieldOptions}
                              value={
                                Array.isArray(condition.value)
                                  ? fieldOptions.filter((option) =>
                                      (condition.value as unknown[]).includes(
                                        option.value,
                                      ),
                                    )
                                  : []
                              }
                              onChange={(options) =>
                                updateCondition(condition.id!, (current) => ({
                                  ...current,
                                  value: options.map((option) => option.value),
                                }))
                              }
                              placeholder="Selecione…"
                              maxVisibleTags={2}
                              showCountBadge={
                                Array.isArray(condition.value) &&
                                condition.value.length > 2
                              }
                            />
                          ) : (
                            <SelectCustom
                              label="Valor"
                              required
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
                            required
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
                            required
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
                          <DatePickerCustom
                            label="Data"
                            required
                            value={
                              condition.value
                                ? new Date(
                                    `${String(condition.value)}T00:00:00`,
                                  )
                                : null
                            }
                            onChange={(date) =>
                              updateCondition(condition.id!, (current) => ({
                                ...current,
                                value: date
                                  ? new Date(date).toISOString().slice(0, 10)
                                  : "",
                              }))
                            }
                            format="dd/MM/yyyy"
                            placeholder="dd/mm/aaaa"
                          />
                        ) : (
                          <InputCustom
                            label="Valor"
                            required
                            value={String(condition.value ?? "")}
                            onChange={(event) =>
                              updateCondition(condition.id!, (current) => ({
                                ...current,
                                value: event.target.value,
                              }))
                            }
                            placeholder="Informe o valor…"
                          />
                        )}
                      </div>
                    ) : null}

                    <div className="flex items-end justify-end">
                      <ButtonCustom
                        type="button"
                        aria-label="Remover condição"
                        variant="secondary"
                        size="md"
                        className="h-12 w-12 shrink-0 !px-0"
                        onClick={() =>
                          setRulesConfig((current) => ({
                            ...(current ?? createEmptyRulesGroup()),
                            groups: [],
                            conditions: (current?.conditions ?? []).filter(
                              (item) => item.id !== condition.id,
                            ),
                          }))
                        }
                      >
                        <Trash2
                          className="h-4 w-4 text-white"
                          aria-hidden="true"
                        />
                      </ButtonCustom>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
        {!isDynamicMode ? (
          <section className="space-y-4 border-t border-gray-200 pt-6">
            <div
              className={
                isHybridMode ? "space-y-5" : "space-y-5"
              }
            >
              <div>
                <h3 className="mb-0! text-sm! font-semibold text-slate-950">
                  Inclusões manuais
                </h3>
                <p className="mb-4! text-sm! leading-6 text-slate-600">
                  Adicione contatos específicos nesta audiência.
                </p>
                <MultiSelectCustom
                  options={recipientSelectOptions}
                  value={selectedIncludes}
                  onChange={(options) =>
                    setManualIncludes(
                      options.map((option) => {
                        const [recipientKind, recipientId] =
                          option.value.split(":");
                        return {
                          recipientKind: recipientKind as RecipientKind,
                          recipientId,
                        };
                      }),
                    )
                  }
                  placeholder="Selecione destinatários…"
                  triggerSearchOnFocus
                  maxVisibleTags={4}
                  showCountBadge={selectedIncludes.length > 4}
                />
              </div>

              {isHybridMode ? (
                <div>
                  <h3 className="mb-0! text-sm! font-semibold text-slate-950">
                    Exclusões manuais
                  </h3>
                  <p className="mb-4! text-sm! leading-6 text-slate-600">
                    Remova exceções mesmo quando a regra encontrar o
                    destinatário.
                  </p>
                  <MultiSelectCustom
                    options={recipientSelectOptions}
                    value={selectedExcludes}
                    onChange={(options) =>
                      setManualExcludes(
                        options.map((option) => {
                          const [recipientKind, recipientId] =
                            option.value.split(":");
                          return {
                            recipientKind: recipientKind as RecipientKind,
                            recipientId,
                          };
                        }),
                      )
                    }
                    placeholder="Selecione exclusões…"
                    triggerSearchOnFocus
                    maxVisibleTags={4}
                    showCountBadge={selectedExcludes.length > 4}
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="flex items-center justify-end gap-2 mt-10">
          <ButtonCustom
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="button"
            size="md"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText={mode === "create" ? "Criando lista" : "Salvando lista"}
            fullWidth
            className="sm:w-auto"
          >
            {mode === "create" ? "Criar lista" : "Salvar lista"}
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
}
