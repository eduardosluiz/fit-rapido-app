import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriasTreinosService } from './categorias-treinos.service';
import { CreateCategoriaTreinoDto, UpdateCategoriaTreinoDto } from './dto/categoria-treino.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categorias-treinos')
export class CategoriasTreinosController {
  constructor(private readonly categoriasService: CategoriasTreinosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateCategoriaTreinoDto) {
    return this.categoriasService.create(createDto);
  }

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateCategoriaTreinoDto) {
    return this.categoriasService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(id);
  }
}

