import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avaliacao, TipoAvaliacao } from './entities/avaliacao.entity';
import { CreateAvaliacaoDto, UpdateAvaliacaoDto } from './dto/avaliacao.dto';
import { ReceitasService } from '../receitas/receitas.service';
import { TreinosService } from '../treinos/treinos.service';

@Injectable()
export class AvaliacoesService {
  constructor(
    @InjectRepository(Avaliacao)
    private avaliacaoRepository: Repository<Avaliacao>,
    @Inject(forwardRef(() => ReceitasService))
    private receitasService: ReceitasService,
    @Inject(forwardRef(() => TreinosService))
    private treinosService: TreinosService,
  ) {}

  async create(usuarioId: string, createAvaliacaoDto: CreateAvaliacaoDto): Promise<Avaliacao> {
    // Verificar se o item existe
    if (createAvaliacaoDto.tipo === TipoAvaliacao.RECEITA) {
      await this.receitasService.findOne(createAvaliacaoDto.item_id);
    } else {
      await this.treinosService.findOne(createAvaliacaoDto.item_id);
    }

    // Verificar se já existe avaliação do usuário para este item
    const existing = await this.avaliacaoRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: createAvaliacaoDto.item_id,
        tipo: createAvaliacaoDto.tipo,
      },
    });

    let avaliacao: Avaliacao;
    if (existing) {
      // Atualizar avaliação existente
      existing.nota = createAvaliacaoDto.nota;
      if (createAvaliacaoDto.comentario !== undefined) {
        existing.comentario = createAvaliacaoDto.comentario;
      }
      avaliacao = await this.avaliacaoRepository.save(existing);
    } else {
      // Criar nova avaliação
      avaliacao = this.avaliacaoRepository.create({
        usuario_id: usuarioId,
        item_id: createAvaliacaoDto.item_id,
        tipo: createAvaliacaoDto.tipo,
        nota: createAvaliacaoDto.nota,
        comentario: createAvaliacaoDto.comentario,
      });
      avaliacao = await this.avaliacaoRepository.save(avaliacao);
    }

    // Atualizar média de avaliações do item
    await this.atualizarMediaAvaliacoes(createAvaliacaoDto.item_id, createAvaliacaoDto.tipo);

    return avaliacao;
  }

  async findOne(usuarioId: string, itemId: string, tipo: TipoAvaliacao): Promise<Avaliacao | null> {
    return await this.avaliacaoRepository.findOne({
      where: {
        usuario_id: usuarioId,
        item_id: itemId,
        tipo,
      },
    });
  }

  async update(
    usuarioId: string,
    itemId: string,
    tipo: TipoAvaliacao,
    updateAvaliacaoDto: UpdateAvaliacaoDto,
  ): Promise<Avaliacao> {
    const avaliacao = await this.findOne(usuarioId, itemId, tipo);

    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (updateAvaliacaoDto.nota !== undefined) {
      avaliacao.nota = updateAvaliacaoDto.nota;
    }
    if (updateAvaliacaoDto.comentario !== undefined) {
      avaliacao.comentario = updateAvaliacaoDto.comentario;
    }

    const updated = await this.avaliacaoRepository.save(avaliacao);

    // Atualizar média de avaliações do item
    await this.atualizarMediaAvaliacoes(itemId, tipo);

    return updated;
  }

  async remove(usuarioId: string, itemId: string, tipo: TipoAvaliacao): Promise<void> {
    const avaliacao = await this.findOne(usuarioId, itemId, tipo);

    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    await this.avaliacaoRepository.remove(avaliacao);

    // Atualizar média de avaliações do item
    await this.atualizarMediaAvaliacoes(itemId, tipo);
  }

  private async atualizarMediaAvaliacoes(itemId: string, tipo: TipoAvaliacao): Promise<void> {
    const avaliacoes = await this.avaliacaoRepository.find({
      where: {
        item_id: itemId,
        tipo,
      },
    });

    if (avaliacoes.length === 0) {
      // Se não houver avaliações, definir média como 0
      if (tipo === TipoAvaliacao.RECEITA) {
        await this.receitasService.updateAvaliacao(itemId, 0, 0);
      } else {
        await this.treinosService.updateAvaliacao(itemId, 0, 0);
      }
      return;
    }

    const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    const media = soma / avaliacoes.length;
    const total = avaliacoes.length;

    if (tipo === TipoAvaliacao.RECEITA) {
      await this.receitasService.updateAvaliacao(itemId, media, total);
    } else {
      await this.treinosService.updateAvaliacao(itemId, media, total);
    }
  }
}
