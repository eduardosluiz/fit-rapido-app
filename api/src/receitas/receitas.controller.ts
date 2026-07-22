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
import { ReceitasService } from './receitas.service';
import { MacrosService } from './macros.service';
import { CreateReceitaDto, UpdateReceitaDto } from './dto/receita.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtOptionalGuard } from '../auth/guards/jwt-optional.guard';
import { AuthService } from '../auth/auth.service';

@Controller('receitas')
export class ReceitasController {
  constructor(
    private readonly receitasService: ReceitasService,
    private readonly macrosService: MacrosService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReceitaDto: CreateReceitaDto) {
    return this.receitasService.create(createReceitaDto);
  }

  @Get()
  @UseGuards(JwtOptionalGuard) // Guard opcional: valida token se presente, mas não bloqueia se não houver
  async findAll(
    @Request() req: any,
    @Query('categoria') categoriaId?: string,
    @Query('search') search?: string,
    @Query('nome') nome?: string,
    @Query('ingrediente') ingrediente?: string,
    @Query('premium') isPremium?: string,
    @Query('dificuldade') dificuldade?: string,
    @Query('incluirInativas') incluirInativas?: string,
    @Query('tipoRefeicao') tipoRefeicao?: string,
    @Query('cuisine') cuisine?: string,
    @Query('tempoMaximo') tempoMaximo?: string,
    @Query('proteinasMin') proteinasMin?: string,
    @Query('semLactose') semLactose?: string,
    @Query('lowCarb') lowCarb?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Buscar usuário se autenticado
    let user = null;
    if (req.user?.sub) {
      user = await this.authService.findById(req.user.sub);
      const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';
      const isDaiAdmin = user?.email === 'dai@gmail.com';
      console.log(`[RECEITAS CONTROLLER] Usuário autenticado: ${user?.email}, Role: ${user?.role}, É admin: ${isAdmin}, É dai@gmail.com: ${isDaiAdmin}`);
    } else {
      console.log(`[RECEITAS CONTROLLER] Nenhum usuário autenticado (req.user:`, req.user, `)`);
    }

    const result = await this.receitasService.findAll(
      categoriaId,
      search,
      nome,
      ingrediente,
      isPremium === 'true',
      dificuldade,
      incluirInativas === 'true',
      tipoRefeicao,
      cuisine,
      tempoMaximo ? parseInt(tempoMaximo, 10) : undefined,
      proteinasMin ? parseFloat(proteinasMin) : undefined,
      semLactose === 'true',
      lowCarb === 'true',
      user || undefined,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
    
    const receitasToLog = result.data ? result.data : result;
    console.log(`[RECEITAS CONTROLLER] Retornando ${receitasToLog.length} receitas para o frontend`);
    console.log(`[RECEITAS CONTROLLER] Receitas PREMIUM retornadas: ${receitasToLog.filter(r => r.is_premium === true).length}`);
    console.log(`[RECEITAS CONTROLLER] Receitas FREE retornadas: ${receitasToLog.filter(r => r.is_free === true).length}`);
    
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receitasService.findOne(id);
  }

  @Get(':id/macros')
  calcularMacros(
    @Param('id') id: string,
    @Query('porcoes') porcoes?: string,
  ) {
    const receita = this.receitasService.findOne(id);
    const numeroPorcoes = porcoes ? parseInt(porcoes, 10) : 1;
    return receita.then((r) => {
      const macros = this.macrosService.calcularMacrosPorPorcao(r, numeroPorcoes);
      if (!macros) {
        return { message: 'Receita não possui informações nutricionais' };
      }
      return macros;
    });
  }

  @Post('macros/calcular-diarios')
  calcularMacrosDiarios(@Body() body: {
    peso: number;
    altura: number;
    idade: number;
    genero: 'masculino' | 'feminino';
    nivelAtividade: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
    objetivo: 'perder_peso' | 'manter_peso' | 'ganhar_peso';
  }) {
    return this.macrosService.calcularMacrosDiariosRecomendados(
      body.peso,
      body.altura,
      body.idade,
      body.genero,
      body.nivelAtividade,
      body.objetivo,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateReceitaDto: UpdateReceitaDto) {
    return this.receitasService.update(id, updateReceitaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.receitasService.delete(id);
  }
}

