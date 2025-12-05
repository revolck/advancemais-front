"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Checkbox totalmente controlado que NÃO usa Radix internamente.
 * Isso garante que o estado visual SEMPRE reflita a prop `checked` do pai,
 * sem nenhum estado interno que possa causar inconsistências.
 */
const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked = false,
      defaultChecked,
      onCheckedChange,
      disabled,
      ...rest
    },
    ref,
  ) => {
    // Para componente não-controlado, mantemos um estado interno
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked ?? false
    );

    // Determina se é controlado ou não
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;

        const newValue = !isChecked;

        // Se não for controlado, atualiza o estado interno
        if (!isControlled) {
          setInternalChecked(newValue);
        }

        // Sempre chama o callback se existir
        onCheckedChange?.(newValue);
      },
      [disabled, isChecked, isControlled, onCheckedChange]
    );

    return (
      <motion.button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "peer size-5 flex items-center justify-center shrink-0 rounded-sm bg-muted transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--primary-color)] data-[state=checked]:text-white",
          className
        )}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        whileHover={!disabled ? { scale: 1.05 } : undefined}
        {...(rest as any)}
      >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            stroke="currentColor"
            className="size-3.5"
          initial={false}
            animate={isChecked ? "checked" : "unchecked"}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              variants={{
                checked: {
                  pathLength: 1,
                  opacity: 1,
                  transition: { duration: 0.2, delay: 0.1 },
                },
                unchecked: {
                  pathLength: 0,
                  opacity: 0,
                  transition: { duration: 0.2 },
                },
              }}
            />
          </motion.svg>
      </motion.button>
    );
  }
);

Checkbox.displayName = "RadixCheckbox";

export { Checkbox };
