const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Normaliza uma URL de mídia (imagem ou vídeo) para garantir que aponte para o servidor correto.
 * Resolve problemas com URLs que ficaram salvas como 'localhost' ou que são caminhos relativos.
 */
export function getMediaUrl(url: string | undefined | null): string {
  if (!url) return '';

  // Se a URL começa com localhost:3001, substituir pelo API_URL atual
  if (url.includes('localhost:3001')) {
    const path = url.split('localhost:3001')[1];
    return `${API_URL}${path}`;
  }

  // Se for uma URL absoluta (começa com http), retornar como está
  if (url.startsWith('http')) {
    return url;
  }

  // Se for um caminho relativo que começa com /, concatenar com API_URL
  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }

  // Se for apenas o nome do arquivo, tentar deduzir o caminho (fallback)
  // Normalmente a API já retorna o caminho completo ou relativo começando com /
  return `${API_URL}/uploads/imagens/${url}`;
}
