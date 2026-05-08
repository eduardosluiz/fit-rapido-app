'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Input } from '@/components/admin/Input';
import { Select } from '@/components/admin/Select';
import { Checkbox } from '@/components/admin/Checkbox';
import '@/app/admin/form-styles.css';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  role: string;
  subscription_tier: string;
  email_verificado: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export default function EditarUsuario() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'user',
    subscription_tier: 'none',
    avatar_url: '',
    ativo: true,
  });

  const loadUsuario = async () => {
    try {
      setLoading(true);
      const usuario = await api.getUser(id);
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        role: usuario.role || 'user',
        subscription_tier: usuario.subscription_tier || 'none',
        avatar_url: usuario.avatar_url || '',
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar usuário');
      router.push('/admin/usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUsuario();
    }
  }, [id, isAuthenticated]);

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c8921a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {isAuthenticated === null ? 'Carregando...' : 'Carregando usuário...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      await api.updateUser(id, formData);
      router.push('/admin/usuarios');
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = [
    { value: 'user', label: 'Usuário' },
    { value: 'admin', label: 'Administrador' },
    { value: 'personal_trainer', label: 'Personal Trainer' },
  ];

  const subscriptionOptions = [
    { value: 'none', label: 'Nenhuma (Deprecated)' },
    { value: 'free', label: 'FREE (Gratuito)' },
    { value: 'basic', label: 'Básico (Deprecated)' },
    { value: 'premium', label: 'Premium (Receitas)' },
    { value: 'premium_fit', label: 'Premium Fit (Receitas + Treinos)' },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Editar Usuário"
          subtitle="Atualize as informações do usuário"
        />

        <Card className="mt-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <i className="bx bx-info-circle text-[#c8921a]" style={{ fontSize: '20px' }}></i>
                  Informações Básicas
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Nome Completo"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    error={errors.nome}
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    placeholder="usuario@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="URL do Avatar (opcional)"
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    helperText="URL da imagem de perfil do usuário"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Permissões e Assinatura */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <i className="bx bx-cog text-[#c8921a]" style={{ fontSize: '20px' }}></i>
                  Permissões e Assinatura
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Tipo de Usuário"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  options={roleOptions}
                />

                <Select
                  label="Plano de Assinatura"
                  required
                  value={formData.subscription_tier}
                  onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value })}
                  options={subscriptionOptions}
                />
              </div>

              <div className="md:col-span-2">
                <Checkbox
                  label="Usuário Ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  helperText="Desmarque para bloquear o acesso do usuário ao sistema"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                icon="bx-save"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button
                type="button"
                variant="outline"
                href="/admin/usuarios"
                icon="bx-arrow-back"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

