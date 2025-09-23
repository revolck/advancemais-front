import type { ReactNode } from "react";

import { listDashboardScripts } from "@/api/dashboard/scripts";
import { ScriptInjector } from "@/components/scripts/script-injector";
import { loadPublishedScripts } from "@/lib/scripts/load-published-scripts";

import DashboardLayoutClient from "./layout-client";

async function fetchDashboardScripts() {
  return loadPublishedScripts(listDashboardScripts, "DASHBOARD");
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const scripts = await fetchDashboardScripts();

  return (
    <>
      <ScriptInjector scripts={scripts} />
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  );
}
