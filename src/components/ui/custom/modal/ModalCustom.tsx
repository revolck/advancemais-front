// src/components/ui/custom/modal/ModalCustom.tsx

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  ModalProps,
  ModalSize,
  ModalBackdrop,
  ModalPlacement,
} from "./types";

// Mapeamento de tamanhos para classes
const sizeClasses: Record<ModalSize, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-full",
};

// Mapeamento de raios para classes
const radiusClasses: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
};

// Mapeamento de sombras para classes
const shadowClasses: Record<string, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

// Mapeamento de comportamentos de scroll para classes
const scrollBehaviorClasses: Record<string, string> = {
  normal: "overflow-auto",
  inside: "overflow-y-auto",
  outside: "overflow-y-visible",
};

// Mapeamento de posições para classes
const placementClasses: Record<ModalPlacement, string> = {
  auto: "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]",
  top: "top-4 left-[50%] translate-x-[-50%]",
  center: "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]",
  bottom: "bottom-4 left-[50%] translate-x-[-50%]",
};

// Mapeamento de backdrops para classes
const backdropClasses: Record<ModalBackdrop, string> = {
  transparent: "bg-transparent",
  opaque: "bg-black/75",
  blur: "backdrop-blur-md bg-black/30",
};

type ModalContextProps = {
  isOpen: boolean;
  onClose: () => void;
  size: ModalSize;
  radius: string;
  scrollBehavior: string;
  classNames: Required<ModalProps>["classNames"];
};

const ModalContext = React.createContext<ModalContextProps | null>(null);

/**
 * Hook para acessar o contexto da modal
 */
export const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error(
      "useModalContext deve ser usado dentro de um ModalProvider"
    );
  }
  return context;
};

/**
 * Componente principal Modal
 */
