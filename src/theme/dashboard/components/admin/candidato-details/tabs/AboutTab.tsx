"use client";

import React from "react";
import { Calendar, MapPin, User, FileText, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatLocalizacao } from "../utils/formatters";
import type { AboutTabProps } from "../types";

export function AboutTab({ candidato, isLoading = false }: AboutTabProps) {
  const socialLinks = candidato.socialLinks || {};
  const temSocialLinks = Object.values(socialLinks).some((link) => link);

  return (
    <div className="space-y-6">
      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Nome Completo
              </label>
              <p className="text-gray-900">{candidato.nomeCompleto}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">CPF</label>
              <p className="text-gray-900">{candidato.cpf}</p>
            </div>

            {candidato.genero && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Gênero
                </label>
                <p className="text-gray-900">{candidato.genero}</p>
              </div>
            )}

            {candidato.dataNasc && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Data de Nascimento
                </label>
                <p className="text-gray-900">
                  {formatDate(candidato.dataNasc)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{candidato.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Telefone
              </label>
              <p className="text-gray-900">
                {candidato.telefone || "Não informado"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Localização
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">
                  {formatLocalizacao(candidato)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redes Sociais */}
      {temSocialLinks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Redes Sociais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {socialLinks.linkedin && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  LinkedIn
                </Badge>
              )}
              {socialLinks.instagram && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Instagram
                </Badge>
              )}
              {socialLinks.facebook && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Facebook
                </Badge>
              )}
              {socialLinks.youtube && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  YouTube
                </Badge>
              )}
              {socialLinks.twitter && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Twitter
                </Badge>
              )}
              {socialLinks.tiktok && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  TikTok
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Descrição */}
      {candidato.descricao && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Descrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {candidato.descricao}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Data de Cadastro
              </label>
              <p className="text-gray-900">{formatDate(candidato.criadoEm)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Último Login
              </label>
              <p className="text-gray-900">
                {formatDate(candidato.ultimoLogin)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>
              <Badge
                variant={candidato.status === "ATIVO" ? "default" : "secondary"}
              >
                {candidato.status === "ATIVO" ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Tipo de Usuário
              </label>
              <p className="text-gray-900">{candidato.tipoUsuario}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
