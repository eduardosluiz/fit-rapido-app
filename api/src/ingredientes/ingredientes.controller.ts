import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { IngredientesService } from './ingredientes.service';
import { CreateIngredienteDto, UpdateIngredienteDto } from './dto/ingrediente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ingredientes')
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createIngredienteDto: CreateIngredienteDto) {
    return this.ingredientesService.create(createIngredienteDto);
  }

  @Get()
  findAll(@Query('ativo') ativo?: string) {
    const ativoBool = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.ingredientesService.findAll(ativoBool);
  }

  @Get('search')
  search(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    return this.ingredientesService.search(query.trim());
  }

  @Get('search/advanced')
  searchAdvanced(@Query('q') query: string, @Query('limit') limit?: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.ingredientesService.searchAdvanced(query.trim(), limitNum);
  }

  @Get('buscar-similar')
  async buscarIngredienteSimilar(@Query('texto') texto: string) {
    if (!texto || texto.trim().length < 2) {
      return null;
    }
    console.log(`🔍 API: Buscando ingrediente similar para: "${texto}"`);
    const resultado = await this.ingredientesService.buscarIngredienteSimilar(texto.trim());
    console.log(`🔍 API: Resultado da busca:`, resultado ? `${resultado.nome} (${resultado.id})` : 'não encontrado');
    return resultado;
  }

  @Get('sugerir-substitutos/:id')
  sugerirSubstitutos(@Param('id') id: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ingredientesService.sugerirSubstitutos(id, limitNum);
  }

  @Get('validar-compatibilidade/:originalId/:substitutoId')
  async validarCompatibilidade(
    @Param('originalId') originalId: string,
    @Param('substitutoId') substitutoId: string,
  ) {
    const [original, substituto] = await Promise.all([
      this.ingredientesService.findOne(originalId),
      this.ingredientesService.findOne(substitutoId),
    ]);

    if (!original) {
      throw new NotFoundException('Ingrediente original não encontrado');
    }

    if (!substituto) {
      throw new NotFoundException('Ingrediente substituto não encontrado');
    }

    return this.ingredientesService.validarCompatibilidade(original, substituto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateIngredienteDto: UpdateIngredienteDto) {
    return this.ingredientesService.update(id, updateIngredienteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.ingredientesService.remove(id);
  }
}

