'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login(formData.email, formData.senha);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token não foi salvo. Verifique a conexão.');
      }
      
      // Redirecionamento suave para evitar fechar a conexão de proxy abruptamente
      router.replace('/admin');
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 
            style={{
              fontSize: '40px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}
          >
            Fit & Rápido
          </h1>
          <p 
            style={{
              fontSize: '18px',
              color: '#c8921a',
              fontWeight: '500',
            }}
          >
            Painel Administrativo
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '16px',
            padding: '40px 32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <p style={{ color: '#ef4444', fontSize: '14px', margin: 0, flex: 1 }}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Email de Acesso
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  color: '#ffffff',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Senha
              </label>
              <input
                type="password"
                required
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  color: '#ffffff',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#c8921a',
                color: '#ffffff',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '12px',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
