import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPeriod } from './entities/subscription-period.entity';
import { SubscriptionDiscount } from './entities/subscription-discount.entity';

@Injectable()
export class SubscriptionPeriodService {
  constructor(
    @InjectRepository(SubscriptionDiscount)
    private discountRepository: Repository<SubscriptionDiscount>,
  ) {}

  /**
   * Calcula o preço com desconto baseado no período
   */
  async calculatePrice(basePrice: number, period: SubscriptionPeriod): Promise<number> {
    if (period === SubscriptionPeriod.MONTHLY) {
      return basePrice; // Sem desconto para mensal
    }

    const discount = await this.getDiscount(period);
    if (!discount || discount <= 0) {
      return basePrice;
    }

    const months = this.getPeriodInMonths(period);
    const totalPrice = basePrice * months;
    const discountAmount = (totalPrice * discount) / 100;
    return totalPrice - discountAmount;
  }

  /**
   * Retorna o desconto percentual do banco de dados
   */
  async getDiscount(period: SubscriptionPeriod): Promise<number> {
    if (period === SubscriptionPeriod.MONTHLY) {
      return 0; // Mensal não tem desconto
    }

    const discount = await this.discountRepository.findOne({
      where: { periodo: period, ativo: true },
    });

    return discount ? Number(discount.desconto_percentual) : 0;
  }

  /**
   * Retorna o número de meses do período
   */
  getPeriodInMonths(period: SubscriptionPeriod): number {
    switch (period) {
      case SubscriptionPeriod.MONTHLY:
        return 1;
      case SubscriptionPeriod.QUARTERLY:
        return 3;
      case SubscriptionPeriod.SEMESTRAL:
        return 6;
      case SubscriptionPeriod.ANNUAL:
        return 12;
      default:
        return 1;
    }
  }

  /**
   * Retorna o nome de exibição do período
   */
  getPeriodDisplayName(period: SubscriptionPeriod): string {
    switch (period) {
      case SubscriptionPeriod.MONTHLY:
        return 'Mensal';
      case SubscriptionPeriod.QUARTERLY:
        return 'Trimestral';
      case SubscriptionPeriod.SEMESTRAL:
        return 'Semestral';
      case SubscriptionPeriod.ANNUAL:
        return 'Anual';
      default:
        return 'Mensal';
    }
  }

  /**
   * Retorna todos os descontos configurados
   */
  async getAllDiscounts(): Promise<SubscriptionDiscount[]> {
    return this.discountRepository.find({
      where: { ativo: true },
      order: { periodo: 'ASC' },
    });
  }

  /**
   * Retorna o preço mensal equivalente após desconto
   */
  async getMonthlyEquivalentPrice(basePrice: number, period: SubscriptionPeriod): Promise<number> {
    const totalPrice = await this.calculatePrice(basePrice, period);
    const months = this.getPeriodInMonths(period);
    return totalPrice / months;
  }
}

