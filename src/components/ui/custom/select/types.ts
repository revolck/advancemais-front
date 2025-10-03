import { HTMLAttributes } from "react";

export type SelectMode = "single" | "multiple" | "user";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface UserOption extends SelectOption {
  avatarUrl?: string;
  colorClass?: string; // tailwind classes for placeholder square
}

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange">;

export interface BaseSelectProps extends DivProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  required?: boolean;
}

export interface SingleSelectProps extends BaseSelectProps {
  mode?: "single";
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  searchable?: boolean;
}

export interface MultipleSelectProps extends BaseSelectProps {
  mode: "multiple";
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  searchable?: boolean;
}

export interface UserSelectProps extends BaseSelectProps {
  mode: "user";
  options: UserOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export type SelectCustomProps =
  | SingleSelectProps
  | MultipleSelectProps
  | UserSelectProps;
