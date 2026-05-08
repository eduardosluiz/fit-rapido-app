'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg md:text-xl font-semibold text-gray-800 hover:text-green-500 transition-colors duration-300">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="bx bx-restaurant text-white text-xs md:text-sm"></i>
            </div>
            <span className="hidden sm:block">Fit & Rápido</span>
            <span className="sm:hidden">F&R</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-green-500 transition-colors duration-300">Dashboard</Link>
            <Link href="/recipes" className="text-gray-600 hover:text-green-500 transition-colors duration-300">Receitas</Link>
            <Link href="/workouts" className="text-gray-600 hover:text-green-500 transition-colors duration-300">Treinos</Link>
            <Link href="/profile" className="text-gray-600 hover:text-green-500 transition-colors duration-300">Perfil</Link>
            <button className="btn-primary group">
              <i className="bx bx-user mr-2 group-hover:scale-110 transition-transform"></i>
              <span className="hidden sm:inline">Entrar</span>
              <span className="sm:hidden">Login</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
              <button
                className="md:hidden text-gray-600 hover:text-green-500 transition-all duration-300 hover:scale-110 p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
            <i className={`bx text-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'bx-x rotate-180' : 'bx-menu'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
          <div className={`fixed top-0 right-0 h-full w-72 md:w-80 bg-white/95 backdrop-blur-md transform translate-x-full transition-transform duration-500 z-50 border-l border-gray-200 ${isMobileMenuOpen ? 'translate-x-0' : ''}`}>
        <div className="p-4 md:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-semibold text-gray-800">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-600 hover:text-green-500 transition-colors hover:scale-110 p-2"
              aria-label="Close mobile menu"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
          
          <nav className="flex-1 flex flex-col gap-2">
                <Link href="/dashboard" className="text-gray-600 hover:text-green-500 text-lg flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="bx bx-home text-xl"></i>
                  Dashboard
                </Link>
                <Link href="/recipes" className="text-gray-600 hover:text-green-500 text-lg flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="bx bx-bowl-hot text-xl"></i>
                  Receitas
                </Link>
                <Link href="/workouts" className="text-gray-600 hover:text-green-500 text-lg flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="bx bx-dumbbell text-xl"></i>
                  Treinos
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-green-500 text-lg flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="bx bx-user text-xl"></i>
                  Perfil
                </Link>

                <div className="pt-6 border-t border-gray-200 mt-auto">
                  <button className="btn-primary w-full group">
                <i className="bx bx-user mr-2 group-hover:scale-110 transition-transform"></i>
                Entrar
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
