import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { canAccessTreino } from '../common/helpers/subscription.helper';

@Injectable()
export class WorkoutAccessGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const id = context.switchToHttp().getRequest().user?.sub;
    const user = id ? await this.auth.findById(id) : null;
    if (user && (['admin', 'personal_trainer'].includes(user.role) || canAccessTreino(user))) return true;
    throw new ForbiddenException('Este conteúdo requer uma assinatura DAI + Completo ativa.');
  }
}
