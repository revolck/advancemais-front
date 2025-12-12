"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonCustom } from "@/components/ui/custom";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { loadContent, type VideoAcademia } from "@/app/academia/db/loader";
import {
  PlayCircle,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  ChevronDown,
  Flame,
  Sparkles,
  BookOpen,
  Users,
  Settings,
  FileText,
} from "lucide-react";

// -----------------------------
// Tipos
// -----------------------------
type VideoTreinamento = VideoAcademia;

interface Modulo {
  id: VideoAcademia["module"];
  nome: string;
  icone: React.ElementType;
}

const modulos: Modulo[] = [
  { id: "primeiros-passos", nome: "Primeiros passos", icone: BookOpen },
  { id: "gestao-cursos", nome: "Gestão de cursos", icone: FileText },
  { id: "gestao-usuarios", nome: "Gestão de usuários", icone: Users },
  { id: "configuracoes", nome: "Configurações", icone: Settings },
];

// -----------------------------
// UI helpers
// -----------------------------
const rowScrollClass =
  "relative isolate flex gap-3 overflow-x-auto overflow-y-visible py-6 scroll-smooth snap-x snap-mandatory " +
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function getNivelBadgeClasses(nivel: VideoTreinamento["level"]) {
  switch (nivel) {
    case "Iniciante":
      return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
    case "Intermediário":
      return "bg-sky-500/15 text-sky-200 border-sky-500/30";
    case "Avançado":
      return "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/30";
  }
}

