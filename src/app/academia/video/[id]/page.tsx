"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ButtonCustom } from "@/components/ui/custom";
import { useUserRole } from "@/hooks/useUserRole";
import { loadVideoById, type VideoAcademia } from "@/app/academia/db/loader";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function VideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params?.id as string;
  const role = useUserRole();
  const [mounted, setMounted] = useState(false);
  const [video, setVideo] = useState<VideoAcademia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !role) return;

    async function fetchVideo() {
      setLoading(true);
      try {
        const data = await loadVideoById(videoId, role, "trilhas");
        setVideo(data);
      } catch (error) {
        console.error("Erro ao carregar vídeo:", error);
        setVideo(null);
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [mounted, role, videoId]);

  const getPlayerSrc = (url: string) => {
    const hasQuery = url.includes("?");
    return `${url}${hasQuery ? "&" : "?"}autoplay=1&rel=0`;
  };

  if (loading || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white/80"></div>
          <p className="text-sm! text-white/70">Carregando vídeo...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-white/50" />
          <h2 className="mb-2 text-2xl! font-bold text-white">
            Vídeo não encontrado
          </h2>
          <p className="mb-6 text-sm! text-white/70">
            O vídeo que você procura não existe ou não está disponível para seu perfil.
          </p>
          <ButtonCustom
            onClick={() => router.push("/academia")}
            variant="secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Academia
          </ButtonCustom>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black">
      {/* Player fullscreen */}
      <div className="relative h-full w-full">
        <iframe
          src={getPlayerSrc(video.url)}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        />

        {/* Botão voltar (canto superior esquerdo) */}
        <div className="absolute left-6 top-6">
          <ButtonCustom
            onClick={() => router.push("/academia")}
            className="bg-black/60! text-white! hover:bg-black/80! backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
}
