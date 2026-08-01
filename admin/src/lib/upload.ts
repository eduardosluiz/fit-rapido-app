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

export async function uploadImagem(file: File, onProgress?: (percent: number) => void): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/upload/imagem`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const finalUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
          resolve({
            ...data,
            url: finalUrl,
          });
        } catch (e) {
          reject(new Error('Erro ao processar resposta do servidor'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Erro ao fazer upload da imagem'));
        } catch {
          reject(new Error('Erro ao fazer upload da imagem'));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Erro de conexão ao enviar a imagem'));
    };

    xhr.send(formData);
  });
}

export async function uploadVideo(file: File, onProgress?: (percent: number) => void): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/upload/video`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const finalUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
          resolve({
            ...data,
            url: finalUrl,
          });
        } catch (e) {
          reject(new Error('Erro ao processar resposta do servidor'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Erro ao fazer upload do vídeo'));
        } catch {
          reject(new Error('Erro ao fazer upload do vídeo'));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Erro de conexão ao enviar o vídeo'));
    };

    xhr.send(formData);
  });
}

