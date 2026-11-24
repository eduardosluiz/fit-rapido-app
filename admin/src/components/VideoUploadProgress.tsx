'use client';

export function VideoUploadProgress({ percent }: { percent: number }) {
  return <div role="status" className="mt-2 space-y-1 text-xs text-muted-foreground">
    <p>{percent >= 100 ? 'Envio recebido. Aguardando a confirmação do armazenamento…' : `Enviando vídeo: ${percent}%`}</p>
    <progress aria-label="Envio do vídeo" max={100} value={percent} className="h-2 w-full accent-[#c8921a]" />
    <p>Mantenha esta página aberta até a confirmação. O vídeo ainda não foi salvo no cadastro.</p>
  </div>;
}
