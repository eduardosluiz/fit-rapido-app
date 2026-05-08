export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export async function uploadImagem(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  const response = await fetch(`${API_URL}/upload/imagem`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || 'Erro ao fazer upload da imagem');
  }

  const data = await response.json();
  // Se a URL já for absoluta (começa com http), não concatenar com API_URL
  const finalUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
  
  return {
    ...data,
    url: finalUrl,
  };
}

export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  const response = await fetch(`${API_URL}/upload/video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || 'Erro ao fazer upload do vídeo');
  }

  const data = await response.json();
  // Se a URL já for absoluta (começa com http), não concatenar com API_URL
  const finalUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;

  return {
    ...data,
    url: finalUrl,
  };
}

