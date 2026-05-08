import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReceitaIngredientesService } from './receita-ingredientes.service';
import { CreateReceitaIngredienteDto, UpdateReceitaIngredienteDto } from './dto/receita-ingrediente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('receita-ingredientes')
@UseGuards(JwtAuthGuard)
export class ReceitaIngredientesController {
  constructor(
    private readonly receitaIngredientesService: ReceitaIngredientesService,
  ) {}

  @Post()
  create(@Body() createDto: CreateReceitaIngredienteDto) {
    return this.receitaIngredientesService.create(createDto);
  }

  @Get('receita/:receitaId')
  findByReceita(@Param('receitaId') receitaId: string) {
    return this.receitaIngredientesService.findByReceita(receitaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receitaIngredientesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateReceitaIngredienteDto) {
    return this.receitaIngredientesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receitaIngredientesService.remove(id);
  }
}

