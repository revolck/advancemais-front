"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GoogleConnectedModal } from "./GoogleConnectedModal";

interface ConfettiConfig {
  showConfetti: boolean;
  confettiKey: number;
}

interface GoogleConnectedModalControllerProps {
  onConfettiChange?: (config: ConfettiConfig) => void;
}

/**
 * Controller para a modal de Google Agenda conectado.
 * 
 * Regras:
 * - Exibe quando há ?google=conectado na URL
 * - Remove o parâmetro após fechar
 * - Dispara animação de confetti
 */
export function GoogleConnectedModalController({
  onConfettiChange,
}: GoogleConnectedModalControllerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname() || "";

  const [showModal, setShowModal] = useState(false);

  // Detecta parâmetro google=conectado na URL
  useEffect(() => {
    if (searchParams && searchParams.get("google") === "conectado") {
      setShowModal(true);
    }
  }, [searchParams]);

  // Dispara confetti quando a modal abre
  useEffect(() => {
    if (!showModal) {
      onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
      return;
    }
    
    onConfettiChange?.({ showConfetti: false, confettiKey: 0 });
    const timer = setTimeout(() => {
      onConfettiChange?.({ showConfetti: true, confettiKey: Date.now() });
    }, 200);
    
    return () => clearTimeout(timer);
  }, [showModal, onConfettiChange]);

  const handleClose = () => {
    setShowModal(false);
    
    if (!searchParams) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("google")) return;
    
    params.delete("google");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return <GoogleConnectedModal isOpen={showModal} onClose={handleClose} />;
}


