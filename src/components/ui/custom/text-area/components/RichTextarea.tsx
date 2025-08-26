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
import {
  Info,
  Bold,
  Italic,
  Strikethrough,
  RemoveFormatting,
} from "lucide-react";
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

type ToolbarAction = (typeof TOOLBAR_BUTTONS)[number]["action"] | "clear";

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

    // Função melhorada para verificar se um nó tem determinada formatação
    const hasFormatTag = (node: Node | null, tagName: string): boolean => {
      if (!node || !contentEditableRef.current) return false;

      // Navega pelos pais até o contentEditable root
      let currentNode: Node | null = node;
      while (currentNode && currentNode !== contentEditableRef.current) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode as HTMLElement;
          if (element.tagName.toLowerCase() === tagName.toLowerCase()) {
            return true;
          }
        }
        currentNode = currentNode.parentNode;
      }

      return false;
    };

    // Função para obter todas as formatações ativas em um nó
    const getAllActiveFormats = (node: Node | null): Set<string> => {
      const formats = new Set<string>();
      if (!node || !contentEditableRef.current) return formats;

      let currentNode: Node | null = node;
      while (currentNode && currentNode !== contentEditableRef.current) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          // Mapeia tags HTML para actions
          const actionMap: Record<string, string> = {
            strong: "bold",
            em: "italic",
            del: "strikethrough",
          };

          if (actionMap[tagName]) {
            formats.add(actionMap[tagName]);
          }
        }
        currentNode = currentNode.parentNode;
      }

      return formats;
    };

    // Função para verificar formatos ativos na posição do cursor
    const checkActiveFormats = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setActiveFormats(new Set());
        return;
      }

      const range = selection.getRangeAt(0);

      // Se há texto selecionado, verifica formatação em ambos os pontos
      if (!range.collapsed) {
        const startFormats = getAllActiveFormats(range.startContainer);
        const endFormats = getAllActiveFormats(range.endContainer);

        // Só considera ativo se está presente em todo o range
        const commonFormats = new Set<string>();
        startFormats.forEach((format) => {
          if (endFormats.has(format)) {
            commonFormats.add(format);
          }
        });

        setActiveFormats(commonFormats);
      } else {
        // Cursor único - verifica formatações no ponto atual
        setActiveFormats(getAllActiveFormats(range.startContainer));
      }
    };

    // Função para remover TODAS as formatações de um range
    const clearAllFormatting = (range: Range) => {
      try {
        if (range.toString().trim() === "") return;

        const contents = range.extractContents();
        const textContent = contents.textContent || "";

        // Insere apenas o texto sem formatação
        range.insertNode(document.createTextNode(textContent));

        // Reposiciona cursor
        range.collapse(false);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        console.warn("Erro ao limpar formatações:", error);
      }
    };

    // Função melhorada para aplicar formatação
    const applyFormatToRange = (range: Range, tagName: string) => {
      try {
        if (range.toString().trim() === "") return;

        const formatElement = document.createElement(tagName);
        const contents = range.extractContents();

        formatElement.appendChild(contents);
        range.insertNode(formatElement);

        // Seleciona o conteúdo formatado
        range.selectNodeContents(formatElement);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        console.warn(`Erro ao aplicar formatação ${tagName}:`, error);
      }
    };

    // Função melhorada para remover formatação específica
    const removeFormatFromRange = (range: Range, tagName: string) => {
      try {
        const selectedText = range.toString();
        if (!selectedText.trim()) return;

        // Encontra todos os elementos com a tag específica na seleção
        const treeWalker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (node) => {
              const element = node as HTMLElement;
              if (element.tagName.toLowerCase() === tagName.toLowerCase()) {
                // Verifica se o elemento intersecta com o range
                const elementRange = document.createRange();
                elementRange.selectNodeContents(element);

                if (range.intersectsNode(element)) {
                  return NodeFilter.FILTER_ACCEPT;
                }
              }
              return NodeFilter.FILTER_REJECT;
            },
          }
        );

        const elementsToUnwrap: HTMLElement[] = [];
        let node = treeWalker.nextNode();
        while (node) {
          elementsToUnwrap.push(node as HTMLElement);
          node = treeWalker.nextNode();
        }

        // Remove as tags encontradas
        elementsToUnwrap.forEach((element) => {
          const parent = element.parentNode;
          if (parent) {
            while (element.firstChild) {
              parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
          }
        });

        // Se nada foi encontrado via TreeWalker, tenta a abordagem manual
        if (elementsToUnwrap.length === 0) {
          const commonAncestor = range.commonAncestorContainer;
          let currentNode: Node | null = commonAncestor;

          // Procura elementos de formatação nos pais
          while (currentNode && currentNode !== contentEditableRef.current) {
            if (currentNode.nodeType === Node.ELEMENT_NODE) {
              const element = currentNode as HTMLElement;
              if (element.tagName.toLowerCase() === tagName.toLowerCase()) {
                const parent = element.parentNode;
                if (parent) {
                  while (element.firstChild) {
                    parent.insertBefore(element.firstChild, element);
                  }
                  parent.removeChild(element);
                  break;
                }
              }
            }
            currentNode = currentNode.parentNode;
          }
        }
      } catch (error) {
        console.warn(`Erro ao remover formatação ${tagName}:`, error);
      }
    };

    // Função principal para toggle de formatação
    const toggleFormat = (format: ToolbarAction) => {
      if (!contentEditableRef.current) return;

      contentEditableRef.current.focus();
      const selection = window.getSelection();
      if (!selection) return;

      // Clear formatting é caso especial
      if (format === "clear") {
        handleClearFormatting();
        return;
      }

      const button = TOOLBAR_BUTTONS.find((b) => b.action === format);
      if (!button) return;

      // Se não há seleção, seleciona todo o conteúdo se existir
      if (selection.rangeCount === 0 || selection.toString().trim() === "") {
        if (contentEditableRef.current.textContent?.trim()) {
          const range = document.createRange();
          range.selectNodeContents(contentEditableRef.current);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          return;
        }
      }

      const range = selection.getRangeAt(0);
      if (range.toString().trim() === "") return;

      // Verifica se já está formatado
      const isAlreadyFormatted =
        hasFormatTag(range.startContainer, button.tag) &&
        hasFormatTag(range.endContainer, button.tag);

      if (isAlreadyFormatted) {
        removeFormatFromRange(range, button.tag);
      } else {
        applyFormatToRange(range, button.tag);
      }

      updateValues();
      setTimeout(checkActiveFormats, 10);
    };

    // Nova função para limpar TODAS as formatações
    const handleClearFormatting = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      let range = selection.getRangeAt(0);

      // Se não há seleção, seleciona todo o conteúdo
      if (range.toString().trim() === "") {
        if (contentEditableRef.current?.textContent?.trim()) {
          range = document.createRange();
          range.selectNodeContents(contentEditableRef.current);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          return;
        }
      }

      clearAllFormatting(range);
      updateValues();
      setTimeout(checkActiveFormats, 10);
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
        e.currentTarget.innerHTML = htmlValue;
        return;
      }

      updateValues();

      // Atualiza formatos ativos após input
      setTimeout(checkActiveFormats, 10);
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
          case "\\": // Ctrl+\ para limpar formatação
            e.preventDefault();
            toggleFormat("clear");
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
          setTimeout(checkActiveFormats, 10);
        }
      }
    };

    // Event handlers para detectar mudanças na seleção
    const handleSelectionChange = () => {
      // Só executa se o elemento está focado
      if (isFocused) {
        setTimeout(checkActiveFormats, 10);
      }
    };

    // Effect para escutar mudanças de seleção globais
    React.useEffect(() => {
      document.addEventListener("selectionchange", handleSelectionChange);
      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange);
      };
    }, [isFocused]);

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

              {/* Botão para limpar formatação */}
              <div className="h-4 border-l border-input mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => handleToolbarAction("clear")}
                    type="button"
                  >
                    <RemoveFormatting className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Limpar Formatação (Ctrl+\)</p>
                </TooltipContent>
              </Tooltip>
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
            {...(props as any)}
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
