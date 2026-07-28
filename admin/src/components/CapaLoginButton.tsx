'use client';

import { useState } from 'react';
import { Image as ImageIcon, Loader2, Monitor, Smartphone } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadImagem } from '@/lib/upload';

export function CapaLoginButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<'admin' | 'mobile'>('admin');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setSuccess(false);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      const uploadUrl = await uploadImagem(file);
      const configKey = target === 'admin' ? 'login_cover_admin_url' : 'login_cover_mobile_url';
      
      await api.saveConfiguracao(configKey, uploadUrl.url);
      
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setFile(null);
        setPreview(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar imagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setSuccess(false);
          setError('');
          setFile(null);
          setPreview(null);
        }}
        style={{ border: '1px solid #c8921a' }}
        className="flex items-center justify-between p-4 bg-white dark:bg-[#111] rounded-xl hover:shadow-sm transition-all group w-full"
      >
        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white uppercase tracking-wider">
          Capa de Login
        </span>
        <div className="text-gray-200 group-hover:text-[#c8921a] transition-all transform group-hover:translate-x-1">
          <ImageIcon size={12} />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#2e7fb9]/60 rounded-md shadow-lg p-6 max-w-sm w-full relative">
            <h3 className="text-white text-lg font-bold mb-4 uppercase tracking-widest text-[11px]">Alterar Capa de Login</h3>
            
            <div className="flex gap-2 mb-4 bg-gray-900 p-1 rounded-lg">
              <button
                onClick={() => {
                   setTarget('admin');
                   setFile(null);
                   setPreview(null);
                   setSuccess(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase rounded-md transition-colors ${target === 'admin' ? 'bg-[#c8921a] text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <Monitor size={12} />
                Painel Admin
              </button>
              <button
                onClick={() => {
                   setTarget('mobile');
                   setFile(null);
                   setPreview(null);
                   setSuccess(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase rounded-md transition-colors ${target === 'mobile' ? 'bg-[#c8921a] text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <Smartphone size={12} />
                App Mobile
              </button>
            </div>

            <div className="mb-4">
              <label className="block w-full cursor-pointer text-center border-2 border-dashed border-gray-700 hover:border-[#c8921a] p-8 rounded-lg transition-colors">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded" />
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon size={24} className="text-gray-500 mb-2" />
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Clique para selecionar imagem para {target === 'admin' ? 'o Admin' : 'o App'}</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}
            {success && <p className="text-green-500 text-xs mb-4 text-center">Atualizado com sucesso!</p>}

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-800 text-white text-[9px] font-bold uppercase rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="px-4 py-2 bg-[#c8921a] text-black text-[9px] font-bold uppercase rounded-md hover:bg-[#d49e25] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
