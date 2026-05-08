import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterTokenDto, SendNotificationDto } from './dto/notification.dto';
import { UserRole } from '../auth/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async registerToken(@Request() req, @Body() dto: RegisterTokenDto) {
    try {
      // Verificar se o usuário está autenticado
      // A estratégia JWT retorna 'sub' como o ID do usuário
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      return await this.notificationsService.registerToken(userId, dto);
    } catch (error) {
      console.error('Erro ao registrar token:', error);
      throw error;
    }
  }

  @Delete('remove-token/:token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeToken(@Request() req, @Param('token') token: string) {
    const userId = req.user?.sub || req.user?.id;
    await this.notificationsService.removeToken(userId, token);
  }

  @Get('tokens')
  @UseGuards(JwtAuthGuard)
  async getTokens(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.notificationsService.getTokensByUser(userId);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Request() req, @Body() dto: SendNotificationDto) {
    // Apenas admin pode enviar notificações
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Apenas administradores podem enviar notificações');
    }
    return this.notificationsService.sendNotification(dto);
  }

  @Post('send-to-user/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sendToUser(@Param('userId') userId: string, @Body() dto: SendNotificationDto) {
    // Apenas admin pode enviar notificações
    if (dto.usuario_id !== userId) {
      throw new Error('Usuário não autorizado');
    }
    return this.notificationsService.sendNotification({ ...dto, usuario_id: userId });
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.notificationsService.getNotificationHistory(userId);
  }

  @Post('mark-as-read/:notificationId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Request() req, @Param('notificationId') notificationId: string) {
    const userId = req.user?.sub || req.user?.id;
    await this.notificationsService.markAsRead(userId, notificationId);
  }
}

