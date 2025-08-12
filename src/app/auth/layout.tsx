"use client";

import React from "react";
import "@/styles/globals.css";
import { ToasterCustom } from "@/components/ui/custom/toast";

/**
 * Layout de autenticação simplificado
 *
 * Removido o ThemeProvider para simplificar a estrutura
 * e eliminar a complexidade do modo escuro.
 */

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen bg-[var(--background-color)]">
      {children}
      <ToasterCustom />
    </section>
  );
}
