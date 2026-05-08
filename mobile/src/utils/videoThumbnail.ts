/**
 * Utilitário para gerar URLs de thumbnails de vídeos automaticamente
 * Suporta YouTube e Vimeo
 */

export function getVideoThumbnail(videoUrl: string): string | null {
  if (!videoUrl) return null;

  // YouTube
  // Suporta formatos: https://www.youtube.com/watch?v=VIDEO_ID
  //                  https://youtu.be/VIDEO_ID
  //                  https://www.youtube.com/embed/VIDEO_ID
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = videoUrl.match(youtubeRegex);
  
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    // hqdefault.jpg é garantido de existir em todos os vídeos, 
    // enquanto maxresdefault.jpg depende da resolução original.
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Vimeo
  // Suporta formatos: https://vimeo.com/VIDEO_ID
  //                  https://player.vimeo.com/video/VIDEO_ID
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const vimeoMatch = videoUrl.match(vimeoRegex);
  
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    // Para Vimeo, precisaríamos fazer uma requisição à API deles
    // Por enquanto, retornamos null e o usuário pode fazer upload manual
    // Ou podemos usar: https://vumbnail.com/${videoId}.jpg
    return `https://vumbnail.com/${videoId}.jpg`;
  }

  // Se não for YouTube nem Vimeo, retorna null
  // O usuário precisará fazer upload manual de uma imagem de capa
  return null;
}




