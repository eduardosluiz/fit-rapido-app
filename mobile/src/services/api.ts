import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';

// URL da API - pode ser configurada via variável de ambiente
// Para desenvolvimento: http://localhost:3001
// Para dispositivo físico/emulador Android: http://10.0.2.2:3001
// Para dispositivo físico iOS: http://localhost:3001 (se estiver na mesma rede)
// Para produção: use a URL do seu servidor

// Detectar automaticamente o ambiente
const getApiUrl = () => {
  // PRIMEIRO: Verificar se está no navegador - SEMPRE usar localhost no navegador
  // Isso deve ter prioridade sobre qualquer configuração do .env
  if (typeof window !== 'undefined' && window.location) {
    const url = 'http://localhost:3001';
    console.log('🔗 Navegador detectado (window.location) - forçando localhost:', url);
    return url;
  }
  
  // Detectar plataforma
  const platform = Platform.OS;
  
  // Se estiver rodando no navegador (web), SEMPRE usar localhost
  if (platform === 'web') {
    const url = 'http://localhost:3001';
    console.log('🔗 Web/Navegador detectado (Platform.OS) - usando:', url);
    return url;
  }
  
  // Tentar múltiplas fontes para a URL da API (apenas se NÃO estiver no navegador)
  let apiUrl = 
    process.env.EXPO_PUBLIC_API_URL || 
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
    Constants.manifest?.extra?.EXPO_PUBLIC_API_URL;
  
  // Validar e limpar a URL (remover qualquer sufixo incorreto como "image.png")
  if (apiUrl) {
    // Remover qualquer coisa após a porta que não seja parte da URL válida
    apiUrl = apiUrl.replace(/image\.png.*$/i, '').trim();
    
    // Garantir que começa com http:// ou https://
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `http://${apiUrl}`;
    }
    
    // Garantir que não termina com barra
    apiUrl = apiUrl.replace(/\/$/, '');
    
    console.log('🔗 Usando API URL do .env/config:', apiUrl);
    return apiUrl;
  }
  
  // Para Android Emulator, usar 10.0.2.2
  if (platform === 'android') {
    const url = 'http://10.0.2.2:3001';
    console.log('🔗 Android detectado - usando:', url);
    return url;
  }
  
  // Para iOS Simulator, usar localhost
  if (platform === 'ios') {
    const url = 'http://localhost:3001';
    console.log('🔗 iOS detectado - usando:', url);
    return url;
  }
  
  // Fallback: tentar detectar se está no navegador
  if (typeof window !== 'undefined') {
    const url = 'http://localhost:3001';
    console.log('🔗 Navegador detectado (fallback) - usando:', url);
    return url;
  }
  
  // Fallback padrão
  const url = 'http://localhost:3001';
  console.log('🔗 Usando padrão (localhost):', url);
  return url;
};

const API_URL = getApiUrl();

// Log da URL sendo usada (apenas em desenvolvimento)
if (__DEV__) {
  console.log('═══════════════════════════════════════');
  console.log('🔗 API URL configurada:', API_URL);
  console.log('💡 Para dispositivo físico, configure EXPO_PUBLIC_API_URL no .env');
  console.log('   Exemplo: EXPO_PUBLIC_API_URL=http://192.168.0.14:3001');
  console.log('═══════════════════════════════════════');
}

/**
 * Constrói URL completa para imagens
 * Se a URL já for completa (começa com http), retorna como está
 * Se for relativa (começa com /), adiciona a API_URL
 */
