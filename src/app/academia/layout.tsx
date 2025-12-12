import type { ReactNode } from "react";
import "@/styles/globals.css";
import { ToasterCustom } from "@/components/ui/custom/toast";
import AcademiaLayoutClient from "./layout-client";

export const metadata = {
  title: "Academia Advance+ | Treinamento da Plataforma",
  description:
    "Aprenda a usar a plataforma Advance+ com nossos vídeos de treinamento",
};

export default async function AcademiaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AcademiaLayoutClient>{children}</AcademiaLayoutClient>
      <ToasterCustom />
    </>
  );
}

