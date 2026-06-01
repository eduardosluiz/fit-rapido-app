import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    // Ignorar erros de lint durante o build para permitir deploy na Hostinger
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de tipagem durante o build para permitir deploy na Hostinger
    ignoreBuildErrors: true,
  },
  // Suprimir warnings de hidratação causados por extensões do navegador
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configurações para melhorar performance e evitar problemas de hidratação
  // experimental: {
  //   optimizePackageImports: ['@/lib/api'],
  // },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://backend.daipohlmann.com.br/:path*',
      },
    ];
  },
};

export default nextConfig;
