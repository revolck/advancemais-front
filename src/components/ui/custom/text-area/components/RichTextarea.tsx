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
import { Info, Bold, Italic, Strikethrough } from "lucide-react";
import { textareaVariants } from "../variants";
import type { RichTextareaProps } from "../types";

// Configuração simplificada sem undo/redo
const TOOLBAR_BUTTONS = [
  { icon: Bold, action: "bold" as const, tooltip: "Negrito (Ctrl+B)" },
  { icon: Italic, action: "italic" as const, tooltip: "Itálico (Ctrl+I)" },
  {
    icon: Strikethrough,
    action: "strikethrough" as const,
    tooltip: "Riscado (Ctrl+U)",
  },
];

type ToolbarAction = (typeof TOOLBAR_BUTTONS)[number]["action"];

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
      style,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState<string>(
      typeof props.value === "string" ? props.value : ""
    );
    const contentEditableRef = React.useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = React.useState<Set<string>>(
      new Set()
    );
    const [isFocused, setIsFocused] = React.useState(false);

    const charCount = value.length;

    // Estilos para prevenir redimensionamento do contentEditable
    const contentEditableStyles: React.CSSProperties = {
      resize: "none",
      minWidth: "100%",
      maxWidth: "100%",
      width: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      ...style,
    };

    const checkActiveFormats = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const formats = new Set<string>();

      // Verifica formatação ativa usando queryCommandState
      try {
        if (document.queryCommandState("bold")) {
          formats.add("bold");
        }
        if (document.queryCommandState("italic")) {
          formats.add("italic");
        }
        if (document.queryCommandState("strikeThrough")) {
          formats.add("strikethrough");
        }
      } catch (error) {
        // Fallback se queryCommandState não funcionar
        console.warn("queryCommandState não suportado:", error);
      }

      setActiveFormats(formats);
    };

    const toggleFormat = (format: ToolbarAction) => {
      // Garante que o contentEditable está focado
      if (contentEditableRef.current) {
        contentEditableRef.current.focus();
      }

      let selection = window.getSelection();
      if (!selection) return;

      // Se não há seleção ou seleção vazia, seleciona todo o conteúdo
      if (selection.rangeCount === 0 || selection.toString().trim() === "") {
        if (
          contentEditableRef.current &&
          contentEditableRef.current.textContent?.trim()
        ) {
          const range = document.createRange();
          range.selectNodeContents(contentEditableRef.current);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          return; // Sem conteúdo para formatar
        }
      }

      // Aplica a formatação usando execCommand
      try {
        let command: string;
        switch (format) {
          case "bold":
            command = "bold";
            break;
          case "italic":
            command = "italic";
            break;
          case "strikethrough":
            command = "strikeThrough";
            break;
          default:
            return;
        }

        // Aplica o comando
        const success = document.execCommand(command, false);

        if (success) {
          // Atualiza o valor após formatação
          const newValue = contentEditableRef.current?.textContent || "";
          setValue(newValue);
          props.onChange?.({
            target: { value: newValue },
          } as React.ChangeEvent<HTMLTextAreaElement>);

          // Verifica formatação ativa após aplicar
          setTimeout(checkActiveFormats, 10);
        }
      } catch (error) {
        console.warn("Erro ao aplicar formatação:", error);
      }
    };

    const handleToolbarAction = (action: ToolbarAction) => {
      switch (action) {
        case "bold":
        case "italic":
        case "strikethrough":
          toggleFormat(action);
          break;
      }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      const newValue = e.currentTarget.textContent || "";

      // Bloqueia se exceder maxLength
      if (maxLength && newValue.length > maxLength) {
        // Restaura o valor anterior
        e.currentTarget.textContent = value;
        return;
      }

      setValue(newValue);
      props.onChange?.({
        target: { value: newValue },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Atalhos de teclado para formatação
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            toggleFormat("bold");
            return;
          case "i":
            e.preventDefault();
            toggleFormat("italic");
            return;
          case "u":
            e.preventDefault();
            toggleFormat("strikethrough");
            return;
        }
      }

      // Bloqueia teclas que adicionam caracteres se já atingiu o limite
      if (maxLength && value.length >= maxLength) {
        const allowedKeys = [
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
          "Tab",
          "Escape",
        ];

        if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          return;
        }
      }

      // Handle Enter separately for line breaks
      if (e.key === "Enter") {
        // Se já está no limite, não permite nova linha
        if (maxLength && value.length >= maxLength) {
          e.preventDefault();
          return;
        }

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

          // Atualiza o valor após adicionar quebra de linha
          const newValue = contentEditableRef.current?.textContent || "";
          setValue(newValue);
          props.onChange?.({
            target: { value: newValue },
          } as React.ChangeEvent<HTMLTextAreaElement>);
        }
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      // Intercepta colar para respeitar maxLength
      if (maxLength) {
        e.preventDefault();
        const clipboardData = e.clipboardData?.getData("text/plain") || "";
        const currentValue = value || "";
        const availableChars = maxLength - currentValue.length;

        if (availableChars <= 0) return;

        const textToInsert = clipboardData.slice(0, availableChars);
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(textToInsert));
          range.collapse(false);

          const newValue = contentEditableRef.current?.textContent || "";
          setValue(newValue);
          props.onChange?.({
            target: { value: newValue },
          } as React.ChangeEvent<HTMLTextAreaElement>);
        }
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
                        activeFormats.has(button.action) &&
                          "bg-accent text-foreground"
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
            className={cn(
              textareaVariants({ size }),
              // Classes CSS adicionais para garantir travamento
              "rich-textarea-content !resize-none !min-w-full !max-w-full !w-full !overflow-y-auto !overflow-x-hidden",
              className
            )}
            style={contentEditableStyles}
            onInput={handleInput}
            onFocus={() => {
              setIsFocused(true);
              if (!value && contentEditableRef.current) {
                contentEditableRef.current.innerHTML = "";
              }
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
            onKeyDown={handleKeyDown}
            onClick={checkActiveFormats}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            onPaste={handlePaste}
            suppressContentEditableWarning
            data-placeholder={
              !value && !isFocused ? props.placeholder || "Digite aqui..." : ""
            }
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
