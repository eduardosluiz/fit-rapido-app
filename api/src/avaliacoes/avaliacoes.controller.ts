import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto, UpdateAvaliacaoDto } from './dto/avaliacao.dto';
import { TipoAvaliacao } from './entities/avaliacao.entity';

@Controller('avaliacoes')
@UseGuards(JwtAuthGuard)
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  async create(@Request() req, @Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacoesService.create(req.user.sub, createAvaliacaoDto);
  }

  @Get(':tipo/:itemId')
  async findOne(
    @Request() req,
    @Param('tipo') tipo: TipoAvaliacao,
    @Param('itemId') itemId: string,
  ) {
    const avaliacao = await this.avaliacoesService.findOne(
      req.user.sub,
      itemId,
      tipo,
    );
    return avaliacao || { nota: 0 };
  }

  @Put(':tipo/:itemId')
  async update(
    @Request() req,
    @Param('tipo') tipo: TipoAvaliacao,
    @Param('itemId') itemId: string,
    @Body() updateAvaliacaoDto: UpdateAvaliacaoDto,
  ) {
    return this.avaliacoesService.update(
      req.user.sub,
      itemId,
      tipo,
      updateAvaliacaoDto,
    );
  }

  @Delete(':tipo/:itemId')
  async remove(
    @Request() req,
    @Param('tipo') tipo: TipoAvaliacao,
    @Param('itemId') itemId: string,
  ) {
    await this.avaliacoesService.remove(req.user.sub, itemId, tipo);
    return { message: 'Avaliação removida com sucesso' };
  }
}
