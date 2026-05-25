'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { uploadImagem } from '@/lib/upload';
import { getMediaUrl } from '@/lib/media';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ImageCropper } from './ImageCropper';

interface MultipleImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
  aspect?: number;
}

export function MultipleImageUpload({ 
  images, 
  onChange, 
  label = 'Imagens da Receita',
  maxImages = 10,
  aspect = 4 / 3
}: MultipleImageUploadProps) {
  const reactId = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [displayImages, setDisplayImages] = useState<string[]>(images || []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentCropImage, setCurrentCropImage] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar imagens quando a prop mudar
  useEffect(() => {
    if (images && Array.isArray(images) && images.length > 0) {
      setDisplayImages(images.filter(img => img && img.trim()));
    } else {
      setDisplayImages([]);
    }
  }, [images]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (displayImages.length + files.length > maxImages) {
      setUploadError(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    setUploadError(null);
    setPendingFiles(files);
    setCurrentFileIndex(0);
    startCropping(files[0]);
  };

  const startCropping = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentCropImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = async (croppedBlob: Blob) => {
    const currentFile = pendingFiles[currentFileIndex];
    setCurrentCropImage(null);
    setUploading(true);

    try {
      const croppedFile = new File([croppedBlob], currentFile.name, { type: 'image/jpeg' });
      const uploadResponse = await uploadImagem(croppedFile);
      const updatedImages = [...displayImages, uploadResponse.url];
      setDisplayImages(updatedImages);
      onChange(updatedImages);

      // Check if there are more images to crop
      if (currentFileIndex + 1 < pendingFiles.length) {
        const nextIndex = currentFileIndex + 1;
        setCurrentFileIndex(nextIndex);
        startCropping(pendingFiles[nextIndex]);
      } else {
        setPendingFiles([]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelCrop = () => {
    setCurrentCropImage(null);
    setPendingFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newImages = displayImages.filter((_, i) => i !== index);
    setDisplayImages(newImages);
    onChange(newImages);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...displayImages];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setDisplayImages(newImages);
    onChange(newImages);
  };

  const fileInputId = `multiple-image-upload-${reactId}`;

  return (
    <div className="space-y-3">
      {currentCropImage && (
        <ImageCropper
          image={currentCropImage}
          onCropComplete={onCropComplete}
          onCancel={handleCancelCrop}
          aspect={aspect}
        />
      )}
      {label && (
        <Label className="text-sm font-semibold text-foreground">
          {label}
        </Label>
      )}

      {/* Disclaimer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300">
        <div className="flex items-start gap-2">
          <i className="bx bx-info-circle text-base mt-0.5"></i>
          <div>
            <p className="font-semibold mb-1">Dica:</p>
            <p>Você pode adicionar múltiplas imagens para criar um carrossel na página da receita. A primeira imagem será usada como imagem principal.</p>
          </div>
        </div>
      </div>

      {/* Preview das imagens */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg border-2 border-border overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={getMediaUrl(image)}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
                    title="Remover imagem"
                  >
                    <i className="bx bx-x text-sm"></i>
                  </Button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-[#c8921a] text-white text-xs px-2 py-1 rounded font-semibold">
                    Principal
                  </div>
                )}
              </div>
              {index > 0 && (
                <div className="flex gap-1 mt-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(index, index - 1)}
                    className="h-6 px-2 text-xs"
                    title="Mover para cima"
                  >
                    <i className="bx bx-up-arrow-alt"></i>
                  </Button>
                  {index < displayImages.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(index, index + 1)}
                      className="h-6 px-2 text-xs"
                      title="Mover para baixo"
                    >
                      <i className="bx bx-down-arrow-alt"></i>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {displayImages.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            multiple
            className="hidden"
            id={fileInputId}
          />
          <label htmlFor={fileInputId} className="cursor-pointer inline-block">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed transition-all duration-200",
                uploading
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-[#c8921a] dark:hover:border-[#d4a020] hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#c8921a] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enviando...</span>
                </>
              ) : (
                <>
                  <i className="bx bx-cloud-upload text-[#c8921a] dark:text-[#d4a020] text-lg"></i>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {displayImages.length === 0 ? 'Adicionar Imagens' : `Adicionar Mais (${displayImages.length}/${maxImages})`}
                  </span>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <i className="bx bx-error-circle"></i>
          {uploadError}
        </p>
      )}
    </div>
  );
}

