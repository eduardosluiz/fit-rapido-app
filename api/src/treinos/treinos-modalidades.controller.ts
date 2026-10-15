import { WorkoutAdminGuard } from './workout-admin.guard';
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
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreinoModalidade } from './entities/treino-modalidade.entity';
import { CreateTreinoModalidadeDto, UpdateTreinoModalidadeDto } from './dto/treino-modalidade.dto';
import { AuthService } from '../auth/auth.service';
import { canAccessTreino } from '../common/helpers/subscription.helper';
import { isFreeWorkout } from './workout-free.helper';

@Controller('treinos-modalidades')
@UseGuards(JwtAuthGuard)
export class TreinosModalidadesController {
  private readonly logger = new Logger(TreinosModalidadesController.name);

  constructor(
    @InjectRepository(TreinoModalidade)
    private readonly repository: Repository<TreinoModalidade>,
    private readonly auth: AuthService,
  ) {}

  @Post()
  @UseGuards(WorkoutAdminGuard)
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
  async findAll(@Request() req: any) {
    const items = await this.repository.find({
      order: { ordem_modalidade: 'ASC', nome: 'ASC' },
      relations: ['treinos']
    });
    return this.present(items, req);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const item = await this.repository.findOne({ where: { id }, relations: ['treinos'] });
    return item ? (await this.present([item], req))[0] : null;
  }

  private async present(items: TreinoModalidade[], req: any) {
    const user = await this.auth.findById(req.user.sub);
    const admin = user && ['admin', 'personal_trainer'].includes(user.role);
    const full = admin || canAccessTreino(user);
    return items.filter(m => admin || m.ativo).map(m => ({ ...m, treinos: (m.treinos || [])
      .filter(t => admin || t.ativa)
      .map(t => {
        const free = isFreeWorkout({ ...t, modalidade: m });
        return full || free ? { ...t, is_free: free } : {
          id: t.id, titulo: t.titulo, nivel: t.nivel, dia_semana: t.dia_semana,
          imagem_capa_url: t.imagem_capa_url, imagem_url: t.imagem_url,
          ordem: t.ordem, ativa: t.ativa, is_free: false, locked: true,
        };
      }) }));
  }

  @Patch(':id')
  @UseGuards(WorkoutAdminGuard)
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
  @UseGuards(WorkoutAdminGuard)
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
