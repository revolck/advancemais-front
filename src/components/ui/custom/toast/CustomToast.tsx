"use client";

import React, { forwardRef, type ForwardedRef } from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import { DEFAULT_TOAST_CONFIG } from "./toastConfig";
import {
  toastVariants,
  toastActionVariants,
  toastLinkVariants,
} from "./variants";
import type {
  ToastOptions,
  CustomToasterProps,
  ToastPromiseOptions,
  ToastActionButtonProps,
  ToastLinkProps,
} from "./types";
import styles from "./toast.module.css";

/**
 * Componente ToastActionButton
 */
export const ToastActionButton = forwardRef<
  HTMLButtonElement,
  ToastActionButtonProps
>(function ToastActionButton(
  {
    children,
    onClick,
    className,
    variant = "default",
    size = "sm",
    disabled,
    isLoading,
    icon,
    ariaLabel,
  }: ToastActionButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={
        ariaLabel || (typeof children === "string" ? children : undefined)
      }
      className={cn(
        toastActionVariants({
          variant: variant as any,
          size: size as any,
        }),
        isLoading && "opacity-70 cursor-wait",
        className
      )}
    >
      {isLoading && (
        <span className="mr-2">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        </span>
      )}
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </button>
  );
});

/**
 * Componente ToastLink
 * Link estilizado para ações em toasts
 */
export const ToastLink = forwardRef<HTMLAnchorElement, ToastLinkProps>(
  function ToastLink(
    { children, href, onClick, className, variant = "default", external, icon },
    ref
  ) {
    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <a
        ref={ref}
        href={href}
        onClick={onClick}
        className={cn(
          toastLinkVariants({ variant: variant as any }),
          className
        )}
        {...externalProps}
      >
        {children}
        {icon && <span className="ml-1">{icon}</span>}
      </a>
    );
  }
);

/**
 * Componente personalizado para botão de fechar
 */
export const ToastCloseButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={styles.closeButton}
    aria-label="Fechar notificação"
  >
    <Icon name="X" size={14} className="text-muted-foreground/80" />
  </button>
);

/**
 * Componente ToasterCustom
 * Contêiner de toasts personalizado com tema e estilos
 */
export function ToasterCustom(props: CustomToasterProps) {
  // Mesclar as configurações padrão com as props fornecidas
  const mergedProps = {
    ...DEFAULT_TOAST_CONFIG,
    ...props,
    toastOptions: {
      ...DEFAULT_TOAST_CONFIG.toastOptions,
      ...(props.toastOptions || {}),
      classNames: {
        ...(DEFAULT_TOAST_CONFIG.toastOptions?.classNames || {}),
        ...(props.toastOptions?.classNames || {}),
      },
    },
  };

  return (
    <SonnerToaster
      className={cn(styles.toasterContainer, mergedProps.className)}
      position={mergedProps.position}
      expand={mergedProps.expand}
      richColors={mergedProps.richColors}
      closeButton={mergedProps.closeButton}
      offset={mergedProps.offset}
      gap={
        typeof mergedProps.gap === "string"
          ? parseInt(mergedProps.gap)
          : mergedProps.gap
      }
      duration={mergedProps.defaultDuration}
      visibleToasts={mergedProps.maxToasts}
      toastOptions={mergedProps.toastOptions}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(var(--success) / 0.1)",
          "--success-text": "hsl(var(--success))",
          "--success-border": "hsl(var(--success) / 0.2)",
          "--error-bg": "hsl(var(--destructive) / 0.1)",
          "--error-text": "hsl(var(--destructive))",
          "--error-border": "hsl(var(--destructive) / 0.2)",
          "--warning-bg": "hsl(var(--warning) / 0.1)",
          "--warning-text": "hsl(var(--warning))",
          "--warning-border": "hsl(var(--warning) / 0.2)",
          "--info-bg": "hsl(var(--info) / 0.1)",
          "--info-text": "hsl(var(--info))",
          "--info-border": "hsl(var(--info) / 0.2)",
        } as React.CSSProperties
      }
    />
  );
}

/**
 * Função factory para criar toasts com configurações personalizadas
 */
