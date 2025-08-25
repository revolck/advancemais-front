"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Icon } from "../Icons";
import { 
  verticalTabsVariants, 
  tabsListVariants, 
  tabsTriggerVariants, 
  tabsContentVariants,
  tabsIndicatorVariants,
  tabsIconVariants,
  tabsMobileSelectVariants
} from "./variants";
import type { VerticalTabsProps, VerticalTabItem } from "./types";

/**
 * Componente VerticalTabs - Design Apple Minimalista
 * 
 * Design focado em:
 * - Clareza visual e hierarquia
 * - Estados intuitivos e sutis
 * - Transições suaves SEM movimento vertical
 * - Acessibilidade completa
 * - Responsividade elegante
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
  const flattenItems = React.useCallback(
    (list: VerticalTabItem[]): VerticalTabItem[] => {
      return list.flatMap((item) =>
        item.submenu && item.submenu.length
          ? flattenItems(item.submenu)
          : [item]
      );
    },
    []
  );

  const flatItems = React.useMemo(() => flattenItems(items), [items, flattenItems]);

  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? controlledValue ?? flatItems[0]?.value ?? ""
  );

  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  // Estado controlado vs não controlado
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = React.useCallback((val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onValueChange?.(val);
  }, [isControlled, onValueChange]);

  // Map variant to content variant
  const getContentVariant = (): "default" | "minimal" | "spacious" | "bordered" | "card" => {
    switch(variant) {
      case "minimal":
        return "minimal";
      case "spacious":
        return "spacious";
      default:
        return "default";
    }
  };

  const renderTriggers = (
    list: VerticalTabItem[],
    level = 0,
    parentId = ""
  ): React.ReactNode => {
    return list.map((item) => {
      const hasSubmenu = item.submenu && item.submenu.length > 0;
      const itemId = parentId ? `${parentId}-${item.value}` : item.value;

      if (hasSubmenu) {
        const isOpen = openSubmenus[itemId];
        return (
          <div key={itemId} className="w-full">
            <button
              type="button"
              onClick={() =>
                setOpenSubmenus((prev) => ({ ...prev, [itemId]: !isOpen }))
              }
              className={cn(
                tabsTriggerVariants({ variant, size }),
                "flex items-center justify-between",
                classNames.tabsTrigger
              )}
              style={level ? { marginLeft: level * 16 } : undefined}
            >
              <div className="flex items-center gap-3 w-full">
                {item.icon && (
                  <Icon
                    name={item.icon}
                    className={cn(tabsIconVariants({ variant, size }))}
                  />
                )}
                <span className="flex-1 truncate">{item.label}</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "pl-4 border-l border-gray-200",
                isOpen ? "mt-2" : "hidden"
              )}
            >
              {renderTriggers(item.submenu!, level + 1, itemId)}
            </div>
          </div>
        );
      }

      return (
        <TabsPrimitive.Trigger
          key={itemId}
          value={item.value}
          disabled={item.disabled}
          className={cn(
            tabsTriggerVariants({ variant, size }),
            classNames.tabsTrigger
          )}
          style={level ? { marginLeft: level * 16 } : undefined}
        >
          {showIndicator && (
            <motion.div
              className={cn(
                tabsIndicatorVariants({ variant, size }),
                classNames.indicator
              )}
              layout
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            />
          )}
          <div className="flex items-center gap-3 w-full relative z-10">
            {item.icon && (
              <Icon
                name={item.icon}
                className={cn(tabsIconVariants({ variant, size }))}
              />
            )}
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full font-medium",
                  "bg-gray-100 text-gray-600 transition-all duration-300",
                  "group-data-[state=active]:bg-blue-100 group-data-[state=active]:text-blue-700",
                  variant === "spacious" &&
                    "group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white"
                )}
              >
                {item.badge}
              </span>
            )}
          </div>
        </TabsPrimitive.Trigger>
      );
    });
  };

  React.useEffect(() => {
    const findPath = (
      list: VerticalTabItem[],
      target: string,
      path: string[] = []
    ): string[] | null => {
      for (const item of list) {
        const newPath = [...path, item.value];
        if (item.value === target) return newPath;
        if (item.submenu) {
          const result = findPath(item.submenu, target, newPath);
          if (result) return result;
        }
      }
      return null;
    };

    const path = findPath(items, value);
    if (path) {
      setOpenSubmenus((prev) => {
        const updated = { ...prev };
        let current = "";
        path.slice(0, -1).forEach((part) => {
          current = current ? `${current}-${part}` : part;
          updated[current] = true;
        });
        return updated;
      });
    }
  }, [value, items]);

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
      {/* Navigation Sidebar - Desktop */}
      <TabsPrimitive.List
        aria-label="Navigation tabs"
        className={cn(
          "hidden sm:flex",
          tabsListVariants({ variant, tabsWidth }),
          classNames.tabsList
        )}
      >
        {renderTriggers(items)}
      </TabsPrimitive.List>

      {/* Mobile Select Dropdown */}
      {showMobileSelect && (
        <div className={cn(
          "relative sm:hidden mb-6",
          classNames.mobileSelect
        )}>
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(
              tabsMobileSelectVariants({ size })
            )}
            aria-label="Select tab"
          >
            {flatItems.map((item) => (
              <option key={item.value} value={item.value} disabled={item.disabled}>
                {item.label} {item.badge && `(${item.badge})`}
              </option>
            ))}
          </select>
          
          {/* Chevron Icon */}
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      )}

      {/* Content Area - SEM ANIMAÇÃO VERTICAL */}
      <div className={cn(
        tabsContentVariants({ variant: getContentVariant(), padding: "md" }),
        classNames.contentWrapper
      )}>
        {flatItems.map((item) => (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            className={cn(
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-4",
              classNames.tabsContent
            )}
          >
            {withAnimation ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: value === item.value ? 1 : 0 }}
                transition={{
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1] as const
                }}
                className="h-full"
                style={{
                  display: value === item.value ? 'block' : 'none'
                }}
              >
                {item.content}
              </motion.div>
            ) : (
              <div
                className="h-full"
                style={{
                  display: value === item.value ? 'block' : 'none'
                }}
              >
                {item.content}
              </div>
            )}
          </TabsPrimitive.Content>
        ))}
      </div>
    </TabsPrimitive.Root>
  );
}

// Versão simplificada dos componentes individuais sem forwardRef
// para evitar problemas de tipagem complexos

/**
 * Componente Trigger individual simplificado
 */
export function VerticalTabTrigger({ 
  className, 
  variant = "default" as const, 
  size = "md" as const, 
  ...props 
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: "default" | "minimal" | "spacious";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        tabsTriggerVariants({ variant, size }),
        className
      )}
      {...props}
    />
  );
}

/**
 * Componente Content individual simplificado
 */
export function VerticalTabContent({ 
  className, 
  children, 
  withAnimation = true,
  ...props 
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  withAnimation?: boolean;
}) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-4",
        className
      )}
      {...props}
    >
      {withAnimation ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.2, 
            ease: [0.32, 0.72, 0, 1] as const
          }}
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </TabsPrimitive.Content>
  );
}