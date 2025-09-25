import type { SelectOption } from "@/components/ui/custom/select";

export type FilterMode = "single" | "multiple";

export interface FilterField {
  key: string;
  label: string;
  mode?: FilterMode; // default: single
  options: SelectOption[];
  placeholder?: string;
}

export type FilterValues = Record<string, string | string[] | null | undefined>;

export interface FilterBarProps {
  className?: string;
  fields: FilterField[];
  values: FilterValues;
  onChange: (key: string, value: string | string[] | null) => void;
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
