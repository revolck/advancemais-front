"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ButtonCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { RichTextarea } from "@/components/ui/custom/text-area";
import { SelectCustom } from "@/components/ui/custom/select";
import { toastCustom } from "@/components/ui/custom";
import {
  createCurso,
  updateCurso,
  type CreateCursoPayload,
  type UpdateCursoPayload,
  type Curso,
} from "@/api/cursos";
import { useCursoCategorias } from "../hooks/useCursoCategorias";
import { useCursoSubcategorias } from "../hooks/useCursoSubcategorias";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import {
  FileUpload,
  type FileUploadItem,
} from "@/components/ui/custom/file-upload";
import { uploadImage, deleteImage } from "@/services/upload";
import { Skeleton } from "@/components/ui/skeleton";

type StatusPadrao = "PUBLICADO" | "RASCUNHO";
type TipoCurso = "PAGO" | "GRATUITO";

interface FormData {
  nome: string;
  descricao: string;
  descricaoHtml?: string;
  cargaHoraria: string;
  categoriaId: string | null;
  subcategoriaId: string | null;
  estagioObrigatorio: boolean;
  statusPadrao: StatusPadrao | null;
  // Campos de precificação
  tipoCurso: TipoCurso;
  valor: string;
  valorPromocional: string;
}

const initialFormData: FormData = {
  nome: "",
  descricao: "",
  cargaHoraria: "",
  categoriaId: null,
  subcategoriaId: null,
  estagioObrigatorio: false,
  statusPadrao: "PUBLICADO",
  // Valores padrão de precificação
  tipoCurso: "PAGO",
  valor: "",
  valorPromocional: "",
};

