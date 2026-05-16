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
  calorias?: string;
  proteinas?: string;
  carboidratos?: string;
  gorduras?: string;
  fibras?: string;
  sodio?: string;
  finalizacao?: string;
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
      
      if (response.status === 401) {
        if (!endpoint.includes('/auth/login')) {
          await AsyncStorage.removeItem('auth_token');
          // Forçar recarregamento se estiver no navegador para limpar estado de autenticação
          if (Platform.OS === 'web') {
            window.location.href = '/login';
          }
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ${response.status}`);
      }

      if (response.status === 204) return undefined as T;
      const text = await response.text();
      return text ? JSON.parse(text) : undefined;
    } catch (error: any) {
      throw error;
    }
  }

  async login(email: string, senha: string) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    if (data && data.access_token) {
      await AsyncStorage.setItem('auth_token', data.access_token);
    }
    return data;
  }

  async getProfile() { 
    try {
      return await this.request<User>('/auth/profile');
    } catch (e) {
      return null;
    }
  }

  async getReceitas(params?: any) {
    try {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return await this.request<Receita[]>(`/receitas${query}`);
    } catch (e) {
      return [];
    }
  }
  
  async getReceita(id: string) { return this.request<Receita>(`/receitas/${id}`); }
  
  async getCategorias() { 
    try {
      return await this.request<any[]>('/categorias-receitas');
    } catch (e) {
      return [];
    }
  }
  
  async getTreinos(params?: any) {
    try {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return await this.request<Treino[]>(`/treinos${query}`);
    } catch (e) {
      return [];
    }
  }
  
  async getTreino(id: string) { return this.request<Treino>(`/treinos/${id}`); }
  
  async getModalidadesTreinos() { 
    try {
      return await this.request<any[]>('/treinos-modalidades');
    } catch (e) {
      return [];
    }
  }
  
  async getCategoriasTreinos() { 
    try {
      return await this.request<any[]>('/categorias-treinos');
    } catch (e) {
      return [];
    }
  }
  
  async getFavoritos(tipo?: string) {
    try {
      return await this.request<any[]>(`/favoritos${tipo ? `?tipo=${tipo}` : ''}`);
    } catch (e) {
      return [];
    }
  }

  async checkIsFavorito(itemId: string, tipo: string) {
    try {
      return await this.request<boolean>(`/favoritos/check?itemId=${itemId}&tipo=${tipo}`);
    } catch {
      return false;
    }
  }

  async toggleFavorito(itemId: string, tipo: string) {
    return this.request<any>('/favoritos/toggle', {
      method: 'POST',
      body: JSON.stringify({ itemId, tipo }),
    });
  }

  async getReceitaIngredientes(receitaId: string) {
    try {
      return await this.request<any[]>(`/receitas/${receitaId}/ingredients`);
    } catch (e) {
      return [];
    }
  }

  async getSubstituicoes(ingredienteId: string) {
    try {
      return await this.request<any[]>(`/ingredients/${ingredienteId}/substitutions`);
    } catch (e) {
      return [];
    }
  }

  async verificarFezHoje(itemId: string, tipo: string) {
    try {
      return await this.request<{ fezHoje: boolean }>(`/atividades/check?itemId=${itemId}&tipo=${tipo}`);
    } catch {
      return { fezHoje: false };
    }
  }

  async registrarAtividade(itemId: string, tipo: string) {
    return this.request<any>('/atividades', {
      method: 'POST',
      body: JSON.stringify({ itemId, tipo }),
    });
  }

  async obterAvaliacao(itemId: string, tipo: string) {
    try {
      return await this.request<any>(`/avaliacoes/${tipo}/${itemId}`);
    } catch {
      return null;
    }
  }

  async avaliar(itemId: string, tipo: string, nota: number, comentario?: string) {
    return this.request<any>(`/avaliacoes/${tipo}/${itemId}`, {
      method: 'POST',
      body: JSON.stringify({ nota, comentario }),
    });
  }
  
  async getNotificationHistory() {
    try {
      return await this.request<any[]>('/notifications/history');
    } catch {
      return [];
    }
  }
  
  async getSubscriptionStatus() {
    try {
      return await this.request<any>('/subscriptions/status');
    } catch {
      return { tier: 'none' };
    }
  }

  async buscarIngredienteSimilar(nome: string) {
    try {
      return await this.request<any>(`/ingredientes/buscar-similar?nome=${encodeURIComponent(nome)}`);
    } catch {
      return null;
    }
  }
}

export const api = new ApiService();
