import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AtividadesService } from './atividades.service';
import { CreateAtividadeDto } from './dto/atividade.dto';
import { TipoAtividade } from './entities/atividade.entity';

@Controller('atividades')
@UseGuards(JwtAuthGuard)
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

  @Post()
  async create(@Request() req, @Body() createAtividadeDto: CreateAtividadeDto) {
    return this.atividadesService.create(req.user.sub, createAtividadeDto);
  }

  @Get()
  async findAll(@Request() req, @Query('tipo') tipo?: TipoAtividade) {
    return this.atividadesService.findAll(req.user.sub, tipo);
  }

  @Get('check/:tipo/:itemId')
  async checkFezHoje(
    @Request() req,
    @Param('tipo') tipo: TipoAtividade,
    @Param('itemId') itemId: string,
  ) {
    const fezHoje = await this.atividadesService.checkFezHoje(
      req.user.sub,
      itemId,
      tipo,
    );
    return { fez_hoje: fezHoje };
  }

  @Delete(':tipo/:itemId')
  async remove(
    @Request() req,
    @Param('tipo') tipo: TipoAtividade,
    @Param('itemId') itemId: string,
  ) {
    await this.atividadesService.remove(req.user.sub, itemId, tipo);
    return { message: 'Atividade removida com sucesso' };
  }
}
