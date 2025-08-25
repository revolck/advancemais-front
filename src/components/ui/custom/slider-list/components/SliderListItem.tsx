"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonCustom, Icon } from "@/components/ui/custom";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { formatDate } from "../utils";
import {
  sliderListItemVariants,
  orderIndicatorVariants,
  thumbnailVariants,
  sliderInfoVariants,
  metadataVariants,
  actionsContainerVariants,
  actionButtonVariants,
  statusIndicatorVariants,
} from "../styles";
import type { SliderListItemProps } from "../types";

export const SliderListItem: React.FC<SliderListItemProps> = ({
  slider,
  index,
  isFirst,
  isLast,
  allowReorder = true,
  onEdit,
  onDelete,
  onTogglePublish,
  onMoveUp,
  onMoveDown,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        sliderListItemVariants({
          state: slider.isPublished ? "published" : "unpublished",
        })
      )}
    >
      {/* Indicador de Ordem */}
      <div className={cn(orderIndicatorVariants({ variant: "active" }))}>
        {slider.ordem}
      </div>

      {/* Thumbnail */}
      <div
        className={cn(
          thumbnailVariants({
            size: "md",
            state: imageLoading ? "loading" : imageError ? "error" : "default",
          })
        )}
      >
        {imageError ? (
          <ImageNotFound className="w-full h-full" />
        ) : (
          <img
            src={slider.imagemUrl}
            alt={slider.imagemTitulo}
            className="w-full h-full object-cover transition-opacity duration-200"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            style={{ opacity: imageLoading ? 0 : 1 }}
          />
        )}
      </div>

      {/* Informações do Slider */}
      <div className={cn(sliderInfoVariants())}>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate flex-1">
            {slider.imagemTitulo || `Slider ${slider.ordem}`}
          </h3>
          <div
            className={cn(
              statusIndicatorVariants({
                status: slider.isPublished ? "published" : "unpublished",
              })
            )}
          >
            <Icon
              name={slider.isPublished ? "Eye" : "EyeOff"}
              className="w-3 h-3"
            />
            {slider.isPublished ? "Publicado" : "Rascunho"}
          </div>
        </div>

        <div className={cn(metadataVariants())}>
          <span className="flex items-center gap-1">
            <Icon name="Calendar" className="w-3 h-3" />
            Criado: {formatDate(slider.criadoEm)}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Clock" className="w-3 h-3" />
            Modificado: {formatDate(slider.atualizadoEm)}
          </span>
          {slider.link && (
            <span className="flex items-center gap-1">
              <Icon name="ExternalLink" className="w-3 h-3" />
              <a
                href={slider.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate max-w-32"
                onClick={(e) => e.stopPropagation()}
              >
                Link
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className={cn(actionsContainerVariants())}>
        {/* Reordenação */}
        {allowReorder && (
          <>
            {!isFirst && onMoveUp && (
              <ButtonCustom
                variant="ghost"
                size="sm"
                onClick={() => onMoveUp(slider.id)}
                className={cn(actionButtonVariants({ variant: "reorder" }))}
                title="Mover para cima"
              >
                <Icon name="ChevronUp" className="w-4 h-4" />
              </ButtonCustom>
            )}
            {!isLast && onMoveDown && (
              <ButtonCustom
                variant="ghost"
                size="sm"
                onClick={() => onMoveDown(slider.id)}
                className={cn(actionButtonVariants({ variant: "reorder" }))}
                title="Mover para baixo"
              >
                <Icon name="ChevronDown" className="w-4 h-4" />
              </ButtonCustom>
            )}
          </>
        )}

        {/* Publicar/Despublicar */}
        <ButtonCustom
          variant="ghost"
          size="sm"
          onClick={() => onTogglePublish(slider.id, !slider.isPublished)}
          className={cn(actionButtonVariants({ variant: "publish" }))}
          title={slider.isPublished ? "Despublicar" : "Publicar"}
        >
          <Icon
            name={slider.isPublished ? "EyeOff" : "Eye"}
            className="w-4 h-4"
          />
        </ButtonCustom>

        {/* Editar */}
        <ButtonCustom
          variant="ghost"
          size="sm"
          onClick={() => onEdit(slider)}
          className={cn(actionButtonVariants({ variant: "edit" }))}
          title="Editar slider"
        >
          <Icon name="Edit" className="w-4 h-4" />
        </ButtonCustom>

        {/* Deletar */}
        <ButtonCustom
          variant="ghost"
          size="sm"
          onClick={() => onDelete(slider.id)}
          className={cn(actionButtonVariants({ variant: "delete" }))}
          title="Excluir slider"
        >
          <Icon name="Trash2" className="w-4 h-4" />
        </ButtonCustom>
      </div>
    </motion.div>
  );
};
