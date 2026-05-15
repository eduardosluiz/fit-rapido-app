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

    let receitas = await queryBuilder.getMany();
    
    const totalNoBanco = await this.receitaRepository.count({
      where: incluirInativas ? {} : { ativa: true },
    });
    
    if (receitas.length < totalNoBanco) {
      const whereClause = incluirInativas ? {} : { ativa: true };
      const todasReceitas = await this.receitaRepository.find({
        where: whereClause,
        relations: ['categorias'],
        order: { created_at: 'DESC' },
      });
      
      let receitasFiltradas = todasReceitas;
      
      if (categoriaId) {
        receitasFiltradas = receitasFiltradas.filter(r => 
          r.categorias && r.categorias.some(cat => cat.id === categoriaId)
        );
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        receitasFiltradas = receitasFiltradas.filter(r => 
          r.titulo.toLowerCase().includes(searchLower) ||
          r.descricao?.toLowerCase().includes(searchLower)
        );
      }
      
      const isAdmin = user && (user.role === UserRole.ADMIN || String(user.role) === 'admin' || user.email === 'dai@gmail.com');
      if (isPremium !== undefined && !isAdmin) {
        receitasFiltradas = receitasFiltradas.filter(r => r.is_premium === isPremium);
      }
      
      if (dificuldade) {
        receitasFiltradas = receitasFiltradas.filter(r => r.dificuldade === dificuldade);
      }
      
      if (tipoRefeicao) {
        receitasFiltradas = receitasFiltradas.filter(r => r.tipo_refeicao === tipoRefeicao);
      }
      
      if (tempoMaximo) {
        receitasFiltradas = receitasFiltradas.filter(r => r.tempo_preparo <= tempoMaximo);
      }
      
      if (proteinasMin) {
        receitasFiltradas = receitasFiltradas.filter(r => {
          const valor = parseFloat(String(r.proteinas).replace(',', '.'));
          return !isNaN(valor) && valor >= proteinasMin;
        });
      }
      
      if (semLactose) {
        receitasFiltradas = receitasFiltradas.filter(r => 
          r.descricao?.toLowerCase().includes('sem lactose') ||
          r.tags?.some(tag => tag.toLowerCase().includes('sem lactose'))
        );
      }
      
      if (lowCarb) {
        receitasFiltradas = receitasFiltradas.filter(r => {
          const valor = parseFloat(String(r.carboidratos).replace(',', '.'));
          return !isNaN(valor) && valor <= 30;
        });
      }
      
      receitas = receitasFiltradas;
    }

    if (user) {
      const isAdmin = user.role === UserRole.ADMIN || String(user.role) === 'admin';
      const isDaiAdmin = user.email === 'dai@gmail.com';
      
      if (isAdmin || isDaiAdmin) {
        return receitas;
      }

      const tier = user.subscription_tier || SubscriptionTier.NONE;
      const isInTrial = hasActiveTrial(user);

      if (isInTrial) {
        return receitas;
      }

      if (tier === SubscriptionTier.FREE || tier === SubscriptionTier.NONE) {
        return receitas.filter((r) => r.is_free === true);
      }

      if (tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.PREMIUM_FIT) {
        return receitas;
      }

      if (tier === SubscriptionTier.BASIC) {
        return receitas.filter((r) => r.is_premium === false);
      }
    }

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
          updateData[field] = (updateData[field] as string)
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');
        } else if (typeof updateData[field] === 'object' && !Array.isArray(updateData[field])) {
          // Se vier como objeto {"0": "x"}, converter para array real
          updateData[field] = Object.values(updateData[field]);
        } else if (!Array.isArray(updateData[field])) {
          updateData[field] = updateData[field] ? [updateData[field]] : [];
        }
      }
    }

    // Garantir que substituicoes_ingredientes seja um objeto real e não uma string JSON
    if (updateData.substituicoes_ingredientes && typeof updateData.substituicoes_ingredientes === 'string') {
      try {
        updateData.substituicoes_ingredientes = JSON.parse(updateData.substituicoes_ingredientes);
      } catch (e) {
        // Se falhar o parse, mantém como está ou limpa
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

