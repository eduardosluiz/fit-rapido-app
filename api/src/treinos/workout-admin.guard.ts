import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class WorkoutAdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const id = context.switchToHttp().getRequest().user?.sub;
    const user = id ? await this.auth.findById(id) : null;
    if (user && ['admin', 'personal_trainer'].includes(user.role)) return true;
    throw new ForbiddenException('Apenas administradores podem alterar o conteúdo.');
  }
}
