import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LegalService } from './legal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateConsentimentoDto } from './dto/legal.dto';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('privacy-policy')
  getPrivacyPolicy() {
    return {
      content: this.legalService.getPrivacyPolicy(),
      version: '1.0',
      lastUpdated: new Date().toISOString(),
    };
  }

  @Get('terms-of-service')
  getTermsOfService() {
    return {
      content: this.legalService.getTermsOfService(),
      version: '1.0',
      lastUpdated: new Date().toISOString(),
    };
  }

  @Post('consent')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createConsentimento(@Request() req, @Body() dto: CreateConsentimentoDto) {
    return this.legalService.createConsentimento(req.user.id, dto);
  }

  @Get('consents')
  @UseGuards(JwtAuthGuard)
  async getConsentimentos(@Request() req) {
    return this.legalService.getConsentimentos(req.user.id);
  }

  @Get('has-consent/:tipo')
  @UseGuards(JwtAuthGuard)
  async hasConsentimento(@Request() req, @Param('tipo') tipo: string) {
    return {
      hasConsent: await this.legalService.hasConsentimento(req.user.id, tipo as any),
    };
  }
}

