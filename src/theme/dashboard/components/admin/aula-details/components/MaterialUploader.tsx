"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputCustom } from "@/components/ui/custom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MATERIAIS_CONFIG } from "@/api/aulas/types";
import { toastCustom } from "@/components/ui/custom";
import {
  FileUploadMultiple,
  type FileUploadItem,
  type AcceptedFileType,
} from "@/components/ui/custom/file-upload";
import { uploadFile } from "@/services/upload";
import { createMaterialArquivoFromUrl } from "@/api/aulas/core";

interface MaterialUploaderProps {
  aulaId: string;
  materiaisCount: number;
  onSuccess?: () => void;
}

export function MaterialUploader({
  aulaId,
  materiaisCount,
  onSuccess,
}: MaterialUploaderProps) {
  const queryClient = useQueryClient();

  // Estado para ARQUIVO usando FileUploadMultiple
  const [arquivoFiles, setArquivoFiles] = useState<FileUploadItem[]>([]);
  const [arquivoTitulo, setArquivoTitulo] = useState("");
  const [arquivoDescricao, setArquivoDescricao] = useState("");
  const [arquivoObrigatorio, setArquivoObrigatorio] = useState(false);

  const limiteAtingido = materiaisCount >= MATERIAIS_CONFIG.MAX_POR_AULA;
  const arquivoSelecionado = arquivoFiles.length > 0 && arquivoFiles[0]?.file;

  // Mutation para arquivo
  const arquivoMutation = useMutation({
    mutationFn: async () => {
      if (!arquivoSelecionado || !arquivoTitulo.trim()) {
        throw new Error("Arquivo e título são obrigatórios");
      }

      // Upload do arquivo
      const uploadResult = await uploadFile(
        arquivoSelecionado,
        "materiais/aulas"
      );

      // Criar material com URL do upload
      return createMaterialArquivoFromUrl(aulaId, {
        titulo: arquivoTitulo,
        arquivoUrl: uploadResult.url,
        arquivoNome: uploadResult.originalName,
        arquivoTamanho: uploadResult.size,
        arquivoMimeType: uploadResult.mimeType,
        descricao: arquivoDescricao || undefined,
        obrigatorio: arquivoObrigatorio,
      });
    },
    onSuccess: () => {
      toastCustom.success("Material de arquivo adicionado!");
      resetArquivoForm();
      queryClient.invalidateQueries({ queryKey: ["aulaMateriais", aulaId] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao adicionar arquivo");
    },
  });

  // Reset form
  const resetArquivoForm = () => {
    setArquivoFiles([]);
    setArquivoTitulo("");
    setArquivoDescricao("");
    setArquivoObrigatorio(false);
  };

  // Handler para quando arquivos são selecionados
  const handleArquivosChange = (files: FileUploadItem[]) => {
    setArquivoFiles(files);
    // Se há arquivo selecionado e título está vazio, preencher com nome do arquivo
    if (files.length > 0 && files[0]?.file && !arquivoTitulo) {
      const fileName = files[0].file.name.replace(/\.[^/.]+$/, "");
      setArquivoTitulo(fileName);
    }
  };

  // Handler de submit
  const handleArquivoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoSelecionado || !arquivoTitulo.trim()) {
      toastCustom.error("Arquivo e título são obrigatórios");
      return;
    }
    arquivoMutation.mutate();
  };

  const isLoading = arquivoMutation.isPending;

  if (limiteAtingido) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700">
          Limite de {MATERIAIS_CONFIG.MAX_POR_AULA} materiais por aula atingido.
          Remova um material para adicionar outro.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground mb-0">
          Materiais Complementares
        </Label>
        <p className="text-xs! text-gray-500!">
          Limite: {materiaisCount}/{MATERIAIS_CONFIG.MAX_POR_AULA} materiais
        </p>
      </div>

      {/* Formulário de arquivo */}
      <form onSubmit={handleArquivoSubmit} className="space-y-4">
        {/* FileUploadMultiple - igual ao cadastro */}
        <FileUploadMultiple
          files={arquivoFiles}
          onFilesChange={handleArquivosChange}
          maxFiles={1}
          maxSize={MATERIAIS_CONFIG.MAX_TAMANHO_ARQUIVO}
          accept={
            MATERIAIS_CONFIG.EXTENSOES_PERMITIDAS as unknown as AcceptedFileType[]
          }
          disabled={isLoading}
        />

        {/* Formulário para adicionar metadados do arquivo */}
        {arquivoSelecionado && (
          <>
            <InputCustom
              label="Título *"
              value={arquivoTitulo}
              onChange={(e) => setArquivoTitulo(e.target.value)}
              placeholder="Ex: Apostila de Node.js"
              required
              disabled={isLoading}
            />

            <InputCustom
              label="Descrição"
              value={arquivoDescricao}
              onChange={(e) => setArquivoDescricao(e.target.value)}
              placeholder="Descrição opcional do material"
              disabled={isLoading}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="arquivo-obrigatorio"
                checked={arquivoObrigatorio}
                onCheckedChange={setArquivoObrigatorio}
                disabled={isLoading}
              />
              <Label htmlFor="arquivo-obrigatorio">Material obrigatório</Label>
            </div>

            <Button
              type="submit"
              disabled={
                !arquivoSelecionado || !arquivoTitulo.trim() || isLoading
              }
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Adicionar Arquivo"
              )}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
