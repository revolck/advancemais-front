/**
 * Slider Form Component
 * Path: src/components/ui/custom/slider-manager/components/slider-form.tsx
 */

"use client";

import type React from "react";
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/ui/custom/file-upload";
import { uploadImage, deleteImage, getImageTitle } from "@/services/upload";
import { toastCustom } from "@/components/ui/custom/toast";
import { Icon } from "@/components/ui/custom/Icons";
import type { FileUploadItem } from "@/components/ui/custom/file-upload";

import type { SliderFormProps } from "../types";
import { SLIDER_MESSAGES, SLIDER_ANIMATIONS } from "../constants";
import { SLIDER_CONFIG } from "../config";

export function SliderForm({
  slider,
  onSubmit,
  onCancel,
  isLoading = false,
  showHeader = true,
  uploadPath = "website/slider",
  entityName = "Slider",
  firstFieldLabel,
  secondFieldLabel,
  validateSecondFieldAsUrl = true,
  secondFieldRequired = false,
}: SliderFormProps) {
  // Form state
  const [formData, setFormData] = useState(() => ({
    title: slider?.title || SLIDER_CONFIG.defaultFormData.title,
    image: slider?.image || SLIDER_CONFIG.defaultFormData.image,
    url: slider?.url || SLIDER_CONFIG.defaultFormData.url,
    status: slider?.status ?? SLIDER_CONFIG.defaultFormData.status,
    position: slider?.position || SLIDER_CONFIG.defaultFormData.position,
  }));

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>(() => {
    if (slider?.image) {
      return [
        {
          id: "existing-image",
          name: slider.title || `Imagem do ${entityName}`,
          size: 0,
          type: "image/jpeg",
          status: "completed" as const,
          progress: 100,
          uploadDate: new Date(slider.createdAt || new Date()),
          uploadedUrl: slider.image,
          previewUrl: slider.image,
        },
      ];
    }
    return [];
  });

  // Guarda a URL atual para só remover do Blob após submit
  const [oldImageUrl, setOldImageUrl] = useState<string | undefined>(
    slider?.image || undefined,
  );

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accent styling by entity
  const isBanner = entityName.toLowerCase() === "banner";
  const accent = {
    bg: isBanner ? "bg-rose-500/10" : "bg-blue-500/10",
    border: isBanner ? "border-rose-500/20" : "border-blue-500/20",
    text: isBanner ? "text-rose-800" : "text-blue-800",
  } as const;

  /**
   * Validate form
   */
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = SLIDER_MESSAGES.ERROR_TITLE_REQUIRED;
    } else if (formData.title.length < 3) {
      newErrors.title = SLIDER_MESSAGES.ERROR_TITLE_MIN_LENGTH;
    } else if (formData.title.length > 100) {
      newErrors.title = SLIDER_MESSAGES.ERROR_TITLE_MAX_LENGTH;
    }

    if (validateSecondFieldAsUrl) {
      if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
        newErrors.url = SLIDER_MESSAGES.ERROR_URL_INVALID;
      }
    }
    if (secondFieldRequired) {
      if (!formData.url || !formData.url.trim()) {
        newErrors.url = newErrors.url || "Este campo é obrigatório";
      }
    }

    if (formData.url && formData.url.length > 500) {
      newErrors.url = SLIDER_MESSAGES.ERROR_URL_MAX_LENGTH;
    }

    if (!formData.image && uploadedFiles.length === 0) {
      newErrors.image = `Selecione uma imagem para o ${entityName.toLowerCase()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    formData,
    uploadedFiles,
    entityName,
    secondFieldRequired,
    validateSecondFieldAsUrl,
  ]);

  /**
   * Handle file upload changes
   */
  const handleFilesChange = useCallback((files: FileUploadItem[]) => {
    setUploadedFiles(files);

    // Update form data with the uploaded image URL
    const latestFile = files[files.length - 1];
    if (latestFile?.uploadedUrl) {
      // ✅ CORRIGIDO: Garantir que seja uma string
      setFormData((prev) => ({ ...prev, image: latestFile.uploadedUrl || "" }));
      setErrors((prev) => ({ ...prev, image: "" }));
    } else if (files.length === 0) {
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  }, []);

  /**
   * Handle input changes
   */
  const handleInputChange = useCallback(
    (field: string, value: string | number | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toastCustom.error("Por favor, corrija os erros no formulário");
        return;
      }

      try {
        setIsSubmitting(true);
        // Estratégia igual ao Sobre: só deletar/upload NO SUBMIT
        let finalImageUrl = formData.image;
        let uploadResult: { url: string; title: string } | undefined;
        const latest = uploadedFiles[uploadedFiles.length - 1];
        const previousUrl = oldImageUrl;

        if (latest?.file) {
          // Substituição: sobe novo e remove o antigo via uploadService
          uploadResult = await uploadImage(
            latest.file,
            uploadPath,
            previousUrl,
          );
          finalImageUrl = uploadResult.url;
          setFormData((prev) => ({ ...prev, image: finalImageUrl }));
          setOldImageUrl(finalImageUrl);
        } else if (!latest && !finalImageUrl && previousUrl) {
          // Usuário removeu a imagem e não enviou outra: remove do Blob ao confirmar
          await deleteImage(previousUrl);
          setOldImageUrl(undefined);
        } else if (previousUrl && !finalImageUrl) {
          // Nenhum arquivo novo e form indica vazio: mantém estado vazio
          // (sem upload nem alteração de URL)
        } else if (previousUrl) {
          // Mantém a imagem existente
          uploadResult = { url: previousUrl, title: getImageTitle(previousUrl) };
          finalImageUrl = previousUrl;
        }

        await onSubmit({ ...formData, image: finalImageUrl || "", content: "" });

        setShowSuccess(true);
        setTimeout(
          () => setShowSuccess(false),
          SLIDER_CONFIG.animations.successMessageDuration
        );
      } catch (error) {
        console.error("Erro ao salvar slider:", error);
        // Toast será mostrado pelo hook use-slider-manager
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      onSubmit,
      uploadedFiles,
      validateForm,
      oldImageUrl,
      uploadPath,
    ]
  );

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    // Reset form state
    setFormData(SLIDER_CONFIG.defaultFormData);
    setUploadedFiles([]);
    setErrors({});
    setShowSuccess(false);

    onCancel();
  }, [onCancel]);

  // Enable submit only when required fields are ready
  const canSubmit = useMemo(() => {
    const hasTitle = formData.title.trim().length >= 3;
    const hasImageSelected = Boolean(formData.image) || uploadedFiles.length > 0;
    return hasTitle && hasImageSelected && !isLoading && !isSubmitting;
  }, [formData.title, formData.image, uploadedFiles.length, isLoading, isSubmitting]);

  return (
    <div className="p-3">
      {/* Header (optional) */}
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {slider ? `Editar ${entityName}` : `Criar Novo ${entityName}`}
          </h2>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <motion.div {...SLIDER_ANIMATIONS.SLIDE_UP} className="mb-6">
          <Alert className="border-secondary/30 bg-secondary/10 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-secondary" />
            <AlertDescription className="text-secondary-foreground text-base">
              {entityName} {slider ? "atualizado" : "criado"} com sucesso!
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Slider Settings Header */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${accent.bg} ${accent.border}`}>
              <ImageIcon className={`h-4 w-4 ${accent.text}`} />
            </div>
            <span className="text-md font-medium text-foreground">
              Configurações do {entityName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Label
              htmlFor="status"
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                formData.status
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {formData.status ? "Ativo" : "Desativado"}
            </Label>
            <Switch
              id="status"
              checked={formData.status}
              onCheckedChange={(checked) =>
                handleInputChange("status", checked)
              }
              disabled={isLoading}
              aria-label={SLIDER_CONFIG.a11y.labels.toggleButton}
              className={cn(
                "transition-colors",
                "data-[state=checked]:bg-emerald-400/60 data-[state=unchecked]:bg-red-300/60",
                "data-[state=checked]:border-emerald-500/50 data-[state=unchecked]:border-red-400/50"
              )}
            />
          </div>
        </div>

        {/* Image Upload Section - estilo alinhado ao Sobre */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Imagem do {entityName} <span className="text-red-500">*</span>
          </Label>

          <FileUpload
            files={uploadedFiles}
            validation={{
              maxSize: 5 * 1024 * 1024, // 5MB
              accept: [".jpg", ".png", ".webp"],
              maxFiles: 1,
            }}
            maxFiles={1}
            multiple={false}
            disabled={isLoading || isSubmitting}
            showPreview={true}
            showProgress={false}
            autoUpload={false}
            deleteOnRemove={false}
            onFilesChange={handleFilesChange}
            
          />

          {errors.image && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <Icon name="AlertCircle" className="h-4 w-4" />
              {errors.image}
            </p>
          )}
        </div>

        {/* Form Fields - Usando InputCustom */}
        <div className="space-y-4">
          {/* ✅ CORRIGIDO: Remover showRequiredIndicator e touched */}
          <InputCustom
            label={firstFieldLabel || `Título do ${entityName}`}
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder={SLIDER_MESSAGES.PLACEHOLDER_TITLE}
            disabled={isLoading}
            maxLength={100}
            required
            error={errors.title}
          />

          {/* ✅ CORRIGIDO: Remover touched e usar icon (não leftIcon) */}
          <InputCustom
            label={secondFieldLabel || "URL de Destino"}
            id="url"
            type={validateSecondFieldAsUrl ? "url" : "text"}
            value={formData.url}
            onChange={(e) => handleInputChange("url", e.target.value)}
            placeholder={secondFieldLabel ? secondFieldLabel : SLIDER_MESSAGES.PLACEHOLDER_URL}
            helperText={validateSecondFieldAsUrl ? `Para onde o usuário será direcionado ao clicar no ${entityName.toLowerCase()}` : undefined}
            disabled={isLoading}
            maxLength={500}
            error={errors.url}
            icon={validateSecondFieldAsUrl ? "Link" : undefined}
            required={secondFieldRequired}
          />
        </div>

        {/* Form Actions - Usando ButtonCustom */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
          <ButtonCustom
            type="button"
            size="md"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
          >
            <Icon name="X" className="h-4 w-4 mr-2" />
            Cancelar
          </ButtonCustom>

          <ButtonCustom
            type="submit"
            size="md"
            disabled={!canSubmit}
            isLoading={isLoading || isSubmitting}
          >
            {!isLoading && <Icon name="Save" className="h-4 w-4 mr-2" />}
            {slider ? "Atualizar" : `Criar ${entityName}`}
          </ButtonCustom>
        </div>
      </form>
    </div>
  );
}
