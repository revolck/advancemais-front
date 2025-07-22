"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { generateSupportWhatsAppLink } from "@/lib/supporte-client";
import React from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error }: ErrorProps) {
  const handleContactSupport = () => {
    const whatsappLink = generateSupportWhatsAppLink(error.message);
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-2">
            Algo deu errado!
          </h2>
          <p className="text-gray-600 text-sm">
            {error.message || "Ocorreu um erro inesperado. Tente novamente."}
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block cursor-pointer"
        >
          <Button
            onClick={handleContactSupport}
            className="bg-[var(--secondary-color)] text-white hover:opacity-90 transition cursor-pointer"
          >
            Falar com o administrador
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
