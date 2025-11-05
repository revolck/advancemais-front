import type { ReactNode } from "react";
import type { Instrutor } from "@/api/usuarios";

export interface InstrutorDetailsViewProps {
  instrutorId: string;
  initialData: Instrutor;
}

export type InstrutorDetailsData = Instrutor;

export interface HeaderInfoProps {
  instrutor: InstrutorDetailsData;
  onEditInstrutor?: () => void;
  onEditEndereco?: () => void;
  onResetSenha?: () => void;
  onBloquearInstrutor?: () => void;
  onDesbloquearInstrutor?: () => void;
}

export interface AboutTabProps {
  instrutor: InstrutorDetailsData;
  isLoading?: boolean;
}

export interface HorizontalTabItem {
  value: string;
  label: string;
  icon: string;
  content: ReactNode;
}
