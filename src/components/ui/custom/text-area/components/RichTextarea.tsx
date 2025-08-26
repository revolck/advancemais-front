"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { textareaVariants } from "../variants";
import type { RichTextareaProps } from "../types";
import { TOOLBAR_BUTTONS, type ToolbarAction } from "../config";

const RichTextarea = React.forwardRef<HTMLTextAreaElement, RichTextareaProps>(
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
    const [history, setHistory] = React.useState<string[]>([(props.value as string) || ""]);
    const [historyIndex, setHistoryIndex] = React.useState(0);
    const contentEditableRef = React.useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());
    const [isFocused, setIsFocused] = React.useState(false);

    const charCount = typeof value === "string" ? value.length : 0;

    const checkActiveFormats = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element =
        container.nodeType === Node.TEXT_NODE
          ? (container.parentElement as Element)
          : (container as Element);

      const formats = new Set<string>();
      let currentElement: Element | null = element;

      while (currentElement && currentElement !== contentEditableRef.current) {
        if (currentElement.tagName === "STRONG" || currentElement.tagName === "B") {
          formats.add("bold");
        }
        if (currentElement.tagName === "EM" || currentElement.tagName === "I") {
          formats.add("italic");
        }
        if (currentElement.tagName === "S") {
          formats.add("strikethrough");
        }
        currentElement = currentElement.parentElement;
      }

      setActiveFormats(formats);
    };

    const toggleFormat = (format: ToolbarAction) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (!selectedText) {
        return;
      }

      const container = range.commonAncestorContainer;
      const element =
        container.nodeType === Node.TEXT_NODE
          ? (container.parentElement as Element)
          : (container as Element);

      let isFormatted = false;
      let targetElement: Element | null = element;

      while (targetElement && targetElement !== contentEditableRef.current) {
        const tagName = targetElement.tagName;
        if (
          (format === "bold" && (tagName === "STRONG" || tagName === "B")) ||
          (format === "italic" && (tagName === "EM" || tagName === "I")) ||
          (format === "strikethrough" && tagName === "S")
        ) {
          isFormatted = true;
          break;
        }
        targetElement = targetElement.parentElement;
      }

      if (isFormatted) {
        document.execCommand(
          format === "bold" ? "bold" : format === "italic" ? "italic" : "strikeThrough",
          false
        );
      } else {
        document.execCommand(
          format === "bold" ? "bold" : format === "italic" ? "italic" : "strikeThrough",
          false
        );
      }

      const newValue = contentEditableRef.current?.textContent || "";
      setValue(newValue);
      addToHistory(newValue);

      setTimeout(checkActiveFormats, 0);
    };

    const addToHistory = (newValue: string) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newValue);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };

    const handleToolbarAction = (action: ToolbarAction) => {
      switch (action) {
        case "bold":
        case "italic":
        case "strikethrough":
          toggleFormat(action);
          break;
        case "undo":
          if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setValue(history[historyIndex - 1]);
            if (contentEditableRef.current) {
              contentEditableRef.current.innerHTML = history[historyIndex - 1];
            }
          }
          break;
        case "redo":
          if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setValue(history[historyIndex + 1]);
            if (contentEditableRef.current) {
              contentEditableRef.current.innerHTML = history[historyIndex + 1];
            }
          }
          break;
      }
    };

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
          <TooltipProvider>
            <div className="flex items-center gap-1 border-b border-input p-2">
              {TOOLBAR_BUTTONS.map((button) => (
                <Tooltip key={button.action}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent",
                        activeFormats.has(button.action) && "bg-accent text-foreground"
                      )}
                      onClick={() => handleToolbarAction(button.action)}
                    >
                      <button.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{button.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>

          <div
            ref={contentEditableRef}
            contentEditable
            className={cn(textareaVariants({ size }), className)}
            onInput={(e) => {
              const newValue = e.currentTarget.textContent || "";
              setValue(newValue);
              props.onChange?.({
                target: { value: newValue },
              } as React.ChangeEvent<HTMLTextAreaElement>);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (!value && contentEditableRef.current) {
                contentEditableRef.current.innerHTML = "";
              }
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);

                  e.preventDefault();
                  const br = document.createElement("br");
                  range.insertNode(br);
                  range.setStartAfter(br);
                  range.setEndAfter(br);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }}
            onClick={checkActiveFormats}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            suppressContentEditableWarning
            style={{ whiteSpace: "pre-wrap" }}
            data-placeholder={!value && !isFocused ? props.placeholder || "Your description..." : ""}
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

RichTextarea.displayName = "RichTextarea";

export { RichTextarea };
