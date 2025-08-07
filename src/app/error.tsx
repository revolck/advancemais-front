"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { generateErrorSupportLink } from "@/lib/support";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const handleContactSupport = () => {
    const whatsappLink = generateErrorSupportLink(
      error.message,
      "Erro global da aplicação"
    );
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center"
        >
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 text-sm">
            {error.message || "Ocorreu um erro inesperado. Tente novamente."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="outline"
            className="border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white"
          >
            Tentar novamente
          </Button>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleContactSupport}
              className="bg-[var(--secondary-color)] text-white hover:opacity-90"
            >
              Falar com suporte
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
