import { Icon } from "@/components/ui/custom/Icons";

interface MarketingPlaceholderPageProps {
  icon: "MessageSquare" | "Mail" | "Layout";
  title: string;
  description: string;
}

export default function MarketingPlaceholderPage({
  icon,
  title,
  description,
}: MarketingPlaceholderPageProps) {
  return (
    <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200/70">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0b2a6f]/6 text-[#0b2a6f]">
          <Icon name={icon} size={28} />
        </div>
        <span className="mt-6 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          Em breve
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
