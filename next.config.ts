/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuração de imagens otimizada
  images: {
    // Domínios permitidos para imagens externas
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.advancemais.com",
      },
      {
        protocol: "https",
        hostname: "**.render.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
    ],
    // Formatos suportados
    formats: ["image/webp", "image/avif"],
    // Tamanhos de dispositivo para responsive
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Asset prefix baseado no ambiente
  assetPrefix: process.env.NEXT_PUBLIC_BASE_URL || undefined,

  // Configurações de performance
  poweredByHeader: false,
  compress: true,

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
