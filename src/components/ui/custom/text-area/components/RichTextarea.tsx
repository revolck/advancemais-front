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
import { LinkModal } from "./LinkModal";
import {
  RichTextareaToolbar,
  type HeadingType,
  type ToolbarAction,
} from "./RichTextareaToolbar";
import { textareaVariants } from "../variants";
import type { RichTextareaProps } from "../types";
import { toastCustom } from "@/components/ui/custom/toast";

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
      onHtmlChange,
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
    const [activeHeading, setActiveHeading] =
      React.useState<HeadingType | null>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const [contentHeight, setContentHeight] = React.useState<number>(250); // Altura inicial
    const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
    const [linkUrl, setLinkUrl] = React.useState("");
    const [selectedTextForLink, setSelectedTextForLink] = React.useState("");
    const [savedRange, setSavedRange] = React.useState<Range | null>(null);
    const [activeLink, setActiveLink] = React.useState<{
      url: string;
      element: HTMLAnchorElement;
    } | null>(null);

    const charCount = plainTextValue.length;

    // Constantes de altura
    const MIN_HEIGHT = 250;
    const MAX_HEIGHT = 1000;

    // Função para ajustar altura automaticamente baseada no conteúdo
    const adjustHeight = React.useCallback(() => {
      if (!contentEditableRef.current) return;

      // Reseta altura temporariamente para obter scrollHeight correto
      contentEditableRef.current.style.height = "auto";

      // Obtém a altura do conteúdo
      const scrollHeight = contentEditableRef.current.scrollHeight;

      // Calcula a altura final

      // Calcula a altura final
      const newHeight = Math.max(
        MIN_HEIGHT,
        Math.min(scrollHeight, MAX_HEIGHT)
      );

      // Aplica a nova altura
      contentEditableRef.current.style.height = `${newHeight}px`;
      setContentHeight(newHeight);
    }, []);

    // Sincronização com props.value
    React.useEffect(() => {
      if (props.value !== undefined && props.value !== plainTextValue) {
        const newValue = typeof props.value === "string" ? props.value : "";
        setPlainTextValue(newValue);
        if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = newValue;
          // Ajusta altura após atualizar conteúdo
          setTimeout(() => {
            adjustHeight();
          }, 0);
        }
      }
    }, [props.value, plainTextValue, adjustHeight]);

    // Ajusta altura quando o conteúdo muda
    React.useEffect(() => {
      adjustHeight();
    }, [plainTextValue, adjustHeight]);

    // Estilos para o contentEditable
    const contentEditableStyles: React.CSSProperties = {
      resize: "none",
      minWidth: "100%",
      maxWidth: "100%",
      width: "100%",
      overflowY: contentHeight >= MAX_HEIGHT ? "auto" : "hidden", // Só mostra scroll se atingir altura máxima
      overflowX: "hidden",
      whiteSpace: "pre-wrap", // Permite quebras de linha e espaços
      wordWrap: "break-word",
      outline: "none",
      minHeight: `${MIN_HEIGHT}px`,
      height: `${contentHeight}px`, // Altura dinâmica
      padding: "0.5rem 0.75rem", // Padding interno para melhor UX
      lineHeight: "1.5", // Altura de linha confortável
      transition: "height 0.1s ease-out", // Transição suave
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

    // Função para obter o heading ativo em um nó
    const getActiveHeading = (node: Node | null): HeadingType | null => {
      if (!node || !contentEditableRef.current) return null;

      let currentNode: Node | null = node;
      while (currentNode && currentNode !== contentEditableRef.current) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          // Verifica se é um heading válido
          if (["h1", "h2", "h3", "h4", "h5", "h6", "p"].includes(tagName)) {
            return tagName as HeadingType;
          }
        }
        currentNode = currentNode.parentNode;
      }

      return null;
    };

    // Função para obter o link ativo em um nó
    const getActiveLink = (node: Node | null): HTMLAnchorElement | null => {
      if (!node || !contentEditableRef.current) return null;

      let currentNode: Node | null = node;
      while (currentNode && currentNode !== contentEditableRef.current) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode as HTMLElement;
          if (element.tagName.toLowerCase() === "a") {
            return element as HTMLAnchorElement;
          }
        }
        currentNode = currentNode.parentNode;
      }

      return null;
    };

    // Função para verificar formatos ativos na posição do cursor
    // IMPORTANTE: Esta função NUNCA modifica a seleção, apenas lê
    const checkActiveFormats = React.useCallback(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setActiveFormats(new Set());
        setActiveHeading(null);
        return;
      }

      // Clona o range para não modificar a seleção original
      const range = selection.getRangeAt(0).cloneRange();

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

        // Para heading, verifica se ambos os pontos têm o mesmo heading
        const startHeading = getActiveHeading(range.startContainer);
        const endHeading = getActiveHeading(range.endContainer);
        setActiveHeading(startHeading === endHeading ? startHeading : null);

        // Para link, verifica se ambos os pontos estão no mesmo link
        const startLink = getActiveLink(range.startContainer);
        const endLink = getActiveLink(range.endContainer);
        if (startLink && endLink && startLink === endLink) {
          setActiveLink({ url: startLink.href, element: startLink });
        } else {
          setActiveLink(null);
        }
      } else {
        // Cursor único - verifica formatações no ponto atual
        setActiveFormats(getAllActiveFormats(range.startContainer));
        setActiveHeading(getActiveHeading(range.startContainer));

        const link = getActiveLink(range.startContainer);
        if (link) {
          setActiveLink({ url: link.href, element: link });
        } else {
          setActiveLink(null);
        }
      }
    }, []);

    // Função auxiliar para restaurar cursor no final do conteúdo
    const restoreCursorToEnd = () => {
      const selection = window.getSelection();
      if (selection && contentEditableRef.current) {
        const newRange = document.createRange();
        newRange.selectNodeContents(contentEditableRef.current);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
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
        } else {
          restoreCursorToEnd();
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

        // Restaura o cursor na posição final do texto formatado (dentro do elemento)
        const selection = window.getSelection();
        if (selection && formatElement.lastChild) {
          const newRange = document.createRange();

          // Coloca o cursor no final do último nó de texto dentro do elemento formatado
          if (formatElement.lastChild.nodeType === Node.TEXT_NODE) {
            const textNode = formatElement.lastChild as Text;
            const textLength = textNode.textContent?.length || 0;
            newRange.setStart(textNode, textLength);
            newRange.collapse(true);
          } else {
            // Se o último filho não é texto, procura o último nó de texto recursivamente
            let lastTextNode: Node | null = formatElement.lastChild;
            while (lastTextNode && lastTextNode.nodeType !== Node.TEXT_NODE) {
              if (lastTextNode.lastChild) {
                lastTextNode = lastTextNode.lastChild;
              } else {
                break;
              }
            }

            if (lastTextNode && lastTextNode.nodeType === Node.TEXT_NODE) {
              const textNode = lastTextNode as Text;
              const textLength = textNode.textContent?.length || 0;
              newRange.setStart(textNode, textLength);
              newRange.collapse(true);
            } else {
              // Fallback: coloca após o elemento formatado
              newRange.setStartAfter(formatElement);
              newRange.collapse(true);
            }
          }

          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (error) {
        console.warn(`Erro ao aplicar formatação ${tagName}:`, error);
      }
    };

    // Função melhorada para remover formatação específica
    const removeFormatFromRange = (range: Range, tagName: string) => {
      try {
        if (range.toString().trim() === "") return;

        // Salva a posição final antes de remover
        const endContainer = range.endContainer;
        const endOffset = range.endOffset;

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

        // Restaura o cursor na posição final
        const selection = window.getSelection();
        if (selection) {
          try {
            const newRange = document.createRange();
            // Tenta restaurar na posição final
            if (endContainer && endContainer.nodeType === Node.TEXT_NODE) {
              const maxOffset = endContainer.textContent?.length || 0;
              newRange.setStart(endContainer, Math.min(endOffset, maxOffset));
              newRange.collapse(true);
            } else {
              // Se não conseguir, coloca no final do conteúdo
              restoreCursorToEnd();
              return;
            }
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            // Fallback: coloca no final
            restoreCursorToEnd();
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

      // Link é caso especial - abre o dialog
      if (format === "link") {
        handleLinkAction();
        return;
      }

      // Mapeamento de ações para tags HTML
      const actionToTagMap: Record<string, string> = {
        bold: "strong",
        italic: "em",
        strikethrough: "del",
      };

      const tagName = actionToTagMap[format];
      if (!tagName) return;

      // Obtém o range atual ou cria um no cursor
      let range: Range;
      if (selection.rangeCount === 0) {
        // Se não há range, cria um no final do conteúdo
        range = document.createRange();
        if (contentEditableRef.current.lastChild) {
          range.setStartAfter(contentEditableRef.current.lastChild);
          range.collapse(true);
        } else {
          range.selectNodeContents(contentEditableRef.current);
          range.collapse(false);
        }
      } else {
        range = selection.getRangeAt(0);
      }

      const selectedText = range.toString().trim();

      // Se há texto selecionado, aplica/remove formatação
      if (selectedText !== "") {
        // Verifica se já está formatado
        const isAlreadyFormatted =
          hasFormatTag(range.startContainer, tagName) &&
          hasFormatTag(range.endContainer, tagName);

        if (isAlreadyFormatted) {
          removeFormatFromRange(range, tagName);
        } else {
          applyFormatToRange(range, tagName);
        }
      }
      // Se não há seleção, não faz nada - o usuário pode continuar digitando normalmente

      updateValues();

      // Ajusta altura após formatação
      setTimeout(() => {
        adjustHeight();
      }, 0);

      setTimeout(checkActiveFormats, 10);

      // Garante que o foco permanece no editor
      setTimeout(() => {
        contentEditableRef.current?.focus();
      }, 0);
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

      // Ajusta altura após limpar formatação
      setTimeout(() => {
        adjustHeight();
      }, 0);

      setTimeout(checkActiveFormats, 10);
    };

    // Função para atualizar os valores internos
    const updateValues = () => {
      if (!contentEditableRef.current) return;

      const plainText = getPlainText(contentEditableRef.current);
      const htmlContent = contentEditableRef.current.innerHTML;

      setPlainTextValue(plainText);
      setHtmlValue(htmlContent);

      // Chama onChange com o texto plano (para compatibilidade)
      props.onChange?.({
        target: { value: plainText },
      } as React.ChangeEvent<HTMLTextAreaElement>);

      // Chama onHtmlChange com o HTML formatado (se fornecido)
      onHtmlChange?.(htmlContent);
    };

    const handleToolbarAction = (action: ToolbarAction) => {
      toggleFormat(action);
    };

    // Função para aplicar heading
    const applyHeading = (headingType: HeadingType) => {
      if (!contentEditableRef.current) return;

      contentEditableRef.current.focus();
      const selection = window.getSelection();
      if (!selection) return;

      // Obtém o range atual ou cria um no cursor
      let range: Range;
      if (selection.rangeCount === 0) {
        range = document.createRange();
        if (contentEditableRef.current.lastChild) {
          range.setStartAfter(contentEditableRef.current.lastChild);
          range.collapse(true);
        } else {
          range.selectNodeContents(contentEditableRef.current);
          range.collapse(false);
        }
      } else {
        range = selection.getRangeAt(0);
      }

      try {
        // Encontra o elemento pai que é um heading ou parágrafo
        let currentNode: Node | null = range.startContainer;
        let headingElement: HTMLElement | null = null;

        while (currentNode && currentNode !== contentEditableRef.current) {
          if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const element = currentNode as HTMLElement;
            const tagName = element.tagName.toLowerCase();
            if (["h1", "h2", "h3", "h4", "h5", "h6", "p"].includes(tagName)) {
              headingElement = element;
              break;
            }
          }
          currentNode = currentNode.parentNode;
        }

        if (headingElement) {
          // Se já existe um heading/parágrafo, substitui
          const textContent = headingElement.textContent || "";

          // Se o tipo é o mesmo, não faz nada
          if (headingElement.tagName.toLowerCase() === headingType) {
            return;
          }

          const newElement = document.createElement(headingType);

          // Se há seleção, usa apenas o texto selecionado
          if (!range.collapsed) {
            const selectedText = range.toString();
            newElement.textContent = selectedText;

            // Remove o elemento antigo e insere o novo
            headingElement.parentNode?.replaceChild(newElement, headingElement);
          } else {
            // Usa todo o conteúdo do elemento
            newElement.textContent = textContent || "\u00A0";
            headingElement.parentNode?.replaceChild(newElement, headingElement);
          }

          // Restaura cursor no final do novo elemento
          const newRange = document.createRange();
          newRange.selectNodeContents(newElement);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          // Não há heading/parágrafo pai - cria um novo
          if (!range.collapsed) {
            // Há seleção - envolve o texto selecionado
            const selectedText = range.toString();
            const newElement = document.createElement(headingType);
            newElement.textContent = selectedText;
            range.deleteContents();
            range.insertNode(newElement);

            // Restaura cursor no final
            const newRange = document.createRange();
            newRange.selectNodeContents(newElement);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } else {
            // Cria um novo elemento vazio
            const newElement = document.createElement(headingType);
            newElement.textContent = "\u00A0"; // Non-breaking space

            // Insere após o nó atual ou no final
            if (range.startContainer.nodeType === Node.TEXT_NODE) {
              const textNode = range.startContainer as Text;
              const parent = textNode.parentNode;
              if (parent) {
                parent.insertBefore(newElement, textNode.nextSibling);
              } else {
                contentEditableRef.current.appendChild(newElement);
              }
            } else {
              contentEditableRef.current.appendChild(newElement);
            }

            // Move cursor para dentro do novo elemento
            const newRange = document.createRange();
            newRange.selectNodeContents(newElement);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }

        updateValues();
        setTimeout(() => {
          adjustHeight();
          checkActiveFormats();
        }, 0);
      } catch (error) {
        console.warn(`Erro ao aplicar heading ${headingType}:`, error);
      }
    };

    const handleHeadingChange = (value: string) => {
      applyHeading(value as HeadingType);
    };

    // Função para lidar com ação de link
    const handleLinkAction = () => {
      if (!contentEditableRef.current) return;

      const selection = window.getSelection();
      if (!selection) return;

      let range: Range;
      if (selection.rangeCount === 0) {
        // Se não há range, cria um no cursor
        range = document.createRange();
        if (contentEditableRef.current.lastChild) {
          range.setStartAfter(contentEditableRef.current.lastChild);
          range.collapse(true);
        } else {
          range.selectNodeContents(contentEditableRef.current);
          range.collapse(false);
        }
      } else {
        range = selection.getRangeAt(0);
      }

      const selectedText = range.toString().trim();

      // Se há um link ativo, permite editar ou remover
      const link = getActiveLink(range.startContainer);
      if (link) {
        setLinkUrl(link.href);
        setSelectedTextForLink(link.textContent || "");
        setActiveLink({ url: link.href, element: link });
        setSavedRange(null); // Não precisa salvar range para edição
      } else {
        // Salva o texto selecionado e o range para usar depois
        setSelectedTextForLink(selectedText);
        setLinkUrl("");
        setActiveLink(null);
        // Salva o range clonado para restaurar depois
        if (selectedText && !range.collapsed) {
          setSavedRange(range.cloneRange());
        } else {
          setSavedRange(null);
        }
      }

      setIsLinkDialogOpen(true);
    };

    // Função para aplicar link
    const applyLink = (url: string) => {
      if (!contentEditableRef.current || !url.trim()) return;

      // Garante que a URL tenha protocolo
      let finalUrl = url.trim();
      if (!finalUrl.match(/^https?:\/\//i)) {
        finalUrl = `https://${finalUrl}`;
      }

      contentEditableRef.current.focus();
      const selection = window.getSelection();
      if (!selection) return;

      let range: Range;
      if (selection.rangeCount === 0) {
        range = document.createRange();
        if (contentEditableRef.current.lastChild) {
          range.setStartAfter(contentEditableRef.current.lastChild);
          range.collapse(true);
        } else {
          range.selectNodeContents(contentEditableRef.current);
          range.collapse(false);
        }
      } else {
        range = selection.getRangeAt(0);
      }

      try {
        // Se há um link ativo, atualiza
        const existingLink = getActiveLink(range.startContainer);
        if (existingLink) {
          // Atualiza o link existente
          existingLink.href = finalUrl;
          existingLink.title = finalUrl;
          existingLink.setAttribute("data-url", finalUrl);
        } else {
          // Usa o range salvo se disponível, senão usa o range atual
          let rangeToUse = range;
          if (savedRange && selectedTextForLink) {
            // Verifica se o range salvo ainda é válido
            try {
              const testText = savedRange.toString().trim();
              if (testText === selectedTextForLink) {
                rangeToUse = savedRange;
              }
            } catch (e) {
              // Range inválido, usa o range atual
              rangeToUse = range;
            }
          }

          const currentSelectedText = rangeToUse.toString().trim();
          const linkText =
            currentSelectedText || selectedTextForLink || finalUrl;

          const linkElement = document.createElement("a");
          linkElement.href = finalUrl;
          linkElement.textContent = linkText;
          linkElement.target = "_blank";
          linkElement.rel = "noopener noreferrer";
          linkElement.className = "rich-textarea-link";
          linkElement.setAttribute("data-url", finalUrl); // Para tooltip customizado
          linkElement.setAttribute("data-tooltip", finalUrl); // Para identificar links com tooltip

          if (currentSelectedText && !rangeToUse.collapsed) {
            // Substitui o texto selecionado pelo link
            rangeToUse.deleteContents();
            rangeToUse.insertNode(linkElement);
          } else {
            // Insere o link na posição do cursor
            rangeToUse.insertNode(linkElement);
          }

          // Move cursor para depois do link
          const newRange = document.createRange();
          newRange.setStartAfter(linkElement);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }

        updateValues();

        // Mostra toast de sucesso
        const isUpdating = existingLink !== null;
        toastCustom.success({
          title: isUpdating ? "Link atualizado" : "Link adicionado",
          description: isUpdating
            ? "Link atualizado com sucesso!"
            : "Link adicionado com sucesso!",
          duration: 3000,
        });

        setTimeout(() => {
          adjustHeight();
          checkActiveFormats();
        }, 0);
      } catch (error) {
        console.warn("Erro ao aplicar link:", error);
      }
    };

    // Função para remover link
    const removeLink = () => {
      if (!contentEditableRef.current || !activeLink) return;

      const selection = window.getSelection();
      if (!selection) return;

      try {
        const linkElement = activeLink.element;
        const textContent = linkElement.textContent || "";

        // Remove o link mas mantém o texto
        const textNode = document.createTextNode(textContent);
        linkElement.parentNode?.replaceChild(textNode, linkElement);

        // Restaura cursor
        const newRange = document.createRange();
        newRange.setStart(textNode, textContent.length);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        setActiveLink(null);
        updateValues();
        setTimeout(() => {
          adjustHeight();
          checkActiveFormats();
        }, 0);
      } catch (error) {
        console.warn("Erro ao remover link:", error);
      }
    };

    // Função para confirmar link no dialog
    const handleLinkDialogConfirm = () => {
      if (linkUrl.trim()) {
        applyLink(linkUrl);
      }
      setIsLinkDialogOpen(false);
      setLinkUrl("");
      setSelectedTextForLink("");
    };

    // Função para cancelar dialog de link
    const handleLinkDialogCancel = () => {
      setIsLinkDialogOpen(false);
      setLinkUrl("");
      setSelectedTextForLink("");
      setSavedRange(null);
      setActiveLink(null);
    };

    // Função para normalizar quebras de linha (converte <div> em <br>)
    const normalizeLineBreaks = React.useCallback(() => {
      if (!contentEditableRef.current) return;

      // Substitui <div><br></div> ou <div></div> (criado por alguns browsers no Enter) por <br>
      const divs = Array.from(
        contentEditableRef.current.querySelectorAll("div")
      );
      divs.forEach((div) => {
        // Se o div está vazio ou só tem um <br>, substitui por <br>
        if (
          div.children.length === 0 ||
          (div.children.length === 1 && div.children[0].tagName === "BR") ||
          (div.textContent?.trim() === "" && div.children.length === 0)
        ) {
          const br = document.createElement("br");
          if (div.parentNode) {
            div.parentNode.replaceChild(br, div);
          }
        }
      });
    }, []);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      if (!contentEditableRef.current) return;

      const currentPlainText = getPlainText(contentEditableRef.current);

      // Verifica limite de caracteres
      if (maxLength && currentPlainText.length > maxLength) {
        // Restaura o conteúdo anterior
        contentEditableRef.current.innerHTML = htmlValue;

        // Restaura o cursor no final
        const selection = window.getSelection();
        if (selection && contentEditableRef.current) {
          const range = document.createRange();
          range.selectNodeContents(contentEditableRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        return;
      }

      // Normaliza quebras de linha após input (garante que Enter funcione)
      normalizeLineBreaks();

      updateValues();

      // Ajusta altura após mudanças no conteúdo
      setTimeout(() => {
        adjustHeight();
      }, 0);

      // Atualiza formatos ativos após input (sem modificar seleção)
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
          case "k": // Ctrl+K para adicionar link
            e.preventDefault();
            toggleFormat("link");
            return;
          case "\\": // Ctrl+\ para limpar formatação
            e.preventDefault();
            toggleFormat("clear");
            return;
        }
      }

      // Tratamento especial para Enter - garante quebra de linha
      if (e.key === "Enter") {
        // Se está no limite de caracteres, bloqueia Enter
        if (maxLength && plainTextValue.length >= maxLength) {
          e.preventDefault();
          return;
        }
        // Não previne o comportamento padrão - permite quebrar linha normalmente
        return;
      }

      // Bloqueia teclas se já atingiu o limite (mas permite Enter e Backspace)
      if (maxLength && plainTextValue.length >= maxLength) {
        const allowedKeys = [
          "Backspace",
          "Delete",
          "Enter", // Permite Enter mesmo no limite (já tratado acima)
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
    const handleSelectionChange = React.useCallback(() => {
      // Só executa se o elemento está focado
      if (isFocused) {
        setTimeout(checkActiveFormats, 10);
      }
    }, [isFocused, checkActiveFormats]);

    // Effect para escutar mudanças de seleção globais
    React.useEffect(() => {
      document.addEventListener("selectionchange", handleSelectionChange);
      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange);
      };
    }, [handleSelectionChange]);

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

        <div className="rounded-lg border border-input bg-background flex flex-col overflow-hidden">
          <RichTextareaToolbar
            activeHeading={activeHeading}
            activeFormats={activeFormats}
            activeLink={activeLink}
            onHeadingChange={handleHeadingChange}
            onToolbarAction={handleToolbarAction}
          />

          <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
            {/* Placeholder fixo que não acompanha o scroll */}
            {!plainTextValue && !isFocused && (
              <div
                className="absolute top-0 left-0 pointer-events-none text-gray-500 opacity-70 z-0"
                style={{
                  paddingTop: "0.5rem",
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingBottom: "0.5rem",
                }}
              >
                {props.placeholder || "Digite algo..."}
              </div>
            )}
            <div
              ref={ref || contentEditableRef}
              contentEditable
              className={cn(
                textareaVariants({ size }),
                "rich-textarea-content !resize-none !min-w-full !max-w-full !w-full !overflow-y-auto !overflow-x-hidden",
                "focus:outline-none focus-visible:outline-none flex-1 relative z-10",
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
              onKeyUp={(e) => {
                // Aguarda um pouco para garantir que a seleção foi atualizada
                setTimeout(checkActiveFormats, 0);
              }}
              onMouseUp={(e) => {
                // Aguarda o evento de clique terminar antes de verificar formatos
                setTimeout(checkActiveFormats, 0);
              }}
              onSelect={(e) => {
                // Verifica formatos quando há mudança de seleção
                setTimeout(checkActiveFormats, 0);
              }}
              onPaste={handlePaste}
              onClick={(e) => {
                // Permite clicar nos links
                const target = e.target as HTMLElement;
                // Verifica se o clique foi em um link ou em um elemento dentro de um link
                let linkElement: HTMLAnchorElement | null = null;

                if (
                  target.tagName === "A" &&
                  target.classList.contains("rich-textarea-link")
                ) {
                  linkElement = target as HTMLAnchorElement;
                } else {
                  // Verifica se o elemento clicado está dentro de um link
                  const parentLink = target.closest("a.rich-textarea-link");
                  if (parentLink) {
                    linkElement = parentLink as HTMLAnchorElement;
                  }
                }

                if (linkElement) {
                  // Links já abrem em nova aba por padrão (target="_blank")
                  // Não precisa prevenir o comportamento padrão
                  // Apenas garante que o link funcione
                }
              }}
              suppressContentEditableWarning
              role="textbox"
              aria-label={label || "Rich text editor"}
              aria-multiline="true"
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              {...(props as any)}
            />

            {(showCharCount || maxLength) && (
              <div className="flex justify-end px-3 py-2 border-t border-input flex-shrink-0 bg-background">
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

        {/* Modal para adicionar/editar link */}
        <LinkModal
          isOpen={isLinkDialogOpen}
          onOpenChange={setIsLinkDialogOpen}
          linkUrl={linkUrl}
          activeLink={activeLink}
          onUrlChange={setLinkUrl}
          onConfirm={handleLinkDialogConfirm}
          onCancel={handleLinkDialogCancel}
          onRemove={removeLink}
        />
      </div>
    );
  }
);

RichTextarea.displayName = "RichTextarea";

export { RichTextarea };