// Converte valor mascarado (R$ 299,90) para número (299.90)
const parseCurrencyToNumber = (value: string): number => {
  if (!value) return 0;
  // Remove "R$", pontos de milhar e espaços, troca vírgula por ponto
  const cleaned = value
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

export interface CreateCursoFormProps {
  mode?: "create" | "edit";
  cursoId?: string;
  initialData?: Curso & {
    categoria?: { id: number; nome: string };
    subcategoria?: { id: number; nome: string };
    estagioObrigatorio?: boolean;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCursoForm({
  mode = "create",
  cursoId,
  initialData,
  onSuccess,
  onCancel,
}: CreateCursoFormProps) {
  const queryClient = useQueryClient();

  // Preparar dados iniciais baseado no modo
  const prepareInitialFormData = (): FormData => {
    if (mode === "edit" && initialData) {
      const isGratuito =
        initialData.gratuito ||
        (initialData.valor === 0 && !initialData.gratuito);
      return {
        nome: initialData.nome || "",
        descricao: initialData.descricao || "",
        cargaHoraria: initialData.cargaHoraria?.toString() || "",
        categoriaId: initialData.categoriaId?.toString() || null,
        subcategoriaId: initialData.subcategoriaId?.toString() || null,
        estagioObrigatorio: initialData.estagioObrigatorio || false,
        statusPadrao: (initialData.statusPadrao as StatusPadrao) || "PUBLICADO",
        tipoCurso: isGratuito ? "GRATUITO" : "PAGO",
        valor: initialData.valor > 0 ? initialData.valor.toString() : "",
        valorPromocional: initialData.valorPromocional
          ? initialData.valorPromocional.toString()
          : "",
      };
    }
    return initialFormData;
  };

  const [formData, setFormData] = useState<FormData>(prepareInitialFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | "imagemUrl", string>>
  >({});

  // Carregar imagem existente no modo de edição
  const prepareInitialImage = (): FileUploadItem[] => {
    if (mode === "edit" && initialData?.imagemUrl) {
      const fileName = initialData.imagemUrl.split("/").pop() || "Imagem atual";
      return [
        {
          id: "existing-image",
          name: fileName,
          size: 0,
          type: "image/*",
          status: "completed" as const,
          progress: 100,
          uploadDate: new Date(),
          uploadedUrl: initialData.imagemUrl,
          previewUrl: initialData.imagemUrl,
        },
      ];
    }
    return [];
  };

  const [imagemFiles, setImagemFiles] = useState<FileUploadItem[]>(
    prepareInitialImage()
  );
  const [imagemUrl, setImagemUrl] = useState<string | null>(
    mode === "edit" && initialData?.imagemUrl ? initialData.imagemUrl : null
  );
  const [oldImageUrl, setOldImageUrl] = useState<string | undefined>(
    mode === "edit" && initialData?.imagemUrl
      ? initialData.imagemUrl
      : undefined
  );
  const [imageRemoved, setImageRemoved] = useState(false); // Rastreia se usuário removeu a imagem

  const { categoriaOptions, isLoading: isLoadingCategorias } =
    useCursoCategorias();
  const { subcategoriaOptions, isLoading: isLoadingSubcategorias } =
    useCursoSubcategorias(
      formData.categoriaId ? Number(formData.categoriaId) : null
    );

  const isGratuito = formData.tipoCurso === "GRATUITO";

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | "imagemUrl", string>> = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (formData.nome.trim().length > 200)
      newErrors.nome = "Nome deve ter no máximo 200 caracteres";
    if (!formData.descricao.trim())
      newErrors.descricao = "Descrição é obrigatória";
    const carga = Number(formData.cargaHoraria);
    if (!Number.isFinite(carga) || carga <= 0)
      newErrors.cargaHoraria = "Informe um número positivo";
    if (!formData.categoriaId) newErrors.categoriaId = "Selecione a categoria";
    if (!formData.statusPadrao) newErrors.statusPadrao = "Selecione o status";
    if (!imagemFiles[0]?.file && !imagemUrl) {
      newErrors.imagemUrl = "Imagem do curso é obrigatória";
    }

    // Validação de precificação (apenas se não for gratuito)
    if (!isGratuito) {
      const valorNum = parseCurrencyToNumber(formData.valor);
      if (!formData.valor || valorNum <= 0) {
        newErrors.valor = "Informe o valor do curso";
      }

      // Validar valor promocional (se preenchido)
      if (formData.valorPromocional) {
        const valorPromNum = parseCurrencyToNumber(formData.valorPromocional);
        if (valorPromNum >= valorNum) {
          newErrors.valorPromocional =
            "Valor promocional deve ser menor que o original";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleTipoCursoChange = (value: string | null) => {
    if (!value) return;
    const tipoCurso = value as TipoCurso;
    setFormData((prev) => ({
      ...prev,
      tipoCurso,
      valor: tipoCurso === "GRATUITO" ? "0" : prev.valor,
      valorPromocional: tipoCurso === "GRATUITO" ? "" : prev.valorPromocional,
    }));
    if (errors.valor) setErrors((prev) => ({ ...prev, valor: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setLoadingStep(
      mode === "edit" ? "Salvando alterações..." : "Criando curso..."
    );

    let finalImageUrl: string | null = imagemUrl;

    try {
      // PASSO 1: Verifica se usuário removeu a imagem sem adicionar nova
      if (imageRemoved && imagemFiles.length === 0) {
        toastCustom.error({
          title: "Imagem obrigatória",
          description: "Por favor, adicione uma imagem para o curso.",
        });
        setIsLoading(false);
        setLoadingStep("");
        return;
      }

      // PASSO 2: Faz upload da imagem PRIMEIRO se houver arquivo novo
      const fileItem = imagemFiles[0];
      if (fileItem?.file) {
        try {
          setLoadingStep("Fazendo upload da imagem...");
          if (process.env.NODE_ENV === "development") {
            console.log("[CreateCursoForm] Iniciando upload da imagem...");
          }

          const uploadResult = await uploadImage(
            fileItem.file,
            "cursos",
            mode === "edit" ? oldImageUrl : imagemUrl || undefined
          );

          if (!uploadResult?.url || uploadResult.url.trim() === "") {
            throw new Error("URL da imagem não foi retornada pelo servidor");
          }

          finalImageUrl = uploadResult.url.trim();
          setImagemUrl(finalImageUrl);

          if (process.env.NODE_ENV === "development") {
            console.log(
              "[CreateCursoForm] Upload concluído. URL:",
              finalImageUrl
            );
          }
        } catch (uploadError: any) {
          const errorMessage =
            uploadError?.message ||
            "Não foi possível fazer upload da imagem. Tente novamente.";

          if (process.env.NODE_ENV === "development") {
            console.error("[CreateCursoForm] Erro no upload:", uploadError);
          }

          toastCustom.error({
            title: "Erro no upload",
            description: errorMessage,
          });
          setIsLoading(false);
          setLoadingStep("");
          return;
        }
      }

      // Valida se temos uma URL válida antes de continuar
      if (!finalImageUrl || finalImageUrl.trim() === "") {
        toastCustom.error({
          title: "Imagem obrigatória",
          description: "Por favor, adicione uma imagem para o curso.",
        });
        setIsLoading(false);
        setLoadingStep("");
        return;
      }

      // PASSO 3: Constrói o payload
      const payload: CreateCursoPayload = {
        nome: formData.nome.trim(),
        descricao: formData.descricaoHtml?.trim() || formData.descricao.trim(),
        cargaHoraria: Number(formData.cargaHoraria),
        categoriaId: Number(formData.categoriaId),
        subcategoriaId: formData.subcategoriaId
          ? Number(formData.subcategoriaId)
          : undefined,
        estagioObrigatorio: formData.estagioObrigatorio || false,
        statusPadrao: (formData.statusPadrao || "PUBLICADO") as StatusPadrao,
        imagemUrl: finalImageUrl.trim(),
        // Campos de precificação
        valor: isGratuito ? 0 : parseCurrencyToNumber(formData.valor),
        valorPromocional: formData.valorPromocional
          ? parseCurrencyToNumber(formData.valorPromocional)
          : undefined,
        gratuito: isGratuito,
      };

      // Debug em desenvolvimento
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[CreateCursoForm] Payload completo sendo enviado:",
          payload
        );
      }

      // PASSO 4: Envia o payload completo para a API
      setLoadingStep(
        mode === "edit" ? "Salvando alterações..." : "Criando curso..."
      );
      if (mode === "edit" && cursoId) {
        await updateCurso(cursoId, payload as UpdateCursoPayload);

        // Invalida queries de listagem e detalhes
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              (key[0] === "admin-cursos-list" ||
                key[0] === "admin-curso-detail")
            );
          },
        });

        // Invalida a query de auditoria do curso
        await queryClient.invalidateQueries({
          queryKey: ["curso-auditoria", cursoId],
        });

        toastCustom.success({
          title: "Curso atualizado com sucesso!",
          description: `O curso "${payload.nome}" foi atualizado.`,
        });
      } else {
        setLoadingStep("Criando curso...");
        await createCurso(payload);

        // Invalida todas as queries de listagem de cursos para atualizar a lista
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === "admin-cursos-list";
          },
        });

        toastCustom.success({
          title: "Curso cadastrado com sucesso!",
          description: `O curso "${payload.nome}" foi criado.`,
        });
      }
      setLoadingStep("Finalizando...");
      setFormData(initialFormData);
      setImagemUrl(null);
      setImagemFiles([]);
      onSuccess?.();
    } catch (error: any) {
      const message = error?.message || "Não foi possível criar o curso.";
      toastCustom.error({
        title: "Erro ao cadastrar curso",
        description: message,
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 relative">
      <FormLoadingModal
        isLoading={isLoading}
        title={mode === "edit" ? "Salvando..." : "Criando curso..."}
        loadingStep={loadingStep}
        icon={BookOpen}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isLoading} className="space-y-6">
          {/* Header - Configurações do Curso */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-md font-medium text-foreground">
                Configurações do Curso
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="statusPadrao"
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                  formData.statusPadrao === "PUBLICADO"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {formData.statusPadrao === "PUBLICADO"
                  ? "Publicado"
                  : "Rascunho"}
              </Label>
              <Switch
                id="statusPadrao"
                checked={formData.statusPadrao === "PUBLICADO"}
                onCheckedChange={(checked) =>
                  handleInputChange(
                    "statusPadrao",
                    (checked ? "PUBLICADO" : "RASCUNHO") as StatusPadrao
                  )
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Imagem do curso */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Imagem do curso <span className="text-red-500">*</span>
              </Label>
              <FileUpload
                files={imagemFiles}
                validation={{
                  maxSize: 5 * 1024 * 1024,
                  accept: [".jpg", ".png", ".webp"],
                  maxFiles: 1,
                }}
                maxFiles={1}
                multiple={false}
                showPreview
                showProgress={false}
                autoUpload={false}
                onFilesChange={(files) => {
                  setImagemFiles(files);
                  // Se adicionou um novo arquivo, marca que não está mais removido
                  if (files.length > 0 && files[0]?.file) {
                    setImageRemoved(false);
                  }
                  if (errors.imagemUrl) {
                    setErrors((prev) => ({ ...prev, imagemUrl: undefined }));
                  }
                }}
                onFileRemove={() => {
                  // Não deleta a imagem imediatamente
                  // Apenas marca que foi removida e limpa o estado local
                  // A deleção será feita no submit se houver nova imagem
                  setImagemFiles([]);
                  setImageRemoved(true);
                }}
              />
              {errors.imagemUrl && (
                <p className="text-sm text-destructive mt-1">
                  {errors.imagemUrl}
                </p>
              )}
            </div>

            {/* Nome do Curso */}
            <InputCustom
              label="Nome do Curso"
              name="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              error={errors.nome}
              required
              placeholder="Ex.: Excel Avançado"
              maxLength={200}
            />

            {/* Linha 1: Categoria, Subcategoria, Carga horária, Estágio */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-[0.35] min-w-0">
                <SelectCustom
                  label="Categoria"
                  placeholder={
                    isLoadingCategorias ? "Carregando..." : "Selecionar"
                  }
                  options={categoriaOptions}
                  value={formData.categoriaId}
                  onChange={(val) => handleInputChange("categoriaId", val)}
                  error={errors.categoriaId}
                  required
                />
              </div>
              <div className="flex-[0.35] min-w-0">
                <SelectCustom
                  label="Subcategoria"
                  placeholder={
                    !formData.categoriaId
                      ? "Selecione uma categoria"
                      : isLoadingSubcategorias
                      ? "Carregando..."
                      : subcategoriaOptions.length === 0
                      ? "Nenhuma subcategoria"
                      : "Selecionar"
                  }
                  options={subcategoriaOptions}
                  value={formData.subcategoriaId}
                  onChange={(val) => handleInputChange("subcategoriaId", val)}
                  disabled={
                    !formData.categoriaId ||
                    isLoadingSubcategorias ||
                    subcategoriaOptions.length === 0
                  }
                  error={errors.subcategoriaId}
                />
              </div>
              <div className="flex-[0.15] min-w-0">
                <InputCustom
                  label="Carga horária"
                  name="cargaHoraria"
                  value={formData.cargaHoraria}
                  onChange={(e) =>
                    handleInputChange("cargaHoraria", e.target.value)
                  }
                  error={errors.cargaHoraria}
                  required
                  placeholder="40"
                  type="number"
                />
              </div>
              <div className="flex-[0.15] min-w-0">
                <SelectCustom
                  label="Estágio"
                  options={[
                    { value: "false", label: "Não obrigatório" },
                    { value: "true", label: "Obrigatório" },
                  ]}
                  value={String(formData.estagioObrigatorio)}
                  required
                  onChange={(val) =>
                    handleInputChange("estagioObrigatorio", val === "true")
                  }
                />
              </div>
            </div>

            {/* Linha 2: Tipo de Curso, Valor, Valor Promocional */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-[0.25] min-w-0">
                <SelectCustom
                  label="Tipo de Curso"
                  options={[
                    { value: "PAGO", label: "💰 Curso Pago" },
                    { value: "GRATUITO", label: "🎁 Curso Gratuito" },
                  ]}
                  value={formData.tipoCurso}
                  onChange={handleTipoCursoChange}
                  required
                />
              </div>
              <div className="flex-[0.375] min-w-0">
                <InputCustom
                  label="Valor do Curso"
                  name="valor"
                  value={isGratuito ? "R$ 0,00" : formData.valor}
                  onChange={(e) => handleInputChange("valor", e.target.value)}
                  error={errors.valor}
                  required={!isGratuito}
                  mask="money"
                  disabled={isGratuito}
                />
              </div>
              <div className="flex-[0.375] min-w-0">
                <InputCustom
                  label="Valor Promocional"
                  name="valorPromocional"
                  value={isGratuito ? "" : formData.valorPromocional}
                  onChange={(e) =>
                    handleInputChange("valorPromocional", e.target.value)
                  }
                  error={errors.valorPromocional}
                  mask="money"
                  disabled={isGratuito}
                />
              </div>
            </div>

            {/* Descrição */}
            <RichTextarea
              label="Descrição"
              placeholder="Descreva o conteúdo e objetivos do curso"
              value={formData.descricao}
              onChange={(e) =>
                handleInputChange(
                  "descricao",
                  (e.target as HTMLTextAreaElement).value
                )
              }
              onHtmlChange={(html) => {
                setFormData((prev) => ({ ...prev, descricaoHtml: html }));
              }}
              maxLength={800}
              showCharCount
              error={errors.descricao}
              required
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-2">
            <ButtonCustom
              type="button"
              size="md"
              variant="outline"
              onClick={() => onCancel?.()}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="submit"
              size="md"
              variant="primary"
              isLoading={isLoading}
            >
              {isLoading
                ? mode === "edit"
                  ? "Salvando..."
                  : "Cadastrando..."
                : mode === "edit"
                ? "Salvar Alterações"
                : "Cadastrar"}
            </ButtonCustom>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default CreateCursoForm;
