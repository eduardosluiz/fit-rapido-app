import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Ingrediente, FonteIngrediente } from './entities/ingrediente.entity';
import { IngredienteCache, FonteCache } from './entities/ingrediente-cache.entity';
import { CreateIngredienteDto, UpdateIngredienteDto } from './dto/ingrediente.dto';
import { USDAService } from './usda.service';

@Injectable()
export class IngredientesService {
  constructor(
    @InjectRepository(Ingrediente)
    private ingredienteRepository: Repository<Ingrediente>,
    @InjectRepository(IngredienteCache)
    private cacheRepository: Repository<IngredienteCache>,
    private usdaService: USDAService,
  ) {}

  async create(createIngredienteDto: CreateIngredienteDto): Promise<Ingrediente> {
    // Verificar se já existe ingrediente com mesmo nome
    const existing = await this.ingredienteRepository.findOne({
      where: { nome: ILike(createIngredienteDto.nome) },
    });

    if (existing) {
      throw new BadRequestException('Ingrediente com este nome já existe');
    }

    const ingrediente = this.ingredienteRepository.create({
      ...createIngredienteDto,
      fonte: createIngredienteDto.fonte || FonteIngrediente.MANUAL,
      data_importacao: new Date(),
    });

    return await this.ingredienteRepository.save(ingrediente);
  }

  async findAll(ativo?: boolean): Promise<Ingrediente[]> {
    const where: any = {};
    if (ativo !== undefined) {
      where.ativo = ativo;
    }
    return await this.ingredienteRepository.find({
      where,
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Ingrediente> {
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id },
    });

    if (!ingrediente) {
      throw new NotFoundException('Ingrediente não encontrado');
    }

    return ingrediente;
  }

