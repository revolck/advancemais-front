"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type AllowedTag =
  | "a"
  | "b"
  | "blockquote"
  | "br"
  | "code"
  | "div"
  | "em"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "hr"
  | "i"
  | "li"
  | "ol"
  | "p"
  | "pre"
  | "span"
  | "strong"
  | "u"
  | "ul";

const ALLOWED_TAGS = new Set<AllowedTag>([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "u",
  "ul",
]);

const GLOBAL_ALLOWED_ATTRS = new Set<string>(["class"]);
const TAG_ALLOWED_ATTRS: Partial<Record<AllowedTag, Set<string>>> = {
  a: new Set(["href", "target", "rel", "title"]),
  code: new Set(["class"]),
  pre: new Set(["class"]),
  span: new Set(["class"]),
  div: new Set(["class"]),
  p: new Set(["class"]),
  ul: new Set(["class"]),
  ol: new Set(["class"]),
  li: new Set(["class"]),
};

function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  if (value.startsWith("#")) return true;
  if (value.startsWith("/")) return true;
  if (value.startsWith("./") || value.startsWith("../")) return true;
  return /^(https?:|mailto:|tel:)/i.test(value);
}

function sanitizeHtml(input: string): string {
  if (!input) return "";
  if (typeof window === "undefined") {
    return input
      .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
      .replace(/<\s*style\b[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "")
      .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
      .replace(/\sstyle\s*=\s*(['"]).*?\1/gi, "")
      .replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, "");
  }

  const doc = new DOMParser().parseFromString(input, "text/html");

  const sanitizeElement = (el: Element) => {
    const tagName = el.tagName.toLowerCase() as AllowedTag;

    if (!ALLOWED_TAGS.has(tagName)) {
      const parent = el.parentNode;
      if (!parent) {
        el.remove();
        return;
      }
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      el.remove();
      return;
    }

    const allowedForTag = TAG_ALLOWED_ATTRS[tagName] ?? new Set<string>();
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "style") {
        el.removeAttribute(attr.name);
        continue;
      }

      const isAllowed = GLOBAL_ALLOWED_ATTRS.has(name) || allowedForTag.has(name);
      if (!isAllowed) {
        el.removeAttribute(attr.name);
      }
    }

    if (tagName === "a") {
      const href = el.getAttribute("href") || "";
      if (!isSafeHref(href)) {
        el.removeAttribute("href");
      }

      const target = (el.getAttribute("target") || "").toLowerCase();
      if (target === "_blank") {
        const rel = el.getAttribute("rel") || "";
        const relParts = new Set(
          rel
            .split(/\s+/)
            .map((s) => s.trim())
            .filter(Boolean)
        );
        relParts.add("noopener");
        relParts.add("noreferrer");
        el.setAttribute("rel", Array.from(relParts).join(" "));
      }
    }
  };

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const elements: Element[] = [];
  while (walker.nextNode()) {
    elements.push(walker.currentNode as Element);
  }
  elements.forEach(sanitizeElement);

  return doc.body.innerHTML;
}

export interface HtmlContentProps {
  html: string;
  className?: string;
}

export function HtmlContent({ html, className }: HtmlContentProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const sanitized = useMemo(() => sanitizeHtml(html), [html]);

  if (!isClient) {
    return null;
  }

  return (
    <div
      className={cn(
        "text-sm text-gray-700 leading-relaxed",
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-3",
        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-2",
        "[&_p]:mb-3 [&_p]:last:mb-0",
        "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:mb-1",
        "[&_strong]:font-semibold [&_b]:font-semibold",
        "[&_em]:italic [&_i]:italic",
        "[&_a]:text-[var(--primary-color)] [&_a]:underline [&_a:hover]:opacity-90",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_blockquote]:my-3",
        "[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
        "[&_pre]:bg-gray-50 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-auto [&_pre]:mb-3",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
