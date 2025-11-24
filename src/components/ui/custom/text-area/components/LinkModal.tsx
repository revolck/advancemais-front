"use client";

import * as React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Link as LinkIcon } from "lucide-react";

export interface LinkModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  linkUrl: string;
  activeLink: { url: string; element: HTMLAnchorElement } | null;
  onUrlChange: (url: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onRemove: () => void;
}

export function LinkModal({
  isOpen,
  onOpenChange,
  linkUrl,
  activeLink,
  onUrlChange,
  onConfirm,
  onCancel,
  onRemove,
}: LinkModalProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  const handleConfirm = () => {
    if (linkUrl.trim()) {
      onConfirm();
    }
  };

  const handleRemove = () => {
    onRemove();
    onCancel();
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          onCancel();
        }
      }}
      size="md"
      backdrop="opaque"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
            <ModalTitle>
              {activeLink ? "Editar Link" : "Adicionar Link"}
            </ModalTitle>
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-help"
                aria-label="Informações sobre links"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <Info className="h-4 w-4" />
              </button>
              {showTooltip && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg border border-gray-700 max-w-xs rounded-md z-[10000] whitespace-normal"
                  style={{
                    transform: "translateX(-50%) translateY(8px)",
                  }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <p className="mb-1 font-semibold">
                    {activeLink ? "Editar Link" : "Adicionar Link"}
                  </p>
                  <p className="text-xs opacity-90">
                    {activeLink
                      ? "Edite a URL do link ou remova-o completamente."
                      : "Digite a URL do link. O texto selecionado será usado como texto do link."}
                  </p>
                  {/* Seta do tooltip */}
                  <div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"
                    style={{ transform: "translateX(-50%) rotate(45deg)" }}
                  />
                </div>
              )}
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="p-1">
            <InputCustom
              label="URL"
              required
              name="link-url"
              value={linkUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://exemplo.com"
              onKeyDown={(e) => {
                if (e.key === "Enter" && linkUrl.trim()) {
                  handleConfirm();
                }
              }}
              autoFocus
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center gap-2 w-full justify-end">
            {activeLink && (
              <ButtonCustom variant="danger" onClick={handleRemove}>
                Remover Link
              </ButtonCustom>
            )}
            <ButtonCustom variant="outline" onClick={onCancel}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={handleConfirm}
              disabled={!linkUrl.trim()}
            >
              {activeLink ? "Atualizar" : "Adicionar"}
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
