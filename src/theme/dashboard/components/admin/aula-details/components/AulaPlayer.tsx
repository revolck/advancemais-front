"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Play } from "lucide-react";
import { updateAulaProgresso } from "@/api/aulas";
import { toastCustom } from "@/components/ui/custom";
import type { Aula } from "@/api/aulas";

interface AulaPlayerProps {
  aula: Aula;
  inscricaoId: string;
  initialProgress?: number; // Progresso inicial em percentual (0-100)
}

/**
 * Extrai o ID do vídeo do YouTube da URL
 */
function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function AulaPlayer({
  aula,
  inscricaoId,
  initialProgress = 0,
}: AulaPlayerProps) {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [progresso, setProgresso] = useState(initialProgress);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef(0);

  const videoId = aula.youtubeUrl ? extractYouTubeId(aula.youtubeUrl) : null;

  /**
   * Salva o progresso na API
   */
  const salvarProgresso = useCallback(
    async (currentSeconds: number, videoDuration: number) => {
      if (!videoDuration || videoDuration === 0) return;

      const percentual = Math.min(
        100,
        (currentSeconds / videoDuration) * 100
      );

      try {
        await updateAulaProgresso(aula.id, {
          inscricaoId,
          percentualAssistido: Math.floor(percentual),
          tempoAssistidoSegundos: Math.floor(currentSeconds),
          ultimaPosicao: Math.floor(currentSeconds),
        });

        setProgresso(percentual);
        lastSavedTimeRef.current = currentSeconds;

        // Notificar se completou (>= 90%)
        if (percentual >= 90 && percentual < 91) {
          toastCustom.success("Aula concluída! 🎉");
        }
      } catch (error) {
        console.error("Erro ao salvar progresso:", error);
      }
    },
    [aula.id, inscricaoId]
  );

  /**
   * Handler quando o player está pronto
   */
  const onReady: YouTubeProps["onReady"] = (event) => {
    setPlayer(event.target);
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);

    // Se há progresso inicial, pular para a posição
    if (initialProgress > 0 && videoDuration > 0) {
      const startTime = (initialProgress / 100) * videoDuration;
      event.target.seekTo(startTime, true);
    }
  };

  /**
   * Handler quando o vídeo começa a tocar
   */
  const onPlay = () => {
    setIsPlaying(true);
  };

  /**
   * Handler quando o vídeo pausa
   */
  const onPause = () => {
    setIsPlaying(false);
    if (player && duration > 0) {
      const currentSeconds = player.getCurrentTime();
      salvarProgresso(currentSeconds, duration);
    }
  };

  /**
   * Handler quando o vídeo termina
   */
  const onEnd = () => {
    setIsPlaying(false);
    if (player && duration > 0) {
      salvarProgresso(duration, duration);
    }
  };

  /**
   * Handler de mudança de estado
   */
  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    // YouTube Player States:
    // -1 (unstarted)
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued)
    
    if (event.data === 1) {
      // Playing
      setIsPlaying(true);
    } else if (event.data === 2 || event.data === 0) {
      // Paused or Ended
      setIsPlaying(false);
    }
  };

  /**
   * Atualizar tempo atual e salvar a cada 30 segundos
   */
  useEffect(() => {
    if (isPlaying && player && duration > 0) {
      // Limpar intervalo anterior
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Criar novo intervalo
      intervalRef.current = setInterval(() => {
        const currentSeconds = player.getCurrentTime();
        setCurrentTime(currentSeconds);

        // Salvar a cada 30 segundos
        if (currentSeconds - lastSavedTimeRef.current >= 30) {
          salvarProgresso(currentSeconds, duration);
        }
      }, 1000); // Atualizar a cada 1 segundo para suavidade

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isPlaying, player, duration, salvarProgresso]);

  /**
   * Salvar ao desmontar o componente
   */
  useEffect(() => {
    return () => {
      if (player && duration > 0) {
        const currentSeconds = player.getCurrentTime();
        salvarProgresso(currentSeconds, duration);
      }
    };
  }, [player, duration, salvarProgresso]);

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0, // Não mostrar vídeos relacionados
      modestbranding: 1, // Logo do YouTube minimalista
      fs: 1, // Permitir fullscreen
      cc_load_policy: 0, // Não carregar legendas automaticamente
    },
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!videoId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>
              URL do YouTube inválida ou não encontrada.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const progressoArredondado = Math.floor(progresso);
  const isCompleted = progressoArredondado >= 90;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Assistir Aula
          </CardTitle>
          {isCompleted && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluída
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player do YouTube */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onPlay={onPlay}
            onPause={onPause}
            onEnd={onEnd}
            onStateChange={onStateChange}
            className="absolute inset-0"
            iframeClassName="w-full h-full"
          />
        </div>

        {/* Informações de progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <span className="font-medium text-gray-900">
              {progressoArredondado}% assistido
            </span>
          </div>

          {/* Barra de progresso */}
          <Progress value={progresso} className="h-2" />

          {/* Mensagem de conclusão */}
          {isCompleted && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Parabéns!</strong> Você completou esta aula. Continue
                para a próxima!
              </AlertDescription>
            </Alert>
          )}

          {/* Mensagem de salvamento automático */}
          <p className="text-xs text-gray-500 text-center">
            Seu progresso é salvo automaticamente a cada 30 segundos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}



