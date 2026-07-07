'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import { Button } from '@/components/ui/button';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspect?: number;
}

export function ImageCropper({ image, onCropComplete, onCancel, aspect = 4 / 3 }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 p-4 pb-12 sm:pb-4">
      <div className="relative w-full max-w-4xl h-[55vh] md:h-[70vh] bg-[#111] rounded-xl overflow-hidden border border-[#333]">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={onZoomChange}
        />
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-6 w-full max-w-xl">
        <div className="w-full space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span>Zoom</span>
            <span>{(zoom * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto px-8 py-3 rounded-md border-0 bg-red-900/50 text-red-200 text-[11px] font-bold uppercase tracking-widest hover:bg-red-800/60 transition-all"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            className="w-full sm:w-auto px-12 py-3 rounded-md bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
          >
            Confirmar Recorte
          </Button>
        </div>
      </div>
    </div>
  );
}
