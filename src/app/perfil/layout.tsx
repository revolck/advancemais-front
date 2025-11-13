import type { ReactNode } from "react";
import DashboardLayoutClient from "@/app/dashboard/layout-client";

export default async function PerfilLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}

