"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MARKETING_EMAIL_TEMPLATES } from "./constants";

export function EmailTemplateGallery() {
  return (
    <div className="space-y-8">
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {MARKETING_EMAIL_TEMPLATES.map((template) => (
            <Tooltip key={template.slug}>
              <TooltipTrigger asChild>
                <Link
                  href={`/dashboard/marketing/emails/editor?template=${template.slug}&step=configuracao`}
                  className="group block cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-[var(--color-red-300)]"
                >
                  <div className="flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-slate-100 bg-[#f8fafc] p-5">
                    {template.imageUrl ? (
                      <Image
                        src={template.imageUrl}
                        alt={`Template ${template.name}`}
                        width={640}
                        height={360}
                        className="h-full w-full rounded-xl object-contain transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
                        <Plus className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-[88px] items-center p-4">
                    <div className="space-y-1.5">
                      <h3 className="!text-base font-semibold leading-tight text-slate-950 mb-1!">
                        {template.name}
                      </h3>
                      <p className="!text-sm text-slate-500 mb-0!">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent sideOffset={8} className="!text-xs">
                {template.slug === "blank"
                  ? "Clique aqui para iniciar um template do zero"
                  : "Clique aqui para iniciar com esse template"}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </section>
    </div>
  );
}
