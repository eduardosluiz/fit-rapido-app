'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { Loader2, Save, Upload, Info, Image as ImageIcon } from 'lucide-react';
import { ImageCropper } from '@/components/admin/ImageCropper';
import { uploadImagem } from '@/lib/upload';
import '../admin.css';

interface Banner {
  id?: string;
  titulo: string;
  subtitulo: string;
  imagem_url: string;
  acao: string;
  ordem: number;
  ativo: boolean;
}

const DEFAULT_BANNERS: Banner[] = [
  { titulo: 'Fit & Rápido', subtitulo: 'Receitas saudáveis para sua rotina.', imagem_url: '', acao: 'RECEITAS', ordem: 1, ativo: true },
  { titulo: 'Treinos Intensos', subtitulo: 'Resultados rápidos e eficientes.', imagem_url: '', acao: 'TREINOS', ordem: 2, ativo: true },
  { titulo: 'Seus Favoritos', subtitulo: 'Acesse tudo que você salvou.', imagem_url: '', acao: 'FAVORITOS', ordem: 3, ativo: true },
];

export default function BannersPage() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [uploading, setUploading] = useState<number | null>(null);
  
  // Crop state
  const [selectedImage, setSelectedImage] = useState<{ index: number; url: string; file: File } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await api.getBannersAdmin().catch(() => []);
      
      if (data && data.length > 0) {
        // Garantir que sempre existam 3, ou parear por ordem/acao
        const merged = DEFAULT_BANNERS.map((def, idx) => {
          const found = data.find((b: Banner) => b.acao === def.acao);
          return found ? { ...def, ...found } : def;
        });
        setBanners(merged);
      }
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated) {
      loadBanners();
    }
  }, [mounted, isAuthenticated]);

  const handleChange = (index: number, field: keyof Banner, value: any) => {
    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], [field]: value };
    setBanners(newBanners);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({ index, url: reader.result as string, file });
    };
    reader.readAsDataURL(file);
    
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const onCropComplete = async (croppedBlob: Blob) => {
    if (!selectedImage) return;
    const { index, file } = selectedImage;
    setSelectedImage(null); // Fecha o modal de crop

    try {
      setUploading(index);
      const croppedFile = new File([croppedBlob], file.name || 'banner.jpg', { type: 'image/jpeg' });
      const uploadResponse = await uploadImagem(croppedFile);
      
      handleChange(index, 'imagem_url', uploadResponse.url);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Validar
      const invalido = banners.find(b => !b.titulo || !b.imagem_url);
      if (invalido) {
        alert('Preencha título e imagem de todos os banners.');
        setSaving(false);
        return;
      }

      await api.updateBanners(banners);
      alert('Banners salvos com sucesso!');
      await loadBanners();
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8921a]/40" />
      </div>
    );
  }

  const getAcaoNome = (acao: string) => {
    if (acao === 'RECEITAS') return 'Aba de Receitas';
    if (acao === 'TREINOS') return 'Aba de Treinos';
    if (acao === 'FAVORITOS') return 'Aba de Favoritos';
    return acao;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#f4f7f9] dark:bg-[#0a0a0a] min-h-screen font-inter w-full">
      <div className="w-full max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-[#222] pb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-light text-gray-400 dark:text-gray-500 tracking-tight uppercase">
              Banners do <span className="text-gray-900 dark:text-white font-bold">App Mobile</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-[0.2em] mt-1">
              Personalize o carrossel da página inicial
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-[#c8921a] hover:bg-[#b07f15] text-white px-6 py-2.5 rounded-[6px] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Salvando...' : 'Salvar Banners'}
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 flex items-start gap-3">
          <Info className="text-blue-500 mt-0.5 shrink-0" size={18} />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            Configure abaixo os 3 cards que aparecerão no topo da tela <b>FEED</b> do aplicativo. 
            Recomendamos o uso de imagens na horizontal (paisagem) com alta qualidade para garantir a estética premium do app. 
            Cada botão "Explorar Agora" será vinculado automaticamente à ação configurada.
          </p>
        </div>

        {selectedImage && (
          <ImageCropper
            image={selectedImage.url}
            onCropComplete={onCropComplete}
            onCancel={() => setSelectedImage(null)}
            aspect={16 / 9}
          />
        )}

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div key={index} className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#222] overflow-hidden flex flex-col shadow-sm">
              
              {/* Preview da Imagem */}
              <div className="relative h-48 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center border-b border-gray-200 dark:border-[#222]">
                {banner.imagem_url ? (
                  <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center opacity-40">
                    <ImageIcon size={32} />
                    <span className="text-xs mt-2 uppercase tracking-widest font-bold">Sem Imagem</span>
                  </div>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/50 flex items-center gap-2 text-white transition-colors">
                    {uploading === index ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">Trocar Imagem</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(index, e)} disabled={uploading === index} />
                  </label>
                </div>
              </div>

              {/* Formulário */}
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#c8921a] uppercase tracking-widest">Card {index + 1}</span>
                  <div className="bg-gray-100 dark:bg-[#222] px-2 py-1 rounded text-[9px] text-gray-500 uppercase tracking-widest font-bold border border-gray-200 dark:border-gray-800">
                    Botão ➜ {getAcaoNome(banner.acao)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Título do Banner</label>
                  <input
                    type="text"
                    value={banner.titulo}
                    onChange={(e) => handleChange(index, 'titulo', e.target.value)}
                    className="w-full bg-[#f3f4f6] dark:bg-[#1a1a1a] border border-gray-400 dark:border-[#333] rounded-[6px] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#c8921a] transition-colors"
                    placeholder="Ex: Fit & Rápido"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Subtítulo (Opcional)</label>
                  <textarea
                    value={banner.subtitulo}
                    onChange={(e) => handleChange(index, 'subtitulo', e.target.value)}
                    rows={2}
                    className="w-full bg-[#f3f4f6] dark:bg-[#1a1a1a] border border-gray-400 dark:border-[#333] rounded-[6px] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#c8921a] transition-colors resize-none"
                    placeholder="Ex: Receitas saudáveis e treinos rápidos para sua rotina."
                  />
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-[#222]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={banner.ativo}
                      onChange={(e) => handleChange(index, 'ativo', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#c8921a] focus:ring-[#c8921a]"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Ativo no App</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
