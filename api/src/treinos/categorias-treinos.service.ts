import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaTreino } from './entities/categoria-treino.entity';
import { CreateCategoriaTreinoDto, UpdateCategoriaTreinoDto } from './dto/categoria-treino.dto';

@Injectable()
export class CategoriasTreinosService {
  constructor(
    @InjectRepository(CategoriaTreino)
    private categoriaRepository: Repository<CategoriaTreino>,
  ) {}

  async create(createDto: CreateCategoriaTreinoDto): Promise<CategoriaTreino> {
    const categoria = this.categoriaRepository.create(createDto);
    return await this.categoriaRepository.save(categoria);
  }

  async findAll(): Promise<CategoriaTreino[]> {
    return await this.categoriaRepository.find({
      where: { ativa: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CategoriaTreino> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }
    return categoria;
  }

  async update(id: string, updateDto: UpdateCategoriaTreinoDto): Promise<CategoriaTreino> {
    await this.categoriaRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.categoriaRepository.delete(id);
  }
}

