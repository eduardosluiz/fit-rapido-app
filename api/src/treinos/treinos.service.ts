import { Injectable, Inject, forwardRef, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Treino } from './entities/treino.entity';
import { CategoriaTreino } from './entities/categoria-treino.entity';
import { CreateTreinoDto, UpdateTreinoDto } from './dto/treino.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { User, SubscriptionTier, UserRole } from '../auth/entities/user.entity';
import { canAccessTreino } from '../common/helpers/subscription.helper';

@Injectable()
export class TreinosService {
  constructor(
    @InjectRepository(Treino)
    private treinoRepository: Repository<Treino>,
    @InjectRepository(CategoriaTreino)
    private categoriaRepository: Repository<CategoriaTreino>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(createTreinoDto: CreateTreinoDto): Promise<Treino> {
    // Verificar se categorias existem (se fornecidas)
    if (createTreinoDto.categoria_ids && createTreinoDto.categoria_ids.length > 0) {
      const categorias = await this.categoriaRepository.find({
        where: {
          id: In(createTreinoDto.categoria_ids),
        },
      });

      if (categorias.length !== createTreinoDto.categoria_ids.length) {
        throw new BadRequestException('Uma ou mais categorias não foram encontradas');
      }
    }

    // Separar categoria_ids do DTO antes de criar o treino
    const { categoria_ids, ...treinoData } = createTreinoDto;
    const treino = this.treinoRepository.create(treinoData);
    const savedTreino = await this.treinoRepository.save(treino);

    // Associar categorias se fornecidas
    if (categoria_ids && categoria_ids.length > 0) {
      const categorias = await this.categoriaRepository.find({
        where: {
          id: In(categoria_ids),
        },
      });
      savedTreino.categorias = categorias;
      await this.treinoRepository.save(savedTreino);
    }

    // Enviar notificação para todos os usuários se o treino estiver ativo
    if (savedTreino.ativa) {
      try {
        await this.notificationsService.sendToAll(
          '💪 Novo Treino Disponível!',
          `Confira o novo treino: ${savedTreino.titulo}`,
          'treino',
          savedTreino.id, // ID do treino para redirecionamento
        );
      } catch (error) {
        console.error('Erro ao enviar notificação de novo treino:', error);
        // Não falhar a criação do treino se a notificação falhar
      }
    }

    return savedTreino;
  }

  async findAll(
    categoriaId?: string,
    modalidadeId?: string,
    search?: string,
    isPremium?: boolean,
    nivel?: string,
    incluirInativas?: boolean,
    tipoTreino?: 'ponto_partida' | 'academia' | 'casa',
    tipoDica?: 'ajuste_carga' | 'mobilidade' | 'cardio',
    tipoEquipamentoCasa?: 'sem_equipamentos' | 'com_halteres' | 'rapido',
    mostrarPontoPartida?: boolean,
    apenasAvulsos?: boolean,
    user?: any,
    page?: number,
    limit?: number,
    nome?: string,
    categoriaNome?: string,
    tempoMaximo?: number,
  ) {
    if (incluirInativas === undefined) incluirInativas = false;
    
    // IMPORTANTE: Admins sempre veem todos os treinos, independente do plano
    if (user && (user.role === UserRole.ADMIN || String(user.role) === 'admin' || String(user.role) === 'personal_trainer')) {
      // Admin vê tudo, continuar sem filtro de acesso
    } else {
      // Verificar acesso - apenas PREMIUM_FIT pode acessar treinos
      if (user && !canAccessTreino(user)) {
        return []; // Retornar array vazio ao invés de erro para não quebrar a UI
      }

      // Se não há usuário, retornar array vazio (treinos são apenas para assinantes)
      if (!user) {
        return [];
      }
    }
    const queryBuilder = this.treinoRepository
      .createQueryBuilder('treino')
      .leftJoinAndSelect('treino.categorias', 'categorias');

    if (apenasAvulsos) {
      queryBuilder.andWhere('treino.modalidade_id IS NULL');
    }

    if (!incluirInativas) {
      queryBuilder.andWhere('treino.ativa = :ativa', { ativa: true });
    }

    if (categoriaId) {
      queryBuilder
        .innerJoin('treino.categorias', 'categoria')
        .andWhere('categoria.id = :categoriaId', { categoriaId });
    }

    if (modalidadeId) {
      queryBuilder.andWhere('treino.modalidade_id = :modalidadeId', { modalidadeId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(treino.titulo ILIKE :search OR treino.descricao ILIKE :search OR categorias.nome ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (nome) {
      queryBuilder.andWhere('treino.titulo ILIKE :nome', { nome: `%${nome}%` });
    }

    if (categoriaNome) {
      queryBuilder.andWhere('categorias.nome ILIKE :categoriaNome', { categoriaNome: `%${categoriaNome}%` });
    }

    if (tempoMaximo) {
      queryBuilder.andWhere('treino.duracao_minutos <= :tempoMaximo', { tempoMaximo });
    }

    if (isPremium !== undefined) {
      queryBuilder.andWhere('treino.is_premium = :isPremium', { isPremium });
    }

    if (nivel) {
      queryBuilder.andWhere('treino.nivel = :nivel', { nivel });
    }

    if (tipoTreino) {
      queryBuilder.andWhere('treino.tipo_treino = :tipoTreino', { tipoTreino });
    }

    if (tipoDica) {
      queryBuilder.andWhere('treino.tipo_dica = :tipoDica', { tipoDica });
    }

    if (tipoEquipamentoCasa) {
      queryBuilder.andWhere('treino.tipo_equipamento_casa = :tipoEquipamentoCasa', { tipoEquipamentoCasa });
    }

    if (mostrarPontoPartida !== undefined) {
      queryBuilder.andWhere('treino.mostrar_ponto_partida = :mostrarPontoPartida', { mostrarPontoPartida });
    }

    queryBuilder.orderBy('treino.ordem', 'ASC').addOrderBy('treino.created_at', 'DESC');

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Treino> {
    const treino = await this.treinoRepository.findOne({
      where: { id },
      relations: ['categorias'],
    });

    if (!treino) {
      throw new Error('Treino não encontrado');
    }

    return treino;
  }

  async update(id: string, updateTreinoDto: UpdateTreinoDto): Promise<Treino> {
    const treino = await this.findOne(id);

    // Verificar se categorias existem (se fornecidas)
    if (updateTreinoDto.categoria_ids && updateTreinoDto.categoria_ids.length > 0) {
      const categorias = await this.categoriaRepository.find({
        where: {
          id: In(updateTreinoDto.categoria_ids),
        },
      });

      if (categorias.length !== updateTreinoDto.categoria_ids.length) {
        throw new BadRequestException('Uma ou mais categorias não foram encontradas');
      }
    }

    // Separar categoria_ids do DTO antes de atualizar
    const { categoria_ids, ...updateData } = updateTreinoDto;
    await this.treinoRepository.update(id, updateData);

    // Atualizar categorias se fornecidas (sempre atualizar, mesmo se array vazio para remover todas)
    if (categoria_ids !== undefined) {
      if (categoria_ids.length > 0) {
        const categorias = await this.categoriaRepository.find({
          where: {
            id: In(categoria_ids),
          },
        });
        treino.categorias = categorias;
      } else {
        treino.categorias = [];
      }
      await this.treinoRepository.save(treino);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.treinoRepository.delete(id);
  }

  async updateAvaliacao(id: string, avaliacao: number, totalAvaliacoes: number): Promise<void> {
    await this.treinoRepository.update(id, {
      avaliacao,
      total_avaliacoes: totalAvaliacoes,
    });
  }
}

