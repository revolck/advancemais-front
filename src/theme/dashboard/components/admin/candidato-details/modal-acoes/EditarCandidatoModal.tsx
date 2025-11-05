"use client";

import { useState, useEffect } from "react";
import { UserCog, Loader2 } from "lucide-react";
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
import type { CandidatoDetailsData } from "../types";

interface EditarCandidatoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidato: CandidatoDetailsData;
  onConfirm: (data: Partial<CandidatoDetailsData>) => Promise<void>;
}

export function EditarCandidatoModal({
  isOpen,
  onOpenChange,
  candidato,
  onConfirm,
}: EditarCandidatoModalProps) {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    telefone: "",
    cpf: "",
    genero: "",
    dataNasc: "",
    cidade: "",
    estado: "",
    descricao: "",
    status: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (candidato) {
      setFormData({
        nomeCompleto: candidato.nomeCompleto || "",
        email: candidato.email || "",
        telefone: candidato.telefone || "",
        cpf: candidato.cpf || "",
        genero: candidato.genero || "",
        dataNasc: candidato.dataNasc ? candidato.dataNasc.split("T")[0] : "",
        cidade: candidato.cidade || "",
        estado: candidato.estado || "",
        descricao: candidato.descricao || "",
        status: candidato.status || "",
      });
    }
  }, [candidato]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomeCompleto.trim()) {
      setError("O nome completo é obrigatório");
      return;
    }

    if (!formData.email.trim()) {
      setError("O email é obrigatório");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updateData: Partial<CandidatoDetailsData> = {
        nomeCompleto: formData.nomeCompleto.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || null,
        cpf: formData.cpf.trim() || undefined,
        genero: formData.genero || null,
        dataNasc: formData.dataNasc || null,
        cidade: formData.cidade.trim() || null,
        estado: formData.estado.trim() || null,
        descricao: formData.descricao.trim() || null,
        status: formData.status,
      };

      await onConfirm(updateData);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar candidato"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Editar Candidato
          </DialogTitle>
          <DialogDescription>
            Edite as informações do candidato{" "}
            <strong>{candidato.nomeCompleto}</strong>.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={(e) =>
                  handleInputChange("nomeCompleto", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genero">Gênero</Label>
              <Select
                value={formData.genero}
                onValueChange={(value) => handleInputChange("genero", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                  <SelectItem value="NAO_INFORMADO">Não informado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNasc">Data de Nascimento</Label>
              <Input
                id="dataNasc"
                type="date"
                value={formData.dataNasc}
                onChange={(e) => handleInputChange("dataNasc", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleInputChange("cidade", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => handleInputChange("estado", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
                <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descrição do candidato..."
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
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
