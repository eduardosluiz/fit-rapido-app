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
  if (file.size > 2 * 1024 * 1024 * 1024) throw new Error('O vídeo excede o limite de 2 GB. Reduza o tamanho antes de enviar.');
  if (file.size === 0) throw new Error('O arquivo de vídeo está vazio. Selecione novamente.');
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/upload/video`);
    xhr.timeout = 40 * 60 * 1000;
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.min(99, Math.floor((event.loaded / event.total) * 100));
          onProgress(percentComplete);
        }
      };
    }

    xhr.upload.onload = () => onProgress?.(100);
    xhr.ontimeout = () => reject(new Error('O envio excedeu o tempo de espera. Confira se o vídeo apareceu na biblioteca antes de tentar novamente.'));
    xhr.onabort = () => reject(new Error('O envio do vídeo foi interrompido. Selecione o arquivo para tentar novamente.'));
    xhr.onload = () => {
      if (xhr.status === 413) { reject(new Error('O servidor recusou o tamanho do vídeo. Reduza o arquivo ou informe o tamanho ao suporte.')); return; }
      if ([502, 504].includes(xhr.status)) { reject(new Error('O servidor interrompeu o envio ou a confirmação do armazenamento. Confira a biblioteca antes de tentar novamente e informe este erro ao suporte.')); return; }
      if (xhr.status === 401) { reject(new Error('Sua sessão expirou. Entre novamente no painel antes de reenviar o vídeo.')); return; }
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

