import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarIcon, PanelLeftCloseIcon } from "lucide-react";
import { useSidebarStore } from "../store/sidebarStore";
import { motion } from "framer-motion";

interface SidebarCollapseButtonProps {
  className?: string;
}

export function SidebarCollapseButton({
  className,
}: SidebarCollapseButtonProps) {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex justify-center my-2", className)}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleCollapsed}
        className={cn(
          "rounded-md",
          isCollapsed ? "w-10 h-10 p-0" : "w-full mx-3"
        )}
        aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isCollapsed ? (
            <SidebarIcon className="h-5 w-5" />
          ) : (
            <div className="flex items-center gap-2">
              <PanelLeftCloseIcon className="h-5 w-5" />
              <span className="flex-1 text-sm">Colapsar menu</span>
            </div>
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
}

export default SidebarCollapseButton;
