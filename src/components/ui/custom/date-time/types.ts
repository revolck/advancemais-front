export type DateTimeMode = "time" | "date" | "time-range" | "date-range";

export interface DateRangeValue {
  from: string;
  to: string;
}

export interface DateTimeBaseProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  stepMinutes?: number; // ajuste por setas, padrão 15
}

export interface TimeProps extends DateTimeBaseProps {
  mode?: "time";
  value: string;
  onChange: (value: string) => void;
}

export interface DateProps extends DateTimeBaseProps {
  mode: "date";
  value: string; // yyyy-mm-dd
  onChange: (value: string) => void;
}

export interface TimeRangeProps extends DateTimeBaseProps {
  mode: "time-range";
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  min?: string; // HH:MM
  max?: string; // HH:MM
}

export interface DateRangeProps extends DateTimeBaseProps {
  mode: "date-range";
  value: DateRangeValue; // yyyy-mm-dd
  onChange: (value: DateRangeValue) => void;
}

export type DateTimeCustomProps =
  | TimeProps
  | DateProps
  | TimeRangeProps
  | DateRangeProps;
