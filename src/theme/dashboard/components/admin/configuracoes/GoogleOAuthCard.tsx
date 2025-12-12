"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Video,
} from "lucide-react";
import {
  getGoogleOAuthStatus,
  connectGoogle,
  disconnectGoogle,
} from "@/api/aulas";
import { toastCustom } from "@/components/ui/custom";

export function GoogleOAuthCard() {
  const queryClient = useQueryClient();
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);

  // Query para buscar status da conexão
  const {
    data: status,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["googleOAuthStatus"],
    queryFn: getGoogleOAuthStatus,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  // Mutation para conectar
  const connectMutation = useMutation({
    mutationFn: connectGoogle,
    onSuccess: (data) => {
      // Redirecionar para a URL de autorização do Google
      window.location.href = data.authUrl;
    },
    onError: (error: Error) => {
      toastCustom.error(
        error.message || "Erro ao iniciar conexão com o Google"
      );
    },
  });

  // Mutation para desconectar
  const disconnectMutation = useMutation({
    mutationFn: disconnectGoogle,
    onSuccess: () => {
      toastCustom.success("Conta Google desconectada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["googleOAuthStatus"] });
      setIsDisconnectDialogOpen(false);
    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao desconectar Google");
    },
  });

  const handleConnect = () => {
    connectMutation.mutate(undefined);
  };

  const handleDisconnectConfirm = () => {
    disconnectMutation.mutate(undefined);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Google Calendar & Meet
          </CardTitle>
          <CardDescription>
            Conecte sua conta Google para criar aulas ao vivo automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Google Calendar & Meet
          </CardTitle>
          <CardDescription>
            Conecte sua conta Google para criar aulas ao vivo automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao verificar status da conexão Google. Tente novamente mais
              tarde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isConectado = status?.conectado ?? false;
  const expiresAt = status?.expiresAt
    ? new Date(status.expiresAt)
    : null;
  const isExpired = expiresAt ? expiresAt < new Date() : false;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Google Calendar & Meet
              </CardTitle>
              <CardDescription className="mt-2">
                Conecte sua conta Google para criar aulas ao vivo
                automaticamente
              </CardDescription>
            </div>
            {isConectado && !isExpired && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            )}
            {isConectado && isExpired && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Expirado
              </Badge>
            )}
            {!isConectado && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <XCircle className="h-3 w-3 mr-1" />
                Desconectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações sobre a funcionalidade */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              O que você pode fazer:
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                <span>Criar links do Google Meet automaticamente para aulas ao vivo</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                <span>Adicionar eventos no Google Calendar automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <Video className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                <span>Gravar aulas ao vivo no Google Drive (opcional)</span>
              </li>
            </ul>
          </div>

          {/* Status da conexão */}
          {isConectado && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Conta conectada com sucesso!
                </span>
              </div>
              {status?.email && (
                <p className="text-sm text-green-600">
                  Conectado como: <strong>{status.email}</strong>
                </p>
              )}
              {expiresAt && !isExpired && (
                <p className="text-xs text-green-600">
                  Expira em:{" "}
                  {expiresAt.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {isExpired && (
                <Alert className="bg-red-50 border-red-200 mt-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    A conexão expirou. Reconecte sua conta para continuar
                    usando os recursos do Google.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Alertas */}
          {!isConectado && (
            <Alert>
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Conecte sua conta Google para habilitar a criação automática de
                aulas ao vivo com Google Meet.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2">
            {!isConectado || isExpired ? (
              <Button
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="w-full"
              >
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    {isExpired ? "Reconectar Google" : "Conectar Google"}
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsDisconnectDialogOpen(true)}
                disabled={disconnectMutation.isPending}
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de desconexão */}
      <AlertDialog
        open={isDisconnectDialogOpen}
        onOpenChange={setIsDisconnectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar conta Google?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao desconectar, você não poderá mais criar aulas ao vivo com
              Google Meet automaticamente até reconectar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnectConfirm}
              disabled={disconnectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {disconnectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desconectando...
                </>
              ) : (
                "Desconectar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

