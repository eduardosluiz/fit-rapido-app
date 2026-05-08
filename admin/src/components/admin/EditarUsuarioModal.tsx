'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/admin/BaseModal';
import { Button } from '@/components/admin/Button';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  role: string;
  subscription_tier: string;
  email_verificado: boolean;
  avatar_url?: string;
  ativo?: boolean;
  created_at: string;
  updated_at: string;
}

interface EditarUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioId: string | null;
  onUsuarioChange?: () => void;
}

export function EditarUsuarioModal({
  open,
  onOpenChange,
  usuarioId,
  onUsuarioChange,
}: EditarUsuarioModalProps) {
  const [loading, setLoading] = useState(false);
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
    if (!usuarioId) return;
    
    try {
      setLoading(true);
      const usuario = await api.getUser(usuarioId);
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        role: usuario.role || 'user',
        subscription_tier: usuario.subscription_tier || 'none',
        avatar_url: usuario.avatar_url || '',
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      });
      setErrors({});
    } catch (err: any) {
      console.error('Erro ao carregar usuário:', err);
      alert(err.message || 'Erro ao carregar usuário');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && usuarioId) {
      loadUsuario();
    } else {
      setFormData({
        nome: '',
        email: '',
        role: 'user',
        subscription_tier: 'none',
        avatar_url: '',
        ativo: true,
      });
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, usuarioId]);

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
    
    if (!validate() || !usuarioId) {
      return;
    }

    setSaving(true);

    try {
      await api.updateUser(usuarioId, formData);
      if (onUsuarioChange) {
        onUsuarioChange();
      }
      onOpenChange(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
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
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Usuário"
      description="Atualize as informações do usuário"
      icon="bx bx-user"
      maxWidth="2xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#c8921a] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações Básicas */}
          <div className="p-4 rounded-lg border-2 border-[#c8921a]/30 bg-gradient-to-br from-[#c8921a]/5 to-transparent dark:from-[#c8921a]/10 dark:to-transparent w-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-[#c8921a]/10 to-[#c8921a]/5 dark:from-[#c8921a]/20 dark:to-[#c8921a]/10 rounded-lg">
                <i className="bx bx-info-circle text-[#c8921a] text-base"></i>
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Informações Básicas
              </h3>
            </div>

            <div className="space-y-3">
              <FormField label="Nome Completo" required error={errors.nome}>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </FormField>

              <FormField label="Email" required error={errors.email}>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@example.com"
                />
              </FormField>

              <FormField label="URL do Avatar (opcional)">
                <Input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </FormField>
            </div>
          </div>

          {/* Permissões e Assinatura */}
          <div className="p-4 rounded-lg border-2 border-[#c8921a]/30 bg-gradient-to-br from-[#c8921a]/5 to-transparent dark:from-[#c8921a]/10 dark:to-transparent w-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-[#c8921a]/10 to-[#c8921a]/5 dark:from-[#c8921a]/20 dark:to-[#c8921a]/10 rounded-lg">
                <i className="bx bx-cog text-[#c8921a] text-base"></i>
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Permissões e Assinatura
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tipo de Usuário" required>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Plano de Assinatura" required>
                <Select
                  value={formData.subscription_tier}
                  onValueChange={(value) => setFormData({ ...formData, subscription_tier: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="mt-4 flex items-center justify-between p-2.5 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a]">
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 rounded">
                  <i className="bx bx-check-circle text-green-600 dark:text-green-400 text-sm"></i>
                </div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                  Usuário Ativo
                </label>
              </div>
              <Switch
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-0.5 border border-gray-200 dark:border-gray-700 w-full pt-2 border-t-0">
            <Button
              type="button"
              onClick={handleCancel}
              variant="magic"
              icon="bx-x"
              size="sm"
              className="flex-1 bg-transparent !text-gray-600 dark:!text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 [&_i]:!text-gray-600 dark:[&_i]:!text-gray-400"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="magic"
              icon="bx-check"
              size="sm"
              disabled={saving}
              className="flex-1 !bg-white !text-[#c8921a] dark:!bg-gray-700 dark:!text-[#d4a020] [&_i]:!text-[#c8921a] dark:[&_i]:!text-[#d4a020] shadow-md border border-gray-200 dark:border-gray-600"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      )}
    </BaseModal>
  );
}

