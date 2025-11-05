"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BloquearCandidatoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidatoNome: string;
  onConfirm: (data: BloquearCandidatoData) => Promise<void>;
}

interface BloquearCandidatoData {
  motivo: string;
  duracao?: number;
  observacoes?: string;
}

export function BloquearCandidatoModal({
  isOpen,
  onOpenChange,
  candidatoNome,
  onConfirm,
}: BloquearCandidatoModalProps) {
  const [motivo, setMotivo] = useState("");
  const [duracao, setDuracao] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo.trim()) {
      setError("O motivo do bloqueio é obrigatório");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data: BloquearCandidatoData = {
        motivo: motivo.trim(),
        duracao: duracao ? parseInt(duracao) : undefined,
        observacoes: observacoes.trim() || undefined,
      };

      await onConfirm(data);

      // Reset form
      setMotivo("");
      setDuracao("");
      setObservacoes("");
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao bloquear candidato"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setMotivo("");
    setDuracao("");
    setObservacoes("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Bloquear Candidato
          </DialogTitle>
          <DialogDescription>
            Você está prestes a bloquear o candidato{" "}
            <strong>{candidatoNome}</strong>. Esta ação impedirá que ele acesse
            o sistema.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo do Bloqueio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Violação dos termos de uso"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracao">Duração do Bloqueio</Label>
            <Select value={duracao} onValueChange={setDuracao}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a duração (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 dia</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="15">15 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="permanente">Permanente</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Se não selecionado, o bloqueio será permanente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Adicionais</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre o bloqueio..."
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
              variant="destructive"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Bloquear Candidato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}










