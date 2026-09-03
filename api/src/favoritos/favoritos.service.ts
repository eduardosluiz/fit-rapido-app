import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito, TipoFavorito } from './entities/favorito.entity';
import { CreateFavoritoDto } from './dto/favorito.dto';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Favorito)
    private favoritoRepository: Repository<Favorito>,
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

  async findAll(usuarioId: string, tipo?: TipoFavorito): Promise<Array<Favorito & { popularidade: number }>> {
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
    const contagens = await this.favoritoRepository
      .createQueryBuilder('favorito')
      .select('favorito.tipo', 'tipo')
      .addSelect('favorito.item_id', 'item_id')
      .addSelect('COUNT(favorito.id)', 'popularidade')
      .where('favorito.item_id IN (:...itemIds)', { itemIds })
      .groupBy('favorito.tipo')
      .addGroupBy('favorito.item_id')
      .getRawMany<{ tipo: TipoFavorito; item_id: string; popularidade: string }>();

    const popularidadePorItem = new Map(
      contagens.map((item) => [`${item.tipo}:${item.item_id}`, Number(item.popularidade)]),
    );

    return favoritos.map((favorito) => ({
      ...favorito,
      popularidade: popularidadePorItem.get(`${favorito.tipo}:${favorito.item_id}`) || 0,
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

