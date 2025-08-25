"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ButtonCustom,
  Icon,
} from "@/components/ui/custom";

/**
 * Página de configuração da página inicial
 * Dashboard centralizado para gerenciar componentes da home
 */
export default function PaginaInicialConfigPage() {
  const configSections = [
    {
      title: "Sliders",
      description: "Gerencie os sliders do carrossel principal",
      icon: "Image" as const,
      links: [
        {
          href: "/dashboard/website/slider/desktop",
          label: "Sliders Desktop",
          description: "Configurar para telas grandes",
        },
        {
          href: "/dashboard/website/slider/mobile",
          label: "Sliders Mobile",
          description: "Configurar para dispositivos móveis",
        },
      ],
      status: "active",
      stats: "4/4 configurados",
    },
    {
      title: "Seção Sobre",
      description: "Configure o conteúdo da seção 'Sobre Nós'",
      icon: "FileText" as const,
      links: [
        {
          href: "/dashboard/config/website/pagina-inicial/sobre",
          label: "Editar Conteúdo",
          description: "Texto, imagens e call-to-action",
        },
      ],
      status: "active",
      stats: "Atualizado",
    },
    {
      title: "Seção Serviços",
      description: "Gerencie os serviços em destaque na home",
      icon: "Briefcase" as const,
      links: [
        {
          href: "/dashboard/config/website/pagina-inicial/servicos",
          label: "Gerenciar Serviços",
          description: "Adicionar, editar ou reordenar serviços",
        },
      ],
      status: "pending",
      stats: "3 serviços",
    },
    {
      title: "SEO & Meta Tags",
      description: "Otimização para mecanismos de busca",
      icon: "Search" as const,
      links: [
        {
          href: "/dashboard/config/website/pagina-inicial/seo",
          label: "Configurar SEO",
          description: "Título, descrição e palavras-chave",
        },
      ],
      status: "warning",
      stats: "Requer atenção",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-blue-600 bg-blue-100";
      case "warning":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Configuração da Página Inicial
        </h1>
        <p className="text-muted-foreground text-lg">
          Gerencie todos os componentes e conteúdos da página inicial do seu
          site.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Eye" className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Visualizações hoje
                </p>
                <p className="text-lg font-semibold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Users" className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Visitantes únicos
                </p>
                <p className="text-lg font-semibold">892</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo médio</p>
                <p className="text-lg font-semibold">2m 34s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="TrendingUp" className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa conversão</p>
                <p className="text-lg font-semibold">3.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configSections.map((section) => (
          <Card key={section.title} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon
                      name={section.icon}
                      className="w-5 h-5 text-primary"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>

                <span
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getStatusColor(section.status)
                  )}
                >
                  {section.stats}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <Icon
                    name="ArrowRight"
                    className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border/30">
        <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <ButtonCustom variant="outline" size="sm">
            <Icon name="Eye" className="w-4 h-4 mr-2" />
            Visualizar Site
          </ButtonCustom>
          <ButtonCustom variant="outline" size="sm">
            <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
            Limpar Cache
          </ButtonCustom>
          <ButtonCustom variant="outline" size="sm">
            <Icon name="Download" className="w-4 h-4 mr-2" />
            Exportar Configurações
          </ButtonCustom>
          <ButtonCustom variant="outline" size="sm">
            <Icon name="BarChart3" className="w-4 h-4 mr-2" />
            Relatório de Performance
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
}
