import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
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
import { getRevenueCatTier } from './revenuecat.helper';

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

  async processRevenueCatWebhook(event: any): Promise<void> {
    try {
      console.log('Recebido Webhook do RevenueCat:', event.type, event.app_user_id);
      
      if (event.type === 'TEST') return;
      const usuarioId = event.app_user_id;
      if (!usuarioId) return;

      const user = await this.userRepository.findOne({ where: { id: usuarioId } });
      if (!user) return;

      const tier = getRevenueCatTier(event);
      if (!tier) {
        console.warn('Webhook do RevenueCat ignorado: produto ou entitlement desconhecido');
        return;
      }

      const activeEventTypes = new Set([
        'INITIAL_PURCHASE',
        'RENEWAL',
        'UNCANCELLATION',
        'NON_RENEWING_PURCHASE',
        'SUBSCRIPTION_EXTENDED',
        'REFUND_REVERSED',
      ]);
      const inactiveEventTypes = new Set(['EXPIRATION', 'REFUND']);

      // A Apple pode entregar notificações antigas após uma renovação/upgrade.
      const storedExpiry = user.subscription_expires_at ? new Date(user.subscription_expires_at).getTime() : 0;
      const eventExpiry = Number(event.expiration_at_ms || 0);
      if (eventExpiry && storedExpiry > eventExpiry) return;

      if (activeEventTypes.has(event.type)) {
        const dataFim = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null;

        await this.userRepository.update(usuarioId, {
          subscription_tier: tier,
          subscription_expires_at: dataFim,
        });
      } else if (inactiveEventTypes.has(event.type)) {
        if (user.subscription_tier && user.subscription_tier !== tier) return;
        await this.userRepository.update(usuarioId, {
          subscription_tier: SubscriptionTier.NONE,
          subscription_expires_at: null,
        });
      }
    } catch (e) {
      console.error('Erro ao processar webhook do RevenueCat', e);
      throw new ServiceUnavailableException('Não foi possível processar a assinatura');
    }
  }

  async validateIosReceipt(usuarioId: string, dto: ValidateIosReceiptDto): Promise<Subscription> {
    throw new ServiceUnavailableException('Validação de compras é processada pelo RevenueCat');
  }

  async validateAndroidPurchase(usuarioId: string, dto: ValidateAndroidPurchaseDto): Promise<Subscription> {
    throw new ServiceUnavailableException('Validação de compras é processada pelo RevenueCat');
  }

  async getStatus(usuarioId: string): Promise<{ active: boolean; tier: SubscriptionTier; expiresAt: Date | null }> {
    const user = await this.userRepository.findOne({ where: { id: usuarioId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const now = new Date();
    const isActive =
      [SubscriptionTier.PREMIUM, SubscriptionTier.PREMIUM_FIT].includes(user.subscription_tier) &&
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

