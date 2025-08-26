"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { textareaVariants } from "../variants";
import type { SimpleTextareaProps } from "../types";

const SimpleTextarea = React.forwardRef<HTMLTextAreaElement, SimpleTextareaProps>(
  (
    {
      className,
      label,
      showInfo = false,
      onInfoClick,
      maxLength,
      showCharCount = false,
      size,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState(props.value || "");

    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full space-y-2">
        {label && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </label>
            {showInfo && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                onClick={onInfoClick}
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="rounded-lg border border-input bg-background">
          <textarea
            className={cn(textareaVariants({ size }), className)}
            ref={ref}
            value={value}
            maxLength={maxLength}
            onChange={(e) => {
              setValue(e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          />

          {(showCharCount || maxLength) && (
            <div className="flex justify-end px-3 py-2 border-t border-input">
              <span
                className={cn(
                  "text-xs text-muted-foreground",
                  maxLength && charCount > maxLength && "text-destructive"
                )}
              >
                {charCount}
                {maxLength ? `/${maxLength}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SimpleTextarea.displayName = "SimpleTextarea";

export { SimpleTextarea };
