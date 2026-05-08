import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaReceita } from './entities/categoria-receita.entity';
import {
  CreateCategoriaReceitaDto,
  UpdateCategoriaReceitaDto,
} from './dto/categoria-receita.dto';

@Injectable()
export class CategoriasReceitasService {
  constructor(
    @InjectRepository(CategoriaReceita)
    private categoriaRepository: Repository<CategoriaReceita>,
  ) {}

  async create(
    createCategoriaDto: CreateCategoriaReceitaDto,
  ): Promise<CategoriaReceita> {
    // Verificar se slug já existe
    const existing = await this.categoriaRepository.findOne({
      where: [{ slug: createCategoriaDto.slug }, { nome: createCategoriaDto.nome }],
    });

    if (existing) {
      throw new BadRequestException('Categoria com este nome ou slug já existe');
    }

    const categoria = this.categoriaRepository.create(createCategoriaDto);
    return await this.categoriaRepository.save(categoria);
  }

  async findAll(): Promise<CategoriaReceita[]> {
    return await this.categoriaRepository.find({
      where: { ativa: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CategoriaReceita> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: ['receitas'],
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return categoria;
  }

  async findBySlug(slug: string): Promise<CategoriaReceita> {
    const categoria = await this.categoriaRepository.findOne({
      where: { slug },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return categoria;
  }

  async update(
    id: string,
    updateCategoriaDto: UpdateCategoriaReceitaDto,
  ): Promise<CategoriaReceita> {
    const categoria = await this.findOne(id);

    // Verificar se slug já existe em outra categoria
    if (updateCategoriaDto.slug) {
      const existing = await this.categoriaRepository.findOne({
        where: { slug: updateCategoriaDto.slug },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Slug já está em uso');
      }
    }

    Object.assign(categoria, updateCategoriaDto);
    return await this.categoriaRepository.save(categoria);
  }

  async remove(id: string): Promise<void> {
    const categoria = await this.findOne(id);
    categoria.ativa = false;
    await this.categoriaRepository.save(categoria);
  }

  async delete(id: string): Promise<void> {
    const categoria = await this.findOne(id);
    await this.categoriaRepository.remove(categoria);
  }
}

