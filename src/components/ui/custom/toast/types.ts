import { VariantProps } from "class-variance-authority";
import {
  toastVariants,
  toastActionVariants,
  toastLinkVariants,
} from "./variants";

/**
 * Interface para as opções de toast
 * Define todas as propriedades possíveis para o componente toast
 */
export interface ToastOptions extends VariantProps<typeof toastVariants> {
  /** Título do toast */
  title?: string;

  /** Descrição ou mensagem principal do toast */
  description?: string;

  /** Componente React para ação primária */
  action?: React.ReactNode;

  /** Ícone personalizado para o toast */
  icon?: React.ReactNode;

  /** Duração em milissegundos que o toast fica visível (default: 5000) */
  duration?: number;

  /** ID único para o toast (gerado automaticamente se não fornecido) */
  id?: string;

  /** Classes CSS adicionais */
  className?: string;

  /** Callback executado quando o toast é fechado manualmente */
  onDismiss?: () => void;

  /** Callback executado quando o toast é fechado automaticamente */
  onAutoClose?: (id: string) => void;

  /** URL para navegação ao clicar no toast (opcional) */
  href?: string;

  /** Desabilita o swipe para fechar */
  disableSwipe?: boolean;

  /** Texto para a ação de cancelamento */
  cancelText?: string;

  /** Callback para ação de cancelamento */
  onCancel?: () => void;

  /** Texto para o link de ação */
  linkText?: string;

  /** URL para o link de ação */
  linkHref?: string;

  /** Callback para o link de ação */
  onLinkClick?: () => void;

  /** Variante do link (estilo) */
  linkVariant?: VariantProps<typeof toastLinkVariants>["variant"];
}

/**
 * Interface para o componente ToasterProps
 * Define todas as propriedades possíveis para o container de toasts
 */
export interface CustomToasterProps {
  /** Classe para o container */
  containerClassName?: string;

  /** Classe para os toasts individuais */
  className?: string;

  /** Posição na tela onde os toasts aparecerão */
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";

  /** Se os toasts devem expandir para ocupar o espaço disponível */
  expand?: boolean;

  /** Distância das bordas da tela */
  offset?: string | number;

  /** Tema do toast */
  theme?: "light" | "dark" | "system";

  /** Usar cores mais ricas e vibrantes */
  richColors?: boolean;

  /** Mostrar botão para fechar o toast */
  closeButton?: boolean;

  /** Duração padrão para todos os toasts */
  defaultDuration?: number;

  /** Número máximo de toasts a serem exibidos simultaneamente */
  maxToasts?: number;

  /** Gap entre os toasts */
  gap?: number | string;

  /** Opções específicas para toasts */
  toastOptions?: Partial<{
    classNames?: Partial<Record<string, string>>;
    descriptionClassName?: string;
    actionButtonClassName?: string;
    cancelButtonClassName?: string;
    duration?: number;
  }>;
}

/**
 * Interface para o componente Toast Action Button
 */
export interface ToastActionButtonProps
  extends VariantProps<typeof toastActionVariants> {
  /** Texto do botão */
  children: React.ReactNode;

  /** Callback ao clicar no botão */
  onClick?: () => void;

  /** Desabilita o botão */
  disabled?: boolean;

  /** Classe adicional */
  className?: string;

  /** Texto de acessibilidade */
  ariaLabel?: string;

  /** Se o botão está em estado de carregamento */
  isLoading?: boolean;

  /** Ícone para o botão */
  icon?: React.ReactNode;
}

/**
 * Interface para o componente Toast Link
 */
export interface ToastLinkProps extends VariantProps<typeof toastLinkVariants> {
  /** Texto do link */
  children: React.ReactNode;

  /** URL do link */
  href?: string;

  /** Callback ao clicar no link */
  onClick?: () => void;

  /** Classe adicional */
  className?: string;

  /** Se o link abre em nova aba */
  external?: boolean;

  /** Ícone para o link */
  icon?: React.ReactNode;
}

/**
 * Tipo para função de promise do toast
 */
export type ToastPromiseOptions<T> = {
  loading: ToastOptions | string;
  success: (data: T) => ToastOptions | string;
  error: (error: unknown) => ToastOptions | string;
};
