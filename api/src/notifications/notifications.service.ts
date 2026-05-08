import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Or } from 'typeorm';
import { NotificationToken, Plataforma } from './entities/notification-token.entity';
import { NotificationHistory } from './entities/notification-history.entity';
import { RegisterTokenDto, SendNotificationDto } from './dto/notification.dto';
// TODO: Importar Firebase Admin quando configurado
// import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationToken)
    private tokenRepository: Repository<NotificationToken>,
    @InjectRepository(NotificationHistory)
    private historyRepository: Repository<NotificationHistory>,
  ) {}

  async registerToken(usuarioId: string, dto: RegisterTokenDto): Promise<NotificationToken> {
    // Verificar se token já existe
    const existingToken = await this.tokenRepository.findOne({
      where: {
        usuario_id: usuarioId,
        token: dto.token,
        plataforma: dto.plataforma,
      },
    });

    if (existingToken) {
      // Atualizar se já existe
      existingToken.ativo = true;
      return this.tokenRepository.save(existingToken);
    }

    // Criar novo token
    const token = this.tokenRepository.create({
      usuario_id: usuarioId,
      token: dto.token,
      plataforma: dto.plataforma,
      ativo: true,
    });

    return this.tokenRepository.save(token);
  }

  async removeToken(usuarioId: string, token: string): Promise<void> {
    await this.tokenRepository.update(
      {
        usuario_id: usuarioId,
        token,
      },
      {
        ativo: false,
      },
    );
  }

  async getTokensByUser(usuarioId: string): Promise<NotificationToken[]> {
    return this.tokenRepository.find({
      where: {
        usuario_id: usuarioId,
        ativo: true,
      },
    });
  }

  async sendNotification(dto: SendNotificationDto): Promise<{ sent: number; failed: number }> {
    // TODO: Implementar envio real com Firebase quando configurado
    console.log('Sending notification (mock):', {
      title: dto.title,
      body: dto.body,
      to: dto.usuario_id || dto.usuario_ids,
    });

    let tokens: NotificationToken[] = [];

    if (dto.usuario_id) {
      tokens = await this.getTokensByUser(dto.usuario_id);
    } else if (dto.usuario_ids && dto.usuario_ids.length > 0) {
      tokens = await this.tokenRepository.find({
        where: dto.usuario_ids.map((id) => ({
          usuario_id: id,
          ativo: true,
        })),
      });
    }

    // TODO: Enviar notificação real via Firebase
    // const message = {
    //   notification: {
    //     title: dto.title,
    //     body: dto.body,
    //   },
    //   data: dto.data ? JSON.parse(dto.data) : {},
    //   tokens: tokens.map((t) => t.token),
    // };
    // const response = await admin.messaging().sendEachForMulticast(message);

    // Por enquanto, retornar mock
    return {
      sent: tokens.length,
      failed: 0,
    };
  }

  async sendToAll(title: string, body: string, tipo: string = 'geral', itemId?: string): Promise<{ sent: number; failed: number }> {
    const allTokens = await this.tokenRepository.find({
      where: { ativo: true },
    });

    // Salvar notificação no histórico para todos os usuários
    const notification = this.historyRepository.create({
      usuario_id: null, // null = para todos
      titulo: title,
      mensagem: body,
      tipo: tipo,
      item_id: itemId || null, // ID do item relacionado (receita ou treino)
      lida: false,
    });
    const savedNotification = await this.historyRepository.save(notification);
    console.log('Notificação salva no histórico:', {
      id: savedNotification.id,
      titulo: savedNotification.titulo,
      tipo: savedNotification.tipo,
      item_id: savedNotification.item_id,
    });

    // TODO: Implementar envio real
    console.log(`Sending notification to all users (mock): ${allTokens.length} tokens`);

    return {
      sent: allTokens.length,
      failed: 0,
    };
  }

  async getNotificationHistory(usuarioId: string): Promise<NotificationHistory[]> {
    // Buscar notificações do usuário específico e notificações gerais (usuario_id = null)
    // Usar IsNull() do TypeORM para buscar corretamente valores null
    const notifications = await this.historyRepository.find({
      where: [
        { usuario_id: usuarioId },
        { usuario_id: IsNull() }, // Notificações para todos (usuario_id = null)
      ],
      order: { created_at: 'DESC' },
      take: 50, // Limitar a 50 notificações mais recentes
    });
    console.log(`Histórico de notificações para usuário ${usuarioId}:`, notifications.length, 'notificações encontradas');
    if (notifications.length > 0) {
      console.log('Primeira notificação:', {
        id: notifications[0].id,
        titulo: notifications[0].titulo,
        tipo: notifications[0].tipo,
        item_id: notifications[0].item_id,
        usuario_id: notifications[0].usuario_id,
      });
    }
    return notifications;
  }

  async markAsRead(usuarioId: string, notificationId: string): Promise<void> {
    await this.historyRepository.update(
      {
        id: notificationId,
        usuario_id: usuarioId,
      },
      {
        lida: true,
      },
    );
  }
}

