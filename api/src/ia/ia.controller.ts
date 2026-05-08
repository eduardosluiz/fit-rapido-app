import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { IAService } from './ia.service';
import { ReceitasService } from '../receitas/receitas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ia')
export class IAController {
  constructor(
    private readonly iaService: IAService,
    private readonly receitasService: ReceitasService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat-ingredientes/:recipeId')
  async chatIngredientes(
    @Param('recipeId') recipeId: string,
    @Body('pergunta') pergunta: string,
  ) {
    const receita = await this.receitasService.findOne(recipeId);
    return this.iaService.responderDuvidaIngredientes(pergunta, receita);
  }
}
