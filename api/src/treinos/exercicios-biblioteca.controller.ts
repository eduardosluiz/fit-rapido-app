import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { ExercicioBiblioteca } from './entities/exercicio-biblioteca.entity';

@Controller('exercicios-biblioteca')
@UseGuards(JwtAuthGuard)
export class ExerciciosBibliotecaController {
  constructor(
    @InjectRepository(ExercicioBiblioteca)
    private readonly repository: Repository<ExercicioBiblioteca>,
  ) {}

  @Post()
  async create(@Body() data: Partial<ExercicioBiblioteca>) {
    const exercicio = this.repository.create(data);
    return this.repository.save(exercicio);
  }

  @Get()
  async findAll(
    @Query('grupo') grupo?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    const where: FindOptionsWhere<ExercicioBiblioteca> = {};
    
    // Filtro por categoria (grupo)
    if (grupo && grupo !== 'undefined' && grupo !== 'null' && grupo !== '') {
      where.categoria = ILike(grupo);
    }

    // Busca por nome do exercício
    if (search && search.trim() !== '') {
      where.nome = ILike(`%${search.trim()}%`);
    }
    
    const [items, total] = await this.repository.findAndCount({
      where,
      order: { nome: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit)
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.repository.findOne({ where: { id } });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repository.delete(id);
    return { message: 'Excluído com sucesso' };
  }
}
