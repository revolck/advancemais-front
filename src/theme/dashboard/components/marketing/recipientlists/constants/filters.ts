import type { DateRange } from "@/components/ui/custom/date-picker";
import type { FilterField } from "@/components/ui/custom/filters";

export const EMPTY_DATE_RANGE: DateRange = { from: null, to: null };

export const recipientListsFilterFields: FilterField[] = [
  {
    key: "status",
    label: "Status",
    mode: "single",
    placeholder: "Selecionar status",
    options: [
      { value: "ATIVA", label: "Ativa" },
      { value: "ARQUIVADA", label: "Arquivada" },
    ],
  },
  {
    key: "membershipMode",
    label: "Tipo",
    mode: "single",
    placeholder: "Selecionar tipo",
    options: [
      { value: "MANUAL", label: "Manual" },
      { value: "DINAMICA", label: "Dinâmica" },
      { value: "HIBRIDA", label: "Híbrida" },
    ],
  },
  {
    key: "updatedAt",
    label: "Atualizado em",
    type: "date-range",
    placeholder: "Selecionar período",
  },
];
