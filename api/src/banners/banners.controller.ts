import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { BannersService, UpdateBannersDto } from './banners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findAll() {
    // Retornamos todos ativos (public/mobile)
    return this.bannersService.findAllAtivos();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAllAdmin() {
    return this.bannersService.findAll();
  }

  @Put('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async bulkUpdate(@Body() dto: UpdateBannersDto) {
    return this.bannersService.bulkUpdate(dto);
  }
}
