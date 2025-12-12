"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Circle,
} from "lucide-react";
import { registrarPresenca } from "@/api/aulas";
import { toastCustom } from "@/components/ui/custom";
import type { Aula } from "@/api/aulas";
import { formatDateTime } from "../utils";
import { cn } from "@/lib/utils";

interface AulaAoVivoProps {
  aula: Aula;
  inscricaoId: string;
}

export function AulaAoVivo({ aula, inscricaoId }: AulaAoVivoProps) {
  const [presencaRegistrada, setPresencaRegistrada] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [now, setNow] = useState(new Date());

  // Atualizar horário a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  if (!aula.dataInicio || !aula.dataFim) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Data e horário da aula não estão definidos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const dataInicio = new Date(aula.dataInicio);
  const dataFim = new Date(aula.dataFim);
  const podeEntrar = now >= dataInicio && aula.meetUrl;
  const aulaEncerrada = now > dataFim;
  const aulaEmAndamento = now >= dataInicio && now <= dataFim;
  const faltaTempo = dataInicio.getTime() - now.getTime();
  const faltaMinutos = Math.floor(faltaTempo / 60000);
  const faltaHoras = Math.floor(faltaMinutos / 60);

  const entrarNaAula = async () => {
    if (!aula.meetUrl || !podeEntrar) return;

    setIsRegistering(true);

    try {
      // Registrar entrada
      await registrarPresenca(aula.id, {
        inscricaoId,
        tipo: "entrada",
      });

      setPresencaRegistrada(true);
      toastCustom.success("Presença registrada!");

      // Abrir Meet em nova aba
      window.open(aula.meetUrl, "_blank", "noopener,noreferrer");

      // Configurar listener para registrar saída quando a aba voltar ao foco
      const handleVisibilityChange = async () => {
        if (document.visibilityState === "visible" && presencaRegistrada) {
          // Opcional: registrar saída automaticamente
          // await registrarPresenca(aula.id, { inscricaoId, tipo: "saida" });
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    } catch (error) {
      console.error("Erro ao registrar presença:", error);
      toastCustom.error("Erro ao registrar presença");
    } finally {
      setIsRegistering(false);
    }
  };

  const registrarSaida = async () => {
    try {
      await registrarPresenca(aula.id, {
        inscricaoId,
        tipo: "saida",
      });

      toastCustom.success("Saída registrada!");
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
      toastCustom.error("Erro ao registrar saída");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-600" />
            Aula Ao Vivo
          </CardTitle>
          {aulaEmAndamento && (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 animate-pulse"
            >
              <Circle className="h-2 w-2 fill-current mr-1" />
              AO VIVO
            </Badge>
          )}
          {aulaEncerrada && (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-700 border-gray-200"
            >
              Encerrada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações da aula */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Data e Horário
              </p>
              <p className="text-sm text-gray-600">
                {formatDateTime(aula.dataInicio)} -{" "}
                {new Date(aula.dataFim).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {!aulaEmAndamento && !aulaEncerrada && (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Tempo restante
                </p>
                <p className="text-sm text-gray-600">
                  {faltaHoras > 0
                    ? `${faltaHoras} hora${faltaHoras > 1 ? "s" : ""} e ${faltaMinutos % 60} minuto${faltaMinutos % 60 !== 1 ? "s" : ""}`
                    : `${faltaMinutos} minuto${faltaMinutos !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Alertas */}
        {!aulaEncerrada && !aulaEmAndamento && (
          <Alert>
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              A aula ainda não começou. O link do Google Meet estará disponível
              no horário de início.
            </AlertDescription>
          </Alert>
        )}

        {aulaEncerrada && !aula.linkGravacao && (
          <Alert>
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700">
              Esta aula já foi encerrada.
              {aula.gravarAula &&
                " A gravação estará disponível em breve no Google Drive."}
            </AlertDescription>
          </Alert>
        )}

        {/* Botão para entrar na aula */}
        {!aulaEncerrada && (
          <div className="space-y-3">
            <Button
              onClick={entrarNaAula}
              disabled={!podeEntrar || isRegistering}
              size="lg"
              className={cn(
                "w-full",
                aulaEmAndamento &&
                  "bg-red-600 hover:bg-red-700 animate-pulse"
              )}
            >
              {isRegistering ? (
                <>Registrando presença...</>
              ) : presencaRegistrada ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Voltar para a Sala
                </>
              ) : (
                <>
                  <Video className="mr-2 h-5 w-5" />
                  Entrar na Sala
                </>
              )}
            </Button>

            {presencaRegistrada && aulaEmAndamento && (
              <Button
                onClick={registrarSaida}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Registrar Saída
              </Button>
            )}

            {presencaRegistrada && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>Presença registrada!</strong> Você está participando
                  da aula.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Link da gravação */}
        {aula.linkGravacao && (
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Gravação Disponível
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full"
              >
                <a
                  href={aula.linkGravacao}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Assistir Gravação
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Status da gravação */}
        {aula.gravarAula && !aula.linkGravacao && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Circle
                className={cn(
                  "h-3 w-3",
                  aula.statusGravacao === "PROCESSANDO" && "animate-pulse"
                )}
              />
              <span>
                Gravação:{" "}
                {aula.statusGravacao === "PROCESSANDO"
                  ? "Processando..."
                  : aula.statusGravacao === "DISPONIVEL"
                  ? "Disponível"
                  : aula.statusGravacao === "ERRO"
                  ? "Erro ao processar"
                  : "Aguardando"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

