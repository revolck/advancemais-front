"use client";

import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DesbloquearCandidatoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidatoNome: string;
  onConfirm: (observacoes?: string) => Promise<void>;
}

export function DesbloquearCandidatoModal({
  isOpen,
  onOpenChange,
  candidatoNome,
  onConfirm,
}: DesbloquearCandidatoModalProps) {
  const [observacoes, setObservacoes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(observacoes.trim() || undefined);

      // Reset form
      setObservacoes("");
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao desbloquear candidato"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setObservacoes("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Shield className="h-5 w-5" />
            Desbloquear Candidato
          </DialogTitle>
          <DialogDescription>
            Você está prestes a desbloquear o candidato{" "}
            <strong>{candidatoNome}</strong>. Esta ação restaurará o acesso dele
            ao sistema.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Motivo do desbloqueio ou observações adicionais..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Desbloquear Candidato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}










