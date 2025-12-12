"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputCustom } from "@/components/ui/custom";
import { RichTextarea } from "@/components/ui/custom/text-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  Loader2,
  Paperclip,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMaterialArquivo,
  createMaterialLink,
  createMaterialTexto,
  validarArquivo,
  formatarTamanhoArquivo,
} from "@/api/aulas/core";
import { MATERIAIS_CONFIG } from "@/api/aulas/types";
import { toastCustom } from "@/components/ui/custom";

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
  const [activeTab, setActiveTab] = useState<"arquivo" | "link" | "texto">("arquivo");

  // Estado para ARQUIVO
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arquivoTitulo, setArquivoTitulo] = useState("");
  const [arquivoDescricao, setArquivoDescricao] = useState("");
  const [arquivoObrigatorio, setArquivoObrigatorio] = useState(false);

  // Estado para LINK
  const [linkTitulo, setLinkTitulo] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescricao, setLinkDescricao] = useState("");
  const [linkObrigatorio, setLinkObrigatorio] = useState(false);

  // Estado para TEXTO
  const [textoTitulo, setTextoTitulo] = useState("");
  const [textoConteudo, setTextoConteudo] = useState("");
  const [textoDescricao, setTextoDescricao] = useState("");
  const [textoObrigatorio, setTextoObrigatorio] = useState(false);

  const limiteAtingido = materiaisCount >= MATERIAIS_CONFIG.MAX_POR_AULA;

  // Mutation para arquivo
  const arquivoMutation = useMutation({
    mutationFn: () => {
      if (!arquivo) throw new Error("Nenhum arquivo selecionado");
      return createMaterialArquivo(
        aulaId,
        arquivo,
        arquivoTitulo,
        arquivoDescricao,
        arquivoObrigatorio
      );
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

  // Mutation para link
  const linkMutation = useMutation({
    mutationFn: () =>
      createMaterialLink(aulaId, {
        titulo: linkTitulo,
        linkUrl,
        descricao: linkDescricao,
        obrigatorio: linkObrigatorio,
      }),
    onSuccess: () => {
      toastCustom.success("Material de link adicionado!");
      resetLinkForm();
      queryClient.invalidateQueries({ queryKey: ["aulaMateriais", aulaId] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao adicionar link");
    },
  });

  // Mutation para texto
  const textoMutation = useMutation({
    mutationFn: () =>
      createMaterialTexto(aulaId, {
        titulo: textoTitulo,
        conteudoHtml: textoConteudo,
        descricao: textoDescricao,
        obrigatorio: textoObrigatorio,
      }),
    onSuccess: () => {
      toastCustom.success("Material de texto adicionado!");
      resetTextoForm();
      queryClient.invalidateQueries({ queryKey: ["aulaMateriais", aulaId] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toastCustom.error(error.message || "Erro ao adicionar texto");
    },
  });

  // Reset forms
  const resetArquivoForm = () => {
    setArquivo(null);
    setArquivoTitulo("");
    setArquivoDescricao("");
    setArquivoObrigatorio(false);
  };

  const resetLinkForm = () => {
    setLinkTitulo("");
    setLinkUrl("");
    setLinkDescricao("");
    setLinkObrigatorio(false);
  };

  const resetTextoForm = () => {
    setTextoTitulo("");
    setTextoConteudo("");
    setTextoDescricao("");
    setTextoObrigatorio(false);
  };

  // Handler para seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validacao = validarArquivo(file, MATERIAIS_CONFIG);
    if (!validacao.valido) {
      toastCustom.error(validacao.erro || "Arquivo inválido");
      e.target.value = "";
      return;
    }

    setArquivo(file);
    if (!arquivoTitulo) {
      setArquivoTitulo(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Handlers de submit
  const handleArquivoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo || !arquivoTitulo.trim()) {
      toastCustom.error("Arquivo e título são obrigatórios");
      return;
    }
    arquivoMutation.mutate();
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitulo.trim() || !linkUrl.trim()) {
      toastCustom.error("Título e URL são obrigatórios");
      return;
    }
    // Validar URL
    try {
      new URL(linkUrl);
    } catch {
      toastCustom.error("URL inválida");
      return;
    }
    linkMutation.mutate();
  };

  const handleTextoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoTitulo.trim() || !textoConteudo.trim()) {
      toastCustom.error("Título e conteúdo são obrigatórios");
      return;
    }
    textoMutation.mutate();
  };

  const isLoading =
    arquivoMutation.isPending ||
    linkMutation.isPending ||
    textoMutation.isPending;

  if (limiteAtingido) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Limite de {MATERIAIS_CONFIG.MAX_POR_AULA} materiais por aula
              atingido. Remova um material para adicionar outro.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Adicionar Material Complementar
        </CardTitle>
        <p className="text-sm text-gray-500 mt-2">
          Limite: {materiaisCount}/{MATERIAIS_CONFIG.MAX_POR_AULA} materiais
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="arquivo" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Arquivo
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="texto" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Texto
            </TabsTrigger>
          </TabsList>

          {/* Tab ARQUIVO */}
          <TabsContent value="arquivo" className="space-y-4 mt-4">
            <form onSubmit={handleArquivoSubmit} className="space-y-4">
              <div>
                <Label htmlFor="arquivo-file">Arquivo *</Label>
                <input
                  id="arquivo-file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
                  accept={MATERIAIS_CONFIG.EXTENSOES_PERMITIDAS.join(",")}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo {formatarTamanhoArquivo(MATERIAIS_CONFIG.MAX_TAMANHO_ARQUIVO)}
                  {" • "}
                  Formatos: PDF, DOC, XLS, PPT, ZIP, imagens, áudio, vídeo
                </p>
              </div>

              {arquivo && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Paperclip className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <strong>{arquivo.name}</strong> ({formatarTamanhoArquivo(arquivo.size)})
                  </AlertDescription>
                </Alert>
              )}

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
                disabled={!arquivo || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar Arquivo
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Tab LINK */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <InputCustom
                label="Título *"
                value={linkTitulo}
                onChange={(e) => setLinkTitulo(e.target.value)}
                placeholder="Ex: Documentação Oficial"
                required
                disabled={isLoading}
              />

              <InputCustom
                label="URL *"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
                required
                disabled={isLoading}
              />

              <InputCustom
                label="Descrição"
                value={linkDescricao}
                onChange={(e) => setLinkDescricao(e.target.value)}
                placeholder="Descrição opcional do link"
                disabled={isLoading}
              />

              <div className="flex items-center space-x-2">
                <Switch
                  id="link-obrigatorio"
                  checked={linkObrigatorio}
                  onCheckedChange={setLinkObrigatorio}
                  disabled={isLoading}
                />
                <Label htmlFor="link-obrigatorio">Material obrigatório</Label>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Adicionar Link
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Tab TEXTO */}
          <TabsContent value="texto" className="space-y-4 mt-4">
            <form onSubmit={handleTextoSubmit} className="space-y-4">
              <InputCustom
                label="Título *"
                value={textoTitulo}
                onChange={(e) => setTextoTitulo(e.target.value)}
                placeholder="Ex: Resumo da Aula"
                required
                disabled={isLoading}
              />

              <div>
                <Label htmlFor="texto-conteudo">Conteúdo *</Label>
                <RichTextarea
                  id="texto-conteudo"
                  value={textoConteudo}
                  onChange={(e) =>
                    setTextoConteudo((e.target as HTMLTextAreaElement).value)
                  }
                  placeholder="Digite o conteúdo do material..."
                  maxLength={10000}
                  showCharCount
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>

              <InputCustom
                label="Descrição"
                value={textoDescricao}
                onChange={(e) => setTextoDescricao(e.target.value)}
                placeholder="Descrição opcional"
                disabled={isLoading}
              />

              <div className="flex items-center space-x-2">
                <Switch
                  id="texto-obrigatorio"
                  checked={textoObrigatorio}
                  onCheckedChange={setTextoObrigatorio}
                  disabled={isLoading}
                />
                <Label htmlFor="texto-obrigatorio">Material obrigatório</Label>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Adicionar Texto
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

