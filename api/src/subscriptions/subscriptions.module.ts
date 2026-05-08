import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionPeriodService } from './subscription-period.service';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionDiscount } from './entities/subscription-discount.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, SubscriptionDiscount, User])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionPeriodService],
  exports: [SubscriptionsService, SubscriptionPeriodService],
})
export class SubscriptionsModule {}