function createToast(
  options: ToastOptions | string,
  variant:
    | "default"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "action"
    | "confirmation"
    | "status" = "default"
) {
  // Se for uma string, converte para opções
  if (typeof options === "string") {
    options = { description: options };
  }

  const {
    title,
    description,
    action,
    icon: customIcon,
    duration = 5000,
    id = String(Date.now()),
    className,
    onDismiss,
    onAutoClose,
    disableSwipe = false,
    cancelText,
    onCancel,
    linkText,
    linkHref,
    onLinkClick,
    linkVariant = "default",
    density = "normal",
    prominence = "low",
  } = options;

  // Determina o ícone com base na variante
  let icon = customIcon;
  if (!icon) {
    // Escolha do ícone baseado na variante
    switch (variant) {
      case "success":
        icon = (
          <Icon name="CheckCircle" size={20} className="text-emerald-500" />
        );
        break;
      case "error":
        icon = (
          <Icon name="AlertCircle" size={20} className="text-destructive" />
        );
        break;
      case "warning":
        icon = (
          <Icon name="AlertTriangle" size={20} className="text-amber-500" />
        );
        break;
      case "info":
        icon = <Icon name="Info" size={20} className="text-blue-500" />;
        break;
      case "confirmation":
        icon = <Icon name="Trash2" size={20} className="text-indigo-500" />;
        break;
      case "action":
        icon = <Icon name="CreditCard" size={20} className="text-purple-500" />;
        break;
      case "status":
        icon = <Icon name="Archive" size={20} className="text-gray-500" />;
        break;
    }
  }

  // Cria o link se especificado
  const link =
    linkText && (linkHref || onLinkClick) ? (
      <ToastLink
        href={linkHref}
        onClick={onLinkClick}
        variant={linkVariant}
        icon={<Icon name="MoveRight" size={14} />}
      >
        {linkText}
      </ToastLink>
    ) : null;

  // Cria o botão de cancelamento se especificado
  const cancelAction =
    cancelText && onCancel ? (
      <button
        onClick={onCancel}
        className={cn(
          toastActionVariants({ variant: "outline" as any, size: "sm" as any }),
          "ml-2"
        )}
      >
        {cancelText}
      </button>
    ) : null;

  // Configuração de ações combinadas
  const combinedAction =
    action || cancelAction || link ? (
      <div className={styles.toastActions}>
        {action}
        {cancelAction}
        {link && <div className="ml-auto">{link}</div>}
      </div>
    ) : undefined;

  // Ajusta duração baseada na proeminência
  const adjustedDuration =
    prominence === "high" ? Math.max(duration, 8000) : duration;

  // Cria o toast usando o Sonner
  return sonnerToast(title || "", {
    description,
    action: combinedAction,
    icon,
    id,
    duration: adjustedDuration,
    className: cn(
      toastVariants({
        variant,
        density,
        prominence,
      }),
      styles.toast,
      className
    ),
    onDismiss,
    onAutoClose: onAutoClose
      ? (toastId) => onAutoClose && onAutoClose(String(toastId))
      : undefined,
    closeButton: true,
    dismissible: !disableSwipe,
  });
}

// Wrapper para o botão de ação que resolve problemas de tipagem
const ActionButtonWrapper = (props: ToastActionButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled || props.isLoading}
      aria-label={
        props.ariaLabel ||
        (typeof props.children === "string" ? props.children : undefined)
      }
      className={cn(
        toastActionVariants({
          variant: props.variant as any,
          size: props.size as any,
        }),
        props.isLoading && "opacity-70 cursor-wait",
        props.className
      )}
    >
      {props.isLoading && (
        <span className="mr-2">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        </span>
      )}
      {props.icon && <span className="mr-1.5">{props.icon}</span>}
      {props.children}
    </button>
  );
};

/**
 * API pública para o toast
 */
