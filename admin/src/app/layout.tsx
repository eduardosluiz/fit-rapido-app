import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Importar supressão de erros ANTES de qualquer outro código
import { SuppressExtensionErrorsInit } from "@/components/SuppressExtensionErrorsInit";
import { SuppressExtensionErrors } from "@/components/SuppressExtensionErrors";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fit & Rápido - Admin",
  description: "Painel administrativo para gerenciamento de receitas e treinos",
  keywords: "admin, receitas, treinos, fitness",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head suppressHydrationWarning />
      <body className="font-inter antialiased" suppressHydrationWarning>
        <SuppressExtensionErrorsInit />
        <Toaster position="top-right" reverseOrder={false} />
        {children}
        <SuppressExtensionErrors />
      </body>
    </html>
  );
}
