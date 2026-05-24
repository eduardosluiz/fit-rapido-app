'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { DataTable } from '@/components/admin/DataTable';
import { EditarUsuarioModal } from '@/components/admin/EditarUsuarioModal';
import { TrocarSenhaModal } from '@/components/admin/TrocarSenhaModal';
import { Search, ChevronDown, Loader2, Edit3, Lock, CheckCircle, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import '@/app/admin/data-table.css';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  role: string;
  subscription_tier: string;
  email_verificado: boolean;
  ativo?: boolean;
  created_at: string;
  updated_at: string;
}

export default function UsuariosPage() {
  const { isAuthenticated } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [trocarSenhaModalOpen, setTrocarSenhaModalOpen] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);
  const [usuarioNome, setUsuarioNome] = useState('');

  useEffect(() => {
    if (isAuthenticated) loadUsuarios();
  }, [isAuthenticated]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsuarios(data);
      setUsuariosFiltrados(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = (usuarios || []).filter(u => {
      const matchesSearch = u.nome?.toLowerCase().includes(searchText.toLowerCase()) || u.email?.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = !selectedRole || u.role === selectedRole;
      return matchesSearch && matchesRole;
    });
    setUsuariosFiltrados(filtered);
  }, [searchText, selectedRole, usuarios]);

  const handleToggleBlock = async (usuario: Usuario) => {
    const action = usuario.ativo === false ? 'desbloquear' : 'bloquear';
    if (!confirm(`Confirmar ${action} do usuário ${usuario.nome}?`)) return;
    try {
      await api.updateUser(usuario.id, { ativo: !usuario.ativo });
      toast.success('Status atualizado');
      loadUsuarios();
    } catch (err) {
      toast.error('Erro ao atualizar');
    }
  };

  const columns = [
    { header: 'Nome de Usuário', accessor: 'nome', render: (u: Usuario) => <div className="font-elegant">{u.nome}</div> },
    { header: 'E-mail de Acesso', accessor: 'email', render: (u: Usuario) => <div className="text-gray-400 text-xs font-light">{u.email}</div> },
    { header: 'Perfil', accessor: 'role', render: (u: Usuario) => <span className={`badge-slim ${u.role === 'admin' ? 'text-purple-500' : 'text-blue-500'}`}>{u.role}</span> },
    { header: 'Assinatura', accessor: 'subscription_tier', render: (u: Usuario) => <span className="text-[10px] font-medium text-[#c8921a] tracking-tight uppercase">{u.subscription_tier || 'FREE'}</span> },
    { header: 'Status', accessor: 'ativo', render: (u: Usuario) => <span className={`text-[9px] font-normal uppercase tracking-widest ${u.ativo !== false ? 'text-emerald-600' : 'text-red-400'}`}>{u.ativo !== false ? 'Ativo' : 'Bloq.'}</span> },
    { header: 'Ações', accessor: 'actions', render: (u: Usuario) => (
      <div className="flex items-center gap-3">
        {/* Ícones com cores vivas por padrão e inversão no hover via CSS */}
        <button onClick={() => { setUsuarioEditandoId(u.id); setEditarModalOpen(true); }} className="action-icon-edit" title="Editar"><Edit3 size={14} /></button>
        <button onClick={() => { setUsuarioEditandoId(u.id); setUsuarioNome(u.nome || u.email); setTrocarSenhaModalOpen(true); }} className="action-icon-edit text-yellow-500" title="Trocar Senha"><Key size={14} /></button>
        <button onClick={() => handleToggleBlock(u)} className={u.ativo !== false ? 'action-icon-warning' : 'action-icon-success'} title={u.ativo !== false ? 'Bloquear' : 'Ativar'}>
          {u.ativo !== false ? <Lock size={14} /> : <CheckCircle size={14} />}
        </button>
      </div>
    )},
  ];

  if (loading) return <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center"><Loader2 className="animate-spin text-[#c8921a]/40" /></div>;

  return (
    <div className="p-6 sm:p-10 bg-[#f4f7f9] dark:bg-[#0a0a0a] min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto space-y-12">
        
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#222] pb-8">
          <div>
            <h1 className="text-xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
              Base de <span className="text-gray-800 dark:text-white font-semibold">Usuários</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">Gestão de Acessos e Permissões</p>
          </div>
          <div className="bg-white dark:bg-[#111] px-4 py-1.5 rounded-lg border border-[#c8921a]/20 shadow-sm">
            <span className="text-xs font-medium text-[#c8921a] tracking-tight">{usuariosFiltrados.length}</span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-black ml-2 tracking-widest">Contas</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-10 mb-12">
          <div className="relative w-full max-w-[300px] group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#c8921a]" size={16} />
            <input 
              type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} 
              placeholder="Buscar por nome ou email..." 
              className="w-full pl-7 pr-4 py-2 bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] focus:border-[#c8921a] focus:ring-0 outline-none text-sm text-black dark:text-white font-normal" 
            />
          </div>
          
          <div className="relative min-w-[180px]">
            <select 
              value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full appearance-none bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-300 dark:border-[#333] pl-2 pr-8 py-2 text-xs text-black dark:text-white font-normal focus:outline-none focus:border-[#c8921a] cursor-pointer uppercase tracking-widest"
            >
              <option value="" className="dark:bg-[#0a0a0a]">Todos os Perfis</option>
              <option value="admin" className="dark:bg-[#0a0a0a]">Administrador</option>
              <option value="user" className="dark:bg-[#0a0a0a]">Usuário</option>
              <option value="personal_trainer" className="dark:bg-[#0a0a0a]">Personal Trainer</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={14} />
          </div>
        </div>

        <div className="data-table-container">
          <DataTable columns={columns} data={usuariosFiltrados} keyExtractor={(u) => u.id} />
        </div>
      </div>

      <EditarUsuarioModal
        open={editarModalOpen}
        onOpenChange={setEditarModalOpen}
        usuarioId={usuarioEditandoId}
        onUsuarioChange={loadUsuarios}
      />
      
      <TrocarSenhaModal
        open={trocarSenhaModalOpen}
        onOpenChange={setTrocarSenhaModalOpen}
        usuarioId={usuarioEditandoId}
        usuarioNome={usuarioNome}
      />
    </div>
  );
}
