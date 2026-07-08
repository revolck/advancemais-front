import HeaderPages from "@/theme/website/components/header-pages";
import type { HeaderPageData } from "@/theme/website/components/header-pages/types";

export const metadata = {
  title: "Como Comprar",
};

const headerData: HeaderPageData = {
  id: "como-comprar-static",
  title: "Como Comprar",
  subtitle: "Em construção",
  description: "Esta página está em construção no momento.",
  buttonText: "Fale conosco",
  buttonUrl: "/fale-conosco",
  imageUrl: "/images/headers/default-header.webp",
  imageAlt: "Como Comprar",
  isActive: true,
  targetPages: ["/como-comprar"],
};

export default function ComoComprarPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <HeaderPages
        fetchFromApi={false}
        staticData={headerData}
        currentPage="/como-comprar"
      />

      <main className="container mx-auto px-4 py-10 pb-20">
        <section className="rounded-[32px] bg-white px-8 py-12 text-center shadow-sm ring-1 ring-slate-200/70">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            Em construção
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Estamos preparando este conteúdo.
          </p>
        </section>
      </main>
    </div>
  );
}
