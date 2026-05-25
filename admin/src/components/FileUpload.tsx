'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { uploadImagem, uploadVideo } from '@/lib/upload';

interface FileUploadProps {
  type: 'imagem' | 'video';
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export function FileUpload({ type, value, onChange, label, accept }: FileUploadProps) {
  const reactId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar preview quando value mudar externamente
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      let uploadResponse;
      if (type === 'imagem') {
        uploadResponse = await uploadImagem(file);
        // Criar preview da imagem
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        uploadResponse = await uploadVideo(file);
        setPreview(uploadResponse.url);
      }

      onChange(uploadResponse.url);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const defaultAccept = type === 'imagem' 
    ? 'image/jpeg,image/png,image/jpg,image/webp' 
    : 'video/mp4,video/webm,video/quicktime';

  return (
    <div>
      {label && (
        <label className="block text-text font-semibold mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-4">
        {/* Preview */}
        {preview && (
          <div className="relative">
            {type === 'imagem' ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 rounded-lg border border-card-border"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remover imagem"
                >
                  <i className="bx bx-x text-xl"></i>
                </button>
              </div>
            ) : (
              <div className="relative">
                <video
                  src={preview}
                  controls
                  className="max-w-full max-h-64 rounded-lg border border-card-border"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remover vídeo"
                >
                  <i className="bx bx-x text-xl"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        {!preview && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept || defaultAccept}
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id={`file-upload-${type}-${reactId}`}
            />
            <label
              htmlFor={`file-upload-${type}-${reactId}`}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer
                transition-colors
                ${uploading 
                  ? 'bg-background border-card-border opacity-50 cursor-not-allowed' 
                  : 'bg-background border-card-border hover:border-primary hover:bg-card-bg'
                }
              `}
            >
              {uploading ? (
                <>
                  <i className="bx bx-loader-alt animate-spin text-primary"></i>
                  <span className="text-text">Enviando...</span>
                </>
              ) : (
                <>
                  <i className="bx bx-cloud-upload text-primary text-xl"></i>
                  <span className="text-text">
                    {type === 'imagem' ? 'Enviar Imagem' : 'Enviar Vídeo'}
                  </span>
                </>
              )}
            </label>
          </div>
        )}

        {/* Manual URL Input (fallback) */}
        <div>
          <label className="block text-text-light text-sm mb-1">
            Ou informe a URL diretamente:
          </label>
          <input
            type="url"
            value={preview || ''}
            onChange={(e) => {
              setPreview(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={`URL da ${type === 'imagem' ? 'imagem' : 'vídeo'}`}
            className="w-full bg-background border border-card-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary text-sm"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            <i className="bx bx-error-circle mr-1"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

