'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { uploadImagem, uploadVideo } from '@/lib/upload';
import { getMediaUrl } from '@/lib/media';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ImageCropper } from './ImageCropper';

interface FileUploadProps {
  type: 'imagem' | 'video';
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  error?: string;
  hideUrlInput?: boolean; 
  compact?: boolean; 
  aspect?: number;
}

export function FileUpload({ type, value, onChange, label, accept, error, hideUrlInput = false, compact = false, aspect = 4 / 3 }: FileUploadProps) {
  const reactId = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'imagem') {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadError(null);
      setUploading(true);
      try {
        const uploadResponse = await uploadVideo(file);
        setPreview(uploadResponse.url);
        onChange(uploadResponse.url);
      } catch (err: any) {
        setUploadError(err.message || 'Erro ao fazer upload');
      } finally {
        setUploading(false);
      }
    }
  };

  const onCropComplete = async (croppedBlob: Blob) => {
    setSelectedImage(null);
    setUploadError(null);
    setUploading(true);

    try {
      const croppedFile = new File([croppedBlob], originalFile?.name || 'image.jpg', { type: 'image/jpeg' });
      const uploadResponse = await uploadImagem(croppedFile);
      setPreview(uploadResponse.url);
      onChange(uploadResponse.url);
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
  const fileInputId = `file-upload-${type}-${reactId}`;

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
                src={getMediaUrl(preview)}
                alt="Preview"
                className="w-12 h-12 rounded border-2 border-border object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded border-2 border-border bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <i className="bx bx-play text-[#c8921a] text-xl"></i>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm z-10 transition-all"
              title="Remover"
            >
              <i className="bx bx-x text-[10px]"></i>
            </button>
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
      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={onCropComplete}
          onCancel={() => setSelectedImage(null)}
          aspect={aspect}
        />
      )}
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
                src={getMediaUrl(preview)}
                alt="Preview"
                className={cn(
                  "rounded-lg border-2 border-border",
                  "w-full max-w-[280px] h-[120px] object-cover"
                )}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg z-10 transition-all"
                title="Remover imagem"
              >
                <i className="bx bx-x text-base"></i>
              </button>
            </>
          ) : (
            <>
              <video
                src={getMediaUrl(preview)}
                controls
                className={cn(
                  "rounded-lg border-2 border-border",
                  "w-full max-w-[280px] h-[120px] object-cover"
                )}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg z-10 transition-all"
                title="Remover vídeo"
              >
                <i className="bx bx-x text-base"></i>
              </button>
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
