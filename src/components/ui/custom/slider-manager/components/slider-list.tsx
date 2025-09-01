/**
 * Slider List Component
 * Path: src/components/ui/custom/slider-manager/components/slider-list.tsx
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  GripVertical,
  Calendar as CalendarIcon,
} from "lucide-react";
// Removido Next/Image aqui para usar background cover na thumbnail

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
  const formatDateTime = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };
  // State for managing delete confirmation
  const [deleteSlider, setDeleteSlider] = useState<Slider | null>(null);

  // State for ordered sliders to handle drag & drop
  const [orderedSliders, setOrderedSliders] = useState<Slider[]>(() =>
    [...sliders].sort((a, b) => a.position - b.position)
  );

  // Busy state por item para evitar múltiplos cliques
  const [busyId, setBusyId] = useState<string | null>(null);
  // Track item atualmente sendo arrastado
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Update ordered sliders when props change
  useEffect(() => {
    setOrderedSliders([...sliders].sort((a, b) => a.position - b.position));
  }, [sliders]);

  /**
   * Handle slider reordering via drag and drop
   */
  const handleReorder = useCallback(
    async (newOrder: Slider[]) => {
      // Mapeia posições originais antes de atualizar o estado
      const originalPosition = new Map(
        orderedSliders.map((s) => [s.id, s.position])
      );

      // Atualiza estado local com novas posições (UI/snappy)
      const updatedSliders = newOrder.map((slider, index) => ({
        ...slider,
        position: index + 1,
      }));
      setOrderedSliders(updatedSliders);

      // Determina o item realmente movido
      let moved: { id: string; newPosition: number } | null = null;
      if (draggingId) {
        const idx = newOrder.findIndex((s) => s.id === draggingId);
        if (idx !== -1) {
          const prev = originalPosition.get(draggingId);
          const nextPos = idx + 1;
          if (prev !== nextPos) moved = { id: draggingId, newPosition: nextPos };
        }
      }
      if (!moved) {
        const firstChanged = newOrder.findIndex(
          (s, idx) => originalPosition.get(s.id) !== idx + 1
        );
        if (firstChanged !== -1) {
          moved = { id: newOrder[firstChanged].id, newPosition: firstChanged + 1 };
        }
      }

      if (moved) {
        setBusyId(moved.id);
        try {
          await onReorder(moved.id, moved.newPosition);
        } finally {
          setBusyId(null);
        }
      }
    },
    [onReorder, orderedSliders, draggingId]
  );

  const moveItem = useCallback(
    async (id: string, direction: "up" | "down") => {
      const idx = orderedSliders.findIndex((s) => s.id === id);
      if (idx === -1) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= orderedSliders.length) return;

      // Optimistic UI: swap items
      const next = [...orderedSliders];
      const tmp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = tmp;
      const recalculated = next.map((s, i) => ({ ...s, position: i + 1 }));

      setOrderedSliders(recalculated);

      setBusyId(id);
      try {
        await onReorder(id, targetIdx + 1);
      } catch (e) {
        // Reverte em caso de erro
        setOrderedSliders([...sliders].sort((a, b) => a.position - b.position));
        throw e;
      } finally {
        setBusyId(null);
      }
    },
    [orderedSliders, onReorder, sliders]
  );

  const handleToggleClick = useCallback(
    async (id: string) => {
      if (isLoading || busyId) return;
      setBusyId(id);
      try {
        await onToggleStatus(id);
      } finally {
        setBusyId(null);
      }
    },
    [isLoading, busyId, onToggleStatus]
  );

  /**
   * Handle delete slider action
   */
  const handleDeleteSlider = useCallback(async () => {
    if (deleteSlider) {
      setBusyId(deleteSlider.id);
      try {
        await onDelete(deleteSlider);
      } finally {
        setDeleteSlider(null);
        setBusyId(null);
      }
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

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${isLoading ? "opacity-60" : ""}`}>
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
                drag={
                  SLIDER_CONFIG.features.enableDragReorder && !isLoading && !busyId
                }
                onDragStart={() => setDraggingId(slider.id)}
                onDragEnd={() => setDraggingId(null)}
              >
                <motion.div
                  layout
                  {...SLIDER_ANIMATIONS.FADE_IN}
                  transition={{
                    duration: SLIDER_DRAG_CONFIG.TRANSITION_DURATION,
                  }}
                  className="group object-cover"
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

                        {/* Position Number + Up/Down controls */}
                        <div className="flex-shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            {/* Up */}
                            {index > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveItem(slider.id, "up")}
                                    className="h-7 w-7 p-0 rounded-md hover:bg-primary/10 hover:ring-1 hover:ring-primary/40 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isLoading || busyId === slider.id}
                                    aria-label="Mover para cima"
                                  >
                                    <motion.button
                                      whileHover={{ y: -2, scale: 1.05 }}
                                      whileTap={{ scale: 0.92 }}
                                      transition={{ type: "spring", stiffness: 450, damping: 22 }}
                                    >
                                      {busyId === slider.id ? (
                                        <Icon name="Loader2" className="h-4 w-4 animate-spin text-muted-foreground" />
                                      ) : (
                                        <Icon name="ChevronUp" className="h-4 w-4" />
                                      )}
                                    </motion.button>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mover para cima</TooltipContent>
                              </Tooltip>
                            )}

                            {/* Number */}
                            <div className="relative">
                              <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center border border-gray-500/10 group-hover:ring-1 group-hover:ring-primary/30 transition-all">
                                <span className="text-sm font-semibold text-primary">
                                  {index + 1}
                                </span>
                              </div>
                            </div>

                            {/* Down */}
                            {index < orderedSliders.length - 1 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveItem(slider.id, "down")}
                                    className="h-7 w-7 p-0 rounded-md hover:bg-primary/10 hover:ring-1 hover:ring-primary/40 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isLoading || busyId === slider.id}
                                    aria-label="Mover para baixo"
                                  >
                                    <motion.button
                                      whileHover={{ y: 2, scale: 1.05 }}
                                      whileTap={{ scale: 0.92 }}
                                      transition={{ type: "spring", stiffness: 450, damping: 22 }}
                                    >
                                      {busyId === slider.id ? (
                                        <Icon name="Loader2" className="h-4 w-4 animate-spin text-muted-foreground" />
                                      ) : (
                                        <Icon name="ChevronDown" className="h-4 w-4" />
                                      )}
                                    </motion.button>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mover para baixo</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>

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
                          <div className="flex items-center gap-4 mb-0">
                            <h4 className="font-semibold text-foreground truncate text-xl !mb-0">
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

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>
                              Upload:{" "}
                              {formatDateTime(
                                slider.updatedAt || slider.createdAt
                              )}
                            </span>
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
                                onClick={() => handleToggleClick(slider.id)}
                                className="h-10 w-10 p-0 hover:bg-muted/50 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                                disabled={isLoading || busyId === slider.id}
                                aria-label={
                                  slider.status
                                    ? "Desativar slider"
                                    : "Ativar slider"
                                }
                              >
                                {busyId === slider.id ? (
                                  <Icon
                                    name="Loader2"
                                    className="h-5 w-5 animate-spin text-muted-foreground"
                                  />
                                ) : slider.status ? (
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
                                className="h-10 w-10 p-0 hover:bg-muted/50 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                                disabled={isLoading || busyId === slider.id}
                                aria-label={
                                  SLIDER_CONFIG.a11y.labels.editButton
                                }
                              >
                                {busyId === slider.id ? (
                                  <Icon
                                    name="Loader2"
                                    className="h-5 w-5 animate-spin text-muted-foreground"
                                  />
                                ) : (
                                  <Icon
                                    name="Edit"
                                    className="h-5 w-5 text-primary"
                                  />
                                )}
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
                                className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                                disabled={isLoading || busyId === slider.id}
                                aria-label={
                                  SLIDER_CONFIG.a11y.labels.deleteButton
                                }
                              >
                                {busyId === slider.id ? (
                                  <Icon
                                    name="Loader2"
                                    className="h-5 w-5 animate-spin text-muted-foreground"
                                  />
                                ) : (
                                  <Icon name="Trash2" className="h-5 w-5" />
                                )}
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
              <AlertDialogTitle className="!text-2xl">
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
                className="rounded-xl cursor-pointer"
                onClick={handleCloseDeleteDialog}
                disabled={isLoading || (deleteSlider ? busyId === deleteSlider.id : false)}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSlider}
                className="bg-destructive hover:bg-destructive/90 !text-destructive-foreground rounded-xl cursor-pointer"
                disabled={isLoading || (deleteSlider ? busyId === deleteSlider.id : false)}
              >
                {deleteSlider && busyId === deleteSlider.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                    Excluindo...
                  </span>
                ) : (
                  "Excluir Slider"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

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

  // Preload manual para controlar loading/erro
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

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
      <div
        aria-label={alt}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${src})`,
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
    </>
  );
};
