"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

import type { PreparedScriptSnippet } from "@/lib/scripts/load-published-scripts";

const ORIENTATION_TARGET: Record<
  PreparedScriptSnippet["orientation"],
  () => HTMLElement | null
> = {
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
  scripts: PreparedScriptSnippet[]
): ParsedScriptSnippet[] {
  return scripts.map((script) => ({
    ...script,
    signature: computeSignature(script.code),
  }));
}

function ScriptInjectorClient({
  scripts,
}: {
  scripts: PreparedScriptSnippet[];
}): null {
  const insertedNodesRef = useRef<Node[]>([]);

  useEffect(() => {
    // Verificar se já estamos no client-side
    if (typeof window === "undefined") return;

    const parsedPayload = parseScriptsPayload(scripts);
    const serialized = JSON.stringify(parsedPayload);

    let parsed: ParsedScriptSnippet[] = [];

    try {
      parsed = JSON.parse(serialized);
    } catch {
      return;
    }

    const insertedNodes: Node[] = [];

    parsed.forEach((script) => {
      const target = ORIENTATION_TARGET[script.orientation]();

      if (!target) return;

      const element = document.createElement("script");
      element.textContent = script.code;
      element.setAttribute("data-script-id", script.id);
      element.setAttribute("data-script-signature", script.signature);

      target.appendChild(element);
      insertedNodes.push(element);
    });

    // Armazenar referência para cleanup
    insertedNodesRef.current = insertedNodes;

    return () => {
      insertedNodesRef.current.forEach((node) => {
        node.parentNode?.removeChild(node);
      });
      insertedNodesRef.current = [];
    };
  }, [scripts]);

  return null;
}

// Exportar o componente com dynamic import para evitar SSR
export const ScriptInjector = dynamic(
  () => Promise.resolve(ScriptInjectorClient),
  {
    ssr: false,
    loading: () => null,
  }
);
