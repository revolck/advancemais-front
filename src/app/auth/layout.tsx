"use client";

import React from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";
import "@/styles/theme.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen">
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </section>
  );
}
