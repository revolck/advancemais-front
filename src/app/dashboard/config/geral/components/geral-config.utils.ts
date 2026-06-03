import type {
  ConfigCategoryGroup,
  ConfigItem,
  SecretConfigAction,
} from "@/api/configuracoes-gerais/types";

type EditableValue = string | number | boolean | null;
const MULTI_SELECT_CSV_KEYS = new Set([
  "course_payment_methods",
  "subscription_payment_methods",
]);
const PAYMENT_METHOD_ORDER = ["pix", "boleto", "card"];

export type ConfigEditableValue = string | number | boolean | string[] | null;

export type SecretDraft = {
  action: SecretConfigAction;
  value?: string;
};

export function isMultiSelectCsvKey(key: string) {
  return MULTI_SELECT_CSV_KEYS.has(key);
}

function normalizeMultiSelectValues(values: string[]) {
  return PAYMENT_METHOD_ORDER.filter((item) => values.includes(item));
}

export function getInitialValue(item: ConfigItem): ConfigEditableValue {
  if (item.type === "boolean") return Boolean(item.value);
  if (item.type === "number") return item.value ?? "";
  if (item.type === "csv" && isMultiSelectCsvKey(item.key)) {
    return normalizeMultiSelectValues(
      String(item.value ?? "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    );
  }
  return item.value == null ? "" : String(item.value);
}

export function valueForPayload(item: ConfigItem, value: ConfigEditableValue) {
  if (value === null) return null;
  if (item.type === "boolean") return Boolean(value);
  if (item.type === "number") {
    if (value === "" || value === undefined) return null;
    return Number(value);
  }
  if (item.type === "csv" && Array.isArray(value)) {
    return normalizeMultiSelectValues(value).join(",");
  }
  return String(value ?? "");
}

export function valuesAreEqual(item: ConfigItem, draft: ConfigEditableValue) {
  const current = getInitialValue(item);
  if (draft === null) return item.source === "EMPTY";
  if (item.type === "number")
    return Number(current || 0) === Number(draft || 0);
  if (item.type === "boolean") return Boolean(current) === Boolean(draft);
  if (item.type === "csv" && isMultiSelectCsvKey(item.key)) {
    const currentValues = normalizeMultiSelectValues(
      Array.isArray(current) ? current : [],
    );
    const draftValues = normalizeMultiSelectValues(
      Array.isArray(draft) ? draft : [],
    );
    return currentValues.join(",") === draftValues.join(",");
  }
  return String(current ?? "") === String(draft ?? "");
}

export function buildConfigPayload(
  group: ConfigCategoryGroup | undefined,
  values: Record<string, ConfigEditableValue>,
  secrets: Record<string, SecretDraft>,
) {
  if (!group) return { values: {}, secrets: {} };

  const changedValues: Record<string, string | number | boolean | null> = {};
  const changedSecrets: Record<
    string,
    { action: SecretConfigAction; value?: string }
  > = {};

  group.items.forEach((item) => {
    if (item.secret) {
      const draft = secrets[item.key];
      if (!draft || draft.action === "keep") return;
      if (draft.action === "replace" && !draft.value?.trim()) return;
      changedSecrets[item.key] = {
        action: draft.action,
        value: draft.value?.trim(),
      };
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(values, item.key)) return;

    const draftValue = values[item.key];
    if (valuesAreEqual(item, draftValue)) return;
    changedValues[item.key] = valueForPayload(item, draftValue);
  });

  return { values: changedValues, secrets: changedSecrets };
}

export function getSecretFieldInputState(
  item: Pick<ConfigItem, "configured" | "maskedPreview">,
  draft?: SecretDraft,
) {
  const showingMaskedValue =
    Boolean(item.maskedPreview) &&
    (draft?.action !== "replace" || !(draft.value ?? "").length);
  const inputValue =
    draft?.action === "replace"
      ? (draft.value ?? "")
      : (item.maskedPreview ?? "");

  return {
    showingMaskedValue,
    inputValue,
  };
}

export function getNextSecretDraftFromMaskedKey(
  key: string,
  currentDraft?: SecretDraft,
): SecretDraft | null {
  if (key === "Backspace" || key === "Delete") {
    return { action: "replace", value: "" };
  }

  if (key.length === 1) {
    return { action: "replace", value: key };
  }

  return currentDraft ?? null;
}
