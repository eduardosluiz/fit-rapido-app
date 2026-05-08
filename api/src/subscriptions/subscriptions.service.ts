import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { User, SubscriptionTier } from '../auth/entities/user.entity';
import { SubscriptionPeriod } from './entities/subscription-period.entity';
import { SubscriptionPeriodService } from './subscription-period.service';
import {
  CreateSubscriptionDto,
  ValidateIosReceiptDto,
  ValidateAndroidPurchaseDto,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private periodService: SubscriptionPeriodService,
  ) {}

  async create(usuarioId: string, createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Cancelar assinaturas anteriores ativas
    await this.cancelActiveSubscriptions(usuarioId);

    // Calcular data de expiração baseado no período
    const dataInicio = new Date();
    const dataFim = new Date();
    
    const periodo = createSubscriptionDto.periodo || SubscriptionPeriod.MONTHLY;
    const meses = this.periodService.getPeriodInMonths(periodo);
    dataFim.setMonth(dataFim.getMonth() + meses);

    const subscription = this.subscriptionRepository.create({
      usuario_id: usuarioId,
      plano: createSubscriptionDto.plano,
      periodo: periodo,
      data_inicio: dataInicio,
      data_fim: dataFim,
      status: SubscriptionStatus.ATIVA,
      receipt_ios: createSubscriptionDto.receipt_ios,
      receipt_android: createSubscriptionDto.receipt_android,
      transaction_id: createSubscriptionDto.transaction_id,
      original_transaction_id: createSubscriptionDto.original_transaction_id,
      plataforma: createSubscriptionDto.plataforma,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    // Atualizar usuário
    await this.userRepository.update(usuarioId, {
      subscription_tier: createSubscriptionDto.plano,
      subscription_expires_at: dataFim,
      subscription_receipt: createSubscriptionDto.receipt_ios || createSubscriptionDto.receipt_android,
    });

    return savedSubscription;
  }

  async validateIosReceipt(usuarioId: string, dto: ValidateIosReceiptDto): Promise<Subscription> {
    // TODO: Implementar validação real com Apple quando tiver conta de desenvolvedor
    // Por enquanto, validação mock
    console.log('Validating iOS receipt (mock):', dto.receipt.substring(0, 50));

    // Simular validação bem-sucedida
    const plano = SubscriptionTier.PREMIUM; // Assumir premium por padrão

    return this.create(usuarioId, {
      plano,
      receipt_ios: dto.receipt,
      transaction_id: dto.transaction_id,
      plataforma: 'ios',
    });
  }

  async validateAndroidPurchase(usuarioId: string, dto: ValidateAndroidPurchaseDto): Promise<Subscription> {
    // TODO: Implementar validação real com Google quando tiver conta de desenvolvedor
    // Por enquanto, validação mock
    console.log('Validating Android purchase (mock):', dto.purchase_token.substring(0, 50));

    // Determinar plano baseado no product_id
    let plano = SubscriptionTier.BASIC;
    if (dto.product_id.includes('premium')) {
      plano = SubscriptionTier.PREMIUM;
    }

    return this.create(usuarioId, {
      plano,
      receipt_android: dto.purchase_token,
      transaction_id: dto.transaction_id,
      plataforma: 'android',
    });
  }

  async getStatus(usuarioId: string): Promise<{ active: boolean; tier: SubscriptionTier; expiresAt: Date | null }> {
    const user = await this.userRepository.findOne({ where: { id: usuarioId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const now = new Date();
    const isActive =
      user.subscription_tier !== SubscriptionTier.NONE &&
      (!user.subscription_expires_at || user.subscription_expires_at > now);

    return {
      active: isActive,
      tier: user.subscription_tier,
      expiresAt: user.subscription_expires_at,
    };
  }

  async restorePurchases(usuarioId: string, plataforma: 'ios' | 'android'): Promise<Subscription[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: {
        usuario_id: usuarioId,
        plataforma,
        status: SubscriptionStatus.ATIVA,
      },
      order: { created_at: 'DESC' },
    });

    return subscriptions;
  }

  private async cancelActiveSubscriptions(usuarioId: string): Promise<void> {
    await this.subscriptionRepository.update(
      {
        usuario_id: usuarioId,
        status: SubscriptionStatus.ATIVA,
      },
      {
        status: SubscriptionStatus.CANCELADA,
      },
    );
  }

  async checkAndUpdateExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ATIVA,
      },
    });

    for (const subscription of expiredSubscriptions) {
      if (subscription.data_fim && subscription.data_fim < now) {
        await this.subscriptionRepository.update(subscription.id, {
          status: SubscriptionStatus.EXPIRADA,
        });

        // Atualizar usuário
        await this.userRepository.update(subscription.usuario_id, {
          subscription_tier: SubscriptionTier.NONE,
          subscription_expires_at: null,
        });
      }
    }
  }
}

