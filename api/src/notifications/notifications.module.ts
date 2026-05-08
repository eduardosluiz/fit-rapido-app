import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationToken } from './entities/notification-token.entity';
import { NotificationHistory } from './entities/notification-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationToken, NotificationHistory])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

