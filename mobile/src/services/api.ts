import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const PROD_URL = 'https://backend.daipohlmann.com.br';
export const API_URL = PROD_URL;

export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${cleanUrl}`;
}

export interface Favorito {
  id: string;
  item_id: string;
  tipo: 'receita' | 'treino';
  created_at: string;
  popularidade?: number;
  receita?: Receita;
  treino?: Treino;
}

export interface Banner {
  id: string;
  titulo: string;
  subtitulo: string;
  imagem_url: string;
  acao: string;
  ordem: number;
  ativo: boolean;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  subscription_tier: 'none' | 'basic' | 'free' | 'premium' | 'premium_fit';
  subscription_expires_at?: string;
  trial_expires_at?: string;
  created_at?: string;
  dieta_atual?: string;
  avatar_url?: string;
}

export interface Receita {
  locked?: boolean;
  id: string;
  titulo: string;
  descricao?: string;
  ingredientes: string[];
  modo_preparo: string[];
  imagem_url?: string;
  imagens_url?: string[];
  video_url?: string;
  video_thumbnail_url?: string;
  ebook_url?: string;
  categorias?: any[];
  dificuldade: 'facil' | 'medio' | 'dificil' | 'iniciante' | 'intermediario' | 'avancado';
  tempo_preparo: number;
  porcoes: number;
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
  informacoes_nutricionais?: string;
  aviso_nutricional?: string;
  dica?: string;
  avaliacao?: number;
  total_avaliacoes?: number;
  is_inedito?: boolean;
  is_free?: boolean;
  destaque_popular?: boolean;
  destaque_favorito?: boolean;
  substituto_id_1?: string;
  substituto_id_2?: string;
  tags?: string[];
}

export interface Treino {
  is_free?: boolean;
  locked?: boolean;
  id: string;
  titulo: string;
  descricao?: string;
  exercicios: string[];
  imagem_url?: string;
  video_url?: string;
  nivel: 'facil' | 'medio' | 'dificil' | 'iniciante' | 'intermediario' | 'avancado';
  duracao_minutos: number;
  is_premium: boolean;
  ativa: boolean;
  exercicios_detalhados?: any[];
  avaliacao?: number;
  total_avaliacoes?: number;
  substituto_id_1?: string;
  substituto_id_2?: string;
  imagens_url?: string[];
  imagem_capa_url?: string;
  modalidade_id?: string;
  modalidade?: {
    id?: string;
    nome?: string;
    titulo?: string;
    descricao?: string;
    has_nivelamento?: boolean;
  };
  substituto_1_info?: any;
  substituto_2_info?: any;
  video_explicativo_url?: string;
  series?: string | number;
  repeticoes?: string | number;
  descanso?: string | number;
  peso?: string | number;
  descricao_tecnica?: string;
  dia_semana?: string | number;
  ordem?: number;
  dias_por_semana?: number;
  series_repeticoes?: any[];
  grupos_musculares?: any[];
  observacoes?: string;
  categorias?: any[];
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const netInfo = await NetInfo.fetch();
    const token = await AsyncStorage.getItem('auth_token');
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        if (!endpoint.includes('/auth/login')) {
          await AsyncStorage.removeItem('auth_token');
          if (Platform.OS === 'web') {
            window.location.href = '/login';
          }
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        let message = 'Não foi possível concluir a solicitação. Tente novamente.';
        try {
          const body = JSON.parse(errorText);
          if (response.status < 500) {
            if (typeof body.message === 'string') message = body.message;
            else if (Array.isArray(body.message)) message = body.message.filter((item: unknown) => typeof item === 'string').join(' ');
          }
        } catch { /* Não apresentar respostas técnicas ou HTML ao usuário. */ }
        throw Object.assign(new Error(message), { status: response.status });
      }

      if (response.status === 204) return undefined as T;
      const text = await response.text();
      return (text ? JSON.parse(text) : undefined) as T;
    } catch (error: any) {
      throw error;
    }
  }

  async login(email: string, senha: string) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    if (data.access_token) {
      await AsyncStorage.setItem('auth_token', data.access_token);
    }
    return data;
  }

  async socialLogin(provider: string, token: string, email?: string, name?: string) {
    const data = await this.request<any>('/auth/social', {
      method: 'POST',
      body: JSON.stringify({ provider, token, email, name }),
    });
    if (data && data.access_token) {
      await AsyncStorage.setItem('auth_token', data.access_token);
    }
    return data;
  }

  async register(email: string, nome: string, senha: string) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, nome, senha }),
    });
  }

  async logout() {
    await AsyncStorage.removeItem('auth_token');
  }

  async getProfile() { 
    try {
      return await this.request<User>('/auth/profile');
    } catch (e) {
      return null;
    }
  }

  async updateProfile(updates: Pick<Partial<User>, 'nome' | 'avatar_url' | 'dieta_atual'>) {
    return this.request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async uploadImage(uri: string): Promise<{ url: string; filename: string }> {
    const token = await AsyncStorage.getItem('auth_token');
    const formData = new FormData();
    const filename = uri.split('/').pop() || `avatar-${Date.now()}.jpg`;
    const extension = filename.split('.').pop()?.toLowerCase();
    const type = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';

    formData.append('file', { uri, name: filename, type } as any);
    const response = await fetch(`${API_URL}/upload/imagem`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!response.ok) throw new Error(await response.text() || `Erro ${response.status}`);
    return response.json();
  }

  async getReceitas(params?: any) {
    params = { ...params };
    for (const key of ['nome', 'ingrediente', 'search']) {
      if (typeof params[key] === 'string') {
        params[key] = params[key].trim();
        if (!params[key]) delete params[key];
      }
    }
    // Compatibilidade com a API publicada, que ainda compara proteína como texto.
    // Buscar todas as páginas antes de filtrar evita perder resultados válidos.
    if (Number(params?.proteinasMin) > 0 || params.lowCarb || params.semLactose || params.semGluten) {
      const { proteinasMin, lowCarb, semLactose, semGluten, page = 1, limit = 15, ...otherFilters } = params;
      const items: Receita[] = [];
      let currentPage = 1;
      let totalPages = 1;
      do {
        const query = new URLSearchParams({ ...otherFilters, page: String(currentPage), limit: '100' });
        const result = await this.request<any>(`/receitas?${query}`);
        items.push(...(Array.isArray(result) ? result : result.data || []));
        totalPages = Array.isArray(result) ? 1 : Number(result.totalPages) || 1;
        currentPage++;
      } while (currentPage <= totalPages);
      // A listagem antiga não inclui os macros; consultar os detalhes quando necessário.
      const detailed: Receita[] = [];
      for (let start = 0; start < items.length; start += 6) {
        detailed.push(...await Promise.all(items.slice(start, start + 6).map(item =>
          (Number(proteinasMin) > 0 && item.proteinas === undefined) || (lowCarb && item.carboidratos === undefined)
            ? (item.locked ? Promise.resolve(item) : this.getReceita(item.id)) : Promise.resolve(item))));
      }
      const filtered = detailed.filter(item => {
        const labels = [item.titulo, ...(item.categorias || []).map((category: any) => category.nome)].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (semLactose && !labels.includes('sem lactose')) return false;
        if (semGluten && !labels.includes('sem gluten')) return false;
        const match = String(item.proteinas ?? '').trim().replace(',', '.').match(/^[0-9]+[.]?[0-9]*/);
        if (Number(proteinasMin) > 0 && (match === null || Number(match[0]) < Number(proteinasMin))) return false;
        if (lowCarb) {
          const carbs = String(item.carboidratos ?? '').trim().replace(',', '.').match(/^[0-9]+(?:[.][0-9]+)?(?:\s*[-–]\s*([0-9]+(?:[.][0-9]+)?))?/);
          const maximum = carbs ? Number(carbs[1] || carbs[0]) : NaN;
          if (!(maximum <= 10)) return false;
        }
        return true;
      });
      const offset = (Number(page) - 1) * Number(limit);
      return { data: filtered.slice(offset, offset + Number(limit)), total: filtered.length, totalPages: Math.ceil(filtered.length / Number(limit)), page: Number(page) };
    }
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any>(`/receitas${query}`);
  }
  
  async getReceita(id: string) { return this.request<Receita>(`/receitas/${id}`); }
  
  async getCategorias() { 
    try {
      return await this.request<any[]>('/categorias-receitas');
    } catch (e) {
      return [];
    }
  }

  async getGlossario() {
    try {
      return await this.request<any[]>('/glossario');
    } catch (e) {
      return [];
    }
  }
  
  async getTreinos(params?: any) {
    try {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return await this.request<any>(`/treinos${query}`);
    } catch (e) {
      return params?.page ? { data: [], totalPages: 0 } : [];
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

  async getModalidadeTreino(id: string) {
    return this.request<any>(`/treinos-modalidades/${id}`);
  }
  
  async getCategoriasTreinos() { 
    try {
      return await this.request<any[]>('/categorias-treinos');
    } catch (e) {
      return [];
    }
  }

  async getExerciciosBiblioteca(params?: any) {
    try {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return await this.request<any>(`/exercicios-biblioteca${query}`);
    } catch (e) {
      return { data: [] };
    }
  }

  async getExercicioBiblioteca(id: string) {
    return this.request<any>(`/exercicios-biblioteca/${id}`);
  }
  
  async getFavoritos(tipo?: string) {
    try {
      return await this.request<any[]>(`/favoritos${tipo ? `?tipo=${tipo}` : ''}`);
    } catch (e) {
      return [];
    }
  }

  async checkIsFavorito(tipo: string, itemId: string) {
    try {
      return await this.request<any>(`/favoritos/check/${tipo}/${itemId}`);
    } catch {
      return { is_favorito: false };
    }
  }

  async toggleFavorito(itemId: string, tipo: string) {
    const status = await this.checkIsFavorito(tipo, itemId);
    if (status.is_favorito) {
      await this.removeFavorito(tipo, itemId);
      return { is_favorito: false };
    }

    await this.addFavorito(tipo, itemId);
    return { is_favorito: true };
  }

  async addFavorito(tipo: string, itemId: string) {
    return this.request<any>('/favoritos', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, tipo }),
    });
  }

  async removeFavorito(tipo: string, itemId: string) {
    return this.request<void>(`/favoritos/${tipo}/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Banners
  async getBanners() {
    try {
      return await this.request<Banner[]>('/banners');
    } catch (e) {
      return [];
    }
  }

  async getReceitaIngredientes(receitaId: string) {
    try {
      return await this.request<any[]>(`/receita-ingredientes/receita/${receitaId}`);
    } catch (e) {
      return [];
    }
  }

  async getSubstituicoes(receitaId: string) {
    try {
      return await this.request<any[]>(`/substituicoes/receita/${receitaId}`);
    } catch (e) {
      return [];
    }
  }

  async verificarFezHoje(itemId: string, tipo: string, throwOnError = false) {
    try {
      const result = await this.request<{ fez_hoje: boolean }>(`/atividades/check/${tipo}/${itemId}`);
      return result.fez_hoje;
    } catch (error) {
      if (throwOnError) throw error;
      return false;
    }
  }

  async registrarAtividade(itemId: string, tipo: string) {
    return this.request<any>('/atividades', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, tipo }),
    });
  }

  async criarAtividade(itemId: string, tipo: string) {
    return this.registrarAtividade(itemId, tipo);
  }

  async removerAtividade(itemId: string, tipo: string) {
    return this.request<any>(`/atividades/${tipo}/${itemId}`, { method: 'DELETE' });
  }

  async getAtividades(tipo?: 'fiz_receita' | 'treinei_hoje') {
    const query = tipo ? `?tipo=${tipo}` : '';
    return this.request<any[]>(`/atividades${query}`);
  }

  async obterAvaliacao(itemId: string, tipo: string) {
    try {
      return await this.request<any>(`/avaliacoes/${tipo}/${itemId}`);
    } catch {
      return null;
    }
  }

  async avaliar(itemId: string, tipo: string, nota: number, comentario?: string) {
    return this.request<any>('/avaliacoes', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, tipo, nota, comentario }),
    });
  }

  async criarAvaliacao(itemId: string, tipo: string, nota: number, comentario?: string) {
    return this.avaliar(itemId, tipo, nota, comentario);
  }

  async removerAvaliacao(itemId: string, tipo: string) {
    return this.request<any>(`/avaliacoes/${tipo}/${itemId}`, {
      method: 'DELETE',
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
    return this.request<any>('/subscriptions/status');
  }

  async getSubscriptionPlans() {
    return this.request<any>('/subscriptions/plans');
  }

  async buscarIngredienteSimilar(nome: string) {
    try {
      return await this.request<any>(`/ingredientes/buscar-similar?nome=${encodeURIComponent(nome)}`);
    } catch {
      return null;
    }
  }

  async searchIngredientesAdvanced(query: string, limit = 20) {
    return this.request<any[]>(`/ingredientes/search/advanced?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async sugerirSubstitutos(ingredienteId: string, limit = 10) {
    return this.request<any[]>(`/ingredientes/sugerir-substitutos/${ingredienteId}?limit=${limit}`);
  }

  async validarCompatibilidade(originalId: string, substitutoId: string) {
    return this.request<any>(`/ingredientes/validar-compatibilidade/${originalId}/${substitutoId}`);
  }

  async getHistoricoSubstituicoes(limit = 20) {
    return this.request<any[]>(`/substituicoes/historico?limit=${limit}`);
  }

  async getSubstituicoesFrequentes(limit = 5) {
    return this.request<any[]>(`/substituicoes/frequentes?limit=${limit}`);
  }

  async createSubstituicao(data: any) {
    return this.request<any>('/substituicoes', { method: 'POST', body: JSON.stringify(data) });
  }

  async removeSubstituicao(id: string) {
    return this.request<void>(`/substituicoes/${id}`, { method: 'DELETE' });
  }

  async consultarIA(receitaId: string, pergunta: string) {
    return this.request<any>('/ingredientes/ia/consulta', {
      method: 'POST',
      body: JSON.stringify({ receita_id: receitaId, pergunta }),
    });
  }

  async calcularMacrosDiarios(data: any) {
    return this.request<any>('/receitas/macros/calcular-diarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount() {
    return this.request<void>('/auth/profile', { method: 'DELETE' });
  }

  async calcularMacrosComSubstituicao(receitaId: string) {
    try {
      return await this.request<any>(`/receitas/${receitaId}/macros/substituicao`);
    } catch {
      return null;
    }
  }

  async createConsentimento(tipo: string, aceito: boolean) {
    return this.request<any>('/legal/consent', {
      method: 'POST',
      body: JSON.stringify({ tipo, aceito }),
    });
  }

  async registerNotificationToken(token: string, plataforma: string) {
    return this.request<any>('/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify({ token, plataforma }),
    });
  }

  async removeNotificationToken(token: string) {
    return this.request<any>(`/notifications/remove-token/${token}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
