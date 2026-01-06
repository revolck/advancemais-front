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
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
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
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL || undefined
      : undefined,

  // Configurações de performance
  poweredByHeader: false,
  compress: true,

  // Ignora erros do ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },

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
    optimizeCss: false,
    scrollRestoration: true,
  },

  // Proxy das rotas /api para o backend, evitando problemas de CORS
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://advancemais-api-7h1q.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
