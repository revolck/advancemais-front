"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TypeSelectionProps {
  onSelect: (tipo: "PESSOA_FISICA" | "PESSOA_JURIDICA") => void;
}

export function TypeSelection({ onSelect }: TypeSelectionProps) {
  return (
    <div className="h-[100dvh] flex items-center justify-center p-8">
      <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
        <Card
          onClick={() => onSelect("PESSOA_FISICA")}
          className="cursor-pointer transition-colors hover:border-[var(--color-blue)]"
        >
          <CardHeader>
            <CardTitle>Candidato/Aluno</CardTitle>
            <CardDescription>
              Para quem busca oportunidades de aprendizado e carreira
            </CardDescription>
          </CardHeader>
        </Card>
        <Card
          onClick={() => onSelect("PESSOA_JURIDICA")}
          className="cursor-pointer transition-colors hover:border-[var(--color-blue)]"
        >
          <CardHeader>
            <CardTitle>Empresa</CardTitle>
            <CardDescription>
              Para empresas que buscam talentos e oferecem oportunidades
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
