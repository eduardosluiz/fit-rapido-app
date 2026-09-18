import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito, TipoFavorito } from './entities/favorito.entity';
import { CreateFavoritoDto } from './dto/favorito.dto';
import { Receita } from '../receitas/entities/receita.entity';
import { Treino } from '../treinos/entities/treino.entity';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Favorito)
    private favoritoRepository: Repository<Favorito>,
    @InjectRepository(Receita)
    private receitaRepository: Repository<Receita>,
    @InjectRepository(Treino)
    private treinoRepository: Repository<Treino>,
  ) {}

  async create(usuarioId: string, createFavoritoDto: CreateFavoritoDto): Promise<Favorito> {
    // Verificar se já existe
    const existing = await this.favoritoRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: createFavoritoDto.item_id,
        tipo: createFavoritoDto.tipo,
      },
    });

    if (existing) {
      throw new ConflictException('Item já está nos favoritos');
    }

    const favorito = this.favoritoRepository.create({
      usuario_id: usuarioId,
      item_id: createFavoritoDto.item_id,
      tipo: createFavoritoDto.tipo,
    });

    return await this.favoritoRepository.save(favorito);
  }

  async findAll(usuarioId: string, tipo?: TipoFavorito): Promise<Array<Favorito & {
    popularidade: number;
    receita?: Receita;
    treino?: Treino;
  }>> {
    const where: any = { usuario_id: usuarioId };
    if (tipo) {
      where.tipo = tipo;
    }

    const favoritos = await this.favoritoRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    if (favoritos.length === 0) return [];

    const itemIds = [...new Set(favoritos.map((favorito) => favorito.item_id))];
    const contagensPromise = this.favoritoRepository
      .createQueryBuilder('favorito')
      .select('favorito.tipo', 'tipo')
      .addSelect('favorito.item_id', 'item_id')
      .addSelect('COUNT(favorito.id)', 'popularidade')
      .where('favorito.item_id IN (:...itemIds)', { itemIds })
      .groupBy('favorito.tipo')
      .addGroupBy('favorito.item_id')
      .getRawMany<{ tipo: TipoFavorito; item_id: string; popularidade: string }>();

    const receitaIds = favoritos
      .filter((favorito) => favorito.tipo === TipoFavorito.RECEITA)
      .map((favorito) => favorito.item_id);
    const treinoIds = favoritos
      .filter((favorito) => favorito.tipo === TipoFavorito.TREINO)
      .map((favorito) => favorito.item_id);

    const [contagens, receitas, treinos] = await Promise.all([
      contagensPromise,
      receitaIds.length
        ? this.receitaRepository.createQueryBuilder('receita')
          .leftJoinAndSelect('receita.categorias', 'categorias')
          .select([
            'receita.id', 'receita.titulo', 'receita.ingredientes', 'receita.imagem_url',
            'receita.imagens_url', 'receita.video_thumbnail_url', 'receita.is_inedito',
            'receita.avaliacao', 'receita.total_avaliacoes', 'receita.dificuldade',
            'receita.tempo_preparo', 'receita.calorias', 'receita.is_premium',
            'receita.is_free', 'receita.ativa', 'categorias',
          ])
          .where('receita.id IN (:...receitaIds)', { receitaIds })
          .andWhere('receita.ativa = :receitaAtiva', { receitaAtiva: true })
          .getMany()
        : Promise.resolve([]),
      treinoIds.length
        ? this.treinoRepository.createQueryBuilder('treino')
          .leftJoinAndSelect('treino.categorias', 'categoriasTreino')
          .leftJoinAndSelect('treino.modalidade', 'modalidade')
          .select([
            'treino.id', 'treino.titulo', 'treino.imagem_url', 'treino.imagem_capa_url',
            'treino.nivel', 'treino.duracao_minutos', 'treino.is_premium', 'treino.ativa',
            'treino.avaliacao', 'treino.total_avaliacoes', 'treino.modalidade_id',
            'categoriasTreino', 'modalidade',
          ])
          .where('treino.id IN (:...treinoIds)', { treinoIds })
          .andWhere('treino.ativa = :treinoAtiva', { treinoAtiva: true })
          .getMany()
        : Promise.resolve([]),
    ]);

    const popularidadePorItem = new Map(
      contagens.map((item) => [`${item.tipo}:${item.item_id}`, Number(item.popularidade)]),
    );
    const receitasPorId = new Map(receitas.map((receita) => [receita.id, receita]));
    const treinosPorId = new Map(treinos.map((treino) => [treino.id, treino]));

    return favoritos.map((favorito) => ({
      ...favorito,
      popularidade: popularidadePorItem.get(`${favorito.tipo}:${favorito.item_id}`) || 0,
      ...(favorito.tipo === TipoFavorito.RECEITA
        ? { receita: receitasPorId.get(favorito.item_id) }
        : { treino: treinosPorId.get(favorito.item_id) }),
    }));
  }

  async findOne(usuarioId: string, itemId: string, tipo: TipoFavorito): Promise<Favorito | null> {
    return await this.favoritoRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: itemId,
        tipo,
      },
    });
  }

  async remove(usuarioId: string, itemId: string, tipo: TipoFavorito): Promise<void> {
    const favorito = await this.favoritoRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: itemId,
        tipo,
      },
    });

    if (favorito) {
      await this.favoritoRepository.remove(favorito);
    }
  }

  async checkIsFavorito(usuarioId: string, itemId: string, tipo: TipoFavorito): Promise<boolean> {
    const favorito = await this.favoritoRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: itemId,
        tipo,
      },
    });
    return !!favorito;
  }

  async removeAllByItemId(itemId: string): Promise<void> {
    await this.favoritoRepository.delete({ item_id: itemId });
  }
}

