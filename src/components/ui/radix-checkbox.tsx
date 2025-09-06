"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
>;

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(
    (props as any)?.checked ?? (props as any)?.defaultChecked ?? false,
  );

  React.useEffect(() => {
    setIsChecked(
      (props as any)?.checked ?? (props as any)?.defaultChecked ?? false,
    );
  }, [(props as any)?.checked, (props as any)?.defaultChecked]);

  return (
    <CheckboxPrimitive.Root
      {...props}
      ref={ref as any}
      onCheckedChange={(checked) => {
        setIsChecked(!!checked);
        (props as any).onCheckedChange?.(checked);
      }}
      asChild
    >
      <motion.button
        className={cn(
          "peer size-5 flex items-center justify-center shrink-0 rounded-sm bg-muted transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--primary-color)] data-[state=checked]:text-white",
          className,
        )}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <CheckboxPrimitive.Indicator forceMount asChild>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            stroke="currentColor"
            className="size-3.5"
            initial="unchecked"
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
        </CheckboxPrimitive.Indicator>
      </motion.button>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = "RadixCheckbox";

export { Checkbox };
