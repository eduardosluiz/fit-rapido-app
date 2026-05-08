import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Atividade, TipoAtividade } from './entities/atividade.entity';
import { CreateAtividadeDto } from './dto/atividade.dto';

@Injectable()
export class AtividadesService {
  constructor(
    @InjectRepository(Atividade)
    private atividadeRepository: Repository<Atividade>,
  ) {}

  async create(usuarioId: string, createAtividadeDto: CreateAtividadeDto): Promise<Atividade> {
    const data = createAtividadeDto.data 
      ? new Date(createAtividadeDto.data) 
      : new Date();
    
    // Normalizar data para apenas dia (sem hora)
    const dataNormalizada = new Date(data.getFullYear(), data.getMonth(), data.getDate());

    // Verificar se já existe atividade para o mesmo item no mesmo dia
    const existing = await this.atividadeRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: createAtividadeDto.item_id,
        tipo: createAtividadeDto.tipo,
        data: dataNormalizada,
      },
    });

    if (existing) {
      // Se já existe, retornar a existente (idempotente)
      return existing;
    }

    const atividade = this.atividadeRepository.create({
      usuario_id: usuarioId,
      item_id: createAtividadeDto.item_id,
      tipo: createAtividadeDto.tipo,
      data: dataNormalizada,
    });

    return await this.atividadeRepository.save(atividade);
  }

  async findAll(usuarioId: string, tipo?: TipoAtividade): Promise<Atividade[]> {
    const where: any = { usuario_id: usuarioId };
    if (tipo) {
      where.tipo = tipo;
    }

    return await this.atividadeRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async checkFezHoje(usuarioId: string, itemId: string, tipo: TipoAtividade): Promise<boolean> {
    const hoje = new Date();
    const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    const atividade = await this.atividadeRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: itemId,
        tipo,
        data: hojeNormalizado,
      },
    });

    return !!atividade;
  }

  async remove(usuarioId: string, itemId: string, tipo: TipoAtividade): Promise<void> {
    const hoje = new Date();
    const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    const atividade = await this.atividadeRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: itemId,
        tipo,
        data: hojeNormalizado,
      },
    });

    if (!atividade) {
      throw new NotFoundException('Atividade não encontrada');
    }

    await this.atividadeRepository.remove(atividade);
  }
}
