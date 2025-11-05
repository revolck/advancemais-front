"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { SelectCustom } from "@/components/ui/custom/select";
import { toastCustom } from "@/components/ui/custom";
import { updateCurso, type UpdateCursoPayload, type Curso } from "@/api/cursos";
import { useCursoCategorias } from "../../lista-cursos/hooks/useCursoCategorias";
import { useCursoSubcategorias } from "../../lista-cursos/hooks/useCursoSubcategorias";
import { Label } from "@/components/ui/label";
import {
  FileUpload,
  type FileUploadItem,
} from "@/components/ui/custom/file-upload";
import { deleteImage } from "@/services/upload";
import { Switch } from "@/components/ui/switch";
import { queryKeys } from "@/lib/react-query/queryKeys";

interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  curso: Curso & {
    categoria?: { id: number; nome: string };
    subcategoria?: { id: number; nome: string };
    estagioObrigatorio?: boolean;
  };
}

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

export function EditCursoModal({
  isOpen,
  onClose,
  onSuccess,
  curso,
}: EditCursoModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    descricao: "",
    cargaHoraria: "",
    categoriaId: null,
    subcategoriaId: null,
    estagioObrigatorio: false,
    statusPadrao: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [imagemFiles, setImagemFiles] = useState<FileUploadItem[]>([]);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);

  const { categoriaOptions, isLoading: isLoadingCategorias } =
    useCursoCategorias();
  const { subcategoriaOptions, isLoading: isLoadingSubcategorias } =
    useCursoSubcategorias(
      formData.categoriaId ? Number(formData.categoriaId) : null
    );

  // Preencher formulário com dados do curso
  useEffect(() => {
    if (curso && isOpen) {
      setFormData({
        nome: curso.nome || "",
        descricao: curso.descricao || "",
        cargaHoraria: curso.cargaHoraria?.toString() || "",
        categoriaId: curso.categoriaId?.toString() || null,
        subcategoriaId: curso.subcategoriaId?.toString() || null,
        estagioObrigatorio: curso.estagioObrigatorio || false,
        statusPadrao: (curso.statusPadrao as StatusPadrao) || "PUBLICADO",
      });
      setErrors({});

      // Carregar imagem existente se houver
      if (curso.imagemUrl) {
        setImagemUrl(curso.imagemUrl);
        setImagemFiles([
          {
            id: "existing-image",
            name: "Imagem atual",
            size: 0,
            type: "image/*",
            status: "completed" as const,
            progress: 100,
            uploadDate: new Date(),
            uploadedUrl: curso.imagemUrl,
          },
        ]);
      } else {
        setImagemUrl(null);
        setImagemFiles([]);
      }
    }
  }, [curso, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    const nome = formData.nome.trim();
    if (!nome) newErrors.nome = "Nome é obrigatório";

    const descricao = formData.descricao.trim();
    if (!descricao) newErrors.descricao = "Descrição é obrigatória";

    const carga = Number(formData.cargaHoraria);
    if (!Number.isFinite(carga) || carga <= 0) {
      newErrors.cargaHoraria = "Carga horária deve ser um número positivo";
    }

    if (!formData.categoriaId) newErrors.categoriaId = "Selecione a categoria";
    if (!formData.subcategoriaId)
      newErrors.subcategoriaId = "Selecione a subcategoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateImage = (): boolean => {
    if (!imagemUrl) {
      toastCustom.error({
        title: "Imagem obrigatória",
        description: "Por favor, adicione uma imagem para o curso.",
      });
      return false;
    }
    return true;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!validateImage()) return;

    setIsLoading(true);
    try {
      const payload: UpdateCursoPayload = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        cargaHoraria: Number(formData.cargaHoraria),
        categoriaId: Number(formData.categoriaId),
        subcategoriaId: formData.subcategoriaId
          ? Number(formData.subcategoriaId)
          : undefined,
        estagioObrigatorio: formData.estagioObrigatorio || false,
        statusPadrao: (formData.statusPadrao || "PUBLICADO") as StatusPadrao,
        imagemUrl: imagemUrl || undefined,
      };

      await updateCurso(curso.id, payload);

      // Invalida todas as queries de listagem de cursos e detalhes para atualizar
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && 
            (key[0] === "admin-cursos-list" || key[0] === "admin-curso-detail");
        },
      });

      toastCustom.success({
        title: "Curso atualizado com sucesso!",
        description: `O curso "${payload.nome}" foi atualizado.`,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message = error?.message || "Não foi possível atualizar o curso.";
      toastCustom.error({
        title: "Erro ao atualizar curso",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Editar Curso</ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-6">
            <div className="space-y-4">
              {/* Upload de Imagem */}
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
                  autoUpload
                  publicUrl="website/curso/imagem"
                  onFilesChange={(files) => setImagemFiles(files)}
                  onFileRemove={async () => {
                    if (imagemUrl) {
                      try {
                        await deleteImage(imagemUrl);
                      } catch {}
                    }
                    setImagemUrl(null);
                  }}
                  onUploadComplete={async (file) => {
                    if (file?.uploadedUrl) {
                      setImagemUrl(file.uploadedUrl);
                    }
                  }}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputCustom
                    label="Nome do Curso"
                    name="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    error={errors.nome}
                    required
                    placeholder="Ex.: Excel Avançado"
                  />
                </div>

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

                <SelectCustom
                  label="Subcategoria"
                  placeholder={
                    formData.categoriaId
                      ? isLoadingSubcategorias
                        ? "Carregando..."
                        : "Selecionar"
                      : "Selecione uma categoria"
                  }
                  options={subcategoriaOptions}
                  value={formData.subcategoriaId}
                  onChange={(val) => handleInputChange("subcategoriaId", val)}
                  disabled={!formData.categoriaId || isLoadingSubcategorias}
                  error={errors.subcategoriaId}
                  required
                />

                <InputCustom
                  label="Carga horária (horas)"
                  name="cargaHoraria"
                  value={formData.cargaHoraria}
                  onChange={(e) =>
                    handleInputChange("cargaHoraria", e.target.value)
                  }
                  error={errors.cargaHoraria}
                  required
                  placeholder="40"
                  type="number"
                  min="1"
                />

                <SelectCustom
                  label="Estágio"
                  options={[
                    { value: "true", label: "Estágio obrigatório" },
                    { value: "false", label: "Estágio não obrigatório" },
                  ]}
                  value={String(formData.estagioObrigatorio)}
                  required
                  onChange={(val) =>
                    handleInputChange("estagioObrigatorio", val === "true")
                  }
                />

                <div className="md:col-span-2">
                  <SimpleTextarea
                    label="Descrição"
                    placeholder="Descreva o conteúdo e objetivos do curso"
                    value={formData.descricao}
                    onChange={(e) =>
                      handleInputChange(
                        "descricao",
                        (e.target as HTMLTextAreaElement).value
                      )
                    }
                    maxLength={800}
                    showCharCount
                    error={errors.descricao}
                    required
                  />
                </div>
              </div>

              {/* Switch de Status */}
              <div className="flex items-center gap-6 rounded-xl border border-border/60 bg-muted/5 p-4">
                <div className="flex flex-1 flex-col gap-1">
                  <Label
                    htmlFor="curso-status"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Curso{" "}
                    {formData.statusPadrao === "PUBLICADO"
                      ? "publicado"
                      : "em rascunho"}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Define se o curso está visível para os alunos.
                  </span>
                </div>
                <Switch
                  id="curso-status"
                  checked={formData.statusPadrao === "PUBLICADO"}
                  onCheckedChange={(checked) =>
                    handleInputChange(
                      "statusPadrao",
                      checked ? "PUBLICADO" : "RASCUNHO"
                    )
                  }
                  className="cursor-pointer"
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <ButtonCustom
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom type="submit" isLoading={isLoading}>
              Salvar Alterações
            </ButtonCustom>
          </ModalFooter>
        </form>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
