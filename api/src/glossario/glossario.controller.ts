import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { GlossarioService } from './glossario.service';
import { CreateGlossarioDto } from './dto/create-glossario.dto';
import { UpdateGlossarioDto } from './dto/update-glossario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('glossario')
export class GlossarioController {
  constructor(private readonly glossarioService: GlossarioService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createDto: CreateGlossarioDto) {
    if (req.user?.role !== 'admin' && req.user?.role !== 'personal_trainer') {
      throw new ForbiddenException('Acesso negado');
    }
    return this.glossarioService.create(createDto);
  }

  // Public endpoint for mobile app
  @Get()
  findAll() {
    return this.glossarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.glossarioService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateGlossarioDto) {
    if (req.user?.role !== 'admin' && req.user?.role !== 'personal_trainer') {
      throw new ForbiddenException('Acesso negado');
    }
    return this.glossarioService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    if (req.user?.role !== 'admin' && req.user?.role !== 'personal_trainer') {
      throw new ForbiddenException('Acesso negado');
    }
    return this.glossarioService.remove(id);
  }
}

