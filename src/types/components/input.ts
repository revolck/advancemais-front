/**
 * Tipos relacionados aos componentes de input
 */
import { IconName } from "@/components/ui/custom/Icons";
import { InputHTMLAttributes } from "react";

/**
 * Tipos de máscaras suportadas pelo componente
 */
export type MaskType =
  | "cpf"
  | "cnpj"
  | "cpfCnpj"
  | "phone"
  | "cep"
  | "date"
  | "money"
  | "creditCard"
  | "time"
  | "rg"
  | "numeric"
  | "alphanumeric"
  | "email"
  | "password"
  | "custom";

/**
 * Configuração para máscaras personalizadas
 */
export type MaskConfig = {
  mask: string;
  maskChar?: string;
  alwaysShowMask?: boolean;
  formatChars?: Record<string, RegExp>;
};

/**
 * Props para o componente de input customizado
 * Esta interface define todas as propriedades aceitas pelo InputCustom
 */
export interface InputCustomProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
  icon?: IconName;
  rightIcon?: IconName;
  mask?: MaskType;
  maskConfig?: MaskConfig;
  showPasswordToggle?: boolean;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isFloatingLabel?: boolean;
  helperText?: string;
  maxLength?: number;
  successMessage?: string;
  onIconClick?: () => void;
  onRightIconClick?: () => void;
}

/**
 * Estado interno do componente InputCustom
 * Utilizado para gerenciar estados do input que não são expostos via props
 */
export interface InputCustomState {
  isFocused: boolean;
  isPasswordVisible: boolean;
  hasError: boolean;
  hasSuccess: boolean;
  currentValue: string;
}

/**
 * Tipos de eventos do InputCustom
 * Facilita a tipagem de handlers de eventos específicos do componente
 */
export interface InputCustomEvents {
  onValueChange?: (value: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onValidityChange?: (isValid: boolean) => void;
}
