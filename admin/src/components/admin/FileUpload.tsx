'use client';

import { useState, useRef, useEffect } from 'react';
import { uploadImagem, uploadVideo } from '@/lib/upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  type: 'imagem' | 'video';
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  error?: string;
  hideUrlInput?: boolean; // Nova prop para ocultar o campo de URL manual
  compact?: boolean; // Modo compacto (apenas botão, sem label e URL input)
}

export function FileUpload({ type, value, onChange, label, accept, error, hideUrlInput = false, compact = false }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      let uploadResponse;
      if (type === 'imagem') {
        uploadResponse = await uploadImagem(file);
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
      setUploadError(err.message || 'Erro ao fazer upload');
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
    ? 'image/jpeg,image/png,image/jpg,image/webp,image/gif' 
    : 'video/mp4,video/webm,video/quicktime';

  const displayError = error || uploadError;
  const fileInputId = `file-upload-${type}-${Math.random().toString(36).substr(2, 9)}`;

  // Modo compacto: apenas botão pequeno
  if (compact) {
    return (
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept || defaultAccept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id={fileInputId}
        />
        {preview ? (
          <div className="relative">
            {type === 'imagem' ? (
              <img
                src={preview}
                alt="Preview"
                className="w-12 h-12 rounded border-2 border-border object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded border-2 border-border bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <i className="bx bx-play text-[#c8921a] text-xl"></i>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full shadow-lg z-10"
              title="Remover"
            >
              <i className="bx bx-x text-xs"></i>
            </Button>
          </div>
        ) : (
          <Label
            htmlFor={fileInputId}
            className={cn(
              "inline-flex items-center justify-center w-12 h-12 rounded border-2 border-dashed cursor-pointer",
              "transition-all duration-200",
              uploading
                ? 'bg-muted border-muted-foreground/30 opacity-50 cursor-not-allowed'
                : 'bg-background border-border hover:border-[#c8921a] hover:bg-accent'
            )}
            title={type === 'imagem' ? 'Adicionar Imagem' : 'Adicionar Vídeo/GIF'}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-[#c8921a] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <i className={cn(
                "text-[#c8921a] text-lg",
                type === 'imagem' ? 'bx bx-image' : 'bx bx-video'
              )}></i>
            )}
          </Label>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && (
        <Label className="text-sm font-semibold text-foreground">
          {label}
        </Label>
      )}
      
      {/* Preview */}
      {preview && (
        <div className="relative inline-block" style={{ maxWidth: '280px', width: '100%' }}>
          {type === 'imagem' ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className={cn(
                  "rounded-lg border-2 border-border",
                  "w-full max-w-[280px] h-[120px] object-cover"
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg z-10"
                title="Remover imagem"
              >
                <i className="bx bx-x text-sm"></i>
              </Button>
            </>
          ) : (
            <>
              <video
                src={preview}
                controls
                className={cn(
                  "rounded-lg border-2 border-border",
                  "w-full max-w-[280px] h-[120px] object-cover"
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg z-10"
                title="Remover vídeo"
              >
                <i className="bx bx-x text-sm"></i>
              </Button>
            </>
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
            id={fileInputId}
          />
          <Label
            htmlFor={fileInputId}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-dashed cursor-pointer",
              "transition-all duration-200",
              uploading
                ? 'bg-muted border-muted-foreground/30 opacity-50 cursor-not-allowed'
                : 'bg-background border-border hover:border-[#c8921a] hover:bg-accent'
            )}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#c8921a] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">Enviando...</span>
              </>
            ) : (
              <>
                <i className="bx bx-cloud-upload text-[#c8921a] text-lg"></i>
                <span className="text-sm font-medium text-foreground">
                  {type === 'imagem' ? 'Enviar Imagem' : 'Enviar Vídeo'}
                </span>
              </>
            )}
          </Label>
        </div>
      )}

      {/* Manual URL Input - Oculto quando hideUrlInput é true */}
      {!hideUrlInput && (
        <div>
          <Input
            type="url"
            value={preview || ''}
            onChange={(e) => {
              setPreview(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={`URL da ${type === 'imagem' ? 'imagem' : 'vídeo'}`}
            className={cn(
              displayError && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ou informe a URL diretamente
          </p>
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <i className="bx bx-error-circle"></i>
          {displayError}
        </p>
      )}
    </div>
  );
}
