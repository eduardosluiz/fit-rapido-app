import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreinoModalidade } from './entities/treino-modalidade.entity';
import { CreateTreinoModalidadeDto, UpdateTreinoModalidadeDto } from './dto/treino-modalidade.dto';

@Controller('treinos-modalidades')
@UseGuards(JwtAuthGuard)
export class TreinosModalidadesController {
  private readonly logger = new Logger(TreinosModalidadesController.name);

  constructor(
    @InjectRepository(TreinoModalidade)
    private readonly repository: Repository<TreinoModalidade>,
  ) {}

  @Post()
  async create(@Body() data: CreateTreinoModalidadeDto) {
    try {
      const modalidade = this.repository.create(data);
      return await this.repository.save(modalidade);
    } catch (error) {
      this.logger.error(`Erro ao criar modalidade: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erro ao criar modalidade');
    }
  }

  @Get()
  async findAll() {
    return this.repository.find({
      order: { ordem: 'ASC', nome: 'ASC' },
      relations: ['treinos']
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.repository.findOne({ where: { id }, relations: ['treinos'] });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateTreinoModalidadeDto) {
    try {
      this.logger.log(`Atualizando modalidade ${id} com dados: ${JSON.stringify(data)}`);
      await this.repository.update(id, data);
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Erro ao atualizar modalidade ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Erro ao atualizar modalidade: ${error.message}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      // Deletar primeiro os treinos associados (vídeos)
      await this.repository.manager
        .createQueryBuilder()
        .delete()
        .from('treinos')
        .where('modalidade_id = :id', { id })
        .execute();

      await this.repository.delete(id);
      return { message: 'Modalidade removida com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao remover modalidade ${id}: ${error.message}`);
      throw new InternalServerErrorException('Erro ao remover modalidade');
    }
  }
}
