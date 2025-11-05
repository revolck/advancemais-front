"use client";

import React from "react";
import { Mail, Phone, MapPin, Globe, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatLocalizacao } from "../utils/formatters";
import type { ContatoTabProps } from "../types";
import type { Endereco } from "@/api/candidatos/types";

export function ContatoTab({ candidato, isLoading = false }: ContatoTabProps) {
  const socialLinks = candidato.socialLinks || {};
  const enderecos = candidato.enderecos || [];

  return (
    <div className="space-y-6">
      {/* Informações de Contato Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                <p className="text-gray-600">{candidato.email}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Enviar Email
                </Button>
              </div>
            </div>

            {/* Telefone */}
            {candidato.telefone && (
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Telefone</h4>
                  <p className="text-gray-600">{candidato.telefone}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Ligar
                  </Button>
                </div>
              </div>
            )}

            {/* Localização */}
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Localização</h4>
                <p className="text-gray-600">{formatLocalizacao(candidato)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereços */}
      {enderecos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereços ({enderecos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enderecos.map((endereco: Endereco) => (
                <div
                  key={endereco.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Endereço
                      </h4>
                      <p className="text-gray-600">
                        {endereco.logradouro}, {endereco.numero}
                      </p>
                      <p className="text-gray-600">{endereco.bairro}</p>
                      <p className="text-gray-600">
                        {endereco.cidade}, {endereco.estado}
                      </p>
                      <p className="text-gray-600">CEP: {endereco.cep}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Redes Sociais */}
      {Object.values(socialLinks).some((link) => link) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Redes Sociais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialLinks.linkedin && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">LinkedIn</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {socialLinks.linkedin}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Visitar
                  </Button>
                </div>
              )}

              {socialLinks.instagram && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-pink-100 rounded-lg">
                    <Globe className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Instagram</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {socialLinks.instagram}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Visitar
                  </Button>
                </div>
              )}

              {socialLinks.facebook && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Facebook</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {socialLinks.facebook}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Visitar
                  </Button>
                </div>
              )}

              {socialLinks.youtube && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                    <Globe className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">YouTube</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {socialLinks.youtube}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Visitar
                  </Button>
                </div>
              )}

              {socialLinks.twitter && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Twitter</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {socialLinks.twitter}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Visitar
                  </Button>
                </div>
              )}

              {socialLinks.tiktok && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                    <Globe className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">TikTok</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {socialLinks.tiktok}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Visitar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Enviar Mensagem
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Agendar Ligação
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Iniciar Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