  async findByNome(nome: string): Promise<Ingrediente | null> {
    // Buscar por nome exato (case-insensitive)
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { nome: ILike(nome) },
    });

    if (ingrediente) {
      return ingrediente;
    }

    // Buscar por variações
    const ingredientes = await this.ingredienteRepository.find({
      where: { ativo: true },
    });

    const nomeLower = nome.toLowerCase().trim();
    return ingredientes.find(
      (ing) =>
        ing.nome_variacoes.some((v) => v.toLowerCase() === nomeLower) ||
        ing.nome.toLowerCase() === nomeLower,
    ) || null;
  }

  async search(query: string): Promise<Ingrediente[]> {
    const ingredientes = await this.ingredienteRepository.find({
      where: { nome: ILike(`%${query}%`) },
      take: 20,
      order: { nome: 'ASC' },
    });

    // Também buscar por variações
    const todosIngredientes = await this.ingredienteRepository.find({
      where: { ativo: true },
    });

    const queryLower = query.toLowerCase();
    const porVariacoes = todosIngredientes.filter(
      (ing) =>
        ing.nome_variacoes.some((v) => v.toLowerCase().includes(queryLower)) &&
        !ingredientes.find((i) => i.id === ing.id),
    );

    return [...ingredientes, ...porVariacoes].slice(0, 20);
  }

  /**
   * Busca ingredientes com autocomplete melhorado e ordenação por relevância
   */
  async searchAdvanced(query: string, limit: number = 20): Promise<Ingrediente[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Normalizar a query: remover vírgulas e normalizar espaços
    const queryNormalizada = query
      .replace(/,/g, ' ') // Substitui vírgulas por espaços
      .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
      .trim();
    
    const queryLower = queryNormalizada.toLowerCase();
    const todosIngredientes = await this.ingredienteRepository.find({
      where: { ativo: true },
    });

    // Calcular relevância para cada ingrediente
    const ingredientesComRelevancia = todosIngredientes.map((ing) => {
      let relevancia = 0;
      // Normalizar o nome também (remover vírgulas)
      const nomeNormalizado = ing.nome.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      const nomeLower = nomeNormalizado.toLowerCase();

      // Match exato no nome = maior relevância
      if (nomeLower === queryLower) {
        relevancia = 1000;
      } else if (nomeLower.startsWith(queryLower)) {
        relevancia = 500;
      } else if (nomeLower.includes(queryLower)) {
        relevancia = 100;
      }

      // Também verificar match sem normalização (caso a query não tenha vírgula mas o nome tenha)
      const nomeOriginalLower = ing.nome.toLowerCase();
      if (nomeOriginalLower.includes(queryLower) && relevancia === 0) {
        relevancia = 50;
      }

      // Match em variações (também normalizadas)
      const matchVariacao = ing.nome_variacoes.some((v) => {
        const vNormalizado = v.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
        const vLower = vNormalizado.toLowerCase();
        if (vLower === queryLower) return true;
        if (vLower.startsWith(queryLower)) return true;
        return vLower.includes(queryLower);
      });

      if (matchVariacao) {
        relevancia = Math.max(relevancia, 50);
      }

      return { ingrediente: ing, relevancia };
    });

    // Filtrar apenas os que têm relevância > 0 e ordenar
    return ingredientesComRelevancia
      .filter((item) => item.relevancia > 0)
      .sort((a, b) => b.relevancia - a.relevancia)
      .slice(0, limit)
      .map((item) => item.ingrediente);
  }

  /**
   * Sugere ingredientes similares baseado em características nutricionais
   */
  async sugerirSubstitutos(
    ingredienteId: string,
    limit: number = 10,
  ): Promise<Array<Ingrediente & { similaridade: number }>> {
    const ingredienteOriginal = await this.findOne(ingredienteId);
    if (!ingredienteOriginal) {
      return [];
    }

    const todosIngredientes = await this.ingredienteRepository
      .createQueryBuilder('ingrediente')
      .where('ingrediente.ativo = :ativo', { ativo: true })
      .andWhere('ingrediente.id != :id', { id: ingredienteId })
      .getMany();

    // Calcular similaridade nutricional
    const ingredientesComSimilaridade = todosIngredientes.map((ing) => {
      // Normalizar valores para 100g para comparação
      const originalCal = Number(ingredienteOriginal.calorias);
      const originalProt = Number(ingredienteOriginal.proteinas);
      const originalCarb = Number(ingredienteOriginal.carboidratos);
      const originalGord = Number(ingredienteOriginal.gorduras);

      const ingCal = Number(ing.calorias);
      const ingProt = Number(ing.proteinas);
      const ingCarb = Number(ing.carboidratos);
      const ingGord = Number(ing.gorduras);

      // Calcular diferença percentual (quanto menor, mais similar)
      const diffCal = Math.abs(originalCal - ingCal) / Math.max(originalCal, 1);
      const diffProt = Math.abs(originalProt - ingProt) / Math.max(originalProt, 1);
      const diffCarb = Math.abs(originalCarb - ingCarb) / Math.max(originalCarb, 1);
      const diffGord = Math.abs(originalGord - ingGord) / Math.max(originalGord, 1);

      // Similaridade (0-100), quanto maior, mais similar
      const similaridade = Math.max(
        0,
        100 - ((diffCal + diffProt + diffCarb + diffGord) / 4) * 100,
      );

      return { ...ing, similaridade };
    });

    return ingredientesComSimilaridade
      .sort((a, b) => b.similaridade - a.similaridade)
      .slice(0, limit);
  }

  /**
   * Valida compatibilidade nutricional entre dois ingredientes
   */
  validarCompatibilidade(
    original: Ingrediente,
    substituto: Ingrediente,
  ): {
    compativel: boolean;
    score: number; // 0-100
    alertas: string[];
  } {
    const alertas: string[] = [];
    let score = 100;

    const originalCal = Number(original.calorias);
    const originalProt = Number(original.proteinas);
    const originalCarb = Number(original.carboidratos);
    const originalGord = Number(original.gorduras);

    const subCal = Number(substituto.calorias);
    const subProt = Number(substituto.proteinas);
    const subCarb = Number(substituto.carboidratos);
    const subGord = Number(substituto.gorduras);

    // Verificar diferenças significativas (>30%)
    const diffCal = Math.abs(originalCal - subCal) / Math.max(originalCal, 1);
    const diffProt = Math.abs(originalProt - subProt) / Math.max(originalProt, 1);
    const diffCarb = Math.abs(originalCarb - subCarb) / Math.max(originalCarb, 1);
    const diffGord = Math.abs(originalGord - subGord) / Math.max(originalGord, 1);

    if (diffCal > 0.3) {
      alertas.push(
        `Diferença significativa de calorias: ${diffCal > 0 ? '+' : ''}${((diffCal - 1) * 100).toFixed(0)}%`,
      );
      score -= 20;
    }

    if (diffProt > 0.5) {
      alertas.push(
        `Diferença significativa de proteínas: ${diffProt > 0 ? '+' : ''}${((diffProt - 1) * 100).toFixed(0)}%`,
      );
      score -= 15;
    }

    if (diffCarb > 0.5) {
      alertas.push(
        `Diferença significativa de carboidratos: ${diffCarb > 0 ? '+' : ''}${((diffCarb - 1) * 100).toFixed(0)}%`,
      );
      score -= 15;
    }

    if (diffGord > 0.5) {
      alertas.push(
        `Diferença significativa de gorduras: ${diffGord > 0 ? '+' : ''}${((diffGord - 1) * 100).toFixed(0)}%`,
      );
      score -= 15;
    }

    return {
      compativel: score >= 50, // Considera compatível se score >= 50
      score: Math.max(0, score),
      alertas,
    };
  }

  async update(id: string, updateIngredienteDto: UpdateIngredienteDto): Promise<Ingrediente> {
    const ingrediente = await this.findOne(id);

    if (updateIngredienteDto.nome && updateIngredienteDto.nome !== ingrediente.nome) {
      const existing = await this.ingredienteRepository.findOne({
        where: { nome: ILike(updateIngredienteDto.nome) },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Ingrediente com este nome já existe');
      }
    }

    Object.assign(ingrediente, updateIngredienteDto);
    return await this.ingredienteRepository.save(ingrediente);
  }

  async remove(id: string): Promise<void> {
    const ingrediente = await this.findOne(id);
    await this.ingredienteRepository.remove(ingrediente);
  }

  // Buscar ou criar ingrediente (usado pelo fallback de API)
  async buscarOuCriarIngrediente(
    nome: string,
    dadosNutricionais?: {
      calorias: number;
      proteinas: number;
      carboidratos: number;
      gorduras: number;
      fibras?: number;
      sodio?: number;
    },
    fonte: FonteIngrediente = FonteIngrediente.API,
  ): Promise<Ingrediente> {
    // 1. Tentar buscar no banco próprio
    let ingrediente = await this.findByNome(nome);

    if (ingrediente) {
      return ingrediente;
    }

    // 2. Tentar buscar no cache
    const nomeNormalizado = this.normalizarNome(nome);
    let cache = await this.cacheRepository.findOne({
      where: { nome_normalizado: nomeNormalizado },
    });

    if (cache && cache.ingrediente_id) {
      return await this.findOne(cache.ingrediente_id);
    }

    // 3. Se não tem dados nutricionais, tentar buscar na API USDA
    if (!dadosNutricionais) {
      try {
        const dadosUSDA = await this.usdaService.buscarIngrediente(nome);
        if (dadosUSDA) {
          dadosNutricionais = {
            calorias: dadosUSDA.calorias,
            proteinas: dadosUSDA.proteinas,
            carboidratos: dadosUSDA.carboidratos,
            gorduras: dadosUSDA.gorduras,
            fibras: dadosUSDA.fibras,
            sodio: dadosUSDA.sodio,
          };
          fonte = FonteIngrediente.API;
        }
      } catch (error) {
        // Se falhar, continuar sem dados
      }
    }

    // 4. Se tem dados nutricionais, criar ingrediente
    if (dadosNutricionais) {
      ingrediente = await this.create({
        nome,
        unidade_base: '100g',
        ...dadosNutricionais,
        fonte,
        ativo: true,
      });

      // Cachear
      if (cache) {
        cache.ingrediente_id = ingrediente.id;
        await this.cacheRepository.save(cache);
      } else {
        await this.cacheRepository.save({
          nome_normalizado: nomeNormalizado,
          ingrediente_id: ingrediente.id,
          calorias: dadosNutricionais.calorias,
          proteinas: dadosNutricionais.proteinas,
          carboidratos: dadosNutricionais.carboidratos,
          gorduras: dadosNutricionais.gorduras,
          fibras: dadosNutricionais.fibras,
          sodio: dadosNutricionais.sodio,
          fonte: fonte === FonteIngrediente.API ? FonteCache.API_USDA : FonteCache.IA,
          confianca: 0.9,
        });
      }

      return ingrediente;
    }

    throw new NotFoundException(`Ingrediente "${nome}" não encontrado e sem dados nutricionais`);
  }

  private normalizarNome(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim();
  }

  /**
   * Busca o ingrediente mais similar baseado em texto livre
   * Usa busca avançada e retorna o mais relevante
   */
  async buscarIngredienteSimilar(textoIngrediente: string): Promise<Ingrediente | null> {
    if (!textoIngrediente || textoIngrediente.trim().length < 2) {
      console.log(`⚠️ Texto muito curto ou vazio: "${textoIngrediente}"`);
      return null;
    }

    console.log(`🔍 Buscando ingrediente similar para: "${textoIngrediente}"`);

    // Normalizar o texto: remover informações extras, normalizar pontuação e espaços
    const textoNormalizado = this.normalizarNome(textoIngrediente);
    
    // Limpar o texto: remover informações extras entre parênteses, vírgulas, etc.
    const textoLimpo = textoIngrediente
      .replace(/\([^)]*\)/g, '') // Remove tudo entre parênteses
      .replace(/\[.*?\]/g, '') // Remove tudo entre colchetes
      .trim();

    console.log(`🧹 Texto limpo: "${textoLimpo}"`);
    console.log(`🔤 Texto normalizado: "${textoNormalizado}"`);

    // Primeiro, tentar busca avançada com o texto limpo
    let resultados = await this.searchAdvanced(textoLimpo, 10);
    
    // Se não encontrou, tentar com o texto normalizado (sem acentos, tudo minúsculo)
    if (resultados.length === 0) {
      console.log(`🔄 Tentando busca com texto normalizado...`);
      resultados = await this.searchAdvanced(textoNormalizado, 10);
    }

    // Se ainda não encontrou, buscar todos os ingredientes e fazer busca manual mais flexível
    if (resultados.length === 0) {
      console.log(`🔄 Fazendo busca manual mais flexível...`);
      const todosIngredientes = await this.ingredienteRepository.find({
        where: { ativo: true },
      });

      const textoBuscaLower = textoNormalizado.toLowerCase();
      
      // Buscar por correspondência parcial no nome ou variações
      const ingredientesEncontrados = todosIngredientes
        .map((ing) => {
          let score = 0;
          const nomeLower = this.normalizarNome(ing.nome).toLowerCase();
          
          // Match exato = maior score
          if (nomeLower === textoBuscaLower) {
            score = 1000;
          } 
          // Contém todas as palavras principais
          else {
            const palavrasBusca = textoBuscaLower.split(/\s+/).filter(p => p.length > 2);
            const palavrasNome = nomeLower.split(/\s+/);
            
            let palavrasEncontradas = 0;
            palavrasBusca.forEach(palavra => {
              if (palavrasNome.some(p => p.includes(palavra) || palavra.includes(p))) {
                palavrasEncontradas++;
              }
            });
            
            if (palavrasEncontradas > 0) {
              score = (palavrasEncontradas / palavrasBusca.length) * 100;
            }
            
            // Bonus se o nome contém o texto de busca
            if (nomeLower.includes(textoBuscaLower)) {
              score += 50;
            }
            
            // Bonus se o texto de busca contém palavras do nome
            palavrasNome.forEach(palavra => {
              if (textoBuscaLower.includes(palavra) && palavra.length > 3) {
                score += 10;
              }
            });
          }
          
          // Verificar variações também
          ing.nome_variacoes.forEach(variacao => {
            const variacaoLower = this.normalizarNome(variacao).toLowerCase();
            if (variacaoLower === textoBuscaLower) {
              score = Math.max(score, 800);
            } else if (variacaoLower.includes(textoBuscaLower) || textoBuscaLower.includes(variacaoLower)) {
              score = Math.max(score, score + 30);
            }
          });
          
          return { ingrediente: ing, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => item.ingrediente);
      
      resultados = ingredientesEncontrados;
    }

    console.log(`📋 Resultados encontrados: ${resultados.length}`);
    if (resultados.length > 0) {
      console.log(`   Primeiro resultado: "${resultados[0].nome}" (ID: ${resultados[0].id})`);
      console.log(`   Valores nutricionais: Cal=${resultados[0].calorias}, Prot=${resultados[0].proteinas}, Carb=${resultados[0].carboidratos}, Gord=${resultados[0].gorduras}`);
    } else {
      console.log(`❌ Nenhum ingrediente encontrado para "${textoLimpo}" ou "${textoNormalizado}"`);
    }

    if (resultados.length === 0) {
      return null;
    }

    // Retornar o mais relevante (já está ordenado por relevância)
    return resultados[0];
  }
}

