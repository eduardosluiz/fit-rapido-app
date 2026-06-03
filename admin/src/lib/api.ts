const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Log de erro para debug
        const errorText = await response.text();
        
        // Se for 401, tratar como aviso (esperado quando não logado)
        if (response.status === 401) {
          console.warn(`ℹ️ Sessão não iniciada, expirada ou sem permissão (${response.status}) na rota ${endpoint}`);
          
          if (endpoint === '/auth/login') {
            throw new Error('E-mail ou senha incorretos.');
          }

          // Apenas remover o token e deslogar se for a rota de validação do perfil,
          // ou se a API explicitamente retornar que o token é inválido.
          // Não deslogar em rotas comuns que podem apenas retornar Forbidden/Unauthorized por falta de permissão.
          if (typeof window !== 'undefined' && endpoint === '/auth/profile') {
            localStorage.removeItem('auth_token');
          }
        } else {
          console.error(`❌ Erro na API (${response.status}):`, errorText);
        }

        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText || 'Erro desconhecido' };
        }
        
        throw new Error(error.message || `Erro ${response.status}`);
      }

      // Se for 204 (NO_CONTENT), não há corpo na resposta
      if (response.status === 204) {
        return null as T;
      }

      // Verificar se há conteúdo no body antes de processar
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      // Se não houver conteúdo, retornar null
      if (!text || text.trim() === '') {
        return null as T;
      }

      // Se não for JSON, retornar null (não tentar fazer parse)
      if (!contentType || !contentType.includes('application/json')) {
        return null as T;
      }

      // Tentar fazer parse do JSON
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Se falhar ao fazer parse, lançar erro para ser tratado acima
        throw new Error('Resposta inválida do servidor: não é um JSON válido');
      }
    } catch (error: any) {
      // Tratar erros de rede (Failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(
          `Não foi possível conectar ao servidor. Verifique se a API está rodando em ${API_URL}`
        );
      }
      throw error;
    }
  }

  // Auth
  async login(email: string, senha: string) {
    console.log('📡 Fazendo requisição de login para:', `${API_URL}/auth/login`);
    const data = await this.request<{ user: any; access_token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      },
    );
    console.log('📥 Resposta do login:', data);
    if (typeof window !== 'undefined') {
      if (data?.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        console.log('💾 Token salvo no localStorage');
      } else {
        console.error('⚠️ Token não encontrado na resposta:', data);
      }
    }
    return data;
  }

  async register(email: string, nome: string, senha: string) {
    const data = await this.request<{ user: any; access_token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, nome, senha }),
      },
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.access_token);
    }
    return data;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async changePassword(senha_atual: string, nova_senha: string) {
    return this.request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ senha_atual, nova_senha }),
    });
  }

  async adminChangePassword(userId: string, nova_senha: string) {
    return this.request<any>(`/auth/users/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ nova_senha }),
    });
  }

  // Receitas
  async getReceitas(params?: {
    categoria?: string;
    search?: string;
    premium?: boolean;
    dificuldade?: string;
    incluirInativas?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.premium !== undefined) queryParams.append('premium', String(params.premium));
    if (params?.dificuldade) queryParams.append('dificuldade', params.dificuldade);
    if (params?.incluirInativas) queryParams.append('incluirInativas', 'true');
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const query = queryParams.toString();
    return this.request<any>(`/receitas${query ? `?${query}` : ''}`);
  }

  async getReceita(id: string) {
    return this.request<any>(`/receitas/${id}`);
  }

  async createReceita(data: any) {
    // Remover campos undefined/null antes de enviar
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    return this.request<any>('/receitas', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }

  async updateReceita(id: string, data: any) {
    // Remover campos undefined/null antes de enviar
    // MAS manter substituicoes_ingredientes mesmo se for objeto vazio (para limpar substituições anteriores)
    const cleanData: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Manter substituicoes_ingredientes mesmo se for objeto vazio
      if (key === 'substituicoes_ingredientes') {
        cleanData[key] = value;
        continue;
      }
      
      // Para categoria_ids: sempre incluir, mesmo se for array vazio (para remover categorias)
      if (key === 'categoria_ids') {
        if (Array.isArray(value)) {
          cleanData[key] = value; // Incluir mesmo se vazio para remover todas as categorias
        }
        // Se não for array, não incluir
        continue;
      }
      
      // Para outros campos, remover undefined/null/string vazia
      if (value !== undefined && value !== null && value !== '') {
        cleanData[key] = value;
      }
    }
    // Removido logs excessivos de payload
    try {
      const resultado = await this.request<any>(`/receitas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(cleanData),
      });
      // Removido log de payload
      return resultado;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar receita:', error);
      throw error;
    }
  }

  async deleteReceita(id: string) {
    const result = await this.request<void>(`/receitas/${id}`, {
      method: 'DELETE',
    });
    // DELETE retorna 204 (NO_CONTENT), então result será null
    // Retornar void explicitamente
    return;
  }

  // Categorias
  async getCategorias() {
    return this.request<any[]>('/categorias-receitas');
  }

  async getCategoria(id: string) {
    return this.request<any>(`/categorias-receitas/${id}`);
  }

  async createCategoria(data: any) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== '')
    );
    return this.request<any>('/categorias-receitas', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }

  async updateCategoria(id: string, data: any) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== '')
    );
    return this.request<any>(`/categorias-receitas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(cleanData),
    });
  }

  async deleteCategoria(id: string) {
    return this.request<void>(`/categorias-receitas/${id}`, {
      method: 'DELETE',
    });
  }

  async getStats() {
    return this.request<any>('/stats');
  }

  // Banners
  async getBannersAdmin() {
    return this.request<any[]>('/banners/admin');
  }

  async updateBanners(banners: any[]) {
    return this.request<any>('/banners/bulk', {
      method: 'PUT',
      body: JSON.stringify({ banners }),
    });
  }

  // Treinos
  async getTreinos(params?: {
    categoria?: string;
    modalidade_id?: string;
    search?: string;
    premium?: boolean;
    nivel?: string;
    incluirInativas?: boolean;
    apenasAvulsos?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (params?.modalidade_id) queryParams.append('modalidade_id', params.modalidade_id);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.premium !== undefined) queryParams.append('premium', String(params.premium));
    if (params?.nivel) queryParams.append('nivel', params.nivel);
    if (params?.incluirInativas) queryParams.append('incluirInativas', 'true');
    if (params?.apenasAvulsos) queryParams.append('apenasAvulsos', 'true');
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const query = queryParams.toString();
    return this.request<any>(`/treinos${query ? `?${query}` : ''}`);
  }

  async getTreino(id: string) {
    return this.request<any>(`/treinos/${id}`);
  }

  async createTreino(data: any) {
    return this.request<any>('/treinos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTreino(id: string, data: any) {
    const cleanData: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Remover apenas null e undefined. Manter string vazia para permitir limpar campos!
      if (value === undefined || value === null) {
        continue;
      }

      // Proteger arrays contra [null] ou strings vazias dentro deles
      if (Array.isArray(value)) {
        if (['categoria_ids', 'tags', 'grupos_musculares', 'equipamentos'].includes(key)) {
          // Filtra para garantir que o array só tem strings válidas
          const validStrings = value.filter(v => typeof v === 'string' && v.trim() !== '');
          cleanData[key] = validStrings;
          continue;
        }

        if (key === 'exercicios_detalhados') {
          // Garante que só envie os exercícios que têm nome (já estava no form, mas é uma camada extra)
          const validExs = value.filter(ex => ex && ex.nome && ex.nome.trim() !== '');
          cleanData[key] = validExs;
          continue;
        }
      }

      cleanData[key] = value;
    }

    // Removido log de payload

    try {
      const resultado = await this.request<any>(`/treinos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(cleanData),
      });
      return resultado;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar treino:', error);
      throw error;
    }
  }

  async deleteTreino(id: string) {
    return this.request<void>(`/treinos/${id}`, {
      method: 'DELETE',
    });
  }

  // Categorias de Treinos
  async getCategoriasTreinos() {
    return this.request<any[]>('/categorias-treinos');
  }

  async getCategoriaTreino(id: string) {
    return this.request<any>(`/categorias-treinos/${id}`);
  }

  async createCategoriaTreino(data: any) {
    return this.request<any>('/categorias-treinos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategoriaTreino(id: string, data: any) {
    return this.request<any>(`/categorias-treinos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategoriaTreino(id: string) {
    return this.request<void>(`/categorias-treinos/${id}`, {
      method: 'DELETE',
    });
  }

  // Modalidades de Treinos
  async getModalidadesTreinos() {
    return this.request<any[]>('/treinos-modalidades');
  }

  async getModalidadeTreino(id: string) {
    return this.request<any>(`/treinos-modalidades/${id}`);
  }

  async createModalidadeTreino(data: any) {
    return this.request<any>('/treinos-modalidades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateModalidadeTreino(id: string, data: any) {
    return this.request<any>(`/treinos-modalidades/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteModalidadeTreino(id: string) {
    return this.request<void>(`/treinos-modalidades/${id}`, {
      method: 'DELETE',
    });
  }

  // Usuários
  async getUsers() {
    return this.request<any[]>('/auth/users');
  }

  async getUser(id: string) {
    return this.request<any>(`/auth/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/auth/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Favoritos
  async getFavoritos(tipo?: 'receita' | 'treino') {
    const query = tipo ? `?tipo=${tipo}` : '';
    return this.request<any[]>(`/favoritos${query}`);
  }

  async checkIsFavorito(tipo: 'receita' | 'treino', itemId: string) {
    return this.request<{ is_favorito: boolean }>(`/favoritos/check/${tipo}/${itemId}`);
  }

  async addFavorito(tipo: 'receita' | 'treino', itemId: string) {
    return this.request<any>('/favoritos', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, tipo }),
    });
  }

  async removeFavorito(tipo: 'receita' | 'treino', itemId: string) {
    return this.request<void>(`/favoritos/${tipo}/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Ingredientes
  async getIngredientes(params?: { search?: string; ativo?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.ativo !== undefined) queryParams.append('ativo', String(params.ativo));

    const query = queryParams.toString();
    return this.request<any[]>(`/ingredientes${query ? `?${query}` : ''}`);
  }

  async getIngrediente(id: string) {
    return this.request<any>(`/ingredientes/${id}`);
  }

  async createIngrediente(data: any) {
    return this.request<any>('/ingredientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIngrediente(id: string, data: any) {
    return this.request<any>(`/ingredientes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteIngrediente(id: string) {
    return this.request<void>(`/ingredientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Receita-Ingredientes
  async getReceitaIngredientes(receitaId: string) {
    return this.request<any[]>(`/receitas/${receitaId}/ingredientes`);
  }

  async createReceitaIngrediente(receitaId: string, data: any) {
    return this.request<any>(`/receitas/${receitaId}/ingredientes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReceitaIngrediente(receitaId: string, id: string, data: any) {
    return this.request<any>(`/receitas/${receitaId}/ingredientes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteReceitaIngrediente(receitaId: string, id: string) {
    return this.request<void>(`/receitas/${receitaId}/ingredientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Exercícios da Biblioteca
  async getExerciciosBiblioteca(params?: { page?: number; limit?: number; search?: string; grupo?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.grupo) queryParams.append('grupo', params.grupo);

    const query = queryParams.toString();
    return this.request<any>(`/exercicios-biblioteca${query ? `?${query}` : ''}`);
  }

  async createExercicioBiblioteca(data: any) {
    return this.request<any>('/exercicios-biblioteca', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteExercicioBiblioteca(id: string) {
    return this.request<void>(`/exercicios-biblioteca/${id}`, {
      method: 'DELETE',
    });
  }

  // Categorias de Exercícios
  async getExerciciosCategorias() {
    return this.request<any[]>('/exercicios-categorias');
  }

  async createExercicioCategoria(nome: string) {
    return this.request<any>('/exercicios-categorias', {
      method: 'POST',
      body: JSON.stringify({ nome }),
    });
  }

  async deleteExercicioCategoria(id: string) {
    return this.request<void>(`/exercicios-categorias/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

