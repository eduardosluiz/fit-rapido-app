import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { IAService } from './ia.service';
import { CreateConsultaIADto } from './dto/consulta-ia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ingredientes/ia')
@UseGuards(JwtAuthGuard)
export class IAController {
  constructor(private readonly iaService: IAService) {}

  @Post('consulta')
  async consultar(@Request() req, @Body() createDto: CreateConsultaIADto) {
    return this.iaService.consultarIA(req.user.sub, createDto);
  }

  @Get('consultas')
  async minhasConsultas(@Request() req) {
    return this.iaService.findByUsuario(req.user.sub);
  }

  @Get('consultas/receita/:receitaId')
  async consultasPorReceita(
    @Request() req,
    @Param('receitaId') receitaId: string,
  ) {
    return this.iaService.findByUsuario(req.user.sub, receitaId);
  }

  @Patch('consultas/:id/aplicar')
  async marcarComoAplicada(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.iaService.marcarComoAplicada(id, req.user.sub);
  }
}



