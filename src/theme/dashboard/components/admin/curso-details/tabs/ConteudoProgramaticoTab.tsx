"use client";

import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { HtmlContent } from "@/components/ui/custom/html-content";
import type { Curso } from "@/api/cursos";

interface ConteudoProgramaticoTabProps {
  curso: Curso;
  isLoading?: boolean;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&");
}

export function ConteudoProgramaticoTab({
  curso,
  isLoading = false,
}: ConteudoProgramaticoTabProps) {
  const rawConteudoProgramatico = curso.conteudoProgramatico?.trim() ?? "";
  const looksEscapedHtml = /&lt;[^&]+&gt;/i.test(rawConteudoProgramatico);
  const conteudoProgramatico = looksEscapedHtml
    ? decodeHtmlEntities(rawConteudoProgramatico).trim()
    : rawConteudoProgramatico;
  const isHtmlContent = Boolean(
    conteudoProgramatico && /<[^>]+>/.test(conteudoProgramatico)
  );

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
      {conteudoProgramatico ? (
        isHtmlContent ? (
          <HtmlContent html={conteudoProgramatico} />
        ) : (
          <p className="whitespace-pre-line !leading-relaxed text-muted-foreground">
            {conteudoProgramatico}
          </p>
        )
      ) : (
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de conteúdo programático vazio"
          title="Conteúdo programático não adicionado."
          description="Adicione o conteúdo programático no curso para facilitar a emissão de certificados."
          maxContentWidth="md"
        />
      )}
    </section>
  );
}
