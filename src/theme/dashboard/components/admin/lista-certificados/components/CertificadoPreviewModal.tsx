"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ButtonCustom } from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";

interface CertificadoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string;
  codigo: string;
  onDownload: () => void;
  isDownloading?: boolean;
}

export function CertificadoPreviewModal({
  open,
  onOpenChange,
  previewUrl,
  codigo,
  onDownload,
  isDownloading = false,
}: CertificadoPreviewModalProps) {
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState<number>(Date.now());

  const previewSrc = useMemo(() => {
    const separator = previewUrl.includes("?") ? "&" : "?";
    return `${previewUrl}${separator}_ts=${cacheBuster}`;
  }, [previewUrl, cacheBuster]);

  useEffect(() => {
    if (!open) return;
    setIsPreviewLoading(true);
    setPreviewError(null);
    setCacheBuster(Date.now());
  }, [open, previewUrl]);

  return (
    <ModalCustom
      open={open}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="5xl"
      scrollBehavior="inside"
    >
      <ModalContentWrapper className="w-[min(96vw,1480px)] h-[min(94vh,980px)] grid grid-rows-[auto_1fr_auto]">
        <ModalHeader>
          <ModalTitle>Preview do certificado</ModalTitle>
        </ModalHeader>

        <ModalBody className="px-6 pb-0 min-h-0 overflow-hidden">
          <div className="relative h-full min-h-0 overflow-hidden rounded-lg border border-gray-200 bg-slate-100">
            {previewError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-red-600">{previewError}</p>
                <ButtonCustom
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.open(previewSrc, "_blank", "noopener,noreferrer");
                  }}
                >
                  Abrir em nova aba
                </ButtonCustom>
              </div>
            ) : (
              <>
                {isPreviewLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-gray-500">
                    Carregando preview...
                  </div>
                )}
                <iframe
                  key={`${previewSrc}-${open ? "open" : "closed"}`}
                  title={`Preview do certificado ${codigo}`}
                  src={previewSrc}
                  className="h-full w-full border-0 bg-slate-100"
                  scrolling="yes"
                  onLoad={() => setIsPreviewLoading(false)}
                  onError={() => {
                    setIsPreviewLoading(false);
                    setPreviewError("Não foi possível carregar o preview.");
                  }}
                />
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <ButtonCustom variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            icon="Download"
            onClick={onDownload}
            isLoading={isDownloading}
            disabled={isDownloading}
          >
            Baixar PDF
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
