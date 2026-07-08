"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, MapPinHouse, PencilLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AvatarCustom } from "@/components/ui/custom/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PopupLeadHeaderProps {
  title: string;
  subtitle: string;
  onEditContact: () => void;
  onEditAddress: () => void;
  addressActionLabel: string;
}

export function PopupLeadHeader({
  title,
  subtitle,
  onEditContact,
  onEditAddress,
  addressActionLabel,
}: PopupLeadHeaderProps) {
  const router = useRouter();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <AvatarCustom
            name={title}
            size="xl"
            showStatus={false}
            className="text-base"
          />

          <div className="space-y-2">
            <div>
              <h3 className="font-semibold !mb-0">{title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
                <span>{subtitle} </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                aria-expanded={isActionsOpen}
                className="flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-color)]/90 cursor-pointer"
              >
                Ações
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isActionsOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onSelect={onEditContact}
                className="cursor-pointer"
              >
                <PencilLine className="h-4 w-4 text-gray-500" />
                <span>Editar contato</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onEditAddress}
                className="cursor-pointer"
              >
                <MapPinHouse className="h-4 w-4 text-gray-500" />
                <span>{addressActionLabel}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none bg-gray-100/70 px-5 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-200 hover:text-accent-foreground"
          >
            <Link
              href="/dashboard/marketing/contatos"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
