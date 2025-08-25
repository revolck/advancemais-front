/**
 * Modal para adicionar/editar slider
 */
"use client";

import React, { useEffect } from "react";
import {
  ModalCustom,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ButtonCustom,
  InputCustom,
  FileUpload,
  Icon,
} from "@/components/ui/custom";
import { useSliderForm } from "../hooks";
import type { SliderModalProps } from "../types";

export const SliderModal: React.FC<SliderModalProps> = ({
  isOpen,
  onClose,
  editingSlider,
  nextOrder,
  onSubmit,
  isLoading = false,
}) => {
  const {
    formState,
    uploadStatus,
    isFormValid,
    handleSubmit,
    handleFieldChange,
    handleFileChange,
    resetForm,
    getPreviewUrl,
    hasImageSource,
  } = useSliderForm({
    onSubmit,
    onClose,
  });

  // Reset form quando modal abre/fecha ou slider muda
  useEffect(() => {
    if (isOpen) {
      resetForm(editingSlider, nextOrder);
    }
  }, [isOpen, editingSlider, nextOrder, resetForm]);

  const previewUrl = getPreviewUrl();
  const isSubmitting = isLoading || uploadStatus === "uploading";

  return (
    <ModalCustom isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Icon name={editingSlider ? "Edit" : "Plus"} className="w-5 h-5" />
            {editingSlider ? "Editar Slider" : "Adicionar Novo Slider"}
          </ModalTitle>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload de Imagem */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Imagem do Slider *
              </label>
              <FileUpload
                multiple={false}
                validation={{
                  acceptedTypes: [".jpg", ".jpeg", ".png", ".webp"],
                  maxSize: 5 * 1024 * 1024, // 5MB
                  maxFiles: 1,
                }}
                onFilesChange={(files) => {
                  // Corrige o problema de undefined
                  const file =
                    files.length > 0 && files[0]?.file ? files[0].file : null;
                  handleFileChange(file);
                }}
                variant="bordered"
                size="md"
                showPreview
                dropzoneText="Arraste uma imagem ou clique para selecionar"
                browseText="Procurar arquivo"
                classNames={{
                  container: "min-h-[120px]",
                  dropzone:
                    "border-dashed border-2 border-border/50 hover:border-primary/50 transition-colors",
                }}
              />
              {formState.errors.file && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Icon name="AlertCircle" className="w-4 h-4" />
                  {formState.errors.file}
                </p>
              )}
            </div>

            {/* URL da Imagem (alternativa) */}
            {!formState.selectedFile && (
              <InputCustom
                label="URL da Imagem (alternativa)"
                value={formState.imagemUrl}
                onChange={(e) => handleFieldChange("imagemUrl", e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                error={formState.errors.imagemUrl}
                icon="Image"
                helperText="Cole a URL de uma imagem hospedada online"
                disabled={isSubmitting}
              />
            )}

            {/* Link de Destino */}
            <InputCustom
              label="Link de Destino"
              value={formState.link}
              onChange={(e) => handleFieldChange("link", e.target.value)}
              placeholder="https://exemplo.com"
              error={formState.errors.link}
              icon="ExternalLink"
              helperText="Para onde o usuário será direcionado ao clicar no slider (opcional)"
              disabled={isSubmitting}
            />

            {/* Ordem */}
            <InputCustom
              label="Ordem de Exibição"
              type="number"
              min={1}
              max={4}
              value={formState.ordem.toString()}
              onChange={(e) =>
                handleFieldChange("ordem", parseInt(e.target.value) || 1)
              }
              error={formState.errors.ordem}
              icon="Hash"
              helperText="Posição do slider na sequência (1 = primeiro, 4 = último)"
              disabled={isSubmitting}
            />

            {/* Preview da imagem */}
            {previewUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Preview
                </label>
                <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden border border-border/30">
                  <img
                    src={previewUrl}
                    alt="Preview do slider"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Icon name="Eye" className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Erro geral */}
            {formState.errors.general && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex gap-2">
                  <Icon
                    name="AlertCircle"
                    className="w-4 h-4 text-destructive shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-destructive">
                    {formState.errors.general}
                  </p>
                </div>
              </div>
            )}
          </form>
        </ModalBody>

        <ModalFooter>
          <ButtonCustom
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!isFormValid || !hasImageSource}
            loadingText={editingSlider ? "Salvando..." : "Adicionando..."}
            icon={editingSlider ? "Save" : "Plus"}
          >
            {editingSlider ? "Salvar Alterações" : "Adicionar Slider"}
          </ButtonCustom>
        </ModalFooter>
      </ModalContent>
    </ModalCustom>
  );
};