export default function AcademiaPage() {
  const router = useRouter();
  const role = useUserRole();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<VideoTreinamento | null>(null);
  const [playing, setPlaying] = useState<VideoTreinamento | null>(null);
  const [trilhas, setTrilhas] = useState<VideoAcademia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveRole = mounted ? role : null;

  // Carrega trilhas do JSON baseado na role
  useEffect(() => {
    if (!mounted || !effectiveRole) return;

    async function fetchTrilhas() {
      setLoading(true);
      try {
        const data = await loadContent(effectiveRole, "trilhas");
        setTrilhas(data);
      } catch (error) {
        console.error("Erro ao carregar trilhas:", error);
        setTrilhas([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTrilhas();
  }, [mounted, effectiveRole]);

  const getPlayerSrc = (url: string) => {
    const hasQuery = url.includes("?");
    return `${url}${hasQuery ? "&" : "?"}autoplay=1&rel=0`;
  };

  const handlePlay = (video: VideoTreinamento) => {
    if (!video.url) return;
    setPlaying(video);
  };

  const videosVisiveis = trilhas;

  const byCategoria = useMemo(() => {
    const map = new Map<VideoTreinamento["category"], VideoTreinamento[]>();
    for (const v of videosVisiveis) {
      map.set(v.category, [...(map.get(v.category) ?? []), v]);
    }
    return map;
  }, [videosVisiveis]);

  const destaque = useMemo(() => {
    return videosVisiveis[0] || null;
  }, [videosVisiveis]);

  const emAlta = useMemo(() => {
    // mock: reorder simples
    return [...videosVisiveis].reverse().slice(0, 6);
  }, [videosVisiveis]);

  const top10 = useMemo(() => {
    // mock: top10 usa o mesmo array, mas limitado
    return [...videosVisiveis, ...videosVisiveis].slice(0, 10);
  }, [videosVisiveis]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      {/* Hero / Banner */}
      <section className="relative h-[560px] overflow-hidden">
        {/* Vídeo de fundo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-[560px] w-full object-cover"
        >
          <source src="/academia/hero/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 h-[560px] w-full bg-linear-to-b from-black/30 via-black/35 to-[#0B0B0F]" />
        <div className="absolute inset-0 h-[560px] w-full bg-linear-to-r from-black/75 via-black/35 to-transparent" />

        <div className="relative container mx-auto h-full px-6">
          <div className="flex h-full items-center justify-center">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="text-sm! text-white/90">
                  Domine cada recurso da plataforma
                </span>
              </div>

              <h1 className="mt-5 text-5xl! sm:text-6xl! font-semibold tracking-tight">
                Sua jornada começa aqui
              </h1>

              <p className="mt-4 text-lg! sm:text-xl! text-white/80">
                Aprenda a criar cursos, gerenciar empresas, configurar acessos e
                muito mais. Vídeos práticos que te levam do zero ao domínio
                total da plataforma.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonCustom
                  size="lg"
                  variant="secondary"
                  icon="Play"
                  onClick={() => destaque && handlePlay(destaque)}
                  disabled={!destaque}
                >
                  Assistir agora
                </ButtonCustom>

                <ButtonCustom
                  size="lg"
                  variant="ghost"
                  className="bg-white/10! hover:bg-white/15! text-white!"
                  onClick={() => {
                    const el = document.getElementById("catalogo");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Explorar catálogo
                </ButtonCustom>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rows (Netflix style) */}
      <section id="catalogo" className="container mx-auto px-6 pb-20">
        {loading ? (
          <div className="py-20">
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white/80"></div>
              <h2 className="text-2xl! font-semibold text-white">
                Carregando conteúdo...
              </h2>
              <p className="mt-3 text-sm! text-white/70">
                Preparando as trilhas disponíveis para você.
              </p>
            </div>
          </div>
        ) : videosVisiveis.length === 0 ? (
          <div className="py-20">
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
              <h2 className="text-2xl! font-semibold text-white">
                Nenhum conteúdo disponível
              </h2>
              <p className="mt-3 text-sm! text-white/70">
                Estamos preparando novos treinamentos para o seu perfil. Se
                precisar, fale com um administrador.
              </p>
              <div className="mt-6 flex justify-center">
                <ButtonCustom
                  variant="secondary"
                  onClick={() => router.push("/dashboard")}
                >
                  Voltar para o Dashboard
                </ButtonCustom>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Em alta */}
            <Row
              title="Em alta na plataforma"
              items={emAlta}
              onOpen={setSelected}
            />

            {/* Top 10 (estilo Netflix) */}
            <Top10Row
              title="Top 10 na plataforma hoje"
              items={top10}
              onOpen={setSelected}
            />

            {/* Por categoria */}
            {Array.from(byCategoria.entries()).map(([categoria, items]) => {
              return (
                <Row
                  key={categoria}
                  title={categoria}
                  items={items}
                  onOpen={setSelected}
                />
              );
            })}

            {/* Por módulo */}
            <div className="mt-14">
              <h2 className="text-2xl! font-semibold text-white">
                Trilhas por módulo
              </h2>
              <p className="mt-2 text-sm! text-white/65">
                Uma forma rápida de aprender por tema — comece pelo que você
                precisa.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {modulos.map((m) => {
                  const Icon = m.icone;
                  const count = videosVisiveis.filter(
                    (v) => v.module === m.id
                  ).length;
                  return (
                    <Card
                      key={m.id}
                      className="border-white/10 bg-white/5 text-white transition-all hover:bg-white/7"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                            <Icon className="h-5 w-5 text-white/85" />
                          </div>
                          <Badge className="border-white/10 bg-white/5 text-white/80">
                            <span className="text-sm!">{count} vídeos</span>
                          </Badge>
                        </div>
                        <h3 className="mt-4 text-lg! font-semibold">
                          {m.nome}
                        </h3>
                        <p className="mt-1 text-sm! text-white/70">
                          Conteúdos organizados para você avançar com
                          consistência.
                        </p>
                        <ButtonCustom
                          fullWidth
                          className="mt-4 bg-white! text-black! hover:bg-white/90!"
                          onClick={() => {
                            const first = videosVisiveis.find(
                              (v) => v.module === m.id
                            );
                            if (first) setSelected(first);
                          }}
                        >
                          Ver conteúdos
                        </ButtonCustom>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Modal (ui/custom/modal com blur) */}
      <ModalCustom
        isOpen={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        size="4xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          closeButton:
            "text-white! bg-black/50 rounded-full p-1 hover:bg-black/70 z-10",
        }}
      >
        <ModalContentWrapper className="p-0! bg-[#0f0f14]! text-white! border border-white/10!">
          {selected && (
            <div>
              {/* Obrigatório para acessibilidade do Dialog (pode ficar oculto) */}
              <ModalHeader className="sr-only">
                <ModalTitle>Detalhes do vídeo</ModalTitle>
              </ModalHeader>

              {/* Capa do vídeo + CTA central */}
              <div
                className="relative h-60 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${selected.posterUrl})` }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-[#0f0f14] via-black/35 to-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ButtonCustom
                    size="lg"
                    variant="secondary"
                    icon="Play"
                    className="rounded-full!"
                    onClick={() => {
                      handlePlay(selected);
                      setSelected(null);
                    }}
                  >
                    Assistir
                  </ButtonCustom>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge
                    className={`border ${getNivelBadgeClasses(selected.level)}`}
                  >
                    <span className="text-sm!">{selected.level}</span>
                  </Badge>
                  <Badge className="border-white/10 bg-white/5 text-white/80">
                    <span className="text-sm!">{selected.category}</span>
                  </Badge>
                  <Badge className="border-white/10 bg-white/5 text-white/80">
                    <span className="text-sm!">
                      <Clock className="mr-1 inline-block h-3 w-3" />
                      {selected.duration}
                    </span>
                  </Badge>
                </div>

                <h3 className="text-2xl! font-semibold text-white mb-0!">
                  {selected.title}
                </h3>
                <p className="mt-1 text-sm! text-white/70 mb-0!">
                  {selected.description}
                </p>
              </div>
            </div>
          )}
        </ModalContentWrapper>
      </ModalCustom>

      {/* Player fullscreen (estilo Netflix/YouTube) */}
      <ModalCustom
        isOpen={!!playing}
        onOpenChange={(open) => {
          if (!open) setPlaying(null);
        }}
        size="full"
        radius="none"
        shadow="none"
        backdrop="blur"
        scrollBehavior="normal"
        classNames={{
          closeButton:
            "text-white! bg-black/50 rounded-full p-1 hover:bg-black/70 z-10",
          base: "p-0! border-0! bg-black! rounded-none!",
        }}
      >
        <ModalContentWrapper className="p-0! bg-black! border-0! rounded-none!">
          {playing && (
            <div className="h-screen w-full">
              {/* Obrigatório para acessibilidade do Dialog (pode ficar oculto) */}
              <ModalHeader className="sr-only">
                <ModalTitle>{playing.title}</ModalTitle>
              </ModalHeader>

              <iframe
                key={playing.id}
                className="h-screen w-full"
                src={getPlayerSrc(playing.url)}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </ModalContentWrapper>
      </ModalCustom>
    </div>
  );
}

function Top10Row({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: VideoTreinamento[];
  onOpen: (video: VideoTreinamento) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const needsScroll = el.scrollWidth > el.clientWidth;
      setHasScroll(needsScroll);
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  const scrollByAmount = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.85),
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl! font-semibold text-white mb-0!">{title}</h2>

        {hasScroll && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => scrollByAmount(-1)}
              disabled={!canLeft}
              className={[
                "h-10 w-10 rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm",
                "grid place-items-center transition-all duration-200",
                canLeft
                  ? "opacity-100 hover:bg-black/80 hover:border-white/40"
                  : "opacity-30 cursor-not-allowed",
              ].join(" ")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Próximo"
              onClick={() => scrollByAmount(1)}
              disabled={!canRight}
              className={[
                "h-10 w-10 rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm",
                "grid place-items-center transition-all duration-200",
                canRight
                  ? "opacity-100 hover:bg-black/80 hover:border-white/40"
                  : "opacity-30 cursor-not-allowed",
              ].join(" ")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-visible">
        <div ref={scrollerRef} className={rowScrollClass}>
          {items.map((v, idx) => (
            <Top10Card
              key={`${v.id}-${idx}`}
              rank={idx + 1}
              video={v}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Top10Card({
  rank,
  video,
  onOpen,
}: {
  rank: number;
  video: VideoTreinamento;
  onOpen: (video: VideoTreinamento) => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.2 }}
      transition={{ duration: 0.18 }}
      className="relative h-[150px] w-[360px] shrink-0 snap-start overflow-visible"
      style={{ zIndex: 0 }}
      onMouseEnter={(e) => (e.currentTarget.style.zIndex = "9999")}
      onMouseLeave={(e) => (e.currentTarget.style.zIndex = "0")}
    >
      {/* número gigante */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 select-none">
        <span
          className="text-[120px] font-extrabold leading-none text-white/10"
          style={{
            WebkitTextStroke: "2px rgba(255,255,255,0.22)",
          }}
        >
          {rank}
        </span>
      </div>

      <div className="absolute left-14 right-0 top-0 h-full">
        <button
          type="button"
          onClick={() => onOpen(video)}
          className="group cursor-pointer relative h-full w-full border-0 bg-transparent text-left shadow-[0_0_0_0_rgba(0,0,0,0)] transition-shadow duration-200 hover:shadow-2xl overflow-visible"
        >
          {/* Capa */}
          <div className="relative h-[150px] w-full overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.08] scale-[1.06]"
              style={{ backgroundImage: `url(${video.posterUrl})` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-black/10 transition-opacity duration-200 group-hover:bg-black/50" />

            {/* Botão Play centralizado (aparece no hover) */}
            <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black backdrop-blur-sm shadow-2xl transition-transform hover:scale-110">
                <Play className="h-8 w-8 fill-black" />
              </div>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

function Row({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: VideoTreinamento[];
  onOpen: (video: VideoTreinamento) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const needsScroll = el.scrollWidth > el.clientWidth;
      setHasScroll(needsScroll);
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  const scrollByAmount = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.85),
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-15">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl! font-semibold! text-white! mb-0!">{title}</h2>

        {hasScroll && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => scrollByAmount(-1)}
              disabled={!canLeft}
              className={[
                "h-10 w-10 rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm",
                "grid place-items-center transition-all duration-200",
                canLeft
                  ? "opacity-100 hover:bg-black/80 hover:border-white/40"
                  : "opacity-30 cursor-not-allowed",
              ].join(" ")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Próximo"
              onClick={() => scrollByAmount(1)}
              disabled={!canRight}
              className={[
                "h-10 w-10 rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm",
                "grid place-items-center transition-all duration-200",
                canRight
                  ? "opacity-100 hover:bg-black/80 hover:border-white/40"
                  : "opacity-30 cursor-not-allowed",
              ].join(" ")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-visible">
        <div ref={scrollerRef} className={rowScrollClass}>
          {items.map((v) => (
            <VideoCard key={v.id} video={v} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoCard({
  video,
  onOpen,
}: {
  video: VideoTreinamento;
  onOpen: (video: VideoTreinamento) => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.24 }}
      transition={{ duration: 0.18 }}
      className="relative w-[260px] shrink-0 snap-start overflow-visible"
      style={{ zIndex: 0 }}
      onMouseEnter={(e) => (e.currentTarget.style.zIndex = "9999")}
      onMouseLeave={(e) => (e.currentTarget.style.zIndex = "0")}
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onOpen(video)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(video);
          }
        }}
        className="group cursor-pointer border-0 bg-transparent text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 hover:shadow-2xl p-0! overflow-visible"
      >
        {/* Capa */}
        <div className="relative h-[146px] w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.10] scale-[1.06]"
            style={{ backgroundImage: `url(${video.posterUrl})` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-black/10 transition-opacity duration-200 group-hover:bg-black/50" />

          {/* Botão Play centralizado (aparece no hover) */}
          <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black backdrop-blur-sm shadow-2xl transition-transform hover:scale-110">
              <Play className="h-8 w-8 fill-black" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
