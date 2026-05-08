import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { CreateFavoritoDto } from './dto/favorito.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TipoFavorito } from './entities/favorito.entity';

@Controller('favoritos')
@UseGuards(JwtAuthGuard)
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createFavoritoDto: CreateFavoritoDto) {
    return this.favoritosService.create(req.user.sub, createFavoritoDto);
  }

  @Get()
  async findAll(@Request() req, @Query('tipo') tipo?: TipoFavorito) {
    const favoritos = await this.favoritosService.findAll(req.user.sub, tipo);
    return favoritos;
  }

  @Get('check/:tipo/:itemId')
  async checkIsFavorito(
    @Request() req,
    @Param('tipo') tipo: TipoFavorito,
    @Param('itemId') itemId: string,
  ) {
    const isFavorito = await this.favoritosService.checkIsFavorito(
      req.user.sub,
      itemId,
      tipo,
    );
    return { is_favorito: isFavorito };
  }

  @Delete(':tipo/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req,
    @Param('tipo') tipo: TipoFavorito,
    @Param('itemId') itemId: string,
  ) {
    await this.favoritosService.remove(req.user.sub, itemId, tipo);
  }
}

