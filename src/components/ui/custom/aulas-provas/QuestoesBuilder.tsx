"use client";

import React from "react";
import { ButtonCustom, InputCustom } from "@/components/ui/custom";
import { Icon } from "@/components/ui/custom/Icons";
import {
  CheckCircle2,
  Info,
  ChevronUp,
  ChevronDown,
  CircleDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface QuestaoItem {
  id: string;
  titulo: string;
  alternativas: AlternativaItem[];
  respostaCorreta: string | null; // ID da alternativa correta
}

export interface AlternativaItem {
  id: string;
  texto: string;
}

interface QuestoesBuilderProps {
  questoes: QuestaoItem[];
  onChange: (questoes: QuestaoItem[]) => void;
  maxQuestoes?: number;
  minQuestoes?: number;
  maxAlternativas?: number;
}

/**
 * Componente para construir questões de múltipla escolha
 * Design baseado no builder-manager da plataforma
 */
export function QuestoesBuilder({
  questoes,
  onChange,
  maxQuestoes = 10,
  minQuestoes = 1,
  maxAlternativas = 4,
}: QuestoesBuilderProps) {
  const addQuestao = () => {
    if (questoes.length >= maxQuestoes) {
      return;
    }
    const novaQuestao: QuestaoItem = {
      id: `questao-${Date.now()}-${Math.random()}`,
      titulo: "",
      alternativas: [
        { id: `alt-${Date.now()}-1`, texto: "" },
        { id: `alt-${Date.now()}-2`, texto: "" },
      ],
      respostaCorreta: null,
    };
    onChange([...questoes, novaQuestao]);
  };

  const removeQuestao = (questaoId: string) => {
    if (questoes.length <= minQuestoes) {
      return;
    }
    onChange(questoes.filter((q) => q.id !== questaoId));
  };

  const updateQuestao = (questaoId: string, updates: Partial<QuestaoItem>) => {
    onChange(
      questoes.map((q) => (q.id === questaoId ? { ...q, ...updates } : q))
    );
  };

  const addAlternativa = (questaoId: string) => {
    const questao = questoes.find((q) => q.id === questaoId);
    if (!questao || questao.alternativas.length >= maxAlternativas) {
      return;
    }
    const novaAlternativa: AlternativaItem = {
      id: `alt-${Date.now()}-${Math.random()}`,
      texto: "",
    };
    updateQuestao(questaoId, {
      alternativas: [...questao.alternativas, novaAlternativa],
    });
  };

  const removeAlternativa = (questaoId: string, alternativaId: string) => {
    const questao = questoes.find((q) => q.id === questaoId);
    if (!questao || questao.alternativas.length <= 2) {
      return; // Mínimo 2 alternativas
    }
    const novasAlternativas = questao.alternativas.filter(
      (a) => a.id !== alternativaId
    );
    updateQuestao(questaoId, {
      alternativas: novasAlternativas,
      // Se a alternativa removida era a correta, limpar resposta correta
      respostaCorreta:
        questao.respostaCorreta === alternativaId
          ? null
          : questao.respostaCorreta,
    });
  };

  const updateAlternativa = (
    questaoId: string,
    alternativaId: string,
    texto: string
  ) => {
    const questao = questoes.find((q) => q.id === questaoId);
    if (!questao) return;
    const novasAlternativas = questao.alternativas.map((a) =>
      a.id === alternativaId ? { ...a, texto } : a
    );
    updateQuestao(questaoId, { alternativas: novasAlternativas });
  };

  const setRespostaCorreta = (questaoId: string, alternativaId: string) => {
    updateQuestao(questaoId, { respostaCorreta: alternativaId });
  };

  // Mover questão para cima
  const moveQuestaoUp = (index: number) => {
    if (index <= 0) return;
    const novasQuestoes = [...questoes];
    [novasQuestoes[index - 1], novasQuestoes[index]] = [
      novasQuestoes[index],
      novasQuestoes[index - 1],
    ];
    onChange(novasQuestoes);
  };

  // Mover questão para baixo
  const moveQuestaoDown = (index: number) => {
    if (index >= questoes.length - 1) return;
    const novasQuestoes = [...questoes];
    [novasQuestoes[index], novasQuestoes[index + 1]] = [
      novasQuestoes[index + 1],
      novasQuestoes[index],
    ];
    onChange(novasQuestoes);
  };

  const canAddQuestao = questoes.length < maxQuestoes;
  const canRemoveQuestao = questoes.length > minQuestoes;
  const showReorderButtons = questoes.length > 1;

  // Letras para alternativas
  const getLetraAlternativa = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  return (
    <div className="space-y-4">
      {/* Header com estilo do builder-manager */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Icon name="FileQuestion" className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-base! font-semibold! text-gray-900! mb-0!">
                Questões
              </h3>
              <p className="text-xs! text-gray-500! mb-0!">
                {questoes.length} de {maxQuestoes} questões
                {questoes.length < minQuestoes && (
                  <span className="text-amber-600 ml-1">
                    (mínimo {minQuestoes})
                  </span>
                )}
              </p>
            </div>
          </div>
          <ButtonCustom
            variant="primary"
            size="sm"
            icon="Plus"
            onClick={addQuestao}
            disabled={!canAddQuestao}
          >
            Adicionar Questão
          </ButtonCustom>
        </div>
      </div>

      {/* Alerta se não tiver questões suficientes */}
      {questoes.length < minQuestoes && (
        <Alert className="border-amber-200 bg-amber-50 rounded-xl">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm!">
            É necessário adicionar pelo menos {minQuestoes} questão(ões).
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Questões */}
      {questoes.length > 0 && (
        <div className="space-y-4">
          {questoes.map((questao, index) => (
            <div
              key={questao.id}
              className={cn(
                "rounded-2xl border bg-white overflow-hidden transition-all duration-200",
                "hover:shadow-md",
                questao.respostaCorreta
                  ? "border-violet-200"
                  : "border-gray-200"
              )}
            >
              {/* Header da Questão */}
              <div
                className={cn(
                  "px-5 py-4 border-b",
                  questao.respostaCorreta
                    ? "bg-violet-50/50 border-violet-100"
                    : "bg-gray-50/50 border-gray-100"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold",
                        questao.respostaCorreta
                          ? "bg-violet-100 text-violet-700"
                          : "bg-gray-200 text-gray-600"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Questão {index + 1}
                      </span>
                      {questao.respostaCorreta && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resposta definida
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Botões de reordenação */}
                    {showReorderButtons && (
                      <div className="flex flex-col mr-1">
                        {/* Seta para cima - só aparece se não for a primeira */}
                        {index > 0 ? (
                          <button
                            type="button"
                            onClick={() => moveQuestaoUp(index)}
                            className={cn(
                              "p-1 rounded-md transition-all duration-200",
                              "text-gray-400 hover:text-violet-600 hover:bg-violet-50",
                              "focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            )}
                            aria-label="Mover questão para cima"
                            title="Mover para cima"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="p-1">
                            <ChevronUp className="h-4 w-4 text-gray-200" />
                          </div>
                        )}
                        {/* Seta para baixo - só aparece se não for a última */}
                        {index < questoes.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => moveQuestaoDown(index)}
                            className={cn(
                              "p-1 rounded-md transition-all duration-200",
                              "text-gray-400 hover:text-violet-600 hover:bg-violet-50",
                              "focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            )}
                            aria-label="Mover questão para baixo"
                            title="Mover para baixo"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="p-1">
                            <ChevronDown className="h-4 w-4 text-gray-200" />
                          </div>
                        )}
                      </div>
                    )}
                    {/* Botão de remover */}
                    {canRemoveQuestao && (
                      <ButtonCustom
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => removeQuestao(questao.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Conteúdo da Questão */}
              <div className="p-5 space-y-4">
                {/* Título/Pergunta */}
                <InputCustom
                  label="Pergunta"
                  placeholder="Digite a pergunta da questão..."
                  value={questao.titulo}
                  onChange={(e) =>
                    updateQuestao(questao.id, { titulo: e.target.value })
                  }
                  required
                />

                {/* Alternativas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <CircleDot className="h-4 w-4 text-gray-400" />
                      Alternativas
                      <span className="text-xs text-gray-400 font-normal">
                        (clique no círculo para marcar a correta)
                      </span>
                    </label>
                    {questao.alternativas.length < maxAlternativas && (
                      <ButtonCustom
                        variant="primary"
                        size="sm"
                        icon="Plus"
                        onClick={() => addAlternativa(questao.id)}
                      >
                        Adicionar
                      </ButtonCustom>
                    )}
                  </div>

                  <div className="space-y-2">
                    {questao.alternativas.map((alternativa, altIndex) => {
                      const isCorreta =
                        questao.respostaCorreta === alternativa.id;
                      const letra = getLetraAlternativa(altIndex);

                      return (
                        <div
                          key={alternativa.id}
                          className={cn(
                            "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                            isCorreta
                              ? "bg-emerald-50 border-emerald-300 shadow-sm"
                              : "bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {/* Botão de selecionar como correta */}
                          <button
                            type="button"
                            onClick={() =>
                              setRespostaCorreta(questao.id, alternativa.id)
                            }
                            className={cn(
                              "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 font-medium text-sm",
                              isCorreta
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md"
                                : "bg-white border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50"
                            )}
                            aria-label={`Marcar alternativa ${letra} como correta`}
                          >
                            {isCorreta ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              letra
                            )}
                          </button>

                          {/* Input da alternativa */}
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              placeholder={`Alternativa ${letra}`}
                              value={alternativa.texto}
                              onChange={(e) =>
                                updateAlternativa(
                                  questao.id,
                                  alternativa.id,
                                  e.target.value
                                )
                              }
                              className={cn(
                                "w-full bg-transparent border-0 outline-none text-sm",
                                "placeholder:text-gray-400",
                                isCorreta ? "text-emerald-900" : "text-gray-700"
                              )}
                            />
                          </div>

                          {/* Botão remover alternativa */}
                          {questao.alternativas.length > 2 && (
                            <ButtonCustom
                              variant="ghost"
                              size="sm"
                              icon="X"
                              onClick={() =>
                                removeAlternativa(questao.id, alternativa.id)
                              }
                              className={cn(
                                "opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                                "text-gray-400 hover:text-red-600 hover:bg-red-50"
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Contador de alternativas */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>
                      {questao.alternativas.length} de {maxAlternativas}{" "}
                      alternativas
                    </span>
                    {!questao.respostaCorreta && questao.titulo && (
                      <span className="text-amber-600 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Selecione a resposta correta
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State com estilo do builder-manager */}
      {questoes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
          {/* Ilustração decorativa */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-xl scale-150" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20">
              <Icon name="FileQuestion" className="h-10 w-10 text-violet-600" />
            </div>
          </div>

          {/* Título e descrição */}
          <h3 className="text-lg! font-semibold! text-gray-900! mb-2!">
            Nenhuma questão adicionada ainda
          </h3>
          <p className="text-sm! text-gray-500! max-w-sm! mb-6! leading-relaxed!">
            Comece adicionando questões de múltipla escolha para sua atividade
            ou prova
          </p>

          {/* Botão CTA */}
          <ButtonCustom
            type="button"
            variant="primary"
            icon="Plus"
            onClick={addQuestao}
            className="gap-2"
          >
            Adicionar Primeira Questão
          </ButtonCustom>

          {/* Dica visual */}
          <div className="mt-8 flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <Icon
                  name="FileQuestion"
                  className="h-3.5 w-3.5 text-violet-600"
                />
              </div>
              <span>Questão</span>
            </div>
            <Icon name="ArrowRight" className="h-3 w-3" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span>Alternativas</span>
            </div>
            <Icon name="ArrowRight" className="h-3 w-3" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon name="Check" className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span>Resposta</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
