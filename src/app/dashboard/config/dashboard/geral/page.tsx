"use client";

import React from "react";
import { VerticalTabs, type VerticalTabItem } from "@/components/ui/custom";
import LoginForm from "./login/LoginForm";
import DashboardScriptsForm from "./scripts/ScriptsForm";

export default function GeralDashboardPage() {
  const items: VerticalTabItem[] = [
    {
      value: "login",
      label: "Login",
      icon: "LogIn",
      content: <LoginForm />,
    },
    {
      value: "scripts",
      label: "Scripts",
      icon: "Code2",
      content: <DashboardScriptsForm />,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 h-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <VerticalTabs
          items={items}
          defaultValue="login"
          variant="spacious"
          size="sm"
          withAnimation
          showIndicator
          tabsWidth="md"
          classNames={{
            root: "h-full",
            contentWrapper: "h-full overflow-hidden",
            tabsContent: "h-full overflow-auto p-6",
            tabsList: "p-2",
            tabsTrigger: "mb-1",
          }}
        />
      </div>
    </div>
  );
}
