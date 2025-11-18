"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ButtonCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { SelectCustom } from "@/components/ui/custom/select";
import { toastCustom } from "@/components/ui/custom";
import { createCurso, type CreateCursoPayload } from "@/api/cursos";
import { useCursoCategorias } from "../hooks/useCursoCategorias";
import { useCursoSubcategorias } from "../hooks/useCursoSubcategorias";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { FileUpload, type FileUploadItem } from "@/components/ui/custom/file-upload";
import { uploadImage, deleteImage } from "@/services/upload";
import { queryKeys } from "@/lib/react-query/queryKeys";

type StatusPadrao = "PUBLICADO" | "RASCUNHO";

interface FormData {
  nome: string;
  descricao: string;
  cargaHoraria: string;
  categoriaId: string | null;
  subcategoriaId: string | null;
  estagioObrigatorio: boolean;
  statusPadrao: StatusPadrao | null;
}

const initialFormData: FormData = {
  nome: "",
  descricao: "",
  cargaHoraria: "",
  categoriaId: null,
  subcategoriaId: null,
  estagioObrigatorio: false,
  statusPadrao: "PUBLICADO",
};

export interface CreateCursoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCursoForm({ onSuccess, onCancel }: CreateCursoFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "imagemUrl", string>>>({});
  const [imagemFiles, setImagemFiles] = useState<FileUploadItem[]>([]);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);

  const { categoriaOptions, isLoading: isLoadingCategorias } = useCursoCategorias();
  const { subcategoriaOptions, isLoading: isLoadingSubcategorias } = useCursoSubcategorias(
    formData.categoriaId ? Number(formData.categoriaId) : null,
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | "imagemUrl", string>> = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
    const carga = Number(formData.cargaHoraria);
    if (!Number.isFinite(carga) || carga <= 0) newErrors.cargaHoraria = "Informe um número positivo";
    if (!formData.categoriaId) newErrors.categoriaId = "Selecione a categoria";
    if (!formData.subcategoriaId) newErrors.subcategoriaId = "Selecione a subcategoria";
    if (!formData.statusPadrao) newErrors.statusPadrao = "Selecione o status";
    // Valida se há arquivo selecionado OU imagemUrl existente
    if (!imagemFiles[0]?.file && !imagemUrl) {
      newErrors.imagemUrl = "Imagem do curso é obrigatória";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    
    let finalImageUrl = imagemUrl;
    
    try {
      // Faz upload da imagem se houver arquivo novo
      const fileItem = imagemFiles[0];
      if (fileItem?.file) {
        try {
          const uploadResult = await uploadImage(
            fileItem.file,
            "cursos",
            imagemUrl || undefined
          );
          finalImageUrl = uploadResult.url;
          setImagemUrl(finalImageUrl);
        } catch (uploadError) {
          toastCustom.error({
            title: "Erro no upload",
            description: "Não foi possível fazer upload da imagem. Tente novamente.",
          });
          setIsLoading(false);
          return;
        }
      }

      const payload: CreateCursoPayload = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        cargaHoraria: Number(formData.cargaHoraria),
        categoriaId: Number(formData.categoriaId),
        subcategoriaId: formData.subcategoriaId ? Number(formData.subcategoriaId) : undefined,
        estagioObrigatorio: formData.estagioObrigatorio || false,
        statusPadrao: (formData.statusPadrao || "PUBLICADO") as StatusPadrao,
        // Sempre inclui imagemUrl se tiver valor válido
        ...(finalImageUrl && finalImageUrl.trim() !== "" ? { imagemUrl: finalImageUrl.trim() } : {}),
      };

      // Debug em desenvolvimento
      if (process.env.NODE_ENV === "development") {
        console.log("[CreateCursoForm] Payload sendo enviado:", payload);
        console.log("[CreateCursoForm] imagemUrl:", finalImageUrl);
      }

      await createCurso(payload);
      
      // Invalida todas as queries de listagem de cursos para atualizar a lista
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "admin-cursos-list";
        },
      });
      
      toastCustom.success({ title: "Curso cadastrado com sucesso!", description: `O curso "${payload.nome}" foi criado.` });
      setFormData(initialFormData);
      setImagemUrl(null);
      setImagemFiles([]);
      onSuccess?.();
    } catch (error: any) {
      const message = error?.message || "Não foi possível criar o curso.";
      toastCustom.error({ title: "Erro ao cadastrar curso", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={isLoading} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-md font-medium text-foreground">Configurações do Curso</span>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="statusPadrao" className={cn("text-xs font-medium px-2 py-1 rounded-full transition-colors", formData.statusPadrao === "PUBLICADO" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>{formData.statusPadrao === "PUBLICADO" ? "Publicado" : "Rascunho"}</Label>
                <Switch id="statusPadrao" checked={formData.statusPadrao === "PUBLICADO"} onCheckedChange={(checked) => handleInputChange("statusPadrao", (checked ? "PUBLICADO" : "RASCUNHO") as StatusPadrao)} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Imagem do curso <span className="text-red-500">*</span>
                </Label>
                <FileUpload
                  files={imagemFiles}
                  validation={{ maxSize: 5 * 1024 * 1024, accept: [".jpg", ".png", ".webp"], maxFiles: 1 }}
                  maxFiles={1}
                  multiple={false}
                  showPreview
                  showProgress={false}
                  autoUpload={false}
                  onFilesChange={(files) => {
                    setImagemFiles(files);
                    if (errors.imagemUrl) {
                      setErrors((prev) => ({ ...prev, imagemUrl: undefined }));
                    }
                  }}
                  onFileRemove={async () => { 
                    if (imagemUrl) { 
                      try { 
                        await deleteImage(imagemUrl); 
                      } catch {} 
                    } 
                    setImagemUrl(null);
                    setImagemFiles([]);
                  }}
                />
                {errors.imagemUrl && (
                  <p className="text-sm text-destructive mt-1">{errors.imagemUrl}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputCustom label="Nome do Curso" name="nome" value={formData.nome} onChange={(e) => handleInputChange("nome", e.target.value)} error={errors.nome} required placeholder="Ex.: Excel Avançado" />
                </div>

                <SelectCustom label="Categoria" placeholder={isLoadingCategorias ? "Carregando..." : "Selecionar"} options={categoriaOptions} value={formData.categoriaId} onChange={(val) => handleInputChange("categoriaId", val)} error={errors.categoriaId} required />
                <SelectCustom label="Subcategoria" placeholder={formData.categoriaId ? (isLoadingSubcategorias ? "Carregando..." : "Selecionar") : "Selecione uma categoria"} options={subcategoriaOptions} value={formData.subcategoriaId} onChange={(val) => handleInputChange("subcategoriaId", val)} disabled={!formData.categoriaId || isLoadingSubcategorias} error={errors.subcategoriaId} required />

                <InputCustom label="Carga horária (horas)" name="cargaHoraria" value={formData.cargaHoraria} onChange={(e) => handleInputChange("cargaHoraria", e.target.value)} error={errors.cargaHoraria} required placeholder="40" type="number" />
                <SelectCustom label="Estágio" options={[{ value: "true", label: "Estágio obrigatório" }, { value: "false", label: "Estágio não obrigatório" }]} value={String(formData.estagioObrigatorio)} required onChange={(val) => handleInputChange("estagioObrigatorio", val === "true")} />

                <div className="md:col-span-2">
                  <SimpleTextarea label="Descrição" placeholder="Descreva o conteúdo e objetivos do curso" value={formData.descricao} onChange={(e) => handleInputChange("descricao", (e.target as HTMLTextAreaElement).value)} maxLength={800} showCharCount error={errors.descricao} required />
                </div>
              </div>
            </div>
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
              <ButtonCustom type="submit" size="md" variant="primary" isLoading={isLoading}>{isLoading ? "Cadastrando..." : "Cadastrar"}</ButtonCustom>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default CreateCursoForm;
