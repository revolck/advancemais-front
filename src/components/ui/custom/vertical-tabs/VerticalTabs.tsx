"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "../Icons";
import { 
  verticalTabsVariants, 
  tabsListVariants, 
  tabsTriggerVariants, 
  tabsContentVariants 
} from "./variants";
import type { VerticalTabsProps, VerticalTabItem } from "./types";

/**
 * Componente de abas verticais responsivo e moderno.
 * Suporta múltiplas variantes, animações e funcionalidades avançadas.
 */
export function VerticalTabs({
  items,
  defaultValue,
  value: controlledValue,
  variant = "default",
  size = "md",
  orientation = "vertical",
  className,
  showIndicator = true,
  withAnimation = true,
  showMobileSelect = true,
  tabsWidth = "auto",
  classNames = {},
  onValueChange,
}: VerticalTabsProps) {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? controlledValue ?? items[0]?.value ?? ""
  );

  // Determina se é controlado ou não controlado
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = React.useCallback((val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onValueChange?.(val);
  }, [isControlled, onValueChange]);

  // Encontra o item ativo
  const activeItem = items.find(item => item.value === value);

  // Animações para o conteúdo
  const contentAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }
  };

  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={handleChange}
      orientation={orientation === "horizontal" ? "horizontal" : "vertical"}
      className={cn(
        verticalTabsVariants({ variant, size, orientation }),
        classNames.root,
        className
      )}
    >
      {/* Lista de abas - Desktop */}
      <TabsPrimitive.List
        aria-label="Vertical tabs"
        className={cn(
          "hidden sm:flex",
          tabsListVariants({ variant, tabsWidth }),
          classNames.tabsList
        )}
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              tabsTriggerVariants({ variant, size }),
              classNames.tabsTrigger
            )}
          >
            <div className="flex items-center gap-2 w-full">
              {/* Ícone */}
              {item.icon && (
                <Icon 
                  name={item.icon} 
                  className={cn(
                    "-ms-0.5 opacity-60",
                    size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"
                  )} 
                />
              )}
              
              {/* Label */}
              <span className="flex-1 text-left">{item.label}</span>
              
              {/* Badge */}
              {item.badge && (
                <span className={cn(
                  "inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
                  size === "sm" ? "text-xs px-1.5 py-0.5 min-w-[18px] h-[18px]" : 
                  size === "lg" ? "text-sm px-2 py-0.5 min-w-[22px] h-[22px]" : 
                  "text-xs px-1.5 py-0.5 min-w-[20px] h-[20px]"
                )}>
                  {item.badge}
                </span>
              )}
            </div>
            
            {/* Indicador customizado para estilos especiais */}
            {showIndicator && variant === "spacious" && (
              <motion.div
                className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: value === item.value ? 1 : 0,
                  scaleY: value === item.value ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
              />
            )}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {/* Select para mobile */}
      {showMobileSelect && (
        <div className={cn(
          "relative text-muted-foreground sm:hidden mb-4",
          classNames.mobileSelect
        )}>
          <ChevronDown className="pointer-events-none w-4 h-4 absolute right-3 inset-y-0 my-auto" />
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(
              "py-2.5 px-3 pr-8 w-full bg-background appearance-none outline-none border border-border rounded-lg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors",
              size === "sm" && "py-2 text-xs",
              size === "lg" && "py-3 text-base"
            )}
          >
            {items.map((item) => (
              <option key={item.value} value={item.value} disabled={item.disabled}>
                {item.label} {item.badge && `(${item.badge})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Wrapper do conteúdo */}
      <div className={cn(
        tabsContentVariants({ variant: variant === "default" ? "default" : "plain" }),
        classNames.contentWrapper
      )}>
        <AnimatePresence mode="wait">
          {items.map((item) => (
            <TabsPrimitive.Content
              key={item.value}
              value={item.value}
              className={cn(
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                classNames.tabsContent
              )}
              forceMount={withAnimation ? true : undefined}
            >
              {withAnimation ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
                  style={{ display: value === item.value ? "block" : "none" }}
                >
                  {item.content}
                </motion.div>
              ) : (
                value === item.value && item.content
              )}
            </TabsPrimitive.Content>
          ))}
        </AnimatePresence>
      </div>
    </TabsPrimitive.Root>
  );
}

/**
 * Componente de item individual para construção manual
 */
export const VerticalTabTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    icon?: string;
    badge?: string | number;
    variant?: "default" | "compact" | "spacious";
    size?: "sm" | "md" | "lg";
  }
>(({ className, children, icon, badge, variant = "default", size = "md", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      tabsTriggerVariants({ variant, size }),
      className
    )}
    {...props}
  >
    <div className="flex items-center gap-2 w-full">
      {icon && (
        <Icon 
          name={icon as any} 
          className={cn(
            "-ms-0.5 opacity-60",
            size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"
          )} 
        />
      )}
      <span className="flex-1 text-left">{children}</span>
      {badge && (
        <span className={cn(
          "inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
          size === "sm" ? "text-xs px-1.5 py-0.5 min-w-[18px] h-[18px]" : 
          size === "lg" ? "text-sm px-2 py-0.5 min-w-[22px] h-[22px]" : 
          "text-xs px-1.5 py-0.5 min-w-[20px] h-[20px]"
        )}>
          {badge}
        </span>
      )}
    </div>
  </TabsPrimitive.Trigger>
));

VerticalTabTrigger.displayName = "VerticalTabTrigger";

/**
 * Componente de conteúdo individual
 */
export const VerticalTabContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    withAnimation?: boolean;
  }
>(({ className, children, withAnimation = true, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    {withAnimation ? (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
      >
        {children}
      </motion.div>
    ) : (
      children
    )}
  </TabsPrimitive.Content>
));

VerticalTabContent.displayName = "VerticalTabContent";