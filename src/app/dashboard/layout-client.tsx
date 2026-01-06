"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardSidebar, DashboardHeader } from "@/theme";
import { toastCustom, ToasterCustom } from "@/components/ui/custom";
import { DashboardHeader as Breadcrumb } from "@/components/layout";
import { BlockedUserWrapper } from "@/components/layout/BlockedUserWrapper";
import { ProfileOnboardingGate } from "@/theme/dashboard/components/profile/ProfileOnboardingGate";
import {
  GoogleConnectedModalController,
  RecoveryPaymentModalController,
} from "@/theme/dashboard/components/rotinas";

interface DashboardLayoutClientProps {
  children: ReactNode;
}

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F1948A",
  "#82E0AA",
  "#F8B500",
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
];

interface ConfettiPiece {
  id: number;
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  rotation: number;
  delay: number;
}

const ConfettiExplosion = ({ isActive }: { isActive: boolean }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isActive) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const velocity = 160 + Math.random() * 320;

      newPieces.push({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 7 + Math.random() * 6,
        initialX: 50,
        initialY: 28,
        targetX: 50 + Math.cos(angle) * (velocity / 10),
        targetY: 28 + Math.sin(angle) * (velocity / 10) + 55,
        rotation: Math.random() * 720 - 360,
        delay: Math.random() * 0.15,
      });
    }

    setPieces(newPieces);

    const timer = setTimeout(() => {
      setPieces([]);
    }, 2500);

    return () => clearTimeout(timer);
  }, [mounted, isActive]);

  if (!mounted || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            left: `${piece.initialX}%`,
            top: `${piece.initialY}%`,
          }}
          initial={{
            scale: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: `${(piece.targetX - piece.initialX) * 10}px`,
            y: `${(piece.targetY - piece.initialY) * 10}px`,
            scale: [0, 1.2, 1, 0.8],
            rotate: piece.rotation,
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
};

/**
 * Layout específico para a seção de Dashboard
 */
export default function DashboardLayoutClient({
  children,
}: DashboardLayoutClientProps) {
  // Hook personalizado para detectar dispositivos móveis
  const isMobileDevice = useIsMobile();

  // Estados locais
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const searchParams = useSearchParams();
  const pathname = usePathname() || "";
  const router = useRouter();

  /**
   * Alterna o estado de colapso do sidebar
   */
  function toggleSidebar() {
    if (!isMobileDevice) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  }

  // Callback para controlar confetti a partir dos modais
  const handleConfettiChange = useCallback(
    (config: { showConfetti: boolean; confettiKey: number }) => {
      setShowConfetti(config.showConfetti);
      if (config.confettiKey > 0) {
        setConfettiKey(config.confettiKey);
      }
    },
    []
  );

  // Efeito para manipulação do estado inicial
  useEffect(() => {
    setMounted(true);

    if (searchParams && searchParams.get("denied")) {
      toastCustom.error("Acesso negado");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("denied");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }

    // Reset collapsed state when switching to mobile
    if (isMobileDevice && isCollapsed) {
      setIsCollapsed(false);
    }

    // Adiciona classe ao body quando o menu está aberto em mobile
    // para evitar scroll
    if (isMobileMenuOpen && isMobileDevice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    isMobileDevice,
    isCollapsed,
    isMobileMenuOpen,
    searchParams,
    pathname,
    router,
  ]);

  // Evita problemas de hidratação SSR
  if (!mounted) {
    return null;
  }

  return (
    <BlockedUserWrapper>
      <div className="flex h-screen">
        {/* Sidebar principal do dashboard */}
        <div className="flex-shrink-0">
          <DashboardSidebar
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* Container principal de conteúdo */}
        <div className="flex flex-1 flex-col bg-white transition-all duration-300 ease-in-out min-w-0">
          {/* Header do Dashboard */}
          <DashboardHeader
            toggleSidebar={toggleSidebar}
            isCollapsed={isCollapsed}
          />

          {/* Conteúdo principal */}
          <main className="flex-1 overflow-auto bg-gray-100 p-10">
            <div className="min-h-full">
              <Breadcrumb showBreadcrumb={pathname !== "/empresas"} />
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Componentes de onboarding e feedback */}
      <ProfileOnboardingGate />
      <ConfettiExplosion key={confettiKey} isActive={showConfetti} />

      {/* Modais globais do dashboard (isoladas como microfrontends) */}
      <GoogleConnectedModalController onConfettiChange={handleConfettiChange} />
      <RecoveryPaymentModalController />

      {/* Toast global */}
      <ToasterCustom />
    </BlockedUserWrapper>
  );
}
