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
    try {
      const userData = await api.getProfile();
      // A API retorna o objeto user diretamente
      if (userData && userData.id) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setIsAuthenticated(false);
      // Limpar token inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  }, []);

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
        // Só redirecionar para /admin se estiver REALMENTE na página de login
        // (evita bug de F5 redirecionar para dashboard em outras páginas)
        if (currentPath === '/admin/login') {
          router.replace('/admin');
        }
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