export const toastCustom = {
  // Métodos principais por variante
  default: (options: ToastOptions | string) => createToast(options, "default"),
  success: (options: ToastOptions | string) => createToast(options, "success"),
  error: (options: ToastOptions | string) => createToast(options, "error"),
  warning: (options: ToastOptions | string) => createToast(options, "warning"),
  info: (options: ToastOptions | string) => createToast(options, "info"),

  // Novos métodos baseados nos exemplos de imagem
  action: (options: ToastOptions | string) => createToast(options, "action"),
  confirmation: (options: ToastOptions | string) =>
    createToast(options, "confirmation"),
  status: (options: ToastOptions | string) => createToast(options, "status"),

  // Métodos para gerenciar toasts
  dismiss: (id?: string) => sonnerToast.dismiss(id),
  dismissAll: () => sonnerToast.dismiss(),

  // Método personalizado para promessas
  promise: <T extends unknown>(
    promise: Promise<T>,
    options: ToastPromiseOptions<T>
  ) => {
    // Convert string to options objects
    const loadingOptions =
      typeof options.loading === "string"
        ? { description: options.loading }
        : options.loading;

    // Generate a unique ID for this toast
    const id = loadingOptions.id || String(Date.now());

    // Show loading toast with infinite duration
    createToast(
      {
        ...loadingOptions,
        id,
        duration: Infinity, // Loading state should persist until promise resolves
      },
      "default"
    );

    // Return a promise that updates the toast based on the result
    return promise
      .then((data) => {
        const successOptions = options.success(data);
        const successOpts =
          typeof successOptions === "string"
            ? { description: successOptions }
            : successOptions;

        createToast({ ...successOpts, id }, "success");
        return data;
      })
      .catch((err) => {
        const errorOptions = options.error(err);
        const errorOpts =
          typeof errorOptions === "string"
            ? { description: errorOptions }
            : errorOptions;

        createToast({ ...errorOpts, id }, "error");
        throw err;
      });
  },

  // Método especializado para toasts de créditos
  credits: (options: ToastOptions | string) => {
    const opts =
      typeof options === "string"
        ? { title: "Credits purchased successfully!", description: options }
        : { title: "Credits purchased successfully!", ...options };

    return createToast(
      {
        ...opts,
        icon: <Icon name="CreditCard" size={20} className="text-emerald-500" />,
        prominence: "high",
      },
      "success"
    );
  },

  // Método especializado para toasts de imagem gerada
  imageGenerated: (timeInSecs: number, options?: Partial<ToastOptions>) => {
    return createToast(
      {
        title: `Image generated in ${timeInSecs} secs!`,
        description: "Your design is finished and waiting in the queue.",
        icon: <Icon name="Image" size={20} className="text-blue-500" />,
        prominence: "low",
        ...options,
      },
      "info"
    );
  },

  // Método especializado para confirmação de exclusão
  confirmDelete: (
    entityName: string,
    onDelete: () => void,
    onCancel: () => void,
    options?: Partial<ToastOptions>
  ) => {
    return createToast(
      {
        title: "Delete conversation?",
        description: `Deleting ${entityName} will permanently remove the chat memory and it's associated data.`,
        cancelText: "Cancel",
        onCancel,
        action: (
          <ActionButtonWrapper
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </ActionButtonWrapper>
        ),
        duration: 10000, // Longer duration for confirmations
        prominence: "high",
        disableSwipe: true,
        ...options,
      },
      "confirmation"
    );
  },

  // Método especializado para toasts com ações de desfazer
  withUndo: (
    message: string,
    onUndo: () => void,
    options?: Partial<ToastOptions>
  ) => {
    return createToast(
      {
        description: message,
        action: (
          <ActionButtonWrapper variant="outline" size="sm" onClick={onUndo}>
            Undo
          </ActionButtonWrapper>
        ),
        ...options,
      },
      "status"
    );
  },

  // Método especializado para toasts com link
  withLink: (
    message: string,
    linkText: string,
    linkHref: string,
    options?: Partial<ToastOptions>
  ) => {
    return createToast(
      {
        description: message,
        linkText,
        linkHref,
        ...options,
      },
      "info"
    );
  },

  // Componentes exportados para uso personalizado
  ActionButton: ActionButtonWrapper,
  Link: ToastLink,
  CloseButton: ToastCloseButton,
};
