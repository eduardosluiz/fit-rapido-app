import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const PROD_URL = 'https://backend.daipohlmann.com.br';
const API_URL = PROD_URL;

export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${cleanUrl}`;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  subscription_tier: 'none' | 'basic' | 'free' | 'premium' | 'premium_fit';
}

export interface Receita {
  id: string;
  titulo: string;
  descricao?: string;
  ingredientes: string[];
  modo_preparo: string[];
  imagem_url?: string;
  imagens_url?: string[];
  video_url?: string;
  categorias?: any[];
  is_premium: boolean;
  ativa: boolean;
  substituicoes_ingredientes?: Record<string, any>;
  calorias?: number;
  proteinas?: number;
  carboidratos?: number;
  gorduras?: number;
  fibras?: number;
  sodio?: number;
}

export interface Treino {
  id: string;
  titulo: string;
  descricao?: string;
  exercicios: string[];
  imagem_url?: string;
  video_url?: string;
  is_premium: boolean;
  ativa: boolean;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await AsyncStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) await AsyncStorage.removeItem('auth_token');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ${response.status}`);
      }
      if (response.status === 204) return undefined as T;
      const text = await response.text();
      return text ? JSON.parse(text) : undefined;
    } catch (error: any) {
      console.error('API Error:', error.message);
      throw error;
    }
  }

  async login(email: string, senha: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
  }

  async getProfile() { return this.request<User>('/auth/profile'); }
  
  async getReceitas(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<Receita[]>(`/receitas${query}`);
  }
  
  async getReceita(id: string) { return this.request<Receita>(`/receitas/${id}`); }
  
  async getCategorias() { return this.request<any[]>('/categorias-receitas'); }
  
  async getTreinos(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<Treino[]>(`/treinos${query}`);
  }
  
  async getTreino(id: string) { return this.request<Treino>(`/treinos/${id}`); }
  
  async getModalidadesTreinos() { return this.request<any[]>('/treinos-modalidades'); }
  
  async getCategoriasTreinos() { return this.request<any[]>('/categorias-treinos'); }
  
  async getFavoritos(tipo?: string) {
    return this.request<any[]>(`/favoritos${tipo ? `?tipo=${tipo}` : ''}`);
  }

  async checkIsFavorito(itemId: string, tipo: string) {
    return this.request<boolean>(`/favoritos/check?itemId=${itemId}&tipo=${tipo}`);
  }

  async toggleFavorito(itemId: string, tipo: string) {
    return this.request<any>('/favoritos/toggle', {
      method: 'POST',
      body: JSON.stringify({ itemId, tipo }),
    });
  }

  async getReceitaIngredientes(receitaId: string) {
    return this.request<any[]>(`/receitas/${receitaId}/ingredientes`);
  }

  async getSubstituicoes(ingredienteId: string) {
    return this.request<any[]>(`/ingredientes/${ingredienteId}/substituicoes`);
  }

  async verificarFezHoje(itemId: string, tipo: string) {
    return this.request<{ fezHoje: boolean }>(`/atividades/check?itemId=${itemId}&tipo=${tipo}`);
  }

  async registrarAtividade(itemId: string, tipo: string) {
    return this.request<any>('/atividades', {
      method: 'POST',
      body: JSON.stringify({ itemId, tipo }),
    });
  }

  async obterAvaliacao(itemId: string, tipo: string) {
    return this.request<any>(`/avaliacoes/${tipo}/${itemId}`);
  }

  async avaliar(itemId: string, tipo: string, nota: number, comentario?: string) {
    return this.request<any>(`/avaliacoes/${tipo}/${itemId}`, {
      method: 'POST',
      body: JSON.stringify({ nota, comentario }),
    });
  }
  
  async getNotificationHistory() { return this.request<any[]>('/notifications/history'); }
  
  async getSubscriptionStatus() { return this.request<any>('/subscriptions/status'); }
}

export const api = new ApiService();
