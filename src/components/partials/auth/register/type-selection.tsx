"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GraduationCap, Building2 } from "lucide-react";

interface TypeSelectionProps {
  onSelect: (tipo: "PESSOA_FISICA" | "PESSOA_JURIDICA") => void;
}

export function TypeSelection({ onSelect }: TypeSelectionProps) {
  return (
    <div className="h-[100dvh] flex items-center justify-center p-8 bg-gradient-to-br from-[var(--color-blue)] via-purple-700 to-fuchsia-600 text-white">
      <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
        <Card
          onClick={() => onSelect("PESSOA_FISICA")}
          className="cursor-pointer bg-white/10 border-white/20 backdrop-blur-md text-white transition-transform hover:scale-105 hover:bg-white/20 animate-element animate-delay-100"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="w-5 h-5" />
              Candidato/Aluno
            </CardTitle>
            <CardDescription className="text-white/80">
              Para quem busca oportunidades de aprendizado e carreira
            </CardDescription>
          </CardHeader>
        </Card>
        <Card
          onClick={() => onSelect("PESSOA_JURIDICA")}
          className="cursor-pointer bg-white/10 border-white/20 backdrop-blur-md text-white transition-transform hover:scale-105 hover:bg-white/20 animate-element animate-delay-200"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building2 className="w-5 h-5" />
              Empresa
            </CardTitle>
            <CardDescription className="text-white/80">
              Para empresas que buscam talentos e oferecem oportunidades
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
