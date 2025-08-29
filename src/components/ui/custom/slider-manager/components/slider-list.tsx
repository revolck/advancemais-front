/**
 * Slider List Component
 * Path: src/components/ui/custom/slider-manager/components/slider-list.tsx
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { ExternalLink, GripVertical } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/custom/Icons";

import type { SliderListProps, Slider } from "../types";
import {
  SLIDER_MESSAGES,
  SLIDER_ANIMATIONS,
  SLIDER_STYLES,
  SLIDER_DRAG_CONFIG,
} from "../constants";
import { SLIDER_CONFIG } from "../config";

export function SliderList({
  sliders,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  isLoading = false,
}: SliderListProps) {
  // State for managing delete confirmation
  const [deleteSlider, setDeleteSlider] = useState<Slider | null>(null);

  // State for ordered sliders to handle drag & drop
  const [orderedSliders, setOrderedSliders] = useState<Slider[]>(() =>
    [...sliders].sort((a, b) => a.position - b.position)
  );

  // Update ordered sliders when props change
  useEffect(() => {
    setOrderedSliders([...sliders].sort((a, b) => a.position - b.position));
  }, [sliders]);

  /**
   * Handle slider reordering via drag and drop
   */
  const handleReorder = useCallback(
    (newOrder: Slider[]) => {
      // Update local state immediately for smooth UX
      const updatedSliders = newOrder.map((slider, index) => ({
        ...slider,
        position: index + 1,
      }));
      setOrderedSliders(updatedSliders);

      // Call API for each slider that changed position
      newOrder.forEach((slider, index) => {
        const newPosition = index + 1;
        if (slider.position !== newPosition) {
          onReorder(slider.id, newPosition);
        }
      });
    },
    [onReorder]
  );

  /**
   * Handle delete slider action
   */
  const handleDeleteSlider = useCallback(() => {
    if (deleteSlider) {
      onDelete(deleteSlider.id);
      setDeleteSlider(null);
    }
  }, [deleteSlider, onDelete]);

  /**
   * Handle close delete dialog
   */
  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteSlider(null);
  }, []);

  // Early return for empty state
  if (sliders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="py-16"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Icon name="ImageIcon" className="h-10 w-10 text-blue-900" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground !mb-1">
            {SLIDER_MESSAGES.EMPTY_SLIDERS_TITLE}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-base max-w-xl mx-auto mb-6">
            {SLIDER_MESSAGES.EMPTY_SLIDERS_DESCRIPTION}
          </p>
        </div>
      </motion.div>
    );
  }

  const activeCount = sliders.filter((s) => s.status).length;
  const totalCount = sliders.length;

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Loading Skeleton Block (shown at top when loading) */}
        {isLoading && (
          <div className="space-y-3" aria-hidden>
            <Skeleton className="h-6 w-40" />
            {Array.from({
              length: Math.min(Math.max(sliders.length, 3), 5),
            }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Seus Sliders
            </h3>
            <p className="text-muted-foreground mt-2 text-lg">
              {SLIDER_CONFIG.features.enableDragReorder &&
                "Arraste para reordenar • "}
              {activeCount} de {totalCount} ativos
            </p>
          </div>
        </div>

        {/* Slider List */}
        <Reorder.Group
          axis="y"
          values={orderedSliders}
          onReorder={handleReorder}
          className="space-y-6"
        >
          <AnimatePresence>
            {orderedSliders.map((slider, index) => (
              <Reorder.Item
                key={slider.id}
                value={slider}
                className={
                  SLIDER_CONFIG.features.enableDragReorder
                    ? "cursor-grab active:cursor-grabbing"
                    : ""
                }
                whileDrag={
                  SLIDER_CONFIG.features.enableDragReorder
                    ? {
                        scale: SLIDER_DRAG_CONFIG.DRAG_SCALE,
                        rotate: SLIDER_DRAG_CONFIG.DRAG_ROTATE,
                      }
                    : undefined
                }
                drag={SLIDER_CONFIG.features.enableDragReorder}
              >
                <motion.div
                  layout
                  {...SLIDER_ANIMATIONS.FADE_IN}
                  transition={{
                    duration: SLIDER_DRAG_CONFIG.TRANSITION_DURATION,
                  }}
                  className="group"
                >
                  <Card className={SLIDER_STYLES.CARD}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {/* Drag Handle */}
                        {SLIDER_CONFIG.features.enableDragReorder && (
                          <div
                            className="flex-shrink-0 opacity-30 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label={SLIDER_CONFIG.a11y.labels.dragHandle}
                          >
                            <GripVertical className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}

                        {/* Position Number */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                            <span className="text-base font-semibold text-primary">
                              {index + 1}
                            </span>
                          </div>
                        </div>

                        {/* ✅ CORRIGIDO: Thumbnail usando Next.js Image com fallback */}
                        <div className="flex-shrink-0">
                          <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-border/30 bg-muted/20">
                            {slider.image ? (
                              <SliderImageWithFallback
                                src={slider.image}
                                alt={slider.title}
                                width={SLIDER_CONFIG.ui.thumbnail.width}
                                height={SLIDER_CONFIG.ui.thumbnail.height}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon
                                  name="ImageIcon"
                                  className="h-6 w-6 text-muted-foreground"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Slider Info */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center gap-4">
                            <h4 className="font-semibold text-foreground truncate text-xl">
                              {slider.title}
                            </h4>
                            <Badge
                              variant={slider.status ? "default" : "secondary"}
                              className={
                                slider.status
                                  ? SLIDER_STYLES.BADGE_ACTIVE
                                  : SLIDER_STYLES.BADGE_INACTIVE
                              }
                            >
                              {slider.status ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>

                          {slider.url && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ExternalLink className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate" title={slider.url}>
                                {slider.url}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                          {/* Toggle Status Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleStatus(slider.id)}
                                className="h-10 w-10 p-0 hover:bg-muted/50 rounded-lg"
                                disabled={isLoading}
                                aria-label={
                                  slider.status
                                    ? "Desativar slider"
                                    : "Ativar slider"
                                }
                              >
                                {slider.status ? (
                                  <Icon
                                    name="Eye"
                                    className="h-5 w-5 text-emerald-600"
                                  />
                                ) : (
                                  <Icon
                                    name="EyeOff"
                                    className="h-5 w-5 text-gray-400"
                                  />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {slider.status
                                ? "Desativar slider"
                                : "Ativar slider"}
                            </TooltipContent>
                          </Tooltip>

                          {/* Edit Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(slider)}
                                className="h-10 w-10 p-0 hover:bg-muted/50 rounded-lg"
                                disabled={isLoading}
                                aria-label={
                                  SLIDER_CONFIG.a11y.labels.editButton
                                }
                              >
                                <Icon
                                  name="Edit"
                                  className="h-5 w-5 text-primary"
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar slider</TooltipContent>
                          </Tooltip>

                          {/* Delete Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteSlider(slider)}
                                className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 rounded-lg"
                                disabled={isLoading}
                                aria-label={
                                  SLIDER_CONFIG.a11y.labels.deleteButton
                                }
                              >
                                <Icon name="Trash2" className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir slider</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteSlider}
          onOpenChange={handleCloseDeleteDialog}
        >
          <AlertDialogContent className="rounded-2xl border border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base leading-relaxed text-muted-foreground">
                Você está prestes a excluir o slider{" "}
                <strong>"{deleteSlider?.title}"</strong>.{" "}
                {SLIDER_MESSAGES.CONFIRM_DELETE_DESCRIPTION}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="rounded-xl"
                onClick={handleCloseDeleteDialog}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSlider}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
              >
                Excluir Slider
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

// ✅ CORRIGIDO: Componente auxiliar para imagem com fallback
const SliderImageWithFallback = ({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <ImageNotFound
        size="sm"
        variant="muted"
        message=""
        showMessage={false}
        icon="ImageIcon"
        className="w-full h-full flex items-center justify-center"
      />
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <Icon
            name="Loader2"
            className="h-4 w-4 animate-spin text-muted-foreground"
          />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
    </>
  );
};
