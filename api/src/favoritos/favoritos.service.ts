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

  async findAll(usuarioId: string, tipo?: TipoFavorito): Promise<Favorito[]> {
    const where: any = { usuario_id: usuarioId };
    if (tipo) {
      where.tipo = tipo;
    }

    return await this.favoritoRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
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

    if (!favorito) {
      throw new NotFoundException('Favorito não encontrado');
    }

    await this.favoritoRepository.remove(favorito);
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
}

