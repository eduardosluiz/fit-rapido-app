'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Inicializar o tema corretamente
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme');
      localStorage.setItem('admin-theme', 'light');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  // Se estiver na página de login, não mostrar o menu/sidebar e retornar limpo
  if (pathname === '/admin/login') {
    return <div className={isDarkTheme ? 'dark' : ''}>{children}</div>;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'bx-home', roles: ['admin', 'personal_trainer', 'ADMIN'] },
    { href: '/admin/receitas', label: 'Receitas', icon: 'bx-food-menu', roles: ['admin', 'ADMIN'] },
    { href: '/admin/treinos', label: 'Treinos', icon: 'bx-dumbbell', roles: ['admin', 'personal_trainer', 'ADMIN'] },
    { href: '/admin/modalidades', label: 'Modalidades', icon: 'bx-layer', roles: ['admin', 'personal_trainer', 'ADMIN'] },
    { href: '/admin/biblioteca', label: 'Biblioteca', icon: 'bx-video', roles: ['admin', 'personal_trainer', 'ADMIN'] },
    { href: '/admin/ingredientes', label: 'Ingredientes', icon: 'bx-package', roles: ['admin', 'ADMIN'] },
    { href: '/admin/usuarios', label: 'Usuários', icon: 'bx-user', roles: ['admin', 'ADMIN'] },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (!user || !user.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className={`admin-container ${isDarkTheme ? 'dark-theme' : ''}`}>
      {/* Mobile Menu Button - Somente em Mobile */}
      <button 
        type="button"
        className="admin-mobile-menu-btn md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <i className={`bx ${isSidebarOpen ? 'bx-x' : 'bx-menu'}`}></i>
      </button>

      {/* Sidebar Oficial */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h1>Fit & Rápido</h1>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <i className={`bx ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-user-section">
          {user && (
            <div className="admin-user-card">
              <div className="admin-user-avatar">
                {user.nome?.charAt(0).toUpperCase()}
              </div>
              <div className="admin-user-info">
                <div className="admin-user-name">{user.nome}</div>
                <div className="admin-user-email">{user.role === 'admin' ? 'Administrador' : 'Equipe'}</div>
              </div>
            </div>
          )}
          
          {/* Botões do Rodapé: 50/50 Alinhados */}
          <div style={{ display: 'flex', gap: '8px', padding: '0 4px' }}>
            {/* Botão de Tema (Ícone Sol/Lua) */}
            <button
              onClick={toggleTheme}
              className="admin-nav-item"
              style={{ 
                flex: '1', 
                justifyContent: 'center', 
                margin: 0, 
                padding: '12px 0',
                background: isDarkTheme ? 'rgba(200, 146, 26, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: isDarkTheme ? 'rgba(200, 146, 26, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              title={isDarkTheme ? 'Modo Claro' : 'Modo Escuro'}
            >
              <i className={`bx ${isDarkTheme ? 'bx-sun' : 'bx-moon'}`} style={{ opacity: 1, color: isDarkTheme ? '#c8921a' : '#94a3b8' }}></i>
            </button>

            {/* Botão de Perfil/Senha */}
            <button
              onClick={() => router.push('/admin/perfil')}
              className="admin-nav-item"
              style={{ 
                flex: '1', 
                justifyContent: 'center', 
                margin: 0, 
                padding: '12px 0',
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              title="Mudar Senha / Perfil"
            >
              <i className="bx bx-key" style={{ opacity: 1, color: '#94a3b8' }}></i>
            </button>

            {/* Botão de Sair */}
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
              style={{ 
                flex: '1', 
                padding: '12px 0',
                margin: 0,
                fontSize: '10px',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(220, 38, 38, 0.08)',
                borderColor: 'rgba(220, 38, 38, 0.2)'
              }}
            >
              <i className='bx bx-log-out' style={{ fontSize: '14px' }}></i>
              <span style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
