'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Permitir acesso à página de login sem autenticação
    if (pathname === '/admin/login') {
      return;
    }

    // Se não estiver autenticado e não estiver na página de login, redirecionar
    if (isAuthenticated === false) {
      router.push('/admin/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Mostrar loading enquanto verifica autenticação
  if (!mounted || (isAuthenticated === null && pathname !== '/admin/login')) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-[#c8921a] mb-4">
            <i className="bx bx-loader-alt animate-spin"></i>
          </div>
          <p className="text-[#999]">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se estiver na página de login, mostrar sempre
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Se não estiver autenticado, não renderizar (já redirecionou)
  if (!isAuthenticated) {
    return null;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}