export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Remove barra inicial se existir para evitar duplicação
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${cleanUrl}`;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  subscription_tier: 'none' | 'basic' | 'free' | 'premium' | 'premium_fit';
  subscription_expires_at?: string;
  trial_expires_at?: string;
  dieta_atual?: string;
  alergias?: string[];
}

export interface Receita {
  id: string;
  titulo: string;
  descricao?: string;
  ingredientes: string[];
  modo_preparo: string[];
  imagem_url?: string;
  imagens_url?: string[]; // Array de imagens para carrossel
  video_url?: string;
  video_thumbnail_url?: string;
  ebook_url?: string;
  categoria_id?: string; // Deprecated - usar categorias
  categoria?: { // Deprecated - usar categorias
    id: string;
    nome: string;
  };
  categorias?: Array<{
    id: string;
    nome: string;
    slug?: string;
  }>;
  dificuldade: 'facil' | 'medio' | 'dificil';
  tempo_preparo: number;
  porcoes: number;
  calorias?: number;
  proteinas?: number;
  carboidratos?: number;
  gorduras?: number;
  fibras?: number;
  sodio?: number;
  is_premium: boolean;
  is_free?: boolean;
  tags: string[];
  tipo_refeicao?: 'breakfast' | 'lunch' | 'dinner' | 'drinks' | 'snacks' | 'sides';
  cuisines?: string[];
  substituicoes_ingredientes?: Record<string, string | string[]>; // Mapeia ingrediente -> substituição(ões) sugerida(s)
  informacoes_nutricionais?: string; // Informações nutricionais em texto
  aviso_nutricional?: string; // Aviso personalizado sobre informações nutricionais
  dica?: string; // Dica de ouro da receita
  avaliacao?: number; // Média de avaliações (1-5)
  total_avaliacoes?: number; // Total de avaliações recebidas
  ativa: boolean;
}

export interface SerieRepeticao {
  exercicio: string;
  series: number;
  repeticoes: string;
  carga?: string;
  intervalo?: string;
}

export interface Treino {
  id: string;
  titulo: string;
  descricao?: string;
  exercicios: string[];
  series_repeticoes?: SerieRepeticao[];
  observacoes?: string;
  imagem_url?: string;
  imagens_url?: string[]; // Array de imagens para carrossel
  video_url?: string;
  video_thumbnail_url?: string;
  ebook_url?: string;
  categoria?: {
    id: string;
    nome: string;
  };
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao_minutos: number;
  dias_por_semana: number;
  dia_semana?: number;
  grupos_musculares: string[];
  is_premium: boolean;
  equipamentos: string[];
  tags: string[];
  tipo_treino?: string;
  tipo_dica?: string;
  tipo_equipamento_casa?: string;
  substituicoes_exercicios?: Record<string, string | string[]>;
  mostrar_ponto_partida?: boolean;
  imagem_capa_url?: string;
  substituto_id_1?: string;
  substituto_1_info?: {
    series?: string;
    repeticoes?: string;
    descanso?: string;
    peso?: string;
    imagem_capa_url?: string;
  };
  substituto_id_2?: string;
  substituto_2_info?: {
    series?: string;
    repeticoes?: string;
    descanso?: string;
    peso?: string;
    imagem_capa_url?: string;
  };
  descricao_tecnica?: string;
  series?: string;
  repeticoes?: string;
  descanso?: string;
  peso?: string;
  exercicios_detalhados?: Array<{
    nome: string;
    video_url: string;
    series: number;
    repeticoes: string;
    intervalo: string;
    carga: string;
  }>;
  avaliacao?: number; // Média de avaliações (1-5)
  total_avaliacoes?: number; // Total de avaliações recebidas
  ativa: boolean;
}

export interface ExercicioBiblioteca {
  id: string;
  nome: string;
  descricao?: string;
  video_url: string;
  video_thumbnail_url?: string;
  imagem_url?: string;
  categoria?: string;
  grupo_muscular?: string;
  equipamento?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    // Verificar conexão antes de tentar a requisição
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('Você está sem internet. Verifique sua conexão e tente novamente.');
    }

    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Garantir que o endpoint começa com /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Garantir que a API_URL não termina com /
    const cleanApiUrl = API_URL.replace(/\/$/, '');
    
    // Remover qualquer sufixo incorreto que possa ter sido adicionado (como .net, image.png, etc)
    // Mas manter query strings e parâmetros válidos
    let sanitizedEndpoint = cleanEndpoint;
    // Remover apenas sufixos conhecidos como incorretos
    sanitizedEndpoint = sanitizedEndpoint.replace(/\.(net|png|jpg|jpeg|gif|svg)(\/.*)?$/i, '');
    
    const url = `${cleanApiUrl}${sanitizedEndpoint}`;
    
    // Log em desenvolvimento
    if (__DEV__) {
      console.log(`🌐 Requisição: ${options.method || 'GET'} ${url}`);
      console.log(`   API_URL: ${cleanApiUrl}`);
      console.log(`   Endpoint: ${sanitizedEndpoint}`);
    }
    
    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (fetchError: any) {
      // Erro de rede (conexão não estabelecida)
      console.error('❌ Erro de rede:', fetchError.message);
      
      const isConnectionError = 
        fetchError.message.includes('Failed to fetch') || 
        fetchError.message.includes('Network request failed');

      if (isConnectionError) {
        if (!netInfo.isConnected) {
          throw new Error('Você está offline. Verifique sua conexão.');
        }
        
        throw new Error('Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente mais tarde.');
      }
      throw fetchError;
    }
    
    // Log da resposta em desenvolvimento
    if (__DEV__) {
      console.log(`📥 Resposta: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    }

    // Se for 204 No Content, retornar undefined (sem tentar fazer JSON)
    if (response.status === 204) {
      return undefined as T;
    }

    // Verificar se há conteúdo antes de tentar fazer JSON
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    if (!response.ok) {
      // Se for 401, limpar token
      if (response.status === 401) {
        try {
          await AsyncStorage.removeItem('auth_token');
        } catch (e) {
          // Ignorar erro ao limpar token
        }
      }
      
      let errorMessage = 'Erro desconhecido';
      try {
        if (text && contentType && contentType.includes('application/json')) {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || `Erro ${response.status}`;
        } else {
          errorMessage = `Erro ${response.status}: ${response.statusText || 'Erro desconhecido'}`;
        }
        
        // Mensagens mais amigáveis para erros comuns
        if (response.status === 401) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (response.status === 404) {
          errorMessage = 'Serviço não encontrado. Verifique se a API está rodando.';
        } else if (response.status >= 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        }
      } catch (e) {
        // Se não conseguir fazer parse do JSON, usar mensagem padrão
        if (response.status === 401) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else {
          errorMessage = `Erro ${response.status}: ${response.statusText || 'Erro desconhecido'}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Se não houver conteúdo, retornar undefined
    if (!text || text.trim() === '') {
      return undefined as T;
    }

    // Tentar fazer parse do JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('Erro ao fazer parse do JSON:', parseError);
        throw new Error('Resposta inválida do servidor: não é um JSON válido');
      }
    }

    // Se não for JSON, retornar undefined
    return undefined as T;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  // Auth
  async login(email: string, senha: string): Promise<{ user: User; access_token: string; accessToken?: string }> {
    try {
      console.log('🔐 Iniciando login...');
      console.log('   API URL:', API_URL);
      console.log('   Endpoint: /auth/login');
      
      const data = await this.request<{ user: User; access_token?: string; accessToken?: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, senha }),
        },
      );
      
      console.log('📦 Dados recebidos:', data ? 'Presente' : 'Ausente');
      
      // Verificar se data existe
      if (!data) {
        console.error('❌ Resposta vazia do servidor');
        throw new Error(`Resposta vazia do servidor. Verifique se a API está rodando em ${API_URL}`);
      }
      
      // Suportar tanto access_token quanto accessToken (snake_case e camelCase)
      const token = data.access_token || data.accessToken;
      if (!token) {
        console.error('❌ Token não encontrado na resposta:', JSON.stringify(data, null, 2));
        throw new Error('Token de acesso não recebido do servidor');
      }
      
      // Verificar se user existe
      if (!data.user) {
        console.error('❌ User não encontrado na resposta:', JSON.stringify(data, null, 2));
        throw new Error('Dados do usuário não recebidos do servidor');
      }
      
      await AsyncStorage.setItem('auth_token', token);
      console.log('✅ Token salvo no AsyncStorage após login');
      
      return { ...data, access_token: token };
    } catch (error: any) {
      console.error('❌ Erro no login:', error.message);
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        throw new Error(`Não foi possível conectar à API em ${API_URL}.\n\nVerifique:\n- Se a API está rodando (npm run start:dev na pasta api)\n- Se está usando emulador Android, a URL deve ser http://10.0.2.2:3001`);
      }
      throw error;
    }
  }

  async register(email: string, nome: string, senha: string): Promise<{ user: User; access_token: string }> {
    const data = await this.request<{ user: User; access_token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, nome, senha }),
      },
    );
    
    await AsyncStorage.setItem('auth_token', data.access_token);
    
    return data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  // Receitas
  async getReceitas(params?: {
    categoria?: string;
    search?: string;
    premium?: boolean;
    dificuldade?: string;
    tipoRefeicao?: string;
    cuisine?: string;
    tempoMaximo?: number;
    proteinasMin?: number; // Filtro por quantidade mínima de proteína
    semLactose?: boolean; // Filtro sem lactose
    lowCarb?: boolean; // Filtro low carb
  }): Promise<Receita[]> {
    const queryParams = new URLSearchParams();
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.premium !== undefined) queryParams.append('premium', String(params.premium));
    if (params?.dificuldade) queryParams.append('dificuldade', params.dificuldade);
    if (params?.tipoRefeicao) queryParams.append('tipoRefeicao', params.tipoRefeicao);
    if (params?.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params?.tempoMaximo) queryParams.append('tempoMaximo', String(params.tempoMaximo));
    if (params?.proteinasMin) queryParams.append('proteinasMin', String(params.proteinasMin));
    if (params?.semLactose !== undefined) queryParams.append('semLactose', String(params.semLactose));
    if (params?.lowCarb !== undefined) queryParams.append('lowCarb', String(params.lowCarb));

    const query = queryParams.toString();
    return this.request<Receita[]>(`/receitas${query ? `?${query}` : ''}`);
  }

  async getReceita(id: string): Promise<Receita> {
    // Validar ID antes de fazer requisição
    if (!id || id.trim() === '' || id === '__' || id.length < 10) {
      const invalidError = new Error(`ID de receita inválido: ${id}`);
      (invalidError as any).status = 400;
      throw invalidError;
    }
    
    try {
      return await this.request<Receita>(`/receitas/${id}`);
    } catch (error: any) {
      // Re-throw com mensagem mais específica para 404
      if (error?.message?.includes('404') || error?.message?.includes('não encontrado') || error?.status === 404) {
        const notFoundError = new Error(`Receita ${id} não encontrada (pode ter sido deletada)`);
        (notFoundError as any).status = 404;
        throw notFoundError;
      }
      throw error;
    }
  }

  // Categorias de Receitas
  async getCategorias(): Promise<Array<{ id: string; nome: string; slug: string; imagem_url?: string }>> {
    return this.request<Array<{ id: string; nome: string; slug: string; imagem_url?: string }>>('/categorias-receitas');
  }

  // Treinos
  async getTreinos(params?: {
    categoria?: string;
    modalidade_id?: string;
    search?: string;
    premium?: boolean;
    nivel?: string;
  }): Promise<Treino[]> {
    const queryParams = new URLSearchParams();
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (params?.modalidade_id) queryParams.append('modalidade_id', params.modalidade_id);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.premium !== undefined) queryParams.append('premium', String(params.premium));
    if (params?.nivel) queryParams.append('nivel', params.nivel);

    const query = queryParams.toString();
    return this.request<Treino[]>(`/treinos${query ? `?${query}` : ''}`);
  }

  async getTreino(id: string): Promise<Treino> {
    // Validar ID antes de fazer requisição
    if (!id || id.trim() === '' || id === '__' || id.length < 10) {
      const invalidError = new Error(`ID de treino inválido: ${id}`);
      (invalidError as any).status = 400;
      throw invalidError;
    }
    
    try {
      return await this.request<Treino>(`/treinos/${id}`);
    } catch (error: any) {
      // Re-throw com mensagem mais específica para 404
      if (error?.message?.includes('404') || error?.message?.includes('não encontrado') || error?.status === 404) {
        const notFoundError = new Error(`Treino ${id} não encontrado (pode ter sido deletado)`);
        (notFoundError as any).status = 404;
        throw notFoundError;
      }
      throw error;
    }
  }

  async getExercicioBiblioteca(id: string): Promise<ExercicioBiblioteca> {
    return this.request<ExercicioBiblioteca>(`/exercicios-biblioteca/${id}`);
  }

  // Categorias de Treinos
  async getCategoriasTreinos(): Promise<Array<{ id: string; nome: string; slug: string; imagem_url?: string }>> {
    return this.request<Array<{ id: string; nome: string; slug: string; imagem_url?: string }>>('/categorias-treinos');
  }

  // Modalidades de Treinos
  async getModalidadesTreinos(): Promise<Array<{ id: string; nome: string; descricao?: string; imagem_url?: string; ativa: boolean }>> {
    return this.request<Array<{ id: string; nome: string; descricao?: string; imagem_url?: string; ativa: boolean }>>('/treinos-modalidades');
  }

  // Favoritos
  async getFavoritos(tipo?: 'receita' | 'treino'): Promise<Array<{ id: string; item_id: string; tipo: string; created_at: string }>> {
    const query = tipo ? `?tipo=${tipo}` : '';
    return this.request<Array<{ id: string; item_id: string; tipo: string; created_at: string }>>(`/favoritos${query}`);
  }

  async checkIsFavorito(tipo: 'receita' | 'treino', itemId: string): Promise<{ is_favorito: boolean }> {
    return this.request<{ is_favorito: boolean }>(`/favoritos/check/${tipo}/${itemId}`);
  }

  async addFavorito(tipo: 'receita' | 'treino', itemId: string): Promise<any> {
    return this.request<any>('/favoritos', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, tipo }),
    });
  }

  async removeFavorito(tipo: 'receita' | 'treino', itemId: string): Promise<void> {
    return this.request<void>(`/favoritos/${tipo}/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Ingredientes e Substituições
  async getReceitaIngredientes(receitaId: string): Promise<Array<{
    id: string;
    receita_id: string;
    ingrediente_id: string | null;
    ingrediente_texto: string | null;
    quantidade: number;
    unidade: string;
    ordem: number;
    observacao: string | null;
    substitutos_sugeridos: string[];
    ingrediente?: {
      id: string;
      nome: string;
      calorias: number;
      proteinas: number;
      carboidratos: number;
      gorduras: number;
      fibras?: number;
      sodio?: number;
    };
  }>> {
    return this.request(`/receita-ingredientes/receita/${receitaId}`);
  }

  async searchIngredientes(query: string): Promise<Array<{
    id: string;
    nome: string;
    unidade_base: string;
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    fibras?: number;
    sodio?: number;
  }>> {
    return this.request(`/ingredientes/search?q=${encodeURIComponent(query)}`);
  }

  async searchIngredientesAdvanced(query: string, limit: number = 20): Promise<Array<{
    id: string;
    nome: string;
    unidade_base: string;
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    fibras?: number;
    sodio?: number;
  }>> {
    return this.request(`/ingredientes/search/advanced?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async sugerirSubstitutos(ingredienteId: string, limit: number = 10): Promise<Array<{
    id: string;
    nome: string;
    unidade_base: string;
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    similaridade: number;
  }>> {
    return this.request(`/ingredientes/sugerir-substitutos/${ingredienteId}?limit=${limit}`);
  }

  async validarCompatibilidade(originalId: string, substitutoId: string): Promise<{
    compativel: boolean;
    score: number;
    alertas: string[];
  }> {
    return this.request(`/ingredientes/validar-compatibilidade/${originalId}/${substitutoId}`);
  }

  async buscarIngredienteSimilar(textoIngrediente: string): Promise<{
    id: string;
    nome: string;
    unidade_base: string;
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    fibras?: number;
    sodio?: number;
  } | null> {
    if (!textoIngrediente || textoIngrediente.trim().length < 2) {
      return null;
    }
    return this.request(`/ingredientes/buscar-similar?texto=${encodeURIComponent(textoIngrediente)}`);
  }

  async createSubstituicao(data: {
    receita_id: string;
    ingrediente_original_id: string;
    ingrediente_substituto_id: string;
    quantidade: number;
    unidade: string;
  }): Promise<any> {
    return this.request('/substituicoes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSubstituicoes(receitaId: string): Promise<Array<{
    id: string;
    receita_id: string;
    ingrediente_original_id: string;
    ingrediente_substituto_id: string;
    quantidade: number;
    unidade: string;
    ingrediente_original: {
      id: string;
      nome: string;
    };
    ingrediente_substituto: {
      id: string;
      nome: string;
    };
  }>> {
    return this.request(`/substituicoes/receita/${receitaId}`);
  }

  async calcularMacrosComSubstituicao(receitaId: string): Promise<{
    macrosOriginal: {
      calorias: number;
      proteinas: number;
      carboidratos: number;
      gorduras: number;
      fibras: number;
      sodio: number;
    };
    macrosModificado: {
      calorias: number;
      proteinas: number;
      carboidratos: number;
      gorduras: number;
      fibras: number;
      sodio: number;
    };
  }> {
    return this.request(`/substituicoes/calcular/${receitaId}`);
  }

  async removeSubstituicao(id: string): Promise<void> {
    return this.request(`/substituicoes/${id}`, {
      method: 'DELETE',
    });
  }

  async getHistoricoSubstituicoes(limit: number = 20): Promise<Array<{
    id: string;
    receita_id: string;
    ingrediente_original: { id: string; nome: string };
    ingrediente_substituto: { id: string; nome: string };
    created_at: string;
  }>> {
    return this.request(`/substituicoes/historico?limit=${limit}`);
  }

  async getSubstituicoesFrequentes(limit: number = 5): Promise<Array<{
    ingrediente_original: { id: string; nome: string };
    ingrediente_substituto: { id: string; nome: string };
    count: number;
  }>> {
    return this.request(`/substituicoes/frequentes?limit=${limit}`);
  }

  // IA Assistant
  async consultarIA(receitaId: string, pergunta: string): Promise<{
    id: string;
    receita_id: string;
    pergunta: string;
    resposta_ia: string;
    substituicao_sugerida?: {
      ingrediente_original: string;
      ingrediente_substituto: string;
      quantidade_original: number;
      quantidade_substituto: number;
      unidade: string;
      razao: string;
    } | null;
    aplicada: boolean;
    created_at: string;
  }> {
    return this.request('/ingredientes/ia/consulta', {
      method: 'POST',
      body: JSON.stringify({
        receita_id: receitaId,
        pergunta: pergunta,
      }),
    });
  }

  async getConsultasIA(receitaId?: string): Promise<Array<{
    id: string;
    receita_id: string;
    pergunta: string;
    resposta_ia: string;
    aplicada: boolean;
    created_at: string;
  }>> {
    const url = receitaId 
      ? `/ingredientes/ia/consultas/receita/${receitaId}`
      : '/ingredientes/ia/consultas';
    return this.request(url);
  }

  async marcarConsultaComoAplicada(consultaId: string): Promise<void> {
    return this.request(`/ingredientes/ia/consultas/${consultaId}/aplicar`, {
      method: 'PATCH',
    });
  }

  // Subscriptions
  async getSubscriptionStatus(): Promise<{ active: boolean; tier: string; expiresAt: Date | null }> {
    return this.request<{ active: boolean; tier: string; expiresAt: Date | null }>('/subscriptions/status');
  }

  async getSubscriptionPlans(): Promise<{
    plans: Array<{
      tier: string;
      nome: string;
      descricao: string;
      beneficios: string[];
      periodos: Array<{
        periodo: string;
        periodoDisplay: string;
        precoTotal: number;
        precoMensal: number;
        descontoPercentual: number;
        meses: number;
      }>;
    }>;
  }> {
    return this.request('/subscriptions/plans');
  }

  async validateIosReceipt(receipt: string, transactionId?: string): Promise<any> {
    return this.request<any>('/subscriptions/validate-ios', {
      method: 'POST',
      body: JSON.stringify({ receipt, transaction_id: transactionId }),
    });
  }

  async validateAndroidPurchase(purchaseToken: string, productId: string, transactionId?: string): Promise<any> {
    return this.request<any>('/subscriptions/validate-android', {
      method: 'POST',
      body: JSON.stringify({ purchase_token: purchaseToken, product_id: productId, transaction_id: transactionId }),
    });
  }

  async restorePurchases(plataforma: 'ios' | 'android'): Promise<any[]> {
    return this.request<any[]>('/subscriptions/restore', {
      method: 'POST',
      body: JSON.stringify({ plataforma }),
    });
  }

  // Legal
  async getPrivacyPolicy(): Promise<{ content: string; version: string; lastUpdated: string }> {
    return this.request<{ content: string; version: string; lastUpdated: string }>('/legal/privacy-policy');
  }

  async getTermsOfService(): Promise<{ content: string; version: string; lastUpdated: string }> {
    return this.request<{ content: string; version: string; lastUpdated: string }>('/legal/terms-of-service');
  }

  async deleteAccount(): Promise<void> {
    return this.request<void>('/auth/profile', {
      method: 'DELETE',
    });
  }

  async createConsentimento(tipo: 'terms' | 'privacy' | 'marketing' | 'analytics', aceito: boolean, versao?: string): Promise<any> {
    return this.request<any>('/legal/consent', {
      method: 'POST',
      body: JSON.stringify({ tipo, aceito, versao }),
    });
  }

  // Notifications
  async registerNotificationToken(token: string, plataforma: 'ios' | 'android'): Promise<any> {
    return this.request<any>('/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify({ token, plataforma }),
    });
  }

  async removeNotificationToken(token: string): Promise<void> {
    return this.request<void>('/notifications/remove-token', {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    });
  }

  async getNotificationHistory(): Promise<any[]> {
    return this.request<any[]>('/notifications/history');
  }

  // Macros Calculator
  async calcularMacrosDiarios(data: {
    peso: number;
    altura: number;
    idade: number;
    genero: 'masculino' | 'feminino';
    nivelAtividade: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
    objetivo: 'perder_peso' | 'manter_peso' | 'ganhar_peso';
  }): Promise<{ calorias: number; proteinas: number; carboidratos: number; gorduras: number }> {
    return this.request<any>('/receitas/macros/calcular-diarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calcularMacrosReceita(receitaId: string, porcoes?: number): Promise<any> {
    const query = porcoes ? `?porcoes=${porcoes}` : '';
    return this.request<any>(`/receitas/${receitaId}/macros${query}`);
  }

  // Atividades (fiz receita / treinei hoje)
  async criarAtividade(itemId: string, tipo: 'fiz_receita' | 'treinei_hoje', data?: string): Promise<any> {
    return this.request('/atividades', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        tipo,
        data,
      }),
    });
  }

  async verificarFezHoje(itemId: string, tipo: 'fiz_receita' | 'treinei_hoje'): Promise<boolean> {
    const response = await this.request(`/atividades/check/${tipo}/${itemId}`);
    return response.fez_hoje || false;
  }

  async removerAtividade(itemId: string, tipo: 'fiz_receita' | 'treinei_hoje'): Promise<void> {
    return this.request(`/atividades/${tipo}/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Avaliações (1-5 estrelas)
  async criarAvaliacao(itemId: string, tipo: 'receita' | 'treino', nota: number, comentario?: string): Promise<any> {
    return this.request('/avaliacoes', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        tipo,
        nota,
        comentario,
      }),
    });
  }

  async obterAvaliacao(itemId: string, tipo: 'receita' | 'treino'): Promise<{ nota: number; comentario?: string } | null> {
    const response = await this.request(`/avaliacoes/${tipo}/${itemId}`);
    return response.nota > 0 ? response : null;
  }

  async atualizarAvaliacao(itemId: string, tipo: 'receita' | 'treino', nota: number, comentario?: string): Promise<any> {
    return this.request(`/avaliacoes/${tipo}/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({
        nota,
        comentario,
      }),
    });
  }

  async removerAvaliacao(itemId: string, tipo: 'receita' | 'treino'): Promise<void> {
    return this.request(`/avaliacoes/${tipo}/${itemId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
