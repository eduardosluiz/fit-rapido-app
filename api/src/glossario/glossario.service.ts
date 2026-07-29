import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlossarioIngrediente } from './entities/glossario-ingrediente.entity';
import { CreateGlossarioDto } from './dto/create-glossario.dto';
import { UpdateGlossarioDto } from './dto/update-glossario.dto';

@Injectable()
export class GlossarioService {
  constructor(
    @InjectRepository(GlossarioIngrediente)
    private repo: Repository<GlossarioIngrediente>,
  ) {}

  async create(createDto: CreateGlossarioDto): Promise<GlossarioIngrediente> {
    const ingrediente = this.repo.create(createDto);
    return this.repo.save(ingrediente);
  }

  async findAll(): Promise<GlossarioIngrediente[]> {
    return this.repo.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: string): Promise<GlossarioIngrediente> {
    const ingrediente = await this.repo.findOne({ where: { id } });
    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente #${id} não encontrado no glossário`);
    }
    return ingrediente;
  }

  async update(id: string, updateDto: UpdateGlossarioDto): Promise<GlossarioIngrediente> {
    const ingrediente = await this.findOne(id);
    Object.assign(ingrediente, updateDto);
    return this.repo.save(ingrediente);
  }

  async remove(id: string): Promise<void> {
    const ingrediente = await this.findOne(id);
    await this.repo.remove(ingrediente);
  }
}
