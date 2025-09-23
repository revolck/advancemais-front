"use client";

import { useEffect, useMemo } from "react";

import type { PreparedScriptSnippet } from "@/lib/scripts/load-published-scripts";

const ORIENTATION_TARGET: Record<PreparedScriptSnippet["orientation"], () => HTMLElement | null> = {
  HEADER: () => (typeof document === "undefined" ? null : document.head),
  BODY: () => (typeof document === "undefined" ? null : document.body),
  FOOTER: () => (typeof document === "undefined" ? null : document.body),
};

interface ParsedScriptSnippet extends PreparedScriptSnippet {
  signature: string;
}

function computeSignature(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `${value.length}:${hash}`;
}

function parseScriptsPayload(
  scripts: PreparedScriptSnippet[],
): ParsedScriptSnippet[] {
  return scripts.map((script) => ({
    ...script,
    signature: computeSignature(script.code),
  }));
}

export function ScriptInjector({
  scripts,
}: {
  scripts: PreparedScriptSnippet[];
}): null {
  const payload = useMemo(() => parseScriptsPayload(scripts), [scripts]);
  const serialized = useMemo(() => JSON.stringify(payload), [payload]);

  useEffect(() => {
    if (!serialized) return;

    let parsed: ParsedScriptSnippet[] = [];
    try {
      parsed = JSON.parse(serialized) as ParsedScriptSnippet[];
    } catch (error) {
      console.error("Failed to parse scripts payload", error);
      return;
    }

    const insertedNodes: Node[] = [];

    parsed.forEach((script) => {
      const code = script.code.trim();
      if (!code) return;

      const getTarget = ORIENTATION_TARGET[script.orientation];
      const target = getTarget?.();
      if (!target) return;

      const selector = `*[data-script-origin="custom-script"][data-script-id="${script.id}"]`;
      const existing = target.querySelectorAll(selector);

      if (
        existing.length > 0 &&
        Array.from(existing).every((node) =>
          node instanceof HTMLElement
            ? node.dataset.scriptSignature === script.signature
            : node.textContent?.trim() === code,
        )
      ) {
        return;
      }

      existing.forEach((node) => {
        node.parentNode?.removeChild(node);
      });

      const template = document.createElement("template");
      template.innerHTML = code;

      const nodes = Array.from(template.content.childNodes).filter((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return Boolean(node.textContent?.trim());
        }
        return true;
      });

      if (nodes.length === 0) {
        const inlineScript = document.createElement("script");
        inlineScript.type = "text/javascript";
        inlineScript.dataset.scriptOrigin = "custom-script";
        inlineScript.dataset.scriptId = script.id;
        inlineScript.dataset.scriptSignature = script.signature;
        inlineScript.textContent = code;
        target.appendChild(inlineScript);
        insertedNodes.push(inlineScript);
        return;
      }

      nodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          element.dataset.scriptOrigin = "custom-script";
          element.dataset.scriptId = script.id;
          element.dataset.scriptSignature = script.signature;
          if (script.orientation === "FOOTER") {
            element.dataset.scriptPosition = "footer";
          }
        }
        const appended = target.appendChild(node);
        insertedNodes.push(appended);
      });
    });

    return () => {
      insertedNodes.forEach((node) => {
        node.parentNode?.removeChild(node);
      });
    };
  }, [serialized]);

  return null;
}
