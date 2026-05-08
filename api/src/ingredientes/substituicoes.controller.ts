import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubstituicoesService } from './substituicoes.service';
import { CreateSubstituicaoDto, CalcularMacrosComSubstituicaoDto } from './dto/substituicao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('substituicoes')
@UseGuards(JwtAuthGuard)
export class SubstituicoesController {
  constructor(private readonly substituicoesService: SubstituicoesService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateSubstituicaoDto) {
    return this.substituicoesService.create(req.user.sub, createDto);
  }

  @Get('receita/:receitaId')
  findByReceita(@Request() req, @Param('receitaId') receitaId: string) {
    return this.substituicoesService.findByUsuario(req.user.sub, receitaId);
  }

  @Get('historico')
  findHistorico(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.substituicoesService.findHistorico(req.user.sub, limitNum);
  }

  @Get('frequentes')
  findFrequentes(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.substituicoesService.findFrequentes(req.user.sub, limitNum);
  }

  @Get('calcular/:receitaId')
  calcularMacros(@Request() req, @Param('receitaId') receitaId: string) {
    return this.substituicoesService.calcularMacrosComSubstituicao(receitaId, req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.substituicoesService.remove(id, req.user.sub);
  }
}

