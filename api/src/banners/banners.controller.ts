import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { BannersService, UpdateBannersDto } from './banners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findAll() {
    // Retornamos todos ativos (public/mobile)
    return this.bannersService.findAllAtivos();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async findAllAdmin() {
    return this.bannersService.findAll();
  }

  @Put('bulk')
  @UseGuards(JwtAuthGuard)
  async bulkUpdate(@Body() dto: UpdateBannersDto) {
    return this.bannersService.bulkUpdate(dto);
  }
}
