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
    page?: number,
    limit?: number,
  ): Promise<any> {
    // Verificar se é admin ANTES de aplicar filtros
    const isAdmin = user && (user.role === UserRole.ADMIN || String(user.role) === 'admin' || String(user.role) === 'personal_trainer' || user.email === 'dai@gmail.com');
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

    let receitas;
    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
      
      const [receitasList, total] = await queryBuilder.getManyAndCount();
      receitas = receitasList;
      
      let resultReceitas = receitas;

      if (user) {
        const isAdmin = user.role === UserRole.ADMIN || String(user.role) === 'admin' || String(user.role) === 'personal_trainer';
        const isDaiAdmin = user.email === 'dai@gmail.com';
        
        if (!isAdmin && !isDaiAdmin) {
          const tier = user.subscription_tier || SubscriptionTier.NONE;
          const isInTrial = hasActiveTrial(user);

          if (!isInTrial) {
            if (tier === SubscriptionTier.FREE || tier === SubscriptionTier.NONE) {
              resultReceitas = receitas.filter((r) => r.is_free === true);
            } else if (tier === SubscriptionTier.BASIC) {
              resultReceitas = receitas.filter((r) => r.is_premium === false);
            }
          }
        }
      } else {
        resultReceitas = receitas.filter((r) => r.is_free === true);
      }

      return {
        data: resultReceitas,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      receitas = await queryBuilder.getMany();
    }

    let resultReceitas = receitas;

    // Logica fallback (sem paginação requisitada)
    if (user) {
      const isAdmin = user.role === UserRole.ADMIN || String(user.role) === 'admin' || String(user.role) === 'personal_trainer';
      const isDaiAdmin = user.email === 'dai@gmail.com';
      
      if (!isAdmin && !isDaiAdmin) {
        const tier = user.subscription_tier || SubscriptionTier.NONE;
        const isInTrial = hasActiveTrial(user);

        if (!isInTrial) {
          if (tier === SubscriptionTier.FREE || tier === SubscriptionTier.NONE) {
            resultReceitas = receitas.filter((r) => r.is_free === true);
          } else if (tier === SubscriptionTier.BASIC) {
            resultReceitas = receitas.filter((r) => r.is_premium === false);
          }
        }
      }
    } else {
      resultReceitas = receitas.filter((r) => r.is_free === true);
    }

    return resultReceitas;
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

