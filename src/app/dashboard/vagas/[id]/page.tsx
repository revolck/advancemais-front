"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Building2,
  User,
  Briefcase,
  Target,
  Award,
  FileText,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getVagaById } from "@/api/vagas/admin";
import type { VagaDetail } from "@/api/vagas/admin/types";

export default function VagaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vaga, setVaga] = useState<VagaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vagaId = params.id as string;

  useEffect(() => {
    const fetchVaga = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getVagaById(vagaId);
        const vagaData = "data" in response ? response.data : response;
        setVaga(vagaData);
      } catch (err) {
        console.error("Erro ao carregar vaga:", err);
        setError("Erro ao carregar os detalhes da vaga");
      } finally {
        setLoading(false);
      }
    };

    if (vagaId) {
      fetchVaga();
    }
  }, [vagaId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLICADO":
        return "bg-green-100 text-green-800 border-green-200";
      case "RASCUNHO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "EM_ANALISE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DESPUBLICADA":
        return "bg-red-100 text-red-800 border-red-200";
      case "PAUSADA":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "ENCERRADA":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "EXPIRADO":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLICADO":
        return "Publicada";
      case "RASCUNHO":
        return "Rascunho";
      case "EM_ANALISE":
        return "Em Análise";
      case "DESPUBLICADA":
        return "Despublicada";
      case "PAUSADA":
        return "Pausada";
      case "ENCERRADA":
        return "Encerrada";
      case "EXPIRADO":
        return "Expirada";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !vaga) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalhes da Vaga
            </h1>
            <p className="text-gray-600">Erro ao carregar informações</p>
          </div>
        </div>
        <Alert>
          <AlertDescription>{error || "Vaga não encontrada"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{vaga.titulo}</h1>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${getStatusColor(vaga.status)}`}
            >
              {getStatusLabel(vaga.status)}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-mono bg-gray-50 text-gray-600 border-gray-200"
            >
              {vaga.codigo}
            </Badge>
          </div>
          <p className="text-gray-600">
            Criada em {formatDate(vaga.inseridaEm)} • Atualizada em{" "}
            {formatDate(vaga.atualizadoEm)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descrição da Vaga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {vaga.descricao}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Requisitos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Requisitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vaga.requisitos.obrigatorios.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Obrigatórios
                  </h4>
                  <ul className="space-y-1">
                    {vaga.requisitos.obrigatorios.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-red-500 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {vaga.requisitos.desejaveis.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Desejáveis</h4>
                  <ul className="space-y-1">
                    {vaga.requisitos.desejaveis.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-blue-500 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Atividades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vaga.atividades.principais.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Principais</h4>
                  <ul className="space-y-1">
                    {vaga.atividades.principais.map((atividade, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-green-500 mt-1">•</span>
                        {atividade}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {vaga.atividades.extras.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Extras</h4>
                  <ul className="space-y-1">
                    {vaga.atividades.extras.map((atividade, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-orange-500 mt-1">•</span>
                        {atividade}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefícios */}
          {vaga.beneficios.lista.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Benefícios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {vaga.beneficios.lista.map((beneficio, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-purple-500 mt-1">•</span>
                      {beneficio}
                    </li>
                  ))}
                </ul>
                {vaga.beneficios.observacoes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {vaga.beneficios.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {vaga.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {vaga.observacoes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={vaga.empresa.avatarUrl} />
                  <AvatarFallback>
                    {vaga.empresa.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {vaga.empresa.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {vaga.empresa.cidade}, {vaga.empresa.estado}
                  </p>
                </div>
              </div>
              {vaga.empresa.descricao && (
                <p className="text-sm text-gray-700">
                  {vaga.empresa.descricao}
                </p>
              )}
              {vaga.empresa.socialLinks && (
                <div className="flex gap-2">
                  {vaga.empresa.socialLinks.linkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={vaga.empresa.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalhes da Vaga */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Detalhes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Localização:</span>
                  <span className="font-medium">
                    {vaga.localizacao.cidade}, {vaga.localizacao.estado}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Modalidade:</span>
                  <span className="font-medium">
                    {vaga.modalidade === "REMOTO"
                      ? "Remoto"
                      : vaga.modalidade === "PRESENCIAL"
                      ? "Presencial"
                      : vaga.modalidade === "HIBRIDO"
                      ? "Híbrido"
                      : vaga.modalidade}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Jornada:</span>
                  <span className="font-medium">
                    {vaga.jornada === "INTEGRAL"
                      ? "Integral"
                      : vaga.jornada === "MEIO_PERIODO"
                      ? "Meio Período"
                      : vaga.jornada === "FLEXIVEL"
                      ? "Flexível"
                      : vaga.jornada}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Senioridade:</span>
                  <span className="font-medium">{vaga.senioridade}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Regime:</span>
                  <span className="font-medium">{vaga.regimeDeTrabalho}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Vagas:</span>
                  <span className="font-medium">
                    {vaga.numeroVagas || "Não informado"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vaga.salarioConfidencial ? (
                <p className="text-sm text-gray-600">Salário confidencial</p>
              ) : vaga.salarioMin || vaga.salarioMax ? (
                <div className="space-y-1">
                  {vaga.salarioMin && (
                    <p className="text-sm">
                      <span className="text-gray-600">Mínimo:</span>{" "}
                      <span className="font-medium">
                        {formatCurrency(vaga.salarioMin)}
                      </span>
                    </p>
                  )}
                  {vaga.salarioMax && (
                    <p className="text-sm">
                      <span className="text-gray-600">Máximo:</span>{" "}
                      <span className="font-medium">
                        {formatCurrency(vaga.salarioMax)}
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">A combinar</p>
              )}
            </CardContent>
          </Card>

          {/* Prazos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Prazos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Inscrições até:</span>
                <span className="font-medium">
                  {vaga.inscricoesAte
                    ? formatDate(vaga.inscricoesAte)
                    : "Não definida"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Criada em:</span>
                <span className="font-medium">
                  {formatDate(vaga.inseridaEm)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Área de Interesse */}
          <Card>
            <CardHeader>
              <CardTitle>Área de Interesse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-600">Categoria:</span>
                <span className="font-medium ml-1">
                  {vaga.areaInteresse.categoria}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Subárea:</span>
                <span className="font-medium ml-1">
                  {vaga.subareaInteresse.nome}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">PCD:</span>
                <Badge variant={vaga.paraPcd ? "default" : "secondary"}>
                  {vaga.paraPcd ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Modo Anônimo:</span>
                <Badge variant={vaga.modoAnonimo ? "default" : "secondary"}>
                  {vaga.modoAnonimo ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">
                  Máx. candidaturas por usuário:
                </span>
                <span className="font-medium ml-1">
                  {vaga.maxCandidaturasPorUsuario}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
