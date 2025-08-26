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

// Configuração da toolbar
const TOOLBAR_BUTTONS = [
  {
    icon: Bold,
    action: "bold" as const,
    tooltip: "Negrito (Ctrl+B)",
    tag: "strong",
  },
  {
    icon: Italic,
    action: "italic" as const,
    tooltip: "Itálico (Ctrl+I)",
    tag: "em",
  },
  {
    icon: Strikethrough,
    action: "strikethrough" as const,
    tooltip: "Riscado (Ctrl+U)",
    tag: "del",
  },
];

type ToolbarAction = (typeof TOOLBAR_BUTTONS)[number]["action"];

// Interface corrigida para usar HTMLDivElement ao invés de HTMLTextAreaElement
const RichTextarea = React.forwardRef<HTMLDivElement, RichTextareaProps>(
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
    const [htmlValue, setHtmlValue] = React.useState<string>("");
    const [plainTextValue, setPlainTextValue] = React.useState<string>(
      typeof props.value === "string" ? props.value : ""
    );
    const contentEditableRef = React.useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = React.useState<Set<string>>(
      new Set()
    );
    const [isFocused, setIsFocused] = React.useState(false);

    const charCount = plainTextValue.length;

    // Sincronização com props.value
    React.useEffect(() => {
      if (props.value !== undefined && props.value !== plainTextValue) {
        const newValue = typeof props.value === "string" ? props.value : "";
        setPlainTextValue(newValue);
        if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = newValue;
        }
      }
    }, [props.value, plainTextValue]);

    // Estilos para o contentEditable
    const contentEditableStyles: React.CSSProperties = {
      resize: "none",
      minWidth: "100%",
      maxWidth: "100%",
      width: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      outline: "none",
      ...style,
    };

    // Função para extrair texto sem formatação
    const getPlainText = (element: HTMLElement): string => {
      return element.textContent || "";
    };

    // Função para verificar se um nó ou seus pais têm determinada tag
    const hasFormatTag = (node: Node | null, tagName: string): boolean => {
      if (!node) return false;

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.tagName.toLowerCase() === tagName.toLowerCase()) {
          return true;
        }
      }

      // Verifica os pais até encontrar o contentEditable
      const parent = node.parentNode;
      if (parent && parent !== contentEditableRef.current) {
        return hasFormatTag(parent, tagName);
      }

      return false;
    };

    // Função para verificar formatos ativos na posição do cursor
    const checkActiveFormats = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setActiveFormats(new Set());
        return;
      }

      const range = selection.getRangeAt(0);
      const formats = new Set<string>();

      // Verifica se o cursor está dentro de tags de formatação
      TOOLBAR_BUTTONS.forEach((button) => {
        if (hasFormatTag(range.startContainer, button.tag)) {
          formats.add(button.action);
        }
      });

      setActiveFormats(formats);
    };

    // Função moderna para aplicar formatação usando ranges
    const toggleFormat = (format: ToolbarAction) => {
      if (!contentEditableRef.current) return;

      contentEditableRef.current.focus();

      const selection = window.getSelection();
      if (!selection) return;

      const button = TOOLBAR_BUTTONS.find((b) => b.action === format);
      if (!button) return;

      // Se não há seleção, tenta selecionar a palavra atual ou todo o conteúdo
      if (selection.rangeCount === 0 || selection.toString().trim() === "") {
        if (contentEditableRef.current.textContent?.trim()) {
          // Seleciona todo o conteúdo
          const range = document.createRange();
          range.selectNodeContents(contentEditableRef.current);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          return; // Sem conteúdo para formatar
        }
      }

      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (selectedText.trim() === "") return;

      // Verifica se já está formatado
      const isAlreadyFormatted = hasFormatTag(range.startContainer, button.tag);

      if (isAlreadyFormatted) {
        // Remove a formatação
        removeFormatFromRange(range, button.tag);
      } else {
        // Adiciona a formatação
        applyFormatToRange(range, button.tag);
      }

      // Atualiza os valores
      updateValues();

      // Verifica formatos ativos após mudança
      setTimeout(checkActiveFormats, 10);
    };

    // Função para aplicar formatação a um range
    const applyFormatToRange = (range: Range, tagName: string) => {
      try {
        const formatElement = document.createElement(tagName);

        // Se o range está vazio ou só tem whitespace, não aplica formatação
        if (range.toString().trim() === "") return;

        // Extrai o conteúdo do range
        const contents = range.extractContents();

        // Coloca o conteúdo dentro do elemento de formatação
        formatElement.appendChild(contents);

        // Insere o elemento formatado no range
        range.insertNode(formatElement);

        // Reposiciona o cursor após o elemento inserido
        range.setStartAfter(formatElement);
        range.setEndAfter(formatElement);
        range.collapse(true);

        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        console.warn(`Erro ao aplicar formatação ${tagName}:`, error);
      }
    };

    // Função para remover formatação de um range
    const removeFormatFromRange = (range: Range, tagName: string) => {
      try {
        // Encontra o elemento pai com a tag
        let formatElement: HTMLElement | null = null;
        let node: Node | null = range.startContainer;

        while (node && node !== contentEditableRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName.toLowerCase() === tagName.toLowerCase()) {
              formatElement = element;
              break;
            }
          }
          node = node.parentNode;
        }

        if (formatElement) {
          // Remove o elemento de formatação, mantendo o conteúdo
          const parent = formatElement.parentNode;
          if (parent) {
            // Move todos os nós filhos para antes do elemento de formatação
            while (formatElement.firstChild) {
              parent.insertBefore(formatElement.firstChild, formatElement);
            }
            // Remove o elemento de formatação vazio
            parent.removeChild(formatElement);
          }
        }
      } catch (error) {
        console.warn(`Erro ao remover formatação ${tagName}:`, error);
      }
    };

    // Função para atualizar os valores internos
    const updateValues = () => {
      if (!contentEditableRef.current) return;

      const plainText = getPlainText(contentEditableRef.current);
      const htmlContent = contentEditableRef.current.innerHTML;

      setPlainTextValue(plainText);
      setHtmlValue(htmlContent);

      // Chama onChange com o texto plano
      props.onChange?.({
        target: { value: plainText },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    const handleToolbarAction = (action: ToolbarAction) => {
      toggleFormat(action);
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      const currentPlainText = getPlainText(e.currentTarget);

      // Verifica limite de caracteres
      if (maxLength && currentPlainText.length > maxLength) {
        // Restaura o valor anterior
        e.currentTarget.innerHTML = htmlValue;
        return;
      }

      updateValues();
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

      // Bloqueia teclas se já atingiu o limite
      if (maxLength && plainTextValue.length >= maxLength) {
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
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      // Intercepta colar para respeitar maxLength
      if (maxLength) {
        e.preventDefault();
        const clipboardData = e.clipboardData?.getData("text/plain") || "";
        const currentValue = plainTextValue || "";
        const availableChars = maxLength - currentValue.length;

        if (availableChars <= 0) return;

        const textToInsert = clipboardData.slice(0, availableChars);
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(textToInsert));
          range.collapse(false);

          updateValues();
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
                        "h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                        activeFormats.has(button.action) &&
                          "bg-accent text-foreground"
                      )}
                      onClick={() => handleToolbarAction(button.action)}
                      type="button"
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
            ref={ref || contentEditableRef}
            contentEditable
            className={cn(
              textareaVariants({ size }),
              "rich-textarea-content !resize-none !min-w-full !max-w-full !w-full !overflow-y-auto !overflow-x-hidden",
              "focus:outline-none focus-visible:outline-none",
              className
            )}
            style={contentEditableStyles}
            onInput={handleInput}
            onFocus={() => {
              setIsFocused(true);
              setTimeout(checkActiveFormats, 10);
            }}
            onBlur={() => {
              setIsFocused(false);
              setActiveFormats(new Set());
            }}
            onKeyDown={handleKeyDown}
            onClick={checkActiveFormats}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            onSelect={checkActiveFormats}
            onPaste={handlePaste}
            suppressContentEditableWarning
            data-placeholder={
              !plainTextValue && !isFocused
                ? props.placeholder || "Digite algo..."
                : undefined
            }
            role="textbox"
            aria-label={label || "Rich text editor"}
            aria-multiline="true"
            {...(props as any)} // Cast necessário devido à diferença de tipos
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
