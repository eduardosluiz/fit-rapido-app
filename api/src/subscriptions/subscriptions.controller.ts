import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionPeriodService } from './subscription-period.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionPeriod } from './entities/subscription-period.entity';
import { SubscriptionTier } from '../auth/entities/user.entity';
import {
  ValidateIosReceiptDto,
  ValidateAndroidPurchaseDto,
  RestorePurchasesDto,
} from './dto/subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly periodService: SubscriptionPeriodService,
  ) {}

  @Post('validate-ios')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateIos(@Request() req, @Body() dto: ValidateIosReceiptDto) {
    return this.subscriptionsService.validateIosReceipt(req.user.id, dto);
  }

  @Post('validate-android')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateAndroid(@Request() req, @Body() dto: ValidateAndroidPurchaseDto) {
    return this.subscriptionsService.validateAndroidPurchase(req.user.id, dto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Request() req) {
    return this.subscriptionsService.getStatus(req.user.id);
  }

  @Post('restore')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async restore(@Request() req, @Body() dto: RestorePurchasesDto) {
    return this.subscriptionsService.restorePurchases(req.user.id, dto.plataforma);
  }

  @Get('plans')
  async getPlans() {
    const periods = [
      SubscriptionPeriod.MONTHLY,
      SubscriptionPeriod.QUARTERLY,
      SubscriptionPeriod.ANNUAL,
    ];

    const specificPrices = {
      [SubscriptionTier.PREMIUM]: {
        [SubscriptionPeriod.MONTHLY]: 29.90,
        [SubscriptionPeriod.QUARTERLY]: 79.90,
        [SubscriptionPeriod.ANNUAL]: 249.90,
      },
      [SubscriptionTier.PREMIUM_FIT]: {
        [SubscriptionPeriod.MONTHLY]: 79.90,
        [SubscriptionPeriod.QUARTERLY]: 229.90, // Ajustado de 239.90 para 229.90 para garantir desconto real (79.9*3 = 239.7)
        [SubscriptionPeriod.ANNUAL]: 489.90,
      },
    };

    const plans = [];
    const tiers = [SubscriptionTier.PREMIUM, SubscriptionTier.PREMIUM_FIT];

    for (const tier of tiers) {
      const planPeriods = [];
      const tierPrices = specificPrices[tier];

      if (!tierPrices) continue;

      for (const period of periods) {
        const totalPrice = tierPrices[period];
        if (totalPrice === undefined) continue;

        const months = this.periodService.getPeriodInMonths(period);
        const monthlyPrice = totalPrice / months;
        
        // Calcular desconto baseado no preço mensal base (mensal do tier)
        const baseMonthlyPrice = tierPrices[SubscriptionPeriod.MONTHLY];
        const originalTotalPrice = baseMonthlyPrice * months;
        const discount = Math.round(((originalTotalPrice - totalPrice) / originalTotalPrice) * 100);

        planPeriods.push({
          periodo: period,
          periodoDisplay: this.periodService.getPeriodDisplayName(period),
          precoTotal: Number(totalPrice.toFixed(2)),
          precoMensal: Number(monthlyPrice.toFixed(2)),
          descontoPercentual: discount > 0 ? discount : 0,
          meses: months,
        });
      }

      plans.push({
        tier: tier,
        nome: tier === SubscriptionTier.PREMIUM ? 'Premium' : 'Premium Fit',
        descricao:
          tier === SubscriptionTier.PREMIUM
            ? 'Acesso completo a todas as receitas'
            : 'Acesso completo a todas as receitas + todos os treinos',
        beneficios:
          tier === SubscriptionTier.PREMIUM
            ? ['Todas as receitas', 'Novas receitas mensais', 'Sem anúncios']
            : [
                'Todas as receitas',
                'Todos os treinos',
                'Novas receitas mensais',
                'Novos treinos mensais',
                'Sem anúncios',
              ],
        periodos: planPeriods,
      });
    }

    return { plans };
  }
}

