"use client";

import React from "react";
import { SimpleTextarea } from "@/components/ui/custom";
import { Icon } from "@/components/ui/custom/Icons";
import { MessageSquareText, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TextoItem {
  titulo: string;
}

interface TextoBuilderProps {
  texto: TextoItem;
  onChange: (texto: TextoItem) => void;
}

/**
 * Componente para construir atividade por pergunta e resposta
 * Design baseado no builder-manager da plataforma
 */
export function TextoBuilder({ texto, onChange }: TextoBuilderProps) {
  const hasContent = texto.titulo.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Header com estilo do builder-manager */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquareText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base! font-semibold! text-gray-900! mb-0!">
                Pergunta e Resposta
              </h3>
              <p className="text-xs! text-gray-500! mb-0!">
                Os alunos responderão com texto livre
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
          >
            <PenLine className="h-3 w-3 mr-1" />
            Resposta Livre
          </Badge>
        </div>
      </div>

      {/* Card de conteúdo */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {/* Header do card */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon name="HelpCircle" className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Pergunta da Atividade
              </span>
              {hasContent && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                >
                  <Icon name="Check" className="h-3 w-3 mr-1" />
                  Preenchida
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-5">
          <SimpleTextarea
            label=""
            placeholder="Digite a pergunta que os alunos deverão responder..."
            value={texto.titulo}
            onChange={(e) => onChange({ ...texto, titulo: e.target.value })}
            required
            maxLength={500}
            showCharCount
            size="lg"
          />

          {/* Dica */}
          <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
            <Icon
              name="Lightbulb"
              className="h-4 w-4 text-amber-400 shrink-0 mt-0.5"
            />
            <p className="mb-0! leading-relaxed">
              <span className="font-medium text-gray-500">Dica:</span> Faça
              perguntas claras e objetivas. Os alunos poderão responder com
              texto livre, então seja específico sobre o que espera na resposta.
            </p>
          </div>
        </div>
      </div>

      {/* Preview visual quando tiver conteúdo */}
      {hasContent && (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Eye" className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">
              Prévia da pergunta
            </span>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-4">
            <p className="text-sm text-gray-700 mb-0! whitespace-pre-wrap">
              {texto.titulo}
            </p>
          </div>
        </div>
      )}

      {/* Empty state hint quando não tiver conteúdo */}
      {!hasContent && (
        <div className="flex items-center justify-center py-6 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquareText className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span>Pergunta</span>
            </div>
            <Icon name="ArrowRight" className="h-3 w-3" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <PenLine className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span>Resposta do Aluno</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
