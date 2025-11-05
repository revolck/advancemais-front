import type { ReactNode } from "react";
import type { UsuarioGenerico } from "@/api/usuarios";

export interface UsuarioDetailsViewProps {
  usuarioId: string;
  initialData: UsuarioGenerico;
}

export type UsuarioDetailsData = UsuarioGenerico;

export interface HeaderInfoProps {
  usuario: UsuarioDetailsData;
  onEditUsuario?: () => void;
  onEditEndereco?: () => void;
  onResetSenha?: () => void;
  onBloquearUsuario?: () => void;
  onDesbloquearUsuario?: () => void;
}

export interface AboutTabProps {
  usuario: UsuarioDetailsData;
  isLoading?: boolean;
}

export interface HorizontalTabItem {
  value: string;
  label: string;
  icon: string;
  content: ReactNode;
}
