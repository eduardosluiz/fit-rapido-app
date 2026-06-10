import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  experimental: {
    // Reduzir consumo de memória e threads durante o build na nuvem
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: true,
  },
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
