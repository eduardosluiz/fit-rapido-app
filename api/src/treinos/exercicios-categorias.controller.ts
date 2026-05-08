import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExercicioCategoria } from './entities/exercicio-categoria.entity';

@Controller('exercicios-categorias')
@UseGuards(JwtAuthGuard)
export class ExerciciosCategoriasController {
  constructor(
    @InjectRepository(ExercicioCategoria)
    private readonly repository: Repository<ExercicioCategoria>,
  ) {}

  @Post()
  async create(@Body() data: { nome: string }) {
    const categoria = this.repository.create({
      nome: data.nome.toLowerCase().trim()
    });
    return this.repository.save(categoria);
  }

  @Get()
  async findAll() {
    return this.repository.find({
      order: { nome: 'ASC' }
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repository.delete(id);
    return { message: 'Categoria removida' };
  }
}
