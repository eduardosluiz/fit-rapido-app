'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const menuItems = [
    { href: '/dashboard', icon: 'bx-home', label: 'Dashboard', active: true },
    { href: '/recipes', icon: 'bx-bowl-hot', label: 'Receitas', active: false },
    { href: '/workouts', icon: 'bx-dumbbell', label: 'Treinos', active: false },
    { href: '/profile', icon: 'bx-user', label: 'Perfil', active: false },
  ];

  const quickActions = [
    { icon: 'bx-search', label: 'Buscar', action: 'search' },
    { icon: 'bx-heart', label: 'Favoritos', action: 'favorites' },
    { icon: 'bx-calendar', label: 'Agendar', action: 'schedule' },
    { icon: 'bx-shopping-bag', label: 'Loja', action: 'shop' },
  ];

  const user = {
    name: 'Maria Silva',
    email: 'maria@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    subscription: 'premium'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40"></div>
      
      {/* Mobile Menu */}
      <div className="fixed top-0 right-0 h-full w-80 bg-background border-l border-card-border z-50 transform translate-x-0">
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-heading font-bold text-primary">Menu</span>
            <Link href="/" className="text-text-light hover:text-primary transition-colors">
              <i className="bx bx-x text-2xl"></i>
            </Link>
          </div>

          {/* User Info */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-text">{user.name}</h3>
                <p className="text-text-light text-sm">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <i className="bx bx-crown text-primary text-sm"></i>
                  <span className="text-primary text-xs font-semibold">Premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    item.active
                      ? 'bg-primary text-background'
                      : 'text-text-light hover:bg-primary/20 hover:text-primary'
                  }`}
                >
                  <i className={`bx ${item.icon} text-xl`}></i>
                  <span className="font-medium">{item.label}</span>
                  {item.active && (
                    <i className="bx bx-chevron-right ml-auto"></i>
                  )}
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h4 className="text-text-light text-sm font-semibold mb-4 px-4">
                Ações Rápidas
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="bg-card-bg border border-card-border rounded-xl p-4 text-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 group"
                  >
                    <i className={`bx ${action.icon} text-2xl text-primary mb-2 group-hover:scale-110 transition-transform`}></i>
                    <p className="text-text-light text-sm font-medium">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-card-border">
            <div className="space-y-3">
              <button className="w-full bg-primary text-background py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors">
                <i className="bx bx-crown mr-2"></i>
                Gerenciar Assinatura
              </button>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-card-bg border border-card-border text-text-light py-3 rounded-xl font-semibold hover:bg-primary/20 hover:text-primary transition-colors">
                  <i className="bx bx-cog mr-2"></i>
                  Configurações
                </button>
                <button className="flex-1 bg-card-bg border border-card-border text-text-light py-3 rounded-xl font-semibold hover:bg-red-500/20 hover:text-red-400 transition-colors">
                  <i className="bx bx-log-out mr-2"></i>
                  Sair
                </button>
              </div>
            </div>

            {/* App Info */}
            <div className="text-center mt-6">
              <p className="text-text-light text-xs">
                Fit & Rápido v1.0.0
              </p>
              <p className="text-text-light text-xs mt-1">
                © 2024 Daiane Pohlmann
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Info */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <h3 className="font-heading text-lg font-bold text-text mb-2">
            Menu Mobile Demo
          </h3>
          <p className="text-text-light text-sm mb-4">
            Este é um exemplo do menu mobile da plataforma. Clique em qualquer item para navegar.
          </p>
          <Link href="/" className="btn-primary">
            <i className="bx bx-home mr-2"></i>
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}