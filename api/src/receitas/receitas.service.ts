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
import { canAccessRecipe, hasActiveTrial, getEffectiveSubscriptionTier } from '../common/helpers/subscription.helper';
import { IAService } from '../ia/ia.service';

@Injectable()
export class ReceitasService {
  constructor(
    @InjectRepository(Receita)
    private receitaRepository: Repository<Receita>,
    @InjectRepository(CategoriaReceita)
    private categoriaRepository: Repository<CategoriaReceita>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => IAService))
    private iaService: IAService,
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

    // Processar deltas de substituição com IA
    if (receitaData.substituicoes_ingredientes && Array.isArray(receitaData.substituicoes_ingredientes) && receitaData.substituicoes_ingredientes.length > 0) {
      const ingredientesArray = receitaData.ingredientes || [];
      const deltas = await this.iaService.calcularDeltaSubstituicoes(ingredientesArray, receitaData.substituicoes_ingredientes);
      
      // Mesclar os deltas de volta para o array de substituições (que é salvo no jsonb)
      receitaData.substituicoes_ingredientes = receitaData.substituicoes_ingredientes.map((sub: any) => {
        const calculatedDelta = deltas[sub.ingrediente] || deltas[sub.substituto];
        if (calculatedDelta && calculatedDelta.delta) {
          return { ...sub, delta: calculatedDelta.delta };
        }
        return sub;
      });
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
    nome?: string,
    ingrediente?: string,
    isPremium?: boolean,
    dificuldade?: string,
    incluirInativas?: boolean,
    tipoRefeicao?: string,
    cuisine?: string,
    tempoMaximo?: number, // Para filtrar receitas rápidas (ex: 10 minutos)
    proteinasMin?: number, // Quantidade mínima de proteína em gramas
    semLactose?: boolean, // Filtrar receitas sem lactose
    semGluten?: boolean, // Filtrar receitas sem glúten
    lowCarb?: boolean, // Filtrar receitas low carb
    user?: User, // Usuário atual para filtrar por plano
    page?: number,
    limit?: number,
    onlyFree?: boolean,
    summary?: boolean,
    onlyIneditas?: boolean,
    onlyPopulares?: boolean,
    onlyMaisFavoritadas?: boolean,
  ): Promise<any> {
    // Verificar se é admin ANTES de aplicar filtros
    const isAdmin = user && (user.role === UserRole.ADMIN || String(user.role) === 'admin' || String(user.role) === 'personal_trainer');
    // Se for admin, ignorar filtro isPremium - admins devem ver todas as receitas
    if (isAdmin && isPremium !== undefined) {
      console.log(`[DEBUG] ⚠️  Admin detectado - ignorando filtro isPremium=${isPremium}`);
      isPremium = undefined;
    }
    // Usar find() ao invés de queryBuilder para garantir que todas as receitas sejam retornadas
    // O queryBuilder com leftJoin pode estar causando problemas
    const queryBuilder = this.receitaRepository.createQueryBuilder('receita');
    
    if (summary) {
      queryBuilder.select([
        'receita.id',
        'receita.titulo',
        'receita.is_premium',
        'receita.is_free',
        'receita.ativa',
      ]);
    } else {
      queryBuilder
        .select([
          'receita.id',
          'receita.titulo',
          'receita.imagem_url',
          'receita.imagens_url',
          'receita.video_url',
          'receita.video_thumbnail_url',
          'receita.is_inedito',
          'receita.avaliacao',
          'receita.destaque_popular',
          'receita.destaque_favorito',
          'receita.dificuldade',
          'receita.tempo_preparo',
          'receita.calorias',
          'receita.proteinas',
          'receita.carboidratos',
          'receita.is_premium',
          'receita.is_free',
          'receita.ativa',
          'receita.created_at',
        ])
        .leftJoinAndSelect('receita.categorias', 'categorias');
    }

    // Filtrar por ativa apenas se não for para incluir inativas
    if (!isAdmin || !incluirInativas) {
      queryBuilder.where('receita.ativa = :ativa', { ativa: true });
    }

    const present = (receita: Receita) => {
      const locked = !isAdmin && !canAccessRecipe(user || null, receita);
      if (!locked) return { ...receita, locked: false };
      return {
        id: receita.id, titulo: receita.titulo, imagem_url: receita.imagem_url,
        imagens_url: receita.imagens_url, video_thumbnail_url: receita.video_thumbnail_url,
        categorias: receita.categorias, dificuldade: receita.dificuldade,
        tempo_preparo: receita.tempo_preparo, calorias: receita.calorias,
        proteinas: receita.proteinas, carboidratos: receita.carboidratos,
        is_premium: receita.is_premium, is_free: receita.is_free, ativa: receita.ativa,
        is_inedito: receita.is_inedito, avaliacao: receita.avaliacao,
        destaque_popular: receita.destaque_popular, destaque_favorito: receita.destaque_favorito,
        created_at: receita.created_at, locked: true,
      };
    };

    if (categoriaId) {
      queryBuilder
        .innerJoin('receita.categorias', 'categoria')
        .andWhere('categoria.id = :categoriaId', {
          categoriaId,
        });
    }

    if (search) {
      queryBuilder.andWhere(
        '(receita.titulo ILIKE :search OR CAST(receita.ingredientes AS text) ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    if (nome) {
      queryBuilder.andWhere('receita.titulo ILIKE :nome', { nome: `%${nome.trim()}%` });
    }

    if (ingrediente) {
      queryBuilder.andWhere('CAST(receita.ingredientes AS text) ILIKE :ingrediente', {
        ingrediente: `%${ingrediente.trim()}%`,
      });
    }

    if (isPremium !== undefined) {
      queryBuilder.andWhere('receita.is_premium = :isPremium', {
        isPremium,
      });
    }

    if (onlyFree && !isAdmin) {
      queryBuilder.andWhere('receita.is_free = :onlyFreeVal', {
        onlyFreeVal: true,
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
      // O campo é texto e pode conter unidades, vírgulas e intervalos.
      // Em intervalos, usar o limite inferior por porção.
      queryBuilder.andWhere("CAST(SUBSTRING(REPLACE(TRIM(receita.proteinas), ',', '.') FROM '^[0-9]+[.]?[0-9]*') AS numeric) >= :proteinasMin", {
        proteinasMin,
      });
    }

    if (semLactose) {
      queryBuilder.leftJoin('receita.categorias', 'lactoseCategory');
      queryBuilder.andWhere(
        '(receita.titulo ILIKE :semLactose OR lactoseCategory.nome ILIKE :semLactose)',
        { semLactose: '%sem lactose%' },
      );
    }

    if (semGluten) {
      queryBuilder.leftJoin('receita.categorias', 'glutenCategory');
      queryBuilder.andWhere(
        '(receita.titulo ILIKE :semGluten OR receita.titulo ILIKE :semGlutenAccent OR glutenCategory.nome ILIKE :semGluten OR glutenCategory.nome ILIKE :semGlutenAccent)',
        { 
          semGluten: '%sem gluten%', 
          semGlutenAccent: '%sem glúten%'
        },
      );
    }

    if (lowCarb) {
      queryBuilder.andWhere(
        "(CAST(SUBSTRING(REGEXP_REPLACE(REPLACE(TRIM(receita.carboidratos), ',', '.'), '[[:space:]]*[gG][[:space:]]*$', '') FROM '[0-9]+[.]?[0-9]*$') AS numeric) <= :lowCarbMax)",
        { lowCarbMax: 10 },
      );
    }

    if (onlyIneditas) {
      queryBuilder.andWhere('receita.is_inedito = :onlyIneditasVal', { onlyIneditasVal: true });
    }

    if (onlyPopulares) {
      queryBuilder.andWhere('receita.destaque_popular = :onlyPopularesVal', { onlyPopularesVal: true });
    }

    if (hasActiveTrial(user || null) && !canAccessRecipe(user || null, { is_free: false } as Receita) && !isAdmin) {
      queryBuilder.orderBy('receita.is_free', 'DESC');
    }

    if (onlyMaisFavoritadas) {
      // Manter a pagina solicitada pelo aplicativo para não repetir sempre
      // os mesmos itens quando houver mais receitas favoritadas.
      queryBuilder
        .leftJoin(qb => {
          return qb
            .select('f.item_id', 'item_id')
            .addSelect('COUNT(f.id)', 'fav_count')
            .from('favoritos', 'f')
            .where("f.tipo = 'receita'")
            .groupBy('f.item_id');
        }, 'fav_stats', 'fav_stats.item_id = CAST(receita.id AS text)')
        .addSelect('COALESCE(fav_stats.fav_count, 0)', 'favorite_count')
        .andWhere('(receita.destaque_favorito = true OR COALESCE(fav_stats.fav_count, 0) > 0)')
        .addOrderBy('receita.destaque_favorito', 'DESC')
        // Com paginacao, o TypeORM cria uma consulta externa. Ordenar pelo alias
        // selecionado evita referenciar fav_stats fora do escopo dessa consulta.
        .addOrderBy('favorite_count', 'DESC')
        .addOrderBy('receita.created_at', 'DESC');
    } else {
      queryBuilder.addOrderBy('receita.created_at', 'DESC');
    }

    let receitas;
    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
      
      const [receitasList, total] = await queryBuilder.getManyAndCount();
      receitas = receitasList;
      
      return {
        data: receitas.map(present),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      receitas = await queryBuilder.getMany();
    }

    return receitas.map(present);
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

    // Processar deltas de substituição com IA
    if (updateData.substituicoes_ingredientes && Array.isArray(updateData.substituicoes_ingredientes) && updateData.substituicoes_ingredientes.length > 0) {
      // Se não enviou ingredientes na atualização, pegamos da base
      const ingredientesArray = updateData.ingredientes || receita.ingredientes || [];
      const deltas = await this.iaService.calcularDeltaSubstituicoes(ingredientesArray, updateData.substituicoes_ingredientes);
      
      updateData.substituicoes_ingredientes = updateData.substituicoes_ingredientes.map((sub: any) => {
        const calculatedDelta = deltas[sub.ingrediente] || deltas[sub.substituto];
        if (calculatedDelta && calculatedDelta.delta) {
          return { ...sub, delta: calculatedDelta.delta };
        }
        return sub;
      });
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
