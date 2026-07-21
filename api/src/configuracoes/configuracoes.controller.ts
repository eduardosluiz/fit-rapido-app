import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ConfiguracoesService } from './configuracoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Get('public/:chave')
  async getPublicValue(@Param('chave') chave: string) {
    const valor = await this.configuracoesService.getValue(chave);
    return { chave, valor };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':chave')
  async getValue(@Param('chave') chave: string) {
    const valor = await this.configuracoesService.getValue(chave);
    return { chave, valor };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':chave')
  async setValue(
    @Param('chave') chave: string,
    @Body('valor') valor: string,
  ) {
    const configuracao = await this.configuracoesService.setValue(chave, valor);
    return { success: true, data: configuracao };
  }
}