export function ModalCustom({
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  onClose,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  size = "md",
  radius = "lg",
  shadow = "lg",
  backdrop = "opaque",
  scrollBehavior = "normal",
  placement = "center",
  shouldBlockScroll = true,
  hideCloseButton = false,
  closeButton,
  motionProps,
  portalContainer,
  disableAnimation = false,
  classNames = {},
  ...props
}: ModalProps) {
  // Função para fechar a modal
  const handleClose = React.useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  // Efeito para bloquear o scroll quando a modal está aberta
  React.useEffect(() => {
    if (!shouldBlockScroll) return;

    if (isOpen) {
      // Salva a posição atual do scroll
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restaura a posição do scroll
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }, [isOpen, shouldBlockScroll]);

  // Contexto para ser passado para os componentes filhos
  const modalContext = React.useMemo(() => {
    return {
      isOpen: isOpen ?? false,
      onClose: handleClose,
      size,
      radius,
      scrollBehavior,
      classNames: classNames as Required<ModalProps>["classNames"],
    };
  }, [isOpen, handleClose, size, radius, scrollBehavior, classNames]);

  return (
    <ModalContext.Provider value={modalContext}>
      <DialogPrimitive.Root
        open={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={(open) => {
          if (isDismissable || !open) {
            onOpenChange?.(open);
            if (!open) onClose?.();
          }
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </ModalContext.Provider>
  );
}

/**
 * Componente de gatilho para a modal
 */
export function ModalTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="modal-trigger"
      className={cn("", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Trigger>
  );
}

// Interface estendida para as props do ModalPortal
interface ModalPortalProps
  extends React.ComponentProps<typeof DialogPrimitive.Portal> {
  container?: HTMLElement;
  className?: string;
}

/**
 * Componente que serve como portal para renderizar a modal
 */
export function ModalPortal({
  className,
  children,
  container,
  ...props
}: ModalPortalProps) {
  return (
    <DialogPrimitive.Portal
      data-slot="modal-portal"
      container={container}
      {...props}
    >
      {children}
    </DialogPrimitive.Portal>
  );
}

/**
 * Componente para fechar a modal
 */
export function ModalClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="modal-close"
      className={cn("", className)}
      {...props}
    />
  );
}

/**
 * Componente de overlay (fundo escuro) da modal
 */
export function ModalOverlay({
  className,
  backdrop = "opaque",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & {
  backdrop?: ModalBackdrop;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <DialogPrimitive.Overlay
        data-slot="modal-overlay"
        data-backdrop={backdrop}
        className={cn(
          "fixed inset-0 z-50",
          backdropClasses[backdrop],
          className
        )}
        {...props}
      />
    </motion.div>
  );
}

// Interface para estender as props do DialogPrimitive.Content
interface ModalContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  isKeyboardDismissDisabled?: boolean;
  isDismissable?: boolean;
  hideCloseButton?: boolean;
  closeButton?: React.ReactNode;
  shadow?: "none" | "sm" | "md" | "lg";
  placement?: ModalPlacement;
}

/**
 * Componente principal de conteúdo da modal
 */
export function ModalContent({
  className,
  children,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  isKeyboardDismissDisabled,
  isDismissable,
  hideCloseButton,
  closeButton,
  shadow = "lg",
  placement = "center",
  ...props
}: ModalContentProps) {
  const {
    onClose,
    size = "md",
    radius = "lg",
    scrollBehavior = "normal",
    classNames = {},
  } = useModalContext();

  // Renderização do conteúdo da modal
  return (
    <DialogPrimitive.Content
      data-slot="modal-content"
      onEscapeKeyDown={(e) => {
        if (onEscapeKeyDown) {
          onEscapeKeyDown(e);
        }
        // Não propaga evento se isKeyboardDismissDisabled for true
        if (isKeyboardDismissDisabled) {
          e.preventDefault();
        }
      }}
      onPointerDownOutside={(e) => {
        if (onPointerDownOutside) {
          onPointerDownOutside(e);
        }
        // Não propaga evento se isDismissable for false
        if (isDismissable === false) {
          e.preventDefault();
        }
      }}
      onInteractOutside={(e) => {
        if (onInteractOutside) {
          onInteractOutside(e);
        }
        // Não propaga evento se isDismissable for false
        if (isDismissable === false) {
          e.preventDefault();
        }
      }}
      className={cn(
        "fixed z-50 grid w-full gap-4 border p-6 bg-background",
        sizeClasses[size],
        radiusClasses[radius],
        shadowClasses[shadow],
        placementClasses[placement],
        scrollBehaviorClasses[scrollBehavior],
        classNames?.base,
        className
      )}
      {...props}
    >
      {children}

      {/* Botão de fechar (pode ser personalizado ou escondido) */}
      {!hideCloseButton &&
        (closeButton || (
          <ModalClose
            className={cn(
              "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity cursor-pointer",
              "hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
              "disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              classNames?.closeButton
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </ModalClose>
        ))}
    </DialogPrimitive.Content>
  );
}

// Interface para as props do ModalContentWrapper
interface ModalContentWrapperProps extends ModalContentProps {
  backdrop?: ModalBackdrop;
  container?: HTMLElement;
  motionProps?: any;
  disableAnimation?: boolean;
}

/**
 * Wrapper do conteúdo da modal com overlay e portal
 */
export function ModalContentWrapper({
  children,
  className,
  backdrop = "opaque",
  container,
  isDismissable,
  isKeyboardDismissDisabled,
  hideCloseButton,
  closeButton,
  shadow = "lg",
  placement = "center",
  motionProps,
  disableAnimation = false,
  ...props
}: ModalContentWrapperProps) {
  // Definições de animações padrão
  const defaultMotionProps = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 5 },
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1], // Easing personalizado para animações mais suaves
    },
  };

  // Combina props padrão com personalizadas
  const combinedMotionProps = {
    ...defaultMotionProps,
    ...motionProps,
  };

  return (
    <ModalPortal container={container}>
      <ModalOverlay backdrop={backdrop} />
      {disableAnimation ? (
        <ModalContent
          className={className}
          isDismissable={isDismissable}
          isKeyboardDismissDisabled={isKeyboardDismissDisabled}
          hideCloseButton={hideCloseButton}
          closeButton={closeButton}
          shadow={shadow}
          placement={placement}
          {...props}
        >
          {children}
        </ModalContent>
      ) : (
        <motion.div
          {...combinedMotionProps}
          style={{ width: "100%", zIndex: 50 }}
        >
          <ModalContent
            className={className}
            isDismissable={isDismissable}
            isKeyboardDismissDisabled={isKeyboardDismissDisabled}
            hideCloseButton={hideCloseButton}
            closeButton={closeButton}
            shadow={shadow}
            placement={placement}
            {...props}
          >
            {children}
          </ModalContent>
        </motion.div>
      )}
    </ModalPortal>
  );
}

/**
 * Componente para o cabeçalho da modal
 */
export function ModalHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { classNames = {} } = useModalContext();

  return (
    <div
      data-slot="modal-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        classNames?.header,
        className
      )}
      {...props}
    />
  );
}

/**
 * Componente para o rodapé da modal
 */
export function ModalFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { classNames = {} } = useModalContext();

  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        classNames?.footer,
        className
      )}
      {...props}
    />
  );
}

/**
 * Componente para o título da modal
 */
export function ModalTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="modal-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * Componente para a descrição da modal
 */
export function ModalDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/**
 * Componente para o corpo da modal
 */
export function ModalBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { scrollBehavior = "normal", classNames } = useModalContext();

  return (
    <div
      data-slot="modal-body"
      className={cn(
        scrollBehaviorClasses[scrollBehavior],
        "py-2",
        classNames?.body,
        className
      )}
      {...props}
    />
  );
}
