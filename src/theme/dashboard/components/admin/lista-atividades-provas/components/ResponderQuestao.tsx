"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Questao,
  type Resposta,
  CursosTipoQuestao,
} from "@/api/provas";
import { useResponderQuestao } from "../hooks/useRespostas";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { InputCustom, ButtonCustom, toastCustom } from "@/components/ui/custom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { FileUploadMultiple, type FileUploadItem } from "@/components/ui/custom/file-upload";
import { uploadFile } from "@/services/upload";

interface ResponderQuestaoProps {
  cursoId: string | number;
  turmaId: string;
  provaId: string;
  questao: Questao;
  inscricaoId: string;
  respostaAtual?: Resposta;
  onSuccess?: () => void;
}

export function ResponderQuestao({
  cursoId,
  turmaId,
  provaId,
  questao,
  inscricaoId,
  respostaAtual,
  onSuccess,
}: ResponderQuestaoProps) {
  const [respostaTexto, setRespostaTexto] = useState("");
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<string>("");
  const [arquivo, setArquivo] = useState<FileUploadItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const responderQuestao = useResponderQuestao({ cursoId, turmaId, provaId });

  // Carregar resposta atual se existir
  useEffect(() => {
    if (respostaAtual) {
      if (questao.tipo === CursosTipoQuestao.TEXTO) {
        setRespostaTexto(respostaAtual.respostaTexto || "");
      } else if (questao.tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA) {
        setAlternativaSelecionada(respostaAtual.alternativaId || "");
      } else if (questao.tipo === CursosTipoQuestao.ANEXO) {
        if (respostaAtual.anexoUrl) {
          setArquivo([
            {
              id: respostaAtual.id,
              name: respostaAtual.anexoNome || "arquivo",
              previewUrl: respostaAtual.anexoUrl,
              size: 0,
              type: "application/pdf",
              status: "completed",
              uploadDate: new Date(),
            },
          ]);
        }
      }
    }
  }, [respostaAtual, questao.tipo]);

  const validarResposta = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (questao.obrigatoria) {
      if (questao.tipo === CursosTipoQuestao.TEXTO) {
        if (!respostaTexto.trim()) {
          newErrors.resposta = "Resposta é obrigatória";
        } else if (respostaTexto.trim().length > 10000) {
          newErrors.resposta = "Resposta deve ter no máximo 10.000 caracteres";
        }
      } else if (questao.tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA) {
        if (!alternativaSelecionada) {
          newErrors.resposta = "Selecione uma alternativa";
        }
      } else if (questao.tipo === CursosTipoQuestao.ANEXO) {
        if (arquivo.length === 0) {
          newErrors.resposta = "Arquivo é obrigatório";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarResposta()) {
      return;
    }

    try {
      let payload: any = { inscricaoId };

      if (questao.tipo === CursosTipoQuestao.TEXTO) {
        payload.respostaTexto = respostaTexto.trim();
      } else if (questao.tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA) {
        payload.alternativaId = alternativaSelecionada;
      } else if (questao.tipo === CursosTipoQuestao.ANEXO) {
        if (arquivo.length > 0 && arquivo[0].file) {
          // Fazer upload do arquivo
          const uploadResult = await uploadFile(arquivo[0].file, "provas/anexos");
          payload.anexoUrl = uploadResult.url;
          payload.anexoNome = arquivo[0].name;
        } else if (arquivo.length > 0 && arquivo[0].previewUrl) {
          // Arquivo já existe
          payload.anexoUrl = arquivo[0].previewUrl;
          payload.anexoNome = arquivo[0].name;
        }
      }

      await responderQuestao.mutateAsync({
        questaoId: questao.id,
        payload,
      });

      toastCustom.success("Resposta salva com sucesso!");
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.message || "Erro ao salvar resposta. Tente novamente.";
      toastCustom.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold">{questao.enunciado}</h3>
            {questao.peso && (
              <p className="text-sm text-gray-500 mt-1">
                Peso: {questao.peso}
              </p>
            )}
          </div>
          {questao.obrigatoria && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 shrink-0">
              Obrigatória
            </Badge>
          )}
        </div>

        {errors.resposta && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.resposta}</AlertDescription>
          </Alert>
        )}

        {/* Resposta de Texto */}
        {questao.tipo === CursosTipoQuestao.TEXTO && (
          <div className="space-y-2">
            <Label htmlFor="resposta-texto">Sua resposta</Label>
            <SimpleTextarea
              id="resposta-texto"
              value={respostaTexto}
              onChange={(e) => setRespostaTexto(e.target.value)}
              placeholder="Digite sua resposta..."
              rows={6}
              maxLength={10000}
              showCharCount
              error={errors.resposta}
            />
          </div>
        )}

        {/* Resposta de Múltipla Escolha */}
        {questao.tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA &&
          questao.alternativas && (
            <div className="space-y-2">
              <Label>Selecione uma alternativa</Label>
              <RadioGroup
                value={alternativaSelecionada}
                onValueChange={setAlternativaSelecionada}
              >
                {questao.alternativas.map((alt) => (
                  <div
                    key={alt.id}
                    className={cn(
                      "flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50",
                      alternativaSelecionada === alt.id && "bg-blue-50 border-blue-200"
                    )}
                    onClick={() => setAlternativaSelecionada(alt.id)}
                  >
                    <RadioGroupItem value={alt.id} id={alt.id} />
                    <Label
                      htmlFor={alt.id}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {alt.texto}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

        {/* Resposta de Anexo */}
        {questao.tipo === CursosTipoQuestao.ANEXO && (
          <div className="space-y-2">
            <Label>Enviar arquivo</Label>
            <FileUploadMultiple
              files={arquivo}
              onFilesChange={setArquivo}
              maxFiles={1}
              accept={[".pdf", "application/pdf"]}
              maxSize={10 * 1024 * 1024}
            />
            {errors.resposta && (
              <p className="text-sm text-destructive">{errors.resposta}</p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <ButtonCustom
            variant="primary"
            onClick={handleSubmit}
            disabled={responderQuestao.isPending}
            isLoading={responderQuestao.isPending}
          >
            {respostaAtual ? "Atualizar Resposta" : "Salvar Resposta"}
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
}

