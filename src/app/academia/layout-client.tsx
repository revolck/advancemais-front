"use client";

import React from "react";
import { Header } from "./header";
import { GraduationCap } from "lucide-react";

interface AcademiaLayoutClientProps {
  children: React.ReactNode;
}

export default function AcademiaLayoutClient({
  children,
}: AcademiaLayoutClientProps) {
  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      {/* Header do Website Adaptado */}
      <Header />

      {/* Content */}
      {/* IMPORTANTE: não usar container aqui para evitar "container dentro de container"
          (a página controla os containers por seção, como no website). */}
      <main>{children}</main>

      {/* Footer - Clean */}
      <footer className="mt-16 border-t border-white/10 bg-black">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-white">
                Academia Advance+
              </span>
            </div>
            <p className="text-sm! text-white/60">
              © {new Date().getFullYear()} Advance+. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

