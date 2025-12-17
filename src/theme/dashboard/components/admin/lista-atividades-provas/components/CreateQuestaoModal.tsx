"use client";

import React, { useState, useEffect } from "react";
import {
  ModalCustom,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import {
  InputCustom,
  SelectCustom,
  ButtonCustom,
  toastCustom,
} from "@/components/ui/custom";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Questao,
  type CreateQuestaoPayload,
  type UpdateQuestaoPayload,
  type CreateAlternativaPayload,
  CursosTipoQuestao,
} from "@/api/provas";
import {
  useCreateQuestao,
  useUpdateQuestao,
} from "../hooks/useQuestoes";

const TIPO_QUESTAO_OPTIONS = [
  { value: CursosTipoQuestao.TEXTO, label: "Texto" },
  { value: CursosTipoQuestao.MULTIPLA_ESCOLHA, label: "Múltipla Escolha" },
  { value: CursosTipoQuestao.ANEXO, label: "Anexo" },
];

interface CreateQuestaoModalProps {
  cursoId: string | number;
  turmaId: string;
  provaId: string;
  questao?: Questao; // Se fornecido, está em modo edição
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

interface AlternativaForm {
  id?: string;
  texto: string;
  correta: boolean;
}

export function CreateQuestaoModal({
  cursoId,
  turmaId,
  provaId,
  questao,
  onSuccess,
  trigger,
}: CreateQuestaoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [enunciado, setEnunciado] = useState("");
  const [tipo, setTipo] = useState<CursosTipoQuestao>(CursosTipoQuestao.TEXTO);
  const [peso, setPeso] = useState<string>("");
  const [obrigatoria, setObrigatoria] = useState(true);
  const [alternativas, setAlternativas] = useState<AlternativaForm[]>([
    { texto: "", correta: false },
    { texto: "", correta: false },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createQuestao = useCreateQuestao({ cursoId, turmaId, provaId });
  const updateQuestao = useUpdateQuestao({ cursoId, turmaId, provaId });

  const isLoading = createQuestao.isPending || updateQuestao.isPending;
  const isEditMode = !!questao;

  // Carregar dados da questão no modo edição
  useEffect(() => {
    if (questao && isOpen) {
      setEnunciado(questao.enunciado);
      setTipo(questao.tipo);
      setPeso(questao.peso?.toString() || "");
      setObrigatoria(questao.obrigatoria);
      
      if (questao.alternativas && questao.alternativas.length > 0) {
        setAlternativas(
          questao.alternativas.map((alt) => ({
            id: alt.id,
            texto: alt.texto,
            correta: alt.correta,
          }))
        );
      } else {
        setAlternativas([
          { texto: "", correta: false },
          { texto: "", correta: false },
        ]);
      }
    } else if (!questao && isOpen) {
      // Reset form no modo criação
      setEnunciado("");
      setTipo(CursosTipoQuestao.TEXTO);
      setPeso("");
      setObrigatoria(true);
      setAlternativas([
        { texto: "", correta: false },
        { texto: "", correta: false },
      ]);
    }
  }, [questao, isOpen]);

  const validarForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!enunciado.trim()) {
      newErrors.enunciado = "Enunciado é obrigatório";
    } else if (enunciado.trim().length > 2000) {
      newErrors.enunciado = "Enunciado deve ter no máximo 2000 caracteres";
    }

    if (tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA) {
      const alternativasValidas = alternativas.filter((a) => a.texto.trim().length > 0);
      
      if (alternativasValidas.length < 2) {
        newErrors.alternativas = "Questões de múltipla escolha precisam de pelo menos 2 alternativas";
      }

      const corretas = alternativasValidas.filter((a) => a.correta).length;
      if (corretas !== 1) {
        newErrors.alternativas = "Deve haver exatamente 1 alternativa correta";
      }

      // Validar cada alternativa
      alternativas.forEach((alt, index) => {
        if (alt.texto.trim() && alt.texto.trim().length > 1000) {
          newErrors[`alternativa-${index}`] = "Alternativa deve ter no máximo 1000 caracteres";
        }
      });
    }

    if (peso && (parseFloat(peso) <= 0 || parseFloat(peso) > 1000)) {
      newErrors.peso = "Peso deve ser maior que 0 e menor ou igual a 1000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarForm()) {
      return;
    }

    try {
      const payload: CreateQuestaoPayload | UpdateQuestaoPayload = {
        enunciado: enunciado.trim(),
        tipo,
        obrigatoria,
      };

      if (peso && parseFloat(peso) > 0) {
        payload.peso = parseFloat(peso);
      }

      if (tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA) {
        const alternativasValidas = alternativas
          .filter((a) => a.texto.trim().length > 0)
          .map((alt, index) => ({
            texto: alt.texto.trim(),
            ordem: index + 1,
            correta: alt.correta,
          }));

        if (isEditMode && questao) {
          // No modo edição, incluir IDs das alternativas existentes
          (payload as UpdateQuestaoPayload).alternativas = alternativasValidas.map((alt, index) => {
            const originalAlt = questao.alternativas?.find((a) => a.ordem === index + 1);
            return {
              id: originalAlt?.id,
              texto: alt.texto,
              ordem: alt.ordem,
              correta: alt.correta,
            };
          });
        } else {
          (payload as CreateQuestaoPayload).alternativas = alternativasValidas;
        }
      }

      if (isEditMode && questao) {
        await updateQuestao.mutateAsync({
          questaoId: questao.id,
          payload: payload as UpdateQuestaoPayload,
        });
        toastCustom.success("Questão atualizada com sucesso!");
      } else {
        await createQuestao.mutateAsync(payload as CreateQuestaoPayload);
        toastCustom.success("Questão criada com sucesso!");
      }

      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.message || "Erro ao salvar questão. Tente novamente.";
      toastCustom.error(errorMessage);
    }
  };

  const handleAddAlternativa = () => {
    setAlternativas([...alternativas, { texto: "", correta: false }]);
  };

  const handleRemoveAlternativa = (index: number) => {
    if (alternativas.length <= 2) {
      toastCustom.warning("Questões de múltipla escolha precisam de pelo menos 2 alternativas");
      return;
    }
    setAlternativas(alternativas.filter((_, i) => i !== index));
  };

  const handleAlternativaChange = (
    index: number,
    field: "texto" | "correta",
    value: string | boolean
  ) => {
    const novas = [...alternativas];
    if (field === "correta" && value === true) {
      // Marcar apenas esta como correta, desmarcar as outras
      novas.forEach((alt, i) => {
        alt.correta = i === index;
      });
    } else {
      novas[index][field] = value as never;
    }
    setAlternativas(novas);
  };

  return (
    <ModalCustom isOpen={isOpen} onOpenChange={setIsOpen} size="2xl">
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-semibold">
            {isEditMode ? "Editar Questão" : "Nova Questão"}
          </h2>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Enunciado */}
          <div className="space-y-2">
            <Label htmlFor="enunciado">
              Enunciado <span className="text-destructive">*</span>
            </Label>
            <SimpleTextarea
              id="enunciado"
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
              placeholder="Digite o enunciado da questão..."
              rows={4}
              maxLength={2000}
              showCharCount
              error={errors.enunciado}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo <span className="text-destructive">*</span>
            </Label>
            <SelectCustom
              id="tipo"
              value={tipo}
              onChange={(value) => {
                setTipo(value as CursosTipoQuestao);
                // Reset alternativas se mudar de múltipla escolha
                if (value !== CursosTipoQuestao.MULTIPLA_ESCOLHA) {
                  setAlternativas([
                    { texto: "", correta: false },
                    { texto: "", correta: false },
                  ]);
                }
              }}
              options={TIPO_QUESTAO_OPTIONS}
              placeholder="Selecione o tipo"
            />
          </div>

          {/* Peso */}
          <div className="space-y-2">
            <Label htmlFor="peso">Peso (opcional)</Label>
            <InputCustom
              id="peso"
              type="number"
              min="0.1"
              max="1000"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="Ex: 1.5"
              error={errors.peso}
            />
            <p className="text-xs text-gray-500">
              Peso da questão na avaliação (opcional, entre 0.1 e 1000)
            </p>
          </div>

          {/* Obrigatória */}
          <div className="flex items-center gap-2">
            <Switch
              id="obrigatoria"
              checked={obrigatoria}
              onCheckedChange={setObrigatoria}
            />
            <Label htmlFor="obrigatoria" className="cursor-pointer">
              Questão obrigatória
            </Label>
          </div>

          {/* Alternativas (apenas para múltipla escolha) */}
          {tipo === CursosTipoQuestao.MULTIPLA_ESCOLHA && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Alternativas <span className="text-destructive">*</span>
                </Label>
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  icon="Plus"
                  onClick={handleAddAlternativa}
                >
                  Adicionar Alternativa
                </ButtonCustom>
              </div>

              {errors.alternativas && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.alternativas}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {alternativas.map((alt, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg",
                      alt.correta && "bg-green-50 border-green-200"
                    )}
                  >
                    <div className="flex-1 space-y-2">
                      <InputCustom
                        value={alt.texto}
                        onChange={(e) =>
                          handleAlternativaChange(index, "texto", e.target.value)
                        }
                        placeholder={`Alternativa ${index + 1}`}
                        maxLength={1000}
                        error={errors[`alternativa-${index}`]}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={alt.correta}
                          onChange={() =>
                            handleAlternativaChange(index, "correta", true)
                          }
                          className="cursor-pointer"
                        />
                        <Label className="text-sm cursor-pointer">
                          Marcar como correta
                        </Label>
                      </div>
                    </div>
                    {alternativas.length > 2 && (
                      <ButtonCustom
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => handleRemoveAlternativa(index)}
                        className="shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <ButtonCustom
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isEditMode ? "Atualizar" : "Criar"} Questão
          </ButtonCustom>
        </ModalFooter>
      </ModalContent>
    </ModalCustom>
  );
}

