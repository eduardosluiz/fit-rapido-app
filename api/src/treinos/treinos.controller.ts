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
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { TreinosService } from './treinos.service';
import { CreateTreinoDto, UpdateTreinoDto } from './dto/treino.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtOptionalGuard } from '../auth/guards/jwt-optional.guard';
import { AuthService } from '../auth/auth.service';

@Controller('treinos')
export class TreinosController {
  constructor(
    private readonly treinosService: TreinosService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createTreinoDto: CreateTreinoDto) {
    return this.treinosService.create(createTreinoDto);
  }

  @Get()
  @UseGuards(JwtOptionalGuard) // Guard opcional: valida token se presente, mas não bloqueia se não houver
  async findAll(
    @Request() req: any,
    @Query('categoria') categoriaId?: string,
    @Query('modalidade_id') modalidadeId?: string,
    @Query('search') search?: string,
    @Query('premium') premium?: string,
    @Query('nivel') nivel?: string,
    @Query('incluirInativas') incluirInativas?: string,
    @Query('tipoTreino') tipoTreino?: 'ponto_partida' | 'academia' | 'casa',
    @Query('tipoDica') tipoDica?: 'ajuste_carga' | 'mobilidade' | 'cardio',
    @Query('tipoEquipamentoCasa') tipoEquipamentoCasa?: 'sem_equipamentos' | 'com_halteres' | 'rapido',
    @Query('mostrarPontoPartida') mostrarPontoPartida?: string,
    @Query('apenasAvulsos') apenasAvulsos?: string,
    @Query('nome') nome?: string,
    @Query('categoriaNome') categoriaNome?: string,
    @Query('tempoMaximo') tempoMaximo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Buscar usuário se autenticado
    let user = null;
    if (req.user?.sub) {
      user = await this.authService.findById(req.user.sub);
    }

    return this.treinosService.findAll(
      categoriaId,
      modalidadeId,
      search,
      premium !== undefined ? premium === 'true' : undefined,
      nivel,
      incluirInativas === 'true',
      tipoTreino,
      tipoDica,
      tipoEquipamentoCasa,
      mostrarPontoPartida !== undefined ? mostrarPontoPartida === 'true' : undefined,
      apenasAvulsos === 'true',
      user || undefined,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      nome,
      categoriaNome,
      tempoMaximo ? parseInt(tempoMaximo, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treinosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTreinoDto: UpdateTreinoDto) {
    return this.treinosService.update(id, updateTreinoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.treinosService.remove(id);
  }
}

