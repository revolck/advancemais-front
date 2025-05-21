/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Adicione a configuração de imagens para permitir domínios
  images: {
    domains: ["localhost"],
  },

  // Configuração para garantir que os assets sejam acessíveis em subdomínios
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://localhost:3000"
      : undefined,

  // Ativa o suporte a domínios cruzados para os assets
  crossOrigin: "anonymous",
};

module.exports = nextConfig;
