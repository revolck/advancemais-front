import type { SelectOption } from "@/components/ui/custom/select";
import type { DateRange } from "@/components/ui/custom/date-picker";

export type FilterMode = "single" | "multiple";
export type FilterType = "select" | "date-range";

export interface FilterField {
  key: string;
  label: string;
  type?: FilterType; // default: select
  mode?: FilterMode; // default: single
  options?: SelectOption[]; // required for select type
  placeholder?: string;
}

export type FilterValues = Record<
  string,
  string | string[] | DateRange | null | undefined
>;

export interface FilterBarProps {
  className?: string;
  fields: FilterField[];
  values: FilterValues;
  onChange: (key: string, value: string | string[] | DateRange | null) => void;
  onClearAll?: () => void;
  search?: {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  };
  rightActions?: React.ReactNode;
}
