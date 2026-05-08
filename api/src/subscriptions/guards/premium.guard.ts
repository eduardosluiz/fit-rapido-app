import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionTier } from '../../auth/entities/user.entity';

@Injectable()
export class PremiumGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const hasPremiumAccess =
      user.subscription_tier === SubscriptionTier.PREMIUM ||
      user.subscription_tier === SubscriptionTier.BASIC;

    if (!hasPremiumAccess) {
      throw new ForbiddenException('Acesso premium necessário. Faça upgrade da sua assinatura.');
    }

    return true;
  }
}

