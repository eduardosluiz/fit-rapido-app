import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Suprimir warnings de hidratação causados por extensões do navegador
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configurações para melhorar performance e evitar problemas de hidratação
  experimental: {
    optimizePackageImports: ['@/lib/api'],
  },
};

export default nextConfig;
