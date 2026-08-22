'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from './api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = useCallback(async () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    try {
      const userData = await api.getProfile();
      // A API retorna o objeto user diretamente
      if (userData && userData.id) {
        setUser(userData);
        setIsAuthenticated(true);
        if (currentPath === '/admin/login') {
          router.replace('/admin');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        if (currentPath !== '/admin/login') {
          router.replace('/admin/login');
        }
      }
    } catch (error) {
      // Sessão expirada é um fluxo esperado: limpar e voltar ao login sem
      // disparar o overlay vermelho do Next.js em desenvolvimento.
      setIsAuthenticated(false);
      setUser(null);
      // Limpar token inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      if (currentPath !== '/admin/login') {
        router.replace('/admin/login');
      }
    }
  }, [pathname, router]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      api.logout();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      // Usar pathname real da URL para evitar redirecionamentos incorretos no F5
      const currentPath = window.location.pathname;
      
      if (token) {
        loadUser();
      } else {
        setIsAuthenticated(false);
        // Só redirecionar se não estiver na página de login
        if (currentPath !== '/admin/login') {
          router.replace('/admin/login');
        }
      }
    }
  }, [mounted, pathname, router, loadUser]);

  return { isAuthenticated, user, logout };
}
