import type { ReactNode } from "react";

import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
