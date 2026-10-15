import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { canAccessTreino } from '../common/helpers/subscription.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treino } from './entities/treino.entity';
import { isFreeWorkout } from './workout-free.helper';

@Injectable()
export class WorkoutAccessGuard implements CanActivate {
  constructor(private readonly auth: AuthService, @InjectRepository(Treino) private readonly treinos: Repository<Treino>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const id = context.switchToHttp().getRequest().user?.sub;
    const user = id ? await this.auth.findById(id) : null;
    if (user && (['admin', 'personal_trainer'].includes(user.role) || canAccessTreino(user))) return true;
    const request = context.switchToHttp().getRequest();
    if (user && request.params?.id) {
      if (context.getClass().name === 'TreinosController') {
        const treino = await this.treinos.findOne({ where: { id: request.params.id }, relations: ['modalidade'] });
        if (treino && isFreeWorkout(treino)) return true;
      } else if (context.getClass().name === 'ExerciciosBibliotecaController') {
        // Biblioteca: só libera substitutos vinculados a uma sessão gratuita ativa.
        const parents = await this.treinos.find({ where: [
          { substituto_id_1: request.params.id, ativa: true },
          { substituto_id_2: request.params.id, ativa: true },
        ], relations: ['modalidade'] });
        if (parents.some(isFreeWorkout)) return true;
      }
    }
    throw new ForbiddenException('Este conteúdo requer uma assinatura DAI + Completo ativa.');
  }
}
