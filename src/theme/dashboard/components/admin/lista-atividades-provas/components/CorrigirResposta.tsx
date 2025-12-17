"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type RespostaComQuestao, CursosTipoQuestao } from "@/api/provas";
import { useCorrigirResposta } from "../hooks/useRespostas";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { InputCustom, ButtonCustom, toastCustom } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";

interface CorrigirRespostaProps {
  cursoId: string | number;
  turmaId: string;
  provaId: string;
  resposta: RespostaComQuestao;
  onSuccess?: () => void;
}

export function CorrigirResposta({
  cursoId,
  turmaId,
  provaId,
  resposta,
  onSuccess,
}: CorrigirRespostaProps) {
  const [nota, setNota] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");
  const [corrigida, setCorrigida] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const corrigirResposta = useCorrigirResposta({ cursoId, turmaId, provaId });

  // Carregar dados da resposta atual
  useEffect(() => {
    if (resposta) {
      setNota(resposta.nota?.toString() || "");
      setObservacoes(resposta.observacoes || "");
      setCorrigida(resposta.corrigida);
    }
  }, [resposta]);

  const validarCorrecao = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (nota) {
      const notaNum = parseFloat(nota);
      if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
        newErrors.nota = "Nota deve estar entre 0 e 10";
      }
    }

    if (observacoes && observacoes.length > 1000) {
      newErrors.observacoes = "Observações devem ter no máximo 1000 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarCorrecao()) {
      return;
    }

    try {
      const payload: any = {
        inscricaoId: resposta.inscricaoId,
        corrigida: true,
      };

      if (nota) {
        payload.nota = parseFloat(nota);
      }

      if (observacoes.trim()) {
        payload.observacoes = observacoes.trim();
      }

      await corrigirResposta.mutateAsync({
        questaoId: resposta.questaoId,
        payload,
      });

      toastCustom.success("Correção salva com sucesso!");
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.message || "Erro ao salvar correção. Tente novamente.";
      toastCustom.error(errorMessage);
    }
  };

  const renderRespostaAluno = () => {
    const questao = resposta.questao;

    if (questao.tipo === CursosTipoQuestao.TEXTO) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Resposta do aluno:</Label>
          <div className="p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm whitespace-pre-wrap">
              {resposta.respostaTexto || "—"}
            </p>
          </div>
        </div>
      );
    }

    if (questao.tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Alternativa selecionada:
          </Label>
          <div className="p-3 bg-gray-50 border rounded-lg">
            {resposta.alternativa ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">{resposta.alternativa.texto}</span>
                {resposta.alternativa.correta ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Correta
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    Incorreta
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-400">—</span>
            )}
          </div>
        </div>
      );
    }

    if (questao.tipo === CursosTipoQuestao.ANEXO) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Arquivo enviado:</Label>
          {resposta.anexoUrl ? (
            <div className="p-3 bg-gray-50 border rounded-lg">
              <a
                href={resposta.anexoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                {resposta.anexoNome || "Ver arquivo"}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border rounded-lg">
              <span className="text-sm text-gray-400">
                Nenhum arquivo enviado
              </span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="space-y-4">
        {/* Enunciado da questão */}
        <div>
          <h3 className="text-base font-semibold">
            {resposta.questao.enunciado}
          </h3>
          <Badge variant="outline" className="mt-2">
            {resposta.questao.tipo === CursosTipoQuestao.TEXTO && "Texto"}
            {resposta.questao.tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA &&
              "Múltipla Escolha"}
            {resposta.questao.tipo === CursosTipoQuestao.ANEXO && "Anexo"}
          </Badge>
        </div>

        {/* Resposta do aluno */}
        {renderRespostaAluno()}

        {/* Campos de correção */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="nota">
              Nota (0-10) <span className="text-gray-500">(opcional)</span>
            </Label>
            <InputCustom
              id="nota"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ex: 8.5"
              error={errors.nota}
            />
            <p className="text-xs text-gray-500">
              Nota atribuída à resposta (opcional, entre 0 e 10)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações <span className="text-gray-500">(opcional)</span>
            </Label>
            <SimpleTextarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações sobre a resposta..."
              rows={4}
              maxLength={1000}
              showCharCount
              error={errors.observacoes}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="corrigida"
              checked={corrigida}
              onChange={(e) => setCorrigida(e.target.checked)}
              className="cursor-pointer"
            />
            <Label htmlFor="corrigida" className="cursor-pointer">
              Marcar como corrigida
            </Label>
          </div>

          {errors.nota && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.nota}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <ButtonCustom
              variant="primary"
              onClick={handleSubmit}
              disabled={corrigirResposta.isPending}
              isLoading={corrigirResposta.isPending}
            >
              Salvar Correção
            </ButtonCustom>
          </div>
        </div>
      </div>
    </div>
  );
}
