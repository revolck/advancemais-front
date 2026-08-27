"use client";

import {
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardSidebar, DashboardHeader } from "@/theme";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom, ToasterCustom } from "@/components/ui/custom";
import { DashboardHeader as Breadcrumb } from "@/components/layout";
import { BlockedUserWrapper } from "@/components/layout/BlockedUserWrapper";
import { canAccessRoute } from "@/config/dashboardRoutes";
import { useUserRole } from "@/hooks/useUserRole";
import { ProfileOnboardingGate } from "@/theme/dashboard/components/profile/ProfileOnboardingGate";
import {
  GoogleConnectedModalController,
  RecoveryPaymentModalController,
} from "@/theme/dashboard/components/rotinas";
import { MarketingPopupRenderer } from "@/components/marketing-popups/MarketingPopupRenderer";

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

function DashboardChildrenSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-7 w-64 rounded-md" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full rounded-md" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl border border-gray-100 p-4"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5 rounded-md" />
                <Skeleton className="h-3 w-2/5 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  const lastDeniedPathRef = useRef<string | null>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname() || "";
  const router = useRouter();
  const role = useUserRole();

  const canRenderCurrentRoute = useMemo(() => {
    if (!role || !pathname) return false;
    return canAccessRoute(pathname, role);
  }, [pathname, role]);

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
    [],
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

  useEffect(() => {
    if (!mounted || !role) return;

    if (canRenderCurrentRoute) {
      lastDeniedPathRef.current = null;
      return;
    }

    if (lastDeniedPathRef.current === pathname) return;
    lastDeniedPathRef.current = pathname;

    toastCustom.error({
      title: "Permissão insuficiente",
      description: "Você não tem permissão para acessar esta página.",
    });
    router.replace("/dashboard");
  }, [canRenderCurrentRoute, mounted, pathname, role, router]);

  // Evita problemas de hidratação SSR
  if (!mounted) {
    return null;
  }

  const renderDashboardShell = (
    content: ReactNode,
    options?: { showPageBreadcrumb?: boolean; showGlobalControllers?: boolean },
  ) => {
    const showPageBreadcrumb = options?.showPageBreadcrumb ?? true;
    const showGlobalControllers = options?.showGlobalControllers ?? true;

    return (
      <BlockedUserWrapper>
        <div className="flex h-screen">
          <div className="flex-shrink-0">
            <DashboardSidebar
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              isCollapsed={isCollapsed}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col bg-white transition-all duration-300 ease-in-out">
            <DashboardHeader
              toggleSidebar={toggleSidebar}
              isCollapsed={isCollapsed}
            />

            <main className="flex-1 overflow-auto bg-gray-100 p-10">
              <div className="min-h-full">
                {showPageBreadcrumb && (
                  <Breadcrumb showBreadcrumb={pathname !== "/empresas"} />
                )}
                {content}
              </div>
            </main>
          </div>
        </div>

        {showGlobalControllers && (
          <>
            <ProfileOnboardingGate />
            <ConfettiExplosion key={confettiKey} isActive={showConfetti} />
            <GoogleConnectedModalController
              onConfettiChange={handleConfettiChange}
            />
            <RecoveryPaymentModalController />
            <MarketingPopupRenderer scope="DASHBOARD" />
          </>
        )}

        <ToasterCustom />
      </BlockedUserWrapper>
    );
  };

  if (!canRenderCurrentRoute) {
    return renderDashboardShell(<DashboardChildrenSkeleton />, {
      showPageBreadcrumb: false,
      showGlobalControllers: false,
    });
  }

  return renderDashboardShell(children);
}
