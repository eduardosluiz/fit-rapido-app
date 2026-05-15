import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, In } from 'typeorm';
import { Receita } from './entities/receita.entity';
import { CategoriaReceita } from './entities/categoria-receita.entity';
import { CreateReceitaDto, UpdateReceitaDto } from './dto/receita.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { User, SubscriptionTier, UserRole } from '../auth/entities/user.entity';
import { hasActiveTrial } from '../common/helpers/subscription.helper';

@Injectable()
export class ReceitasService {
  constructor(
    @InjectRepository(Receita)
    private receitaRepository: Repository<Receita>,
    @InjectRepository(CategoriaReceita)
    private categoriaRepository: Repository<CategoriaReceita>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(createReceitaDto: CreateReceitaDto): Promise<Receita> {
    // Verificar se categorias existem (se fornecidas)
    if (createReceitaDto.categoria_ids && createReceitaDto.categoria_ids.length > 0) {
      const categorias = await this.categoriaRepository.find({
        where: {
          id: In(createReceitaDto.categoria_ids),
        },
      });

      if (categorias.length !== createReceitaDto.categoria_ids.length) {
        throw new BadRequestException('Uma ou mais categorias não foram encontradas');
      }
    }

    // Validar máximo de 50 receitas FREE
    if (createReceitaDto.is_free === true) {
      const freeCount = await this.getFreeRecipesCount();
      if (freeCount >= 50) {
        throw new BadRequestException('Máximo de 50 receitas FREE permitidas. Desmarque outra receita FREE antes de adicionar esta.');
      }
    }

    const { categoria_ids, ...receitaData } = createReceitaDto;

    // Normalizar campos de array (converter de string para array se necessário)
    const arrayFields = ['ingredientes', 'modo_preparo', 'imagens_url', 'tags', 'cuisines'];
    for (const field of arrayFields) {
      if (receitaData[field] !== undefined) {
        if (typeof receitaData[field] === 'string') {
          receitaData[field] = (receitaData[field] as string)
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');
        } else if (!Array.isArray(receitaData[field])) {
          receitaData[field] = receitaData[field] ? [receitaData[field]] : [];
        }
      }
    }

    // Garantir que os campos nutricionais sejam strings para o repositório
    const nutriFields = ['calorias', 'proteinas', 'carboidratos', 'gorduras', 'fibras', 'sodio'];
    for (const field of nutriFields) {
      if (receitaData[field] !== undefined && receitaData[field] !== null) {
        receitaData[field] = String(receitaData[field]);
      }
    }

    const receita = this.receitaRepository.create(receitaData as any);
    const savedReceita: Receita = (await this.receitaRepository.save(receita)) as any;

    // Associar categorias se fornecidas
    if (categoria_ids && categoria_ids.length > 0) {
      const categorias = await this.categoriaRepository.find({
        where: {
          id: In(categoria_ids),
        },
      });
      savedReceita.categorias = categorias;
      await this.receitaRepository.save(savedReceita as any);
    }

    // Enviar notificação para todos os usuários se a receita estiver ativa
    if (savedReceita.ativa) {
      try {
        await this.notificationsService.sendToAll(
          '🍽️ Nova Receita Disponível!',
          `Confira a nova receita: ${savedReceita.titulo}`,
          'receita',
          savedReceita.id, // ID da receita para redirecionamento
        );
      } catch (error) {
        console.error('Erro ao enviar notificação de nova receita:', error);
        // Não falhar a criação da receita se a notificação falhar
      }
    }

    return savedReceita;
  }

  async findAll(
    categoriaId?: string,
    search?: string,
    isPremium?: boolean,
    dificuldade?: string,
    incluirInativas?: boolean,
    tipoRefeicao?: string,
    cuisine?: string,
    tempoMaximo?: number, // Para filtrar receitas rápidas (ex: 10 minutos)
    proteinasMin?: number, // Quantidade mínima de proteína em gramas
    semLactose?: boolean, // Filtrar receitas sem lactose
    lowCarb?: boolean, // Filtrar receitas low carb
    user?: User, // Usuário atual para filtrar por plano
  ): Promise<Receita[]> {
    // Verificar se é admin ANTES de aplicar filtros
    const isAdmin = user && (user.role === UserRole.ADMIN || String(user.role) === 'admin' || user.email === 'dai@gmail.com');
    // Se for admin, ignorar filtro isPremium - admins devem ver todas as receitas
    if (isAdmin && isPremium !== undefined) {
      console.log(`[DEBUG] ⚠️  Admin detectado - ignorando filtro isPremium=${isPremium}`);
      isPremium = undefined;
    }
    // Usar find() ao invés de queryBuilder para garantir que todas as receitas sejam retornadas
    // O queryBuilder com leftJoin pode estar causando problemas
    const queryBuilder = this.receitaRepository
      .createQueryBuilder('receita')
      .leftJoinAndSelect('receita.categorias', 'categorias')
      .addSelect('receita.is_premium')
      .addSelect('receita.is_free');

    // Filtrar por ativa apenas se não for para incluir inativas
    if (!incluirInativas) {
      queryBuilder.where('receita.ativa = :ativa', { ativa: true });
    }

    if (categoriaId) {
      queryBuilder
        .innerJoin('receita.categorias', 'categoria')
        .andWhere('categoria.id = :categoriaId', {
          categoriaId,
        });
    }

    if (search) {
      queryBuilder.andWhere(
        '(receita.titulo ILIKE :search OR receita.descricao ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isPremium !== undefined) {
      queryBuilder.andWhere('receita.is_premium = :isPremium', {
        isPremium,
      });
    }

    if (dificuldade) {
      queryBuilder.andWhere('receita.dificuldade = :dificuldade', {
        dificuldade,
      });
    }

    if (tipoRefeicao) {
      queryBuilder.andWhere('receita.tipo_refeicao = :tipoRefeicao', {
        tipoRefeicao,
      });
    }

    if (cuisine) {
      queryBuilder.andWhere(':cuisine = ANY(receita.cuisines)', {
        cuisine,
      });
    }

    if (tempoMaximo) {
      queryBuilder.andWhere('receita.tempo_preparo <= :tempoMaximo', {
        tempoMaximo,
      });
    }

    if (proteinasMin) {
      queryBuilder.andWhere('receita.proteinas >= :proteinasMin', {
        proteinasMin,
      });
    }

    if (semLactose) {
      // Filtrar receitas que não contenham ingredientes com lactose
      // Isso requer uma busca mais complexa, por enquanto vamos usar tags ou descrição
      queryBuilder.andWhere(
        '(receita.descricao ILIKE :semLactose OR receita.tags::text ILIKE :semLactose)',
        { semLactose: '%sem lactose%' },
      );
    }

    if (lowCarb) {
      // Filtrar receitas low carb (carboidratos <= 30g por porção)
      queryBuilder.andWhere('receita.carboidratos <= :lowCarbMax', {
        lowCarbMax: 30,
      });
    }

    queryBuilder.orderBy('receita.created_at', 'DESC');

    // Debug: verificar a query SQL gerada
    const sql = queryBuilder.getSql();
    const params = queryBuilder.getParameters();
    console.log(`[DEBUG] SQL Query: ${sql}`);
    console.log(`[DEBUG] SQL Parameters:`, params);
    
    let receitas = await queryBuilder.getMany();
    
    // Verificar quantas receitas existem no total no banco (sem filtros)
    const totalNoBanco = await this.receitaRepository.count({
      where: incluirInativas ? {} : { ativa: true },
    });
    console.log(`[DEBUG] Total de receitas no banco (com filtro ativa=${!incluirInativas}): ${totalNoBanco}`);
    
    // Se não retornou todas as receitas, buscar diretamente do repositório
    // Isso garante que todas as receitas sejam retornadas, especialmente as PREMIUM
    if (receitas.length < totalNoBanco) {
      console.log(`[DEBUG] ⚠️  Query retornou apenas ${receitas.length} de ${totalNoBanco} receitas, buscando diretamente do repositório...`);
      // Buscar todas as receitas, respeitando o filtro de ativas
      const whereClause = incluirInativas ? {} : { ativa: true };
      const todasReceitas = await this.receitaRepository.find({
        where: whereClause,
        relations: ['categorias'],
        order: { created_at: 'DESC' },
      });
      console.log(`[DEBUG] Busca direta retornou ${todasReceitas.length} receitas (incluirInativas=${incluirInativas})`);
      console.log(`[DEBUG] Receitas PREMIUM na busca direta: ${todasReceitas.filter(r => r.is_premium === true).length}`);
      console.log(`[DEBUG] Receitas FREE na busca direta: ${todasReceitas.filter(r => r.is_free === true).length}`);
      
      // Aplicar filtros manualmente (exceto ativa, que já foi aplicado na query)
      let receitasFiltradas = todasReceitas;
      console.log(`[DEBUG] Antes dos filtros: ${receitasFiltradas.length} receitas`);
      
      if (categoriaId) {
        const antes = receitasFiltradas.length;
        receitasFiltradas = receitasFiltradas.filter(r => 
          r.categorias && r.categorias.some(cat => cat.id === categoriaId)
        );
        console.log(`[DEBUG] Filtro categoriaId: ${antes} -> ${receitasFiltradas.length}`);
      }
      
      if (search) {
        const antes = receitasFiltradas.length;
        const searchLower = search.toLowerCase();
        receitasFiltradas = receitasFiltradas.filter(r => 
          r.titulo.toLowerCase().includes(searchLower) ||
          r.descricao?.toLowerCase().includes(searchLower)
        );
        console.log(`[DEBUG] Filtro search: ${antes} -> ${receitasFiltradas.length}`);
      }
      
      // NÃO aplicar filtro isPremium para admins - admins devem ver todas as receitas
      const isAdmin = user && (user.role === UserRole.ADMIN || String(user.role) === 'admin' || user.email === 'dai@gmail.com');
      if (isPremium !== undefined && !isAdmin) {
        const antes = receitasFiltradas.length;
        receitasFiltradas = receitasFiltradas.filter(r => r.is_premium === isPremium);
        console.log(`[DEBUG] Filtro isPremium=${isPremium}: ${antes} -> ${receitasFiltradas.length}`);
      } else if (isPremium !== undefined && isAdmin) {
        console.log(`[DEBUG] ⚠️  Filtro isPremium ignorado para admin - retornando todas as receitas`);
      }
      
      if (dificuldade) {
        const antes = receitasFiltradas.length;
        receitasFiltradas = receitasFiltradas.filter(r => r.dificuldade === dificuldade);
        console.log(`[DEBUG] Filtro dificuldade: ${antes} -> ${receitasFiltradas.length}`);
      }
      
      if (tipoRefeicao) {
        const antes = receitasFiltradas.length;
        receitasFiltradas = receitasFiltradas.filter(r => r.tipo_refeicao === tipoRefeicao);
        console.log(`[DEBUG] Filtro tipoRefeicao: ${antes} -> ${receitasFiltradas.length}`);
      }
      
      if (tempoMaximo) {
        const antes = receitasFiltradas.length;
        receitasFiltradas = receitasFiltradas.filter(r => r.tempo_preparo <= tempoMaximo);
        console.log(`[DEBUG] Filtro tempoMaximo: ${antes} -> ${receitasFiltradas.length}`);
      }
      
      if (proteinasMin) {
        const antes = receitasFiltradas.length;
        receitasFiltradas = receitasFiltradas.filter(r => {
          const valor = parseFloat(String(r.proteinas).replace(',', '.'));
          return !isNaN(valor) && valor >= proteinasMin;
        });
        console.log(`[DEBUG] Filtro proteinasMin: ${antes} -> ${receitasFiltradas.length}`);
      }
      
      if (semLactose) {
        const antes = receitasFiltradas.length;
        receitasFiltradas = receitasFiltradas.filter(r => 
          r.descricao?.toLowerCase().includes('sem lactose') ||
          r.tags?.some(tag => tag.toLowerCase().includes('sem lactose'))
        );
        console.log(`[DEBUG] Filtro semLactose: ${antes} -> ${receitasFiltradas.length}`);
      }
      
      if (lowCarb) {
        const antes = receitasFiltradas.length;
        receitasFiltradas = receitasFiltradas.filter(r => {
          const valor = parseFloat(String(r.carboidratos).replace(',', '.'));
          return !isNaN(valor) && valor <= 30;
        });
        console.log(`[DEBUG] Filtro lowCarb: ${antes} -> ${receitasFiltradas.length}`);
      }
      
      receitas = receitasFiltradas;
      console.log(`[DEBUG] ✅ Após aplicar filtros: ${receitas.length} receitas`);
      console.log(`[DEBUG] ✅ Receitas PREMIUM após filtros: ${receitas.filter(r => r.is_premium === true).length}`);
      console.log(`[DEBUG] ✅ Receitas FREE após filtros: ${receitas.filter(r => r.is_free === true).length}`);
    }

    // Debug: log para verificar quantas receitas foram encontradas
    console.log(`[DEBUG] Total de receitas retornadas: ${receitas.length}`);
    
    // Verificar se os campos is_premium e is_free estão presentes
    const receitasComPremium = receitas.filter(r => r.hasOwnProperty('is_premium'));
    const receitasComFree = receitas.filter(r => r.hasOwnProperty('is_free'));
    console.log(`[DEBUG] Receitas com campo is_premium: ${receitasComPremium.length}`);
    console.log(`[DEBUG] Receitas com campo is_free: ${receitasComFree.length}`);
    
    // Verificar valores booleanos
    const receitasPremiumTrue = receitas.filter(r => r.is_premium === true).length;
    const receitasFreeTrue = receitas.filter(r => r.is_free === true).length;
    console.log(`[DEBUG] Receitas FREE (is_free === true): ${receitasFreeTrue}`);
    console.log(`[DEBUG] Receitas PREMIUM (is_premium === true): ${receitasPremiumTrue}`);
    
    // Debug adicional: verificar se há receitas com is_premium null ou undefined
    const premiumNull = receitas.filter(r => r.is_premium === null || r.is_premium === undefined).length;
    const freeNull = receitas.filter(r => r.is_free === null || r.is_free === undefined).length;
    if (premiumNull > 0) console.log(`[DEBUG] ⚠️  Receitas com is_premium null/undefined: ${premiumNull}`);
    if (freeNull > 0) console.log(`[DEBUG] ⚠️  Receitas com is_free null/undefined: ${freeNull}`);
    
    // Debug: mostrar algumas receitas PREMIUM para verificar
    const exemplosPremium = receitas.filter(r => r.is_premium === true).slice(0, 3);
    if (exemplosPremium.length > 0) {
      console.log(`[DEBUG] Exemplos de receitas PREMIUM:`);
      exemplosPremium.forEach(r => {
        console.log(`[DEBUG]   - ${r.titulo.substring(0, 50)}... | is_premium: ${r.is_premium} | is_free: ${r.is_free}`);
      });
    }
    if (user) {
      console.log(`[DEBUG] Usuário autenticado: ${user.email}, Role: ${user.role}, Tipo: ${typeof user.role}`);
      const isAdmin = user.role === UserRole.ADMIN || String(user.role) === 'admin';
      console.log(`[DEBUG] É admin? ${isAdmin}`);
    } else {
      console.log(`[DEBUG] Nenhum usuário autenticado`);
    }

    // Filtrar por plano do usuário se fornecido
    // IMPORTANTE: Admins sempre veem todas as receitas, independente do plano
    if (user) {
      // Se é admin, retornar todas as receitas sem filtro
      // Comparar com enum (pode vir como string do banco)
      const isAdmin = user.role === UserRole.ADMIN || String(user.role) === 'admin';
      // Verificação específica para o admin dai@gmail.com
      const isDaiAdmin = user.email === 'dai@gmail.com';
      
      if (isAdmin || isDaiAdmin) {
        console.log(`[DEBUG] Retornando todas as ${receitas.length} receitas para admin${isDaiAdmin ? ' (dai@gmail.com)' : ''}`);
        return receitas;
      }

      const tier = user.subscription_tier || SubscriptionTier.NONE;
      const isInTrial = hasActiveTrial(user);

      // Se está no trial, pode ver todas as receitas
      if (isInTrial) {
        return receitas;
      }

      // Se é FREE ou NONE (após trial), apenas receitas FREE
      if (tier === SubscriptionTier.FREE || tier === SubscriptionTier.NONE) {
        return receitas.filter((r) => r.is_free === true);
      }

      // PREMIUM e PREMIUM_FIT podem ver todas as receitas
      if (tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.PREMIUM_FIT) {
        return receitas;
      }

      // BASIC (deprecated) - apenas receitas não premium
      if (tier === SubscriptionTier.BASIC) {
        return receitas.filter((r) => r.is_premium === false);
      }
    }

    // Se não há usuário, retornar apenas receitas FREE (acesso público limitado)
    return receitas.filter((r) => r.is_free === true);
  }

  async getFreeRecipesCount(): Promise<number> {
    return this.receitaRepository.count({
      where: { is_free: true, ativa: true },
    });
  }

  async findOne(id: string): Promise<Receita> {
    const receita = await this.receitaRepository.findOne({
      where: { id },
      relations: ['categorias'],
    });

    if (!receita) {
      throw new NotFoundException('Receita não encontrada');
    }

    return receita;
  }

  async update(id: string, updateReceitaDto: UpdateReceitaDto): Promise<Receita> {
    const receita = await this.findOne(id);

    // Verificar se categorias existem (se fornecidas)
    if (updateReceitaDto.categoria_ids && updateReceitaDto.categoria_ids.length > 0) {
      const categorias = await this.categoriaRepository.find({
        where: {
          id: In(updateReceitaDto.categoria_ids),
        },
      });

      if (categorias.length !== updateReceitaDto.categoria_ids.length) {
        throw new BadRequestException('Uma ou mais categorias não foram encontradas');
      }
    }

    // Validar máximo de 50 receitas FREE ao marcar como FREE
    if (updateReceitaDto.is_free === true && receita.is_free !== true) {
      const freeCount = await this.getFreeRecipesCount();
      if (freeCount >= 50) {
        throw new BadRequestException('Máximo de 50 receitas FREE permitidas. Desmarque outra receita FREE antes de adicionar esta.');
      }
    }

    // Separar categoria_ids do DTO antes de atualizar
    const { categoria_ids, ...updateData } = updateReceitaDto;
    
    // Remover campos undefined/null/vazios explicitamente
    if (updateData.imagem_url === '' || updateData.imagem_url === null || updateData.imagem_url === undefined) {
      delete updateData.imagem_url;
    }
    if (updateData.video_url === '' || updateData.video_url === null || updateData.video_url === undefined) {
      delete updateData.video_url;
    }
    if (updateData.ebook_url === '' || updateData.ebook_url === null || updateData.ebook_url === undefined) {
      delete updateData.ebook_url;
    }

    // Normalizar campos de array (converter de string para array se necessário)
    const arrayFields = ['ingredientes', 'modo_preparo', 'imagens_url', 'tags', 'cuisines'];
    for (const field of arrayFields) {
      if (updateData[field] !== undefined) {
        if (typeof updateData[field] === 'string') {
          // Se for uma string com quebras de linha, dividir por linha
          updateData[field] = (updateData[field] as string)
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');
        } else if (!Array.isArray(updateData[field])) {
          // Se for qualquer outra coisa que não seja array, colocar em um array
          updateData[field] = updateData[field] ? [updateData[field]] : [];
        }
      }
    }

    Object.assign(receita, updateData);
    const saved = await this.receitaRepository.save(receita as any);

    // Atualizar categorias se fornecidas
    if (categoria_ids !== undefined) {
      if (categoria_ids.length > 0) {
        const categorias = await this.categoriaRepository.find({
          where: {
            id: In(categoria_ids),
          },
        });
        saved.categorias = categorias;
      } else {
        saved.categorias = [];
      }
      await this.receitaRepository.save(saved);
    }

    return saved;
  }

  async remove(id: string): Promise<void> {
    const receita = await this.findOne(id);
    receita.ativa = false;
    await this.receitaRepository.save(receita);
  }

  async delete(id: string): Promise<void> {
    const receita = await this.findOne(id);
    await this.receitaRepository.remove(receita);
  }

  async updateAvaliacao(id: string, avaliacao: number, totalAvaliacoes: number): Promise<void> {
    await this.receitaRepository.update(id, {
      avaliacao,
      total_avaliacoes: totalAvaliacoes,
    });
  }
}

